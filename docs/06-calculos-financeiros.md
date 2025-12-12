# 📊 PigMoney - Cálculos Financeiros

> **Fórmulas e Lógicas** | Dezembro 2025

---

## 1. Projeção Mensal (`useMonthlyProjection`)

### 1.1 Cálculo de Receita Mensal
```typescript
// Prioridade de cálculo:
1. Receitas do mês atual (se existem)
2. Salário base (base_amount do último registro tipo 'salary')
3. Média das últimas 3 receitas
```

**Fórmula:**
```
monthlyIncome = currentMonthIncome.sum(net_amount)
             || latestSalary.base_amount
             || income[0..3].average(net_amount)
```

### 1.2 Despesas Fixas
```
totalFixedExpenses = fixedExpenses
  .filter(is_active === true)
  .sum(amount)
```

### 1.3 Média de Gastos Variáveis
```
// Últimos 3 meses
avgMonthlyVariable = variableExpenses
  .filter(date >= 3_meses_atrás)
  .sum(amount) / 3
```

### 1.4 Fatura do Cartão
```typescript
// Para cada mês de projeção
cardInvoice = cardTransactions.reduce((sum, t) => {
  return sum + calculateInstallmentForMonth(
    t.first_invoice_month,  // Quando começou
    t.amount_total,         // Valor total
    t.installments,         // Número de parcelas
    targetMonth             // Mês sendo calculado
  );
});
```

**Função `calculateInstallmentForMonth`:**
```typescript
function calculateInstallmentForMonth(
  firstMonth: string,    // "2025-01"
  totalAmount: number,   // 1200
  installments: number,  // 3
  targetMonth: string    // "2025-02"
): number {
  const firstDate = parseYearMonth(firstMonth);
  const targetDate = parseYearMonth(targetMonth);
  const monthsDiff = diffInMonths(targetDate, firstDate);
  
  // Se já encerrou ou ainda não começou
  if (monthsDiff < 0 || monthsDiff >= installments) return 0;
  
  // Valor da parcela
  return totalAmount / installments;
}
```

### 1.5 Balanço e Status
```typescript
balance = monthlyIncome - totalExpenses;

// Status do mês
if (balance < 0) status = 'danger';
else if (balance < monthlyIncome * 0.1) status = 'warning';
else status = 'positive';
```

---

## 2. Ganhos Variáveis (`useEarnings`)

### 2.1 Estatísticas do Mês
```typescript
totalMonth = earnings.sum(amount);

// Média diária (baseada no dia atual do mês)
dailyAverage = totalMonth / dayOfMonth;

// Projeção mensal
projection = dailyAverage * daysInMonth;

// Média semanal (simplificada)
weeklyAverage = dailyAverage * 7;
```

### 2.2 Gráfico Últimos 7 Dias
```typescript
last7Days = {
  labels: ['05/12', '06/12', ..., '11/12'],
  data: [150, 0, 200, 75, ...] // Soma por dia
}
```

---

## 3. Cálculo de Fatura do Cartão

### 3.1 Determinação do Mês da Fatura
```typescript
function getInvoiceMonth(purchaseDate: Date, closingDay: number): string {
  const year = purchaseDate.getFullYear();
  const month = purchaseDate.getMonth();
  const day = purchaseDate.getDate();
  
  // Se compra foi após o fechamento, vai para próxima fatura
  if (day > closingDay) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    return `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}`;
  }
  
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}
```

### 3.2 Exemplo Prático
```
Cartão: Fechamento dia 10, Vencimento dia 20
Compra: R$ 300 em 12 parcelas, data 15/01/2025

→ Compra após fechamento (15 > 10)
→ first_invoice_month = "2025-02"
→ Parcelas: Fev, Mar, Abr, Mai, Jun, Jul, Ago, Set, Out, Nov, Dez, Jan
→ Valor parcela: R$ 25,00 cada
```

---

## 4. Movimentação do Cofrinho

### 4.1 Atualização de Saldo
```typescript
// Ao criar movimentação
if (movement.type === 'deposit') {
  newBalance = currentBalance + movement.amount;
} else { // withdraw
  newBalance = currentBalance - movement.amount;
}

// Atualiza piggy_bank.current_balance
```

### 4.2 Progresso da Meta
```typescript
progress = (current_balance / goal_amount) * 100;
// Limitado a 100%
displayProgress = Math.min(progress, 100);
```

---

## 5. Renovação do Plano

### 5.1 Cálculo da Data
```typescript
function getRenewalDate(plan: PlanType, startDate: string): Date | null {
  if (plan === 'free') return null;
  
  const start = new Date(startDate);
  
  if (plan === 'pro') {
    start.setDate(start.getDate() + 30);  // +30 dias
  } else if (plan === 'annual') {
    start.setDate(start.getDate() + 365); // +365 dias
  }
  
  return start;
}
```

---

## 6. Exemplos Numéricos

### 6.1 Projeção Mensal
```
DADOS:
- Salário base: R$ 5.000
- Despesas fixas ativas: R$ 2.500
- Média variáveis (3 meses): R$ 800
- Faturas do mês: R$ 500

CÁLCULO:
Receita: R$ 5.000
Despesas: R$ 2.500 + R$ 800 + R$ 500 = R$ 3.800
Balanço: R$ 5.000 - R$ 3.800 = R$ 1.200

Status: POSITIVE (R$ 1.200 >= 10% de R$ 5.000 = R$ 500)
```

### 6.2 Ganhos Variáveis
```
DADOS (dia 15 do mês, 30 dias no mês):
- Total acumulado: R$ 600

CÁLCULO:
Média diária: R$ 600 / 15 = R$ 40
Projeção mensal: R$ 40 × 30 = R$ 1.200
Média semanal: R$ 40 × 7 = R$ 280
```

---

> **PigMoney Calculations v1.0** | Dezembro 2025
