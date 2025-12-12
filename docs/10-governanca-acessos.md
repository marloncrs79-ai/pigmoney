# 🔑 PigMoney - Governança de Acessos

> **Controle de Acesso e Permissões** | Dezembro 2025

---

## 1. Matriz de Acessos

### 1.1 Serviços e Responsáveis
| Serviço | Acesso | Responsável | Criticidade |
|---------|--------|-------------|-------------|
| Supabase | Dashboard + API | Admin/Dev | 🔴 Alta |
| Vercel | Deploy + Logs | Admin/Dev | 🔴 Alta |
| Stripe | Pagamentos | Admin | 🔴 Alta |
| Domínio | DNS | Admin | 🟡 Média |
| GitHub | Código | Dev | 🟡 Média |
| Gemini API | IA | Admin/Dev | 🟢 Baixa |

### 1.2 Níveis de Acesso
| Nível | Pode | Não Pode |
|-------|------|----------|
| **Owner** | Tudo | - |
| **Admin** | Gerenciar, Deploy | Deletar projeto |
| **Dev** | Código, Deploy | Billing, Users |
| **Viewer** | Ver métricas | Alterar |

---

## 2. Chaves e Segredos

### 2.1 Variáveis Críticas
```
SUPABASE_URL          - URL do projeto
SUPABASE_ANON_KEY     - Chave pública (ok expor)
SUPABASE_SERVICE_ROLE - NUNCA expor no frontend
STRIPE_SECRET_KEY     - NUNCA expor
STRIPE_WEBHOOK_SECRET - Apenas server-side
GEMINI_API_KEY        - Apenas server-side
```

### 2.2 Onde Estão Armazenadas
| Variável | Local |
|----------|-------|
| Frontend (públicas) | `.env` + Vercel |
| Edge Functions | Supabase Secrets |
| API Keys | Vercel Env Variables |

### 2.3 Rotação de Chaves
| Chave | Quando Rotacionar |
|-------|-------------------|
| Service Role | Pós-incidente |
| Stripe Keys | Anualmente |
| Gemini Key | Se comprometida |

---

## 3. Supabase

### 3.1 Acessos
```
Dashboard: supabase.com/dashboard/project/{project-id}
Níveis: Owner, Admin, Developer
```

### 3.2 Checklist de Segurança
- [ ] 2FA ativado para todos os membros
- [ ] Revisão de membros trimestral
- [ ] Service role key apenas em Secrets
- [ ] RLS ativo em todas as tabelas

---

## 4. Vercel

### 4.1 Acessos
```
Dashboard: vercel.com/{team}/pigmoney
Níveis: Owner, Member, Viewer
```

### 4.2 Variáveis de Ambiente
```
Settings > Environment Variables
• Production, Preview, Development
• Encrypted at rest
```

---

## 5. Stripe

### 5.1 Acessos
```
Dashboard: dashboard.stripe.com
Níveis: Administrator, Developer
```

### 5.2 Modos
| Modo | API Keys | Dados |
|------|----------|-------|
| Test | `sk_test_*` | Teste |
| Live | `sk_live_*` | Produção |

---

## 6. Revogação de Acesso

### 6.1 Checklist de Offboarding
- [ ] Remover de Supabase
- [ ] Remover de Vercel
- [ ] Remover de Stripe
- [ ] Remover de GitHub
- [ ] Rotacionar chaves críticas

### 6.2 Passo a Passo
```
1. Supabase: Settings > Team > Remove member
2. Vercel: Settings > Team > Remove
3. Stripe: Developers > API keys > Rotate
```

---

## 7. Monitoramento

### 7.1 Auditoria de Acessos
| Serviço | Log |
|---------|-----|
| Supabase | Logs > API/Auth |
| Vercel | Team Activity |
| Stripe | Developers > Logs |

### 7.2 Alertas
- Login de novo dispositivo
- Tentativas de acesso falhas
- Mudanças em API keys

---

## 8. Backup e Recuperação

### 8.1 Dados
| Item | Frequência | Responsável |
|------|------------|-------------|
| Database | Diário (auto) | Supabase |
| Código | Push | GitHub |
| Env vars | Manual | Admin |

### 8.2 Recuperação
```
Supabase: Settings > Backups > Point-in-time recovery
Vercel: Deployment history > Rollback
```

---

> **PigMoney Governance v1.0** | Dezembro 2025
