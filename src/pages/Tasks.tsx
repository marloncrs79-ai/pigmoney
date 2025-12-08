import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFinancialTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useFinancialTasks';
import { formatDate } from '@/lib/utils';
import { Plus, CheckCircle2, Circle, Sparkles, User, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Tasks() {
  const { data: tasks = [], isLoading } = useFinancialTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    priority: 'medium',
    due_date: ''
  });

  const openTasks = tasks.filter(t => t.status === 'open');
  const doneTasks = tasks.filter(t => t.status === 'done');
  const ignoredTasks = tasks.filter(t => t.status === 'ignored');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTask.mutateAsync({
      description: formData.description,
      priority: formData.priority as 'low' | 'medium' | 'high',
      due_date: formData.due_date || null,
      created_by: 'user'
    });
    setDialogOpen(false);
    setFormData({ description: '', priority: 'medium', due_date: '' });
  };

  const handleComplete = async (id: string) => {
    await updateTask.mutateAsync({ id, status: 'done', completed_at: new Date().toISOString() });
  };

  const handleIgnore = async (id: string) => {
    await updateTask.mutateAsync({ id, status: 'ignored' });
  };

  const handleReopen = async (id: string) => {
    await updateTask.mutateAsync({ id, status: 'open', completed_at: null });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir esta tarefa?')) {
      await deleteTask.mutateAsync(id);
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return { color: 'text-danger', bg: 'bg-danger/10', label: 'Alta' };
      case 'medium':
        return { color: 'text-warning', bg: 'bg-warning/10', label: 'Média' };
      default:
        return { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Baixa' };
    }
  };

  const TaskCard = ({ task, showActions = true }: { task: typeof tasks[0]; showActions?: boolean }) => {
    const priority = getPriorityStyles(task.priority);
    const isAI = task.created_by === 'ai';

    return (
      <Card className={cn('animate-fade-in', task.status !== 'open' && 'opacity-60')}>
        <CardContent className="flex items-start justify-between gap-4 p-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {task.status === 'open' ? (
              <button onClick={() => handleComplete(task.id)} className="mt-0.5 text-muted-foreground hover:text-success transition-colors">
                <Circle className="h-5 w-5" />
              </button>
            ) : task.status === 'done' ? (
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className={cn('font-medium', task.status !== 'open' && 'line-through text-muted-foreground')}>
                {task.description}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={cn('text-xs px-2 py-0.5 rounded-full', priority.bg, priority.color)}>
                  {priority.label}
                </span>
                {isAI && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    IA
                  </span>
                )}
                {!isAI && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Manual
                  </span>
                )}
                {task.due_date && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(task.due_date)}
                  </span>
                )}
              </div>
            </div>
          </div>
          {showActions && task.status === 'open' && (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => handleIgnore(task.id)} className="text-muted-foreground hover:text-warning">
                Ignorar
              </Button>
            </div>
          )}
          {task.status !== 'open' && (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => handleReopen(task.id)}>
                Reabrir
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)}>
                <Trash2 className="h-4 w-4 text-danger" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout>
      <PageHeader
        title="Tarefas Financeiras"
        description="Ações sugeridas pela IA e tarefas manuais"
        learnMoreSection="ia"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Tarefa</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    placeholder="Ex: Revisar assinatura do streaming"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prazo (opcional)</Label>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createTask.isPending}>
                  Adicionar
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-warning/10 p-2">
              <Circle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{openTasks.length}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-success/10 p-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{doneTasks.length}</p>
              <p className="text-sm text-muted-foreground">Concluídas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tasks.filter(t => t.created_by === 'ai').length}</p>
              <p className="text-sm text-muted-foreground">Sugeridas pela IA</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="open">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="open">Pendentes ({openTasks.length})</TabsTrigger>
          <TabsTrigger value="done">Concluídas ({doneTasks.length})</TabsTrigger>
          <TabsTrigger value="ignored">Ignoradas ({ignoredTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="mt-4 space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : openTasks.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Nenhuma tarefa pendente"
              description="As tarefas sugeridas pela IA aparecerão aqui, ou você pode criar suas próprias."
              action={
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Tarefa
                </Button>
              }
            />
          ) : (
            openTasks.map(task => <TaskCard key={task.id} task={task} />)
          )}
        </TabsContent>

        <TabsContent value="done" className="mt-4 space-y-3">
          {doneTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhuma tarefa concluída</div>
          ) : (
            doneTasks.map(task => <TaskCard key={task.id} task={task} showActions={false} />)
          )}
        </TabsContent>

        <TabsContent value="ignored" className="mt-4 space-y-3">
          {ignoredTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhuma tarefa ignorada</div>
          ) : (
            ignoredTasks.map(task => <TaskCard key={task.id} task={task} showActions={false} />)
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
