# 🐷 PigMoney - Blueprint Mestre

> **Versão:** 1.0 | **Data:** Dezembro 2025

---

## 1. Visão Geral

O **PigMoney** é um SaaS de gestão financeira pessoal com:

- Controle de receitas (salários, ganhos variáveis)
- Gestão de despesas (fixas e variáveis)
- Cartões de crédito com parcelamentos
- Cofrinhos para metas de poupança
- Planejamento financeiro (12 meses)
- Consultor IA (Pig Advisor)
- Planos: Free, Pro, VIP

### Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Estilização | TailwindCSS + shadcn/ui |
| Estado | TanStack Query |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| Hospedagem | Vercel |
| IA | Google Gemini API |

---

## 2. Arquitetura Multi-Tenant

Modelo baseado em **couples** (espaços/contas):

```
auth.users → couple_members → couples → [dados financeiros]
```

Função de segurança RLS: `is_couple_member(couple_id)` garante isolamento.

---

## 3. Entidades do Sistema

| Entidade | Tabela | Descrição |
|----------|--------|-----------|
| Couple | `couples` | Espaço/conta do usuário |
| Member | `couple_members` | Vínculo usuário-espaço |
| Income | `income` | Receitas (salário, bonus) |
| Earnings | `earnings` | Ganhos variáveis diários |
| Fixed Expense | `fixed_expenses` | Despesas fixas/variáveis |
| Credit Card | `credit_cards` | Cartões de crédito |
| Card Transaction | `card_transactions` | Compras no cartão |
| Piggy Bank | `piggy_banks` | Cofrinhos de poupança |
| Piggy Movement | `piggy_bank_movements` | Movimentações do cofrinho |
| Monthly Snapshot | `monthly_snapshots` | Fechamento mensal |
| User Report | `user_reports` | Reports de problemas |
| Admin Log | `admin_logs` | Auditoria admin |

---

## 4. Módulos do Sistema

### Core Financeiro
- **Income**: Salários e ganhos variáveis
- **Expenses**: Despesas fixas e variáveis
- **Cards**: Cartões e transações parceladas
- **Piggy Banks**: Cofrinhos com metas
- **Planning**: Projeção 12 meses

### Insights e Relatórios
- **Reports**: Gráficos e análises
- **Tasks**: Checklist financeiro
- **Pig Chat**: Consultor IA

### Administrativo
- **Admin Dashboard**: Métricas gerais
- **Users**: Gestão de usuários
- **Reports**: Suporte
- **Logs**: Auditoria
- **Cancellations**: Cancelamentos

---

## 5. Fluxos Principais

### 5.1 Cadastro
1. Landing → CTA "Começar Grátis"
2. Auth Page (email/senha/nome)
3. `create_family_space` RPC cria couple + member
4. Redirecionamento → Dashboard (Plano FREE)

### 5.2 Assinatura
1. Settings/Plans → Escolhe Pro ou VIP
2. Checkout → Stripe
3. `stripe-webhook` atualiza plano
4. AuthContext reflete novo plano

### 5.3 Ganhos Variáveis
1. Income → Tab "Ganhos Variáveis"
2. AddEarningDialog → valor/descrição/categoria
3. `useEarnings.addEarning` → INSERT em `earnings`
4. Stats atualizadas (total, média, projeção)

### 5.4 Planejamento
1. `useMonthlyProjection` busca todos os dados
2. Para cada mês dos próximos 12:
   - income = salário base
   - expenses = fixas + variáveis + cartão
   - balance = income - expenses
3. Status: POSITIVE (≥10%), WARNING (<10%), DANGER (<0)

---

## 6. Sistema de Planos

| Plano | Código | Renovação |
|-------|--------|-----------|
| Free | `free` | N/A |
| Pro | `pro` | +30 dias |
| VIP | `annual` | +365 dias |

---

## 7. Rotas da Aplicação

### Públicas
`/`, `/auth`, `/terms`, `/privacy`

### Protegidas (usuário)
`/dashboard`, `/income`, `/expenses`, `/cards`, `/cards/:id`, `/piggy-bank`, `/piggy-bank/:id`, `/planning`, `/reports`, `/tasks`, `/settings`, `/guia`, `/plans`, `/checkout`, `/support`

### Admin
`/admin`, `/admin/users`, `/admin/users/:id`, `/admin/metrics`, `/admin/logs`, `/admin/reports`, `/admin/cancellations`

---

## 8. Edge Functions

| Função | Descrição |
|--------|-----------|
| `admin-*` | Funções administrativas |
| `calculate-net-salary` | Cálculo salário líquido |
| `chat-consultant` | Pig Advisor (IA) |
| `create-checkout-session` | Sessão Stripe |
| `stripe-webhook` | Webhook pagamentos |

---

## 9. Regras de Negócio

- **Projeção**: Média de 3 meses para gastos variáveis
- **Parcelas**: Calculadas via `first_invoice_month`
- **Fechamento**: Compras após closing_day → próxima fatura
- **Isolamento**: RLS ativo em TODAS as tabelas
- **Admin**: Requer `is_admin=true` em app_metadata

---

> **PigMoney v1.0** | Dezembro 2025
