
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
    projection_next_months: Array<{ month: string; income: number; expenses: number; balance: number }>;
    memory_patterns: Array<{ category: string; trend: string; summary: string; suggestion?: string }>;
}

async function buildFinancialContext(supabase: any, coupleId: string): Promise<FinancialContext> {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthNum = now.getMonth() + 1;

    // Fetch income
    const { data: incomeData } = await supabase
        .from('income')
        .select('*')
        .eq('couple_id', coupleId);

    const latestSalary = incomeData?.find((i: any) => i.type === 'salary' && Number(i.base_amount) > 0);
    const baseAmount = latestSalary ? Number(latestSalary.base_amount) : 0;

    const totalIncome = incomeData?.filter((i: any) => i.date.startsWith(currentMonth))
        .reduce((sum: number, i: any) => sum + Number(i.net_amount), 0) || 0;

    // Fetch income components
    const { data: incomeComponents } = await supabase
        .from('income_components')
        .select('*')
        .eq('couple_id', coupleId);

    // Fetch income events
    const { data: incomeEvents } = await supabase
        .from('income_events')
        .select('*')
        .eq('couple_id', coupleId);

    // Fetch salary deductions
    const { data: salaryDeductions } = await supabase
        .from('salary_deductions')
        .select('*')
        .eq('couple_id', coupleId);

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

    // Fetch credit cards
    const { data: cards } = await supabase
        .from('credit_cards')
        .select('id, nickname')
        .eq('couple_id', coupleId);

    const { data: transactions } = await supabase
        .from('card_transactions')
        .select('*')
        .eq('couple_id', coupleId);

    // Calculate card invoices
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

    // Fetch piggy bank
    const { data: piggyBanks } = await supabase
        .from('piggy_bank')
        .select('current_balance, couple_id')
        .eq('couple_id', coupleId)
        .maybeSingle();

    const totalPiggyBankBalance = piggyBanks?.current_balance || 0;

    // Fetch memory patterns
    const { data: memoryPatterns } = await supabase
        .from('ai_memory_context')
        .select('category, trend, summary, suggestion')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false })
        .limit(10);

    // Projections
    const calculateProjectedIncomeForMonth = (monthNum: number, yearMonth: string) => {
        let projected = baseAmount;
        for (const comp of (incomeComponents || [])) {
            let appliesThisMonth = false;
            if (comp.recurrence === 'monthly') appliesThisMonth = true;
            else if (comp.recurrence === 'quarterly' && (comp.months || [1, 4, 7, 10]).includes(monthNum)) appliesThisMonth = true;
            else if (comp.recurrence === 'annual' && (comp.months || [12]).includes(monthNum)) appliesThisMonth = true;
            else if (comp.recurrence === 'custom' && (comp.months || []).includes(monthNum)) appliesThisMonth = true;

            if (appliesThisMonth) projected += comp.type === 'credit' ? Number(comp.amount) : -Number(comp.amount);
        }
        for (const event of (incomeEvents || [])) {
            if ((event.months || []).includes(monthNum)) projected += Number(event.amount);
        }
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

    const projections = [];
    const totalFixed = (fixedExpenses || []).reduce((sum: number, e: any) => sum + Number(e.amount), 0);
    const avgVariable = (variableExpenses || []).reduce((sum: number, e: any) => sum + Number(e.amount), 0) / Math.max(1, (variableExpenses || []).length) * 30;

    for (let i = 0; i < 6; i++) {
        const projDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const projMonth = `${projDate.getFullYear()}-${String(projDate.getMonth() + 1).padStart(2, '0')}`;
        const projMonthNum = projDate.getMonth() + 1;
        const projIncome = baseAmount > 0 ? calculateProjectedIncomeForMonth(projMonthNum, projMonth) : totalIncome;

        // Simplified card projection logic for brevity
        const expenses = totalFixed + avgVariable;

        projections.push({
            month: projMonth,
            income: projIncome,
            expenses,
            balance: projIncome - expenses
        });
    }

    return {
        month: currentMonth,
        total_income: totalIncome,
        salary_composition: {
            base_amount: baseAmount,
            components: (incomeComponents || []).map((c: any) => ({ name: c.name, type: c.type, amount: c.amount, recurrence: c.recurrence })),
            seasonal_events: (incomeEvents || []).map((e: any) => ({ name: e.name, amount: e.amount, months: e.months })),
            deductions: activeDeductions.map((d: any) => ({ description: d.description, amount_monthly: d.amount_monthly, installments_remaining: d.installments_total - d.installments_paid, end_month: d.end_month }))
        },
        fixed_expenses: (fixedExpenses || []).map((e: any) => ({ name: e.name, amount: e.amount, category: e.category })),
        variable_expenses: (variableExpenses || []).map((e: any) => ({ description: e.description || e.name, amount: e.amount, category: e.category, date: e.date })),
        card_invoices: cardInvoices.filter((c: any) => c.amount > 0),
        piggy_bank: { balance: totalPiggyBankBalance },
        projection_next_months: projections,
        memory_patterns: memoryPatterns || []
    };
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const { message } = await req.json()
        const apiKey = Deno.env.get('GEMINI_API_KEY')
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!

        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set")
            throw new Error('API Key not configured')
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        // Get User & Context
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found');

        const { data: membership } = await supabase
            .from('couple_members')
            .select('couple_id')
            .eq('user_id', user.id)
            .maybeSingle();

        let financialContext = {};
        if (membership) {
            financialContext = await buildFinancialContext(supabase, membership.couple_id);
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        // Validar input
        if (!message) {
            throw new Error('Message is required')
        }

        // Prompt do sistema ATUALIZADO
        const systemPrompt = `
      Você é o Consultor Pig, um assistente financeiro inteligente, amigável e bem-humorado do app PigMoney.
      
      AGORA VOCÊ TEM ACESSO TOTAL AOS DADOS FINANCEIROS DO USUÁRIO.
      Use os dados fornecidos no contexto abaixo para responder com precisão sobre saldo, gastos, rendas e projeções.
      
      Dados Financeiros Atuais:
      ${JSON.stringify(financialContext, null, 2)}
      
      Diretrizes:
      - Use emojis ocasionalmente (🐷, 💰, 🚀).
      - Seja motivador e positivo.
      - IMPORTANTE: Se o usuário apenas cumprimentar (ex: "oi", "bom dia", "boa noite") ou agradecer, RESPONDA APENAS AO CUMPRIMENTO de forma educada e simpática. NÃO analise os dados financeiros nessas mensagens de "conversa fiada".
      - Só analise os dados se o usuário fizer uma pergunta ou comentário sobre dinheiro/finanças.
      - Quando o usuário perguntar sobre "posso comprar X?", analise o saldo atual e as projeções futuras.
      - Se ele perguntar "quanto gastei com X?", procure nas despesas variáveis ou fixas do contexto.
      - Respostas concisas e diretas.
      - NÃO invente dados. Se não estiver no contexto, diga que não encontrou informações específicas sobre aquilo.
    `

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: "model",
                    parts: [{ text: "Oink! Entendido! Agora tenho super visão dos seus dados! 🐷📊 Pode perguntar qualquer coisa sobre suas finanças que vou analisar diretinho no seu relatório." }],
                },
            ],
        })

        const result = await chat.sendMessage(message)
        const response = await result.response
        const text = response.text()

        return new Response(
            JSON.stringify({ reply: text }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})
