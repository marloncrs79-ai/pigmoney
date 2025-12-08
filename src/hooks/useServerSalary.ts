import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

interface UseServerSalaryParams {
  year: number;
  month: number;
  enabled?: boolean;
}

export function useServerSalary({ year, month, enabled = true }: UseServerSalaryParams) {
  const { couple } = useAuth();

  return useQuery({
    queryKey: ['server-salary', couple?.id, year, month],
    queryFn: async (): Promise<SalaryBreakdown> => {
      console.log(`Fetching server salary for ${year}-${month}`);
      
      const { data, error } = await supabase.functions.invoke('calculate-net-salary', {
        body: { year, month, months: 1 }
      });

      if (error) {
        console.error('Error fetching server salary:', error);
        throw error;
      }

      if (data?.error) {
        console.error('Server returned error:', data.error);
        throw new Error(data.error);
      }

      return data as SalaryBreakdown;
    },
    enabled: enabled && !!couple?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });
}

// Hook to get salary for the current month
export function useCurrentMonthSalary() {
  const now = new Date();
  return useServerSalary({
    year: now.getFullYear(),
    month: now.getMonth() + 1
  });
}

// Hook to get projected salaries for multiple months (single API call)
export function useProjectedSalaries(monthsAhead: number = 12) {
  const { couple } = useAuth();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return useQuery({
    queryKey: ['projected-salaries', couple?.id, year, month, monthsAhead],
    queryFn: async (): Promise<MonthlyProjection[]> => {
      console.log(`Fetching ${monthsAhead} months projection starting from ${year}-${month}`);
      
      const { data, error } = await supabase.functions.invoke('calculate-net-salary', {
        body: { year, month, months: monthsAhead }
      });

      if (error) {
        console.error('Error fetching salary projection:', error);
        throw error;
      }

      if (data?.error) {
        console.error('Server returned error:', data.error);
        throw new Error(data.error);
      }

      return data.projection as MonthlyProjection[];
    },
    enabled: !!couple?.id,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1
  });
}

// Alias for 12 months projection
export function useProjectedSalaries12Months() {
  return useProjectedSalaries(12);
}
