import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Wallet, Receipt, CreditCard, PiggyBank, LayoutDashboard, Calendar, 
  Lightbulb, ArrowRight, CheckCircle2, HelpCircle 
} from 'lucide-react';

export default function Help() {
  return (
    <AppLayout>
      <PageHeader
        title="Guia do PIGMONEY"
        description="Entenda tudo sobre o sistema, mesmo que você odeie planilhas"
      />

      {/* Intro */}
      <Card className="mb-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/20 p-3">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">O que é o PIGMONEY?</h2>
              <p className="text-muted-foreground mb-4">
                O PIGMONEY é um sistema simples que te ajuda a responder três perguntas:
              </p>
              <ol className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/20 text-success text-xs font-bold">1</span>
                  <span><strong>Quanto entra todo mês?</strong> (salário, extras, rendas)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-warning/20 text-warning text-xs font-bold">2</span>
                  <span><strong>Para onde o dinheiro está indo?</strong> (contas, cartão, gastos do dia a dia)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">3</span>
                  <span><strong>O que vai acontecer nos próximos meses?</strong> (previsão)</span>
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Concepts */}
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-warning" />
        Conceitos Básicos
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-5 w-5 text-success" />
              O que é RECEITA?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="mb-3"><strong>Receita = dinheiro que entra.</strong></p>
            <p className="mb-2">Exemplos:</p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>Salário</li>
              <li>Hora extra, bônus, comissão</li>
              <li>Renda extra (freela, venda de algo)</li>
              <li>Aluguel que você recebe</li>
            </ul>
            <p>No sistema, você cadastra seu <strong>salário base</strong>, extras fixos, penduricalhos sazonais e descontos em folha (como consignado).</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-5 w-5 text-danger" />
              O que é DESPESA FIXA?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="mb-3"><strong>Despesa fixa = conta que se repete todo mês.</strong></p>
            <p className="mb-2">Exemplos:</p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>Aluguel, condomínio</li>
              <li>Escola/creche</li>
              <li>Internet, plano de saúde</li>
              <li>Assinaturas (Netflix, Spotify)</li>
              <li>Parcela de empréstimo</li>
            </ul>
            <p>São despesas que "comem" sua renda todo mês, queira você ou não.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-5 w-5 text-warning" />
              O que é DESPESA VARIÁVEL?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="mb-3"><strong>Despesa variável = gasto que varia mês a mês.</strong></p>
            <p className="mb-2">Exemplos:</p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>Mercado</li>
              <li>iFood / lanches / restaurantes</li>
              <li>Gasolina, farmácia</li>
              <li>Lazer (cinema, passeio)</li>
              <li>Roupas, presentes</li>
            </ul>
            <p>Registre por categoria para entender <strong>para onde o dinheiro está escorrendo</strong>.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-5 w-5 text-primary" />
              Como funciona o CARTÃO?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="mb-3">Cadastre seus cartões com limite, dia de fechamento e vencimento.</p>
            <p className="mb-2">Quando marcar uma despesa como "paga no cartão":</p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>O sistema decide se entra na fatura atual ou na próxima</li>
              <li>Soma parcelamentos automaticamente</li>
              <li>Projeta o impacto nas próximas faturas</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <PiggyBank className="h-5 w-5 text-success" />
              O que é COFRINHO?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="mb-3"><strong>Cofrinho = lugar onde você guarda dinheiro para um objetivo específico.</strong></p>
            <p className="mb-2">Você pode ter vários cofrinhos:</p>
            <div className="grid gap-2 sm:grid-cols-3 mb-3">
              <div className="rounded-lg bg-muted/50 px-3 py-2">"Reserva de emergência"</div>
              <div className="rounded-lg bg-muted/50 px-3 py-2">"Viagem"</div>
              <div className="rounded-lg bg-muted/50 px-3 py-2">"Reforma da casa"</div>
            </div>
            <p>Cada cofrinho tem nome, saldo atual e meta opcional. Registre depósitos e retiradas para acompanhar a evolução.</p>
          </CardContent>
        </Card>
      </div>

      {/* How to use */}
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <ArrowRight className="h-5 w-5 text-primary" />
        Como Usar Cada Parte
      </h2>

      <Accordion type="single" collapsible className="mb-8">
        <AccordionItem value="receitas">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-success" />
              1. Cadastrar Receitas
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3">
            <ol className="list-decimal list-inside space-y-2">
              <li>Vá na tela de <strong>Receitas</strong></li>
              <li>Cadastre seu <strong>salário base</strong></li>
              <li>Informe se ele tem:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Adicionais fixos (insalubridade, gratificação, VA)</li>
                  <li>Penduricalhos em meses específicos (auxílio fardamento em jan/abr/jul/out)</li>
                  <li>Descontos em folha (consignado)</li>
                </ul>
              </li>
            </ol>
            <p>O sistema passa a saber <strong>quanto realmente entra em cada mês</strong>.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="fixas">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-danger" />
              2. Cadastrar Despesas Fixas
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3">
            <ol className="list-decimal list-inside space-y-2">
              <li>Vá em <strong>Despesas</strong> → aba "Fixas"</li>
              <li>Para cada conta que se repete, cadastre:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Nome (Aluguel, Luz, Internet, Escola)</li>
                  <li>Valor</li>
                  <li>Dia de vencimento</li>
                  <li>Categoria</li>
                </ul>
              </li>
            </ol>
            <p>O sistema soma tudo e mostra quanto da sua renda já está comprometida.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="variaveis">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-warning" />
              3. Cadastrar Despesas Variáveis
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3">
            <p>Sempre que gastar com mercado, farmácia, lazer, etc:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Vá em <strong>Despesas</strong> → aba "Variáveis"</li>
              <li>Clique em "Nova Despesa"</li>
              <li>Preencha data, categoria, valor e forma de pagamento</li>
              <li>Se for no cartão, marque a opção e escolha o cartão</li>
            </ol>
            <p>Se for no cartão, o sistema já manda automaticamente para a fatura correta.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cartoes">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              4. Usar Cartão de Crédito
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3">
            <p><strong>Primeiro:</strong> cadastre seus cartões em <strong>Cartões</strong>:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Nome do cartão</li>
              <li>Limite</li>
              <li>Dia de fechamento</li>
              <li>Dia de vencimento</li>
            </ul>
            <p className="mt-2"><strong>Depois:</strong> ao registrar despesas, marque "foi no cartão" e escolha qual.</p>
            <p>Na tela do cartão você vê: fatura atual, próximas faturas, parcelas futuras.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cofrinhos">
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-success" />
              5. Criar e Usar Cofrinhos
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3">
            <ol className="list-decimal list-inside space-y-2">
              <li>Vá em <strong>Cofrinho</strong></li>
              <li>Clique em "Criar cofrinho"</li>
              <li>Dê um nome e defina uma meta (opcional)</li>
              <li>Registre depósitos (quando colocar dinheiro) e retiradas (quando usar)</li>
            </ol>
            <p>O sistema mostra saldo atual, histórico e quanto falta para a meta.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Dashboard and Planning */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              O que o Dashboard mostra
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="mb-3">No painel principal você encontra:</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Quanto entrou de receita no mês
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Quanto saiu em despesas fixas e variáveis
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Quanto está comprometido no cartão
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Quanto tem em cofrinhos
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Previsão de sobra ou falta
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Insights da IA
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-primary" />
              Planejamento de 12 meses
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="mb-3">Na tela de <strong>Planejamento</strong>, o sistema projeta:</p>
            <blockquote className="border-l-2 border-primary/50 pl-3 italic mb-3">
              "Se tudo continuar como está hoje, como vai estar sua vida financeira nos próximos 12 meses?"
            </blockquote>
            <p className="mb-2">Considera: salário, despesas fixas, média de variáveis, cartões e cofrinhos.</p>
            <p>Você verá meses tranquilos (sobra), apertados e críticos.</p>
          </CardContent>
        </Card>
      </div>

      {/* AI */}
      <Card className="mb-8 border-warning/30 bg-warning/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-5 w-5 text-warning" />
            Como a IA te ajuda
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="mb-3">A IA do PIGMONEY:</p>
          <ul className="space-y-1 mb-4">
            <li>❌ <strong>Não</strong> mexe no seu dinheiro</li>
            <li>❌ <strong>Não</strong> toma decisões por você</li>
            <li>❌ <strong>Não</strong> faz julgamentos morais</li>
          </ul>
          <p className="mb-3">Ela apenas lê seus dados, vê padrões e traduz em frases simples:</p>
          <div className="space-y-2">
            <div className="rounded-lg bg-background/50 px-3 py-2 text-xs italic">
              "Seus gastos com lazer subiram 40% comparado à média."
            </div>
            <div className="rounded-lg bg-background/50 px-3 py-2 text-xs italic">
              "Seu consignado termina em setembro. A partir daí, sua renda líquida aumenta em R$ 240/mês."
            </div>
            <div className="rounded-lg bg-background/50 px-3 py-2 text-xs italic">
              "Suas despesas fixas já consomem 72% da sua renda líquida."
            </div>
          </div>
          <p className="mt-3">Use como um amigo sincero que mostra a realidade — <strong>a decisão final é sempre sua</strong>.</p>
        </CardContent>
      </Card>

      {/* Quick Start */}
      <Card className="bg-gradient-to-br from-success/10 to-transparent border-success/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Por onde começar (passo a passo)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="mb-3">Se estiver perdido, faça só isso:</p>
          <ol className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-success-foreground text-xs font-bold">1</span>
              Cadastre seu salário
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-success-foreground text-xs font-bold">2</span>
              Cadastre suas despesas fixas principais
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-success-foreground text-xs font-bold">3</span>
              Cadastre seus cartões
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-success-foreground text-xs font-bold">4</span>
              Durante 1 mês, registre toda despesa variável importante
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-success-foreground text-xs font-bold">5</span>
              Crie pelo menos 1 cofrinho
            </li>
          </ol>
          <p className="mt-4 font-medium">
            Depois desse primeiro mês, o jogo deixa de ser "sentimento" e passa a ser <strong>decisão baseada em números</strong>.
          </p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
