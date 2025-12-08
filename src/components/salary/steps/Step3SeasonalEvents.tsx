import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Gift, HelpCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { 
  useIncomeEvents, 
  useCreateIncomeEvent, 
  useDeleteIncomeEvent 
} from '@/hooks/useIncomeData';
import { EmptyState } from '@/components/ui/empty-state';

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const EVENT_SUGGESTIONS = [
  { name: '13º Salário (1ª parcela)', months: [11] },
  { name: '13º Salário (2ª parcela)', months: [12] },
  { name: 'Férias', months: [] },
  { name: 'PLR / Bônus Anual', months: [] },
  { name: 'Abono de Férias', months: [] },
];

export function Step3SeasonalEvents() {
  const { data: events = [] } = useIncomeEvents();
  const createEvent = useCreateIncomeEvent();
  const deleteEvent = useDeleteIncomeEvent();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    amount: '',
    months: [] as number[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.months.length === 0) return;
    
    await createEvent.mutateAsync({
      name: form.name,
      amount: parseFloat(form.amount),
      months: form.months
    });
    setForm({ name: '', amount: '', months: [] });
    setShowForm(false);
  };

  const handleQuickAdd = (suggestion: typeof EVENT_SUGGESTIONS[0]) => {
    setForm({ ...form, name: suggestion.name, months: suggestion.months });
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

  const totalSeasonalIncome = events.reduce((sum, e) => sum + Number(e.amount) * e.months.length, 0);

  return (
    <div className="space-y-6">
      {/* Info */}
      <Card className="bg-accent/5 border-accent/20">
        <CardContent className="p-4 flex items-start gap-3">
          <HelpCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-accent">O que são eventos sazonais?</p>
            <p className="text-muted-foreground mt-1">
              São valores extras que você recebe apenas em meses específicos do ano.
              Exemplos: 13º salário, férias, PLR, bônus de produtividade.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Add Suggestions */}
      {!showForm && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Adicionar rapidamente:</Label>
          <div className="flex flex-wrap gap-2">
            {EVENT_SUGGESTIONS.map((suggestion) => (
              <Button
                key={suggestion.name}
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => handleQuickAdd(suggestion)}
              >
                <Gift className="h-3 w-3 text-accent" />
                {suggestion.name}
              </Button>
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
                  <Label>Nome do evento</Label>
                  <Input
                    placeholder="Ex: 13º Salário, PLR"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
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
              </div>

              <div className="space-y-2">
                <Label>Em quais meses você recebe?</Label>
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
                {form.months.length === 0 && (
                  <p className="text-sm text-muted-foreground">Selecione pelo menos um mês</p>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createEvent.isPending || form.months.length === 0}>
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
          Adicionar evento sazonal
        </Button>
      )}

      {/* Event List */}
      {events.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Eventos configurados</Label>
            <span className="text-sm text-success font-medium">+{formatCurrency(totalSeasonalIncome)}/ano</span>
          </div>
          <div className="space-y-2">
            {events.map(e => (
              <Card key={e.id} className="group hover:shadow-md transition-all">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <Gift className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{e.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.months.map(m => MONTH_NAMES[m - 1]).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-success">+{formatCurrency(e.amount)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteEvent.mutate(e.id)}
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
          icon={Gift}
          title="Nenhum evento sazonal"
          description="Adicione valores extras que você recebe em meses específicos."
        />
      )}
    </div>
  );
}
