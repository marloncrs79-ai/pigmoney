# 👑 PigMoney - Painel Administrativo

> **Admin Panel Guide** | Dezembro 2025

---

## 1. Acesso ao Admin

### Requisitos
- Usuário autenticado
- `app_metadata.is_admin = true`

### Como Definir Admin
```sql
-- Via Supabase Dashboard ou SQL
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'
WHERE email = 'admin@example.com';
```

### URL de Acesso
```
https://pigmoney.app/admin
```

---

## 2. Páginas do Admin

### 2.1 Dashboard (`/admin`)
**Visão geral do sistema**

| Métrica | Descrição |
|---------|-----------|
| Total de Usuários | Contagem total |
| Novos Hoje | Registros nas últimas 24h |
| Novos na Semana | Últimos 7 dias |
| Distribuição de Planos | Free / Pro / VIP |

### 2.2 Usuários (`/admin/users`)
**Lista completa de usuários**

| Coluna | Dados |
|--------|-------|
| Email | Endereço do usuário |
| Provedor | email / google |
| Plano | free / pro / annual |
| Último Login | Data/hora |
| Ações | Ver detalhes |

**Funcionalidades:**
- Busca por email
- Filtro por plano
- Ordenação por data
- Link para detalhes

### 2.3 Detalhes do Usuário (`/admin/users/:id`)
**Informações completas**

- Dados de autenticação
- Espaço (couple) vinculado
- Histórico de planos
- Ações: alterar plano, desativar

### 2.4 Reports (`/admin/reports`)
**Central de suporte**

| Campo | Descrição |
|-------|-----------|
| Tipo | Bug, Erro, Performance... |
| Descrição | Detalhes do problema |
| Impacto | Baixo / Médio / Alto / Crítico |
| Status | Novo / Em análise / Resolvido |

**Ações:**
- Filtrar por status/impacto
- Atualizar status do report
- Ver imagem anexada

### 2.5 Logs (`/admin/logs`)
**Auditoria do sistema**

| Evento | Descrição |
|--------|-----------|
| user_created | Novo registro |
| user_deleted | Conta removida |
| plan_changed | Alteração de plano |
| admin_action | Ação administrativa |

### 2.6 Cancelamentos (`/admin/cancellations`)
**Feedback de cancelamento**

| Campo | Descrição |
|-------|-----------|
| Usuário | Email do ex-assinante |
| Motivo | Razão selecionada |
| Detalhes | Comentário adicional |
| Data | Quando cancelou |

---

## 3. Como Resolver Problemas Comuns

### 3.1 Usuário Não Consegue Logar
1. Verificar em `/admin/users` se existe
2. Checar `last_sign_in_at` (está null?)
3. Verificar se email foi confirmado
4. Sugerir reset de senha

### 3.2 Plano Não Atualizou
1. Verificar `admin_logs` por `plan_changed`
2. Checar `couples.plan` diretamente
3. Verificar webhook do Stripe
4. Atualizar manualmente se necessário

### 3.3 Report de Bug Crítico
1. Priorizar na lista de reports
2. Mudar status para "Em análise"
3. Analisar imagem/descrição
4. Tentar reproduzir o problema
5. Corrigir e atualizar para "Resolvido"

---

## 4. Métricas e Interpretação

### 4.1 Usuários por Plano
```
Ideal: 70% Free, 20% Pro, 10% VIP
Ação: Se Free > 90%, revisar conversão
```

### 4.2 Taxa de Cancelamento
```
Normal: < 5% ao mês
Alerta: > 10% ao mês
Ação: Analisar feedbacks de cancelamento
```

### 4.3 Provedores de Login
```
Email vs OAuth: Monitorar preferência
Tendência: OAuth geralmente > 60%
```

---

## 5. Edge Functions Admin

### 5.1 Endpoints
```
/functions/v1/admin-users
/functions/v1/admin-metrics
/functions/v1/admin-reports
/functions/v1/admin-logs
/functions/v1/admin-cancellations
```

### 5.2 Autenticação
```typescript
// Headers necessários
Authorization: Bearer <jwt_do_admin>
Content-Type: application/json
```

---

## 6. Boas Práticas

1. **Sempre logar ações** importantes
2. **Nunca deletar** dados diretamente, usar soft delete
3. **Comunicar usuários** sobre mudanças de plano
4. **Priorizar reports** críticos
5. **Revisar logs** semanalmente

---

> **PigMoney Admin v1.0** | Dezembro 2025
