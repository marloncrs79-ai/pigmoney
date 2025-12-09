import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, subDays, isSameDay, getDaysInMonth, getDate } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface Earning {
    id: string;
    amount: number;
    description: string;
    category: string;
    created_at: string;
}

export interface EarningsStats {
    totalMonth: number;
    dailyAverage: number;
    weeklyAverage: number; // Simplified for now
    projection: number;
    last7Days: { date: string; amount: number; fullDate: string }[];
}

export function useEarnings() {
    const queryClient = useQueryClient();

    // Fetch earnings for current month for stats
    const { data: currentMonthEarnings = [], isLoading } = useQuery({
        queryKey: ["earnings", "current-month"],
        queryFn: async () => {
            const start = startOfMonth(new Date()).toISOString();
            const end = endOfMonth(new Date()).toISOString();

            const { data, error } = await supabase
                .from("earnings" as any)
                .select("*")
                .gte("created_at", start)
                .lte("created_at", end)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as unknown as Earning[];
        },
    });

    // Fetch earnings for last 7 days chart
    const { data: last7DaysEarnings = [] } = useQuery({
        queryKey: ["earnings", "last-7-days"],
        queryFn: async () => {
            const start = subDays(new Date(), 6).toISOString(); // 6 days ago + today
            const { data, error } = await supabase
                .from("earnings" as any)
                .select("*")
                .gte("created_at", start)
                .order("created_at", { ascending: true });

            if (error) throw error;
            return data as unknown as Earning[];
        }
    });

    // Calculate Stats
    const calculateStats = (): EarningsStats => {
        const totalMonth = currentMonthEarnings.reduce((acc, curr) => acc + Number(curr.amount), 0);

        const today = new Date();
        const dayOfMonth = getDate(today);
        const dailyAverage = dayOfMonth > 0 ? totalMonth / dayOfMonth : 0;

        // Simple projection: avg * total days in month
        const daysInMonth = getDaysInMonth(today);
        const projection = dailyAverage * daysInMonth;

        // Weekly average (simplified: daily average * 7)
        const weeklyAverage = dailyAverage * 7;

        // Last 7 days chart data
        const last7DaysMap = new Map<string, number>();
        const interval = eachDayOfInterval({ start: subDays(today, 6), end: today });

        interval.forEach(date => {
            last7DaysMap.set(format(date, 'yyyy-MM-dd'), 0);
        });

        last7DaysEarnings.forEach(e => {
            const dateKey = format(new Date(e.created_at), 'yyyy-MM-dd');
            if (last7DaysMap.has(dateKey)) {
                last7DaysMap.set(dateKey, (last7DaysMap.get(dateKey) || 0) + Number(e.amount));
            }
        });

        const last7Days = Array.from(last7DaysMap.entries()).map(([key, value]) => {
            const dateObj = new Date(key + 'T00:00:00'); // simple parse
            return {
                date: format(dateObj, 'dd/MM', { locale: ptBR }),
                fullDate: key,
                amount: value
            };
        });

        return {
            totalMonth,
            dailyAverage,
            weeklyAverage,
            projection,
            last7Days
        };
    };

    const stats = calculateStats();

    // Mutation to add earning
    const addEarning = useMutation({
        mutationFn: async (newEarning: { amount: number; description?: string; category?: string }) => {
            const { data, error } = await supabase
                .from("earnings" as any)
                .insert([
                    {
                        amount: newEarning.amount,
                        description: newEarning.description,
                        category: newEarning.category,
                    },
                ])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["earnings"] });
        },
    });

    return {
        earnings: currentMonthEarnings,
        stats,
        isLoading,
        addEarning,
    };
}
