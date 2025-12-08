import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCreditCards, useCreateCreditCard, useDeleteCreditCard, useCardTransactions } from '@/hooks/useFinancialData';
import { formatCurrency, getCurrentYearMonth, calculateInstallmentForMonth } from '@/lib/utils';
import { Plus, CreditCard, ChevronRight, Trash2 } from 'lucide-react';

export default function Cards() {
  const { data: cards = [], isLoading, isError } = useCreditCards();
  const { data: transactions = [] } = useCardTransactions();
  const createCard = useCreateCreditCard();
  const deleteCard = useDeleteCreditCard();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    holder_name: '',
    nickname: '',
    limit_amount: '',
    closing_day: '',
    due_day: ''
  });

  const currentMonth = getCurrentYearMonth();

  const getCardInvoice = (cardId: string) => {
    return transactions
      .filter(t => t.card_id === cardId)
      .reduce((sum, t) => {
        return sum + calculateInstallmentForMonth(
          t.first_invoice_month,
          Number(t.amount_total),
          t.installments,
          currentMonth
        );
      }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCard.mutateAsync({
      holder_name: formData.holder_name,
      nickname: formData.nickname,
      limit_amount: parseFloat(formData.limit_amount),
      closing_day: parseInt(formData.closing_day),
      due_day: parseInt(formData.due_day)
    });
    setDialogOpen(false);
    setFormData({ holder_name: '', nickname: '', limit_amount: '', closing_day: '', due_day: '' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza? Todas as compras deste cartão serão excluídas.')) {
      await deleteCard.mutateAsync(id);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Cartões de Crédito"
        description="Gerencie seus cartões e faturas"
        learnMoreSection="cartao"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Novo Cartão
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 sm:mx-auto max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Cartão de Crédito</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Titular</Label>
                  <Input
                    placeholder="Ex: João"
                    value={formData.holder_name}
                    onChange={(e) => setFormData({ ...formData, holder_name: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Apelido do Cartão</Label>
                  <Input
                    placeholder="Ex: Nubank João"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Limite</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="5000"
                    value={formData.limit_amount}
                    onChange={(e) => setFormData({ ...formData, limit_amount: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Dia de Fechamento</Label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      placeholder="15"
                      value={formData.closing_day}
                      onChange={(e) => setFormData({ ...formData, closing_day: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dia de Vencimento</Label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      placeholder="22"
                      value={formData.due_day}
                      onChange={(e) => setFormData({ ...formData, due_day: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createCard.isPending}>
                  Adicionar Cartão
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : isError ? (
        <div className="text-center py-8 text-danger">Erro ao carregar cartões. Tente recarregar a página.</div>
      ) : cards.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Nenhum cartão cadastrado"
          description="Adicione seus cartões de crédito para acompanhar faturas e parcelamentos."
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Cartão
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          {cards.map(card => {
            const invoice = getCardInvoice(card.id);
            const usedPercent = card.limit_amount > 0 ? (invoice / Number(card.limit_amount)) * 100 : 0;

            return (
              <Card key={card.id} className="animate-fade-in overflow-hidden">
                <CardContent className="p-0">
                  <Link to={`/cards/${card.id}`} className="block p-4 sm:p-5 hover:bg-muted/50 transition-colors active:bg-muted">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                          <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{card.nickname}</p>
                          <p className="text-sm text-muted-foreground truncate">{card.holder_name}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Fatura Atual</span>
                        <span className="font-semibold">{formatCurrency(invoice)}</span>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Uso do limite</span>
                          <span>{usedPercent.toFixed(0)}%</span>
                        </div>
                        <div className="h-2.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${usedPercent > 80 ? 'bg-danger' : usedPercent > 50 ? 'bg-warning' : 'bg-primary'}`}
                            style={{ width: `${Math.min(usedPercent, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Fecha dia {card.closing_day}</span>
                        <span>Vence dia {card.due_day}</span>
                      </div>
                    </div>
                  </Link>

                  <div className="border-t p-2 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(card.id)}>
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
