import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PricingCard } from '@/components/PricingCard';
import {
    PiggyBank,
    TrendingUp,
    ArrowRight,
    CheckCircle2,
    Star,
    Wallet,
    LayoutDashboard,
    Loader2,
    Receipt,
    CreditCard,
    Target,
    Sparkles,
    Shield,
    Zap,
    ChevronLeft,
    ChevronRight,
    Quote,
    BadgeDollarSign,
    Calculator,
    BarChart3,
    MessageCircle,
    Clock,
    Lock,
    Smartphone,
    Play
} from "lucide-react";

// Lazy load heavy components
const HeroDashboardPreview = lazy(() =>
    import("@/components/HeroDashboardPreview").then(module => ({ default: module.HeroDashboardPreview }))
);

// Testimonials data with Brazilian names
const testimonials = [
    {
        id: 1,
        name: "Ricardo Mendes",
        role: "Empresário",
        image: "/testimonial-1.jpg",
        quote: "Depois que comecei a usar o PigMoney, finalmente consegui organizar minhas finanças pessoais e da empresa. Em 3 meses, consegui guardar mais de R$ 8.000. É absurdo como eu gastava sem perceber antes.",
        rating: 5
    },
    {
        id: 2,
        name: "Lucas Ferreira",
        role: "Desenvolvedor",
        image: "/testimonial-2.jpg",
        quote: "Já testei vários apps de finanças, mas o PigMoney é diferente. A interface é linda, o Consultor Pig me dá insights que eu nunca teria sozinho, e os cofrinhos motivam demais. Já realizei 2 metas esse ano!",
        rating: 5
    },
    {
        id: 3,
        name: "André Santos",
        role: "Professor",
        image: "/testimonial-3.jpg",
        quote: "Com salário de professor, cada centavo conta. O PigMoney me ajudou a ver onde eu estava desperdiçando dinheiro. Cortei gastos invisíveis e hoje consigo investir todo mês. Recomendo demais!",
        rating: 5
    },
    {
        id: 4,
        name: "Thiago Oliveira",
        role: "Freelancer",
        image: "/testimonial-4.jpg",
        quote: "Como freelancer, minha renda varia muito. A função de renda variável do PigMoney foi game changer. Agora tenho controle total e sei exatamente quanto estou ganhando por mês.",
        rating: 5
    },
    {
        id: 5,
        name: "José Carlos",
        role: "Aposentado",
        image: "/testimonial-5.jpg",
        quote: "Nunca fui de tecnologia, mas meu neto me mostrou o PigMoney. É tão simples que até eu consigo usar! Estou guardando para uma viagem com a esposa e já alcancei 70% da meta.",
        rating: 5
    }
];

// Features data with detailed explanations
const features = [
    {
        icon: Wallet,
        title: "Salário & Renda Fixa",
        description: "Configure seu salário uma vez e pronto. O sistema calcula automaticamente sua disponibilidade mensal considerando descontos e benefícios.",
        color: "text-green-500",
        bgColor: "bg-green-500/10"
    },
    {
        icon: BadgeDollarSign,
        title: "Renda Variável Inteligente",
        description: "Recebe comissões, freelances ou extras? Registre facilmente e veja a evolução da sua renda variável mês a mês com gráficos claros.",
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10"
    },
    {
        icon: Receipt,
        title: "Despesas Fixas & Variáveis",
        description: "Separe contas fixas (aluguel, internet) das variáveis (compras, lazer). Veja exatamente para onde vai cada centavo do seu dinheiro.",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10"
    },
    {
        icon: CreditCard,
        title: "Gestão de Cartões",
        description: "Cadastre seus cartões, registre compras parceladas e nunca mais seja pego de surpresa pela fatura. Tudo calculado automaticamente.",
        color: "text-purple-500",
        bgColor: "bg-purple-500/10"
    },
    {
        icon: PiggyBank,
        title: "Cofrinhos de Metas",
        description: "Sonha com uma viagem? Carro novo? Crie cofrinhos personalizados, defina metas e acompanhe o progresso visualmente. Poupar nunca foi tão divertido!",
        color: "text-pink-500",
        bgColor: "bg-pink-500/10"
    },
    {
        icon: BarChart3,
        title: "Projeção de 12 Meses",
        description: "Veja como estará seu saldo nos próximos 12 meses. Identifique meses críticos antes que aconteçam e se prepare.",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10"
    },
    {
        icon: MessageCircle,
        title: "Consultor Pig (IA)",
        description: "Converse com nossa inteligência artificial financeira. Tire dúvidas, peça dicas personalizadas e receba insights baseados nos seus dados reais.",
        color: "text-cyan-500",
        bgColor: "bg-cyan-500/10"
    },
    {
        icon: LayoutDashboard,
        title: "Dashboard Inteligente",
        description: "Tudo em um só lugar: resumo do mês, gráficos de categorias, alertas de gastos excessivos e sua saúde financeira em tempo real.",
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10"
    }
];

