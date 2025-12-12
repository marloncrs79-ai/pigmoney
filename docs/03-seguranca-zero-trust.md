# 🔐 PigMoney - Segurança Zero-Trust

> **Modelo de Segurança** | Dezembro 2025

---

## 1. Princípios Fundamentais

### 1.1 Zero-Trust
- **Nunca confiar, sempre verificar**
- Toda requisição deve ser autenticada
- RLS verifica acesso em cada operação
- Service role apenas em Edge Functions

### 1.2 Isolamento Multi-Tenant
- Dados segregados por `couple_id`
- Usuário só acessa seu próprio espaço
- Função `is_couple_member()` valida acesso

---

## 2. Camadas de Segurança

### 2.1 Autenticação (Supabase Auth)
```
┌─────────────────────────────────────────────┐
│              AUTENTICAÇÃO                   │
├─────────────────────────────────────────────┤
│ • Email/Password                            │
│ • OAuth (Google)                            │
│ • Magic Links                               │
│ • JWT Tokens (curta duração)                │
│ • Refresh Tokens (rotação automática)       │
└─────────────────────────────────────────────┘
```

### 2.2 Autorização (RLS)
```sql
-- Função de verificação de membro
CREATE FUNCTION is_couple_member(_couple_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER -- Executa com privilégios elevados
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM couple_members
    WHERE couple_id = _couple_id 
    AND user_id = auth.uid()
  )
$$ LANGUAGE sql STABLE;
```

### 2.3 Admin Access
```sql
-- Verificar se usuário é admin via JWT
(auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
```

---

## 3. Matriz de Permissões

| Tabela | Leitura | Escrita | Condição |
|--------|---------|---------|----------|
| couples | ✅ | ✅ | `is_couple_member(id)` |
| couple_members | ✅ | ✅* | `is_couple_member(couple_id)` |
| income | ✅ | ✅ | `is_couple_member(couple_id)` |
| fixed_expenses | ✅ | ✅ | `is_couple_member(couple_id)` |
| credit_cards | ✅ | ✅ | `is_couple_member(couple_id)` |
| card_transactions | ✅ | ✅ | `is_couple_member(couple_id)` |
| piggy_banks | ✅ | ✅ | `is_couple_member(couple_id)` |
| earnings | ✅ | ✅ | `auth.uid() = user_id` |
| user_reports | ✅ | ✅ | User: próprio / Admin: todos |
| admin_logs | ❌ | ❌ | Apenas service_role |

---

## 4. Service Role vs Anon Key

| Contexto | Chave | Uso |
|----------|-------|-----|
| Frontend | `anon` | Todas as requisições do cliente |
| Edge Functions Admin | `service_role` | Acesso elevado a dados |
| Webhooks | `service_role` | Stripe, etc. |

### 4.1 Uso Correto do Service Role
```typescript
// Edge Function (seguro)
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // NUNCA expor no frontend
)
```

---

## 5. Políticas RLS por Tabela

### 5.1 Padrão Core (couple_id)
```sql
-- SELECT
CREATE POLICY "Members can view" ON [table]
FOR SELECT TO authenticated
USING (is_couple_member(couple_id));

-- INSERT
CREATE POLICY "Members can create" ON [table]
FOR INSERT TO authenticated
WITH CHECK (is_couple_member(couple_id));

-- UPDATE/DELETE
CREATE POLICY "Members can modify" ON [table]
FOR UPDATE/DELETE TO authenticated
USING (is_couple_member(couple_id));
```

### 5.2 User Reports (Híbrido)
```sql
-- Usuário vê próprios reports
CREATE POLICY "Users view own" ON user_reports
FOR SELECT USING (auth.uid() = user_id);

-- Admin vê todos
CREATE POLICY "Admin view all" ON user_reports
FOR SELECT USING (
  (auth.jwt()->'app_metadata'->>'is_admin')::boolean = true
);
```

---

## 6. Prevenção de Vazamentos

### 6.1 Checklist de Segurança
- [ ] `anon` key nunca tem acesso direto a dados sensíveis
- [ ] Service role apenas em Edge Functions server-side
- [ ] Variáveis de ambiente nunca no frontend
- [ ] RLS ativo em TODAS as tabelas
- [ ] Função `is_couple_member` é SECURITY DEFINER
- [ ] JWT validado em cada requisição

### 6.2 Dados Sensíveis
| Dado | Proteção |
|------|----------|
| Senhas | Hash bcrypt (Supabase Auth) |
| Tokens | Curta duração + refresh |
| Dados financeiros | RLS por couple_id |
| Service role key | Apenas server-side |

---

## 7. Auditoria

### 7.1 Admin Logs
```sql
-- Trigger automático para eventos de auth
CREATE TRIGGER trigger_log_auth_events
AFTER INSERT OR DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION log_auth_events();
```

### 7.2 Ações Logadas
- Criação de usuário
- Deleção de usuário
- Ações administrativas
- Mudanças de plano

---

## 8. Testes de Segurança Recomendados

### 8.1 Testes Manuais
1. Tentar acessar dados de outro couple via API
2. Verificar se admin_logs está inacessível via anon
3. Testar JWT expirado
4. Validar CORS headers

### 8.2 Testes Automatizados
```javascript
// Exemplo de teste
test('user cannot access other couple data', async () => {
  const { error } = await supabase
    .from('income')
    .select('*')
    .eq('couple_id', 'other-couple-id');
  expect(error || data.length === 0).toBeTruthy();
});
```

---

> **PigMoney Security v1.0** | Dezembro 2025
