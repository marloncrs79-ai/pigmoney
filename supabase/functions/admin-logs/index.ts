import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Admin verification
async function verifyAdmin(authHeader: string | null, supabaseUrl: string, serviceKey: string) {
  if (!authHeader) throw new Error('No authorization header');

  const supabase = createClient(supabaseUrl, serviceKey);
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) throw new Error('Authentication failed');

  const isAdmin = user.user_metadata?.is_admin === true || user.app_metadata?.is_admin === true;
  if (!isAdmin) throw new Error('Forbidden: Admin access required');

  return { user, supabase };
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
      const action = url.searchParams.get('action') || '';

      const offset = (page - 1) * limit;

      // Build query
      let query = supabase
        .from('admin_logs')
        .select(`
          id,
          admin_user_id,
          action,
          target_user_id,
          metadata,
          ip_address,
          created_at
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (action) {
        query = query.eq('action', action);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Enrich with user emails
      const enrichedLogs = await Promise.all(
        (data || []).map(async (log: any) => {
          let adminEmail = 'System';
          let targetEmail = null;

          if (log.admin_user_id) {
            const { data: adminUser } = await supabase.auth.admin.getUserById(log.admin_user_id);
            adminEmail = adminUser?.user.email || 'Unknown';
          }

          if (log.target_user_id) {
            const { data: targetUser } = await supabase.auth.admin.getUserById(log.target_user_id);
            targetEmail = targetUser?.user.email || 'Unknown';
          }

          return {
            ...log,
            admin_email: adminEmail,
            target_email: targetEmail,
          };
        })
      );

      return new Response(
        JSON.stringify({
          logs: enrichedLogs,
          total: count || 0,
          page,
          limit,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Method not allowed');

  } catch (error) {
    console.error('Admin Logs Error:', error);

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
