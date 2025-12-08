import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFixedExpenses, useVariableExpenses, useCreateExpense, useUpdateFixedExpense, useDeleteFixedExpense, useMonthlyProjection, useCreditCards, FixedExpense } from '@/hooks/useFinancialData';
import { formatCurrency, formatDate, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '@/lib/utils';
import { Plus, Receipt, Pencil, Trash2, Calendar, ShoppingCart, CreditCard } from 'lucide-react';

export default function Expenses() {
  const { data: fixedExpenses = [], isLoading: loadingFixed } = useFixedExpenses();
  const { data: variableExpenses = [], isLoading: loadingVariable } = useVariableExpenses();
  const { data: creditCards = [] } = useCreditCards();
  const { summary } = useMonthlyProjection();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateFixedExpense();
  const deleteExpense = useDeleteFixedExpense();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'fixed' | 'variable'>('fixed');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formType, setFormType] = useState<'fixed' | 'variable'>('fixed');
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    due_day: '',
    category: '',
    is_active: true,
    notes: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'pix',
    description: '',
    paid_with_card: false,
    card_id: '',
    is_installment: false,
    installments: '1',
    installment_amount: ''
  });

  const activeFixedExpenses = fixedExpenses.filter(e => e.is_active);
  const totalFixed = activeFixedExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalVariable = variableExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const percentOfIncome = summary.monthlyIncome > 0
    ? (((totalFixed + totalVariable) / summary.monthlyIncome) * 100).toFixed(1)
    : '0';

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      due_day: '',
      category: '',
      is_active: true,
      notes: '',
      date: new Date().toISOString().split('T')[0],
      payment_method: 'pix',
      description: '',
      paid_with_card: false,
      card_id: '',
      is_installment: false,
      installments: '1',
      installment_amount: ''
    });
    setEditingId(null);
    setFormType(activeTab);
  };

  const handleOpenDialog = (type?: 'fixed' | 'variable') => {
    if (type) setFormType(type);
    resetForm();
    setDialogOpen(true);
  };

  const handleEdit = (expense: FixedExpense) => {
    setFormType(expense.type);
    // Note: We don't have installment details stored in fixed_expenses directly for editing 
    // (it's in card_transactions), so we populate basic info.
    setFormData({
      name: expense.name,
      amount: expense.amount.toString(),
      due_day: expense.due_day.toString(),
      category: expense.category,
      is_active: expense.is_active,
      notes: expense.notes || '',
      date: expense.date || new Date().toISOString().split('T')[0],
      payment_method: expense.payment_method || 'pix',
      description: expense.description || '',
      paid_with_card: expense.paid_with_card || false,
      card_id: expense.card_id || '',
      is_installment: false, // Cannot edit installment details deep linked yet
      installments: '1',
      installment_amount: ''
    });
    setEditingId(expense.id);
    setDialogOpen(true);
  };

  // Auto-calculate total amount when installments change
  const handleInstallmentChange = (field: 'installments' | 'installment_amount', value: string) => {
    const newData = { ...formData, [field]: value };

    if (newData.is_installment && newData.installments && newData.installment_amount) {
      const total = (parseFloat(newData.installments) * parseFloat(newData.installment_amount.replace(',', '.'))).toFixed(2);
      newData.amount = total;
    }

    setFormData(newData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get card closing day if using card
    const selectedCard = formData.paid_with_card && formData.card_id
      ? creditCards.find(c => c.id === formData.card_id)
      : null;

    // Final amount check
    let finalAmount = parseFloat(formData.amount);
    if (formData.is_installment && formData.installments && formData.installment_amount) {
      finalAmount = parseFloat(formData.installments) * parseFloat(formData.installment_amount.replace(',', '.'));
    }

    if (formType === 'fixed') {
      const data = {
        name: formData.name,
        amount: finalAmount,
        due_day: parseInt(formData.due_day),
        category: formData.category,
        is_active: formData.is_active,
        notes: formData.notes || null,
        type: 'fixed' as const,
        paid_with_card: formData.paid_with_card,
        card_id: formData.paid_with_card ? formData.card_id || null : null
      };

      if (editingId) {
        await updateExpense.mutateAsync({ id: editingId, ...data });
      } else {
        await createExpense.mutateAsync({
          ...data,
          cardClosingDay: selectedCard?.closing_day,
          installments: formData.is_installment ? parseInt(formData.installments) : 1
        });
      }
    } else {
      const data = {
        name: formData.description || formData.name,
        description: formData.description || formData.name,
        amount: finalAmount,
        category: formData.category,
        date: formData.date,
        payment_method: formData.paid_with_card ? 'credit_card' : formData.payment_method,
        type: 'variable' as const,
        due_day: 1,
        is_active: true,
        paid_with_card: formData.paid_with_card,
        card_id: formData.paid_with_card ? formData.card_id || null : null
      };

      if (editingId) {
        await updateExpense.mutateAsync({ id: editingId, ...data });
      } else {
        await createExpense.mutateAsync({
          ...data,
          cardClosingDay: selectedCard?.closing_day,
          installments: formData.is_installment ? parseInt(formData.installments) : 1
        });
      }
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
      await deleteExpense.mutateAsync(id);
    }
  };

  const isLoading = loadingFixed || loadingVariable;

  return (
    <AppLayout>
      <PageHeader
        title="Despesas"
        description="Despesas fixas e gastos variáveis"
        learnMoreSection="despesas-fixas"
        action={
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog(activeTab)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Despesa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type selector */}
                <div className="space-y-2">
                  <Label>Tipo de Despesa</Label>
                  <Select
                    value={formType}
                    onValueChange={(v) => setFormType(v as 'fixed' | 'variable')}
                    disabled={!!editingId}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixa (recorrente)</SelectItem>
                      <SelectItem value="variable">Variável (pontual)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formType === 'fixed' ? (
                  <>
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input
                        placeholder="Ex: Aluguel"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    {/* Fixed Amount (if not installing) */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Valor Total</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          required
                          readOnly={formData.is_installment}
                          className={formData.is_installment ? "bg-muted" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Dia de Vencimento</Label>
                        <Input
                          type="number"
                          min="1"
                          max="31"
                          placeholder="10"
                          value={formData.due_day}
                          onChange={(e) => setFormData({ ...formData, due_day: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPENSE_CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Despesa ativa</Label>
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                      />
                    </div>

                    {/* Card payment section */}
                    <div className="space-y-3 rounded-lg border p-3 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <Label>Paga no cartão de crédito?</Label>
                        </div>
                        <Switch
                          checked={formData.paid_with_card}
                          onCheckedChange={(v) => setFormData({
                            ...formData,
                            paid_with_card: v,
                            card_id: v ? formData.card_id : '',
                            is_installment: false // Reset installments if toggle card off
                          })}
                          disabled={creditCards.length === 0}
                        />
                      </div>

                      {formData.paid_with_card && (
                        <div className="space-y-4 pt-2 border-t border-dashed border-muted-foreground/30">
                          <div className="space-y-2">
                            <Label>Selecione o Cartão</Label>
                            <Select
                              value={formData.card_id}
                              onValueChange={(v) => setFormData({ ...formData, card_id: v })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o cartão" />
                              </SelectTrigger>
                              <SelectContent>
                                {creditCards.map(card => (
                                  <SelectItem key={card.id} value={card.id}>
                                    {card.nickname} ({card.holder_name})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Installment Toggle */}
                          <div className="flex items-center justify-between">
                            <Label>Compra Parcelada?</Label>
                            <Switch
                              checked={formData.is_installment}
                              onCheckedChange={(v) => handleInstallmentChange('is_installment' as any, v as any)} // Hack just to trigger state update logic
                              onClick={() => setFormData(prev => ({ ...prev, is_installment: !prev.is_installment }))}
                            />
                          </div>

                          {formData.is_installment && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                              <div className="space-y-2">
                                <Label>Nº Parcelas</Label>
                                <Input
                                  type="number"
                                  min="2"
                                  max="48"
                                  value={formData.installments}
                                  onChange={(e) => handleInstallmentChange('installments', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Valor da Parcela</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0,00"
                                  value={formData.installment_amount}
                                  onChange={(e) => handleInstallmentChange('installment_amount', e.target.value)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {creditCards.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Cadastre cartões na página de Cartões para usar esta opção.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Observações (opcional)</Label>
                      <Input
                        placeholder="Notas adicionais"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input
                        placeholder="Ex: Compras no mercado"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Valor Total</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          required
                          readOnly={formData.is_installment}
                          className={formData.is_installment ? "bg-muted" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Data</Label>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {EXPENSE_CATEGORIES.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {!formData.paid_with_card && (
                        <div className="space-y-2">
                          <Label>Método de Pagamento</Label>
                          <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PAYMENT_METHODS).filter(([key]) => key !== 'credit_card').map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* Card payment section (Variable) */}
                    <div className="space-y-3 rounded-lg border p-3 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <Label>Foi no cartão de crédito?</Label>
                        </div>
                        <Switch
                          checked={formData.paid_with_card}
                          onCheckedChange={(v) => setFormData({
                            ...formData,
                            paid_with_card: v,
                            card_id: v ? formData.card_id : '',
                            is_installment: false
                          })}
                          disabled={creditCards.length === 0}
                        />
                      </div>

                      {formData.paid_with_card && (
                        <div className="space-y-4 pt-2 border-t border-dashed border-muted-foreground/30">
                          <div className="space-y-2">
                            <Label>Selecione o Cartão</Label>
                            <Select
                              value={formData.card_id}
                              onValueChange={(v) => setFormData({ ...formData, card_id: v })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o cartão" />
                              </SelectTrigger>
                              <SelectContent>
                                {creditCards.map(card => (
                                  <SelectItem key={card.id} value={card.id}>
                                    {card.nickname} ({card.holder_name})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Installment Toggle */}
                          <div className="flex items-center justify-between">
                            <Label>Compra Parcelada?</Label>
                            <Switch
                              checked={formData.is_installment}
                              onCheckedChange={(v) => handleInstallmentChange('is_installment' as any, v as any)}
                              onClick={() => setFormData(prev => ({ ...prev, is_installment: !prev.is_installment }))}
                            />
                          </div>

                          {formData.is_installment && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                              <div className="space-y-2">
                                <Label>Nº Parcelas</Label>
                                <Input
                                  type="number"
                                  min="2"
                                  max="48"
                                  value={formData.installments}
                                  onChange={(e) => handleInstallmentChange('installments', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Valor da Parcela</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0,00"
                                  value={formData.installment_amount}
                                  onChange={(e) => handleInstallmentChange('installment_amount', e.target.value)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {creditCards.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Cadastre cartões na página de Cartões para usar esta opção.
                        </p>
                      )}
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createExpense.isPending || updateExpense.isPending}
                >
                  {editingId ? 'Salvar' : 'Adicionar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Despesas"
          value={totalFixed + totalVariable}
          subtitle={`${activeFixedExpenses.length} fixas + ${variableExpenses.length} variáveis`}
          icon={Receipt}
        />
        <StatCard
          title="% da Renda"
          value={parseFloat(percentOfIncome)}
          subtitle={summary.monthlyIncome > 0 ? `de ${formatCurrency(summary.monthlyIncome)}` : 'Sem renda cadastrada'}
          icon={Receipt}
          variant={parseFloat(percentOfIncome) > 80 ? 'danger' : parseFloat(percentOfIncome) > 50 ? 'warning' : 'default'}
        />
        <StatCard
          title="Sobra Após Despesas"
          value={summary.monthlyIncome - totalFixed - totalVariable}
          icon={Receipt}
          variant={summary.monthlyIncome - totalFixed - totalVariable < 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'fixed' | 'variable')} className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fixed" className="gap-2">
            <Calendar className="h-4 w-4" />
            Fixas ({activeFixedExpenses.length})
          </TabsTrigger>
          <TabsTrigger value="variable" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Variáveis ({variableExpenses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fixed" className="mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : fixedExpenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Nenhuma despesa fixa"
              description="Adicione suas despesas fixas como aluguel, contas de luz, internet, etc."
              action={
                <Button onClick={() => handleOpenDialog('fixed')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Despesa Fixa
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {fixedExpenses.map(expense => (
                <Card key={expense.id} className={`animate-fade-in ${!expense.is_active ? 'opacity-50' : ''}`}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${expense.paid_with_card ? 'bg-primary/10' : 'bg-primary/10'}`}>
                        {expense.paid_with_card ? (
                          <CreditCard className="h-5 w-5 text-primary" />
                        ) : (
                          <Calendar className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{expense.name}</p>
                          {expense.paid_with_card && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              Cartão
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {expense.category} · Dia {expense.due_day}
                          {!expense.is_active && ' · Inativa'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold">{formatCurrency(expense.amount)}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)}>
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="variable" className="mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : variableExpenses.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="Nenhum gasto variável"
              description="Adicione seus gastos do dia a dia como mercado, farmácia, etc."
              action={
                <Button onClick={() => handleOpenDialog('variable')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Gasto Variável
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {variableExpenses.map(expense => (
                <Card key={expense.id} className="animate-fade-in">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${expense.paid_with_card ? 'bg-primary/10' : 'bg-warning/10'}`}>
                        {expense.paid_with_card ? (
                          <CreditCard className="h-5 w-5 text-primary" />
                        ) : (
                          <ShoppingCart className="h-5 w-5 text-warning" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{expense.description || expense.name}</p>
                          {expense.paid_with_card && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              Cartão
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {expense.category} · {expense.date && formatDate(expense.date)}
                          {!expense.paid_with_card && ` · ${PAYMENT_METHODS[expense.payment_method as keyof typeof PAYMENT_METHODS] || expense.payment_method}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold">{formatCurrency(expense.amount)}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)}>
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
