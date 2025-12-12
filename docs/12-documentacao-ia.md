# 🤖 PigMoney - IA Interna (Pig Advisor)

> **Consultor Financeiro IA** | Dezembro 2025

---

## 1. Visão Geral

### O que é o Pig Advisor?
Assistente de IA integrado ao PigMoney para:
- Responder dúvidas financeiras
- Dar insights sobre gastos
- Sugerir economias
- Orientar uso do app

### Tecnologia
- **Motor**: Google Gemini API
- **Modelo**: gemini-2.0-flash (ou superior)
- **Interface**: Chat widget lateral

---

## 2. Arquitetura

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Frontend  │────►│ chat-consultant  │────►│ Gemini API  │
│ AIChatWidget│     │ Edge Function    │     │   Google    │
└─────────────┘     └──────────────────┘     └─────────────┘
```

---

## 3. Edge Function

### Endpoint
```
POST /functions/v1/chat-consultant
```

### Request
```json
{
  "message": "Como economizar mais?",
  "history": [
    {"role": "user", "content": "Olá"},
    {"role": "assistant", "content": "Olá! Como posso ajudar?"}
  ]
}
```

### Response
```json
{
  "response": "Para economizar mais, recomendo..."
}
```

---

## 4. System Prompt

### Prompt Base
```
Você é o Pig Advisor, um consultor financeiro amigável do PigMoney.

Seu papel:
- Ajudar usuários com dúvidas financeiras
- Dar dicas de economia e organização
- Explicar recursos do aplicativo
- Ser encorajador e positivo

Regras:
- Responda em português brasileiro
- Seja conciso (máx 3 parágrafos)
- Use linguagem simples
- Não dê conselhos de investimento específicos
- Encoraje bons hábitos financeiros
```

---

## 5. Comportamentos Esperados

### 5.1 Perguntas Sobre o App
```
User: "Como adiciono uma despesa?"
Pig: "Para adicionar uma despesa, vá em 'Despesas' no menu 
lateral, clique no botão '+' e preencha os dados..."
```

### 5.2 Dicas Financeiras
```
User: "Como gastar menos?"
Pig: "Ótima pergunta! Algumas dicas:
1. Use o Planejamento para ver projeções
2. Analise seus gastos variáveis nos Relatórios
3. Defina metas nos Cofrinhos..."
```

### 5.3 Motivação
```
User: "Estou endividado"
Pig: "Entendo que pode ser difícil, mas você já está 
dando o primeiro passo ao buscar organizar suas finanças! 
Vamos juntos criar um plano..."
```

---

## 6. Limites

### 6.1 O que NÃO fazer
- ❌ Recomendar ações/fundos específicos
- ❌ Dar consultoria tributária
- ❌ Acessar dados do usuário diretamente
- ❌ Fazer cálculos precisos de investimentos

### 6.2 Respostas de Fallback
```
"Para questões específicas de investimento, recomendo 
consultar um profissional certificado..."
```

---

## 7. Configuração

### 7.1 Variáveis
```
GEMINI_API_KEY=your_api_key
```

### 7.2 Parâmetros do Modelo
```typescript
{
  model: 'gemini-2.0-flash',
  temperature: 0.7,
  maxTokens: 1000
}
```

---

## 8. Monitoramento

### 8.1 Métricas
- Número de conversas/dia
- Tokens consumidos
- Erros de API
- Tempo de resposta

### 8.2 Limites de Uso
| Plano | Msgs/dia |
|-------|----------|
| Free | 5 |
| Pro | Ilimitado |
| VIP | Ilimitado |

---

## 9. Tratamento de Erros

### 9.1 Quota Excedida
```typescript
if (error.code === 429) {
  return "O Pig Advisor está descansando. Tente novamente em alguns minutos!";
}
```

### 9.2 Erro Genérico
```typescript
return "Ops! Tive um problema para processar sua pergunta. Tente reformular!";
```

---

## 10. Evolução Futura

### Possíveis Melhorias
- [ ] Acesso aos dados financeiros do usuário
- [ ] Análise automática de gastos
- [ ] Alertas proativos
- [ ] Histórico de conversas persistente

---

> **PigMoney AI v1.0** | Dezembro 2025
