
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PiggyBank, CheckCircle2, ArrowLeft, Loader2, Sparkles, Lock } from 'lucide-react';
import Confetti from 'react-confetti';
import { supabase } from '@/integrations/supabase/client';

export default function Checkout() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, plan, refreshCouple } = useAuth();
    const { toast } = useToast();

    const planId = searchParams.get('plan');
    const sessionId = searchParams.get('session_id');
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/auth?signup=true');
        }
        if (!planId && !success && !canceled) {
            navigate('/');
        }
    }, [user, planId, success, canceled, navigate]);

    useEffect(() => {
        if (canceled) {
            toast({
                title: "Pagamento cancelado",
                description: "Você pode tentar novamente quando quiser.",
                variant: "destructive"
            });
            navigate('/plans');
        }
    }, [canceled, navigate, toast]);

    // Handle success - refresh plan data
    useEffect(() => {
        if (success) {
            console.log('[Checkout] Payment success detected, refreshing plan...');
            // Immediate refresh
            refreshCouple();

            // Retry multiple times to catch webhook delay
            const timers = [
                setTimeout(() => { console.log('[Checkout] Retry 1...'); refreshCouple(); }, 1500),
                setTimeout(() => { console.log('[Checkout] Retry 2...'); refreshCouple(); }, 3000),
                setTimeout(() => { console.log('[Checkout] Retry 3...'); refreshCouple(); }, 5000),
            ];

            return () => timers.forEach(t => clearTimeout(t));
        }
    }, [success, refreshCouple]);

    const planDetails = {
        pro: {
            title: 'Pig Pro Mensal',
            price: 'R$ 9,90',
            period: '/mês',
            features: [
                'Consultor Pig (IA) Ilimitado',
                'Projeção Financeira de 6 meses',
                'Cofrinhos ilimitados',
                'Relatórios avançados'
            ]
        },
        annual: {
            title: 'Pig Pro Anual',
            price: 'R$ 97,00',
            period: '/ano',
            features: [
                'Economia de R$ 21,80',
                'Consultor Pig (IA) Ilimitado',
                'Projeção Financeira de 12 meses',
                'Acesso antecipado a novidades',
                'Prioridade no suporte'
            ]
        }
    };

    const selectedPlan = planDetails[planId as 'pro' | 'annual'] || planDetails.pro;

    const handleCheckout = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                body: { planType: planId }
            });

            if (error) throw error;
            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            toast({
                title: "Erro ao iniciar pagamento",
                description: "Tente novamente mais tarde.",
                variant: "destructive"
            });
            setIsLoading(false);
        }
    };

    if (success) {
        const handleGoToDashboard = async () => {
            await refreshCouple(); // One last check
            navigate('/dashboard');
        };

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background animate-fade-in text-center">
                <Confetti numberOfPieces={200} recycle={false} />
                <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Pagamento Confirmado!</h1>
                <p className="text-muted-foreground text-lg mb-8 max-w-md">
                    Sua assinatura está sendo ativada. Pode levar alguns instantes para o sistema atualizar.
                </p>
                <Button size="xl" onClick={handleGoToDashboard} className="gap-2 shadow-xl hover:scale-105 transition-transform">
                    Ir para o Dashboard <Sparkles className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <Button variant="ghost" className="mb-8" onClick={() => navigate('/')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>

                <Card className="border-primary/20 shadow-xl overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-primary to-purple-600" />
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                            <PiggyBank className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">{selectedPlan.title}</CardTitle>
                        <CardDescription>Finalize sua assinatura de forma segura via Stripe.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center py-4 border-y border-border/50">
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-bold">{selectedPlan.price}</span>
                                <span className="text-muted-foreground">{selectedPlan.period}</span>
                            </div>
                        </div>

                        <ul className="space-y-3">
                            {selectedPlan.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Button
                            onClick={handleCheckout}
                            disabled={isLoading}
                            className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/25"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                `Assinar com Stripe`
                            )}
                        </Button>

                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <Lock className="h-3 w-3" />
                            Pagamento 100% seguro via Stripe
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
