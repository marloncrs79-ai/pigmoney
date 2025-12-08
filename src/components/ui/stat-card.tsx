import { ReactNode } from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'info';
  className?: string;
  isCurrency?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
  isCurrency = true
}: StatCardProps) {
  const variantStyles = {
    default: 'bg-card border-border',
    success: 'bg-primary-soft/50 border-primary/30',
    warning: 'bg-secondary/10 border-secondary/30',
    danger: 'bg-danger/10 border-danger/30',
    accent: 'bg-accent-soft/30 border-accent/30',
    info: 'bg-info-soft/30 border-info/30'
  };

  const iconStyles = {
    default: 'bg-muted text-foreground',
    success: 'bg-primary/20 text-primary',
    warning: 'bg-secondary/20 text-secondary-foreground',
    danger: 'bg-danger/20 text-danger',
    accent: 'bg-accent/20 text-accent',
    info: 'bg-info/20 text-info'
  };

  const valueStyles = {
    default: 'text-foreground',
    success: 'text-primary',
    warning: 'text-secondary-foreground',
    danger: 'text-danger',
    accent: 'text-accent',
    info: 'text-info'
  };

  return (
    <Card className={cn('animate-slide-up hover:scale-[1.02] transition-transform duration-200 rounded-3xl', variantStyles[variant], className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-semibold text-muted-foreground truncate">{title}</p>
            <p className={cn('text-xl sm:text-2xl font-extrabold tracking-tight', valueStyles[variant])}>
              {isCurrency ? formatCurrency(value) : value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
            {trend && (
              <div className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold',
                trend.isPositive ? 'bg-primary/20 text-primary' : 'bg-danger/20 text-danger'
              )}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn('rounded-2xl p-2.5 sm:p-3 flex-shrink-0', iconStyles[variant])}>
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
