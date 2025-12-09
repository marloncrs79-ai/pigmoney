import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { Loader2, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { AddEarningDialog } from '@/components/earnings/AddEarningDialog';

export default function IncomeHistory() {
    const [filter, setFilter] = useState<'day' | 'week' | 'month'>('month');
    const [date] = useState(new Date()); // Could allow date selection later

    // Determines date range based on filter
    const getRange = () => {
        switch (filter) {
            case 'day': return { start: format(date, "yyyy-MM-dd'T'00:00:00"), end: format(date, "yyyy-MM-dd'T'23:59:59") };
            case 'week':
                const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
                const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
                return { start: weekStart.toISOString(), end: weekEnd.toISOString() };
            case 'month':
                const monthStart = startOfMonth(date);
                const monthEnd = endOfMonth(date);
                return { start: monthStart.toISOString(), end: monthEnd.toISOString() };
            default: return { start: new Date().toISOString(), end: new Date().toISOString() };
        }
    };

    const { start, end } = getRange();

    const { data: earnings = [], isLoading } = useQuery({
        queryKey: ['earnings', filter, start, end],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('earnings' as any)
                .select('*')
                .gte('created_at', start)
                .lte('created_at', end)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as any[];
        }
    });

    const total = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
    const average = filter === 'day' ? total : total / (filter === 'week' ? 7 : new Date().getDate());

    return (
        <AppLayout>
            <PageHeader
                title="Histórico de Renda"
                description="Acompanhe seus ganhos em detalhes"
                action={<AddEarningDialog />}
            />

            <Tabs defaultValue="month" value={filter} onValueChange={(v: any) => setFilter(v)} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="day">Dia</TabsTrigger>
                    <TabsTrigger value="week">Semana</TabsTrigger>
                    <TabsTrigger value="month">Mês</TabsTrigger>
                </TabsList>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total do Período</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-500">{formatCurrency(total)}</div>
                        </CardContent>
                    </Card>
                    {filter !== 'day' && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Média Diária</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(average)}</div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Registros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                        ) : earnings.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Nenhum ganho registrado neste período.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {earnings.map((earning) => (
                                    <div key={earning.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                                        <div className="space-y-1">
                                            <p className="font-semibold text-base">{earning.description || 'Sem descrição'}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span className="capitalize px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                                                    {earning.category}
                                                </span>
                                                <span>•</span>
                                                <span>{format(parseISO(earning.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-emerald-500 text-lg">
                                                +{formatCurrency(Number(earning.amount))}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </Tabs>
        </AppLayout>
    );
}
