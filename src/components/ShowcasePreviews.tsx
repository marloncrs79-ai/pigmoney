
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Receipt, CreditCard, PiggyBank, TrendingUp, ArrowUpRight, ArrowDownRight, MoreHorizontal, ShoppingBag, Coffee, Car } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

// Simple Animated Number
const AnimatedValue = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setDisplayValue(value), 500);
        return () => clearTimeout(timer);
    }, [value]);

    return (
        <span className="transition-all duration-1000 ease-out">
            {formatCurrency(displayValue)}
        </span>
    );
};

export function CardsPreview() {
    return (
        <div className="w-full max-w-md mx-auto space-y-4 p-4">
            {/* Card 1 */}
            <div className="relative h-56 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 shadow-xl transform transition-transform hover:scale-105 duration-300">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="text-sm text-gray-400">Mastercard Black</p>
                        <p className="font-mono text-lg tracking-widest">•••• 8829</p>
                    </div>
                    <CreditCard className="h-8 w-8 text-gray-400" />
                </div>

                <div className="mt-8 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Fatura Atual</span>
                        <span className="font-bold text-lg"><AnimatedValue value={3450.90} /></span>
                    </div>
                    <Progress value={45} className="h-2 bg-gray-700" />
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Limite: R$ 15.000</span>
                        <span>Disp: R$ 11.549</span>
                    </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-xs text-gray-400 mt-4">
                    <span>José Carlos</span>
                    <span>12/29</span>
                </div>
            </div>

            {/* Simulated Second Card behind */}
            <div className="h-12 mx-4 -mt-6 rounded-b-xl bg-gray-200 border border-t-0 shadow-sm opacity-50 relative -z-10" />
        </div>
    );
}

