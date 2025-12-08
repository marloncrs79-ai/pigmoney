import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalculateNetSalaryRequest {
  year: number;
  month: number;
  months?: number; // Optional: number of months to project (default: 1)
}

interface SalaryBreakdown {
  baseAmount: number;
  credits: number;
  debits: number;
  seasonalBonuses: number;
  deductionsAmount: number;
  netAmount: number;
  breakdown: { name: string; amount: number; type: 'credit' | 'debit' }[];
}

interface MonthlyProjection {
  year: number;
  month: number;
  yearMonth: string;
  salary: SalaryBreakdown;
}

// Calculate salary for a single month
async function calculateSingleMonth(
  supabase: SupabaseClient,
  coupleId: string,
  incomes: any[],
  components: any[],
  events: any[],
  deductions: any[],
  year: number,
  month: number
): Promise<SalaryBreakdown> {
  const targetMonth = `${year}-${String(month).padStart(2, '0')}`;
  const targetDate = new Date(`${targetMonth}-01`);

  // Find the salary that was active in the target month
  const baseIncome = incomes.find((i) => {
    if (!i.effective_from) return true;
    const effective = new Date(i.effective_from);
    return effective <= targetDate;
  });

  if (!baseIncome) {
    return {
      baseAmount: 0,
      credits: 0,
      debits: 0,
      seasonalBonuses: 0,
      deductionsAmount: 0,
      netAmount: 0,
      breakdown: []
    };
  }

  const baseAmount = Number(baseIncome.base_amount ?? 0);
  let credits = 0;
  let debits = 0;
  let seasonalBonuses = 0;
  let deductionsAmount = 0;
  const breakdown: { name: string; amount: number; type: 'credit' | 'debit' }[] = [];

  // Add base to breakdown
  breakdown.push({ name: 'Salário Base', amount: baseAmount, type: 'credit' });

  // Process components
  for (const c of components) {
    let applies = false;

    switch (c.recurrence) {
      case 'monthly':
        applies = true;
        break;
      case 'quarterly':
        const quarterMonths = c.months || [1, 4, 7, 10];
        applies = quarterMonths.includes(month);
        break;
      case 'annual':
        const annualMonths = c.months || [12];
        applies = annualMonths.includes(month);
        break;
      case 'custom':
        if (Array.isArray(c.months) && c.months.includes(month)) {
          applies = true;
        }
        break;
    }

    if (!applies) continue;

    const amount = Number(c.amount);
    if (c.type === 'credit') {
      credits += amount;
      breakdown.push({ name: c.name, amount, type: 'credit' });
    } else {
      debits += amount;
      breakdown.push({ name: c.name, amount, type: 'debit' });
    }
  }

  // Process seasonal events
  for (const event of events) {
    if (Array.isArray(event.months) && event.months.includes(month)) {
      const amount = Number(event.amount);
      seasonalBonuses += amount;
      breakdown.push({ name: event.name, amount, type: 'credit' });
    }
  }

  // Process salary deductions
  for (const deduction of deductions) {
    const startMonth = deduction.start_month;
    const [startYear, startMonthNum] = startMonth.split('-').map(Number);
    
    const monthsElapsed = (year - startYear) * 12 + (month - startMonthNum);
    const remainingInstallments = deduction.installments_total - deduction.installments_paid;
    const isActive = monthsElapsed >= 0 && monthsElapsed < remainingInstallments;
    
    if (isActive) {
      const amount = Number(deduction.amount_monthly);
      deductionsAmount += amount;
      breakdown.push({ name: deduction.description, amount, type: 'debit' });
    }
  }

  const netAmount = baseAmount + credits - debits + seasonalBonuses - deductionsAmount;

  return {
    baseAmount,
    credits,
    debits,
    seasonalBonuses,
    deductionsAmount,
    netAmount,
    breakdown
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user's couple_id
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Failed to get user:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get couple_id from couple_members
    const { data: memberData, error: memberError } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (memberError) {
      console.error('Failed to get couple membership:', memberError);
      return new Response(JSON.stringify({ error: 'Failed to get couple membership' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!memberData) {
      console.log('User has no couple');
      return new Response(JSON.stringify({ error: 'No couple found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const coupleId = memberData.couple_id;
    const { year, month, months = 1 }: CalculateNetSalaryRequest = await req.json();

    console.log(`Calculating net salary for couple ${coupleId}, starting ${year}-${String(month).padStart(2, '0')}, ${months} month(s)`);

    // Fetch all data once for efficiency
    const [incomesResult, componentsResult, eventsResult, deductionsResult] = await Promise.all([
      supabase.from('income').select('*').eq('couple_id', coupleId).eq('type', 'salary').order('effective_from', { ascending: false, nullsFirst: false }),
      supabase.from('income_components').select('*').eq('couple_id', coupleId),
      supabase.from('income_events').select('*').eq('couple_id', coupleId),
      supabase.from('salary_deductions').select('*').eq('couple_id', coupleId)
    ]);

    if (incomesResult.error) throw incomesResult.error;
    if (componentsResult.error) throw componentsResult.error;
    if (eventsResult.error) throw eventsResult.error;
    if (deductionsResult.error) throw deductionsResult.error;

    const incomes = incomesResult.data || [];
    const components = componentsResult.data || [];
    const events = eventsResult.data || [];
    const deductions = deductionsResult.data || [];

    console.log(`Data fetched: ${incomes.length} incomes, ${components.length} components, ${events.length} events, ${deductions.length} deductions`);

    // Single month calculation
    if (months === 1) {
      const result = await calculateSingleMonth(
        supabase, coupleId, incomes, components, events, deductions, year, month
      );
      console.log(`Net salary calculated: ${result.netAmount}`);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Multi-month projection
    const projection: MonthlyProjection[] = [];
    let currentYear = year;
    let currentMonth = month;

    for (let i = 0; i < months; i++) {
      const salary = await calculateSingleMonth(
        supabase, coupleId, incomes, components, events, deductions, currentYear, currentMonth
      );
      
      projection.push({
        year: currentYear,
        month: currentMonth,
        yearMonth: `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
        salary
      });

      // Move to next month
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    console.log(`Projection calculated for ${months} months`);

    return new Response(JSON.stringify({ projection }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error calculating net salary:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
