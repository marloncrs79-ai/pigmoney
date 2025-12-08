
import {
    CheckCircle2,
    ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    CardsPreview,
    ExpensesPreview,
    IncomePreview,
    PlanningPreview,
    PiggyBankPreview,
    AiChatPreview
} from './ShowcasePreviews';

interface FeatureSection {
    title: string;
    description: string;
    imageAlt: string;
    features: string[];
    align: 'left' | 'right';
    gradient: string;
    component: React.ReactNode;
}

const features: FeatureSection[] = [
    {
        title: "Gestão Estratégica de Cartões",
        description: "Centralize a gestão de todos os seus cartões de crédito em um único painel inteligente. Acompanhe o consumo de limites em tempo real, receba alertas estratégicos de fechamento de fatura e evite juros desnecessários.",
        imageAlt: "Gestão de Cartões de Crédito",
        features: [
            "Monitoramento unificado de múltiplos cartões",
            "Visualização intuitiva de limites disponíveis",
            "Alertas proativos de vencimento e fechamento"
        ],
        align: 'right',
        gradient: "from-emerald-500/20 to-green-500/20",
        component: <CardsPreview />
    },
    {
        title: "Inteligência em Despesas",
        description: "Transforme dados brutos em inteligência financeira. Nossa categorização avançada permite identificar instantaneamente para onde estão indo seus recursos.",
        imageAlt: "Tela de Despesas",
        features: [
            "Categorização automática e inteligente",
            "Distinção clara entre gastos fixos e variáveis",
            "Análise de impacto no orçamento mensal"
        ],
        align: 'left',
        gradient: "from-green-500/20 to-teal-500/20",
        component: <ExpensesPreview />
    },
    {
        title: "Domínio de Receitas",
        description: "Domine seu fluxo de caixa com uma visão abrangente de todas as suas entradas. Mapeie salários, rendimentos variáveis, bônus e dividendos.",
        imageAlt: "Tela de Receitas",
        features: [
            "Análise detalhada da composição salarial",
            "Histórico evolutivo de receitas",
            "Dashboards de crescimento de renda"
        ],
        align: 'right',
        gradient: "from-emerald-400/20 to-green-400/20",
        component: <IncomePreview />
    },
    {
        title: "Planejamento Financeiro Avançado",
        description: "Antecipe-se ao futuro com nosso poderoso motor de projeção. Visualize seu fluxo de caixa para os próximos 12 meses e identifique meses críticos.",
        imageAlt: "Tela de Planejamento",
        features: [
            "Projeção de saldo com 12 meses de horizonte",
            "Identificação antecipada de períodos de escassez",
            "Simulação de cenários financeiros"
        ],
        align: 'left',
        gradient: "from-teal-500/20 to-emerald-500/20",
        component: <PlanningPreview />
    },
    {
        title: "Conquista de Objetivos",
        description: "Materialize seus sonhos com um sistema de metas tangíveis. Crie cofrinhos personalizados para cada objetivo — seja a viagem dos sonhos ou a reserva de emergência.",
        imageAlt: "Tela de Cofrinhos",
        features: [
            "Metas financeiras personalizáveis",
            "Gamificação do progresso com barras visuais",
            "Segregação inteligente de reservas"
        ],
        align: 'right',
        gradient: "from-green-600/20 to-emerald-600/20",
        component: <PiggyBankPreview />
    },
    {
        title: "Consultor Financeiro 24h",
        description: "Tenha um especialista financeiro no seu bolso. Nossa IA analisa seus gastos, sugere economias e responde dúvidas sobre investimentos em tempo real.",
        imageAlt: "Chat com IA",
        features: [
            "Dicas personalizadas de economia",
            "Análise automática de hábitos de consumo",
            "Tire dúvidas sobre finanças a qualquer hora"
        ],
        align: 'left',
        gradient: "from-purple-500/20 to-indigo-500/20",
        component: <AiChatPreview />
    }
];

export function AppShowcase() {
    return (
        <div className="flex flex-col">
            {/* Header Section */}
            <section className="py-20 text-center bg-muted/30">
                <div className="container px-4 mx-auto max-w-3xl">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                        Por dentro do <span className="text-primary">PigMoney</span>
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Uma tour completa pelas funcionalidades que vão transformar sua vida financeira.
                    </p>
                </div>
            </section>

            {/* Feature Layers */}
            {features.map((feature, index) => (
                <section
                    key={index}
                    className={cn(
                        "py-20 lg:py-32 overflow-hidden",
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    )}
                >
                    <div className="container px-4 mx-auto">
                        <div className={cn(
                            "grid lg:grid-cols-2 gap-12 lg:gap-24 items-center",
                            // Inverted logic relative to 'align' prop usage below
                        )}>

                            {/* Component Column */}
                            <div className={cn(
                                "relative flex justify-center",
                                feature.align === 'left' ? "lg:order-1" : "lg:order-2"
                            )}>
                                {/* Background Glow */}
                                <div className={cn(
                                    "absolute inset-0 blur-3xl rounded-full opacity-40 transform scale-110",
                                    "bg-gradient-to-tr", feature.gradient
                                )} />

                                {/* Interactive Component Container */}
                                <div className="relative z-10 w-full max-w-md lg:max-w-xl transform transition-transform hover:scale-[1.02] duration-500">
                                    {feature.component}
                                </div>
                            </div>

                            {/* Content Column */}
                            <div className={cn(
                                "space-y-8 relative",
                                feature.align === 'left' ? "lg:order-2" : "lg:order-1"
                            )}>
                                {/* Text Background Glow */}
                                <div className="absolute -inset-4 bg-primary/5 blur-2xl rounded-3xl -z-10" />

                                <div className="space-y-4">
                                    <h3 className="text-3xl font-bold tracking-tight text-gray-900">
                                        {feature.title}
                                    </h3>
                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>

                                <ul className="space-y-4">
                                    {feature.features.map((item, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            </div>
                                            <span className="text-gray-700 font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="pt-4">
                                    <Button
                                        variant="outline"
                                        className="group border-primary/20 hover:bg-primary/5 text-primary rounded-full px-6"
                                        onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                                    >
                                        Quero saber mais
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            ))}

            {/* Final CTA Strip */}
            <section className="py-16 bg-primary text-primary-foreground">
                <div className="container px-4 mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-6">Gostou do que viu?</h2>
                    <Button
                        size="xl"
                        variant="secondary"
                        className="rounded-full px-10 shadow-xl hover:scale-105 transition-transform"
                        onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Ver Planos Disponíveis
                    </Button>
                </div>
            </section>
        </div>
    );
}
