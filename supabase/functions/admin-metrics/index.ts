import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Admin verification (shared with other admin functions)
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
      const range = url.searchParams.get('range') || '7'; // days

      // Get total users
      const { data: allUsers } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      const totalUsers = allUsers?.users.length || 0;

      // Calculate active users (last login within range)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(range));

      const activeUsers = allUsers?.users.filter((u: any) =>
        u.last_sign_in_at && new Date(u.last_sign_in_at) > cutoffDate
      ).length || 0;

      // Calculate new users in range
      const newUsers = allUsers?.users.filter((u: any) =>
        u.created_at && new Date(u.created_at) > cutoffDate
      ).length || 0;

      // Provider distribution
      const providerCounts: Record<string, number> = {};
      allUsers?.users.forEach((u: any) => {
        const provider = u.app_metadata?.provider || 'email';
        providerCounts[provider] = (providerCounts[provider] || 0) + 1;
      });

      // Verified email percentage
      const verifiedCount = allUsers?.users.filter((u: any) => u.email_confirmed_at).length || 0;
      const verifiedPercentage = totalUsers > 0 ? (verifiedCount / totalUsers) * 100 : 0;

      // Growth by day (last 30 days)
      const dailyGrowth: { date: string; count: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const count = allUsers?.users.filter((u: any) => {
          const createdDate = new Date(u.created_at).toISOString().split('T')[0];
          return createdDate === dateStr;
        }).length || 0;

        dailyGrowth.push({ date: dateStr, count });
      }

      return new Response(
        JSON.stringify({
          total_users: totalUsers,
          active_users: activeUsers,
          new_users: newUsers,
          verified_percentage: verifiedPercentage.toFixed(2),
          provider_distribution: providerCounts,
          daily_growth: dailyGrowth,
          range_days: parseInt(range),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Method not allowed');

  } catch (error) {
    console.error('Admin Metrics Error:', error);

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
