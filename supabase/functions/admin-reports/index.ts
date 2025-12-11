import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1?target=deno"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    console.log('[AdminReports] ===== REQUEST =====');
    console.log('[AdminReports] Method:', req.method);
    console.log('[AdminReports] URL:', req.url);

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const authHeader = req.headers.get('Authorization');

        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const supabase = createClient(supabaseUrl, serviceKey);
        const token = authHeader.replace('Bearer ', '');

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.error('[AdminReports] Auth failed:', authError?.message);
            throw new Error('Authentication failed');
        }

        console.log('[AdminReports] User:', user.email);

        const isAdmin = user.user_metadata?.is_admin === true ||
            user.app_metadata?.is_admin === true;

        if (!isAdmin) {
            console.error('[AdminReports] Not admin');
            throw new Error('Forbidden: Admin access required');
        }

        // Parse URL
        const url = new URL(req.url);
        console.log('[AdminReports] Pathname:', url.pathname);

        // Simple path parsing
        const pathname = url.pathname;
        let path = pathname.replace(/^\//, '').replace(/^admin-reports\/?/, '');
        path = path.replace(/^functions\/v1\/admin-reports\/?/, '');

        console.log('[AdminReports] Extracted path:', path);

        const pathParts = path.split('/').filter(Boolean);
        console.log('[AdminReports] Path parts:', pathParts);

        // GET - List all reports (no path parts)
        if (req.method === 'GET' && pathParts.length === 0) {
            console.log('[AdminReports] Listing reports...');

            const page = parseInt(url.searchParams.get('page') || '1');
            const limit = parseInt(url.searchParams.get('limit') || '50');
            const status = url.searchParams.get('status') || '';
            const impacto = url.searchParams.get('impacto') || '';

            const offset = (page - 1) * limit;

            let query = supabase
                .from('user_reports')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (status) {
                query = query.eq('status', status);
            }
            if (impacto) {
                query = query.eq('impacto', impacto);
            }

            const { data, error, count } = await query;

            if (error) {
                console.error('[AdminReports] Query error:', error);
                throw new Error('Failed to fetch reports: ' + error.message);
            }

            console.log('[AdminReports] Found', data?.length || 0, 'reports');

            // Enrich with user emails
            const enrichedReports = await Promise.all(
                (data || []).map(async (report: any) => {
                    let userEmail = 'Desconhecido';
                    try {
                        const { data: userData } = await supabase.auth.admin.getUserById(report.user_id);
                        userEmail = userData?.user?.email || 'Desconhecido';
                    } catch { /* ignore */ }
                    return { ...report, user_email: userEmail };
                })
            );

            return new Response(
                JSON.stringify({
                    reports: enrichedReports,
                    total: count || 0,
                    page,
                    limit,
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // GET - Stats (path = 'stats')
        if (req.method === 'GET' && pathParts.length === 1 && pathParts[0] === 'stats') {
            console.log('[AdminReports] Getting stats...');

            const { data, count } = await supabase
                .from('user_reports')
                .select('status, impacto', { count: 'exact' });

            const statusCounts: Record<string, number> = {};
            const impactoCounts: Record<string, number> = {};

            (data || []).forEach((r: any) => {
                statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
                impactoCounts[r.impacto] = (impactoCounts[r.impacto] || 0) + 1;
            });

            return new Response(
                JSON.stringify({
                    total: count || 0,
                    by_status: statusCounts,
                    by_impacto: impactoCounts,
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // GET - Single report (path = UUID)
        if (req.method === 'GET' && pathParts.length === 1) {
            const reportId = pathParts[0];
            console.log('[AdminReports] Getting report:', reportId);

            const { data, error } = await supabase
                .from('user_reports')
                .select('*')
                .eq('id', reportId)
                .single();

            if (error) {
                throw new Error('Report not found');
            }

            let userEmail = 'Desconhecido';
            try {
                const { data: userData } = await supabase.auth.admin.getUserById(data.user_id);
                userEmail = userData?.user?.email || 'Desconhecido';
            } catch { /* ignore */ }

            return new Response(
                JSON.stringify({
                    report: { ...data, user_email: userEmail }
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // PATCH - Update report status (path = UUID)
        if (req.method === 'PATCH' && pathParts.length === 1) {
            const reportId = pathParts[0];
            const body = await req.json();
            const { status } = body;

            console.log('[AdminReports] Updating report:', reportId, 'to status:', status);

            if (!status) {
                throw new Error('Status is required');
            }

            // Match database CHECK constraint values
            const validStatuses = ['Novo', 'Em análise', 'Resolvido'];
            if (!validStatuses.includes(status)) {
                throw new Error('Invalid status. Valid: ' + validStatuses.join(', '));
            }

            const { data, error } = await supabase
                .from('user_reports')
                .update({ status })
                .eq('id', reportId)
                .select()
                .single();

            if (error) {
                throw new Error('Failed to update: ' + error.message);
            }

            return new Response(
                JSON.stringify({ success: true, report: data }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.error('[AdminReports] No route matched');
        throw new Error('Not found');

    } catch (error: unknown) {
        const err = error as Error;
        console.error('[AdminReports] Error:', err.message);

        const status = err.message.includes('Forbidden') ? 403 :
            err.message.includes('Authentication') ? 401 :
                err.message.includes('not found') ? 404 : 500;

        return new Response(
            JSON.stringify({ error: err.message }),
            {
                status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
});
