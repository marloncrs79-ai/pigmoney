import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1?target=deno"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Admin verification middleware
async function verifyAdmin(authHeader: string | null, supabaseUrl: string, serviceKey: string) {
    if (!authHeader) {
        throw new Error('No authorization header');
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: jwtUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !jwtUser) {
        throw new Error('Authentication failed');
    }

    let dbUser;
    try {
        const { data, error: dbError } = await supabase.auth.admin.getUserById(jwtUser.id);
        if (dbError) throw dbError;
        dbUser = data.user;
    } catch (err) {
        console.warn('getUserById failed, falling back to JWT:', err);
        dbUser = jwtUser;
    }

    if (!dbUser) {
        throw new Error('User not found');
    }

    const isAdmin = dbUser.user_metadata?.is_admin === true ||
        dbUser.app_metadata?.is_admin === true;

    if (!isAdmin) {
        throw new Error('Forbidden: Admin access required');
    }

    return { user: dbUser, supabase };
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const authHeader = req.headers.get('Authorization');

        const { supabase } = await verifyAdmin(authHeader, supabaseUrl, serviceKey);

        if (req.method === 'GET') {
            const url = new URL(req.url);
            const page = parseInt(url.searchParams.get('page') || '1');
            const limit = parseInt(url.searchParams.get('limit') || '50');
            const reason = url.searchParams.get('reason') || '';

            const offset = (page - 1) * limit;

            let query = supabase
                .from('cancellation_feedback')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (reason) {
                query = query.eq('reason', reason);
            }

            const { data, error, count } = await query;

            if (error) throw error;

            // Enrich with user emails
            const enrichedCancellations = await Promise.all(
                (data || []).map(async (cancellation: any) => {
                    let userEmail = 'Desconhecido';

                    if (cancellation.user_id) {
                        try {
                            const { data: userData } = await supabase.auth.admin.getUserById(cancellation.user_id);
                            userEmail = userData?.user?.email || 'Desconhecido';
                        } catch {
                            // Ignore errors
                        }
                    }

                    return {
                        ...cancellation,
                        user_email: userEmail,
                    };
                })
            );

            // Get reason statistics
            const allReasons = (data || []).map((c: any) => c.reason);
            const reasonCounts: Record<string, number> = {};
            allReasons.forEach((r: string) => {
                reasonCounts[r] = (reasonCounts[r] || 0) + 1;
            });

            return new Response(
                JSON.stringify({
                    cancellations: enrichedCancellations,
                    total: count || 0,
                    page,
                    limit,
                    reason_stats: reasonCounts,
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        throw new Error('Method not allowed');

    } catch (error) {
        console.error('Admin Cancellations Error:', error);

        const status = error.message.includes('Forbidden') ? 403 :
            error.message.includes('Authentication') ? 401 : 400;

        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
})
