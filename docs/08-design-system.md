# 🎨 PigMoney - Design System

> **Visual Identity** | Dezembro 2025

---

## 1. Paleta de Cores

### 1.1 Cores Primárias
| Nome | HSL | Hex | Uso |
|------|-----|-----|-----|
| Primary | `hsl(221, 83%, 53%)` | #2563EB | CTAs, links, destaque |
| Primary Foreground | `hsl(210, 40%, 98%)` | #F8FAFC | Texto sobre primary |

### 1.2 Cores Secundárias
| Nome | HSL | Uso |
|------|-----|-----|
| Success | `hsl(142, 71%, 45%)` | #22C55E | Positivo, ganhos |
| Warning | `hsl(38, 92%, 50%)` | #F59E0B | Alertas, atenção |
| Danger | `hsl(0, 84%, 60%)` | #EF4444 | Erros, déficit |

### 1.3 Cores Neutras
| Nome | Uso |
|------|-----|
| Background | Fundo da página |
| Foreground | Texto principal |
| Card | Fundo de cards |
| Muted | Texto secundário |
| Border | Bordas e divisores |

### 1.4 Dark Mode
O sistema suporta dark mode via classes CSS:
```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

---

## 2. Tipografia

### 2.1 Fonte Principal
```css
font-family: 'Inter', system-ui, sans-serif;
```

### 2.2 Tamanhos
| Classe | Tamanho | Uso |
|--------|---------|-----|
| `text-xs` | 12px | Legendas, badges |
| `text-sm` | 14px | Texto secundário |
| `text-base` | 16px | Texto padrão |
| `text-lg` | 18px | Subtítulos |
| `text-xl` | 20px | Títulos de seção |
| `text-2xl` | 24px | Títulos de página |
| `text-3xl` | 30px | Números grandes |

### 2.3 Pesos
```css
font-normal: 400;
font-medium: 500;
font-semibold: 600;
font-bold: 700;
```

---

## 3. Espaçamento

### 3.1 Sistema de Grid
```css
/* Tailwind spacing scale */
gap-2: 8px
gap-4: 16px
gap-6: 24px
gap-8: 32px
```

### 3.2 Padding de Containers
```css
p-4: 16px  /* Mobile */
p-6: 24px  /* Desktop */
```

---

## 4. Componentes UI

### 4.1 Botões
```tsx
// Variantes (shadcn/ui)
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Danger</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

### 4.2 Cards
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
  <CardFooter>Ações</CardFooter>
</Card>
```

### 4.3 Inputs
```tsx
<Input placeholder="Digite..." />
<Select>...</Select>
<Textarea rows={4} />
```

### 4.4 Modais
```tsx
<Dialog>
  <DialogTrigger>Abrir</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
    </DialogHeader>
    {/* Conteúdo */}
  </DialogContent>
</Dialog>
```

---

## 5. Ícones

### Biblioteca: Lucide React
```tsx
import { 
  Home, Settings, CreditCard, 
  PiggyBank, TrendingUp, FileText,
  Plus, Trash, Edit, Check
} from 'lucide-react';
```

### Tamanhos Padrão
```tsx
<Icon className="h-4 w-4" />  // Pequeno
<Icon className="h-5 w-5" />  // Médio
<Icon className="h-6 w-6" />  // Grande
```

---

## 6. Mascote: Pig

### Características
- Porquinho rosa estilizado
- Usado em: landing, loading, chat
- Representa: economia, finanças saudáveis

### Uso
```tsx
// Logo no header
<img src="/pig-logo.svg" alt="PigMoney" />

// AI Chat widget
<PigAvatar />
```

---

## 7. Animações

### 7.1 Transições
```css
transition-all duration-200 ease-in-out
```

### 7.2 Animações Custom
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
```

---

## 8. Responsividade

### Breakpoints
| Nome | Largura | Dispositivo |
|------|---------|-------------|
| `sm` | 640px | Mobile L |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop L |

### Padrão Mobile-First
```tsx
<div className="flex flex-col md:flex-row">
  <div className="w-full md:w-1/2">...</div>
</div>
```

---

> **PigMoney Design System v1.0** | Dezembro 2025
