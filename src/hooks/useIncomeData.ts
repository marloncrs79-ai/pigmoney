import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Types
export interface IncomeComponent {
  id: string;
  couple_id: string;
  income_id: string | null;
  name: string;
  type: 'credit' | 'debit';
  amount: number;
  recurrence: 'monthly' | 'quarterly' | 'annual' | 'custom';
  months: number[] | null;
  created_at: string;
}

export interface IncomeEvent {
  id: string;
  couple_id: string;
  name: string;
  amount: number;
  months: number[];
  created_at: string;
}

export interface SalaryDeduction {
  id: string;
  couple_id: string;
  description: string;
  amount_monthly: number;
  installments_total: number;
  installments_paid: number;
  start_month: string;
  end_month: string | null;
  created_at: string;
}

// Calculate which months a component applies to
export function getComponentMonths(component: IncomeComponent): number[] {
  switch (component.recurrence) {
    case 'monthly':
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    case 'quarterly':
      return component.months || [1, 4, 7, 10];
    case 'annual':
      return component.months || [12];
    case 'custom':
      return component.months || [];
    default:
      return [];
  }
}

// Check if a deduction applies to a given month
export function isDeductionActiveInMonth(deduction: SalaryDeduction, yearMonth: string): boolean {
  const [year, month] = yearMonth.split('-').map(Number);
  const [startYear, startMonth] = deduction.start_month.split('-').map(Number);
  
  const startDate = new Date(startYear, startMonth - 1);
  const targetDate = new Date(year, month - 1);
  
  if (targetDate < startDate) return false;
  
  // Calculate months elapsed
  const monthsElapsed = (year - startYear) * 12 + (month - startMonth);
  
  return monthsElapsed < deduction.installments_total - deduction.installments_paid;
}

// Calculate net salary for a specific month
export function calculateNetSalary(
  baseAmount: number,
  components: IncomeComponent[],
  events: IncomeEvent[],
  deductions: SalaryDeduction[],
  targetMonth: number,
  targetYearMonth: string
): { 
  netAmount: number; 
  credits: number; 
  debits: number; 
  seasonalBonuses: number; 
  deductionsAmount: number;
  breakdown: { name: string; amount: number; type: 'credit' | 'debit' }[];
} {
  let credits = 0;
  let debits = 0;
  let seasonalBonuses = 0;
  let deductionsAmount = 0;
  const breakdown: { name: string; amount: number; type: 'credit' | 'debit' }[] = [];
  
  // Add base amount
  breakdown.push({ name: 'Salário Base', amount: baseAmount, type: 'credit' });
  
  // Process components
  for (const comp of components) {
    const months = getComponentMonths(comp);
    if (months.includes(targetMonth)) {
      if (comp.type === 'credit') {
        credits += Number(comp.amount);
        breakdown.push({ name: comp.name, amount: comp.amount, type: 'credit' });
      } else {
        debits += Number(comp.amount);
        breakdown.push({ name: comp.name, amount: comp.amount, type: 'debit' });
      }
    }
  }
  
  // Process seasonal events
  for (const event of events) {
    if (event.months.includes(targetMonth)) {
      seasonalBonuses += Number(event.amount);
      breakdown.push({ name: event.name, amount: event.amount, type: 'credit' });
    }
  }
  
  // Process deductions
  for (const deduction of deductions) {
    if (isDeductionActiveInMonth(deduction, targetYearMonth)) {
      deductionsAmount += Number(deduction.amount_monthly);
      breakdown.push({ name: deduction.description, amount: deduction.amount_monthly, type: 'debit' });
    }
  }
  
  const netAmount = baseAmount + credits - debits + seasonalBonuses - deductionsAmount;
  
  return { netAmount, credits, debits, seasonalBonuses, deductionsAmount, breakdown };
}

// Hooks

export function useIncomeComponents() {
  const { couple } = useAuth();
  
  return useQuery({
    queryKey: ['income-components', couple?.id],
    queryFn: async () => {
      if (!couple?.id) return [];
      const { data, error } = await supabase
        .from('income_components')
        .select('*')
        .eq('couple_id', couple.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as IncomeComponent[];
    },
    enabled: !!couple?.id
  });
}

export function useCreateIncomeComponent() {
  const { couple } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (component: Omit<IncomeComponent, 'id' | 'couple_id' | 'created_at'>) => {
      if (!couple?.id) throw new Error('No couple');
      const { data, error } = await supabase
        .from('income_components')
        .insert({ ...component, couple_id: couple.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-components'] });
      toast({ title: 'Componente adicionado!' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

export function useDeleteIncomeComponent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('income_components').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-components'] });
      toast({ title: 'Componente removido!' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

export function useIncomeEvents() {
  const { couple } = useAuth();
  
  return useQuery({
    queryKey: ['income-events', couple?.id],
    queryFn: async () => {
      if (!couple?.id) return [];
      const { data, error } = await supabase
        .from('income_events')
        .select('*')
        .eq('couple_id', couple.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as IncomeEvent[];
    },
    enabled: !!couple?.id
  });
}

export function useCreateIncomeEvent() {
  const { couple } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (event: Omit<IncomeEvent, 'id' | 'couple_id' | 'created_at'>) => {
      if (!couple?.id) throw new Error('No couple');
      const { data, error } = await supabase
        .from('income_events')
        .insert({ ...event, couple_id: couple.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-events'] });
      toast({ title: 'Evento sazonal adicionado!' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

export function useDeleteIncomeEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('income_events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-events'] });
      toast({ title: 'Evento removido!' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

export function useSalaryDeductions() {
  const { couple } = useAuth();
  
  return useQuery({
    queryKey: ['salary-deductions', couple?.id],
    queryFn: async () => {
      if (!couple?.id) return [];
      const { data, error } = await supabase
        .from('salary_deductions')
        .select('*')
        .eq('couple_id', couple.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SalaryDeduction[];
    },
    enabled: !!couple?.id
  });
}

export function useCreateSalaryDeduction() {
  const { couple } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (deduction: Omit<SalaryDeduction, 'id' | 'couple_id' | 'created_at' | 'end_month'>) => {
      if (!couple?.id) throw new Error('No couple');
      
      // Calculate end_month
      const [startYear, startMonth] = deduction.start_month.split('-').map(Number);
      const remainingInstallments = deduction.installments_total - deduction.installments_paid;
      const endDate = new Date(startYear, startMonth - 1 + remainingInstallments - 1);
      const end_month = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;
      
      const { data, error } = await supabase
        .from('salary_deductions')
        .insert({ ...deduction, couple_id: couple.id, end_month })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-deductions'] });
      toast({ title: 'Consignado adicionado!' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

export function useUpdateSalaryDeduction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SalaryDeduction> & { id: string }) => {
      const { data, error } = await supabase
        .from('salary_deductions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-deductions'] });
      toast({ title: 'Consignado atualizado!' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

export function useDeleteSalaryDeduction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('salary_deductions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-deductions'] });
      toast({ title: 'Consignado removido!' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

// Hook to get projected salary for a specific month
export function useProjectedSalary() {
  const { data: components = [] } = useIncomeComponents();
  const { data: events = [] } = useIncomeEvents();
  const { data: deductions = [] } = useSalaryDeductions();
  
  const getProjectedSalaryForMonth = (baseAmount: number, yearMonth: string) => {
    const month = parseInt(yearMonth.split('-')[1]);
    return calculateNetSalary(baseAmount, components, events, deductions, month, yearMonth);
  };
  
  return { getProjectedSalaryForMonth, components, events, deductions };
}
