import { HelpCircle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  content: string | React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
  iconClassName?: string;
  variant?: "help" | "info";
  delayDuration?: number;
}

export function InfoTooltip({
  content,
  side = "top",
  align = "center",
  className,
  iconClassName,
  variant = "help",
  delayDuration = 300,
}: InfoTooltipProps) {
  const Icon = variant === "help" ? HelpCircle : Info;
  
  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-full p-0.5",
            "text-muted-foreground hover:text-foreground",
            "transition-colors duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className
          )}
          aria-label="Mais informações"
        >
          <Icon className={cn("h-4 w-4", iconClassName)} />
        </button>
      </TooltipTrigger>
      <TooltipContent 
        side={side} 
        align={align}
        className="max-w-xs text-sm leading-relaxed"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

interface LabelWithTooltipProps {
  label: string;
  tooltip: string | React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}

export function LabelWithTooltip({
  label,
  tooltip,
  htmlFor,
  required,
  className,
}: LabelWithTooltipProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <label 
        htmlFor={htmlFor}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      <InfoTooltip content={tooltip} />
    </div>
  );
}
