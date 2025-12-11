import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFixedExpenses, useVariableExpenses, useCreateExpense, useUpdateFixedExpense, useDeleteFixedExpense, useMonthlyProjection, FixedExpense } from '@/hooks/useFinancialData';
import { formatCurrency } from '@/lib/utils';
import { Plus, Receipt, Calendar, ShoppingCart } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { FixedExpenseList } from '@/components/expenses/FixedExpenseList';
import { VariableExpenseList } from '@/components/expenses/VariableExpenseList';

export default function Expenses() {
  const { data: fixedExpenses = [], isLoading: loadingFixed } = useFixedExpenses();
  const { data: variableExpenses = [], isLoading: loadingVariable } = useVariableExpenses();
  const { summary } = useMonthlyProjection();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateFixedExpense();
  const deleteExpense = useDeleteFixedExpense();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'fixed' | 'variable'>('fixed');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialFormData, setInitialFormData] = useState<Partial<FixedExpense> | null>(null);
  const [formType, setFormType] = useState<'fixed' | 'variable'>('fixed');

  const activeFixedExpenses = fixedExpenses.filter(e => e.is_active);
  const totalFixed = activeFixedExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalVariable = variableExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const percentOfIncome = summary.monthlyIncome > 0
    ? (((totalFixed + totalVariable) / summary.monthlyIncome) * 100).toFixed(1)
    : '0';

  const handleOpenDialog = (type?: 'fixed' | 'variable') => {
    if (type) setFormType(type);
    setInitialFormData(null);
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (expense: FixedExpense) => {
    setFormType(expense.type as 'fixed' | 'variable');
    setInitialFormData(expense);
    setEditingId(expense.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
      await deleteExpense.mutateAsync(id);
    }
  };

  const handleFormSubmit = async (data: any) => {
    const { originalType, ...submissionData } = data;

    // Transform data back to format expected by hooks if needed
    // ExpenseForm already prepares simpler object, but let's ensure type
    const payload = {
      ...submissionData,
      type: originalType
    };

    if (editingId) {
      await updateExpense.mutateAsync({ id: editingId, ...payload });
    } else {
      await createExpense.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const isLoading = loadingFixed || loadingVariable;

  if (isLoading) {
    return (
      <AppLayout>
        <PageSkeleton variant="list" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Despesas"
        description="Despesas fixas e gastos variáveis"
        learnMoreSection="despesas-fixas"
        action={
          <div className="hidden sm:block">
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setInitialFormData(null); setEditingId(null); } }}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog(activeTab)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Despesa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg w-full p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
                </DialogHeader>
                <ExpenseForm
                  type={formType}
                  initialData={initialFormData}
                  onSubmit={handleFormSubmit}
                  isSubmitting={createExpense.isPending || updateExpense.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid-mobile-2 gap-mobile mb-6">
        <StatCard
          title="Total Despesas"
          value={totalFixed + totalVariable}
          subtitle={`${activeFixedExpenses.length} fixas + ${variableExpenses.length} variáveis`}
          icon={Receipt}
        />
        <StatCard
          title="% da Renda"
          value={parseFloat(percentOfIncome)}
          subtitle={summary.monthlyIncome > 0 ? `de ${formatCurrency(summary.monthlyIncome)}` : 'Sem renda'}
          icon={Receipt}
          variant={parseFloat(percentOfIncome) > 80 ? 'danger' : parseFloat(percentOfIncome) > 50 ? 'warning' : 'default'}
          isCurrency={false}
          className="after:content-['%'] after:ml-0.5"
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
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="fixed" className="gap-2">
            <Calendar className="h-4 w-4" />
            Fixas ({activeFixedExpenses.length})
          </TabsTrigger>
          <TabsTrigger value="variable" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Variáveis ({variableExpenses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fixed" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {fixedExpenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Nenhuma despesa fixa"
              description="Adicione suas despesas fixas como aluguel, contas..."
              action={
                <Button onClick={() => handleOpenDialog('fixed')} className="btn-mobile">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Despesa Fixa
                </Button>
              }
            />
          ) : (
            <FixedExpenseList
              expenses={fixedExpenses}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </TabsContent>

        <TabsContent value="variable" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {variableExpenses.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="Nenhum gasto variável"
              description="Adicione seus gastos diários..."
              action={
                <Button onClick={() => handleOpenDialog('variable')} className="btn-mobile">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Gasto Variável
                </Button>
              }
            />
          ) : (
            <VariableExpenseList
              expenses={variableExpenses}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Mobile FAB */}
      <div className="md:hidden">
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setInitialFormData(null); setEditingId(null); } }}>
          <DialogTrigger asChild>
            <button
              className="fab shadow-lg hover:shadow-xl active:scale-95 transition-all"
              onClick={() => handleOpenDialog(activeTab)}
            >
              <Plus className="h-6 w-6" />
            </button>
          </DialogTrigger>
          <DialogContent className="h-[100dvh] max-w-[100vw] w-full p-4 pt-10 rounded-none border-none sm:rounded-lg sm:border sm:h-auto sm:max-w-lg overflow-y-auto">
            <DialogHeader className="text-left mb-6">
              <DialogTitle className="text-2xl">{editingId ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
            </DialogHeader>
            <ExpenseForm
              type={formType}
              initialData={initialFormData}
              onSubmit={handleFormSubmit}
              isSubmitting={createExpense.isPending || updateExpense.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
