import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { usePiggyBank, usePiggyBankMovements, useCreatePiggyBankMovement, useUpdatePiggyBank, useDeletePiggyBank } from '@/hooks/useFinancialData';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PiggyBank as PiggyBankIcon, Plus, Minus, ArrowUpCircle, ArrowDownCircle, TrendingUp, ArrowLeft, Pencil, Trash2, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PiggyBankDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: piggyBank, isLoading: loadingBank } = usePiggyBank(id);
  const { data: movements = [], isLoading: loadingMovements } = usePiggyBankMovements(id);
  const createMovement = useCreatePiggyBankMovement();
  const updatePiggyBank = useUpdatePiggyBank();
  const deletePiggyBank = useDeletePiggyBank();
  
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [movementType, setMovementType] = useState<'deposit' | 'withdraw'>('deposit');
  const [movementData, setMovementData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    reason: ''
  });
  const [editData, setEditData] = useState({
    name: '',
    goal_amount: ''
  });

  // Calculate evolution chart
  const sortedMovements = [...movements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let runningBalance = 0;
  const chartData = sortedMovements.map(m => {
    runningBalance += m.type === 'deposit' ? Number(m.amount) : -Number(m.amount);
    return {
      date: formatDate(m.date),
      balance: runningBalance
    };
  });

  // Stats
  const totalDeposits = movements.filter(m => m.type === 'deposit').reduce((sum, m) => sum + Number(m.amount), 0);
  const totalWithdraws = movements.filter(m => m.type === 'withdraw').reduce((sum, m) => sum + Number(m.amount), 0);
  const progress = piggyBank?.goal_amount ? (Number(piggyBank.current_balance) / Number(piggyBank.goal_amount)) * 100 : null;

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    await createMovement.mutateAsync({
      piggy_bank_id: id,
      type: movementType,
      amount: parseFloat(movementData.amount),
      date: movementData.date,
      reason: movementData.reason || null
    });
    setMovementDialogOpen(false);
    setMovementData({ amount: '', date: new Date().toISOString().split('T')[0], reason: '' });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    await updatePiggyBank.mutateAsync({
      id,
      name: editData.name,
      goal_amount: editData.goal_amount ? parseFloat(editData.goal_amount) : null
    });
    setEditDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    await deletePiggyBank.mutateAsync(id);
    navigate('/piggy-bank');
  };

  const openEditDialog = () => {
    if (piggyBank) {
      setEditData({
        name: piggyBank.name,
        goal_amount: piggyBank.goal_amount?.toString() || ''
      });
      setEditDialogOpen(true);
    }
  };

  const isLoading = loadingBank || loadingMovements;

  if (!piggyBank && !isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <PiggyBankIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Cofrinho não encontrado</h2>
          <Button variant="outline" onClick={() => navigate('/piggy-bank')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar aos Cofrinhos
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/piggy-bank')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-muted-foreground">Cofrinhos</span>
      </div>

      <PageHeader
        title={piggyBank?.name || 'Carregando...'}
        description={piggyBank?.goal_amount ? `Meta: ${formatCurrency(piggyBank.goal_amount)}` : 'Sem meta definida'}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={openEditDialog}>
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Cofrinho</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir este cofrinho? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-danger hover:bg-danger/90">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Dialog open={movementDialogOpen} onOpenChange={setMovementDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Movimentação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Movimentar Cofrinho</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleMovementSubmit} className="space-y-4">
                  <Tabs value={movementType} onValueChange={(v) => setMovementType(v as 'deposit' | 'withdraw')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="deposit" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Depósito
                      </TabsTrigger>
                      <TabsTrigger value="withdraw" className="gap-2">
                        <Minus className="h-4 w-4" />
                        Retirada
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <div className="space-y-2">
                    <Label>Valor</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={movementData.amount}
                      onChange={(e) => setMovementData({ ...movementData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={movementData.date}
                      onChange={(e) => setMovementData({ ...movementData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Motivo (opcional)</Label>
                    <Input
                      placeholder="Ex: Reserva de emergência"
                      value={movementData.reason}
                      onChange={(e) => setMovementData({ ...movementData, reason: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createMovement.isPending}>
                    {movementType === 'deposit' ? 'Depositar' : 'Retirar'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cofrinho</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Meta (opcional)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={editData.goal_amount}
                onChange={(e) => setEditData({ ...editData, goal_amount: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={updatePiggyBank.isPending}>
              Salvar
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Progress (if has goal) */}
      {progress !== null && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="font-medium">Progresso da Meta</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {progress.toFixed(0)}%
              </span>
            </div>
            <Progress value={Math.min(progress, 100)} className="h-3" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>{formatCurrency(piggyBank?.current_balance || 0)}</span>
              <span>{formatCurrency(piggyBank?.goal_amount || 0)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Saldo Atual"
          value={piggyBank?.current_balance || 0}
          icon={PiggyBankIcon}
          variant="success"
        />
        <StatCard
          title="Total Depositado"
          value={totalDeposits}
          icon={ArrowUpCircle}
        />
        <StatCard
          title="Total Retirado"
          value={totalWithdraws}
          icon={ArrowDownCircle}
        />
      </div>

      {/* Evolution Chart */}
      {chartData.length > 1 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Evolução do Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="balance" stroke="hsl(var(--success))" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Movements List */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : movements.length === 0 ? (
            <EmptyState
              icon={PiggyBankIcon}
              title="Nenhuma movimentação"
              description="Faça seu primeiro depósito neste cofrinho!"
              action={
                <Button onClick={() => setMovementDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Primeiro Depósito
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {movements.map(m => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${m.type === 'deposit' ? 'bg-success/10' : 'bg-danger/10'}`}>
                      {m.type === 'deposit' ? (
                        <ArrowUpCircle className="h-5 w-5 text-success" />
                      ) : (
                        <ArrowDownCircle className="h-5 w-5 text-danger" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{m.type === 'deposit' ? 'Depósito' : 'Retirada'}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(m.date)}
                        {m.reason && ` · ${m.reason}`}
                      </p>
                    </div>
                  </div>
                  <span className={`text-lg font-semibold ${m.type === 'deposit' ? 'text-success' : 'text-danger'}`}>
                    {m.type === 'deposit' ? '+' : '-'}{formatCurrency(m.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
