import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';

interface CancellationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmCancellation: () => void;
}

const CANCELLATION_REASONS = [
    "Ficou caro",
    "Não entendi como usar",
    "Encontrei outro app",
    "Problemas técnicos",
    "Pouco útil pra mim",
    "Outro motivo"
];

export function CancellationModal({ isOpen, onClose, onConfirmCancellation }: CancellationModalProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [step, setStep] = useState<'survey' | 'confirm'>('survey');
    const [reason, setReason] = useState<string>('');
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!reason) return;
        setIsSubmitting(true);

        try {
            if (user) {
                await supabase.from('cancellation_feedback').insert({
                    user_id: user.id,
                    reason,
                    details
                });
            }

            onConfirmCancellation();
            toast({
                title: "Cancelamento confirmado",
                description: "Seu plano foi alterado para o gratuito. Esperamos te ver de volta!",
            });
            onClose();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast({
                variant: "destructive",
                title: "Erro ao processar",
                description: "Tente novamente mais tarde."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Cancelar Assinatura
                    </DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja cancelar seu plano Premium? Você perderá acesso aos recursos exclusivos.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <h4 className="font-medium mb-4 text-foreground">Antes de ir, conta pra gente o motivo?</h4>
                    <RadioGroup value={reason} onValueChange={setReason} className="gap-3">
                        {CANCELLATION_REASONS.map((r) => (
                            <div key={r} className="flex items-center space-x-2">
                                <RadioGroupItem value={r} id={r} />
                                <Label htmlFor={r} className="font-normal cursor-pointer text-muted-foreground hover:text-foreground transition-colors">{r}</Label>
                            </div>
                        ))}
                    </RadioGroup>

                    {reason && (
                        <div className="mt-4 animate-fade-in">
                            <Label htmlFor="details" className="mb-2 block">Conte mais sobre sua experiência (opcional)</Label>
                            <Textarea
                                id="details"
                                placeholder="Sentiremos sua falta..."
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                className="resize-none"
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Voltar / Manter Plano
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={!reason || isSubmitting}
                    >
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirmar Cancelamento'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
