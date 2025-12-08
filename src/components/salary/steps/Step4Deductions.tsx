import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, CreditCard, HelpCircle, AlertCircle, Calendar } from 'lucide-react';
import { formatCurrency, formatMonthYear, getCurrentYearMonth } from '@/lib/utils';
import { 
  useSalaryDeductions, 
  useCreateSalaryDeduction, 
  useDeleteSalaryDeduction 
} from '@/hooks/useIncomeData';
import { EmptyState } from '@/components/ui/empty-state';
import { Progress } from '@/components/ui/progress';

export function Step4Deductions() {
  const { data: deductions = [] } = useSalaryDeductions();
  const createDeduction = useCreateSalaryDeduction();
  const deleteDeduction = useDeleteSalaryDeduction();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    description: '',
    amount_monthly: '',
    installments_total: '',
    installments_paid: '0',
    start_month: getCurrentYearMonth()
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDeduction.mutateAsync({
      description: form.description,
      amount_monthly: parseFloat(form.amount_monthly),
      installments_total: parseInt(form.installments_total),
      installments_paid: parseInt(form.installments_paid),
      start_month: form.start_month
    });
    setForm({
      description: '',
      amount_monthly: '',
      installments_total: '',
      installments_paid: '0',
      start_month: getCurrentYearMonth()
    });
    setShowForm(false);
  };

  const totalMonthlyDeductions = deductions.reduce((sum, d) => {
    const currentMonth = getCurrentYearMonth();
    const [y, m] = currentMonth.split('-').map(Number);
    const [sy, sm] = d.start_month.split('-').map(Number);
    const elapsed = (y - sy) * 12 + (m - sm);
    const isActive = elapsed >= 0 && elapsed < d.installments_total - d.installments_paid;
    return sum + (isActive ? Number(d.amount_monthly) : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Info */}
      <Card className="bg-info/5 border-info/20">
        <CardContent className="p-4 flex items-start gap-3">
          <HelpCircle className="h-5 w-5 text-info mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-info">O que são empréstimos consignados?</p>
            <p className="text-muted-foreground mt-1">
              São descontos parcelados que vêm direto do seu salário, como empréstimos bancários, 
              financiamentos ou compras parceladas em folha. O sistema calcula automaticamente 
              quando o desconto termina.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add Form */}
      {showForm ? (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição do empréstimo</Label>
                <Input
                  placeholder="Ex: Empréstimo Banco X, Financiamento Carro"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Valor mensal da parcela</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={form.amount_monthly}
                      onChange={(e) => setForm({ ...form, amount_monthly: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Mês de início</Label>
                  <Input
                    type="month"
                    value={form.start_month}
                    onChange={(e) => setForm({ ...form, start_month: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Total de parcelas</Label>
                  <Input
                    type="number"
                    placeholder="36"
                    value={form.installments_total}
                    onChange={(e) => setForm({ ...form, installments_total: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Parcelas já pagas</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.installments_paid}
                    onChange={(e) => setForm({ ...form, installments_paid: e.target.value })}
                  />
                </div>
              </div>

              {/* Preview */}
              {form.installments_total && form.installments_paid && form.start_month && (
                <Card className="bg-muted/50">
                  <CardContent className="p-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {(() => {
                        const [startYear, startMonth] = form.start_month.split('-').map(Number);
                        const remaining = parseInt(form.installments_total) - parseInt(form.installments_paid);
                        const endDate = new Date(startYear, startMonth - 1 + remaining - 1);
                        const endMonth = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;
                        return `Término previsto: ${formatMonthYear(endMonth)} (${remaining} parcelas restantes)`;
                      })()}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createDeduction.isPending}>
                  Adicionar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          className="w-full h-12 border-dashed"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar empréstimo consignado
        </Button>
      )}

      {/* Deduction List */}
      {deductions.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Consignados ativos</Label>
            <span className="text-sm text-danger font-medium">-{formatCurrency(totalMonthlyDeductions)}/mês</span>
          </div>
          <div className="space-y-2">
            {deductions.map(d => {
              const remaining = d.installments_total - d.installments_paid;
              const progress = (d.installments_paid / d.installments_total) * 100;
              const isEndingSoon = remaining <= 3;

              return (
                <Card key={d.id} className="group hover:shadow-md transition-all">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-danger/10 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-danger" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{d.description}</p>
                            {isEndingSoon && (
                              <Badge variant="secondary" className="text-xs bg-warning/20 text-warning">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Termina em breve
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {d.installments_paid}/{d.installments_total} parcelas
                            {d.end_month && ` · Termina em ${formatMonthYear(d.end_month)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-danger">-{formatCurrency(d.amount_monthly)}/mês</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteDeduction.mutate(d.id)}
                        >
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Progress value={progress} variant="success" className="h-2" />
                      <p className="text-xs text-muted-foreground text-right">
                        {remaining} {remaining === 1 ? 'parcela restante' : 'parcelas restantes'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : !showForm && (
        <EmptyState
          icon={CreditCard}
          title="Nenhum consignado"
          description="Que ótimo! Você não possui empréstimos descontados em folha."
        />
      )}

      {/* Summary */}
      {deductions.length > 0 && (
        <Card className="bg-gradient-to-br from-danger/5 to-danger/10 border-danger/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total descontado mensalmente</p>
                <p className="text-2xl font-bold text-danger">-{formatCurrency(totalMonthlyDeductions)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{deductions.length} {deductions.length === 1 ? 'empréstimo' : 'empréstimos'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
