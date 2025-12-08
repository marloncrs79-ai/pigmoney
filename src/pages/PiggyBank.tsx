import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { usePiggyBanks, useCreatePiggyBank } from '@/hooks/useFinancialData';
import { formatCurrency } from '@/lib/utils';
import { PiggyBank as PiggyBankIcon, Plus, Target, ChevronRight } from 'lucide-react';

export default function PiggyBank() {
  const navigate = useNavigate();
  const { data: piggyBanks = [], isLoading } = usePiggyBanks();
  const createPiggyBank = useCreatePiggyBank();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    goal_amount: '',
    initial_balance: ''
  });

  const totalBalance = piggyBanks.reduce((sum, pb) => sum + Number(pb.current_balance), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPiggyBank.mutateAsync({
      name: formData.name,
      goal_amount: formData.goal_amount ? parseFloat(formData.goal_amount) : null,
      initial_balance: formData.initial_balance ? parseFloat(formData.initial_balance) : 0
    });
    setDialogOpen(false);
    setFormData({ name: '', goal_amount: '', initial_balance: '' });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Cofrinhos"
        description="Suas metas e reservas"
        learnMoreSection="cofrinhos"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Novo Cofrinho
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 sm:mx-auto max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Cofrinho</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Cofrinho</Label>
                  <Input
                    placeholder="Ex: Viagem, Emergência, Carro..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meta (opcional)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.goal_amount}
                    onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Saldo Inicial (opcional)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.initial_balance}
                    onChange={(e) => setFormData({ ...formData, initial_balance: e.target.value })}
                    className="h-12"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createPiggyBank.isPending}>
                  Criar Cofrinho
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <StatCard
          title="Total em Cofrinhos"
          value={totalBalance}
          icon={PiggyBankIcon}
          variant="success"
        />
        <StatCard
          title="Cofrinhos Ativos"
          value={piggyBanks.length}
          icon={Target}
          isCurrency={false}
        />
      </div>

      {/* Piggy Banks List */}
      <div className="mt-4 sm:mt-6">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : piggyBanks.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <EmptyState
                icon={PiggyBankIcon}
                title="Nenhum cofrinho"
                description="Crie seu primeiro cofrinho para começar a guardar dinheiro!"
                action={
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Cofrinho
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {piggyBanks.map((pb) => {
              const progress = pb.goal_amount ? (Number(pb.current_balance) / Number(pb.goal_amount)) * 100 : null;
              
              return (
                <Card 
                  key={pb.id} 
                  className="cursor-pointer hover:border-primary/50 transition-colors active:scale-[0.98]"
                  onClick={() => navigate(`/piggy-bank/${pb.id}`)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base sm:text-lg font-medium">{pb.name}</CardTitle>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xl sm:text-2xl font-bold text-success">
                          {formatCurrency(pb.current_balance)}
                        </p>
                        {pb.goal_amount && (
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Meta: {formatCurrency(pb.goal_amount)}
                          </p>
                        )}
                      </div>
                      
                      {progress !== null && (
                        <div className="space-y-1">
                          <Progress value={Math.min(progress, 100)} className="h-2.5 sm:h-2" />
                          <p className="text-xs text-muted-foreground text-right">
                            {progress.toFixed(0)}% alcançado
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
