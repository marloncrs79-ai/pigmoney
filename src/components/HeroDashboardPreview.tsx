
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Receipt, CreditCard, PiggyBank, TrendingUp, Sparkles, LayoutDashboard, CheckSquare, Calendar, BarChart3, HelpCircle, Settings, ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// Custom CountUp Component for "Live" movement
const AnimatedNumber = ({ value, duration = 2000, delay = 0, formatter = (v: number) => v.toFixed(2) }: { value: number, duration?: number, delay?: number, formatter?: (v: number) => string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;

            if (progress < delay) {
                animationFrame = requestAnimationFrame(animate);
                return;
            }

            const relativeProgress = progress - delay;
            const percentage = Math.min(relativeProgress / duration, 1);

            // Easing function (easeOutExpo)
            const ease = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

            setCount(value * ease(percentage));

            if (percentage < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration, delay]);

    return <>{formatter(count)}</>;
};

export function HeroDashboardPreview() {
    const pieData = [{ name: 'Serviços', value: 700, color: 'hsl(221, 83%, 53%)' }, { name: 'Outros', value: 1000, color: '#e5e7eb' }];

    return (
        <div className="relative rounded-3xl border border-border/40 bg-card shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[800px] md:max-h-[600px]">

            {/* Sidebar Simulation */}
            <div className="hidden md:flex w-64 flex-col border-r border-border bg-card p-4 space-y-6">
                {/* Logo */}
                <div className="flex items-center gap-2 px-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                        <PiggyBank className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">PIGMONEY</span>
                </div>

                {/* User Profile */}
                <div className="px-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-3 w-3 text-secondary" />
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">SUA CONTA</span>
                    </div>
                    <div className="font-bold text-foreground">JOSÉ CARLOS</div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                    {[
                        { icon: LayoutDashboard, label: 'Dashboard', active: true },
                        { icon: Receipt, label: 'Despesas' },
                        { icon: CreditCard, label: 'Cartões' },
                        { icon: Wallet, label: 'Receitas' },
                        { icon: PiggyBank, label: 'Cofrinho' },
                        { icon: CheckSquare, label: 'Tarefas' },
                        { icon: Calendar, label: 'Planejamento' },
                        { icon: BarChart3, label: 'Relatórios' },
                        { icon: HelpCircle, label: 'Guia' },
                        { icon: Settings, label: 'Configurações' },
                    ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${item.active ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-muted-foreground hover:bg-muted'}`}>
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </div>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-background/50 p-4 md:p-8 overflow-y-auto">

                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Dashboard</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Visão geral de dezembro de 2025</span>
                        <span className="text-success text-xs font-medium bg-success/10 px-2 py-0.5 rounded-full cursor-pointer hover:bg-success/20 transition-colors">Saiba mais</span>
                    </div>
                </div>

                {/* Top Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Receita */}
                    <Card className="rounded-2xl border-border bg-success/5 border-success/20 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-muted-foreground">Receita Mensal</span>
                                <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center text-success">
                                    <Wallet className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-success">
                                <AnimatedNumber value={15000} formatter={formatCurrency} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Despesas Fixas */}
                    <Card className="rounded-2xl border-border bg-card relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-muted-foreground">Despesas Fixas</span>
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                    <Receipt className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                                <AnimatedNumber value={1700} formatter={formatCurrency} delay={200} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">2 ativas</p>
                        </CardContent>
                    </Card>

                    {/* Fatura */}
                    <Card className="rounded-2xl border-border bg-card relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-muted-foreground">Fatura do Mês</span>
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                    <CreditCard className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                                <AnimatedNumber value={600} formatter={formatCurrency} delay={400} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">1 cartões</p>
                        </CardContent>
                    </Card>

                    {/* Cofrinho */}
                    <Card className="rounded-2xl border-border bg-success/5 border-success/20 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-muted-foreground">Cofrinho</span>
                                <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center text-success">
                                    <PiggyBank className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-success">
                                <AnimatedNumber value={0} formatter={formatCurrency} delay={600} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Saldo Previsto Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-success" />
                                <h3 className="font-bold text-lg">Saldo Previsto</h3>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm font-bold bg-primary text-primary-foreground px-4 py-2 rounded-full cursor-pointer shadow-lg shadow-primary/20 hover:scale-105 transition-all duration-200">
                                Dezembro 2025 <ChevronDown className="h-4 w-4" />
                            </div>
                        </div>

                        {/* Yellow Highlight Card - Current Month */}
                        <div className="p-6 rounded-3xl bg-secondary/20 border border-secondary/20 flex flex-col justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <span className="text-sm text-secondary-foreground/80 font-medium mb-1">dezembro de 2025</span>
                            <span className="text-3xl md:text-4xl font-bold text-success">
                                <AnimatedNumber value={12700} formatter={formatCurrency} delay={800} />
                            </span>
                        </div>

                        {/* Next Month Preview */}
                        <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 flex flex-col justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
                            <span className="text-sm text-muted-foreground font-medium mb-1">janeiro de 2026</span>
                            <span className="text-2xl md:text-3xl font-bold text-foreground/80">
                                <AnimatedNumber value={13300} formatter={formatCurrency} delay={1000} />
                            </span>
                        </div>

                        {/* Summary Table */}
                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Receita</span>
                                <span className="font-medium text-success">
                                    <AnimatedNumber value={15000} formatter={formatCurrency} delay={1200} />
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Despesas Fixas</span>
                                <span className="font-medium text-foreground">
                                    <AnimatedNumber value={1700} formatter={formatCurrency} delay={1300} />
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Variáveis (est.)</span>
                                <span className="font-medium text-foreground">R$ 0,00</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Fatura Cartão</span>
                                <span className="font-medium text-foreground">
                                    <AnimatedNumber value={600} formatter={formatCurrency} delay={1400} />
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Para Onde Foi o Dinheiro */}
                    <Card className="rounded-3xl border-border bg-card h-full min-h-[300px]">
                        <CardHeader>
                            <CardTitle className="text-lg">Para Onde Foi o Dinheiro</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center h-[calc(100%-80px)]">
                            <div className="h-48 w-48 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={0}
                                            dataKey="value"
                                            startAngle={90}
                                            endAngle={-270}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center Text specific to the design might be hard with just Pie, but let's emulate the 'Serviços' legend on the side */}
                            </div>

                            <div className="w-full mt-4 px-2">
                                <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-primary" />
                                        <span className="text-sm font-medium text-muted-foreground">Serviços</span>
                                    </div>
                                    <span className="text-sm font-bold">R$ 700,00</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
