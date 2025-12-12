# 📋 PigMoney - Manual Operacional

> **Guia de Operação do SaaS** | Dezembro 2025

---

## 1. Suporte ao Cliente

### 1.1 Canal Principal
- Central de Suporte in-app (`/support`)
- Report de Problemas (`/support/report-problem`)

### 1.2 Tipos de Report
| Tipo | Prioridade | SLA |
|------|------------|-----|
| Bug visual | Baixa | 7 dias |
| Erro de cálculo | Média | 3 dias |
| Dados inconsistentes | Alta | 24h |
| Problema de login | Alta | 24h |
| Problema de performance | Média | 3 dias |

### 1.3 Fluxo de Atendimento
1. Usuário reporta problema
2. Admin visualiza em `/admin/reports`
3. Muda status para "Em análise"
4. Investiga e corrige
5. Atualiza para "Resolvido"

---

## 2. Métricas Importantes

### 2.1 Métricas de Saúde
| Métrica | Normal | Alerta |
|---------|--------|--------|
| Novos usuários/dia | >10 | <5 |
| Conversão Free→Pro | >5% | <2% |
| Churn mensal | <5% | >10% |
| Tempo de resposta | <200ms | >1s |

### 2.2 Onde Monitorar
```
Admin Dashboard: /admin
Métricas: /admin/metrics
Vercel Analytics: vercel.com/dashboard
Supabase Dashboard: supabase.com/dashboard
```

---

## 3. Resolução de Bugs

### 3.1 Fluxo de Investigação
1. **Reproduzir**: Tentar recriar o problema
2. **Logs**: Verificar `/admin/logs` e Supabase Logs
3. **Código**: Identificar arquivo/função
4. **Fix**: Implementar correção
5. **Deploy**: Via Vercel (automático no push)
6. **Validar**: Testar em produção

### 3.2 Logs Úteis
```
Supabase Dashboard > Logs > API/Edge Functions
Vercel Dashboard > Deployments > Functions
```

### 3.3 Erros Comuns
| Erro | Causa | Solução |
|------|-------|---------|
| RLS violation | Política faltando | Adicionar policy |
| 401 Unauthorized | Token expirado | Refresh session |
| 500 Edge Function | Erro interno | Verificar logs |

---

## 4. Atualizações do Sistema

### 4.1 Deploy Automático
```
Push para main → Vercel detecta → Build → Deploy
```

### 4.2 Checklist Pré-Deploy
- [ ] Testes locais passando
- [ ] Build local sem erros
- [ ] Migrations aplicadas
- [ ] Variáveis de ambiente atualizadas

### 4.3 Rollback
```bash
# Via Vercel Dashboard
Deployments > Selecionar versão anterior > Promote
```

---

## 5. Comportamento do Usuário

### 5.1 Métricas de Uso
- Páginas mais acessadas
- Tempo médio de sessão
- Funcionalidades mais usadas
- Taxa de abandono

### 5.2 Sinais de Problemas
| Sinal | Ação |
|-------|------|
| Alto abandono em página | Revisar UX |
| Login constante falha | Verificar auth |
| Muitos reports similares | Bug sistêmico |

---

## 6. Manutenção Preventiva

### 6.1 Semanal
- [ ] Revisar `/admin/reports` novos
- [ ] Verificar métricas de conversão
- [ ] Analisar feedbacks de cancelamento

### 6.2 Mensal
- [ ] Atualizar dependências npm
- [ ] Revisar políticas RLS
- [ ] Backup manual de dados críticos
- [ ] Verificar limites de API (Gemini, Stripe)

### 6.3 Trimestral
- [ ] Auditoria de segurança
- [ ] Revisão de custos de infraestrutura
- [ ] Análise de churn e retenção

---

## 7. Contatos de Emergência

| Serviço | Dashboard | Suporte |
|---------|-----------|---------|
| Supabase | supabase.com | support@supabase.io |
| Vercel | vercel.com | support@vercel.com |
| Stripe | dashboard.stripe.com | stripe.com/contact |
| Domínio | Registrador | Varia |

---

> **PigMoney Operations v1.0** | Dezembro 2025
