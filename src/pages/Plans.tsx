
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { PricingCard } from '@/components/PricingCard';

export default function Plans() {
    return (
        <AppLayout>
            <PageHeader
                title="Planos Disponíveis"
                description="Escolha o plano ideal para sua jornada financeira."
            />

            <div className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start pt-8">
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
                        cta="Selecionar Plano Grátis"
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
        </AppLayout>
    );
}
