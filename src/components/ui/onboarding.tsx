import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface OnboardingStepProps {
  step: number;
  totalSteps: number;
  icon: LucideIcon;
  title: string;
  description: string;
  illustration?: React.ReactNode;
  className?: string;
}

export function OnboardingStep({
  step,
  totalSteps,
  icon: Icon,
  title,
  description,
  illustration,
  className,
}: OnboardingStepProps) {
  return (
    <div className={cn("text-center px-6 py-8 animate-fade-in", className)}>
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === step - 1 
                ? "w-8 bg-primary" 
                : i < step - 1 
                  ? "w-2 bg-primary/50" 
                  : "w-2 bg-muted"
            )}
          />
        ))}
      </div>

      {/* Illustration or icon */}
      <div className="mb-6 flex justify-center">
        {illustration || (
          <div className="w-24 h-24 rounded-3xl bg-primary-50 dark:bg-primary/10 flex items-center justify-center">
            <Icon className="w-12 h-12 text-primary" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Content */}
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
        {title}
      </h2>
      <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-md mx-auto">
        {description}
      </p>
    </div>
  );
}

interface FeatureHighlightProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: "primary" | "secondary" | "accent" | "info";
  className?: string;
}

export function FeatureHighlight({
  icon: Icon,
  title,
  description,
  color = "primary",
  className,
}: FeatureHighlightProps) {
  const colorClasses = {
    primary: "bg-primary-50 dark:bg-primary/10 text-primary",
    secondary: "bg-secondary-50 dark:bg-secondary/10 text-secondary-600 dark:text-secondary",
    accent: "bg-accent-50 dark:bg-accent/10 text-accent",
    info: "bg-info-50 dark:bg-info/10 text-info",
  };

  return (
    <div className={cn("flex gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors", className)}>
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", colorClasses[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

interface WelcomeBannerProps {
  userName?: string;
  greeting?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function WelcomeBanner({
  userName,
  greeting,
  subtitle,
  action,
  className,
}: WelcomeBannerProps) {
  const getGreeting = () => {
    if (greeting) return greeting;
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl p-6 sm:p-8",
        "bg-gradient-to-br from-primary via-primary-600 to-primary-700",
        "text-primary-foreground",
        className
      )}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {getGreeting()}{userName ? `, ${userName}` : ""}! 👋
          </h1>
          {subtitle && (
            <p className="mt-2 text-primary-foreground/80 text-sm sm:text-base">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick: () => void;
  color?: "primary" | "secondary" | "accent" | "info";
  className?: string;
}

export function QuickActionCard({
  icon: Icon,
  title,
  description,
  onClick,
  color = "primary",
  className,
}: QuickActionCardProps) {
  const colorClasses = {
    primary: "hover:border-primary/50 hover:bg-primary-50/50 dark:hover:bg-primary/5",
    secondary: "hover:border-secondary/50 hover:bg-secondary-50/50 dark:hover:bg-secondary/5",
    accent: "hover:border-accent/50 hover:bg-accent-50/50 dark:hover:bg-accent/5",
    info: "hover:border-info/50 hover:bg-info-50/50 dark:hover:bg-info/5",
  };

  const iconColors = {
    primary: "text-primary bg-primary-50 dark:bg-primary/10",
    secondary: "text-secondary-600 dark:text-secondary bg-secondary-50 dark:bg-secondary/10",
    accent: "text-accent bg-accent-50 dark:bg-accent/10",
    info: "text-info bg-info-50 dark:bg-info/10",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-2xl border border-border bg-card text-left",
        "transition-all duration-200 hover:shadow-md active:scale-[0.98]",
        colorClasses[color],
        className
      )}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", iconColors[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
    </button>
  );
}
