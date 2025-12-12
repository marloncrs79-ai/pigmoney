# 🎨 PigMoney - Documentação Frontend

> **React + TypeScript + Vite** | Dezembro 2025

---

## 1. Estrutura de Pastas

```
src/
├── App.tsx              # Roteamento principal
├── main.tsx             # Entry point
├── index.css            # Estilos globais (Tailwind)
├── components/          # Componentes reutilizáveis
│   ├── ui/              # shadcn/ui components (64)
│   ├── layout/          # AppLayout, Sidebar
│   ├── earnings/        # AddEarningDialog
│   ├── expenses/        # ExpenseDialogs
│   ├── income/          # VariableIncomeList
│   ├── salary/          # SalaryInputs
│   └── admin/           # AdminNav
├── pages/               # Páginas da aplicação
│   ├── admin/           # Dashboard, Users, Logs...
│   └── support/         # SupportCentral, ReportProblem
├── hooks/               # Custom hooks
├── contexts/            # AuthContext
├── lib/                 # Utilitários (utils.ts, plan-utils.ts)
└── integrations/        # Supabase client e types
```

---

## 2. Componentes Principais

### 2.1 Layout
| Componente | Descrição |
|------------|-----------|
| `AppLayout` | Layout principal com sidebar |
| `Sidebar` | Menu lateral de navegação |
| `PageHeader` | Cabeçalho de página com título |
| `StatCard` | Card de estatísticas |

### 2.2 UI (shadcn/ui)
- Button, Card, Dialog, Input, Select
- Tabs, Table, Toast, Tooltip
- Sheet, Skeleton, Badge, Avatar
- DropdownMenu, NavigationMenu

### 2.3 Específicos
| Componente | Página | Função |
|------------|--------|--------|
| `AddEarningDialog` | Income | Adicionar ganho variável |
| `CancellationModal` | Settings | Cancelar plano |
| `AIChatWidget` | Global | Pig Advisor chat |
| `PricingCard` | Plans | Card de plano |

---

## 3. Hooks Customizados

### 3.1 Dados Financeiros (`useFinancialData.ts`)
```typescript
// Despesas
useExpenses(type?: 'fixed' | 'variable')
useFixedExpenses()
useVariableExpenses()
useCreateExpense()
useUpdateFixedExpense()
useDeleteFixedExpense()

// Receitas
useIncome()
useCreateIncome()
useDeleteIncome()

// Cartões
useCreditCards()
useCreateCreditCard()
useDeleteCreditCard()
useCardTransactions(cardId?)
useCreateCardTransaction()

// Cofrinhos
usePiggyBanks()
usePiggyBank(id)
usePiggyBankMovements(piggyBankId)
useCreatePiggyBank()
useUpdatePiggyBank()
useDeletePiggyBank()
useCreatePiggyBankMovement()

// Projeções
useMonthlyProjection()
```

### 3.2 Outros Hooks
```typescript
// useEarnings.ts
useEarnings() // Ganhos variáveis com stats

// useIncomeData.ts
useIncomeData() // Salário com revisões

// useAdmin.ts
useAdmin() // Verificação de admin

// useServerSalary.ts
useServerSalary() // Cálculo de salário líquido
```

---

## 4. Context Global

### AuthContext
```typescript
interface AuthContextType {
  user: User | null;           // Usuário Supabase
  session: Session | null;     // Sessão JWT
  couple: CoupleData | null;   // Espaço do usuário
  plan: PlanType;              // free | pro | annual
  planStartedAt: string | null;
  loading: boolean;
  coupleLoading: boolean;
  signIn(email, password): Promise;
  signUp(email, password, coupleName): Promise;
  signOut(): Promise;
  refreshCouple(): Promise;
  updatePlan(newPlan): void;
}
```

---

## 5. Roteamento

### 5.1 Proteção de Rotas
```tsx
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" />;
  return children;
}
```

### 5.2 Lazy Loading
```tsx
// Páginas críticas - eager load
import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";

// Demais páginas - lazy load
const Expenses = lazy(() => import("./pages/Expenses"));
const Cards = lazy(() => import("./pages/Cards"));
```

---

## 6. Padrões de Design

### 6.1 Data Fetching
```tsx
// Padrão com React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('couple_id', couple.id);
    if (error) throw error;
    return data;
  },
  enabled: !!couple?.id
});
```

### 6.2 Mutations
```tsx
const mutation = useMutation({
  mutationFn: async (data) => { /* insert/update */ },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resource'] });
    toast({ title: 'Sucesso!' });
  },
  onError: (error) => {
    toast({ variant: 'destructive', description: error.message });
  }
});
```

---

## 7. Responsividade

### Breakpoints (Tailwind)
| Breakpoint | Valor | Uso |
|------------|-------|-----|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop grande |

### Mobile-First
```tsx
<div className="flex flex-col md:flex-row gap-4">
  <Card className="w-full md:w-1/2">...</Card>
</div>
```

---

## 8. Recomendações de Manutenção

1. **Novos Componentes**: Criar em `components/ui/` seguindo padrão shadcn
2. **Novos Hooks**: Seguir padrão de `useFinancialData.ts`
3. **Novas Páginas**: Lazy load + ProtectedRoute
4. **Estado Global**: Preferir React Query sobre Context
5. **Estilos**: Usar classes Tailwind, evitar CSS inline

---

> **PigMoney Frontend v1.0** | Dezembro 2025
