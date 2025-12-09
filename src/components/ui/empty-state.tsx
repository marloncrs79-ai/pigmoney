import { LucideIcon, FileQuestion, AlertCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'card';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  className,
  variant = 'default'
}: EmptyStateProps) {
  const isCompact = variant === 'compact';
  const isCard = variant === 'card';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center animate-fade-in',
        isCompact ? 'py-6 px-4' : 'py-12 px-6',
        isCard && 'bg-card rounded-2xl sm:rounded-3xl border border-border',
        className
      )}
      role="status"
      aria-label={title}
    >
      {/* Animated Icon Container */}
      <div
        className={cn(
          "rounded-full bg-muted/80 flex items-center justify-center transition-transform duration-300 hover:scale-110",
          isCompact ? 'p-3 mb-3' : 'p-5 mb-5'
        )}
      >
        <Icon
          className={cn(
            "text-muted-foreground/60",
            isCompact ? 'h-6 w-6' : 'h-10 w-10'
          )}
          strokeWidth={1.5}
        />
      </div>

      {/* Title */}
      <h3
        className={cn(
          "font-semibold text-foreground",
          isCompact ? 'text-base mb-1' : 'text-lg mb-2'
        )}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className={cn(
          "text-muted-foreground max-w-sm leading-relaxed",
          isCompact ? 'text-sm' : 'text-sm sm:text-base'
        )}
      >
        {description}
      </p>

      {/* Action Button */}
      {(action || (actionLabel && onAction)) && (
        <div className={cn(isCompact ? 'mt-4' : 'mt-6')}>
          {action || (
            <Button
              onClick={onAction}
              className="gap-2 hover-bounce"
              size={isCompact ? 'sm' : 'default'}
            >
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Preset empty states for common scenarios
interface PresetEmptyStateProps {
  onAction?: () => void;
  className?: string;
}

export function NoDataEmptyState({ onAction, className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={FileQuestion}
      title="Nenhum dado encontrado"
      description="Não há dados para exibir no momento. Adicione alguns dados para começar."
      actionLabel={onAction ? "Adicionar" : undefined}
      onAction={onAction}
      className={className}
    />
  );
}

export function ErrorEmptyState({
  onAction,
  className,
  message = "Ocorreu um erro ao carregar os dados. Tente novamente."
}: PresetEmptyStateProps & { message?: string }) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Ops! Algo deu errado"
      description={message}
      actionLabel={onAction ? "Tentar novamente" : undefined}
      onAction={onAction}
      className={className}
    />
  );
}

export function SearchEmptyState({ className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={Search}
      title="Nenhum resultado encontrado"
      description="Tente ajustar os filtros ou termos de busca para encontrar o que procura."
      className={className}
      variant="compact"
    />
  );
}