export function ExpensesPreview() {
    return (
        <Card className="w-full max-w-md mx-auto shadow-xl border-t-4 border-t-red-500">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Despesas Recentes</span>
                    <Receipt className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 divide-y">
                {[
                    { icon: ShoppingBag, label: 'Supermercado', date: 'Hoje', val: -450.20, color: 'bg-orange-100 text-orange-600' },
                    { icon: Car, label: 'Uber', date: 'Ontem', val: -24.90, color: 'bg-blue-100 text-blue-600' },
                    { icon: Coffee, label: 'Padaria', date: 'Ontem', val: -15.50, color: 'bg-amber-100 text-amber-600' },
                    { icon: Wallet, label: 'Transferência', date: '12 Dez', val: -1200.00, color: 'bg-gray-100 text-gray-600' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-4 hover:bg-gray-50/50 transition-colors px-2 rounded-lg cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.color}`}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{item.label}</p>
                                <p className="text-xs text-muted-foreground">{item.date}</p>
                            </div>
                        </div>
                        <span className="font-bold text-red-500">{formatCurrency(item.val)}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export function IncomePreview() {
    return (
        <Card className="w-full max-w-md mx-auto shadow-xl bg-gradient-to-br from-emerald-50 to-white border-t-4 border-t-emerald-500">
            <CardContent className="p-6 space-y-6">
                <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Receita Total (Dez)</p>
                    <p className="text-4xl font-extrabold text-emerald-600">
                        <AnimatedValue value={15240.00} />
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white border shadow-sm space-y-2">
                        <div className="flex items-center gap-2 text-emerald-600">
                            <Wallet className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase">Principal</span>
                        </div>
                        <p className="font-bold text-lg">R$ 12.500</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border shadow-sm space-y-2">
                        <div className="flex items-center gap-2 text-blue-600">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase">Extras</span>
                        </div>
                        <p className="font-bold text-lg">R$ 2.740</p>
                    </div>
                </div>

                <div className="relative pt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Meta Mensal</span>
                        <span>102%</span>
                    </div>
                    <Progress value={100} className="h-3 bg-emerald-100" />
                </div>
            </CardContent>
        </Card>
    );
}

export function PlanningPreview() {
    return (
        <Card className="w-full max-w-md mx-auto shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-900 text-white">
                <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    Fluxo de Caixa Futuro
                </CardTitle>
            </CardHeader>
            <div className="p-6 bg-slate-50">
                <div className="flex items-end justify-between h-40 gap-2">
                    {[
                        { mon: 'Dez', h: '60%', val: 12000, active: true },
                        { mon: 'Jan', h: '65%', val: 13500, active: false },
                        { mon: 'Fev', h: '55%', val: 11000, active: false },
                        { mon: 'Mar', h: '75%', val: 15000, active: false },
                        { mon: 'Abr', h: '40%', val: 8000, active: false },
                        { mon: 'Mai', h: '80%', val: 16000, active: false },
                    ].map((bar, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                            <div
                                className={`w-full rounded-t-lg transition-all duration-500 relative ${bar.active ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-slate-300 group-hover:bg-slate-400'}`}
                                style={{ height: bar.h }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    R$ {bar.val}
                                </div>
                            </div>
                            <span className="text-xs font-bold text-slate-500">{bar.mon}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-4 border-t bg-white flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Saldo Projetado (6 meses)</span>
                <span className="font-bold text-emerald-600">+ R$ 42.300</span>
            </div>
        </Card>
    );
}

export function PiggyBankPreview() {
    return (
        <Card className="w-full max-w-md mx-auto shadow-xl border-none bg-gradient-to-b from-pink-50 to-white">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <div className="p-2 bg-pink-100 rounded-full">
                        <PiggyBank className="h-6 w-6 text-pink-500" />
                    </div>
                    <span className="text-xs font-bold bg-white px-2 py-1 rounded-full border text-muted-foreground">Meta: Viagem</span>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
                <div className="text-center">
                    <p className="text-3xl font-extrabold text-pink-600">R$ 8.500</p>
                    <p className="text-sm text-muted-foreground">acumulados de R$ 12.000</p>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-pink-700">
                        <span>70% Concluído</span>
                        <span>Faltam R$ 3.500</span>
                    </div>
                    <Progress value={70} className="h-4 bg-pink-100" />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="h-12 bg-white rounded-lg border border-pink-100 flex items-center justify-center shadow-sm">
                            <div className="h-1.5 w-8 bg-pink-100 rounded-full" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function AiChatPreview() {
    return (
        <Card className="w-full max-w-md mx-auto shadow-xl border-none bg-gradient-to-b from-purple-50 to-white overflow-hidden">
            <CardHeader className="bg-purple-600 text-white p-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <PiggyBank className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-base">Consultor Pig</CardTitle>
                        <p className="text-xs text-purple-100 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                            Online agora
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 h-[320px] relative flex flex-col">
                <div className="flex-1 p-4 space-y-4 overflow-hidden">
                    {/* Bot Message */}
                    <div className="flex gap-3 max-w-[90%]">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-1">
                            <PiggyBank className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="space-y-1">
                            <div className="bg-white border p-3 rounded-2xl rounded-tl-none text-sm shadow-sm text-gray-700">
                                <p>Olá! Percebi que você gastou <strong>R$ 245,00</strong> em transporte este mês. 🚗</p>
                            </div>
                            <div className="bg-white border p-3 rounded-2xl rounded-tl-none text-sm shadow-sm text-gray-700">
                                <p>Isso é <strong>15% a menos</strong> que o mês passado. Parabéns pela economia! 🎉</p>
                            </div>
                        </div>
                    </div>

                    {/* User Message */}
                    <div className="flex gap-3 max-w-[90%] ml-auto flex-row-reverse">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-1">
                            <div className="h-4 w-4 rounded-full bg-gray-400" />
                        </div>
                        <div className="bg-purple-600 text-white p-3 rounded-2xl rounded-tr-none text-sm shadow-sm">
                            <p>Obrigado! Quanto eu posso investir com essa sobra?</p>
                        </div>
                    </div>

                    {/* Bot Typing */}
                    <div className="flex gap-3 max-w-[90%]">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-1">
                            <PiggyBank className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="bg-white border p-3 py-4 rounded-2xl rounded-tl-none text-sm shadow-sm w-16 flex justify-center gap-1">
                            <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                </div>

                {/* Simulated Input Area */}
                <div className="p-3 border-t bg-white mt-auto">
                    <div className="relative">
                        <div className="h-10 w-full bg-gray-100 rounded-full border px-4 flex items-center text-sm text-gray-400 select-none">
                            Digite sua dúvida...
                        </div>
                        <div className="absolute right-1 top-1 h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center shadow-sm">
                            <ArrowUpRight className="h-4 w-4 text-white" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
