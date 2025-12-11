import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VariableIncomeListProps {
    earnings: any[];
}

export function VariableIncomeList({ earnings }: VariableIncomeListProps) {
    if (earnings.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                Nenhum ganho registrado neste período.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {earnings.map((earning) => (
                <div key={earning.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-accent/50 transition-colors group card-mobile animate-fade-in">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="capitalize font-normal text-xs bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20">
                                {earning.category || 'Geral'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{format(parseISO(earning.created_at), "dd MMM, HH:mm", { locale: ptBR })}</span>
                        </div>
                        <p className="font-medium text-sm text-mobile-base">{earning.description || 'Sem descrição'}</p>
                    </div>
                    <span className="font-bold text-emerald-600 text-mobile-lg">+{formatCurrency(Number(earning.amount))}</span>
                </div>
            ))}
        </div>
    );
}
