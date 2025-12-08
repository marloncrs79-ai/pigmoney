import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export function LoadingSpinner({ size = "md", className, label }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3" role="status" aria-label={label || "Carregando..."}>
      <Loader2 
        className={cn(
          "animate-spin text-primary",
          sizeClasses[size],
          className
        )} 
      />
      {label && (
        <span className="text-sm text-muted-foreground animate-pulse">{label}</span>
      )}
      <span className="sr-only">{label || "Carregando..."}</span>
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  label?: string;
}

export function LoadingOverlay({ isLoading, children, label }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl z-10 animate-fade-in">
          <LoadingSpinner size="lg" label={label} />
        </div>
      )}
    </div>
  );
}

interface FullPageLoadingProps {
  label?: string;
}

export function FullPageLoading({ label = "Carregando..." }: FullPageLoadingProps) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse" />
          <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground animate-pulse">{label}</p>
      </div>
    </div>
  );
}
