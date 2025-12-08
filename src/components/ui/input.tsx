import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Check } from "lucide-react";

interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean;
  success?: boolean;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, errorMessage, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            // Base styles
            "flex h-12 w-full rounded-2xl border-2 bg-background text-base transition-all duration-200",
            "placeholder:text-muted-foreground",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
            // Focus states
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            // Disabled state
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",
            // Default border
            "border-input focus-visible:border-primary",
            // Error state
            error && "border-danger focus-visible:border-danger focus-visible:ring-danger/30",
            // Success state
            success && "border-success focus-visible:border-success focus-visible:ring-success/30",
            // Padding adjustments for icons
            leftIcon ? "pl-12 pr-5" : "px-5",
            rightIcon || error || success ? "pr-12" : "",
            "py-3",
            className,
          )}
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={errorMessage ? `${props.id}-error` : undefined}
          {...props}
        />
        {/* Right icon or status indicator */}
        {(rightIcon || error || success) && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            {error ? (
              <AlertCircle className="h-5 w-5 text-danger animate-scale-in" />
            ) : success ? (
              <Check className="h-5 w-5 text-success animate-scale-in" />
            ) : (
              rightIcon
            )}
          </div>
        )}
        {/* Error message */}
        {errorMessage && error && (
          <p 
            id={`${props.id}-error`}
            className="mt-1.5 text-sm text-danger animate-slide-up"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