export default function Landing() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-rotate testimonials
    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const nextTestimonial = () => {
        setIsAutoPlaying(false);
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setIsAutoPlaying(false);
        setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans overflow-x-hidden">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shadow-lg">
                            <PiggyBank className="h-6 w-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground">PIGMONEY</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                        <a href="#como-funciona" className="hover:text-primary transition-colors">Como Funciona</a>
                        <a href="#funcionalidades" className="hover:text-primary transition-colors">Funcionalidades</a>
                        <a href="#depoimentos" className="hover:text-primary transition-colors">Depoimentos</a>
                        <a href="#precos" className="hover:text-primary transition-colors">Preços</a>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <Button onClick={() => navigate('/dashboard')} className="gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" onClick={() => navigate('/auth')} className="hidden sm:flex">
                                    Entrar
                                </Button>
                                <Button onClick={() => navigate('/auth?signup=true')} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                                    Começar Grátis
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-24 lg:pt-28 lg:pb-32">
                {/* Background Effects */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
                </div>

                <div className="container px-4 mx-auto">
                    <div className="text-center max-w-5xl mx-auto">
                        {/* Badge */}
                        <div className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-600 mb-8 animate-pulse">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Novo: Consultor Pig com Inteligência Artificial
                        </div>

                        {/* Main Headline - Visceral Copy */}
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-foreground mb-6 leading-[1.1]">
                            Chega de terminar o mês <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">sem saber pra onde foi seu dinheiro.</span>
                        </h1>

                        <p className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
                            O PigMoney é o app financeiro que <strong className="text-foreground">finalmente funciona</strong>.
                            Simples de usar, bonito de ver e inteligente o suficiente para te mostrar
                            <span className="text-green-500 font-semibold"> onde você está errando</span>.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                            <Button
                                size="lg"
                                className="text-lg px-8 py-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-xl shadow-green-500/25 group"
                                onClick={() => navigate('/auth?signup=true')}
                            >
                                Começar Grátis Agora
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg px-8 py-6"
                                onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                <Play className="mr-2 h-5 w-5" />
                                Ver Como Funciona
                            </Button>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            ✓ Grátis para sempre no plano básico &nbsp;&nbsp; ✓ Sem cartão de crédito &nbsp;&nbsp; ✓ Cancele quando quiser
                        </p>

                        {/* Hero Dashboard Preview with Pig Mascot */}
                        <div className="mt-16 relative mx-auto max-w-6xl">
                            {/* Floating Pig Mascot */}
                            <div className="absolute -top-8 -left-4 sm:-top-16 sm:-left-16 z-20">
                                <div className="relative animate-bounce" style={{ animationDuration: '3s' }}>
                                    <div className="absolute inset-0 bg-green-500/40 blur-2xl rounded-full scale-150" />
                                    <div className="relative h-20 w-20 sm:h-28 sm:w-28 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl transform -rotate-12 hover:rotate-0 transition-transform duration-300 border-4 border-white/30">
                                        <PiggyBank className="h-10 w-10 sm:h-14 sm:w-14 text-white" />
                                    </div>
                                    {/* Coins */}
                                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-yellow-400 rounded-full border-2 border-yellow-200 shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }} />
                                    <div className="absolute -bottom-1 -left-3 h-5 w-5 bg-yellow-400 rounded-full border-2 border-yellow-200 shadow-lg animate-bounce" style={{ animationDelay: '1s' }} />
                                </div>
                            </div>

                            {/* Speech Bubble */}
                            <div className="absolute -top-4 left-16 sm:left-20 z-20 hidden sm:block">
                                <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-2 shadow-lg border border-border">
                                    <p className="text-sm font-medium text-foreground">Bora organizar suas finanças? 🐷</p>
                                </div>
                            </div>

                            <div className="transform transition-all duration-500 hover:scale-[1.01]">
                                <Suspense fallback={
                                    <div className="h-[400px] md:h-[600px] w-full rounded-3xl border border-border/40 bg-card/50 backdrop-blur animate-pulse flex items-center justify-center">
                                        <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                                    </div>
                                }>
                                    <HeroDashboardPreview />
                                </Suspense>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof Numbers */}
            <section className="py-12 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-green-500/5 border-y border-green-500/10">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <StatItem value="+10.000" label="Usuários Ativos" icon={<Zap className="h-5 w-5" />} />
                        <StatItem value="R$ 2M+" label="Já Economizados" icon={<Wallet className="h-5 w-5" />} />
                        <StatItem value="50.000+" label="Metas Criadas" icon={<Target className="h-5 w-5" />} />
                        <StatItem value="4.9/5" label="Avaliação Média" icon={<Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />} />
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="como-funciona" className="py-24 bg-muted/30">
                <div className="container px-4 mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-green-500 font-semibold text-sm uppercase tracking-wider">Simples assim</span>
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mt-4 mb-6">
                            Como o PigMoney funciona?
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Em 3 passos simples, você sai do caos financeiro para o controle total.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <StepCard
                            number="1"
                            title="Configure seu Perfil"
                            description="Cadastre seu salário, cartões e despesas fixas. Leva menos de 5 minutos e você faz isso só uma vez."
                            icon={<Calculator className="h-6 w-6" />}
                        />
                        <StepCard
                            number="2"
                            title="Registre seus Gastos"
                            description="Adicione seus gastos diários em segundos. O app categoriza automaticamente e calcula tudo pra você."
                            icon={<Receipt className="h-6 w-6" />}
                        />
                        <StepCard
                            number="3"
                            title="Veja a Mágica Acontecer"
                            description="Visualize gráficos claros, receba alertas inteligentes e veja seu dinheiro crescer mês após mês."
                            icon={<TrendingUp className="h-6 w-6" />}
                        />
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="funcionalidades" className="py-24">
                <div className="container px-4 mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-green-500 font-semibold text-sm uppercase tracking-wider">Tudo que você precisa</span>
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mt-4 mb-6">
                            Funcionalidades que fazem a diferença
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Cada detalhe foi pensado para tornar sua vida financeira mais simples e organizada.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {features.map((feature, index) => (
                            <FeatureCard key={index} {...feature} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Carousel */}
            <section id="depoimentos" className="py-24 bg-gradient-to-b from-muted/50 to-background">
                <div className="container px-4 mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-green-500 font-semibold text-sm uppercase tracking-wider">Depoimentos reais</span>
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mt-4 mb-6">
                            Quem usa, recomenda.
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Veja o que nossos usuários têm a dizer sobre a transformação financeira que viveram.
                        </p>
                    </div>

                    {/* Testimonial Carousel */}
                    <div className="max-w-4xl mx-auto">
                        <div className="relative bg-card rounded-3xl border border-border shadow-2xl p-8 md:p-12">
                            {/* Quote Icon */}
                            <div className="absolute -top-6 left-8">
                                <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Quote className="h-6 w-6 text-white" />
                                </div>
                            </div>

                            {/* Testimonial Content */}
                            <div className="pt-4">
                                <div className="flex items-center gap-4 mb-6">
                                    <img
                                        src={testimonials[currentTestimonial].image}
                                        alt={testimonials[currentTestimonial].name}
                                        className="h-16 w-16 rounded-full object-cover border-4 border-green-500/20"
                                    />
                                    <div>
                                        <h4 className="font-bold text-lg text-foreground">{testimonials[currentTestimonial].name}</h4>
                                        <p className="text-muted-foreground">{testimonials[currentTestimonial].role}</p>
                                        <div className="flex gap-1 mt-1">
                                            {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <blockquote className="text-xl md:text-2xl text-foreground/90 leading-relaxed italic">
                                    "{testimonials[currentTestimonial].quote}"
                                </blockquote>
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                                <div className="flex gap-2">
                                    {testimonials.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => { setIsAutoPlaying(false); setCurrentTestimonial(index); }}
                                            className={cn(
                                                "h-2 rounded-full transition-all duration-300",
                                                index === currentTestimonial
                                                    ? "w-8 bg-green-500"
                                                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                                            )}
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" onClick={prevTestimonial}>
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={nextTestimonial}>
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Different Section */}
            <section className="py-24">
                <div className="container px-4 mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                        <div>
                            <span className="text-green-500 font-semibold text-sm uppercase tracking-wider">Por que escolher o PigMoney?</span>
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-4 mb-6">
                                Não somos só mais um app de finanças.
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                Existem dezenas de apps por aí. Mas o PigMoney foi feito para quem
                                <strong className="text-foreground"> cansou de planilhas confusas</strong> e
                                <strong className="text-foreground"> apps complicados demais</strong>.
                            </p>

                            <div className="space-y-4">
                                <DifferentiatorItem
                                    icon={<Smartphone className="h-5 w-5" />}
                                    title="Sem fricção"
                                    description="Funciona no navegador do celular. Não precisa baixar nada."
                                />
                                <DifferentiatorItem
                                    icon={<Lock className="h-5 w-5" />}
                                    title="Privacidade total"
                                    description="Não pedimos senha de banco. Seus dados são só seus."
                                />
                                <DifferentiatorItem
                                    icon={<Sparkles className="h-5 w-5" />}
                                    title="IA que entende você"
                                    description="O Consultor Pig aprende seus hábitos e dá dicas personalizadas."
                                />
                                <DifferentiatorItem
                                    icon={<Clock className="h-5 w-5" />}
                                    title="5 minutos por dia"
                                    description="É só isso que você precisa para ter controle total."
                                />
                            </div>
                        </div>

                        {/* Interactive Pig Mascot */}
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 blur-3xl rounded-full" />
                            <div className="relative">
                                <div className="h-64 w-64 sm:h-80 sm:w-80 bg-gradient-to-br from-green-400 to-green-600 rounded-[3rem] flex items-center justify-center shadow-2xl border-8 border-white/20 transform hover:scale-105 transition-transform duration-300">
                                    <PiggyBank className="h-32 w-32 sm:h-40 sm:w-40 text-white drop-shadow-xl" />
                                </div>
                                {/* Floating Elements */}
                                <div className="absolute -top-4 -right-4 h-16 w-16 bg-yellow-400 rounded-full border-4 border-yellow-200 shadow-xl flex items-center justify-center animate-bounce">
                                    <span className="text-2xl">💰</span>
                                </div>
                                <div className="absolute -bottom-2 -left-4 h-14 w-14 bg-blue-400 rounded-full border-4 border-blue-200 shadow-xl flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
                                    <span className="text-xl">📊</span>
                                </div>
                                <div className="absolute top-1/3 -left-8 h-12 w-12 bg-pink-400 rounded-full border-4 border-pink-200 shadow-xl flex items-center justify-center animate-bounce" style={{ animationDelay: '1s' }}>
                                    <span className="text-lg">🎯</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="precos" className="py-24 bg-muted/30">
                <div className="container px-4 mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-green-500 font-semibold text-sm uppercase tracking-wider">Preços justos</span>
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mt-4 mb-6">
                            Planos que cabem no seu bolso
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Comece grátis e evolua quando estiver pronto. Sem surpresas na fatura.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <PricingCard
                            title="Pig Free"
                            price="R$ 0"
                            period="/mês"
                            description="Para quem está começando a organizar a casa."
                            features={[
                                "Registro de despesas ilimitado",
                                "1 Cofrinho (Meta)",
                                "Dashboard Básico",
                                "Calendário de Vencimentos",
                                "Sem anúncios"
                            ]}
                            cta="Começar Grátis"
                            planId="free"
                        />

                        <PricingCard
                            title="Pig Pro"
                            price="R$ 9,90"
                            period="/mês"
                            description="O favorito! Controle total com inteligência."
                            highlight
                            features={[
                                "Tudo do Pig Free",
                                "Consultor Pig (IA) Ilimitado",
                                "Cofrinhos Ilimitados",
                                "Projeção de 12 Meses",
                                "Relatórios Avançados",
                                "Gestão de Cartões"
                            ]}
                            cta="Quero ser Pro"
                            planId="pro"
                        />

                        <PricingCard
                            title="Pig Anual"
                            price="R$ 97"
                            period="/ano"
                            description="Economia de 2 meses para quem pensa longe."
                            features={[
                                "Tudo do Pig Pro",
                                "Economia de R$ 21,80",
                                "Prioridade no Suporte",
                                "Badge VIP no Perfil",
                                "Acesso Antecipado",
                                "Cashback em Novidades"
                            ]}
                            cta="Economizar Agora"
                            planId="annual"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24">
                <div className="container px-4 mx-auto max-w-3xl">
                    <div className="text-center mb-12">
                        <span className="text-green-500 font-semibold text-sm uppercase tracking-wider">FAQ</span>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-4 mb-4">Perguntas Frequentes</h2>
                    </div>

                    <div className="space-y-4">
                        <FaqItem
                            question="Preciso vincular minha conta bancária?"
                            answer="Não! O PigMoney funciona com inserção manual simplificada. Prezamos pela sua privacidade total e não pedimos senhas ou acesso ao seu banco."
                        />
                        <FaqItem
                            question="Funciona no celular?"
                            answer="Sim! O PigMoney é um Web App totalmente responsivo. Funciona perfeitamente no navegador do seu celular, como se fosse um app nativo."
                        />
                        <FaqItem
                            question="Posso cancelar a qualquer momento?"
                            answer="Claro! Não tem fidelidade. Se não gostar, cancela em 2 cliques e não cobra mais nada. Mas a gente aposta que você vai amar."
                        />
                        <FaqItem
                            question="Meus dados estão seguros?"
                            answer="Absolutamente. Usamos criptografia de ponta a ponta e infraestrutura de nível bancário. Seus dados são só seus, sempre."
                        />
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-gradient-to-r from-green-500 to-emerald-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                <div className="container px-4 mx-auto text-center relative z-10">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-5xl font-black mb-6">
                            Seu eu do futuro vai agradecer.
                        </h2>
                        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                            Daqui a um ano, você pode estar no mesmo lugar financeiro... ou pode ter
                            economizado milhares de reais e realizado seus sonhos. A escolha é sua.
                        </p>
                        <Button
                            size="lg"
                            variant="secondary"
                            className="text-lg px-10 py-6 font-bold hover:scale-105 transition-transform shadow-xl"
                            onClick={() => navigate('/auth?signup=true')}
                        >
                            Começar Minha Transformação
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <p className="mt-6 text-sm text-white/70">
                            Junte-se a mais de 10.000 pessoas que já transformaram suas finanças.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-background border-t border-border py-12">
                <div className="container px-4 mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white">
                                    <PiggyBank className="h-5 w-5" />
                                </div>
                                <span className="text-lg font-bold">PIGMONEY</span>
                            </div>
                            <p className="text-muted-foreground max-w-sm">
                                A plataforma financeira feita para brasileiros que querem sair do vermelho e alcançar seus sonhos.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Produto</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#funcionalidades" className="hover:text-primary">Funcionalidades</a></li>
                                <li><a href="#precos" className="hover:text-primary">Preços</a></li>
                                <li><a href="#" className="hover:text-primary">Segurança</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link to="/terms" className="hover:text-primary">Termos de Uso</Link></li>
                                <li><Link to="/privacy" className="hover:text-primary">Privacidade</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} PIGMONEY. Todos os direitos reservados.</p>
                        <p className="mt-2 md:mt-0">Feito com 💚 no Brasil</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Component: Step Card
function StepCard({ number, title, description, icon }: { number: string, title: string, description: string, icon: React.ReactNode }) {
    return (
        <div className="relative p-6 rounded-2xl bg-card border border-border shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="absolute -top-4 -left-4 h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {number}
            </div>
            <div className="pt-4">
                <div className="mb-4 inline-flex p-3 rounded-xl bg-green-500/10 text-green-500">
                    {icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

// Component: Feature Card
function FeatureCard({ icon: Icon, title, description, color, bgColor }: { icon: any, title: string, description: string, color: string, bgColor: string }) {
    return (
        <div className="p-6 rounded-2xl bg-card border border-border shadow-soft hover:shadow-xl transition-all hover:-translate-y-1 group">
            <div className={cn("mb-4 inline-flex p-3 rounded-xl", bgColor)}>
                <Icon className={cn("h-6 w-6", color)} />
            </div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-green-500 transition-colors">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
    );
}

// Component: Stat Item
function StatItem({ value, label, icon }: { value: string, label: string, icon: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-green-500">{icon}</span>
                <span className="text-3xl md:text-4xl font-black text-foreground">{value}</span>
            </div>
            <span className="text-sm text-muted-foreground">{label}</span>
        </div>
    );
}

// Component: Differentiator Item
function DifferentiatorItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:border-green-500/30 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 flex-shrink-0">
                {icon}
            </div>
            <div>
                <h4 className="font-semibold text-foreground">{title}</h4>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

// Component: FAQ Item
function FaqItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
            >
                <span className="font-semibold text-lg">{question}</span>
                <ChevronRight className={cn("h-5 w-5 text-muted-foreground transition-transform duration-300", isOpen && "rotate-90")} />
            </button>
            <div className={cn(
                "overflow-hidden transition-all duration-300",
                isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
            )}>
                <div className="p-5 pt-0 text-muted-foreground leading-relaxed">
                    {answer}
                </div>
            </div>
        </div>
    );
}
