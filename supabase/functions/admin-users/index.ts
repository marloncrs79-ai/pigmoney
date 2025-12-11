import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('===== ADMIN-USERS v2 CALLED =====');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization');

    console.log('[v2] Has auth header:', !!authHeader);
    console.log('[v2] Has service key:', !!serviceKey);

    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create client with service role
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify the token
    const token = authHeader.replace('Bearer ', '');
    console.log('[v2] Token length:', token.length);

    const { data: userData, error: authError } = await supabase.auth.getUser(token);

    if (authError) {
      console.error('[v2] Auth error:', authError);
      throw new Error('Authentication failed: ' + authError.message);
    }

    const user = userData.user;
    if (!user) {
      throw new Error('No user in response');
    }

    console.log('[v2] User ID:', user.id);
    console.log('[v2] User email:', user.email);
    console.log('[v2] User app_metadata:', JSON.stringify(user.app_metadata));
    console.log('[v2] User user_metadata:', JSON.stringify(user.user_metadata));

    // Check admin
    const isAdmin = user.user_metadata?.is_admin === true ||
      user.app_metadata?.is_admin === true;

    console.log('[v2] Is admin:', isAdmin);

    if (!isAdmin) {
      throw new Error('Forbidden: Admin access required. app_metadata: ' + JSON.stringify(user.app_metadata));
    }

    // Parse URL
    const url = new URL(req.url);
    console.log('[v2] Full URL:', req.url);
    console.log('[v2] Pathname:', url.pathname);

    // Try to list users
    console.log('[v2] Calling listUsers...');
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 20,
    });

    if (listError) {
      console.error('[v2] listUsers error:', listError);
      throw new Error('listUsers failed: ' + listError.message);
    }

    console.log('[v2] Users count:', listData.users?.length || 0);

    const users = listData.users.map((u: any) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      email_confirmed_at: u.email_confirmed_at,
      provider: u.app_metadata?.provider || 'email',
      is_admin: u.user_metadata?.is_admin || u.app_metadata?.is_admin || false,
    }));

    console.log('[v2] Returning', users.length, 'users');

    return new Response(
      JSON.stringify({
        users,
        total: listData.users.length,
        page: 1,
        limit: 20,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[v2] ERROR:', error.message);
    console.error('[v2] Stack:', error.stack);

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
