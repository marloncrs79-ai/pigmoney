import React, { Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { AppShowcase } from '@/components/AppShowcase';
import { cn } from "@/lib/utils";
import { PricingCard } from '@/components/PricingCard';
import {
    PiggyBank,
    TrendingUp,
    Users,
    ArrowRight,
    CheckCircle2,
    Star,
    Wallet,
    LayoutDashboard,
    Loader2
} from "lucide-react";

// Lazy load heavy components (Recharts inside)
const HeroDashboardPreview = lazy(() =>
    import("@/components/HeroDashboardPreview").then(module => ({ default: module.HeroDashboardPreview }))
);

export default function Landing() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                            <PiggyBank className="h-6 w-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground">PIGMONEY</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                        <a href="#features" className="hover:text-primary transition-colors">Funcionalidades</a>
                        <a href="#benefits" className="hover:text-primary transition-colors">Benefícios</a>
                        <a href="#testimonials" className="hover:text-primary transition-colors">Depoimentos</a>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <Button onClick={() => navigate('/dashboard')} className="hover-lift gap-2">
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Button>
                        ) : (
                            <Button onClick={() => navigate('/auth')} className="hover-lift">
                                Entrar
                            </Button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-20 lg:pt-32 lg:pb-28">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
                </div>

                <div className="container px-4 mx-auto text-center">
                    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary hover:bg-primary/20 transition-colors cursor-pointer mb-8">
                        <span className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-primary" />
                            Novo: Integração com Inteligência Artificial
                        </span>
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl mb-6 max-w-4xl mx-auto leading-tight">
                        O controle financeiro que <br className="hidden sm:block" />
                        <span className="text-green-500">você</span> precisava.
                    </h1>

                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10 leading-relaxed">
                        Esqueça as planilhas chatas. O PigMoney é a forma mais simples, divertida e inteligente de organizar suas finanças, planejar sonhos e ver seu dinheiro crescer.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="xl" className="w-full sm:w-auto text-lg group" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
                            Conhecer planos
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </div>

                    {/* Smart Dashboard Preview */}
                    <div className="mt-16 sm:mt-24 relative mx-auto max-w-6xl animate-fade-in group">
                        {/* Mascot - Floating Pig */}
                        <div className="absolute -top-12 -left-4 sm:-top-20 sm:-left-20 z-20 animate-bounce-in" style={{ animationDelay: '0.5s' }}>
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-500/30 blur-2xl rounded-full" />
                                <div className="h-24 w-24 sm:h-32 sm:w-32 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl transform -rotate-12 hover:rotate-0 transition-transform duration-300 border-4 border-white/20">
                                    <PiggyBank className="h-12 w-12 sm:h-16 sm:w-16 text-white drop-shadow-md" />
                                </div>
                                {/* Coin particles */}
                                <div className="absolute -top-4 -right-4 h-8 w-8 bg-yellow-400 rounded-full border-2 border-yellow-200 animate-bounce delay-75" />
                                <div className="absolute bottom-2 -left-6 h-6 w-6 bg-yellow-400 rounded-full border-2 border-yellow-200 animate-bounce delay-150" />
                            </div>
                        </div>

                        <div className="transform transition-all duration-500 group-hover:scale-[1.01]">
                            <Suspense fallback={
                                <div className="h-[400px] md:h-[600px] w-full rounded-3xl border border-border/40 bg-card/50 backdrop-blur animate-pulse flex items-center justify-center">
                                    <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                                </div>
                            }>
                                <HeroDashboardPreview />
                            </Suspense>
                        </div>

                        {/* Decoration blobs */}
                        <div className="absolute -inset-x-20 -top-20 -bottom-20 z-[-1] opacity-40 bg-gradient-to-tr from-primary/30 via-transparent to-accent/30 blur-[100px]" />
                    </div>
                </div>
            </section>
            {/* App Showcase Section */}
            <AppShowcase />

            {/* Social Proof Numbers */}
            <div className="bg-primary/5 border-y border-primary/10 py-12">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <StatItem value="+10k" label="Usuários Ativos" delay={0} />
                        <StatItem value="R$ 2M+" label="Economizados" delay={100} />
                        <StatItem value="50k+" label="Metas Realizadas" delay={200} />
                        <StatItem value="4.9/5" label="Avaliação Média" delay={300} />
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <section id="features" className="py-20 sm:py-32 bg-muted/30">
                <div className="container px-4 mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Tudo o que você precisa em um só lugar</h2>
                        <p className="text-lg text-muted-foreground">
                            O PigMoney foi desenhado para ser intuitivo e poderoso. Controle gastos, planeje o futuro e alcance seus objetivos.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Users className="h-8 w-8 text-secondary" />}
                            title="Gestão Inteligente"
                            description="Tenha controle total sobre suas despesas e receitas, e planeje seus sonhos com facilidade e sem stress."
                        />
                        <FeatureCard
                            icon={<TrendingUp className="h-8 w-8 text-primary" />}
                            title="Projeção Futura"
                            description="Não olhe apenas para o passado. Veja como estará seu saldo daqui a 6 meses com nossa IA."
                        />
                        <FeatureCard
                            icon={<PiggyBank className="h-8 w-8 text-accent" />}
                            title="Cofrinhos Mágicos"
                            description="Crie objetivos personalizados (viagem, casa nova) e acompanhe o progresso visualmente."
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 sm:py-32">
                <div className="container px-4 mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Planos que cabem no seu bolso</h2>
                        <p className="text-lg text-muted-foreground">
                            Comece grátis e evolua conforme seus sonhos crescem.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* PIG FREE */}
                        <PricingCard
                            title="Pig Free"
                            price="R$ 0"
                            period="/mês"
                            description="Para quem está começando a organizar a casa."
                            features={[
                                "Registro de despesas ilimitado",
                                "1 Cofrinho (Meta)",
                                "Acesso ao Dashboard Básico",
                                "Sem anúncios"
                            ]}
                            cta="Começar Grátis"
                            planId="free"
                        />

                        {/* PIG PRO */}
                        <PricingCard
                            title="Pig Pro"
                            price="R$ 9,90"
                            period="/mês"
                            description="O favorito! Inteligência máxima para seu dinheiro."
                            highlight
                            features={[
                                "Tudo do Pig Free",
                                "Consultor Pig (IA) Ilimitado",
                                "Cofrinhos Ilimitados",
                                "Projeção de Futuro (6 meses)",
                                "Relatórios Avançados"
                            ]}
                            cta="Quero ser Pro"
                            planId="pro"
                        />

                        {/* PIG ANUAL */}
                        <PricingCard
                            title="Pig Anual"
                            price="R$ 97,00"
                            period="/ano"
                            description="Desconto exclusivo para quem pensa no longo prazo."
                            features={[
                                "Tudo do Pig Pro",
                                "Economia de R$ 21,80 (2 meses grátis)",
                                "Prioridade no suporte",
                                "Badge VIP no perfil",
                                "Acesso antecipado a novidades"
                            ]}
                            cta="Quero Desconto Anual"
                            planId="annual"
                        />
                    </div>
                </div>
            </section>

            {/* Interactive FAQ Section */}
            <section id="faq" className="py-20 bg-muted/50">
                <div className="container px-4 mx-auto max-w-3xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Perguntas Frequentes</h2>
                        <p className="text-muted-foreground">Tire suas dúvidas e comece com confiança.</p>
                    </div>

                    <div className="space-y-4">
                        <FaqItem
                            question="Preciso vincular minha conta bancária?"
                            answer="Não! O PigMoney funciona com inserção manual simplificada ou importação de arquivos. Prezamos pela sua privacidade total e não pedimos senhas de banco."
                        />
                        <FaqItem
                            question="O Consultor Pig (IA) é pago à parte?"
                            answer="No momento, o Consultor Pig está disponível gratuitamente para todos os usuários durante o período beta!"
                        />
                        <FaqItem
                            question="Consigo acessar pelo celular?"
                            answer="Sim! O PigMoney é um Web App totalmente responsivo que funciona perfeitamente no seu navegador mobile, parecendo um aplicativo nativo."
                        />
                        <FaqItem
                            question="É seguro colocar meus dados?"
                            answer="Absolutamente. Utilizamos criptografia de ponta a ponta e seus dados são armazenados de forma segura. Ninguém além de você tem acesso."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                <div className="container px-4 mx-auto text-center relative z-10">
                    <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 tracking-tight">Pronto para dominar seu dinheiro?</h2>
                    <p className="text-primary-foreground/90 text-xl max-w-2xl mx-auto mb-10">
                        Junte-se a milhares de pessoas que já transformaram sua vida financeira com o PigMoney.
                    </p>
                    <Button
                        size="xl"
                        variant="secondary"
                        className="text-foreground font-bold hover:scale-105 transition-transform shadow-xl"
                        onClick={() => navigate('/auth?signup=true')}
                    >
                        Criar conta gratuita
                    </Button>
                    <p className="mt-6 text-sm text-primary-foreground/70">
                        Sem cartão de crédito necessário. Cancele quando quiser.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-background border-t border-border py-12">
                <div className="container px-4 mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                                    <PiggyBank className="h-5 w-5" />
                                </div>
                                <span className="text-lg font-bold">PIGMONEY</span>
                            </div>
                            <p className="text-muted-foreground max-w-sm">
                                A plataforma financeira feita para quem quer crescer. Simples, bonita e eficiente.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Produto</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-primary">Funcionalidades</a></li>
                                <li><a href="#" className="hover:text-primary">Preços</a></li>
                                <li><a href="#" className="hover:text-primary">Segurança</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Empresa</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-primary">Sobre nós</a></li>
                                <li><a href="#" className="hover:text-primary">Contato</a></li>
                                <li><a href="#" className="hover:text-primary">Blog</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} PIGMONEY. Todos os direitos reservados.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <Link to="/terms" className="hover:text-foreground">Termos</Link>
                            <Link to="/privacy" className="hover:text-foreground">Privacidade</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-6 rounded-2xl bg-card border border-border shadow-soft hover:shadow-elevation-2 transition-all hover:-translate-y-1">
            <div className="mb-4 inline-flex p-3 rounded-xl bg-background border border-border shadow-sm">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">
                {description}
            </p>
        </div>
    );
}

