import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { SimpleTooltip } from "./tooltip";

interface TrendIndicatorProps {
  value: number;
  previousValue?: number;
  format?: "percent" | "currency" | "number";
  showArrow?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TrendIndicator({
  value,
  previousValue,
  format = "percent",
  showArrow = true,
  size = "md",
  className,
}: TrendIndicatorProps) {
  const change = previousValue !== undefined 
    ? ((value - previousValue) / previousValue) * 100 
    : value;
  
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;

  const sizeClasses = {
    sm: "text-xs gap-0.5",
    md: "text-sm gap-1",
    lg: "text-base gap-1.5",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const formatValue = () => {
    const absChange = Math.abs(change);
    if (format === "percent") return `${absChange.toFixed(1)}%`;
    if (format === "currency") return `R$ ${absChange.toFixed(2)}`;
    return absChange.toFixed(0);
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium",
        sizeClasses[size],
        isPositive && "text-success",
        isNegative && "text-danger",
        isNeutral && "text-muted-foreground",
        className
      )}
    >
      {showArrow && (
        isPositive ? (
          <TrendingUp className={iconSizes[size]} />
        ) : isNegative ? (
          <TrendingDown className={iconSizes[size]} />
        ) : (
          <Minus className={iconSizes[size]} />
        )
      )}
      <span>{isPositive ? "+" : ""}{formatValue()}</span>
    </span>
  );
}

interface DataInsightProps {
  title: string;
  description: string;
  trend?: "up" | "down" | "neutral";
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function DataInsight({
  title,
  description,
  trend,
  action,
  className,
}: DataInsightProps) {
  const trendColors = {
    up: "border-l-success bg-success-50/50 dark:bg-success/10",
    down: "border-l-danger bg-danger-50/50 dark:bg-danger/10",
    neutral: "border-l-info bg-info-50/50 dark:bg-info/10",
  };

  return (
    <div
      className={cn(
        "border-l-4 rounded-r-xl p-4 transition-all duration-200 hover:shadow-md",
        trend ? trendColors[trend] : "border-l-primary bg-primary-50/50 dark:bg-primary/10",
        className
      )}
    >
      <h4 className="font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          {action.label}
          <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

interface ComparisonBadgeProps {
  current: number;
  previous: number;
  label?: string;
  className?: string;
}

export function ComparisonBadge({
  current,
  previous,
  label,
  className,
}: ComparisonBadgeProps) {
  const change = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <SimpleTooltip 
      content={`${label ? label + ": " : ""}${previous.toLocaleString('pt-BR')} → ${current.toLocaleString('pt-BR')}`}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
          isPositive && "bg-success-50 text-success dark:bg-success/20",
          isNegative && "bg-danger-50 text-danger dark:bg-danger/20",
          !isPositive && !isNegative && "bg-muted text-muted-foreground",
          className
        )}
      >
        {isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : isNegative ? (
          <TrendingDown className="w-3 h-3" />
        ) : (
          <Minus className="w-3 h-3" />
        )}
        {change > 0 ? "+" : ""}{change.toFixed(0)}%
      </span>
    </SimpleTooltip>
  );
}

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: "primary" | "success" | "warning" | "danger" | "accent";
  showValue?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  variant = "primary",
  showValue = true,
  className,
  children,
}: ProgressRingProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    primary: "stroke-primary",
    success: "stroke-success",
    warning: "stroke-warning",
    danger: "stroke-danger",
    accent: "stroke-accent",
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-muted"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={cn(colors[variant], "transition-all duration-500 ease-out")}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showValue && (
          <span className="text-lg font-bold tabular-nums">
            {Math.round(percentage)}%
          </span>
        ))}
      </div>
    </div>
  );
}
