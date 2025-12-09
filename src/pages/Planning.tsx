import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from 'react';
import { useMonthlyProjection } from '@/hooks/useFinancialData';
import { formatCurrency, formatMonthYear, cn } from '@/lib/utils';
import {
  Calendar, TrendingUp, AlertTriangle, CheckCircle,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Wallet, Receipt, CreditCard, PiggyBank, Sparkles,
  Target
} from 'lucide-react';

type PeriodFilter = 'all' | 'current' | 'next6' | 'custom';

export default function Planning() {
  const { projections } = useMonthlyProjection();
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // Filter projections based on period
  const filteredProjections = useMemo(() => {
    switch (periodFilter) {
      case 'current':
        return projections.slice(0, 1);
      case 'next6':
        return projections.slice(0, 6);
      case 'custom':
        return projections.slice(selectedMonthIndex, selectedMonthIndex + 1);
      default:
        return projections;
    }
  }, [projections, periodFilter, selectedMonthIndex]);

  // Status counts and savings
  const stats = useMemo(() => {
    const counts = projections.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const totalSavings = projections.reduce((sum, p) => sum + Math.max(0, p.balance), 0);
    return { counts, totalSavings };
  }, [projections]);

  const toggleExpand = (month: string) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      if (next.has(month)) {
        next.delete(month);
      } else {
        next.add(month);
      }
      return next;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedMonthIndex > 0) {
      setSelectedMonthIndex(selectedMonthIndex - 1);
    } else if (direction === 'next' && selectedMonthIndex < projections.length - 1) {
      setSelectedMonthIndex(selectedMonthIndex + 1);
    }
  };

  const getStatusColor = (status: 'positive' | 'warning' | 'danger') => {
    switch (status) {
      case 'positive': return { bg: 'bg-emerald-500', light: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-200' };
      case 'warning': return { bg: 'bg-amber-500', light: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-200' };
      case 'danger': return { bg: 'bg-rose-500', light: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-200' };
    }
  };

  const getStatusLabel = (status: 'positive' | 'warning' | 'danger') => {
    switch (status) {
      case 'positive': return 'Folgado';
      case 'warning': return 'Apertado';
      case 'danger': return 'Crítico';
    }
  };

  return (
    <AppLayout>
      {/* Hero Header */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-teal-600 p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTZzLTItNC0yLTYgMi00IDItNi0yLTQtMi02bTAgMjRjMC0yIDItNCAyLTZzLTItNC0yLTYgMi00IDItNi0yLTQtMi02Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-5 w-5" />
            <span className="text-sm font-medium opacity-90">Visão de Futuro</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Planejamento Financeiro</h1>
          <p className="opacity-90 max-w-xl">
            Veja como sua vida financeira vai evoluir nos próximos meses.
          </p>
        </div>
        <Calendar className="absolute bottom-4 right-4 h-20 w-20 opacity-10" />
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Select value={periodFilter} onValueChange={(v: PeriodFilter) => setPeriodFilter(v)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Próximos 12 meses</SelectItem>
            <SelectItem value="current">Somente este mês</SelectItem>
            <SelectItem value="next6">Próximos 6 meses</SelectItem>
            <SelectItem value="custom">Escolher mês</SelectItem>
          </SelectContent>
        </Select>

        {periodFilter === 'custom' && projections.length > 0 && (
          <div className="flex items-center gap-2 bg-muted rounded-xl p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg"
              onClick={() => navigateMonth('prev')}
              disabled={selectedMonthIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center font-medium text-sm">
              {projections[selectedMonthIndex] && formatMonthYear(projections[selectedMonthIndex].month)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg"
              onClick={() => navigateMonth('next')}
              disabled={selectedMonthIndex === projections.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats.counts.positive || 0}</p>
                <p className="text-xs text-muted-foreground">Meses folgados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.counts.warning || 0}</p>
                <p className="text-xs text-muted-foreground">Meses apertados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-transparent dark:from-rose-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/20">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">{stats.counts.danger || 0}</p>
                <p className="text-xs text-muted-foreground">Meses críticos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xl font-bold text-primary truncate">{formatCurrency(stats.totalSavings)}</p>
                <p className="text-xs text-muted-foreground">Economia projetada</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Cards */}
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        Projeção Mensal
      </h2>

      <div className="space-y-4">
        {filteredProjections.map((projection, index) => {
          const colors = getStatusColor(projection.status);
          const isExpanded = expandedMonths.has(projection.month);

          return (
            <Card
              key={projection.month}
              className={cn(
                "overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group",
                colors.border,
                "border-2"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Main Row - Always Visible */}
              <div
                className={cn(
                  "p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 transition-colors",
                  "group-hover:bg-muted/30"
                )}
                onClick={() => toggleExpand(projection.month)}
              >
                {/* Month & Status */}
                <div className="flex items-center gap-4 flex-1">
                  <div className={cn(
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
                    colors.light
                  )}>
                    <Calendar className={cn("h-6 w-6", colors.text)} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{formatMonthYear(projection.month)}</h3>
                    <Badge
                      variant="secondary"
                      className={cn("mt-1", colors.light, colors.text, "hover:opacity-90")}
                    >
                      {getStatusLabel(projection.status)}
                    </Badge>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-6 md:gap-8 flex-1 md:flex-none">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Receita</p>
                    <p className="font-semibold text-emerald-600">+{formatCurrency(projection.income)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Despesas</p>
                    <p className="font-semibold text-rose-600">
                      -{formatCurrency(projection.fixedExpenses + projection.variableExpenses)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Saldo</p>
                    <p className={cn("font-bold text-lg", colors.text)}>
                      {formatCurrency(projection.balance)}
                    </p>
                  </div>
                </div>

                {/* Expand Toggle */}
                <Button variant="ghost" size="icon" className="shrink-0 h-10 w-10 rounded-xl ml-auto md:ml-0">
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className={cn("border-t px-4 md:px-5 py-4", colors.light)}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
                      <Wallet className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Receita</p>
                        <p className="font-medium text-emerald-600">+{formatCurrency(projection.income)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
                      <Receipt className="h-5 w-5 text-rose-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Despesas Fixas</p>
                        <p className="font-medium">-{formatCurrency(projection.fixedExpenses)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
                      <PiggyBank className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Variáveis (est.)</p>
                        <p className="font-medium">-{formatCurrency(projection.variableExpenses)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
                      <CreditCard className="h-5 w-5 text-violet-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Fatura Cartão</p>
                        <p className="font-medium">-{formatCurrency(projection.cardInvoice)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Balance Summary */}
                  <div className={cn(
                    "mt-4 p-4 rounded-xl flex items-center justify-between",
                    colors.light
                  )}>
                    <div className="flex items-center gap-3">
                      <Sparkles className={cn("h-5 w-5", colors.text)} />
                      <span className="font-medium">Saldo do mês</span>
                    </div>
                    <span className={cn("text-xl font-bold", colors.text)}>
                      {formatCurrency(projection.balance)}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProjections.length === 0 && (
        <Card className="py-12 text-center">
          <CardContent>
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhuma projeção disponível</h3>
            <p className="text-muted-foreground text-sm">
              Cadastre suas receitas e despesas para ver as projeções.
            </p>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
