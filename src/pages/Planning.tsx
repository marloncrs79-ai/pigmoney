import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AIInsights } from '@/components/AIInsights';
import { useMonthlyProjection } from '@/hooks/useFinancialData';
import { formatCurrency, formatMonthYear, cn } from '@/lib/utils';
import { Calendar, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Planning() {
  const { projections, summary } = useMonthlyProjection();

  const getStatusIcon = (status: 'positive' | 'warning' | 'danger') => {
    switch (status) {
      case 'positive': return <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />;
      case 'danger': return <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-danger" />;
    }
  };

  const getStatusBg = (status: 'positive' | 'warning' | 'danger') => {
    switch (status) {
      case 'positive': return 'border-success/30 bg-success/5';
      case 'warning': return 'border-warning/30 bg-warning/5';
      case 'danger': return 'border-danger/30 bg-danger/5';
    }
  };

  // Count months by status
  const statusCounts = projections.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total projected savings
  const totalProjectedSavings = projections.reduce((sum, p) => sum + Math.max(0, p.balance), 0);

  return (
    <AppLayout>
      <PageHeader
        title="Planejamento"
        description="Projeção dos próximos 12 meses"
        learnMoreSection="planejamento"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-full bg-success/10 p-1.5 sm:p-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">{statusCounts.positive || 0}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Meses folgados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-full bg-warning/10 p-1.5 sm:p-2">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">{statusCounts.warning || 0}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Meses apertados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-full bg-danger/10 p-1.5 sm:p-2">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-danger" />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold">{statusCounts.danger || 0}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Meses críticos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-full bg-primary/10 p-1.5 sm:p-2">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base sm:text-2xl font-bold truncate">{formatCurrency(totalProjectedSavings)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Economia projetada</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Projections */}
      <div className="mt-4 sm:mt-6 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {projections.map((projection, index) => (
          <Card key={projection.month} className={cn('animate-fade-in', getStatusBg(projection.status))} style={{ animationDelay: `${index * 50}ms` }}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatMonthYear(projection.month)}
                </div>
                {getStatusIcon(projection.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Receita</span>
                  <span className="text-xs sm:text-sm font-medium text-success">+{formatCurrency(projection.income)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Despesas Fixas</span>
                  <span className="text-xs sm:text-sm font-medium">-{formatCurrency(projection.fixedExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Variáveis (est.)</span>
                  <span className="text-xs sm:text-sm font-medium">-{formatCurrency(projection.variableExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Fatura Cartão</span>
                  <span className="text-xs sm:text-sm font-medium">-{formatCurrency(projection.cardInvoice)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Saldo</span>
                    <span className={cn(
                      'text-base sm:text-lg font-bold',
                      projection.status === 'danger' ? 'text-danger' : 
                      projection.status === 'warning' ? 'text-warning' : 'text-success'
                    )}>
                      {formatCurrency(projection.balance)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <div className="mt-4 sm:mt-6">
        <AIInsights scope="planning" />
      </div>
    </AppLayout>
  );
}
