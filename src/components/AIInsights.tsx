import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, AlertTriangle, Info, AlertCircle, RefreshCw, Loader2, CheckCircle2, Flame, PiggyBank } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Insight {
  message: string;
  mood_tag: 'neutral' | 'alert' | 'urgent' | 'positive';
}

interface SuggestedTask {
  description: string;
  related_scope?: string;
  related_reference?: string;
  priority: 'low' | 'medium' | 'high';
}

interface AIInsightsProps {
  scope: 'dashboard' | 'cards' | 'planning' | 'reports';
  cardId?: string;
}

export function AIInsights({ scope, cardId }: AIInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [tasks, setTasks] = useState<SuggestedTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Você precisa estar logado');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-insights`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            scope: cardId ? `card-${cardId}` : scope
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar insights');
      }

      const data = await response.json();
      setInsights(data.insights || []);
      setTasks(data.suggested_tasks || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      toast({
        title: 'Erro ao gerar insights',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateInsights();
  }, [scope, cardId]);

  const getMoodStyles = (moodTag: string) => {
    switch (moodTag) {
      case 'urgent':
        return {
          bg: 'bg-danger/10 border-danger/30',
          icon: Flame,
          iconColor: 'text-danger',
          label: 'Urgente'
        };
      case 'alert':
        return {
          bg: 'bg-warning/10 border-warning/30',
          icon: AlertTriangle,
          iconColor: 'text-warning',
          label: 'Atenção'
        };
      case 'positive':
        return {
          bg: 'bg-success/10 border-success/30',
          icon: CheckCircle2,
          iconColor: 'text-success',
          label: 'Positivo'
        };
      default:
        return {
          bg: 'bg-muted/50 border-border',
          icon: Info,
          iconColor: 'text-muted-foreground',
          label: 'Info'
        };
    }
  };

  if (loading) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center justify-center gap-3 p-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Analisando seus dados financeiros...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-danger/20 bg-danger/5">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-danger" />
            <span className="text-sm text-danger">{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={generateInsights}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <PiggyBank className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-bold text-lg text-primary">Dica do Pig</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={generateInsights} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Insights Grid - Limited to 2 */}
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {insights.slice(0, 2).map((insight, index) => {
          const styles = getMoodStyles(insight.mood_tag);
          const Icon = styles.icon;

          return (
            <Card
              key={index}
              className={cn(
                'animate-fade-in border-none shadow-md overflow-hidden relative',
                styles.bg // retained for subtle background tint
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Decorative Side Bar */}
              <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", styles.iconColor.replace('text-', 'bg-'))} />

              <CardContent className="p-4 pl-6">
                <div className="flex items-start gap-4">
                  <div className={cn('rounded-full p-2 bg-white shadow-sm shrink-0')}>
                    <Icon className={cn('h-5 w-5', styles.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={cn('text-xs font-bold uppercase tracking-wider opacity-70', styles.iconColor)}>
                      {styles.label}
                    </span>
                    <p className="mt-2 text-sm font-medium text-gray-700 leading-relaxed">
                      "{insight.message}"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Suggested Tasks - Simplified */}
      {tasks.length > 0 && (
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Próximos passos sugeridos pelo Pig
          </h4>
          <div className="space-y-2">
            {tasks.slice(0, 3).map((task, index) => (
              <div key={index} className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <span className={cn(
                  'h-2 w-2 rounded-full flex-shrink-0',
                  task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                )} />
                <span className="text-gray-600">{task.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