function BenefitItem({ text, highlight }: { text: string, highlight?: boolean }) {
    return (
        <div className={cn("flex items-center gap-3 p-2 rounded-lg transition-colors", highlight && "bg-primary/10 border border-primary/20")}>
            <div className={cn("h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0", highlight ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary")}>
                <CheckCircle2 className="h-4 w-4" />
            </div>
            <span className={cn("text-lg", highlight ? "font-semibold text-foreground" : "text-foreground/80")}>{text}</span>
        </div>
    );
}

function StatItem({ value, label, delay }: { value: string, label: string, delay: number }) {
    return (
        <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: `${delay} ms` }}>
            <span className="text-3xl md:text-4xl font-extrabold text-foreground mb-1">{value}</span>
            <span className="text-sm text-muted-foreground">{label}</span>
        </div>
    );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden transition-all duration-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 md:p-6 text-left hover:bg-muted/50 transition-colors"
            >
                <span className="font-semibold text-lg">{question}</span>
                <ArrowRight className={cn("h-5 w-5 text-muted-foreground transition-transform duration-300", isOpen ? "rotate-90" : "rotate-0")} />
            </button>
            <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
            )}>
                <div className="p-4 md:p-6 pt-0 text-muted-foreground leading-relaxed">
                    {answer}
                </div>
            </div>
        </div>
    );
}

function ShoppingBagIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    )
}
