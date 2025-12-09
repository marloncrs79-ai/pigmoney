import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TablesInsert } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getCurrentYearMonth, getNext12Months, calculateInstallmentForMonth, getInvoiceMonth } from '@/lib/utils';

// Types
export interface FixedExpense {
  id: string;
  couple_id: string;
  name: string;
  amount: number;
  due_day: number;
  category: string;
  is_active: boolean;
  notes: string | null;
  type: 'fixed' | 'variable';
  date: string | null;
  payment_method: string | null;
  description: string | null;
  paid_with_card: boolean;
  card_id: string | null;
  created_at: string;
}

export interface Income {
  id: string;
  couple_id: string;
  source: string;
  gross_amount: number;
  net_amount: number;
  base_amount: number;
  date: string;
  type: string;
  is_salary_revision: boolean;
  effective_from: string | null;
  created_at: string;
}

export interface CreditCard {
  id: string;
  couple_id: string;
  holder_name: string;
  nickname: string;
  limit_amount: number;
  closing_day: number;
  due_day: number;
  created_at: string;
}

export interface CardTransaction {
  id: string;
  couple_id: string;
  card_id: string;
  description: string;
  category: string;
  amount_total: number;
  installments: number;
  first_invoice_month: string;
  created_at: string;
}

export interface PiggyBank {
  id: string;
  couple_id: string;
  name: string;
  goal_amount: number | null;
  current_balance: number;
  created_at: string;
}

export interface PiggyBankMovement {
  id: string;
  couple_id: string;
  piggy_bank_id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  date: string;
  reason: string | null;
  created_at: string;
}

// Expenses Hooks (unified for fixed and variable)
export function useExpenses(type?: 'fixed' | 'variable') {
  const { couple } = useAuth();

  return useQuery({
    queryKey: ['expenses', couple?.id, type],
    queryFn: async () => {
      if (!couple?.id) return [];
      let query = supabase
        .from('fixed_expenses')
        .select('*')
        .eq('couple_id', couple.id);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as FixedExpense[];
    },
    enabled: !!couple?.id
  });
}

// Backward compatible hooks
export function useFixedExpenses() {
  const { couple } = useAuth();

  return useQuery({
    queryKey: ['fixed-expenses', couple?.id],
    queryFn: async () => {
      if (!couple?.id) return [];
      const { data, error } = await supabase
        .from('fixed_expenses')
        .select('*')
        .eq('couple_id', couple.id)
        .eq('type', 'fixed')
        .order('due_day');
      if (error) throw error;
      return data as FixedExpense[];
    },
    enabled: !!couple?.id
  });
}

export function useVariableExpenses() {
  const { couple } = useAuth();

  return useQuery({
    queryKey: ['variable-expenses', couple?.id],
    queryFn: async () => {
      if (!couple?.id) return [];
      const { data, error } = await supabase
        .from('fixed_expenses')
        .select('*')
        .eq('couple_id', couple.id)
        .eq('type', 'variable')
        .order('date', { ascending: false });
      if (error) throw error;
      return data as FixedExpense[];
    },
    enabled: !!couple?.id
  });
}

export interface CreateExpenseWithCard extends Partial<Omit<FixedExpense, 'id' | 'couple_id' | 'created_at'>> {
  type: 'fixed' | 'variable';
  cardClosingDay?: number;
  installments?: number;
}

