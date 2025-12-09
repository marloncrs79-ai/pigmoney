import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useMonthlyProjection, useFixedExpenses, useVariableExpenses, useIncome, usePiggyBanks } from '@/hooks/useFinancialData';
import { formatCurrency, formatMonthYear, getCurrentYearMonth, EXPENSE_CATEGORIES } from '@/lib/utils';
import { BarChart3, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(173, 58%, 39%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(262, 83%, 58%)'];

export default function Reports() {
  const { projections, summary } = useMonthlyProjection();
  const { data: fixedExpenses = [] } = useFixedExpenses();
  const { data: variableExpenses = [] } = useVariableExpenses();
  const { data: income = [] } = useIncome();
  const { data: piggyBanks = [] } = usePiggyBanks();
  const totalPiggyBankBalance = piggyBanks.reduce((sum, p) => sum + Number(p.current_balance), 0);

  const currentYear = new Date().getFullYear().toString();
  const yearIncome = income.filter(i => i.date.startsWith(currentYear)).reduce((sum, i) => sum + Number(i.net_amount), 0);
  const yearVariableExpenses = variableExpenses.filter(e => e.date && e.date.startsWith(currentYear)).reduce((sum, e) => sum + Number(e.amount), 0);
  const yearFixedExpenses = fixedExpenses.filter(e => e.is_active).reduce((sum, e) => sum + Number(e.amount), 0) * 12;

  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));
    return d.toISOString().slice(0, 7);
  });

  const monthlyComparison = last12Months.map(month => {
    const monthIncome = income.filter(i => i.date.startsWith(month)).reduce((sum, i) => sum + Number(i.net_amount), 0);
    const variableMonth = variableExpenses.filter(e => e.date && e.date.startsWith(month)).reduce((sum, e) => sum + Number(e.amount), 0);
    const fixedMonth = fixedExpenses.filter(e => e.is_active).reduce((sum, e) => sum + Number(e.amount), 0);
    return {
      month: formatMonthYear(month).split(' ')[0].slice(0, 3),
      receita: monthIncome,
      gastos: variableMonth + fixedMonth
    };
  });

  const yearCategoryData = EXPENSE_CATEGORIES.map(cat => {
    const variableSum = variableExpenses
      .filter(e => e.date && e.date.startsWith(currentYear) && e.category === cat)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const fixedSum = fixedExpenses
      .filter(e => e.is_active && e.category === cat)
      .reduce((sum, e) => sum + Number(e.amount), 0) * 12;

    return {
      name: cat,
      value: variableSum + fixedSum
    };
  }).filter(c => c.value > 0).sort((a, b) => b.value - a.value);

  const monthlyBalances = last12Months.map(month => {
    const monthIncome = income.filter(i => i.date.startsWith(month)).reduce((sum, i) => sum + Number(i.net_amount), 0);
    const monthExpenses = variableExpenses.filter(e => e.date && e.date.startsWith(month)).reduce((sum, e) => sum + Number(e.amount), 0);
    const fixedMonth = fixedExpenses.filter(e => e.is_active).reduce((sum, e) => sum + Number(e.amount), 0);
    return { month, balance: monthIncome - monthExpenses - fixedMonth };
  }).filter(m => m.balance !== 0);

  const bestMonth = monthlyBalances.length > 0 ? monthlyBalances.reduce((best, current) => current.balance > best.balance ? current : best) : null;
  const worstMonth = monthlyBalances.length > 0 ? monthlyBalances.reduce((worst, current) => current.balance < worst.balance ? current : worst) : null;

  return (
    <AppLayout>
      <PageHeader title="Relatórios" description={`Visão consolidada de ${currentYear}`} />

      {/* Annual Summary */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-3 sm:p-4"><div className="flex items-center gap-2 sm:gap-3"><div className="rounded-full bg-success/10 p-1.5 sm:p-2"><TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-success" /></div><div className="min-w-0"><p className="text-xs sm:text-sm text-muted-foreground">Receita Anual</p><p className="text-base sm:text-xl font-bold text-success truncate">{formatCurrency(yearIncome)}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-3 sm:p-4"><div className="flex items-center gap-2 sm:gap-3"><div className="rounded-full bg-danger/10 p-1.5 sm:p-2"><TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-danger" /></div><div className="min-w-0"><p className="text-xs sm:text-sm text-muted-foreground">Gastos Variáveis</p><p className="text-base sm:text-xl font-bold truncate">{formatCurrency(yearVariableExpenses)}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-3 sm:p-4"><div className="flex items-center gap-2 sm:gap-3"><div className="rounded-full bg-primary/10 p-1.5 sm:p-2"><BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /></div><div className="min-w-0"><p className="text-xs sm:text-sm text-muted-foreground">Fixas (anual)</p><p className="text-base sm:text-xl font-bold truncate">{formatCurrency(yearFixedExpenses)}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-3 sm:p-4"><div className="flex items-center gap-2 sm:gap-3"><div className="rounded-full bg-success/10 p-1.5 sm:p-2"><PiggyBank className="h-4 w-4 sm:h-5 sm:w-5 text-success" /></div><div className="min-w-0"><p className="text-xs sm:text-sm text-muted-foreground">Cofrinho</p><p className="text-base sm:text-xl font-bold text-success truncate">{formatCurrency(totalPiggyBankBalance)}</p></div></div></CardContent></Card>
      </div>

      {/* Charts Grid */}
      <div className="mt-4 sm:mt-6 grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Receita vs Gastos (12 meses)</CardTitle></CardHeader><CardContent><div className="h-52 sm:h-64 overflow-x-auto"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyComparison}><XAxis dataKey="month" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={45} /><Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px' }} /><Legend wrapperStyle={{ fontSize: '11px' }} /><Bar dataKey="receita" name="Receita" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} /><Bar dataKey="gastos" name="Gastos" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></CardContent></Card>

        <Card><CardHeader><CardTitle>Gastos por Categoria ({currentYear})</CardTitle></CardHeader><CardContent>{yearCategoryData.length > 0 ? (<div className="flex flex-col sm:flex-row items-center gap-4"><div className="h-36 w-36 sm:h-48 sm:w-48 flex-shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={yearCategoryData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={2} dataKey="value">{yearCategoryData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie></PieChart></ResponsiveContainer></div><div className="flex-1 space-y-2 w-full">{yearCategoryData.slice(0, 6).map((cat, i) => (<div key={cat.name} className="flex items-center justify-between text-xs sm:text-sm"><div className="flex items-center gap-2"><div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} /><span className="text-muted-foreground truncate">{cat.name}</span></div><span className="font-medium">{formatCurrency(cat.value)}</span></div>))}</div></div>) : (<div className="flex h-36 sm:h-48 items-center justify-center text-muted-foreground text-sm">Nenhum dado disponível</div>)}</CardContent></Card>
      </div>

      {/* Best/Worst Months */}
      <div className="mt-4 sm:mt-6 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
        {bestMonth && (<Card className="border-success/30 bg-success/5"><CardContent className="p-3 sm:p-4"><div className="flex items-center gap-3"><div className="rounded-full bg-success/10 p-2 sm:p-3"><TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-success" /></div><div><p className="text-xs sm:text-sm text-muted-foreground">Melhor Mês</p><p className="text-base sm:text-lg font-bold">{formatMonthYear(bestMonth.month)}</p><p className="text-success font-medium text-sm sm:text-base">+{formatCurrency(bestMonth.balance)}</p></div></div></CardContent></Card>)}
        {worstMonth && (<Card className="border-danger/30 bg-danger/5"><CardContent className="p-3 sm:p-4"><div className="flex items-center gap-3"><div className="rounded-full bg-danger/10 p-2 sm:p-3"><TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-danger" /></div><div><p className="text-xs sm:text-sm text-muted-foreground">Pior Mês</p><p className="text-base sm:text-lg font-bold">{formatMonthYear(worstMonth.month)}</p><p className={`font-medium text-sm sm:text-base ${worstMonth.balance < 0 ? 'text-danger' : ''}`}>{formatCurrency(worstMonth.balance)}</p></div></div></CardContent></Card>)}
      </div>

      {/* Projection Chart */}
      <Card className="mt-4 sm:mt-6"><CardHeader><CardTitle>Projeção dos Próximos Meses</CardTitle></CardHeader><CardContent><div className="h-52 sm:h-64 overflow-x-auto"><ResponsiveContainer width="100%" height="100%"><LineChart data={projections.map(p => ({ month: formatMonthYear(p.month).split(' ')[0].slice(0, 3), saldo: p.balance, receita: p.income, despesas: p.totalExpenses }))}><XAxis dataKey="month" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={45} /><Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px' }} /><Legend wrapperStyle={{ fontSize: '11px' }} /><Line type="monotone" dataKey="saldo" name="Saldo" stroke="hsl(221, 83%, 53%)" strokeWidth={2} dot={{ fill: 'hsl(221, 83%, 53%)' }} /><Line type="monotone" dataKey="receita" name="Receita" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ fill: 'hsl(142, 71%, 45%)' }} /><Line type="monotone" dataKey="despesas" name="Despesas" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={{ fill: 'hsl(0, 84%, 60%)' }} /></LineChart></ResponsiveContainer></div></CardContent></Card>


    </AppLayout>
  );
}
