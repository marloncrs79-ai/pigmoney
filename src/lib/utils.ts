import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
}

export function formatMonthYear(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function getCurrentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getNext12Months(): string[] {
  const months: string[] = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }

  return months;
}

export function calculateInstallmentForMonth(
  firstInvoiceMonth: string,
  totalAmount: number,
  installments: number,
  targetMonth: string
): number {
  if (!firstInvoiceMonth || !firstInvoiceMonth.includes('-')) return 0;

  const [firstYear, firstMonthNum] = firstInvoiceMonth.split('-').map(Number);
  const [targetYear, targetMonthNum] = targetMonth.split('-').map(Number);

  const firstDate = new Date(firstYear, firstMonthNum - 1);
  const targetDate = new Date(targetYear, targetMonthNum - 1);

  const monthsDiff = (targetDate.getFullYear() - firstDate.getFullYear()) * 12 +
    (targetDate.getMonth() - firstDate.getMonth());

  if (monthsDiff >= 0 && monthsDiff < installments) {
    return totalAmount / installments;
  }

  return 0;
}

export function getStatusColor(status: 'positive' | 'warning' | 'danger' | 'neutral'): string {
  const colors = {
    positive: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    neutral: 'text-muted-foreground'
  };
  return colors[status];
}

export function getStatusBgColor(status: 'positive' | 'warning' | 'danger' | 'neutral'): string {
  const colors = {
    positive: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    neutral: 'bg-muted text-muted-foreground'
  };
  return colors[status];
}

export const EXPENSE_CATEGORIES = [
  'Moradia',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Educação',
  'Lazer',
  'Serviços',
  'Compras',
  'Assinaturas',
  'Outros'
] as const;

export const INCOME_TYPES = {
  salary: 'Salário',
  bonus: 'Bônus',
  extra: 'Extra',
  other: 'Outro'
} as const;

export const PAYMENT_METHODS = {
  pix: 'PIX',
  debit: 'Débito',
  cash: 'Dinheiro',
  credit_card: 'Cartão de Crédito'
} as const;

/**
 * Calcula o mês da fatura com base na data da compra e no dia de fechamento do cartão.
 * Se o dia da compra <= dia de fechamento, a compra entra na fatura do mês atual.
 * Caso contrário, entra na fatura do próximo mês.
 */
export function getInvoiceMonth(date: Date, closingDay: number): string {
  const day = date.getDate();
  const year = date.getFullYear();
  const month = date.getMonth();

  if (day <= closingDay) {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
  } else {
    const nextMonth = new Date(year, month + 1, 1);
    return `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
  }
}