export function useCreateExpense() {
  const { couple } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (expense: CreateExpenseWithCard) => {
      if (!couple?.id) throw new Error('No couple');

      const { cardClosingDay, installments = 1, ...expenseData } = expense;
      const insertData = { ...expenseData, couple_id: couple.id };

      // Create the expense
      const { data: createdExpense, error } = await supabase
        .from('fixed_expenses')
        .insert(insertData as unknown as TablesInsert<'fixed_expenses'>)
        .select()
        .single();
      if (error) throw error;

      // If paid with card, also create a card transaction
      if (expense.paid_with_card && expense.card_id && cardClosingDay !== undefined) {
        const expenseDate = expense.date ? new Date(expense.date) : new Date();
        const invoiceMonth = getInvoiceMonth(expenseDate, cardClosingDay);

        const transactionData = {
          card_id: expense.card_id,
          couple_id: couple.id,
          description: expense.description || expense.name || 'Despesa',
          category: expense.category || 'Outros',
          amount_total: expense.amount || 0,
          installments: installments,
          first_invoice_month: invoiceMonth
        };

        const { error: transactionError } = await supabase
          .from('card_transactions')
          .insert(transactionData);

        if (transactionError) {
          console.error('Error creating card transaction:', transactionError);
          // Don't throw here, the expense was created successfully
        }
      }

      return createdExpense;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['variable-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['card-transactions'] });
      const message = variables.paid_with_card
        ? 'Despesa criada e adicionada ao cartão!'
        : variables.type === 'fixed' ? 'Despesa fixa criada!' : 'Gasto variável adicionado!';
      toast({ title: message });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

export function useCreateFixedExpense() {
  const { couple } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (expense: Omit<FixedExpense, 'id' | 'couple_id' | 'created_at' | 'type' | 'date' | 'payment_method' | 'description'>) => {
      if (!couple?.id) throw new Error('No couple');
      const { data, error } = await supabase
        .from('fixed_expenses')
        .insert({ ...expense, couple_id: couple.id, type: 'fixed' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: 'Despesa criada!' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

export function useUpdateFixedExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...expense }: Partial<FixedExpense> & { id: string }) => {
      const { data, error } = await supabase
        .from('fixed_expenses')
        .update(expense)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['variable-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: 'Despesa atualizada!' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

export function useDeleteFixedExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('fixed_expenses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['variable-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: 'Despesa removida!' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

// Income Hooks
export function useIncome() {
  const { couple } = useAuth();

  return useQuery({
    queryKey: ['income', couple?.id],
    queryFn: async () => {
      if (!couple?.id) return [];
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('couple_id', couple.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return data as Income[];
    },
    enabled: !!couple?.id
  });
}

export function useCreateIncome() {
  const { couple } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (income: Omit<Income, 'id' | 'couple_id' | 'created_at'>) => {
      if (!couple?.id) throw new Error('No couple');
      const { data, error } = await supabase
        .from('income')
        .insert({ ...income, couple_id: couple.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      toast({ title: 'Receita adicionada!' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('income').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      toast({ title: 'Receita removida!' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

// Credit Cards Hooks
export function useCreditCards() {
  const { couple } = useAuth();

  return useQuery({
    queryKey: ['credit-cards', couple?.id],
    queryFn: async () => {
      if (!couple?.id) return [];
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('couple_id', couple.id)
        .order('nickname');
      if (error) throw error;
      return data as CreditCard[];
    },
    enabled: !!couple?.id
  });
}

export function useCreateCreditCard() {
  const { couple } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (card: Omit<CreditCard, 'id' | 'couple_id' | 'created_at'>) => {
      if (!couple?.id) throw new Error('No couple');
      const { data, error } = await supabase
        .from('credit_cards')
        .insert({ ...card, couple_id: couple.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] });
      toast({ title: 'Cartão adicionado!' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

export function useDeleteCreditCard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('credit_cards').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] });
      toast({ title: 'Cartão removido!', description: 'O cartão foi removido com sucesso.' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

// Card Transactions Hooks
export function useCardTransactions(cardId?: string) {
  const { couple } = useAuth();

  return useQuery({
    queryKey: ['card-transactions', couple?.id, cardId],
    queryFn: async () => {
      if (!couple?.id) return [];
      let query = supabase
        .from('card_transactions')
        .select('*')
        .eq('couple_id', couple.id)
        .order('created_at', { ascending: false });

      if (cardId) {
        query = query.eq('card_id', cardId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CardTransaction[];
    },
    enabled: !!couple?.id
  });
}

export function useCreateCardTransaction() {
  const { couple } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (transaction: Omit<CardTransaction, 'id' | 'couple_id' | 'created_at'>) => {
      if (!couple?.id) throw new Error('No couple');
      const { data, error } = await supabase
        .from('card_transactions')
        .insert({ ...transaction, couple_id: couple.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-transactions'] });
      toast({ title: 'Compra adicionada!', description: 'A compra foi registrada com sucesso.' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

export function useDeleteCardTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('card_transactions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-transactions'] });
      toast({ title: 'Compra removida!', description: 'A compra foi removida com sucesso.' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

// Piggy Bank Hooks - Multiple piggy banks support
export function usePiggyBanks() {
  const { couple } = useAuth();

  return useQuery({
    queryKey: ['piggy-banks', couple?.id],
    queryFn: async () => {
      if (!couple?.id) return [];
      const { data, error } = await supabase
        .from('piggy_banks')
        .select('*')
        .eq('couple_id', couple.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PiggyBank[];
    },
    enabled: !!couple?.id
  });
}

export function usePiggyBank(id?: string) {
  const { couple } = useAuth();

  return useQuery({
    queryKey: ['piggy-bank', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('piggy_banks')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as PiggyBank | null;
    },
    enabled: !!id && !!couple?.id
  });
}

export function usePiggyBankMovements(piggyBankId?: string) {
  const { couple } = useAuth();

  return useQuery({
    queryKey: ['piggy-bank-movements', piggyBankId],
    queryFn: async () => {
      if (!couple?.id || !piggyBankId) return [];
      const { data, error } = await supabase
        .from('piggy_bank_movements')
        .select('*')
        .eq('piggy_bank_id', piggyBankId)
        .order('date', { ascending: false });
      if (error) throw error;
      return data as PiggyBankMovement[];
    },
    enabled: !!couple?.id && !!piggyBankId
  });
}

export function useCreatePiggyBank() {
  const { couple } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { name: string; goal_amount?: number | null; initial_balance?: number }) => {
      if (!couple?.id) throw new Error('No couple');

      const { data: piggyBank, error } = await supabase
        .from('piggy_banks')
        .insert({
          couple_id: couple.id,
          name: data.name,
          goal_amount: data.goal_amount || null,
          current_balance: data.initial_balance || 0
        })
        .select()
        .single();
      if (error) throw error;

      // Create initial deposit movement if there's an initial balance
      if (data.initial_balance && data.initial_balance > 0) {
        await supabase.from('piggy_bank_movements').insert({
          couple_id: couple.id,
          piggy_bank_id: piggyBank.id,
          type: 'deposit',
          amount: data.initial_balance,
          date: new Date().toISOString().split('T')[0],
          reason: 'Saldo inicial'
        });
      }

      return piggyBank;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['piggy-banks'] });
      toast({
        title: 'Cofrinho criado!',
        description: 'Seu novo cofrinho foi criado com sucesso.'
      });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

export function useUpdatePiggyBank() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; goal_amount?: number | null }) => {
      const { data: piggyBank, error } = await supabase
        .from('piggy_banks')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return piggyBank;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['piggy-banks'] });
      queryClient.invalidateQueries({ queryKey: ['piggy-bank', variables.id] });
      toast({ title: 'Cofrinho atualizado!', description: 'As informações do cofrinho foram atualizadas.' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

export function useDeletePiggyBank() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('piggy_banks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['piggy-banks'] });
      toast({ title: 'Cofrinho excluído!', description: 'O cofrinho foi removido permanentemente.' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

export function useCreatePiggyBankMovement() {
  const { couple } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (movement: { piggy_bank_id: string; type: 'deposit' | 'withdraw'; amount: number; date: string; reason?: string | null }) => {
      if (!couple?.id) throw new Error('No couple');

      // Create movement
      const { data, error } = await supabase
        .from('piggy_bank_movements')
        .insert({
          couple_id: couple.id,
          piggy_bank_id: movement.piggy_bank_id,
          type: movement.type,
          amount: movement.amount,
          date: movement.date,
          reason: movement.reason || null
        })
        .select()
        .single();
      if (error) throw error;

      // Update balance
      const { data: piggyData } = await supabase
        .from('piggy_banks')
        .select('current_balance')
        .eq('id', movement.piggy_bank_id)
        .single();

      const currentBalance = piggyData?.current_balance || 0;
      const newBalance = movement.type === 'deposit'
        ? currentBalance + movement.amount
        : currentBalance - movement.amount;

      await supabase
        .from('piggy_banks')
        .update({ current_balance: newBalance })
        .eq('id', movement.piggy_bank_id);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['piggy-banks'] });
      queryClient.invalidateQueries({ queryKey: ['piggy-bank', variables.piggy_bank_id] });
      queryClient.invalidateQueries({ queryKey: ['piggy-bank-movements', variables.piggy_bank_id] });
      toast({ title: 'Movimentação registrada!', description: 'A movimentação foi registrada no cofrinho.' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

// Calculated Data Hooks
export function useMonthlyProjection() {
  const { data: fixedExpenses = [] } = useFixedExpenses();
  const { data: income = [] } = useIncome();
  const { data: cardTransactions = [] } = useCardTransactions();
  const { data: variableExpenses = [] } = useVariableExpenses();
  const { data: piggyBanks = [] } = usePiggyBanks();

  const months = getNext12Months();
  const currentMonth = getCurrentYearMonth();

  // Calculate total piggy bank balance
  const totalPiggyBankBalance = piggyBanks.reduce((sum, pb) => sum + Number(pb.current_balance), 0);

  // Calculate average variable expenses from last 3 months
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const recentVariableExpenses = variableExpenses.filter(e => e.date && new Date(e.date) >= threeMonthsAgo);
  const avgMonthlyVariable = recentVariableExpenses.length > 0
    ? recentVariableExpenses.reduce((sum, e) => sum + Number(e.amount), 0) / 3
    : 0;

  // Get the latest salary base amount
  const latestSalary = income.find(i => i.type === 'salary' && Number(i.base_amount) > 0);
  const baseAmount = latestSalary ? Number(latestSalary.base_amount) : 0;

  // Calculate monthly income (use base amount if available, otherwise use recent income)
  const currentMonthIncome = income.filter(i => i.date.startsWith(currentMonth));
  const monthlyIncome = currentMonthIncome.length > 0
    ? currentMonthIncome.reduce((sum, i) => sum + Number(i.net_amount), 0)
    : baseAmount > 0
      ? baseAmount
      : income.length > 0
        ? income.slice(0, 3).reduce((sum, i) => sum + Number(i.net_amount), 0) / Math.min(3, income.length)
        : 0;

  // Fixed expenses total (only active)
  const activeFixedExpenses = fixedExpenses.filter(e => e.is_active);
  const totalFixedExpenses = activeFixedExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const projections = months.map(month => {
    // Calculate card invoice for this month
    const cardInvoice = cardTransactions.reduce((sum, t) => {
      return sum + calculateInstallmentForMonth(
        t.first_invoice_month,
        Number(t.amount_total),
        t.installments,
        month
      );
    }, 0);

    // Variable expenses for this specific month
    const monthVariableExpenses = variableExpenses
      .filter(e => e.date && e.date.startsWith(month))
      .reduce((sum, e) => sum + Number(e.amount), 0);

    // Use actual data if available, otherwise use average
    const projectedVariable = monthVariableExpenses > 0 ? monthVariableExpenses : avgMonthlyVariable;

    const totalExpenses = totalFixedExpenses + projectedVariable + cardInvoice;
    const balance = monthlyIncome - totalExpenses;

    let status: 'positive' | 'warning' | 'danger' = 'positive';
    if (balance < 0) status = 'danger';
    else if (balance < monthlyIncome * 0.1) status = 'warning';

    return {
      month,
      income: monthlyIncome,
      fixedExpenses: totalFixedExpenses,
      variableExpenses: projectedVariable,
      cardInvoice,
      totalExpenses,
      balance,
      status
    };
  });

  return {
    projections,
    summary: {
      currentBalance: projections[0]?.balance || 0,
      totalFixedExpenses,
      avgVariableExpenses: avgMonthlyVariable,
      monthlyIncome,
      baseAmount,
      piggyBankBalance: totalPiggyBankBalance
    }
  };
}
