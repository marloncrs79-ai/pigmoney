import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FixedExpense } from '@/hooks/useFinancialData'; // Variable expenses use same type
import { formatCurrency, formatDate, PAYMENT_METHODS } from '@/lib/utils';
import { CreditCard, ShoppingCart, Pencil, Trash2 } from 'lucide-react';

interface VariableExpenseListProps {
    expenses: FixedExpense[];
    onEdit: (expense: FixedExpense) => void;
    onDelete: (id: string) => void;
}

export function VariableExpenseList({ expenses, onEdit, onDelete }: VariableExpenseListProps) {
    if (expenses.length === 0) return null;

    return (
        <div className="space-y-3">
            {expenses.map(expense => (
                <Card key={expense.id} className="card-mobile animate-fade-in">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                            <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl ${expense.paid_with_card ? 'bg-primary/10' : 'bg-warning/10'}`}>
                                {expense.paid_with_card ? (
                                    <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                ) : (
                                    <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-mobile-base truncate">{expense.description || expense.name}</p>
                                    {expense.paid_with_card && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                                            Cartão
                                        </span>
                                    )}
                                </div>
                                <p className="text-mobile-sm text-muted-foreground truncate">
                                    {expense.category} · {expense.date && formatDate(expense.date)}
                                    {!expense.paid_with_card && ` · ${PAYMENT_METHODS[expense.payment_method as keyof typeof PAYMENT_METHODS] || expense.payment_method}`}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pl-2 shrink-0">
                            <span className="text-mobile-lg font-semibold whitespace-nowrap">{formatCurrency(expense.amount)}</span>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEdit(expense)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-danger" onClick={() => onDelete(expense.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
