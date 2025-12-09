import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface FinancialTask {
  id: string;
  couple_id: string;
  created_by: 'ai' | 'user';
  related_scope: string | null;
  related_reference: string | null;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'done' | 'ignored';
  due_date: string | null;
  created_at: string;
  completed_at: string | null;
}

export function useFinancialTasks() {
  const { couple } = useAuth();

  return useQuery({
    queryKey: ['financial-tasks', couple?.id],
    queryFn: async () => {
      if (!couple?.id) return [];
      const { data, error } = await supabase
        .from('financial_tasks')
        .select('*')
        .eq('couple_id', couple.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as FinancialTask[];
    },
    enabled: !!couple?.id
  });
}

export function useCreateTask() {
  const { couple } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (task: {
      description: string;
      priority: 'low' | 'medium' | 'high';
      due_date?: string | null;
      created_by: 'ai' | 'user';
    }) => {
      if (!couple?.id) throw new Error('No couple');
      const { data, error } = await supabase
        .from('financial_tasks')
        .insert({
          ...task,
          couple_id: couple.id,
          status: 'open'
        } as unknown as TablesInsert<'financial_tasks'>)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-tasks'] });
      toast({ title: 'Tarefa criada!', description: 'Sua tarefa foi criada com sucesso.' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FinancialTask> & { id: string }) => {
      const { data, error } = await supabase
        .from('financial_tasks')
        .update(updates as unknown as TablesUpdate<'financial_tasks'>)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['financial-tasks'] });
      if (variables.status === 'done') {
        toast({ title: 'Tarefa concluída!', description: 'Parabéns por concluir esta tarefa.' });
      }
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('financial_tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-tasks'] });
      toast({ title: 'Tarefa removida!', description: 'A tarefa foi removida da lista.' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  });
}
