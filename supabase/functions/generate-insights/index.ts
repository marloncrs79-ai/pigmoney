import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FinancialContext {
  month: string;
  total_income: number;
  salary_composition: {
    base_amount: number;
    components: Array<{ name: string; type: string; amount: number; recurrence: string }>;
    seasonal_events: Array<{ name: string; amount: number; months: number[] }>;
    deductions: Array<{ description: string; amount_monthly: number; installments_remaining: number; end_month: string | null }>;
  };
  fixed_expenses: Array<{ name: string; amount: number; category: string }>;
  variable_expenses: Array<{ description: string; amount: number; category: string; date: string }>;
  card_invoices: Array<{ card_name: string; amount: number }>;
  piggy_bank: { balance: number };
  piggy_banks: Array<{ name: string; balance: number; goal: number | null }>;
  projection_next_months: Array<{ month: string; income: number; expenses: number; balance: number }>;
  memory_patterns: Array<{ category: string; trend: string; summary: string; suggestion?: string }>;
}

async function buildFinancialContext(supabase: any, coupleId: string, scope: string): Promise<FinancialContext> {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthNum = now.getMonth() + 1;

  // Fetch income
  const { data: incomeData } = await supabase
    .from('income')
    .select('*')
    .eq('couple_id', coupleId);

  // Get latest salary with base_amount
  const latestSalary = incomeData?.find((i: any) => i.type === 'salary' && Number(i.base_amount) > 0);
  const baseAmount = latestSalary ? Number(latestSalary.base_amount) : 0;

  const totalIncome = incomeData?.filter((i: any) => i.date.startsWith(currentMonth))
    .reduce((sum: number, i: any) => sum + Number(i.net_amount), 0) || 0;

  // Fetch income components
  const { data: incomeComponents } = await supabase
    .from('income_components')
    .select('*')
    .eq('couple_id', coupleId);

  // Fetch income events (seasonal)
  const { data: incomeEvents } = await supabase
    .from('income_events')
    .select('*')
    .eq('couple_id', coupleId);

  // Fetch salary deductions
  const { data: salaryDeductions } = await supabase
    .from('salary_deductions')
    .select('*')
    .eq('couple_id', coupleId);

  // Calculate active deductions
  const activeDeductions = (salaryDeductions || []).filter((d: any) => {
    const [startYear, startMonth] = d.start_month.split('-').map(Number);
    const monthsElapsed = (now.getFullYear() - startYear) * 12 + (now.getMonth() + 1 - startMonth);
    return monthsElapsed < d.installments_total - d.installments_paid;
  });

  // Fetch fixed expenses
  const { data: fixedExpenses } = await supabase
    .from('fixed_expenses')
    .select('name, amount, category, type, date, description')
    .eq('couple_id', coupleId)
    .eq('type', 'fixed')
    .eq('is_active', true);

  // Fetch variable expenses
  const { data: variableExpenses } = await supabase
    .from('fixed_expenses')
    .select('name, amount, category, type, date, description')
    .eq('couple_id', coupleId)
    .eq('type', 'variable')
    .order('date', { ascending: false })
    .limit(50);

  // Fetch credit cards and transactions
  const { data: cards } = await supabase
    .from('credit_cards')
    .select('id, nickname')
    .eq('couple_id', coupleId);

  const { data: transactions } = await supabase
    .from('card_transactions')
    .select('*')
    .eq('couple_id', coupleId);

  // Calculate card invoices for current month
  const cardInvoices = (cards || []).map((card: any) => {
    const cardTransactions = (transactions || []).filter((t: any) => t.card_id === card.id);
    const invoiceAmount = cardTransactions.reduce((sum: number, t: any) => {
      const [firstYear, firstMonth] = t.first_invoice_month.split('-').map(Number);
      const [currentYear, currentMonthNum] = currentMonth.split('-').map(Number);
      const monthsDiff = (currentYear - firstYear) * 12 + (currentMonthNum - firstMonth);

      if (monthsDiff >= 0 && monthsDiff < t.installments) {
        return sum + (Number(t.amount_total) / t.installments);
      }
      return sum;
    }, 0);

    return { card_name: card.nickname, amount: invoiceAmount };
  });

  // Fetch all piggy banks
  // Fetch all piggy banks
  const { data: piggyBanks } = await supabase
    .from('piggy_banks')
    .select('name, current_balance, goal_amount')
    .eq('couple_id', coupleId);

  const totalPiggyBankBalance = (piggyBanks || []).reduce((sum: number, pb: any) => sum + Number(pb.current_balance), 0);

  // Fetch individual piggy banks if table exists (assuming previous code used 'piggy_banks' but migration said 'piggy_bank')
  // Sticking to what migration defined: 'piggy_bank' is singular per couple.

  // Fetch memory patterns
  const { data: memoryPatterns } = await supabase
    .from('ai_memory_context')
    .select('category, trend, summary, suggestion')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: false })
    .limit(10);

  // Calculate projected income for the month considering components
  const calculateProjectedIncomeForMonth = (monthNum: number, yearMonth: string) => {
    let projected = baseAmount;

    // Add components
    for (const comp of (incomeComponents || [])) {
      let appliesThisMonth = false;
      if (comp.recurrence === 'monthly') appliesThisMonth = true;
      else if (comp.recurrence === 'quarterly' && (comp.months || [1, 4, 7, 10]).includes(monthNum)) appliesThisMonth = true;
      else if (comp.recurrence === 'annual' && (comp.months || [12]).includes(monthNum)) appliesThisMonth = true;
      else if (comp.recurrence === 'custom' && (comp.months || []).includes(monthNum)) appliesThisMonth = true;

      if (appliesThisMonth) {
        projected += comp.type === 'credit' ? Number(comp.amount) : -Number(comp.amount);
      }
    }

    // Add seasonal events
    for (const event of (incomeEvents || [])) {
      if ((event.months || []).includes(monthNum)) {
        projected += Number(event.amount);
      }
    }

    // Subtract active deductions
    for (const deduction of activeDeductions) {
      const [startYear, startMonth] = deduction.start_month.split('-').map(Number);
      const [targetYear, targetMonth] = yearMonth.split('-').map(Number);
      const monthsElapsed = (targetYear - startYear) * 12 + (targetMonth - startMonth);
      if (monthsElapsed >= 0 && monthsElapsed < deduction.installments_total - deduction.installments_paid) {
        projected -= Number(deduction.amount_monthly);
      }
    }

    return projected;
  };

  // Calculate projections for next 6 months
  const projections = [];
  const totalFixed = (fixedExpenses || []).reduce((sum: number, e: any) => sum + Number(e.amount), 0);
  const avgVariable = (variableExpenses || []).reduce((sum: number, e: any) => sum + Number(e.amount), 0) / Math.max(1, (variableExpenses || []).length) * 30;

  for (let i = 0; i < 6; i++) {
    const projDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const projMonth = `${projDate.getFullYear()}-${String(projDate.getMonth() + 1).padStart(2, '0')}`;
    const projMonthNum = projDate.getMonth() + 1;

    const projIncome = baseAmount > 0 ? calculateProjectedIncomeForMonth(projMonthNum, projMonth) : totalIncome;

    const projCardInvoice = (cards || []).reduce((sum: number, card: any) => {
      const cardTrans = (transactions || []).filter((t: any) => t.card_id === card.id);
      return sum + cardTrans.reduce((csum: number, t: any) => {
        const [firstYear, firstMonth] = t.first_invoice_month.split('-').map(Number);
        const [projYear, projMonthNum] = projMonth.split('-').map(Number);
        const monthsDiff = (projYear - firstYear) * 12 + (projMonthNum - firstMonth);

        if (monthsDiff >= 0 && monthsDiff < t.installments) {
          return csum + (Number(t.amount_total) / t.installments);
        }
        return csum;
      }, 0);
    }, 0);

    const expenses = totalFixed + avgVariable + projCardInvoice;
    projections.push({
      month: projMonth,
      income: projIncome,
      expenses,
      balance: projIncome - expenses
    });
  }

  return {
    month: currentMonth,
    total_income: totalIncome || (baseAmount > 0 ? calculateProjectedIncomeForMonth(currentMonthNum, currentMonth) : 0),
    salary_composition: {
      base_amount: baseAmount,
      components: (incomeComponents || []).map((c: any) => ({
        name: c.name,
        type: c.type,
        amount: c.amount,
        recurrence: c.recurrence
      })),
      seasonal_events: (incomeEvents || []).map((e: any) => ({
        name: e.name,
        amount: e.amount,
        months: e.months
      })),
      deductions: activeDeductions.map((d: any) => ({
        description: d.description,
        amount_monthly: d.amount_monthly,
        installments_remaining: d.installments_total - d.installments_paid,
        end_month: d.end_month
      }))
    },
    fixed_expenses: (fixedExpenses || []).map((e: any) => ({ name: e.name, amount: e.amount, category: e.category })),
    variable_expenses: (variableExpenses || []).map((e: any) => ({ description: e.description || e.name, amount: e.amount, category: e.category, date: e.date })),
    card_invoices: cardInvoices.filter((c: any) => c.amount > 0),
    piggy_bank: { balance: totalPiggyBankBalance },
    piggy_banks: (piggyBanks || []).map((pb: any) => ({
      name: pb.name,
      balance: pb.current_balance,
      goal: pb.goal_amount
    })),
    projection_next_months: projections,
    memory_patterns: memoryPatterns || []
  };
}

