import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "shimmer";
}

function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  return (
    <div 
      className={cn(
        "rounded-lg",
        variant === "default" && "animate-pulse bg-muted",
        variant === "shimmer" && "animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/5 to-muted bg-[length:200%_100%]",
        className
      )} 
      role="status"
      aria-label="Carregando..."
      {...props} 
    />
  );
}

export { Skeleton };
