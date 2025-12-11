import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1?target=deno"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Simplified admin verification - uses JWT claims only
 */
async function verifyAdmin(authHeader: string | null, supabaseUrl: string, serviceKey: string) {
    if (!authHeader) {
        console.error('[AdminReports] No authorization header');
        throw new Error('No authorization header');
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
        console.error('[AdminReports] Auth failed:', authError?.message);
        throw new Error('Authentication failed');
    }

    console.log('[AdminReports] Authenticated:', user.email);

    const isAdmin = user.user_metadata?.is_admin === true ||
        user.app_metadata?.is_admin === true;

    if (!isAdmin) {
        console.error('[AdminReports] Not admin. app_metadata:', user.app_metadata);
        throw new Error('Forbidden: Admin access required');
    }

    return { user, supabase };
}

/**
 * Extract path parts after function name
 */
function extractPathParts(url: URL): string[] {
    const fullPath = url.pathname;
    const functionPath = fullPath.replace(/^\/functions\/v1\/admin-reports\/?/, '');
    return functionPath.split('/').filter(Boolean);
}

/**
 * Get user email by ID (with error handling)
 */
async function getUserEmail(supabase: any, userId: string): Promise<string> {
    try {
        const { data, error } = await supabase.auth.admin.getUserById(userId);
        if (error || !data?.user) return 'Desconhecido';
        return data.user.email || 'Desconhecido';
    } catch {
        return 'Desconhecido';
    }
}

serve(async (req) => {
    console.log('[AdminReports] Request:', req.method, req.url);

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const authHeader = req.headers.get('Authorization');

        const { supabase } = await verifyAdmin(authHeader, supabaseUrl, serviceKey);

        const url = new URL(req.url);
        const pathParts = extractPathParts(url);

        console.log('[AdminReports] Path parts:', pathParts, 'Method:', req.method);

        // ========================================
        // GET /admin-reports - List all reports
        // ========================================
        if (req.method === 'GET' && pathParts.length === 0) {
            const page = parseInt(url.searchParams.get('page') || '1');
            const limit = parseInt(url.searchParams.get('limit') || '50');
            const status = url.searchParams.get('status') || '';
            const impacto = url.searchParams.get('impacto') || '';

            const offset = (page - 1) * limit;

            console.log('[AdminReports] Listing reports - page:', page, 'limit:', limit, 'status:', status, 'impacto:', impacto);

            // Build query
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

            console.log('[AdminReports] Raw reports count:', data?.length || 0, 'Total:', count);

            // Enrich with user emails
            const enrichedReports = await Promise.all(
                (data || []).map(async (report: any) => {
                    const userEmail = await getUserEmail(supabase, report.user_id);
                    return {
                        ...report,
                        user_email: userEmail,
                    };
                })
            );

            console.log('[AdminReports] Returning', enrichedReports.length, 'reports');

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

        // ========================================
        // GET /admin-reports/stats - Get statistics
        // ========================================
        if (req.method === 'GET' && pathParts.length === 1 && pathParts[0] === 'stats') {
            console.log('[AdminReports] Getting statistics');

            const { data, error, count } = await supabase
                .from('user_reports')
                .select('status, impacto', { count: 'exact' });

            if (error) {
                throw new Error('Failed to fetch stats: ' + error.message);
            }

            const statusCounts: Record<string, number> = {};
            const impactoCounts: Record<string, number> = {};

            (data || []).forEach((report: any) => {
                statusCounts[report.status] = (statusCounts[report.status] || 0) + 1;
                impactoCounts[report.impacto] = (impactoCounts[report.impacto] || 0) + 1;
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

        // ========================================
        // GET /admin-reports/:id - Get single report
        // ========================================
        if (req.method === 'GET' && pathParts.length === 1) {
            const reportId = pathParts[0];
            console.log('[AdminReports] Getting report:', reportId);

            const { data, error } = await supabase
                .from('user_reports')
                .select('*')
                .eq('id', reportId)
                .single();

            if (error) {
                console.error('[AdminReports] Query error:', error);
                throw new Error('Report not found');
            }

            const userEmail = await getUserEmail(supabase, data.user_id);

            return new Response(
                JSON.stringify({
                    report: {
                        ...data,
                        user_email: userEmail,
                    }
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // ========================================
        // PATCH /admin-reports/:id - Update report status
        // ========================================
        if (req.method === 'PATCH' && pathParts.length === 1) {
            const reportId = pathParts[0];
            const body = await req.json();
            const { status } = body;

            console.log('[AdminReports] Updating report:', reportId, 'to status:', status);

            if (!status) {
                throw new Error('Status is required');
            }

            const validStatuses = ['pendente', 'em_analise', 'resolvido', 'fechado'];
            if (!validStatuses.includes(status)) {
                throw new Error('Invalid status. Valid options: ' + validStatuses.join(', '));
            }

            const { data, error } = await supabase
                .from('user_reports')
                .update({ status })
                .eq('id', reportId)
                .select()
                .single();

            if (error) {
                console.error('[AdminReports] Update error:', error);
                throw new Error('Failed to update report: ' + error.message);
            }

            console.log('[AdminReports] Updated report:', data.id);

            return new Response(
                JSON.stringify({
                    success: true,
                    report: data,
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // No matching route
        console.error('[AdminReports] No route matched:', req.method, pathParts);
        throw new Error('Not found');

    } catch (error: unknown) {
        const err = error as Error;
        console.error('[AdminReports] Error:', err.message);

        const status = err.message.includes('Forbidden') ? 403 :
            err.message.includes('Authentication') ? 401 :
                err.message.includes('not found') ? 404 :
                    err.message.includes('Invalid') ? 400 : 500;

        return new Response(
            JSON.stringify({ error: err.message }),
            {
                status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
});
