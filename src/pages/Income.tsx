import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useIncome, useDeleteIncome
} from '@/hooks/useFinancialData';
import {
  useIncomeComponents, useIncomeEvents, useSalaryDeductions, calculateNetSalary
} from '@/hooks/useIncomeData';
import { useEarnings } from '@/hooks/useEarnings';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatMonthYear } from '@/lib/utils';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import {
  Plus, Wallet, TrendingUp, Gift, CreditCard, Minus,
  CalendarDays, LineChart as LucideLineChart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { SalaryWizard } from '@/components/salary/SalaryWizard';
import { SalaryOverview } from '@/components/salary/SalaryOverview';
import { AddEarningDialog } from '@/components/earnings/AddEarningDialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { VariableIncomeList } from '@/components/income/VariableIncomeList';

const EARNINGS_COLOR = 'hsl(142, 71%, 45%)';

export default function Income() {
  // --- Data Hooks ---
  const { data: income = [], isLoading: isLoadingFixed } = useIncome();
  const { stats: earningsStats, isLoading: isLoadingEarnings } = useEarnings(); // For summary stats
  const [mode, setMode] = useState<'variable' | 'fixed' | 'empty'>('empty');
  const [filter, setFilter] = useState<'day' | 'week' | 'month'>('month');
  const [date] = useState(new Date());

  // Check data presence for auto-mode
  const hasFixedIncome = income.length > 0;

  const { data: hasAnyEarnings } = useQuery({
    queryKey: ['has-any-earnings'],
    queryFn: async () => {
      const { count } = await supabase.from('earnings' as any).select('*', { count: 'exact', head: true });
      return count ? count > 0 : false;
    }
  });

  // Mode Auto-Detection
  useEffect(() => {
    if (hasAnyEarnings) {
      setMode('variable');
    } else if (hasFixedIncome) {
      setMode('fixed');
    } else {
      setMode('empty');
    }
  }, [hasAnyEarnings, hasFixedIncome]);

  // --- Fixed Income Logic ---
  const { data: components = [] } = useIncomeComponents();
  const { data: events = [] } = useIncomeEvents();
  const { data: deductions = [] } = useSalaryDeductions();
  const [wizardOpen, setWizardOpen] = useState(false);

  const baseAmount = income.find(i => i.type === 'salary' && Number(i.base_amount) > 0)?.base_amount || 0;

  // Fixed Income Charts/Data...
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));
    return d.toISOString().slice(0, 7);
  });

  const fixedChartData = last12Months.map(month => {
    const monthNum = parseInt(month.split('-')[1]);
    const actual = income.filter(i => i.date.startsWith(month)).reduce((sum, i) => sum + Number(i.net_amount), 0);
    const projected = Number(baseAmount) > 0 ? calculateNetSalary(Number(baseAmount), components, events, deductions, monthNum, month).netAmount : 0;
    return { month: formatMonthYear(month).split(' ')[0].slice(0, 3), real: actual, projetado: actual > 0 ? actual : projected };
  });

  // --- Variable Income Logic (History/Filters) ---
  const getRange = () => {
    switch (filter) {
      case 'day': return { start: format(date, "yyyy-MM-dd'T'00:00:00"), end: format(date, "yyyy-MM-dd'T'23:59:59") };
      case 'week': {
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
        return { start: weekStart.toISOString(), end: weekEnd.toISOString() };
      }
      case 'month': {
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        return { start: monthStart.toISOString(), end: monthEnd.toISOString() };
      }
      default: return { start: new Date().toISOString(), end: new Date().toISOString() };
    }
  };
  const { start, end } = getRange();

  const { data: filteredEarnings = [], isLoading: isLoadingFiltered } = useQuery({
    queryKey: ['earnings', filter, start, end],
    queryFn: async () => {
      const { data, error } = await supabase.from('earnings' as any).select('*').gte('created_at', start).lte('created_at', end).order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    }
  });

  const filteredTotal = filteredEarnings.reduce((sum, e) => sum + Number(e.amount), 0);
  const filteredAverage = filter === 'day' ? filteredTotal : filteredTotal / (filter === 'week' ? 7 : new Date().getDate());

  if (isLoadingFixed && isLoadingEarnings) {
    return (
      <AppLayout>
        <PageSkeleton variant="dashboard" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Receitas"
        description="Gestão Inteligente de Ganhos"
        learnMoreSection="receitas"
      />

      {/* --- ADAPTIVE HEADER & ACTIONS --- */}
      <div className="mb-6 space-y-6">

        {/* Mode: Variable Income */}
        {mode === 'variable' && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-mobile relative overflow-hidden">
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex gap-4 items-start">
                <div className="text-4xl shrink-0">🐷</div>
                <div className="space-y-1">
                  <h3 className="font-bold text-emerald-800 text-lg">Você não tem salário fixo? Sem problema!</h3>
                  <p className="text-emerald-700 leading-relaxed text-sm sm:text-base">
                    Use o botão <strong>Cadastrar Ganho</strong> sempre que receber alguma grana.<br className="hidden sm:inline" />
                    O PigMoney faz toda a mágica por você.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:pl-[3.5rem] mt-2">
                <AddEarningDialog trigger={
                  <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 rounded-full text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 active:scale-95 transition-transform">
                    <Plus className="mr-2 h-5 w-5" /> Cadastrar Ganho
                  </Button>
                } />
                <Button variant="outline" onClick={() => { setMode('fixed'); setWizardOpen(true); }} className="w-full sm:w-auto h-12 sm:h-14 rounded-full text-base font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
                  Gerenciar Salário
                </Button>
              </div>
            </div>
            {/* Decorative */}
            <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
              <TrendingUp className="h-32 w-32 sm:h-48 sm:w-48 text-emerald-600" />
            </div>
          </div>
        )}

        {/* Mode: Fixed Salary */}
        {mode === 'fixed' && (
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-mobile relative overflow-hidden">
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex gap-4 items-start">
                <div className="text-4xl shrink-0">🐷</div>
                <div className="space-y-1">
                  <h3 className="font-bold text-primary text-lg">Você recebe salário fixo? Maravilha!</h3>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:pl-[3.5rem] mt-2">
                <Button size="lg" onClick={() => setWizardOpen(true)} className="w-full sm:w-auto h-12 sm:h-14 rounded-full text-base font-bold shadow-lg shadow-primary/20 btn-mobile">
                  <Wallet className="mr-2 h-5 w-5" /> Gerenciar Salário
                </Button>
                <AddEarningDialog trigger={
                  <Button variant="outline" className="w-full sm:w-auto h-12 sm:h-14 rounded-full text-base font-bold bg-white/50 border-primary/20 hover:bg-white hover:border-primary/40 btn-mobile">
                    Registrar Ganhos Variáveis
                  </Button>
                } />
              </div>
            </div>
            {/* Decorative */}
            <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
              <Wallet className="h-32 w-32 sm:h-48 sm:w-48" />
            </div>
          </div>
        )}

        {/* Mode: Empty / First Access */}
        {mode === 'empty' && (
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-8 text-center space-y-6">
            <div className="text-6xl mb-4 animate-bounce">🐷</div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Bem-vindo ao seu cofre digital!
              </h2>
              <p className="text-lg text-muted-foreground">
                Como você recebe seus ganhos?
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
              <Button size="lg" onClick={() => { setMode('fixed'); setWizardOpen(true); }} className="w-full h-14 rounded-full text-base font-bold btn-mobile">
                <Wallet className="mr-2 h-5 w-5" /> Registrar Salário Fixo
              </Button>
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-muted-foreground/20"></div>
                <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">ou</span>
                <div className="flex-grow border-t border-muted-foreground/20"></div>
              </div>
              <AddEarningDialog trigger={
                <Button size="lg" variant="outline" className="w-full h-14 rounded-full text-base font-bold border-emerald-500 text-emerald-600 hover:bg-emerald-50 btn-mobile">
                  <TrendingUp className="mr-2 h-5 w-5" /> Cadastrar Ganhos Variáveis
                </Button>
              } />
            </div>
          </div>
        )}

      </div>

      {/* --- VARIABLE INCOME MODE --- */}
      {mode === 'variable' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Stats Grid */}
          <div className="grid-mobile-2 gap-mobile">
            <StatCard
              title="Ganho Total (Mês)"
              value={earningsStats.totalMonth}
              icon={TrendingUp} variant="success"
              className="bg-emerald-500/10 border-emerald-500/20"
            />
            <StatCard
              title="Média Diária"
              value={earningsStats.dailyAverage}
              icon={CalendarDays}
              variant="info"
            />
            <StatCard
              title="Projeção Mensal"
              value={earningsStats.projection}
              subtitle="Estimativa baseada na média"
              icon={LucideLineChart}
              variant="accent"
            />
          </div>

          {/* Last 7 Days Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">Evolução - Últimos 7 Dias</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 pb-4">
              <div className="h-48 sm:h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={earningsStats.last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={EARNINGS_COLOR} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={EARNINGS_COLOR} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `R$${val}`} width={40} tickLine={false} axisLine={false} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `Dia ${label}`}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="amount" stroke={EARNINGS_COLOR} strokeWidth={2} fillOpacity={1} fill="url(#colorEarnings)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* History & Filters */}
          <Card>
            <CardHeader className="pb-2 px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-lg">Histórico Detalhado</CardTitle>
                <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="w-full sm:w-auto">
                  <TabsList className="grid w-full grid-cols-3 sm:w-[300px]">
                    <TabsTrigger value="day">Dia</TabsTrigger>
                    <TabsTrigger value="week">Semana</TabsTrigger>
                    <TabsTrigger value="month">Mês</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="flex items-center gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total do Período</p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-600">{formatCurrency(filteredTotal)}</p>
                </div>
                {filter !== 'day' && (
                  <div className="pl-4 border-l border-border">
                    <p className="text-xs sm:text-sm text-muted-foreground">Média Diária</p>
                    <p className="text-lg sm:text-xl font-semibold">{formatCurrency(filteredAverage)}</p>
                  </div>
                )}
              </div>

              {isLoadingFiltered ? (
                <PageSkeleton variant="list" />
              ) : (
                <VariableIncomeList earnings={filteredEarnings} />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- FIXED INCOME MODE --- */}
      {mode === 'fixed' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SalaryOverview
            baseAmount={Number(baseAmount)}
            onConfigureSalary={() => setWizardOpen(true)}
            onEditSalary={() => setWizardOpen(true)}
          />

          <div className="grid-mobile-2 lg:grid-cols-4 gap-mobile">
            <StatCard title="Salário Base" value={Number(baseAmount)} icon={Wallet} variant="success" />
            <StatCard title="Componentes" value={components.length} subtitle={`${components.filter(c => c.type === 'credit').length} créditos, ${components.filter(c => c.type === 'debit').length} débitos`} icon={TrendingUp} isCurrency={false} />
            <StatCard title="Eventos Sazonais" value={events.length} icon={Gift} isCurrency={false} />
            <StatCard title="Consignados" value={deductions.length} icon={CreditCard} isCurrency={false} />
          </div>

          {/* Composição Salarial Simplificada */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><TrendingUp className="h-5 w-5" /> Composição do Salário</CardTitle>
            </CardHeader>
            <CardContent>
              {components.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">Nenhum componente adicional configurado.</div>
              ) : (
                <div className="space-y-2">
                  {components.map(c => (
                    <div key={c.id} className="flex justify-between items-center text-sm p-3 rounded-lg bg-muted/30 border hover:bg-muted/50 transition-colors">
                      <span className="flex items-center gap-2 font-medium">
                        {c.type === 'credit' ? <Plus className="h-3 w-3 text-emerald-500" /> : <Minus className="h-3 w-3 text-red-500" />}
                        {c.name}
                      </span>
                      <span className={`font-semibold ${c.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {c.type === 'credit' ? '+' : '-'}{formatCurrency(c.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" className="w-full mt-4 btn-mobile" onClick={() => setWizardOpen(true)}>Gerenciar Detalhes</Button>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader><CardTitle>Projeção Anual</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fixedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} width={40} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Line type="monotone" dataKey="projetado" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Shared Salary Wizard */}
      <SalaryWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        existingBaseAmount={Number(baseAmount)}
      />
    </AppLayout>
  );
}
