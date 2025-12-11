import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Simplified admin verification - uses JWT claims only
 * No getUserById call to avoid UUID parsing errors
 */
async function verifyAdmin(authHeader: string | null, supabaseUrl: string, serviceKey: string) {
  if (!authHeader) {
    console.error('[AdminUsers] No authorization header');
    throw new Error('No authorization header');
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const token = authHeader.replace('Bearer ', '');

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    console.error('[AdminUsers] Auth failed:', authError?.message);
    throw new Error('Authentication failed');
  }

  console.log('[AdminUsers] Authenticated:', user.email);

  // Check admin flag in both user_metadata and app_metadata
  const isAdmin = user.user_metadata?.is_admin === true ||
    user.app_metadata?.is_admin === true;

  if (!isAdmin) {
    console.error('[AdminUsers] Not admin. app_metadata:', user.app_metadata);
    throw new Error('Forbidden: Admin access required');
  }

  return { user, supabase };
}

/**
 * Extract path parts after function name
 * URL: /functions/v1/admin-users/123 -> ['123']
 */
function extractPathParts(url: URL): string[] {
  const fullPath = url.pathname;
  const functionPath = fullPath.replace(/^\/functions\/v1\/admin-users\/?/, '');
  return functionPath.split('/').filter(Boolean);
}

serve(async (req) => {
  console.log('[AdminUsers] Request:', req.method, req.url);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization');

    // Verify admin access
    const { supabase } = await verifyAdmin(authHeader, supabaseUrl, serviceKey);

    const url = new URL(req.url);
    const pathParts = extractPathParts(url);

    console.log('[AdminUsers] Path parts:', pathParts, 'Method:', req.method);

    // ========================================
    // GET /admin-users - List all users
    // ========================================
    if (req.method === 'GET' && pathParts.length === 0) {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const search = url.searchParams.get('search') || '';

      console.log('[AdminUsers] Listing users - page:', page, 'limit:', limit, 'search:', search);

      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage: limit,
      });

      if (error) {
        console.error('[AdminUsers] listUsers error:', error);
        throw new Error('Failed to list users: ' + error.message);
      }

      let users = data.users || [];
      console.log('[AdminUsers] Raw users count:', users.length);

      // Apply search filter
      if (search) {
        users = users.filter((u: any) =>
          u.email?.toLowerCase().includes(search.toLowerCase())
        );
        console.log('[AdminUsers] After search filter:', users.length);
      }

      // Map to response format
      const mappedUsers = users.map((u: any) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        email_confirmed_at: u.email_confirmed_at,
        provider: u.app_metadata?.provider || 'email',
        is_admin: u.user_metadata?.is_admin || u.app_metadata?.is_admin || false,
      }));

      console.log('[AdminUsers] Returning', mappedUsers.length, 'users');

      return new Response(
        JSON.stringify({
          users: mappedUsers,
          total: users.length,
          page,
          limit,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================
    // GET /admin-users/:id - Get user details
    // ========================================
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
        console.error('[AdminUsers] getUserById error:', error);
        throw new Error('User not found: ' + error.message);
      }

      const user = data.user;
      console.log('[AdminUsers] Found user:', user.email);

      return new Response(
        JSON.stringify({
          user: {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            updated_at: user.updated_at,
            last_sign_in_at: user.last_sign_in_at,
            email_confirmed_at: user.email_confirmed_at,
            phone: user.phone,
            phone_confirmed_at: user.phone_confirmed_at,
            user_metadata: user.user_metadata || {},
            app_metadata: user.app_metadata || {},
            identities: user.identities || [],
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================
    // POST /admin-users/:id/action - Admin actions
    // ========================================
    if (req.method === 'POST' && pathParts.length === 2 && pathParts[1] === 'action') {
      const userId = pathParts[0];
      const body = await req.json();
      const { action, params } = body;

      console.log('[AdminUsers] Action:', action, 'on user:', userId);

      // Validate UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        throw new Error('Invalid user ID format');
      }

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
          await supabase.auth.admin.updateUserById(userId, { ban_duration: '876000h' }); // ~100 years
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
          const { data: userData, error: getUserError } = await supabase.auth.admin.getUserById(userId);
          if (getUserError) throw getUserError;

          const currentAppMetadata = userData.user.app_metadata || {};
          await supabase.auth.admin.updateUserById(userId, {
            app_metadata: { ...currentAppMetadata, is_admin: true }
          });
          return new Response(
            JSON.stringify({ success: true, message: 'User is now admin' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        case 'remove_admin': {
          const { data: userData2, error: getUserError2 } = await supabase.auth.admin.getUserById(userId);
          if (getUserError2) throw getUserError2;

          const currentAppMetadata2 = userData2.user.app_metadata || {};
          await supabase.auth.admin.updateUserById(userId, {
            app_metadata: { ...currentAppMetadata2, is_admin: false }
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

    // No matching route
    console.error('[AdminUsers] No route matched:', req.method, pathParts);
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
