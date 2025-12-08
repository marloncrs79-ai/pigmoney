
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PiggyBank, CreditCard, Lock, CheckCircle2, ArrowLeft, Loader2, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Confetti from 'react-confetti';

export default function Checkout() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, updatePlan, plan } = useAuth();
    const { toast } = useToast();

    const planId = searchParams.get('plan');
    const [isLoading, setIsLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Form state
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [name, setName] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/auth?signup=true');
        }
        if (!planId || (planId !== 'pro' && planId !== 'annual')) {
            navigate('/');
        }
    }, [user, planId, navigate]);

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

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsLoading(false);
        setPaymentSuccess(true);
        updatePlan(planId as 'pro' | 'annual');

        toast({
            title: "Pagamento Aprovado! 🎉",
            description: `Bem-vindo ao ${selectedPlan.title}.`,
            duration: 5000,
        });

        // Redirect after showing success
        setTimeout(() => {
            navigate('/dashboard');
        }, 4000);
    };

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const parts = [];
        for (let i = 0; i < v.length; i += 4) {
            parts.push(v.substring(i, i + 4));
        }
        if (parts.length > 0 && parts.length <= 4) return parts.join(' ');
        return value; // fallback
    };

    if (paymentSuccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background animate-fade-in text-center">
                <Confetti numberOfPieces={200} recycle={false} />
                <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Pagamento Confirmado!</h1>
                <p className="text-muted-foreground text-lg mb-8 max-w-md">
                    Sua assinatura do <strong>{selectedPlan.title}</strong> está ativa. Prepare-se para dominar suas finanças!
                </p>
                <Button size="xl" onClick={() => navigate('/dashboard')} className="gap-2 shadow-xl hover:scale-105 transition-transform">
                    Ir para o Dashboard <Sparkles className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <Button variant="ghost" className="mb-8" onClick={() => navigate('/')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>

                <div className="grid md:grid-cols-12 gap-8 lg:gap-12">
                    {/* Order Summary */}
                    <div className="md:col-span-5 lg:col-span-4 space-y-6">
                        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 sticky top-8">
                            <div className="flex items-center gap-2 mb-6 text-primary">
                                <PiggyBank className="h-6 w-6" />
                                <span className="font-bold text-lg tracking-tight">PIGMONEY</span>
                            </div>

                            <h2 className="text-xl font-semibold mb-2 text-foreground/80">Resumo do Pedido</h2>
                            <div className="mb-6 pb-6 border-b border-border">
                                <h3 className="text-2xl font-bold text-primary mb-1">{selectedPlan.title}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold">{selectedPlan.price}</span>
                                    <span className="text-muted-foreground">{selectedPlan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {selectedPlan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="bg-background rounded-xl p-4 text-xs text-muted-foreground flex gap-2">
                                <Lock className="h-4 w-4 shrink-0" />
                                <p>Pagamento processado de forma segura. Seus dados estão protegidos com criptografia de ponta a ponta.</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className="md:col-span-7 lg:col-span-8">
                        <Card className="border-border/50 shadow-xl overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-primary to-purple-600" />
                            <CardHeader className="pb-4">
                                <CardTitle className="text-2xl">Dados de Pagamento</CardTitle>
                                <CardDescription>Insira os dados do cartão para ativar sua assinatura.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePayment} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nome no Cartão</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="name"
                                                placeholder="COMO NO CARTÃO"
                                                className="pl-9 uppercase"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="number">Número do Cartão</Label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="number"
                                                placeholder="0000 0000 0000 0000"
                                                className="pl-9 font-mono"
                                                maxLength={19}
                                                value={cardNumber}
                                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="expiry">Validade</Label>
                                            <Input
                                                id="expiry"
                                                placeholder="MM/AA"
                                                className="font-mono text-center"
                                                maxLength={5}
                                                value={expiry}
                                                onChange={(e) => {
                                                    let v = e.target.value.replace(/[^0-9]/g, '');
                                                    if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
                                                    setExpiry(v);
                                                }}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cvc">CVC</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-3 w-3 text-muted-foreground" />
                                                <Input
                                                    id="cvc"
                                                    placeholder="123"
                                                    className="pl-8 font-mono"
                                                    maxLength={3}
                                                    type="password"
                                                    value={cvc}
                                                    onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, ''))}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full text-lg font-bold gap-2"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    Processando...
                                                </>
                                            ) : (
                                                `Pagar ${selectedPlan.price}`
                                            )}
                                        </Button>
                                        <p className="text-center text-xs text-muted-foreground mt-4">
                                            Ao clicar em pagar, você concorda com nossos Termos de Serviço. A renovação é automática.
                                        </p>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
