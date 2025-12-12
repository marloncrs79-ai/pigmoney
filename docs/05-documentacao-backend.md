# 🔌 PigMoney - Backend e APIs

> **Supabase Edge Functions** | Dezembro 2025

---

## 1. Visão Geral

### Arquitetura
```
Frontend (React) → Supabase Client → PostgreSQL + RLS
                 ↘ Edge Functions → Service Role Access
```

### Edge Functions Disponíveis
| Função | Uso | Auth |
|--------|-----|------|
| `admin-cancellations` | Lista cancelamentos | Admin |
| `admin-logs` | Logs de auditoria | Admin |
| `admin-metrics` | Métricas do sistema | Admin |
| `admin-reports` | Reports de suporte | Admin |
| `admin-users` | Gestão de usuários | Admin |
| `calculate-net-salary` | Cálculo salário | User |
| `chat-consultant` | Pig Advisor IA | User |
| `create-checkout-session` | Checkout Stripe | User |
| `stripe-webhook` | Webhook pagamentos | Service |

---

## 2. Detalhamento das APIs

### 2.1 admin-users
```typescript
// GET - Lista todos usuários
Request: GET /functions/v1/admin-users
Headers: Authorization: Bearer <admin_jwt>

Response: {
  users: [{
    id: string,
    email: string,
    created_at: string,
    last_sign_in_at: string,
    app_metadata: { provider: string, is_admin: boolean },
    couple: { id: string, name: string, plan: string }
  }]
}
```

### 2.2 admin-metrics
```typescript
// GET - Métricas do sistema
Request: GET /functions/v1/admin-metrics

Response: {
  totalUsers: number,
  newUsersToday: number,
  newUsersWeek: number,
  planDistribution: { free: n, pro: n, annual: n },
  loginProviders: { email: n, google: n }
}
```

### 2.3 calculate-net-salary
```typescript
// POST - Calcula salário líquido
Request: POST /functions/v1/calculate-net-salary
Body: {
  grossSalary: number,
  deductions?: { inss?: number, irrf?: number, others?: number }
}

Response: {
  grossSalary: number,
  netSalary: number,
  deductions: { inss: n, irrf: n, total: n }
}
```

### 2.4 chat-consultant (Pig Advisor)
```typescript
// POST - Conversa com IA
Request: POST /functions/v1/chat-consultant
Body: {
  message: string,
  history?: [{ role: 'user'|'assistant', content: string }]
}

Response: {
  response: string
}
```

### 2.5 create-checkout-session
```typescript
// POST - Cria sessão Stripe
Request: POST /functions/v1/create-checkout-session
Body: {
  priceId: string,
  successUrl: string,
  cancelUrl: string
}

Response: {
  sessionId: string,
  url: string
}
```

### 2.6 stripe-webhook
```typescript
// POST - Webhook do Stripe (service-to-service)
// Processa eventos: checkout.session.completed

// Ações:
// 1. Valida signature do Stripe
// 2. Extrai user_id dos metadata
// 3. Atualiza couples.plan para 'pro' ou 'annual'
// 4. Define couples.plan_updated_at
```

---

## 3. Autenticação das APIs

### 3.1 Rotas Admin
```typescript
// Verificação de admin no Edge Function
const authHeader = req.headers.get('Authorization');
const token = authHeader?.replace('Bearer ', '');
const { data: { user } } = await supabase.auth.getUser(token);

const isAdmin = user?.app_metadata?.is_admin === true;
if (!isAdmin) {
  return new Response('Unauthorized', { status: 403 });
}
```

### 3.2 Rotas User
```typescript
// Usa JWT do usuário autenticado
const { data: { user } } = await supabase.auth.getUser(token);
if (!user) {
  return new Response('Unauthorized', { status: 401 });
}
```

### 3.3 Service-to-Service
```typescript
// Webhook Stripe - valida signature
const signature = req.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

---

## 4. Uso do Service Role

### Quando Usar
| Cenário | Service Role | Motivo |
|---------|--------------|--------|
| Admin listar todos usuários | ✅ | Bypass RLS |
| Admin atualizar status | ✅ | Acesso cross-tenant |
| Webhook atualizar plano | ✅ | Sem contexto de usuário |
| Usuário comum CRUD | ❌ | RLS funciona |

### Padrão de Uso
```typescript
// Edge Function com service role
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Agora pode acessar qualquer dado
const { data } = await supabaseAdmin
  .from('couples')
  .select('*'); // Ignora RLS
```

---

## 5. Chamadas do Frontend

### 5.1 Via Supabase Functions
```typescript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { param: 'value' }
});
```

### 5.2 Via Fetch Direto
```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/function-name`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ param: 'value' })
  }
);
```

---

## 6. Tratamento de Erros

### Padrão de Response
```typescript
// Sucesso
return new Response(JSON.stringify(data), {
  headers: { 'Content-Type': 'application/json' },
  status: 200
});

// Erro
return new Response(JSON.stringify({ error: message }), {
  headers: { 'Content-Type': 'application/json' },
  status: 400 | 401 | 403 | 500
});
```

---

## 7. Variáveis de Ambiente

| Variável | Uso |
|----------|-----|
| `SUPABASE_URL` | URL do projeto |
| `SUPABASE_ANON_KEY` | Chave pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave privilegiada |
| `STRIPE_SECRET_KEY` | API do Stripe |
| `STRIPE_WEBHOOK_SECRET` | Validação webhook |
| `GEMINI_API_KEY` | Google AI para chat |

---

> **PigMoney APIs v1.0** | Dezembro 2025
