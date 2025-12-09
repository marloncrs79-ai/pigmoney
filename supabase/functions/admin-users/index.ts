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

  // Create client with service role for admin operations
  const supabase = createClient(supabaseUrl, serviceKey);

  // Get user from auth header (verifies the token)
  const token = authHeader.replace('Bearer ', '');
  const { data: { user: jwtUser }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !jwtUser) {
    console.error('Auth check failed:', authError);
    throw new Error('Authentication failed');
  }

  console.log('JWT User ID:', jwtUser.id);

  // Fetch fresh user data from database to ensure metadata is up-to-date
  // We use try-catch to identify if this specific call is failing
  let dbUser;
  try {
    const { data, error: dbError } = await supabase.auth.admin.getUserById(jwtUser.id);
    if (dbError) throw dbError;
    dbUser = data.user;
  } catch (err) {
    console.error('getUserById failed for ID:', jwtUser.id, err);
    // Fallback to JWT user if DB fetch fails, but warn
    // This might happen if the ID format is somehow unexpected, though it shouldn't be for Supabase
    console.warn('Falling back to JWT user data due to fetch error');
    dbUser = jwtUser;
  }

  if (!dbUser) {
    throw new Error('User not found');
  }

  // Check if user is admin (check raw_user_meta_data)
  const isAdmin = dbUser.user_metadata?.is_admin === true ||
    dbUser.app_metadata?.is_admin === true;

  if (!isAdmin) {
    throw new Error('Forbidden: Admin access required');
  }

  return { user: dbUser, supabase };
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
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization');

    // Verify admin
    const { user: adminUser, supabase } = await verifyAdmin(authHeader, supabaseUrl, serviceKey);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    // GET /admin-users - List users with filters
    if (req.method === 'GET' && pathParts.length === 0) {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const search = url.searchParams.get('search') || '';
      const provider = url.searchParams.get('provider') || '';
      const verified = url.searchParams.get('verified') || '';
      const sortBy = url.searchParams.get('sortBy') || 'created_at';
      const sortOrder = url.searchParams.get('sortOrder') || 'desc';

      const offset = (page - 1) * limit;

      // Build query
      let query = supabase.auth.admin.listUsers({
        page,
        perPage: limit,
      });

      const { data, error } = await query;

      if (error) throw error;

      // Filter results (auth.admin.listUsers doesn't support filters)
      let users = data.users;

      if (search) {
        users = users.filter((u: any) =>
          u.email?.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (provider) {
        users = users.filter((u: any) =>
          u.app_metadata?.provider === provider
        );
      }

      if (verified !== '') {
        const isVerified = verified === 'true';
        users = users.filter((u: any) =>
          (u.email_confirmed_at !== null) === isVerified
        );
      }

      // Log action
      await logAction(supabase, adminUser.id, 'list_users', undefined, {
        filters: { search, provider, verified },
        page,
        limit,
      });

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
          total: data.users.length,
          page,
          limit,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /admin-users/:id - Get user details
    if (req.method === 'GET' && pathParts.length === 1) {
      const userId = pathParts[0];

      const { data, error } = await supabase.auth.admin.getUserById(userId);

      if (error) throw error;

      await logAction(supabase, adminUser.id, 'view_user_details', userId);

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
            phone_confirmed_at: data.user.phone_confirmed_at,
            provider: data.user.app_metadata?.provider || 'email',
            providers: data.user.app_metadata?.providers || [],
            user_metadata: data.user.user_metadata,
            app_metadata: data.user.app_metadata,
            is_admin: data.user.user_metadata?.is_admin || data.user.app_metadata?.is_admin || false,
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /admin-users/:id/actions - Admin actions (reset password, block, delete, etc)
    if (req.method === 'POST' && pathParts.length === 2 && pathParts[1] === 'actions') {
      const userId = pathParts[0];
      const { action, ...params } = await req.json();

      switch (action) {
        case 'reset_password': {
          // Generate password reset link
          const { data, error } = await supabase.auth.admin.generateLink({
            type: 'recovery',
            email: params.email,
          });

          if (error) throw error;

          await logAction(supabase, adminUser.id, 'reset_password', userId, { email: params.email });

          return new Response(
            JSON.stringify({ success: true, reset_link: data.properties.action_link }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        case 'verify_email': {
          const { error } = await supabase.auth.admin.updateUserById(userId, {
            email_confirm: true,
          });

          if (error) throw error;

          await logAction(supabase, adminUser.id, 'verify_email', userId);

          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        case 'block': {
          const { error } = await supabase.auth.admin.updateUserById(userId, {
            ban_duration: '876000h', // 100 years (permanent)
          });

          if (error) throw error;

          await logAction(supabase, adminUser.id, 'block_user', userId);

          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        case 'unblock': {
          const { error } = await supabase.auth.admin.updateUserById(userId, {
            ban_duration: 'none',
          });

          if (error) throw error;

          await logAction(supabase, adminUser.id, 'unblock_user', userId);

          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        case 'delete': {
          const { error } = await supabase.auth.admin.deleteUser(userId);

          if (error) throw error;

          await logAction(supabase, adminUser.id, 'delete_user', userId);

          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        case 'make_admin': {
          const { error } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { is_admin: true },
          });

          if (error) throw error;

          await logAction(supabase, adminUser.id, 'make_admin', userId);

          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        case 'remove_admin': {
          const { error } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { is_admin: false },
          });

          if (error) throw error;

          await logAction(supabase, adminUser.id, 'remove_admin', userId);

          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        default:
          throw new Error(`Unknown action: ${action}`);
      }
    }

    throw new Error('Not found');

  } catch (error) {
    console.error('Admin Users Error:', error);

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
