# 🗄️ PigMoney - Documentação do Banco de Dados

> **Supabase PostgreSQL** | Dezembro 2025

---

## 1. Visão Geral do Schema

### Tabelas Principais

| Tabela | Tipo | RLS | Descrição |
|--------|------|-----|-----------|
| `couples` | Tenant | ✅ | Espaços/contas |
| `couple_members` | Join | ✅ | Vínculo user-couple |
| `fixed_expenses` | Core | ✅ | Despesas (fixas/variáveis) |
| `income` | Core | ✅ | Receitas e salários |
| `credit_cards` | Core | ✅ | Cartões de crédito |
| `card_transactions` | Core | ✅ | Transações parceladas |
| `piggy_banks` | Core | ✅ | Cofrinhos |
| `piggy_bank_movements` | Core | ✅ | Movimentações |
| `monthly_snapshots` | Analytics | ✅ | Fechamentos mensais |
| `ai_insights` | Analytics | ✅ | Insights da IA |
| `earnings` | Core | ✅ | Ganhos variáveis |
| `user_reports` | Support | ✅ | Reports de problemas |
| `cancellation_feedback` | Support | ✅ | Feedback cancelamento |
| `admin_logs` | Audit | ✅ | Logs administrativos |

---

## 2. Estrutura das Tabelas

### 2.1 couples
```sql
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'free', -- free, pro, annual
  plan_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 couple_members
```sql
CREATE TABLE couple_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(couple_id, user_id)
);
```

### 2.3 income
```sql
CREATE TABLE income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  gross_amount NUMERIC DEFAULT 0,
  net_amount NUMERIC DEFAULT 0,
  base_amount NUMERIC DEFAULT 0,
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('salary', 'bonus', 'extra', 'other')),
  is_salary_revision BOOLEAN DEFAULT false,
  effective_from DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.4 fixed_expenses
```sql
CREATE TABLE fixed_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  due_day INT CHECK (due_day >= 1 AND due_day <= 31),
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  type TEXT DEFAULT 'fixed', -- fixed, variable
  date DATE,
  payment_method TEXT,
  description TEXT,
  paid_with_card BOOLEAN DEFAULT false,
  card_id UUID REFERENCES credit_cards(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.5 credit_cards
```sql
CREATE TABLE credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  holder_name TEXT NOT NULL,
  nickname TEXT NOT NULL,
  limit_amount NUMERIC DEFAULT 0,
  closing_day INT CHECK (closing_day >= 1 AND closing_day <= 31),
  due_day INT CHECK (due_day >= 1 AND due_day <= 31),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.6 card_transactions
```sql
CREATE TABLE card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  card_id UUID REFERENCES credit_cards(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount_total NUMERIC DEFAULT 0,
  installments INT DEFAULT 1,
  first_invoice_month TEXT NOT NULL, -- YYYY-MM
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.7 piggy_banks
```sql
CREATE TABLE piggy_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal_amount NUMERIC,
  current_balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.8 piggy_bank_movements
```sql
CREATE TABLE piggy_bank_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  piggy_bank_id UUID REFERENCES piggy_banks(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('deposit', 'withdraw')),
  amount NUMERIC DEFAULT 0,
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.9 earnings
```sql
CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  amount NUMERIC NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.10 user_reports
```sql
CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('Bug visual', 'Erro de cálculo', ...)),
  descricao TEXT NOT NULL,
  imagem_url TEXT,
  impacto TEXT CHECK (impacto IN ('Baixo', 'Médio', 'Alto', 'Crítico')),
  status TEXT DEFAULT 'Novo' CHECK (status IN ('Novo', 'Em análise', 'Resolvido')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.11 admin_logs
```sql
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 3. Índices

| Tabela | Índice | Colunas |
|--------|--------|---------|
| admin_logs | idx_admin_logs_admin_user | admin_user_id |
| admin_logs | idx_admin_logs_created_at | created_at DESC |
| admin_logs | idx_admin_logs_action | action |
| user_reports | idx_user_reports_user_id | user_id |
| user_reports | idx_user_reports_status | status |
| earnings | idx_earnings_user_id | user_id |
| earnings | idx_earnings_created_at | created_at DESC |

---

## 4. Funções SQL

### 4.1 is_couple_member
```sql
CREATE FUNCTION is_couple_member(_couple_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM couple_members
    WHERE couple_id = _couple_id AND user_id = auth.uid()
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

### 4.2 create_family_space
```sql
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

### 4.3 log_admin_action
```sql
CREATE FUNCTION log_admin_action(
  p_admin_user_id UUID,
  p_action TEXT,
  p_target_user_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
  INSERT INTO admin_logs (admin_user_id, action, target_user_id, metadata)
  VALUES ($1, $2, $3, $4) RETURNING id;
$$ LANGUAGE sql SECURITY DEFINER;
```

---

## 5. RLS Policies

### Padrão para Tabelas Core (couple_id)
```sql
-- SELECT
CREATE POLICY "Members can view" ON [table]
  FOR SELECT USING (is_couple_member(couple_id));

-- INSERT
CREATE POLICY "Members can create" ON [table]
  FOR INSERT WITH CHECK (is_couple_member(couple_id));

-- UPDATE
CREATE POLICY "Members can update" ON [table]
  FOR UPDATE USING (is_couple_member(couple_id));

-- DELETE
CREATE POLICY "Members can delete" ON [table]
  FOR DELETE USING (is_couple_member(couple_id));
```

### Políticas para Admin
```sql
CREATE POLICY "Admins can view all" ON user_reports
  FOR SELECT USING (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );
```

### Políticas para user_reports
```sql
-- Usuários podem criar seus próprios reports
CREATE POLICY "Users can insert own reports"
  ON user_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem ver seus próprios reports
CREATE POLICY "Users can view own reports"
  ON user_reports FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 6. Diagrama ER

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  auth.users  │────►│couple_members│◄────│   couples    │
└──────────────┘     └──────────────┘     └──────┬───────┘
       │                                         │
       │                    ┌────────────────────┼────────────────────┐
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   earnings   │     │    income    │     │fixed_expenses│     │ credit_cards │
│  (user_id)   │     │ (couple_id)  │     │ (couple_id)  │     │ (couple_id)  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                      │
                                                               ┌──────▼───────┐
                                                               │card_transact │
                                                               │ (card_id)    │
                                                               └──────────────┘
```

---

> **PigMoney Database Schema v1.0** | Dezembro 2025
