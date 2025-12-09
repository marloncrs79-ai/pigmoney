import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Wallet, Receipt, CreditCard, PiggyBank, LayoutDashboard, Calendar,
  Lightbulb, ArrowRight, CheckCircle2, TrendingUp, Sparkles,
  DollarSign, Target, BarChart3, Shield, Zap, ChevronRight,
  Clock, Users, Mail, Lock, Star, Rocket, BookOpen
} from 'lucide-react';

// Feature sections data
const features = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    title: 'Dashboard',
    subtitle: 'Seu painel de controle financeiro',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    textColor: 'text-emerald-600',
    description: 'Visão geral de toda sua vida financeira em um único lugar.',
    features: [
      'Receita mensal total',
      'Despesas fixas acumuladas',
      'Fatura do mês nos cartões',
      'Saldo em cofrinhos',
      'Projeção de 6 meses',
      'Onde o dinheiro está indo (gráfico)'
    ]
  },
  {
    id: 'salary',
    icon: Wallet,
    title: 'Salário & Ganhos',
    subtitle: 'Configure sua renda completa',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    textColor: 'text-blue-600',
    isNew: true,
    description: 'Cadastre seu salário com todos os detalhes que fazem diferença.',
    features: [
      'Salário base mensal',
      'Adicionais fixos (insalubridade, gratificação, VA)',
      'Penduricalhos sazonais (fardamento, férias)',
      'Descontos em folha (consignado)',
      'Cálculo automático por mês'
    ]
  },
  {
    id: 'earnings',
    icon: TrendingUp,
    title: 'Renda Variável Inteligente',
    subtitle: 'Para quem tem ganhos extras',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    textColor: 'text-violet-600',
    isNew: true,
    description: 'Registre ganhos de freelance, vendas, bicos e muito mais.',
    features: [
      'Cadastro de ganhos por tipo',
      'Histórico filtrado por Dia/Semana/Mês',
      'Projeção mensal automática',
      'Integração com Dashboard',
      'Acompanhe tendências de renda'
    ]
  },
  {
    id: 'expenses',
    icon: Receipt,
    title: 'Despesas',
    subtitle: 'Fixas e variáveis organizadas',
    color: 'from-rose-500 to-red-600',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
    textColor: 'text-rose-600',
    description: 'Controle todos os seus gastos com categorização inteligente.',
    features: [
      'Despesas fixas recorrentes',
      'Despesas variáveis do dia a dia',
      'Categorias personalizadas',
      'Vinculação com cartões',
      'Parcelamentos automáticos'
    ]
  },
  {
    id: 'cards',
    icon: CreditCard,
    title: 'Cartões de Crédito',
    subtitle: 'Faturas sob controle',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    textColor: 'text-amber-600',
    description: 'Gerencie múltiplos cartões e nunca mais se perca nas faturas.',
    features: [
      'Múltiplos cartões',
      'Fatura atual e próximas',
      'Limite disponível',
      'Fechamento e vencimento',
      'Parcelas futuras projetadas'
    ]
  },
  {
    id: 'piggybank',
    icon: PiggyBank,
    title: 'Cofrinhos',
    subtitle: 'Suas metas de economia',
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    textColor: 'text-pink-600',
    description: 'Separe dinheiro para objetivos específicos e acompanhe o progresso.',
    features: [
      'Múltiplos cofrinhos',
      'Meta opcional por cofrinho',
      'Depósitos e retiradas',
      'Histórico de movimentações',
      'Progresso visual'
    ]
  },
  {
    id: 'planning',
    icon: Calendar,
    title: 'Planejamento',
    subtitle: 'Visão de 12 meses',
    color: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    textColor: 'text-cyan-600',
    description: 'Veja como sua vida financeira vai evoluir nos próximos meses.',
    features: [
      'Projeção automática de 12 meses',
      'Identifica meses críticos',
      'Considera sazonalidade',
      'Prevê término de parcelas',
      'Ajuda a se preparar'
    ]
  },
  {
    id: 'reports',
    icon: BarChart3,
    title: 'Relatórios',
    subtitle: 'Análise visual dos dados',
    color: 'from-teal-500 to-emerald-600',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20',
    textColor: 'text-teal-600',
    description: 'Gráficos e métricas para entender seus padrões financeiros.',
    features: [
      'Gastos por categoria',
      'Evolução mensal',
      'Comparativo de períodos',
      'Tendências de gastos',
      'Exportação de dados'
    ]
  }
];

const quickStartSteps = [
  { step: 1, title: 'Cadastre seu salário', icon: Wallet, description: 'Configure sua renda principal com todos os adicionais' },
  { step: 2, title: 'Adicione despesas fixas', icon: Receipt, description: 'Cadastre contas que se repetem todo mês' },
  { step: 3, title: 'Cadastre seus cartões', icon: CreditCard, description: 'Informe limite, fechamento e vencimento' },
  { step: 4, title: 'Registre gastos do mês', icon: DollarSign, description: 'Durante 30 dias, registre despesas variáveis' },
  { step: 5, title: 'Crie um cofrinho', icon: PiggyBank, description: 'Defina uma meta e comece a guardar' },
];

