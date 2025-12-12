# 🐷 PIGMONEY — Documentação Empresarial Completa

> **Versão:** 2.0 Enterprise | **Última Atualização:** Dezembro 2025  
> **Classificação:** Documento Estratégico e Técnico

---

## Índice

1. [Visão Geral Completa](#1-visão-geral-completa)
2. [Missão, Propósito e Filosofia](#2-missão-propósito-e-filosofia)
3. [Proposta de Valor e Promessa](#3-proposta-de-valor-e-promessa)
4. [Perfil do Público-Alvo e Personas](#4-perfil-do-público-alvo-e-personas)
5. [Problemas Reais Resolvidos](#5-problemas-reais-resolvidos)
6. [Diferenciais Competitivos](#6-diferenciais-competitivos)
7. [Funcionalidades Detalhadas](#7-funcionalidades-detalhadas)
8. [Módulos Internos](#8-módulos-internos)
9. [Fluxo do Usuário](#9-fluxo-do-usuário)
10. [Arquitetura do Sistema](#10-arquitetura-do-sistema)
11. [Esquema do Banco de Dados](#11-esquema-do-banco-de-dados)
12. [Segurança e Privacidade](#12-segurança-e-privacidade)
13. [Identidade Visual](#13-identidade-visual)
14. [Estratégia de UX](#14-estratégia-de-ux)
15. [Escalabilidade e Visão Futura](#15-escalabilidade-e-visão-futura)
16. [Modelo de Negócio](#16-modelo-de-negócio)
17. [Roadmap Futuro](#17-roadmap-futuro)
18. [Manual Operacional](#18-manual-operacional)
19. [Diretrizes para IA](#19-diretrizes-para-ia)
20. [Resumo Executivo](#20-resumo-executivo)

---

## 1. Visão Geral Completa

### 1.1 O que é o PigMoney?

O **PigMoney** é uma plataforma SaaS (Software as a Service) de gestão financeira pessoal desenvolvida para o mercado brasileiro. Diferencia-se por combinar simplicidade de uso com recursos avançados de inteligência artificial, oferecendo uma experiência completa de controle financeiro sem a complexidade típica de aplicativos concorrentes.

### 1.2 Propósito Central

Democratizar o acesso à educação e organização financeira, permitindo que qualquer pessoa — independentemente de seu conhecimento prévio sobre finanças — consiga:

- Visualizar com clareza para onde vai seu dinheiro
- Planejar o futuro com projeções inteligentes
- Alcançar metas de poupança de forma gamificada
- Receber orientação personalizada via IA

### 1.3 Contexto de Mercado

| Estatística | Dado |
|-------------|------|
| Brasileiros endividados | 78,5 milhões (2024) |
| Sem reserva de emergência | 62% da população |
| Usam planilhas ou nada | 71% |
| Mercado de fintechs BR | R$ 150+ bilhões |

### 1.4 Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| **Frontend** | React 18 + TypeScript + Vite | Performance, tipagem segura, build rápido |
| **Estilização** | TailwindCSS + shadcn/ui | Design system consistente, produtividade |
| **Estado** | TanStack Query | Cache inteligente, mutações otimistas |
| **Backend** | Supabase (PostgreSQL + Edge Functions) | BaaS completo, RLS nativo, escalável |
| **Hospedagem** | Vercel | Deploy automático, CDN global, serverless |
| **IA** | Google Gemini API | Consultor financeiro inteligente |
| **Pagamentos** | Stripe | Infraestrutura de pagamentos robusta |

---

## 2. Missão, Propósito e Filosofia

### 2.1 Missão

> *"Transformar a relação dos brasileiros com o dinheiro, tornando a organização financeira tão simples quanto usar uma rede social."*

### 2.2 Visão

Ser a plataforma financeira mais amada do Brasil até 2027, com mais de 1 milhão de usuários ativos e R$ 1 bilhão em economia gerada para nossos usuários.

### 2.3 Valores Fundamentais

| Valor | Manifestação no Produto |
|-------|------------------------|
| **Simplicidade** | Interface limpa, fluxos em poucos cliques |
| **Transparência** | Sem taxas escondidas, código de conduta claro |
| **Empatia** | Tom de voz amigável, entendimento da realidade brasileira |
| **Inovação** | IA integrada, PWA moderno, atualizações constantes |
| **Privacidade** | Zero acesso a bancos, dados criptografados |

### 2.4 Filosofia de Produto

**"5 minutos por dia mudam sua vida financeira."**

O PigMoney foi projetado para exigir o mínimo de tempo possível do usuário. A filosofia é que finanças pessoais não devem ser um trabalho, mas um hábito leve incorporado na rotina.

---

## 3. Proposta de Valor e Promessa

### 3.1 Proposta de Valor Única (UVP)

> **"Chega de terminar o mês sem saber para onde foi seu dinheiro."**

O PigMoney é o app financeiro que finalmente funciona: simples de usar, bonito de ver, e inteligente o suficiente para mostrar onde você está errando.

### 3.2 Promessas ao Usuário

| Promessa | Como Cumprimos |
|----------|----------------|
| **Clareza Total** | Dashboard com visão 360° das finanças |
| **Sem Complicação** | Setup em menos de 5 minutos |
| **Controle Real** | Projeção de 12 meses à frente |
| **Motivação** | Cofrinhos gamificados com progresso visual |
| **Inteligência** | Consultor Pig (IA) disponível 24/7 |
| **Privacidade** | Nunca pedimos senha de banco |

### 3.3 Benefícios Tangíveis

```
┌─────────────────────────────────────────────────────────────┐
│  ANTES DO PIGMONEY          →    DEPOIS DO PIGMONEY         │
├─────────────────────────────────────────────────────────────┤
│  Fim do mês no vermelho     →    Sobra para investir        │
│  Não sabe onde gasta        →    Categorias claras          │
│  Fatura surpresa            →    Previsão de parcelas       │
│  Sem reserva                →    Cofrinhos com metas        │
│  Decisões no escuro         →    Dados em tempo real        │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Perfil do Público-Alvo e Personas

### 4.1 Segmentação Primária

**Demográfico:**
- Idade: 22-45 anos
- Renda: R$ 2.000 - R$ 15.000/mês
- Localização: Brasil (foco inicial em capitais)
- Escolaridade: Ensino médio completo ou superior

**Psicográfico:**
- Conscientes de que precisam organizar finanças
- Frustrados com soluções complexas
- Usuários ativos de smartphone
- Valorizam praticidade acima de tudo

### 4.2 Personas Detalhadas

#### Persona 1: Ricardo (Empresário, 34 anos)

| Atributo | Detalhe |
|----------|---------|
| **Renda** | R$ 12.000/mês (variável) |
| **Dor Principal** | Mistura finanças pessoais e da empresa |
| **Objetivo** | Separar contas e guardar para emergência |
| **Comportamento Digital** | Heavy user, prefere apps a planilhas |
| **Quote** | *"Trabalho demais para ficar rico e não consigo ver isso acontecer."* |

#### Persona 2: Lucas (Desenvolvedor Freelancer, 28 anos)

| Atributo | Detalhe |
|----------|---------|
| **Renda** | R$ 6.000-10.000/mês (variável) |
| **Dor Principal** | Renda instável dificulta planejamento |
| **Objetivo** | Prever meses fracos e criar colchão |
| **Comportamento Digital** | Early adopter, valoriza bom design |
| **Quote** | *"Mês bom gasto tudo, mês ruim me ferro."* |

#### Persona 3: André (Professor, 42 anos)

| Atributo | Detalhe |
|----------|---------|
| **Renda** | R$ 4.500/mês (fixa) |
| **Dor Principal** | Salário limitado, muitos gastos invisíveis |
| **Objetivo** | Encontrar onde cortar e começar a investir |
| **Comportamento Digital** | Moderado, prefere simplicidade |
| **Quote** | *"Cada centavo conta, mas não sei onde vão."* |

#### Persona 4: Thiago (Freelancer, 31 anos)

| Atributo | Detalhe |
|----------|---------|
| **Renda** | R$ 3.000-8.000/mês (muito variável) |
| **Dor Principal** | Não sabe quanto realmente ganha por mês |
| **Objetivo** | Controlar renda variável e fazer projeções |
| **Comportamento Digital** | Sempre conectado, mobile-first |
| **Quote** | *"Minha renda varia muito. Preciso de controle total."* |

---

## 5. Problemas Reais Resolvidos

### 5.1 Mapeamento de Dores vs Soluções

| # | Problema Real | Como o PigMoney Resolve |
|---|---------------|------------------------|
| 1 | **"Não sei para onde vai meu dinheiro"** | Dashboard com categorização automática e gráficos claros |
| 2 | **"Fatura do cartão sempre maior que esperava"** | Gestão de cartões com cálculo automático de parcelas futuras |
| 3 | **"Nunca consigo guardar dinheiro"** | Cofrinhos gamificados com metas e progresso visual |
| 4 | **"Planilhas são complicadas demais"** | Interface intuitiva que substitui qualquer planilha |
| 5 | **"Não consigo planejar o futuro"** | Projeção financeira de 12 meses à frente |
| 6 | **"Minha renda varia muito"** | Módulo de ganhos variáveis com médias e projeções |
| 7 | **"Apps pedem senha do banco"** | Zero integração bancária — privacidade total |
| 8 | **"Preciso de um consultor financeiro"** | Pig Advisor (IA) disponível 24/7 para dúvidas |

### 5.2 Impacto Mensurável

```
Economia média reportada por usuários Pro: R$ 450/mês
Tempo médio de uso diário: 4 minutos
Taxa de alcance de metas (cofrinhos): 67%
NPS (Net Promoter Score): 72
```

---

## 6. Diferenciais Competitivos

### 6.1 Análise Competitiva

| Aspecto | PigMoney | Mobills | Organizze | Guiabolso |
|---------|----------|---------|-----------|-----------|
| **Preço Free** | Funcional | Limitado | Limitado | Limitado |
| **IA Integrada** | ✅ Pig Advisor | ❌ | ❌ | Parcial |
| **Projeção 12 meses** | ✅ | ❌ | ❌ | ❌ |
| **Cofrinhos gamificados** | ✅ | ✅ | ✅ | ❌ |
| **Sem senha de banco** | ✅ | ✅ | ✅ | ❌ Requer |
| **PWA Instalável** | ✅ | ❌ App nativo | ❌ App nativo | ❌ App nativo |
| **Renda variável inteligente** | ✅ | Parcial | ❌ | ❌ |
| **Interface moderna** | ✅ Premium | Básica | Básica | Datada |

### 6.2 Vantagens Exclusivas

1. **Consultor Pig (IA)**: Único app brasileiro com assistente financeiro IA integrado
2. **Projeção Inteligente**: Algoritmo que considera despesas fixas, variáveis, parcelas e tendências
3. **Privacidade Total**: Zero integração bancária — dados inseridos manualmente
4. **PWA de Alta Performance**: Funciona como app nativo sem ocupar espaço
5. **Design Premium**: Interface que compete com fintechs de bilhões

---

## 7. Funcionalidades Detalhadas

### 7.1 Módulo de Receitas

#### Salário & Renda Fixa
- Cadastro de salário bruto/líquido
- Revisões salariais com histórico
- Cálculo automático de descontos (INSS, IRRF)
- Projeção baseada no salário base

#### Ganhos Variáveis
- Registro diário de receitas extras
- Categorização (freelance, comissão, bônus, outros)
- Estatísticas: total do mês, média diária, projeção mensal
- Gráfico dos últimos 7 dias

### 7.2 Módulo de Despesas

#### Despesas Fixas
- Cadastro com dia de vencimento
- Categorias: Moradia, Transporte, Alimentação, Saúde, etc.
- Toggle ativo/inativo para controle
- Notas e observações

#### Despesas Variáveis
- Registro rápido de gastos pontuais
- Data, valor, categoria, descrição
- Histórico mensal completo
- Média de gastos variáveis (3 meses)

### 7.3 Módulo de Cartões

- Cadastro de múltiplos cartões
- Configuração: nome, apelido, limite, dia de fechamento, dia de vencimento
- Registro de compras parceladas
- Cálculo automático de parcelas por mês
- Previsão de faturas futuras

### 7.4 Módulo de Cofrinhos

- Criação ilimitada (Pro/VIP)
- Nome personalizado e meta em R$
- Depósitos e saques com histórico
- Barra de progresso visual
- Motivo/razão para cada movimentação

### 7.5 Módulo de Planejamento

- Projeção automática de 12 meses
- Considera: salário base, despesas fixas, média variáveis, parcelas de cartão
- Status por mês: POSITIVO (≥10%), ATENÇÃO (<10%), CRÍTICO (<0%)
- Visualização em cards e gráfico

### 7.6 Módulo de Relatórios

- Gráficos de distribuição por categoria
- Evolução mensal de gastos
- Comparativo receitas vs despesas
- Análise de tendências

### 7.7 Consultor Pig (IA)

- Chat com inteligência artificial (Google Gemini)
- Dúvidas financeiras gerais
- Dicas personalizadas
- Orientação de uso do app
- Limite de 5 mensagens/dia (Free)

---

## 8. Módulos Internos

### 8.1 Arquitetura de Módulos

```
┌─────────────────────────────────────────────────────────────────┐
│                        PIGMONEY CORE                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   INCOME    │  │  EXPENSES   │  │    CARDS    │             │
│  │  (Receitas) │  │  (Despesas) │  │  (Cartões)  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         │                │                │                     │
│         └────────────────┼────────────────┘                     │
│                          ▼                                      │
│              ┌─────────────────────┐                           │
│              │     PLANNING        │                           │
│              │   (Planejamento)    │                           │
│              └─────────────────────┘                           │
│                          │                                      │
│         ┌────────────────┼────────────────┐                     │
│         ▼                ▼                ▼                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ PIGGY BANKS │  │   REPORTS   │  │  PIG ADVISOR│             │
│  │ (Cofrinhos) │  │ (Relatórios)│  │    (IA)     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│                    ADMIN PANEL (Backoffice)                     │
│  Dashboard │ Users │ Reports │ Logs │ Cancellations │ Metrics  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Fluxo de Dados entre Módulos

```
Income + Earnings → Base de Receitas
        ↓
Expenses (Fixed + Variable) + Cards → Base de Despesas
        ↓
Planning → Cruza dados e gera projeção
        ↓
Reports → Visualiza tendências
        ↓
Pig Advisor → Analisa e sugere melhorias
```

---

## 9. Fluxo do Usuário

### 9.1 Jornada de Onboarding

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. LANDING PAGE                                                 │
│    ↓ CTA "Começar Grátis"                                       │
├─────────────────────────────────────────────────────────────────┤
│ 2. AUTH PAGE                                                    │
│    • Email + Senha + Nome/Apelido                               │
│    • Ou login com Google                                        │
│    ↓ Cadastro criado                                            │
├─────────────────────────────────────────────────────────────────┤
│ 3. CRIAÇÃO DO ESPAÇO                                            │
│    • RPC: create_family_space(nome)                             │
│    • Cria couple + couple_member                                │
│    ↓ Espaço pronto                                              │
├─────────────────────────────────────────────────────────────────┤
│ 4. DASHBOARD (Primeira vez)                                     │
│    • Guided tour opcional                                       │
│    • Cards vazios incentivando cadastro                         │
│    ↓ Usuário explora                                            │
├─────────────────────────────────────────────────────────────────┤
│ 5. CONFIGURAÇÃO INICIAL                                         │
│    • Cadastrar salário                                          │
│    • Adicionar despesas fixas                                   │
│    • Cadastrar cartões (opcional)                               │
│    ↓ Setup completo (~5 min)                                    │
├─────────────────────────────────────────────────────────────────┤
│ 6. USO DIÁRIO                                                   │
│    • Registrar gastos variáveis                                 │
│    • Registrar ganhos extras                                    │
│    • Consultar Pig Advisor                                      │
│    • Ver projeção e relatórios                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Fluxo de Assinatura

```
Settings → Meu Plano → Escolhe Pro ou VIP
        ↓
Checkout → Stripe Session
        ↓
Pagamento → stripe-webhook Edge Function
        ↓
Atualiza couples.plan → pro ou annual
        ↓
AuthContext reflete novo plano → Features liberadas
```

---

## 10. Arquitetura do Sistema

### 10.1 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUÁRIO                                 │
│                    (Browser/PWA)                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL (CDN)                               │
│            React SPA + Assets Estáticos                         │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    SUPABASE     │  │ EDGE FUNCTIONS  │  │    STRIPE       │
│   PostgreSQL    │  │     (Deno)      │  │   Payments      │
│   + Auth + RLS  │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
        │                    │                    │
        │                    ▼                    │
        │           ┌─────────────────┐           │
        │           │  GOOGLE GEMINI  │           │
        │           │   (Pig Advisor) │           │
        │           └─────────────────┘           │
        │                                         │
        └─────────────────────────────────────────┘
```

### 10.2 Camadas da Aplicação

| Camada | Responsabilidade | Tecnologia |
|--------|------------------|------------|
| **Apresentação** | UI, interação, navegação | React, shadcn/ui |
| **Estado** | Cache, sincronização | TanStack Query |
| **Serviços** | Lógica de negócio frontend | Hooks customizados |
| **API** | Comunicação backend | Supabase Client |
| **Backend** | Processamento server-side | Edge Functions |
| **Dados** | Persistência, segurança | PostgreSQL + RLS |
| **Infraestrutura** | Hosting, CDN, CI/CD | Vercel + Supabase |

### 10.3 Edge Functions

| Função | Descrição | Auth |
|--------|-----------|------|
| `admin-users` | Lista/gerencia usuários | Admin |
| `admin-metrics` | Métricas do sistema | Admin |
| `admin-reports` | Reports de suporte | Admin |
| `admin-logs` | Logs de auditoria | Admin |
| `admin-cancellations` | Feedback de cancelamentos | Admin |
| `calculate-net-salary` | Cálculo salário líquido | User |
| `chat-consultant` | Pig Advisor (IA) | User |
| `create-checkout-session` | Sessão Stripe | User |
| `stripe-webhook` | Webhook de pagamentos | Service |

---

## 11. Esquema do Banco de Dados

### 11.1 Tabelas Principais

| Tabela | Tipo | RLS | Descrição |
|--------|------|-----|-----------|
| `couples` | Tenant | ✅ | Espaços/contas de usuários |
| `couple_members` | Join | ✅ | Vínculo user↔couple |
| `income` | Core | ✅ | Receitas (salário, bônus) |
| `earnings` | Core | ✅ | Ganhos variáveis diários |
| `fixed_expenses` | Core | ✅ | Despesas fixas e variáveis |
| `credit_cards` | Core | ✅ | Cartões de crédito |
| `card_transactions` | Core | ✅ | Compras parceladas |
| `piggy_banks` | Core | ✅ | Cofrinhos |
| `piggy_bank_movements` | Core | ✅ | Movimentações |
| `user_reports` | Support | ✅ | Reports de problemas |
| `cancellation_feedback` | Support | ✅ | Feedback de cancelamento |
| `admin_logs` | Audit | ✅ | Logs administrativos |

### 11.2 Diagrama ER Simplificado

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  auth.users  │────►│couple_members│◄────│   couples    │
└──────────────┘     └──────────────┘     └──────┬───────┘
       │                                         │
       │                    ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   earnings   │     │    income    │     │fixed_expenses│     │ credit_cards │
│  (user_id)   │     │ (couple_id)  │     │ (couple_id)  │     │ (couple_id)  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                      │
                            ┌──────────────┐                   ┌──────▼───────┐
                            │ piggy_banks  │                   │card_transact │
                            │ (couple_id)  │                   │  (card_id)   │
                            └──────┬───────┘                   └──────────────┘
                                   │
                            ┌──────▼───────┐
                            │piggy_movements│
                            └──────────────┘
```

### 11.3 Funções SQL Críticas

```sql
-- Verificação de membro do espaço (RLS)
CREATE FUNCTION is_couple_member(_couple_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM couple_members
    WHERE couple_id = _couple_id AND user_id = auth.uid()
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Criação de espaço no cadastro
CREATE FUNCTION create_family_space(name TEXT)
RETURNS JSON AS $$
DECLARE
  new_couple_id UUID;
BEGIN
  INSERT INTO couples (name) VALUES (name) RETURNING id INTO new_couple_id;
  INSERT INTO couple_members (couple_id, user_id, role)
    VALUES (new_couple_id, auth.uid(), 'owner');
  RETURN json_build_object('id', new_couple_id, 'name', name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 12. Segurança e Privacidade

### 12.1 Modelo Zero-Trust

**Princípio:** Nunca confiar, sempre verificar.

- Toda requisição é autenticada via JWT
- RLS (Row Level Security) verifica acesso em cada operação
- Service role usado apenas em Edge Functions server-side
- Dados segregados por `couple_id`

### 12.2 Camadas de Segurança

| Camada | Mecanismo | Descrição |
|--------|-----------|-----------|
| **Autenticação** | Supabase Auth | Email/Senha, OAuth (Google), JWT |
| **Autorização** | RLS Policies | Função `is_couple_member()` |
| **Criptografia** | TLS 1.3 | Dados em trânsito |
| **Senhas** | bcrypt | Hash irreversível |
| **Tokens** | JWT curto + Refresh | Rotação automática |
| **Admin** | app_metadata.is_admin | Via JWT claims |

### 12.3 Matriz de Permissões

| Tabela | Leitura | Escrita | Condição |
|--------|---------|---------|----------|
| couples | ✅ | ✅ | `is_couple_member(id)` |
| income | ✅ | ✅ | `is_couple_member(couple_id)` |
| fixed_expenses | ✅ | ✅ | `is_couple_member(couple_id)` |
| credit_cards | ✅ | ✅ | `is_couple_member(couple_id)` |
| earnings | ✅ | ✅ | `auth.uid() = user_id` |
| user_reports | ✅ | ✅ | User: próprio / Admin: todos |
| admin_logs | ❌ | ❌ | Apenas service_role |

### 12.4 Privacidade

| Prática | Implementação |
|---------|---------------|
| Sem senha de banco | Dados inseridos manualmente |
| Não vendemos dados | Política clara, sem terceiros |
| Direito ao esquecimento | Usuário pode deletar conta |
| Conformidade LGPD | Termos e políticas adequados |

---

## 13. Identidade Visual

### 13.1 Paleta de Cores

| Nome | HSL | Hex | Uso |
|------|-----|-----|-----|
| **Primary (Green)** | 142, 71%, 45% | #22C55E | CTAs, sucesso, ganhos |
| **Primary Dark** | 142, 76%, 36% | #16A34A | Hover, contraste |
| **Warning** | 38, 92%, 50% | #F59E0B | Alertas, atenção |
| **Danger** | 0, 84%, 60% | #EF4444 | Erros, déficit |
| **Background** | 222, 84%, 5% | #0A0A0F | Fundo dark mode |
| **Card** | 222, 84%, 8% | #111117 | Cards, containers |

### 13.2 Tipografia

```css
font-family: 'Inter', system-ui, sans-serif;
```

| Uso | Tamanho | Peso |
|-----|---------|------|
| Títulos grandes | 30-48px | 700-900 |
| Títulos de seção | 20-24px | 600-700 |
| Texto padrão | 14-16px | 400 |
| Labels/legendas | 12px | 500 |

### 13.3 O Mascote: Pig

**Personalidade:**
- Amigável e encorajador
- Aparência de porquinho estilizado
- Cor: gradiente verde (#22C55E → #16A34A)
- Representa: economia, finanças saudáveis, prosperidade

**Usos:**
- Logo da marca
- Ícone do app/PWA
- Avatar do Pig Advisor
- Animações de loading
- Celebrações de metas alcançadas

### 13.4 Tom de Voz

| Contexto | Tom |
|----------|-----|
| Marketing | Empolgante, direto, brasileiro |
| In-app | Amigável, encorajador, simples |
| Erros | Compreensivo, solucionador |
| Pig Advisor | Consultor gentil, não julgador |

---

## 14. Estratégia de UX

### 14.1 Princípios de Design

1. **Mobile-First**: 70%+ dos acessos são mobile
2. **5-Second Rule**: Qualquer ação em menos de 5 segundos
3. **Progressive Disclosure**: Complexidade revelada gradualmente
4. **Feedback Imediato**: Toasts, animações, estados de loading

### 14.2 Padrões de Interface

| Padrão | Implementação |
|--------|---------------|
| Cards | Containers para agrupamento visual |
| FAB | Ação rápida principal (mobile) |
| Bottom Sheet | Formulários e detalhes (mobile) |
| Sidebar | Navegação principal (desktop) |
| Tabs | Alternância entre visões |

### 14.3 Acessibilidade

- Contraste WCAG 2.1 AA
- Touch targets mínimo 44x44px
- Labels descritivos em inputs
- Suporte a dark mode

### 14.4 Performance

| Métrica | Meta | Atual |
|---------|------|-------|
| LCP | < 2.5s | ~1.8s |
| FID | < 100ms | ~50ms |
| CLS | < 0.1 | ~0.05 |
| TTI | < 3.8s | ~2.5s |

---

## 15. Escalabilidade e Visão Futura

### 15.1 Arquitetura Escalável

O PigMoney foi projetado para escalar horizontalmente:

- **Frontend**: Servido via CDN (Vercel), cache estático
- **Backend**: Supabase auto-escala, conexões pooling
- **Database**: PostgreSQL com índices otimizados
- **Edge Functions**: Serverless, escala sob demanda

### 15.2 Limites Atuais

| Recurso | Limite | Plano de Upgrade |
|---------|--------|------------------|
| Usuários simultâneos | 10.000+ | Supabase Pro |
| Requests/segundo | 500+ | Edge Functions scale |
| Storage (DB) | 500MB | Supabase Pro = 8GB |
| Edge Function exec | 400K/mês | Escala automática |

### 15.3 Visão de Produto (2025-2027)

**Curto Prazo (6 meses):**
- App nativo iOS/Android via Capacitor
- Notificações push
- Widgets de tela inicial

**Médio Prazo (12 meses):**
- Open Banking opcional (sandbox)
- Importação de extratos (CSV/PDF)
- Comparativo com média do mercado

**Longo Prazo (24 meses):**
- Marketplace de serviços financeiros
- Clube de benefícios PigMoney
- Comunidade de usuários

---

## 16. Modelo de Negócio

### 16.1 Estrutura de Planos

| Plano | Código | Preço | Renovação |
|-------|--------|-------|-----------|
| **Pig Free** | `free` | R$ 0 | N/A |
| **Pig Pro** | `pro` | R$ 9,90/mês | +30 dias |
| **Pig Anual (VIP)** | `annual` | R$ 97/ano | +365 dias |

### 16.2 Feature Matrix

| Funcionalidade | Free | Pro | VIP |
|----------------|------|-----|-----|
| Despesas ilimitadas | ✅ | ✅ | ✅ |
| Dashboard básico | ✅ | ✅ | ✅ |
| Calendário de vencimentos | ✅ | ✅ | ✅ |
| Cofrinhos | 1 | Ilimitado | Ilimitado |
| Pig Advisor (IA) | 5/dia | Ilimitado | Ilimitado |
| Projeção 12 meses | ❌ | ✅ | ✅ |
| Relatórios avançados | ❌ | ✅ | ✅ |
| Gestão de cartões | ❌ | ✅ | ✅ |
| Suporte prioritário | ❌ | ❌ | ✅ |
| Badge VIP | ❌ | ❌ | ✅ |
| Acesso antecipado | ❌ | ❌ | ✅ |

### 16.3 Métricas de Negócio

| Métrica | Meta | Descrição |
|---------|------|-----------|
| **CAC** | < R$ 15 | Custo de aquisição de cliente |
| **LTV** | > R$ 150 | Lifetime value do cliente |
| **Churn** | < 5%/mês | Taxa de cancelamento |
| **Conversão Free→Pro** | > 5% | Upgrade de plano |
| **MRR Growth** | > 10%/mês | Crescimento receita recorrente |

### 16.4 Estratégia de Retenção

1. **Onboarding Guiado**: Setup completo em 5 minutos
2. **Gamificação**: Cofrinhos com progresso visual
3. **Engajamento IA**: Pig Advisor incentiva uso
4. **Notificações Inteligentes**: Alertas de vencimentos, metas
5. **Feedback Loop**: Pesquisas de satisfação, NPS

---

## 17. Roadmap Futuro

### 17.1 Q1 2025 — Consolidação

- [ ] App nativo iOS/Android (Capacitor)
- [ ] Notificações push
- [ ] Melhorias de performance PWA
- [ ] Internacionalização (pt-BR refinado)

### 17.2 Q2 2025 — Expansão

- [ ] Widget de tela inicial (Android)
- [ ] Importação de extratos OFX/CSV
- [ ] Metas automáticas baseadas em comportamento
- [ ] Relatórios PDF exportáveis

### 17.3 Q3 2025 — Inteligência

- [ ] Pig Advisor com acesso aos dados do usuário
- [ ] Alertas proativos de gastos excessivos
- [ ] Previsão de gastos por categoria
- [ ] Comparativo com média do mercado

### 17.4 Q4 2025 — Plataforma

- [ ] Open Banking (sandbox regulatório)
- [ ] API pública para integrações
- [ ] Comunidade de usuários
- [ ] Programa de afiliados

### 17.5 2026+ — Ecossistema

- [ ] Marketplace de produtos financeiros
- [ ] Clube de benefícios/cashback
- [ ] Versão para MEIs e pequenas empresas
- [ ] Expansão internacional (LATAM)

---

## 18. Manual Operacional

### 18.1 Suporte ao Cliente

**Canal Principal:** Central de Suporte in-app (`/support`)

| Tipo de Report | Prioridade | SLA |
|----------------|------------|-----|
| Bug visual | Baixa | 7 dias |
| Erro de cálculo | Média | 3 dias |
| Dados inconsistentes | Alta | 24h |
| Problema de login | Alta | 24h |
| Problema de performance | Média | 3 dias |

### 18.2 Fluxo de Deploy

```
1. Desenvolvimento local → npm run dev
2. Testes → npm run build (sem erros)
3. Commit → git push origin main
4. Deploy automático → Vercel detecta e builda
5. Verificação → Smoke tests em produção
```

### 18.3 Manutenção Preventiva

**Semanal:**
- [ ] Revisar reports novos em `/admin/reports`
- [ ] Verificar métricas de conversão
- [ ] Analisar feedbacks de cancelamento

**Mensal:**
- [ ] Atualizar dependências npm
- [ ] Revisar políticas RLS
- [ ] Verificar limites de API (Gemini, Stripe)

**Trimestral:**
- [ ] Auditoria de segurança
- [ ] Revisão de custos de infraestrutura
- [ ] Análise de churn e retenção

### 18.4 Rollback

```bash
# Via Vercel Dashboard
Deployments → Selecionar deploy anterior → Promote to Production

# Via Supabase
Dashboard → Settings → Backups → Point-in-time recovery
```

---

## 19. Diretrizes para IA

### 19.1 Usando este Documento com IA

Este documento foi estruturado para ser facilmente consumido por assistentes de IA. Ao fornecer este documento para uma IA:

1. **Contexto Completo**: A IA terá visão 360° do produto
2. **Terminologia Consistente**: Usar os mesmos termos (couple, earnings, etc.)
3. **Decisões Informadas**: IA pode sugerir com base na arquitetura real
4. **Código Contextual**: IA entende hooks, components, e estrutura

### 19.2 Prompts Recomendados

```markdown
# Para desenvolvimento:
"Considerando a arquitetura do PigMoney descrita no documento, 
implemente [funcionalidade] seguindo os padrões de hooks existentes."

# Para UX:
"Baseado na estratégia de UX do PigMoney (mobile-first, 5-second rule), 
proponha melhorias para [tela/fluxo]."

# Para negócio:
"Dado o modelo de negócio freemium do PigMoney, sugira estratégias 
para aumentar conversão Free→Pro."
```

### 19.3 Evolução do Pig Advisor

**Fase Atual:** Consultor genérico (sem acesso a dados)
**Próxima Fase:** Acesso ao contexto financeiro do usuário
**Futuro:** Análises proativas e recomendações personalizadas

Quando implementar acesso a dados:
- Usar Edge Function com contexto do usuário
- Respeitar limites por plano
- Não expor dados sensíveis no prompt
- Manter histórico de conversas

---

## 20. Resumo Executivo

### 20.1 O que é o PigMoney?

Plataforma SaaS de gestão financeira pessoal para o mercado brasileiro, combinando simplicidade de uso com inteligência artificial para ajudar usuários a organizar suas finanças.

### 20.2 Por que existe?

78,5 milhões de brasileiros estão endividados e 71% não usam nenhuma ferramenta de controle. O PigMoney resolve isso com uma solução acessível, bonita e inteligente.

### 20.3 Para quem?

Brasileiros de 22-45 anos, com renda de R$ 2.000-15.000/mês, que sabem que precisam organizar suas finanças mas não encontraram a ferramenta certa.

### 20.4 Diferenciais

- Consultor Pig (IA) integrado
- Projeção inteligente de 12 meses
- Zero integração bancária (privacidade)
- PWA premium (funciona como app nativo)
- Preço justo (R$ 0 - R$ 9,90/mês)

### 20.5 Números

| Métrica | Valor |
|---------|-------|
| Usuários ativos | 10.000+ |
| Economia gerada | R$ 2M+ |
| Metas criadas | 50.000+ |
| Avaliação | 4.9/5 |
| NPS | 72 |

### 20.6 Stack

React 18 + TypeScript + Vite + TailwindCSS + Supabase + Vercel + Stripe + Google Gemini

### 20.7 Próximos Passos

1. App nativo iOS/Android
2. Open Banking (sandbox)
3. Pig Advisor com acesso a dados
4. Expansão para LATAM

---

> **PIGMONEY** — Transformando a relação dos brasileiros com o dinheiro.  
> *Feito com 💚 no Brasil*

---

**Documento compilado em:** Dezembro 2025  
**Versão:** 2.0 Enterprise  
**Classificação:** Documento Estratégico e Técnico  
**Uso:** Interno, Investidores, Parceiros, IAs
