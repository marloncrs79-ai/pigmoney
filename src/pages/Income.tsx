import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIncome, useDeleteIncome } from '@/hooks/useFinancialData';
import { 
  useIncomeComponents, useDeleteIncomeComponent,
  useIncomeEvents, useDeleteIncomeEvent,
  useSalaryDeductions, useDeleteSalaryDeduction,
  calculateNetSalary
} from '@/hooks/useIncomeData';
import { formatCurrency, formatDate, formatMonthYear, INCOME_TYPES, getCurrentYearMonth } from '@/lib/utils';
import { Plus, Wallet, Trash2, TrendingUp, Gift, CreditCard, Minus, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { SalaryWizard } from '@/components/salary/SalaryWizard';
import { SalaryOverview } from '@/components/salary/SalaryOverview';

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function Income() {
  const { data: income = [], isLoading } = useIncome();
  const deleteIncome = useDeleteIncome();
  
  const { data: components = [] } = useIncomeComponents();
  const deleteComponent = useDeleteIncomeComponent();
  
  const { data: events = [] } = useIncomeEvents();
  const deleteEvent = useDeleteIncomeEvent();
  
  const { data: deductions = [] } = useSalaryDeductions();
  const deleteDeduction = useDeleteSalaryDeduction();
  
  const [wizardOpen, setWizardOpen] = useState(false);

  // Calculate current month totals
  const currentMonth = getCurrentYearMonth();
  const currentMonthNum = parseInt(currentMonth.split('-')[1]);
  
  // Get the latest salary base amount
  const latestSalary = income.find(i => i.type === 'salary' && Number(i.base_amount) > 0);
  const baseAmount = latestSalary ? Number(latestSalary.base_amount) : 0;
  
  // Calculate projected salary for current month
  const projectedSalary = useMemo(() => {
    if (baseAmount === 0) return null;
    return calculateNetSalary(baseAmount, components, events, deductions, currentMonthNum, currentMonth);
  }, [baseAmount, components, events, deductions, currentMonthNum, currentMonth]);

  // Active deductions count
  const activeDeductionsCount = deductions.filter(d => {
    const [y, m] = currentMonth.split('-').map(Number);
    const [sy, sm] = d.start_month.split('-').map(Number);
    const elapsed = (y - sy) * 12 + (m - sm);
    return elapsed >= 0 && elapsed < d.installments_total - d.installments_paid;
  }).length;

  // Chart data for last 12 months
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));
    return d.toISOString().slice(0, 7);
  });
  
  const chartData = last12Months.map(month => {
    const monthNum = parseInt(month.split('-')[1]);
    const actual = income
      .filter(i => i.date.startsWith(month))
      .reduce((sum, i) => sum + Number(i.net_amount), 0);
    
    const projected = baseAmount > 0 
      ? calculateNetSalary(baseAmount, components, events, deductions, monthNum, month).netAmount
      : 0;
    
    return {
      month: formatMonthYear(month).split(' ')[0].slice(0, 3),
      real: actual,
      projetado: actual > 0 ? actual : projected
    };
  });

  const handleDelete = async (id: string) => {
    if (confirm('Excluir esta receita?')) {
      await deleteIncome.mutateAsync(id);
    }
  };

  const totalCredits = components.filter(c => c.type === 'credit').reduce((sum, c) => sum + Number(c.amount), 0);
  const totalDebits = components.filter(c => c.type === 'debit').reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <AppLayout>
      <PageHeader
        title="Receitas"
        description="Composição salarial e outras entradas"
        learnMoreSection="receitas"
      />

      {/* Salary Overview */}
      <SalaryOverview 
        baseAmount={baseAmount}
        onConfigureSalary={() => setWizardOpen(true)}
        onEditSalary={() => setWizardOpen(true)}
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
        <StatCard
          title="Salário Base"
          value={baseAmount}
          icon={Wallet}
          variant="success"
        />
        <StatCard
          title="Componentes"
          value={components.length}
          subtitle={`${components.filter(c => c.type === 'credit').length} créditos, ${components.filter(c => c.type === 'debit').length} débitos`}
          icon={TrendingUp}
          isCurrency={false}
        />
        <StatCard
          title="Eventos Sazonais"
          value={events.length}
          icon={Gift}
          isCurrency={false}
        />
        <StatCard
          title="Consignados Ativos"
          value={activeDeductionsCount}
          icon={CreditCard}
          isCurrency={false}
        />
      </div>

      {/* Composição Salarial - All in one view */}
      <div className="grid gap-6 mt-6 lg:grid-cols-3">
        {/* Components Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Componentes
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setWizardOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {components.length > 0 && (
              <div className="flex gap-3 text-sm">
                <span className="text-success">+{formatCurrency(totalCredits)}</span>
                <span className="text-danger">-{formatCurrency(totalDebits)}</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            {components.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum componente configurado
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {components.slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-center justify-between py-1.5 group">
                    <div className="flex items-center gap-2">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${c.type === 'credit' ? 'bg-success/10' : 'bg-danger/10'}`}>
                        {c.type === 'credit' ? (
                          <Plus className="h-3 w-3 text-success" />
                        ) : (
                          <Minus className="h-3 w-3 text-danger" />
                        )}
                      </div>
                      <span className="text-sm">{c.name}</span>
                    </div>
                    <span className={`text-sm font-medium ${c.type === 'credit' ? 'text-success' : 'text-danger'}`}>
                      {c.type === 'credit' ? '+' : '-'}{formatCurrency(c.amount)}
                    </span>
                  </div>
                ))}
                {components.length > 5 && (
                  <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setWizardOpen(true)}>
                    Ver todos ({components.length})
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seasonal Events Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Gift className="h-4 w-4 text-accent" />
                Eventos Sazonais
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setWizardOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum evento configurado
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {events.map(e => (
                  <div key={e.id} className="flex items-center justify-between py-1.5">
                    <div>
                      <span className="text-sm">{e.name}</span>
                      <p className="text-xs text-muted-foreground">
                        {e.months.map(m => MONTH_NAMES[m - 1]).join(', ')}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-success">+{formatCurrency(e.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deductions Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-danger" />
                Consignados
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setWizardOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {deductions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum consignado ativo
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {deductions.map(d => {
                  const remaining = d.installments_total - d.installments_paid;
                  return (
                    <div key={d.id} className="flex items-center justify-between py-1.5">
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{d.description}</span>
                          {remaining <= 3 && (
                            <Badge variant="secondary" className="text-[10px] bg-warning/20 text-warning px-1">
                              <AlertCircle className="h-2 w-2 mr-0.5" />
                              Fim
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {d.installments_paid}/{d.installments_total} parcelas
                        </p>
                      </div>
                      <span className="text-sm font-medium text-danger">-{formatCurrency(d.amount_monthly)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Income History */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Histórico de Receitas</CardTitle>
            <CardDescription>Salários e outras entradas registradas</CardDescription>
          </div>
          <Button onClick={() => setWizardOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            {baseAmount > 0 ? 'Editar Salário' : 'Configurar Salário'}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : income.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="Nenhuma receita cadastrada"
              description="Configure seu salário completo para começar a acompanhar suas receitas."
              action={
                <Button onClick={() => setWizardOpen(true)}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Configurar Salário Completo
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {income.slice(0, 5).map(i => (
                <div key={i.id} className="flex items-center justify-between rounded-2xl border p-4 hover:shadow-md transition-all">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{i.source}</p>
                      {(i as any).is_salary_revision && (
                        <Badge variant="secondary" className="text-xs">Revisão</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {INCOME_TYPES[i.type as keyof typeof INCOME_TYPES]} · {formatDate(i.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-success">{formatCurrency(i.net_amount)}</p>
                      {Number(i.gross_amount) !== Number(i.net_amount) && (
                        <p className="text-xs text-muted-foreground">Bruto: {formatCurrency(i.gross_amount)}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(i.id)}>
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart */}
      {income.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Evolução da Renda</CardTitle>
            <CardDescription>Últimos 12 meses de receitas registradas e projetadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis 
                    tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} 
                    tickLine={false} 
                    axisLine={false}
                    width={60}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="projetado" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Salary Wizard */}
      <SalaryWizard 
        open={wizardOpen} 
        onOpenChange={setWizardOpen}
        existingBaseAmount={baseAmount}
      />
    </AppLayout>
  );
}
