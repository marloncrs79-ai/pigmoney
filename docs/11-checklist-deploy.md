# 🚀 PigMoney - Checklist de Deploy

> **Vercel + Supabase** | Dezembro 2025

---

## 1. Pré-Requisitos

### 1.1 Contas Necessárias
- [ ] Vercel (vercel.com)
- [ ] Supabase (supabase.com)
- [ ] Stripe (stripe.com)
- [ ] Domínio configurado

### 1.2 Repositório
- [ ] Código no GitHub/GitLab
- [ ] Branch `main` para produção
- [ ] `.env.example` atualizado

---

## 2. Variáveis de Ambiente

### 2.1 Vercel (Frontend)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 2.2 Supabase Secrets (Edge Functions)
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
GEMINI_API_KEY=...
```

---

## 3. Configuração Supabase

### 3.1 Projeto
- [ ] Projeto criado em região adequada
- [ ] Database password seguro
- [ ] RLS ativado em todas as tabelas

### 3.2 Auth
```
Authentication > Settings > Site URL: https://pigmoney.app
Redirect URLs: https://pigmoney.app/*
```

### 3.3 Migrations
```bash
# Aplicar todas as migrations
supabase db push
```

### 3.4 Edge Functions
```bash
# Deploy de todas as functions
supabase functions deploy
```

---

## 4. Configuração Vercel

### 4.1 Projeto
- [ ] Importar repositório
- [ ] Framework: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### 4.2 Domínio
```
Settings > Domains
Add: pigmoney.app
```

### 4.3 Environment Variables
- [ ] Todas as VITE_* adicionadas
- [ ] Scope: Production

---

## 5. Checklist Pré-Deploy

### 5.1 Código
- [ ] `npm run build` sem erros
- [ ] `npm run lint` sem erros
- [ ] Testes passando
- [ ] Console sem warnings críticos

### 5.2 Banco de Dados
- [ ] Migrations aplicadas
- [ ] Policies RLS testadas
- [ ] Functions deployadas
- [ ] Dados de teste limpos

### 5.3 Integrações
- [ ] Stripe webhook configurado
- [ ] Gemini API funcionando
- [ ] Auth flow testado

---

## 6. Deploy

### 6.1 Produção
```bash
# Push para main = deploy automático
git push origin main
```

### 6.2 Preview (PR)
```bash
# Cada PR gera preview URL
git push origin feature/my-branch
# Vercel cria: pigmoney-xxx.vercel.app
```

---

## 7. Pós-Deploy

### 7.1 Verificação Imediata
- [ ] Site carrega corretamente
- [ ] Login funciona
- [ ] Dashboard renderiza
- [ ] Operações CRUD funcionam

### 7.2 Checklist Completo
- [ ] Todas as páginas acessíveis
- [ ] Auth (login/logout/signup)
- [ ] CRUD de receitas/despesas
- [ ] Cartões e transações
- [ ] Cofrinhos
- [ ] Planejamento
- [ ] Relatórios
- [ ] Stripe checkout
- [ ] Admin panel (se admin)

---

## 8. Rollback

### 8.1 Código (Vercel)
```
Vercel Dashboard > Deployments
> Selecionar deploy anterior
> ... > Promote to Production
```

### 8.2 Banco (Supabase)
```
Dashboard > Settings > Backups
> Point-in-time recovery
```

---

## 9. Staging vs Production

### 9.1 Ambiente Staging
```
Branch: develop
URL: pigmoney-staging.vercel.app
Supabase: Projeto separado ou branch
Stripe: Test mode (sk_test_*)
```

### 9.2 Fluxo
```
develop → staging (auto)
   ↓ (PR review)
main → production (auto)
```

---

## 10. Backup Antes do Deploy

### 10.1 Sempre Fazer
- [ ] Backup do database (Supabase)
- [ ] Anotar versão atual (commit hash)
- [ ] Verificar variáveis de ambiente

---

> **PigMoney Deploy v1.0** | Dezembro 2025
