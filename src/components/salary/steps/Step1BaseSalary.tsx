import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, RefreshCw, Wallet } from 'lucide-react';

interface Step1Props {
  data: {
    source: string;
    base_amount: number;
    is_revision: boolean;
    effective_from: string;
  };
  onChange: (data: Step1Props['data']) => void;
  existingBaseAmount?: number;
}

export function Step1BaseSalary({ data, onChange, existingBaseAmount }: Step1Props) {
  return (
    <div className="space-y-6">
      {/* Source */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">De quem é este salário?</Label>
        <Input
          placeholder="Ex: João, Maria, Empresa XYZ"
          value={data.source}
          onChange={(e) => onChange({ ...data, source: e.target.value })}
          className="h-14 text-lg"
        />
        <p className="text-sm text-muted-foreground">
          Identifique a fonte para facilitar a organização
        </p>
      </div>

      {/* Base Amount */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Qual o salário base mensal?</Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
          <Input
            type="number"
            step="0.01"
            placeholder="0,00"
            value={data.base_amount || ''}
            onChange={(e) => onChange({ ...data, base_amount: parseFloat(e.target.value) || 0 })}
            className="h-14 text-lg pl-12"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Informe o valor bruto antes de descontos
        </p>
      </div>

      {/* Revision Question - Only show if there's existing data */}
      {existingBaseAmount && existingBaseAmount > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">Este é um novo salário ou atualização?</Label>
          <RadioGroup
            value={data.is_revision ? 'revision' : 'new'}
            onValueChange={(v) => onChange({ ...data, is_revision: v === 'revision' })}
            className="grid gap-3"
          >
            <Card className={`cursor-pointer transition-all ${!data.is_revision ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="flex items-center gap-4 p-4">
                <RadioGroupItem value="new" id="new" />
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Label htmlFor="new" className="font-medium cursor-pointer">Novo salário</Label>
                    <p className="text-sm text-muted-foreground">Primeira vez registrando esta renda</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`cursor-pointer transition-all ${data.is_revision ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="flex items-center gap-4 p-4">
                <RadioGroupItem value="revision" id="revision" />
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <Label htmlFor="revision" className="font-medium cursor-pointer">Revisão salarial</Label>
                    <p className="text-sm text-muted-foreground">
                      Atualização do salário anterior ({formatCurrency(existingBaseAmount)})
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </RadioGroup>
        </div>
      )}

      {/* Effective Date */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">
          {data.is_revision ? 'A partir de quando vale o novo salário?' : 'Quando começou a receber?'}
        </Label>
        <Input
          type="date"
          value={data.effective_from}
          onChange={(e) => onChange({ ...data, effective_from: e.target.value })}
          className="h-14 text-lg"
        />
      </div>

      {/* Preview */}
      {data.base_amount > 0 && (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Salário base configurado</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(data.base_amount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
