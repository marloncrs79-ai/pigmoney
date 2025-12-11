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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
        console.error('[AdminReports] Auth check failed:', authError);
        throw new Error('Authentication failed');
    }

    console.log('[AdminReports] Authenticated user:', user.id, user.email);

    // Check if user is admin from JWT claims
    const isAdmin = user.user_metadata?.is_admin === true ||
        user.app_metadata?.is_admin === true;

    console.log('[AdminReports] Is admin:', isAdmin);

    if (!isAdmin) {
        throw new Error('Forbidden: Admin access required');
    }

    return { user, supabase };
}

// Log admin action
async function logAction(
    supabase: any,
    adminUserId: string,
    action: string,
    targetUserId?: string,
    metadata?: any
) {
    try {
        await supabase.rpc('log_admin_action', {
            p_admin_user_id: adminUserId,
            p_action: action,
            p_target_user_id: targetUserId || null,
            p_metadata: metadata || {},
        });
    } catch (error) {
        console.error('Failed to log admin action:', error);
    }
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const authHeader = req.headers.get('Authorization');

        const { user: adminUser, supabase } = await verifyAdmin(authHeader, supabaseUrl, serviceKey);

        const url = new URL(req.url);
        // URL format: /functions/v1/admin-reports or /functions/v1/admin-reports/:id
        const fullPath = url.pathname;
        const functionPath = fullPath.replace(/^\/functions\/v1\/admin-reports\/?/, '');
        const pathParts = functionPath.split('/').filter(Boolean);

        console.log('[AdminReports] Path:', fullPath, 'Extracted parts:', pathParts);

        // GET /admin-reports - List all reports with filters
        if (req.method === 'GET' && pathParts.length === 0) {
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

            if (error) throw error;

            // Enrich with user emails
            const enrichedReports = await Promise.all(
                (data || []).map(async (report: any) => {
                    let userEmail = 'Desconhecido';

                    if (report.user_id) {
                        try {
                            const { data: userData } = await supabase.auth.admin.getUserById(report.user_id);
                            userEmail = userData?.user?.email || 'Desconhecido';
                        } catch {
                            // Ignore errors
                        }
                    }

                    return {
                        ...report,
                        user_email: userEmail,
                    };
                })
            );

            await logAction(supabase, adminUser.id, 'list_reports', undefined, {
                filters: { status, impacto },
                page,
                limit,
            });

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

        // PATCH /admin-reports/:id - Update report status
        if (req.method === 'PATCH' && pathParts.length === 1) {
            const reportId = pathParts[0];
            const { status } = await req.json();

            if (!status || !['Novo', 'Em análise', 'Resolvido'].includes(status)) {
                throw new Error('Invalid status. Must be: Novo, Em análise, or Resolvido');
            }

            const { data, error } = await supabase
                .from('user_reports')
                .update({ status })
                .eq('id', reportId)
                .select()
                .single();

            if (error) throw error;

            await logAction(supabase, adminUser.id, 'update_report_status', data.user_id, {
                report_id: reportId,
                new_status: status,
            });

            return new Response(
                JSON.stringify({ success: true, report: data }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // GET /admin-reports/stats - Get report statistics
        if (req.method === 'GET' && pathParts.length === 1 && pathParts[0] === 'stats') {
            const { data, error } = await supabase
                .from('user_reports')
                .select('status, impacto');

            if (error) throw error;

            const stats = {
                total: data?.length || 0,
                by_status: {
                    'Novo': data?.filter((r: any) => r.status === 'Novo').length || 0,
                    'Em análise': data?.filter((r: any) => r.status === 'Em análise').length || 0,
                    'Resolvido': data?.filter((r: any) => r.status === 'Resolvido').length || 0,
                },
                by_impacto: {
                    'Crítico': data?.filter((r: any) => r.impacto === 'Crítico').length || 0,
                    'Alto': data?.filter((r: any) => r.impacto === 'Alto').length || 0,
                    'Médio': data?.filter((r: any) => r.impacto === 'Médio').length || 0,
                    'Baixo': data?.filter((r: any) => r.impacto === 'Baixo').length || 0,
                },
                critical_pending: data?.filter((r: any) =>
                    r.impacto === 'Crítico' && r.status !== 'Resolvido'
                ).length || 0,
            };

            return new Response(
                JSON.stringify(stats),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        throw new Error('Not found');

    } catch (error) {
        console.error('Admin Reports Error:', error);

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
