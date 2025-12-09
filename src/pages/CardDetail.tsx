import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { useCreditCards, useCardTransactions, useCreateCardTransaction, useDeleteCardTransaction } from '@/hooks/useFinancialData';
import { formatCurrency, formatMonthYear, getNext12Months, calculateInstallmentForMonth, EXPENSE_CATEGORIES } from '@/lib/utils';
import { Plus, CreditCard, ArrowLeft, Trash2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function CardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: cards = [] } = useCreditCards();
  const { data: transactions = [], isLoading } = useCardTransactions(id);
  const createTransaction = useCreateCardTransaction();
  const deleteTransaction = useDeleteCardTransaction();

  const card = cards.find(c => c.id === id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    amount_total: '',
    installments: '1',
    first_invoice_month: ''
  });

  if (!card) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Cartão não encontrado</p>
          <Button variant="link" onClick={() => navigate('/cards')}>Voltar</Button>
        </div>
      </AppLayout>
    );
  }

  // Calculate invoices for next 12 months
  const months = getNext12Months();
  const invoiceProjection = months.map(month => ({
    month,
    label: formatMonthYear(month).split(' ')[0].slice(0, 3),
    amount: transactions.reduce((sum, t) => {
      return sum + calculateInstallmentForMonth(
        t.first_invoice_month,
        Number(t.amount_total),
        t.installments,
        month
      );
    }, 0)
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTransaction.mutateAsync({
      card_id: id!,
      description: formData.description,
      category: formData.category,
      amount_total: parseFloat(formData.amount_total),
      installments: parseInt(formData.installments),
      first_invoice_month: formData.first_invoice_month
    });
    setDialogOpen(false);
    setFormData({ description: '', category: '', amount_total: '', installments: '1', first_invoice_month: '' });
  };

  const handleDelete = async (transactionId: string) => {
    if (confirm('Excluir esta compra?')) {
      await deleteTransaction.mutateAsync(transactionId);
    }
  };

  // Generate month options for the form
  const monthOptions = months.map(m => ({ value: m, label: formatMonthYear(m) }));

  return (
    <AppLayout>
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/cards')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <PageHeader
        title={card.nickname}
        description={`${card.holder_name} · Fecha dia ${card.closing_day} · Vence dia ${card.due_day}`}
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Compra
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Compra</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    placeholder="Ex: TV 55 polegadas"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valor Total</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={formData.amount_total}
                      onChange={(e) => setFormData({ ...formData, amount_total: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parcelas</Label>
                    <Input
                      type="number"
                      min="1"
                      max="48"
                      placeholder="1"
                      value={formData.installments}
                      onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Primeira Fatura</Label>
                  <Select value={formData.first_invoice_month} onValueChange={(v) => setFormData({ ...formData, first_invoice_month: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o mês" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={createTransaction.isPending}>
                  Adicionar Compra
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Invoice Projection Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Projeção de Faturas (12 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={invoiceProjection}>
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="amount" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Compras e Parcelamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="Nenhuma compra"
              description="Registre suas compras parceladas ou à vista neste cartão."
              action={
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Compra
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{t.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.category} · {t.installments}x de {formatCurrency(Number(t.amount_total) / t.installments)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Início: {formatMonthYear(t.first_invoice_month)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(t.amount_total)}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights for this card */}

    </AppLayout>
  );
}
