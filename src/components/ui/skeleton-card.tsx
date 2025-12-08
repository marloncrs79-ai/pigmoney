import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface SkeletonCardProps {
  className?: string;
  lines?: number;
  showAvatar?: boolean;
  showImage?: boolean;
}

export function SkeletonCard({ 
  className, 
  lines = 3, 
  showAvatar = false,
  showImage = false 
}: SkeletonCardProps) {
  return (
    <div 
      className={cn(
        "rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 space-y-4 animate-pulse",
        className
      )}
      role="status"
      aria-label="Carregando conteúdo..."
    >
      {showImage && (
        <Skeleton className="h-32 w-full rounded-xl" />
      )}
      
      <div className="flex items-center gap-3">
        {showAvatar && (
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        )}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn(
              "h-4",
              i === lines - 1 ? "w-2/3" : "w-full"
            )} 
          />
        ))}
      </div>
      
      <span className="sr-only">Carregando conteúdo...</span>
    </div>
  );
}

export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 animate-pulse",
        className
      )}
      role="status"
      aria-label="Carregando estatística..."
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
      </div>
      <span className="sr-only">Carregando estatística...</span>
    </div>
  );
}

export function SkeletonList({ 
  count = 3, 
  className 
}: { 
  count?: number; 
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)} role="status" aria-label="Carregando lista...">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i}
          className="rounded-xl border border-border bg-card p-4 flex items-center gap-4 animate-pulse"
        >
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full shrink-0" />
        </div>
      ))}
      <span className="sr-only">Carregando lista...</span>
    </div>
  );
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 animate-pulse",
        className
      )}
      role="status"
      aria-label="Carregando gráfico..."
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        
        <div className="h-[200px] sm:h-[250px] flex items-end gap-2 pt-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end gap-1">
              <Skeleton 
                className="w-full rounded-t-lg" 
                style={{ height: `${Math.random() * 60 + 40}%` }}
              />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Carregando gráfico...</span>
    </div>
  );
}
