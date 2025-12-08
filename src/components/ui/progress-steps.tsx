import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string | number;
  label: string;
  description?: string;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  variant?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
}

export function ProgressSteps({
  steps,
  currentStep,
  className,
  variant = "horizontal",
  size = "md",
}: ProgressStepsProps) {
  const sizeConfig = {
    sm: { circle: "w-6 h-6", icon: "h-3 w-3", text: "text-xs", gap: "gap-1" },
    md: { circle: "w-8 h-8", icon: "h-4 w-4", text: "text-sm", gap: "gap-2" },
    lg: { circle: "w-10 h-10", icon: "h-5 w-5", text: "text-base", gap: "gap-3" },
  };

  const config = sizeConfig[size];

  if (variant === "vertical") {
    return (
      <nav className={cn("flex flex-col", className)} aria-label="Progresso">
        <ol className="space-y-4">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <li key={step.id} className="flex gap-4">
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "rounded-full flex items-center justify-center font-semibold transition-all duration-300",
                      config.circle,
                      config.text,
                      isCompleted && "bg-primary text-primary-foreground",
                      isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                    )}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {isCompleted ? (
                      <Check className={cn(config.icon, "animate-scale-in")} />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-0.5 flex-1 min-h-[24px] mt-2 transition-colors duration-300",
                        isCompleted ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>

                {/* Step content */}
                <div className={cn("pb-4", config.gap)}>
                  <p
                    className={cn(
                      "font-medium transition-colors duration-200",
                      config.text,
                      isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.description}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  return (
    <nav className={cn("w-full", className)} aria-label="Progresso">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center",
                index < steps.length - 1 && "flex-1"
              )}
            >
              <div className="flex flex-col items-center">
                {/* Step circle */}
                <div
                  className={cn(
                    "rounded-full flex items-center justify-center font-semibold transition-all duration-300",
                    config.circle,
                    config.text,
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className={cn(config.icon, "animate-scale-in")} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Step label - hidden on small screens */}
                <span
                  className={cn(
                    "hidden sm:block mt-2 font-medium text-center max-w-[80px] transition-colors duration-200",
                    config.text,
                    isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-4">
                  <div
                    className={cn(
                      "h-0.5 w-full transition-colors duration-300",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
