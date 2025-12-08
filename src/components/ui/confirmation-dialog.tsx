import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { AlertTriangle, Trash2, Info, CheckCircle } from "lucide-react";

type ConfirmationVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: ConfirmationVariant;
  isLoading?: boolean;
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-danger-50',
    iconColor: 'text-danger',
    buttonClass: 'bg-danger hover:bg-danger/90 text-danger-foreground',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-warning-50',
    iconColor: 'text-warning',
    buttonClass: 'bg-warning hover:bg-warning/90 text-warning-foreground',
  },
  info: {
    icon: Info,
    iconBg: 'bg-info-50',
    iconColor: 'text-info',
    buttonClass: 'bg-info hover:bg-info/90 text-info-foreground',
  },
  success: {
    icon: CheckCircle,
    iconBg: 'bg-success-50',
    iconColor: 'text-success',
    buttonClass: 'bg-success hover:bg-success/90 text-success-foreground',
  },
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  variant = 'danger',
  isLoading = false,
}: ConfirmationDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md rounded-2xl sm:rounded-3xl animate-scale-in">
        <AlertDialogHeader className="flex flex-col items-center text-center">
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center mb-4",
            config.iconBg
          )}>
            <Icon className={cn("h-7 w-7", config.iconColor)} />
          </div>
          <AlertDialogTitle className="text-xl">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground mt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <AlertDialogCancel 
            onClick={handleCancel}
            className="w-full sm:w-auto rounded-full"
            disabled={isLoading}
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={cn("w-full sm:w-auto rounded-full", config.buttonClass)}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processando...
              </span>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook for easy usage
import { useState, useCallback } from 'react';

interface UseConfirmationOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmationVariant;
}

export function useConfirmation(defaultOptions: UseConfirmationOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState(defaultOptions);
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((overrideOptions?: Partial<UseConfirmationOptions>) => {
    setOptions({ ...defaultOptions, ...overrideOptions });
    setIsOpen(true);
    
    return new Promise<boolean>((resolve) => {
      setResolveRef(() => resolve);
    });
  }, [defaultOptions]);

  const handleConfirm = useCallback(() => {
    resolveRef?.(true);
    setIsOpen(false);
  }, [resolveRef]);

  const handleCancel = useCallback(() => {
    resolveRef?.(false);
    setIsOpen(false);
  }, [resolveRef]);

  const Dialog = useCallback(() => (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      {...options}
    />
  ), [isOpen, options, handleConfirm, handleCancel]);

  return { confirm, Dialog };
}
