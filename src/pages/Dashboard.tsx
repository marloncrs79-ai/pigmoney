import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMonthlyProjection, useFixedExpenses, useVariableExpenses, useCreditCards, useCardTransactions } from '@/hooks/useFinancialData';
import { useEarnings } from '@/hooks/useEarnings';
import { formatCurrency, formatMonthYear, getCurrentYearMonth, EXPENSE_CATEGORIES } from '@/lib/utils';
import { Wallet, Receipt, CreditCard, PiggyBank, TrendingUp, AlertTriangle, BadgeDollarSign, CalendarDays, LineChart, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, AreaChart, Area } from 'recharts';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(173, 58%, 39%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(262, 83%, 58%)'];
const EARNINGS_COLOR = 'hsl(142, 71%, 45%)';

export default function Dashboard() {
  const { projections, summary, isLoading } = useMonthlyProjection();
  const { data: fixedExpenses = [] } = useFixedExpenses();
  const { data: variableExpenses = [] } = useVariableExpenses();
  const { data: cards = [] } = useCreditCards();
  const { stats: earningsStats, isLoading: statsLoading } = useEarnings();
  const { data: cardTransactions = [] } = useCardTransactions();

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);

  const currentMonth = getCurrentYearMonth();
  const selectedProjection = projections[selectedMonthIndex];
  const nextProjection = projections[selectedMonthIndex + 1];

  // Category breakdown for current month (fixed + variable)
  const currentMonthVariableExpenses = variableExpenses.filter(e => e.date && e.date.startsWith(currentMonth));
  const activeFixedExpenses = fixedExpenses.filter(e => e.is_active);

  const categoryData = EXPENSE_CATEGORIES.map(cat => {
    const variableTotal = currentMonthVariableExpenses
      .filter(e => e.category === cat)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const fixedTotal = activeFixedExpenses
      .filter(e => e.category === cat)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return {
      name: cat,
      value: variableTotal + fixedTotal
    };
  }).filter(c => c.value > 0);

  // Next 6 months chart data
  const chartData = projections.slice(0, 6).map(p => ({
    name: formatMonthYear(p.month).split(' ')[0].slice(0, 3),
    Receita: p.income,
    Despesas: p.totalExpenses,
    Saldo: p.balance
  }));

  if (isLoading) {
    return (
      <AppLayout>
        <PageSkeleton variant="dashboard" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        description={`Visão geral de ${formatMonthYear(currentMonth)}`}
        learnMoreSection="dashboard"
      />

      {/* Primary Stats Grid */}
      <div className="grid-mobile-2 gap-mobile mb-6">
        <StatCard
          title="Receita Mensal"
          value={summary.monthlyIncome + earningsStats.totalMonth}
          subtitle={`Fixo: ${formatCurrency(summary.monthlyIncome)} | Var: ${formatCurrency(earningsStats.totalMonth)}`}
          icon={Wallet}
          variant="success"
        />
        <StatCard
          title="Despesas Fixas"
          value={summary.totalFixedExpenses}
          subtitle={`${fixedExpenses.filter(e => e.is_active).length} ativas`}
          icon={Receipt}
        />
        <StatCard
          title="Fatura do Mês"
          value={projections[0]?.cardInvoice || 0}
          subtitle={`${cards.length} cartões`}
          icon={CreditCard}
          variant={(projections[0]?.cardInvoice || 0) > summary.monthlyIncome * 0.3 ? 'warning' : 'default'}
        />
        <StatCard
          title="Cofrinho"
          value={summary.piggyBankBalance}
          icon={PiggyBank}
          variant="success"
        />
      </div>

      {/* Variable Income Summary (Simplified) */}
      {earningsStats.totalMonth > 0 && (
        <div className="mb-6">
          <Link to="/income" className="block">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between hover:bg-emerald-500/15 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <BadgeDollarSign className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-emerald-600 font-medium">Renda Variável do Mês</p>
                  <p className="text-2xl font-bold text-emerald-700">{formatCurrency(earningsStats.totalMonth)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium group-hover:translate-x-1 transition-transform">
                Ver detalhes <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Balance Projection */}
      <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-mobile">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Saldo Previsto
            </CardTitle>
            <Select value={String(selectedMonthIndex)} onValueChange={(v) => setSelectedMonthIndex(Number(v))}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projections.map((p, i) => (
                  <SelectItem key={p.month} value={String(i)}>
                    {formatMonthYear(p.month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between rounded-xl sm:rounded-2xl bg-secondary/50 p-3 sm:p-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{formatMonthYear(selectedProjection?.month || currentMonth)}</p>
                  <p className={`text-xl sm:text-2xl font-bold ${selectedProjection?.status === 'danger' ? 'text-danger' : selectedProjection?.status === 'warning' ? 'text-warning' : 'text-success'}`}>
                    {formatCurrency(selectedProjection?.balance || 0)}
                  </p>
                </div>
                {selectedProjection?.status !== 'positive' && (
                  <AlertTriangle className={`h-6 w-6 sm:h-8 sm:w-8 ${selectedProjection?.status === 'danger' ? 'text-danger' : 'text-warning'}`} />
                )}
              </div>

              {nextProjection && (
                <div className="flex items-center justify-between rounded-xl sm:rounded-2xl bg-muted/50 p-3 sm:p-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{formatMonthYear(nextProjection.month)}</p>
                    <p className="text-lg sm:text-xl font-semibold">{formatCurrency(nextProjection.balance)}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receita</span>
                  <span className="text-success">{formatCurrency(selectedProjection?.income || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Despesas Fixas</span>
                  <span>{formatCurrency(selectedProjection?.fixedExpenses || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Variáveis (est.)</span>
                  <span>{formatCurrency(selectedProjection?.variableExpenses || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fatura Cartão</span>
                  <span>{formatCurrency(selectedProjection?.cardInvoice || 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Para Onde Foi o Dinheiro</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="h-48 w-full sm:w-48 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2 w-full">
                  {categoryData.slice(0, 5).map((cat, i) => (
                    <div key={cat.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-muted-foreground truncate">{cat.name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-40 sm:h-48 items-center justify-center text-muted-foreground text-sm sm:text-base">
                Nenhum gasto registrado este mês
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 6 Month Projection Chart */}
      <Card className="mt-4 sm:mt-6">
        <CardHeader>
          <CardTitle>Projeção dos Próximos 6 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={50} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Receita" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Despesas" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}

    </AppLayout>
  );
}
