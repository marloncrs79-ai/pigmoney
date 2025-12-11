import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreditCards, FixedExpense } from '@/hooks/useFinancialData';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '@/lib/utils';
import { CreditCard, Loader2, Save } from 'lucide-react';

interface ExpenseFormProps {
    type: 'fixed' | 'variable';
    initialData?: Partial<FixedExpense> | null;
    onSubmit: (data: any) => Promise<void>;
    onCancel?: () => void;
    isSubmitting?: boolean;
}

export function ExpenseForm({ type, initialData, onSubmit, onCancel, isSubmitting = false }: ExpenseFormProps) {
    const { data: creditCards = [] } = useCreditCards();
    const [formType, setFormType] = useState<'fixed' | 'variable'>(type);

    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        due_day: '',
        category: '',
        is_active: true,
        notes: '',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'pix',
        description: '',
        paid_with_card: false,
        card_id: '',
        is_installment: false,
        installments: '1',
        installment_amount: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormType(initialData.type as 'fixed' | 'variable');
            setFormData({
                name: initialData.name || '',
                amount: initialData.amount?.toString() || '',
                due_day: initialData.due_day?.toString() || '',
                category: initialData.category || '',
                is_active: initialData.is_active ?? true,
                notes: initialData.notes || '',
                date: initialData.date || new Date().toISOString().split('T')[0],
                payment_method: initialData.payment_method || 'pix',
                description: initialData.description || '',
                paid_with_card: initialData.paid_with_card || false,
                card_id: initialData.card_id || '',
                is_installment: false,
                installments: '1',
                installment_amount: ''
            });
        } else {
            // Reset if no initialData (switching between add/edit)
            setFormType(type);
        }
    }, [initialData, type]);

    // Handle form type switch from prop
    useEffect(() => {
        if (!initialData) {
            setFormType(type);
        }
    }, [type, initialData]);


    const handleInstallmentChange = (field: 'installments' | 'installment_amount', value: string) => {
        const newData = { ...formData, [field]: value };

        if (newData.is_installment && newData.installments && newData.installment_amount) {
            const total = (parseFloat(newData.installments) * parseFloat(newData.installment_amount.replace(',', '.'))).toFixed(2);
            newData.amount = total;
        }

        setFormData(newData);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare data
        // (Logic moved from Expenses.tsx)
        const selectedCard = formData.paid_with_card && formData.card_id
            ? creditCards.find(c => c.id === formData.card_id)
            : null;

        let finalAmount = parseFloat(formData.amount);
        if (formData.is_installment && formData.installments && formData.installment_amount) {
            finalAmount = parseFloat(formData.installments) * parseFloat(formData.installment_amount.replace(',', '.'));
        }

        const dataToSubmit = {
            ...formData,
            originalType: formType, // Pass formType to know which mutation to call in parent
            finalAmount,
            selectedCard
        };

        await onSubmit(dataToSubmit);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type selector (only if not editing or allow switching) */}
            <div className="space-y-2">
                <Label>Tipo de Despesa</Label>
                <Select
                    value={formType}
                    onValueChange={(v) => setFormType(v as 'fixed' | 'variable')}
                    disabled={!!initialData}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="fixed">Fixa (recorrente)</SelectItem>
                        <SelectItem value="variable">Variável (pontual)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {formType === 'fixed' ? (
                <>
                    <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                            placeholder="Ex: Aluguel"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="input-mobile"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Valor Total</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                                readOnly={formData.is_installment}
                                className={`input-mobile ${formData.is_installment ? "bg-muted" : ""}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Dia de Vencimento</Label>
                            <Input
                                type="number"
                                min="1"
                                max="31"
                                placeholder="10"
                                value={formData.due_day}
                                onChange={(e) => setFormData({ ...formData, due_day: e.target.value })}
                                required
                                className="input-mobile"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                            <SelectTrigger className="input-mobile">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                {EXPENSE_CATEGORIES.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <Label>Despesa ativa</Label>
                        <Switch
                            checked={formData.is_active}
                            onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                        />
                    </div>

                    {/* Card payment section */}
                    <div className="space-y-3 rounded-xl border p-4 bg-muted/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <Label>Paga no cartão de crédito?</Label>
                            </div>
                            <Switch
                                checked={formData.paid_with_card}
                                onCheckedChange={(v) => setFormData({
                                    ...formData,
                                    paid_with_card: v,
                                    card_id: v ? formData.card_id : '',
                                    is_installment: false
                                })}
                                disabled={creditCards.length === 0}
                            />
                        </div>

                        {formData.paid_with_card && (
                            <div className="space-y-4 pt-4 border-t border-dashed border-muted-foreground/30 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <Label>Selecione o Cartão</Label>
                                    <Select
                                        value={formData.card_id}
                                        onValueChange={(v) => setFormData({ ...formData, card_id: v })}
                                    >
                                        <SelectTrigger className="input-mobile">
                                            <SelectValue placeholder="Selecione o cartão" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {creditCards.map(card => (
                                                <SelectItem key={card.id} value={card.id}>
                                                    {card.nickname} ({card.holder_name})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Installment Toggle */}
                                <div className="flex items-center justify-between">
                                    <Label>Compra Parcelada?</Label>
                                    <Switch
                                        checked={formData.is_installment}
                                        onCheckedChange={(v: boolean) => {
                                            handleInstallmentChange('is_installment' as any, v as any);
                                        }}
                                        onClick={() => setFormData(prev => ({ ...prev, is_installment: !prev.is_installment }))}
                                    />
                                </div>

                                {formData.is_installment && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nº Parcelas</Label>
                                            <Input
                                                type="number"
                                                min="2"
                                                max="48"
                                                value={formData.installments}
                                                onChange={(e) => handleInstallmentChange('installments', e.target.value)}
                                                className="input-mobile"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Valor da Parcela</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0,00"
                                                value={formData.installment_amount}
                                                onChange={(e) => handleInstallmentChange('installment_amount', e.target.value)}
                                                className="input-mobile"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {creditCards.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                                Cadastre cartões na página de Cartões para usar esta opção.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Observações (opcional)</Label>
                        <Input
                            placeholder="Notas adicionais"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="input-mobile"
                        />
                    </div>
                </>
            ) : (
                <>
                    <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Input
                            placeholder="Ex: Compras no mercado"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            className="input-mobile"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Valor Total</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                                readOnly={formData.is_installment}
                                className={`input-mobile ${formData.is_installment ? "bg-muted" : ""}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Data</Label>
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                                className="input-mobile"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                <SelectTrigger className="input-mobile">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {EXPENSE_CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {!formData.paid_with_card && (
                            <div className="space-y-2">
                                <Label>Método de Pagamento</Label>
                                <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
                                    <SelectTrigger className="input-mobile">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(PAYMENT_METHODS).filter(([key]) => key !== 'credit_card').map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* Card payment section (Variable) */}
                    <div className="space-y-3 rounded-xl border p-4 bg-muted/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <Label>Foi no cartão de crédito?</Label>
                            </div>
                            <Switch
                                checked={formData.paid_with_card}
                                onCheckedChange={(v) => setFormData({
                                    ...formData,
                                    paid_with_card: v,
                                    card_id: v ? formData.card_id : '',
                                    is_installment: false
                                })}
                                disabled={creditCards.length === 0}
                            />
                        </div>

                        {formData.paid_with_card && (
                            <div className="space-y-4 pt-4 border-t border-dashed border-muted-foreground/30 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <Label>Selecione o Cartão</Label>
                                    <Select
                                        value={formData.card_id}
                                        onValueChange={(v) => setFormData({ ...formData, card_id: v })}
                                    >
                                        <SelectTrigger className="input-mobile">
                                            <SelectValue placeholder="Selecione o cartão" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {creditCards.map(card => (
                                                <SelectItem key={card.id} value={card.id}>
                                                    {card.nickname} ({card.holder_name})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Installment Toggle */}
                                <div className="flex items-center justify-between">
                                    <Label>Compra Parcelada?</Label>
                                    <Switch
                                        checked={formData.is_installment}
                                        onCheckedChange={(v: boolean) => handleInstallmentChange('is_installment' as any, v as any)}
                                        onClick={() => setFormData(prev => ({ ...prev, is_installment: !prev.is_installment }))}
                                    />
                                </div>

                                {formData.is_installment && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nº Parcelas</Label>
                                            <Input
                                                type="number"
                                                min="2"
                                                max="48"
                                                value={formData.installments}
                                                onChange={(e) => handleInstallmentChange('installments', e.target.value)}
                                                className="input-mobile"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Valor da Parcela</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0,00"
                                                value={formData.installment_amount}
                                                onChange={(e) => handleInstallmentChange('installment_amount', e.target.value)}
                                                className="input-mobile"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {creditCards.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                                Cadastre cartões na página de Cartões para usar esta opção.
                            </p>
                        )}
                    </div>
                </>
            )}

            <Button
                type="submit"
                className="w-full btn-mobile"
                disabled={isSubmitting}
            >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? 'Salvar Alterações' : 'Adicionar Despesa'}
            </Button>
        </form>
    );
}
