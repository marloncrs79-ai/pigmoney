import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Minus, TrendingUp, HelpCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { 
  useIncomeComponents, 
  useCreateIncomeComponent, 
  useDeleteIncomeComponent 
} from '@/hooks/useIncomeData';
import { EmptyState } from '@/components/ui/empty-state';

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const COMPONENT_SUGGESTIONS = [
  { name: 'Vale Alimentação', type: 'credit' as const },
  { name: 'Vale Transporte', type: 'credit' as const },
  { name: 'Adicional de Insalubridade', type: 'credit' as const },
  { name: 'Adicional Noturno', type: 'credit' as const },
  { name: 'INSS', type: 'debit' as const },
  { name: 'IRRF', type: 'debit' as const },
  { name: 'Plano de Saúde', type: 'debit' as const },
  { name: 'Previdência Privada', type: 'debit' as const },
];

export function Step2Components() {
  const { data: components = [] } = useIncomeComponents();
  const createComponent = useCreateIncomeComponent();
  const deleteComponent = useDeleteIncomeComponent();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'credit' as 'credit' | 'debit',
    amount: '',
    recurrence: 'monthly' as 'monthly' | 'quarterly' | 'annual' | 'custom',
    months: [] as number[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createComponent.mutateAsync({
      name: form.name,
      type: form.type,
      amount: parseFloat(form.amount),
      recurrence: form.recurrence,
      months: form.recurrence === 'custom' ? form.months : null,
      income_id: null
    });
    setForm({ name: '', type: 'credit', amount: '', recurrence: 'monthly', months: [] });
    setShowForm(false);
  };

  const handleQuickAdd = (suggestion: typeof COMPONENT_SUGGESTIONS[0]) => {
    setForm({ ...form, name: suggestion.name, type: suggestion.type });
    setShowForm(true);
  };

  const toggleMonth = (month: number) => {
    setForm(prev => ({
      ...prev,
      months: prev.months.includes(month)
        ? prev.months.filter(m => m !== month)
        : [...prev.months, month].sort((a, b) => a - b)
    }));
  };

  const totalCredits = components.filter(c => c.type === 'credit').reduce((sum, c) => sum + Number(c.amount), 0);
  const totalDebits = components.filter(c => c.type === 'debit').reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <div className="space-y-6">
      {/* Info */}
      <Card className="bg-info/5 border-info/20">
        <CardContent className="p-4 flex items-start gap-3">
          <HelpCircle className="h-5 w-5 text-info mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-info">O que são componentes salariais?</p>
            <p className="text-muted-foreground mt-1">
              São valores que somam ou subtraem do seu salário base todo mês (ou em meses específicos).
              Exemplos: vale alimentação, INSS, plano de saúde, adicional noturno.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Add Suggestions */}
      {!showForm && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Adicionar rapidamente:</Label>
          <div className="flex flex-wrap gap-2">
            {COMPONENT_SUGGESTIONS.map((suggestion) => (
              <Badge
                key={suggestion.name}
                variant="outline"
                className="cursor-pointer hover:bg-accent transition-colors py-1.5 px-3"
                onClick={() => handleQuickAdd(suggestion)}
              >
                {suggestion.type === 'credit' ? (
                  <Plus className="h-3 w-3 mr-1 text-success" />
                ) : (
                  <Minus className="h-3 w-3 mr-1 text-danger" />
                )}
                {suggestion.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm ? (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome do componente</Label>
                  <Input
                    placeholder="Ex: Vale Alimentação"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={form.type} onValueChange={(v: 'credit' | 'debit') => setForm({ ...form, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">
                        <span className="flex items-center gap-2">
                          <Plus className="h-4 w-4 text-success" />
                          Crédito (adiciona)
                        </span>
                      </SelectItem>
                      <SelectItem value="debit">
                        <span className="flex items-center gap-2">
                          <Minus className="h-4 w-4 text-danger" />
                          Débito (desconta)
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Valor</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Recorrência</Label>
                  <Select 
                    value={form.recurrence} 
                    onValueChange={(v: 'monthly' | 'quarterly' | 'annual' | 'custom') => setForm({ ...form, recurrence: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Todo mês</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="annual">Anual</SelectItem>
                      <SelectItem value="custom">Meses específicos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {form.recurrence === 'custom' && (
                <div className="space-y-2">
                  <Label>Selecione os meses</Label>
                  <div className="flex flex-wrap gap-2">
                    {MONTH_NAMES.map((name, i) => (
                      <Button
                        key={i}
                        type="button"
                        size="sm"
                        variant={form.months.includes(i + 1) ? 'default' : 'outline'}
                        onClick={() => toggleMonth(i + 1)}
                      >
                        {name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createComponent.isPending}>
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
          Adicionar componente personalizado
        </Button>
      )}

      {/* Component List */}
      {components.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Componentes configurados</Label>
            <div className="flex gap-4 text-sm">
              <span className="text-success">+{formatCurrency(totalCredits)}</span>
              <span className="text-danger">-{formatCurrency(totalDebits)}</span>
            </div>
          </div>
          <div className="space-y-2">
            {components.map(c => (
              <Card key={c.id} className="group hover:shadow-md transition-all">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${c.type === 'credit' ? 'bg-success/10' : 'bg-danger/10'}`}>
                      {c.type === 'credit' ? (
                        <Plus className="h-4 w-4 text-success" />
                      ) : (
                        <Minus className="h-4 w-4 text-danger" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{c.recurrence === 'monthly' ? 'Todo mês' : c.recurrence}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${c.type === 'credit' ? 'text-success' : 'text-danger'}`}>
                      {c.type === 'credit' ? '+' : '-'}{formatCurrency(c.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteComponent.mutate(c.id)}
                    >
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : !showForm && (
        <EmptyState
          icon={TrendingUp}
          title="Nenhum componente ainda"
          description="Adicione benefícios e descontos que afetam seu salário mensal."
        />
      )}
    </div>
  );
}
