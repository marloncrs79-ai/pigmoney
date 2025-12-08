import { cn } from "@/lib/utils";
import { Check, PartyPopper, Sparkles, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

interface SuccessAnimationProps {
  show: boolean;
  onComplete?: () => void;
  variant?: "check" | "celebrate" | "sparkle" | "trophy";
  message?: string;
  duration?: number;
  className?: string;
}

export function SuccessAnimation({
  show,
  onComplete,
  variant = "check",
  message,
  duration = 2000,
  className,
}: SuccessAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (!isVisible) return null;

  const icons = {
    check: Check,
    celebrate: PartyPopper,
    sparkle: Sparkles,
    trophy: Trophy,
  };

  const Icon = icons[variant];

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
        "animate-fade-in",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 animate-bounce-in">
        {/* Animated Icon */}
        <div className="relative">
          {/* Outer ring animation */}
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          
          {/* Main circle */}
          <div className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-glow-primary">
            <Icon className="h-10 w-10 text-primary-foreground animate-scale-in" />
          </div>
          
          {/* Sparkle decorations for celebrate variant */}
          {variant === "celebrate" && (
            <>
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-secondary animate-wiggle" />
              <Sparkles className="absolute -bottom-1 -left-3 h-5 w-5 text-accent animate-wiggle" style={{ animationDelay: "0.2s" }} />
              <Sparkles className="absolute top-1/2 -right-4 h-4 w-4 text-info animate-wiggle" style={{ animationDelay: "0.4s" }} />
            </>
          )}
        </div>
        
        {/* Success message */}
        {message && (
          <p className="text-lg font-semibold text-foreground animate-slide-up" style={{ animationDelay: "0.2s" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

// Inline success indicator for form submissions
interface InlineSuccessProps {
  show: boolean;
  message?: string;
  className?: string;
}

export function InlineSuccess({ show, message = "Salvo!", className }: InlineSuccessProps) {
  if (!show) return null;

  return (
    <div 
      className={cn(
        "flex items-center gap-2 text-success animate-fade-in",
        className
      )}
      role="status"
    >
      <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
        <Check className="h-3 w-3 text-success-foreground" />
      </div>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
