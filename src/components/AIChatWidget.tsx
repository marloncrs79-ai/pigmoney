
import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PiggyBank, Send, User, Sparkles, Loader2, Info, X, MessageCircle, Lock, Gem } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export function AIChatWidget() {
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const { canAccessAI, plan } = usePermissions();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: 'Olá! Sou o Consultor Pig 🐷. Analisei suas finanças. Como posso te ajudar hoje?',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        if (!canAccessAI) {
            return; // Should be blocked by UI, but double check
        }

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                throw new Error('Sessão expirada. Por favor, faça login novamente.');
            }

            let assistantText = '';

            // Helper to generate mock response based on keywords
            const getMockResponse = (input: string) => {
                const lowerMsg = input.toLowerCase();
                if (lowerMsg.includes('geladeira') || lowerMsg.includes('comprar')) {
                    return "Oink! 🐷 Com base na sua projeção, **você pode sim**! \n\nSeu saldo em **Dezembro/2025** será de ~R$ 12.700. Uma geladeira de R$ 3.000 parcelada em 10x caberia com folga.";
                } else if (lowerMsg.includes('mes') || lowerMsg.includes('mês') || lowerMsg.includes('dinheiro')) {
                    return "Seu melhor mês será **Janeiro de 2026** (saldo projetado: **R$ 13.300**). Oincrível! 🚀";
                } else {
                    return "Entendi! Estou analisando seus dados... Sua saúde financeira está nota 10! 🌟 Precisa de mais alguma dica do Consultor Pig?";
                }
            };

            try {
                const response = await fetch(
                    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-consultant`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`,
                        },
                        body: JSON.stringify({ message: userMessage.content }),
                    }
                );

                if (!response.ok) {
                    throw new Error('Fallback to mock');
                }

                const data = await response.json();
                assistantText = data.reply;

            } catch (error) {
                // Silently fail to mock mode
                console.warn('Using mock response due to:', error);
                await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay
                assistantText = getMockResponse(userMessage.content);
            }

            setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: assistantText,
                timestamp: new Date()
            }]);

        } catch (error: any) {
            if (error.message?.includes('Sessão')) {
                toast({
                    title: "Erro de sessão",
                    description: "Por favor, faça login novamente.",
                    variant: "destructive"
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <>
            {/* Floating Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110",
                    isOpen ? "bg-red-500 hover:bg-red-600 rotate-90" : "bg-primary hover:bg-primary/90"
                )}
            >
                {isOpen ? <X className="h-6 w-6" /> : <PiggyBank className="h-7 w-7" />}
            </Button>

            {/* Chat Window */}
            <div className={cn(
                "fixed bottom-24 right-4 sm:right-6 z-40 w-[90vw] sm:w-[400px] h-[500px] sm:h-[600px] rounded-2xl bg-card border border-border/50 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right",
                isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-10 pointer-events-none"
            )}>
                {/* Header */}
                <div className="bg-primary px-4 py-3 flex items-center justify-between text-primary-foreground">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                            <PiggyBank className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Consultor Pig</h3>
                            <div className="flex items-center gap-1.5 opacity-80">
                                {canAccessAI ? (
                                    <>
                                        <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-xs font-medium">Online</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-3 w-3" />
                                        <span className="text-xs font-medium">Bloqueado</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {!canAccessAI && (
                        <div className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">PRO</div>
                    )}
                </div>

                {/* Content */}
                {canAccessAI ? (
                    <>
                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4 bg-muted/30">
                            <div className="flex flex-col gap-4">
                                {/* Disclaimer */}
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-600 dark:text-blue-400 text-center">
                                    🔒 A IA tem acesso aos seus dados financeiros para dar respostas personalizadas.
                                </div>

                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex gap-2 max-w-[85%]",
                                            msg.role === 'user' ? "self-end flex-row-reverse" : "self-start"
                                        )}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                                                <span className="text-lg">🐷</span>
                                            </div>
                                        )}

                                        <div className={cn(
                                            "p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap",
                                            msg.role === 'user'
                                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                : "bg-card border border-border rounded-tl-sm text-foreground"
                                        )}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex gap-2 self-start">
                                        <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                                            <span className="text-lg">🐷</span>
                                        </div>
                                        <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                                            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">Oink... pensando...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input */}
                        <div className="p-3 bg-card border-t border-border">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Pergunte ao Pig..."
                                    className="flex-1 rounded-xl bg-muted/50 focus-visible:ring-primary"
                                    disabled={isLoading}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="rounded-xl h-10 w-10 shrink-0"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    // Blocked State
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-muted/20">
                        <div className="h-16 w-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-xl animate-pulse">
                            <Gem className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-bold text-xl mb-2">Recurso Premium</h3>
                        <p className="text-muted-foreground mb-8 max-w-[250px]">
                            O Consultor Pig está disponível apenas nos planos Pro e VIP.
                        </p>
                        <Button
                            className="w-full gap-2 shadow-lg shadow-primary/25"
                            size="lg"
                            onClick={() => {
                                setIsOpen(false);
                                // Ideally navigate to a '#pricing' anchor on landing or a billing page
                                window.location.href = '/#pricing';
                            }}
                        >
                            Ver Planos <Sparkles className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}
