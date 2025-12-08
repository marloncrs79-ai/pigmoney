import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Step1BaseSalary } from './steps/Step1BaseSalary';
import { Step2Components } from './steps/Step2Components';
import { Step3SeasonalEvents } from './steps/Step3SeasonalEvents';
import { Step4Deductions } from './steps/Step4Deductions';
import { useCreateIncome } from '@/hooks/useFinancialData';

interface SalaryWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingBaseAmount?: number;
}

export interface SalaryWizardData {
  baseSalary: {
    source: string;
    base_amount: number;
    is_revision: boolean;
    effective_from: string;
  };
}

const STEPS = [
  { title: 'Salário Base', description: 'Informe seu salário base mensal' },
  { title: 'Componentes', description: 'Benefícios e descontos recorrentes' },
  { title: 'Sazonais', description: '13º, férias, PLR e bônus' },
  { title: 'Consignados', description: 'Empréstimos descontados em folha' }
];

export function SalaryWizard({ open, onOpenChange, existingBaseAmount }: SalaryWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<SalaryWizardData>({
    baseSalary: {
      source: '',
      base_amount: existingBaseAmount || 0,
      is_revision: !!existingBaseAmount,
      effective_from: new Date().toISOString().slice(0, 10)
    }
  });

  const createIncome = useCreateIncome();

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // Create the base income record if on step 0 and has data
    if (data.baseSalary.source && data.baseSalary.base_amount > 0) {
      await createIncome.mutateAsync({
        source: data.baseSalary.source,
        base_amount: data.baseSalary.base_amount,
        gross_amount: data.baseSalary.base_amount,
        net_amount: data.baseSalary.base_amount,
        date: data.baseSalary.effective_from,
        type: 'salary',
        is_salary_revision: data.baseSalary.is_revision,
        effective_from: data.baseSalary.effective_from
      } as any);
    }

    // Components, events and deductions are already saved in their respective steps
    onOpenChange(false);
    setCurrentStep(0);
    setData({
      baseSalary: { source: '', base_amount: 0, is_revision: false, effective_from: new Date().toISOString().slice(0, 10) }
    });
  };

  const canProceed = () => {
    if (currentStep === 0) {
      return data.baseSalary.source.trim() !== '' && data.baseSalary.base_amount > 0;
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">{STEPS[currentStep].title}</DialogTitle>
              <p className="text-sm text-muted-foreground">{STEPS[currentStep].description}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex justify-between">
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-1">
                <div
                  className={cn(
                    'h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-all',
                    i < currentStep && 'bg-primary text-primary-foreground',
                    i === currentStep && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    i > currentStep && 'bg-muted text-muted-foreground'
                  )}
                >
                  {i < currentStep ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                <span className={cn(
                  'text-xs hidden md:inline',
                  i === currentStep ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="py-4 min-h-[300px]">
          {currentStep === 0 && (
            <Step1BaseSalary
              data={data.baseSalary}
              onChange={(baseSalary) => setData({ ...data, baseSalary })}
              existingBaseAmount={existingBaseAmount}
            />
          )}
          {currentStep === 1 && <Step2Components />}
          {currentStep === 2 && <Step3SeasonalEvents />}
          {currentStep === 3 && <Step4Deductions />}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2"
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceed() || createIncome.isPending}
              className="gap-2 bg-success hover:bg-success/90"
            >
              <Check className="h-4 w-4" />
              Finalizar Configuração
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