// Detect trends in spending categories
async function detectTrends(supabase: any, coupleId: string): Promise<Array<{ category: string; trend: string; percentage: number }>> {
  const trends: Array<{ category: string; trend: string; percentage: number }> = [];

  // Get last 4 months of data
  const now = new Date();
  const months = [];
  for (let i = 0; i < 4; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const { data: expenses } = await supabase
    .from('fixed_expenses')
    .select('category, amount, date, type')
    .eq('couple_id', coupleId)
    .eq('type', 'variable');

  if (!expenses || expenses.length === 0) return trends;

  // Group by category and month
  const categoryMonthly: Record<string, Record<string, number>> = {};

  for (const exp of expenses) {
    if (!exp.date) continue;
    const expMonth = exp.date.substring(0, 7);
    if (!months.includes(expMonth)) continue;

    if (!categoryMonthly[exp.category]) {
      categoryMonthly[exp.category] = {};
    }
    categoryMonthly[exp.category][expMonth] = (categoryMonthly[exp.category][expMonth] || 0) + Number(exp.amount);
  }

  // Analyze trends
  for (const [category, monthlyData] of Object.entries(categoryMonthly)) {
    const values = months.map(m => monthlyData[m] || 0).reverse();
    if (values.filter(v => v > 0).length < 2) continue;

    const firstNonZero = values.find(v => v > 0) || 0;
    const lastNonZero = [...values].reverse().find(v => v > 0) || 0;

    if (firstNonZero === 0) continue;

    const change = ((lastNonZero - firstNonZero) / firstNonZero) * 100;

    if (Math.abs(change) > 10) {
      trends.push({
        category,
        trend: change > 0 ? 'up' : 'down',
        percentage: Math.round(Math.abs(change))
      });
    }
  }

  return trends;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { scope } = await req.json();
    console.log(`Generating insights for scope: ${scope}`);

    // Get couple_id for user
    const { data: membership } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership) {
      return new Response(JSON.stringify({ error: "No couple found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const coupleId = membership.couple_id;
    const context = await buildFinancialContext(supabase, coupleId, scope);
    const trends = await detectTrends(supabase, coupleId);

    console.log(`Context built. Trends detected: ${trends.length}`);

    // CHANGED: Use GEMINI_API_KEY instead of LOVABLE_API_KEY
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `Você é uma IA especialista em interpretar dados financeiros pessoais de um casal brasileiro.

Receberá um JSON com despesas fixas, variáveis, renda, faturas de cartão, cofrinho, projeções e padrões históricos de memória.

Gere entre 3 e 5 insights em português Brasil explicando o que está acontecendo com as finanças.

REGRAS IMPORTANTES:
- Use linguagem simples, objetiva e neutra
- NÃO faça julgamentos morais sobre os gastos
- NÃO use regras prescritivas como "50/30/20"
- Apenas descreva o que os dados mostram
- Compare valores com meses anteriores quando relevante
- Destaque tendências e padrões dos memory_patterns
- Seja direto e prático
- Nunca use linguagem de culpa ou vergonha

FORMATO DE RESPOSTA (JSON):
{
  "insights": [
    {"message": "texto do insight", "mood_tag": "neutral|alert|urgent|positive"}
  ],
  "suggested_tasks": [
    {"description": "tarefa acionável", "related_scope": "category|card|month", "related_reference": "nome_categoria_ou_ref", "priority": "low|medium|high"}
  ],
  "memory_updates": [
    {"category": "nome", "trend": "up|down|stable", "summary": "resumo curto", "suggestion": "sugestão opcional"}
  ]
}

MOOD_TAG:
- "positive": situação boa, saldo positivo, economia
- "neutral": informação neutra, dado factual
- "alert": merece atenção, margem apertada
- "urgent": precisa de ação, saldo negativo, tendência perigosa

SUGGESTED_TASKS:
- Sugira até 3 tarefas práticas e acionáveis
- Evite tarefas genéricas como "economizar mais"
- Prefira tarefas específicas como "revisar assinatura X" ou "comparar preços de Y"

MEMORY_UPDATES:
- Se detectar padrões novos ou mudanças, sugira atualizações de memória
- Foque em tendências de 2+ meses`;

    const userMessage = `Escopo da análise: ${scope}\n\nTendências detectadas: ${JSON.stringify(trends)}\n\nDados financeiros:\n${JSON.stringify(context, null, 2)}`;

    const result = await model.generateContent([
      systemPrompt,
      userMessage
    ]);
    const response = await result.response;
    const content = response.text();

    console.log("AI Response received");

    // Parse the JSON response
    let parsed;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      // Fallback: treat as simple message
      parsed = {
        insights: [{ message: content.substring(0, 200), mood_tag: "neutral" }],
        suggested_tasks: [],
        memory_updates: []
      };
    }

    const insights = parsed.insights || [];
    const suggestedTasks = parsed.suggested_tasks || [];
    const memoryUpdates = parsed.memory_updates || [];

    // Save insights to database
    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    // Delete old insights for this scope/month
    await supabase
      .from('ai_insights')
      .delete()
      .eq('couple_id', coupleId)
      .eq('scope', scope)
      .eq('year_month', currentMonth);

    // Insert new insights
    const insightsToInsert = insights.map((insight: any) => ({
      couple_id: coupleId,
      scope,
      year_month: currentMonth,
      message: insight.message,
      severity: insight.mood_tag === 'urgent' ? 'danger' : insight.mood_tag === 'alert' ? 'warning' : 'info',
      mood_tag: insight.mood_tag || 'neutral'
    }));

    if (insightsToInsert.length > 0) {
      const { error: insightError } = await supabase.from('ai_insights').insert(insightsToInsert);
      if (insightError) console.error("Error inserting insights:", insightError);
    }

    // Insert suggested tasks
    if (suggestedTasks.length > 0) {
      const tasksToInsert = suggestedTasks.map((task: any) => ({
        couple_id: coupleId,
        created_by: 'ai',
        related_scope: task.related_scope || null,
        related_reference: task.related_reference || null,
        description: task.description,
        priority: task.priority || 'medium',
        status: 'open'
      }));

      const { error: taskError } = await supabase.from('financial_tasks').insert(tasksToInsert);
      if (taskError) console.error("Error inserting tasks:", taskError);
    }

    // Update memory context
    if (memoryUpdates.length > 0) {
      for (const update of memoryUpdates) {
        // Delete existing memory for this category
        await supabase
          .from('ai_memory_context')
          .delete()
          .eq('couple_id', coupleId)
          .eq('category', update.category);

        // Insert new memory
        await supabase.from('ai_memory_context').insert({
          couple_id: coupleId,
          year_month_start: currentMonth,
          year_month_end: currentMonth,
          category: update.category,
          trend: update.trend,
          summary: update.summary,
          suggestion: update.suggestion || null
        });
      }
    }

    console.log(`Insights generated: ${insights.length}, Tasks: ${suggestedTasks.length}, Memory updates: ${memoryUpdates.length}`);

    return new Response(JSON.stringify({
      insights: insights.map((i: any) => ({ ...i, mood_tag: i.mood_tag || 'neutral' })),
      suggested_tasks: suggestedTasks
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-insights:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