export default function Help() {
  const [activeFeature, setActiveFeature] = useState(features[0].id);

  const currentFeature = features.find(f => f.id === activeFeature) || features[0];

  return (
    <AppLayout>
      {/* Hero Section */}
      <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-emerald-600 p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTZzLTItNC0yLTYgMi00IDItNi0yLTQtMi02bTAgMjRjMC0yIDItNCAyLTZzLTItNC0yLTYgMi00IDItNi0yLTQtMi02Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-6 w-6" />
            <span className="text-sm font-medium opacity-90">Central de Ajuda</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Guia do PIGMONEY
          </h1>
          <p className="text-lg opacity-90 max-w-xl">
            Aprenda a usar todas as funcionalidades e domine suas finanças em poucos minutos.
          </p>
        </div>
        <Sparkles className="absolute bottom-4 right-4 h-24 w-24 opacity-10" />
      </div>

      {/* What's New Banner */}
      <Card className="mb-8 border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20">
        <CardContent className="py-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/20">
                <Rocket className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-violet-900 dark:text-violet-100">Novidades</h3>
                  <Badge variant="secondary" className="bg-violet-500 text-white hover:bg-violet-600">NEW</Badge>
                </div>
                <p className="text-sm text-violet-700 dark:text-violet-300">Confira as últimas atualizações</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:ml-auto">
              <Badge variant="outline" className="border-violet-300 text-violet-700">Renda Variável</Badge>
              <Badge variant="outline" className="border-violet-300 text-violet-700">Salário Inteligente</Badge>
              <Badge variant="outline" className="border-violet-300 text-violet-700">Login com E-mail</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        Funcionalidades do PigMoney
      </h2>

      <div className="grid gap-6 lg:grid-cols-3 mb-10">
        {/* Feature Selector (Left) */}
        <div className="lg:col-span-1 space-y-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isActive = activeFeature === feature.id;

            return (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200",
                  isActive
                    ? `${feature.bgColor} ${feature.borderColor} border-2 shadow-sm`
                    : "hover:bg-muted/50 border-2 border-transparent"
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  isActive ? `bg-gradient-to-br ${feature.color} text-white` : "bg-muted"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-medium truncate", isActive && feature.textColor)}>
                      {feature.title}
                    </span>
                    {feature.isNew && (
                      <Badge className="bg-violet-500 hover:bg-violet-600 text-[10px] px-1.5 py-0">NEW</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground line-clamp-1">{feature.subtitle}</span>
                </div>
                <ChevronRight className={cn(
                  "h-4 w-4 shrink-0 transition-transform",
                  isActive ? `${feature.textColor}` : "text-muted-foreground",
                  isActive && "translate-x-1"
                )} />
              </button>
            );
          })}
        </div>

        {/* Feature Detail (Right) */}
        <div className="lg:col-span-2">
          <Card className={cn("h-full", currentFeature.borderColor, "border-2")}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br",
                  currentFeature.color
                )}>
                  <currentFeature.icon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold">{currentFeature.title}</h3>
                    {currentFeature.isNew && (
                      <Badge className="bg-violet-500 hover:bg-violet-600">NOVO</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{currentFeature.description}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {currentFeature.features.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className={cn("h-4 w-4 shrink-0", currentFeature.textColor)} />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Start Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          Como Começar (5 Passos)
        </h2>

        <div className="grid gap-4 md:grid-cols-5">
          {quickStartSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Card key={idx} className="group hover:shadow-md transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className="relative mx-auto mb-4">
                    <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                      {step.step}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Security & Auth Section */}
      <div className="grid gap-6 md:grid-cols-2 mb-10">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Login Seguro</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Acesse com e-mail + senha. Confirmação por e-mail garante a segurança da sua conta.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-blue-300">
                    <Mail className="h-3 w-3 mr-1" />
                    E-mail + Senha
                  </Badge>
                  <Badge variant="outline" className="border-blue-300">
                    <Shield className="h-3 w-3 mr-1" />
                    Criptografia
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
                <Lightbulb className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Assistente IA</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  A IA analisa seus dados e oferece insights personalizados sobre seus hábitos financeiros.
                </p>
                <div className="space-y-1.5 text-xs text-muted-foreground italic">
                  <p>"Seus gastos com lazer subiram 40% este mês"</p>
                  <p>"Seu consignado termina em setembro"</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Final CTA */}
      <Card className="bg-gradient-to-r from-primary to-emerald-600 text-white">
        <CardContent className="py-8 text-center">
          <Star className="h-10 w-10 mx-auto mb-4 opacity-80" />
          <h3 className="text-xl font-bold mb-2">Pronto para começar?</h3>
          <p className="opacity-90 max-w-md mx-auto">
            Após o primeiro mês de uso, suas decisões financeiras passam a ser baseadas em dados, não em intuição.
          </p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
