import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('[AdminUsers] ===== REQUEST =====');
  console.log('[AdminUsers] Method:', req.method);
  console.log('[AdminUsers] URL:', req.url);

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
      console.error('[AdminUsers] Auth failed:', authError?.message);
      throw new Error('Authentication failed');
    }

    console.log('[AdminUsers] User:', user.email);

    const isAdmin = user.user_metadata?.is_admin === true ||
      user.app_metadata?.is_admin === true;

    if (!isAdmin) {
      console.error('[AdminUsers] Not admin');
      throw new Error('Forbidden: Admin access required');
    }

    // Parse URL
    const url = new URL(req.url);
    console.log('[AdminUsers] Pathname:', url.pathname);
    console.log('[AdminUsers] Search:', url.search);

    // Simple path parsing: just check if there's anything after the function name
    // Expected formats:
    // - /admin-users (list)
    // - /admin-users/ (list)
    // - /admin-users?page=1 (list)
    // - /admin-users/UUID (details)
    // - /admin-users/UUID/action (action)

    const pathname = url.pathname;
    // Remove leading slash and function prefix
    let path = pathname.replace(/^\//, '').replace(/^admin-users\/?/, '');
    // Also handle full path format
    path = path.replace(/^functions\/v1\/admin-users\/?/, '');

    console.log('[AdminUsers] Extracted path:', path);

    const pathParts = path.split('/').filter(Boolean);
    console.log('[AdminUsers] Path parts:', pathParts);

    // GET - List all users (no path parts)
    if (req.method === 'GET' && pathParts.length === 0) {
      console.log('[AdminUsers] Listing users...');

      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const search = url.searchParams.get('search') || '';

      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage: limit,
      });

      if (error) {
        console.error('[AdminUsers] listUsers error:', error);
        throw new Error('Failed to list users: ' + error.message);
      }

      let users = data.users || [];

      if (search) {
        users = users.filter((u: any) =>
          u.email?.toLowerCase().includes(search.toLowerCase())
        );
      }

      console.log('[AdminUsers] Returning', users.length, 'users');

      return new Response(
        JSON.stringify({
          users: users.map((u: any) => ({
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at,
            email_confirmed_at: u.email_confirmed_at,
            provider: u.app_metadata?.provider || 'email',
            is_admin: u.user_metadata?.is_admin || u.app_metadata?.is_admin || false,
          })),
          total: users.length,
          page,
          limit,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET - User details (1 path part = UUID)
    if (req.method === 'GET' && pathParts.length === 1) {
      const userId = pathParts[0];
      console.log('[AdminUsers] Getting user details:', userId);

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        throw new Error('Invalid user ID format');
      }

      const { data, error } = await supabase.auth.admin.getUserById(userId);

      if (error) {
        throw new Error('User not found: ' + error.message);
      }

      return new Response(
        JSON.stringify({
          user: {
            id: data.user.id,
            email: data.user.email,
            created_at: data.user.created_at,
            updated_at: data.user.updated_at,
            last_sign_in_at: data.user.last_sign_in_at,
            email_confirmed_at: data.user.email_confirmed_at,
            phone: data.user.phone,
            user_metadata: data.user.user_metadata || {},
            app_metadata: data.user.app_metadata || {},
            identities: data.user.identities || [],
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST - Admin action (2 path parts = UUID/action)
    if (req.method === 'POST' && pathParts.length === 2 && pathParts[1] === 'action') {
      const userId = pathParts[0];
      const body = await req.json();
      const { action, params } = body;

      console.log('[AdminUsers] Action:', action, 'on user:', userId);

      switch (action) {
        case 'reset_password': {
          if (!params?.email) throw new Error('Email required');
          await supabase.auth.resetPasswordForEmail(params.email);
          return new Response(
            JSON.stringify({ success: true, message: 'Password reset email sent' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        case 'verify_email': {
          await supabase.auth.admin.updateUserById(userId, { email_confirm: true });
          return new Response(
            JSON.stringify({ success: true, message: 'Email verified' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        case 'block_user': {
          await supabase.auth.admin.updateUserById(userId, { ban_duration: '876000h' });
          return new Response(
            JSON.stringify({ success: true, message: 'User blocked' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        case 'unblock_user': {
          await supabase.auth.admin.updateUserById(userId, { ban_duration: 'none' });
          return new Response(
            JSON.stringify({ success: true, message: 'User unblocked' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        case 'delete_user': {
          await supabase.auth.admin.deleteUser(userId);
          return new Response(
            JSON.stringify({ success: true, message: 'User deleted' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        case 'make_admin': {
          const { data: userData } = await supabase.auth.admin.getUserById(userId);
          if (!userData?.user) throw new Error('User not found');

          await supabase.auth.admin.updateUserById(userId, {
            app_metadata: { ...(userData.user.app_metadata || {}), is_admin: true }
          });
          return new Response(
            JSON.stringify({ success: true, message: 'User is now admin' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        case 'remove_admin': {
          const { data: userData2 } = await supabase.auth.admin.getUserById(userId);
          if (!userData2?.user) throw new Error('User not found');

          await supabase.auth.admin.updateUserById(userId, {
            app_metadata: { ...(userData2.user.app_metadata || {}), is_admin: false }
          });
          return new Response(
            JSON.stringify({ success: true, message: 'Admin privileges removed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        default:
          throw new Error('Unknown action: ' + action);
      }
    }

    console.error('[AdminUsers] No route matched');
    throw new Error('Not found');

  } catch (error: unknown) {
    const err = error as Error;
    console.error('[AdminUsers] Error:', err.message);

    const status = err.message.includes('Forbidden') ? 403 :
      err.message.includes('Authentication') ? 401 :
        err.message.includes('Not found') ? 404 :
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
