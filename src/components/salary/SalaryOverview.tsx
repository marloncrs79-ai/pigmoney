import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatMonthYear, getCurrentYearMonth } from '@/lib/utils';
import { 
  Wallet, 
  Calculator, 
  TrendingUp, 
  TrendingDown,
  Settings, 
  Plus,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { 
  calculateNetSalary,
  useIncomeComponents,
  useIncomeEvents,
  useSalaryDeductions
} from '@/hooks/useIncomeData';

interface SalaryOverviewProps {
  baseAmount: number;
  onConfigureSalary: () => void;
  onEditSalary: () => void;
}

export function SalaryOverview({ baseAmount, onConfigureSalary, onEditSalary }: SalaryOverviewProps) {
  const { data: components = [] } = useIncomeComponents();
  const { data: events = [] } = useIncomeEvents();
  const { data: deductions = [] } = useSalaryDeductions();

  const currentMonth = getCurrentYearMonth();
  const currentMonthNum = parseInt(currentMonth.split('-')[1]);

  // No salary configured
  if (!baseAmount || baseAmount === 0) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-8 text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Configure seu salário</h3>
            <p className="text-muted-foreground mt-1">
              Registre seu salário completo em poucos passos e tenha projeções automáticas.
            </p>
          </div>
          <Button size="lg" onClick={onConfigureSalary} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Configurar Salário Completo
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Calculate current month salary
  const salaryBreakdown = calculateNetSalary(
    baseAmount, 
    components, 
    events, 
    deductions, 
    currentMonthNum, 
    currentMonth
  );

  const totalAdditions = salaryBreakdown.credits + salaryBreakdown.seasonalBonuses;
  const totalDeductions = salaryBreakdown.debits + salaryBreakdown.deductionsAmount;

  return (
    <Card className="bg-gradient-to-br from-success/5 via-success/10 to-primary/5 border-success/20 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
              <Calculator className="h-6 w-6 text-success" />
            </div>
            <div>
              <CardTitle className="text-lg">Salário Projetado</CardTitle>
              <CardDescription>{formatMonthYear(currentMonth)}</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onEditSalary} className="gap-1">
            <Settings className="h-4 w-4" />
            Editar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Amount */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Líquido Estimado</p>
          <p className="text-4xl font-bold text-success">{formatCurrency(salaryBreakdown.netAmount)}</p>
        </div>

        {/* Breakdown */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="bg-background/50">
            <CardContent className="p-3 text-center">
              <Wallet className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Base</p>
              <p className="font-semibold">{formatCurrency(baseAmount)}</p>
            </CardContent>
          </Card>
          <Card className="bg-background/50">
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-success mb-1" />
              <p className="text-xs text-muted-foreground">Adições</p>
              <p className="font-semibold text-success">+{formatCurrency(totalAdditions)}</p>
            </CardContent>
          </Card>
          <Card className="bg-background/50">
            <CardContent className="p-3 text-center">
              <TrendingDown className="h-5 w-5 mx-auto text-danger mb-1" />
              <p className="text-xs text-muted-foreground">Descontos</p>
              <p className="font-semibold text-danger">-{formatCurrency(totalDeductions)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown Details */}
        {salaryBreakdown.breakdown.length > 1 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Composição deste mês:</p>
            <div className="grid gap-1.5 max-h-40 overflow-y-auto">
              {salaryBreakdown.breakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1 px-2 rounded bg-background/50">
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className={item.type === 'credit' ? 'text-success font-medium' : 'text-danger font-medium'}>
                    {item.type === 'credit' ? '+' : '-'}{formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1">
            <Plus className="h-3 w-3" />
            {components.length} componentes
          </Badge>
          {events.length > 0 && (
            <Badge variant="outline" className="gap-1 bg-accent/10">
              {events.length} {events.length === 1 ? 'evento' : 'eventos'} sazonal
            </Badge>
          )}
          {deductions.length > 0 && (
            <Badge variant="outline" className="gap-1 bg-danger/10 text-danger border-danger/20">
              {deductions.length} {deductions.length === 1 ? 'consignado' : 'consignados'}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
