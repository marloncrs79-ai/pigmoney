import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users } from 'lucide-react';

export function SetupCoupleDialog() {
  const { user, couple, coupleLoading, createCoupleForUser } = useAuth();
  const { toast } = useToast();
  const [coupleName, setCoupleName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show dialog only if user is logged in, not loading, and has no couple
  const shouldShow = !!(user && !coupleLoading && !couple);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleName.trim()) return;

    setIsSubmitting(true);
    const { error } = await createCoupleForUser(coupleName.trim());

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message
      });
    } else {
      toast({
        title: 'Configuração concluída!',
        description: 'Sua conta está pronta para uso.'
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={shouldShow}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Configurar sua conta</DialogTitle>
          <DialogDescription className="text-center">
            Para começar, dê um nome para o seu espaço financeiro.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="couple-name">Nome do Espaço</Label>
            <Input
              id="couple-name"
              placeholder="Ex: Minhas Finanças"
              value={coupleName}
              onChange={(e) => setCoupleName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || !coupleName.trim()}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Começar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
