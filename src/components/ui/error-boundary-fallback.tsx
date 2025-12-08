import { cn } from "@/lib/utils";
import { Button } from "./button";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface ErrorBoundaryFallbackProps {
  error?: Error;
  resetError?: () => void;
  className?: string;
}

export function ErrorBoundaryFallback({ 
  error, 
  resetError,
  className 
}: ErrorBoundaryFallbackProps) {
  return (
    <div className={cn(
      "relative min-h-[50vh] flex items-center justify-center p-6",
      className
    )}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-danger-50/50 via-background to-background dark:from-danger-900/10" />
      
      <div className="relative max-w-md w-full text-center animate-fade-in">
        {/* Error icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-danger-50 dark:bg-danger-900/30 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-danger" strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-card border-2 border-danger/20 flex items-center justify-center">
              <span className="text-lg">😔</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="glass rounded-3xl p-6 sm:p-8 shadow-xl border border-danger/10">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Algo deu errado
          </h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Encontramos um problema inesperado. Não se preocupe, nossa equipe foi notificada.
          </p>
          
          {/* Error details (development only) */}
          {error && process.env.NODE_ENV === 'development' && (
            <details className="mb-4 text-left">
              <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                Detalhes técnicos
              </summary>
              <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-auto text-danger">
                {error.message}
              </pre>
            </details>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {resetError && (
              <Button onClick={resetError} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </Button>
            )}
            <Button variant="outline" asChild className="gap-2">
              <Link to="/">
                <Home className="w-4 h-4" />
                Ir para o início
              </Link>
            </Button>
          </div>
        </div>

        {/* Additional help */}
        <p className="mt-6 text-sm text-muted-foreground">
          Se o problema persistir, entre em contato conosco.
        </p>
      </div>
    </div>
  );
}

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  return (
    <div className={cn(
      "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
      "px-4 py-2 rounded-full",
      "bg-warning text-warning-foreground",
      "shadow-lg shadow-warning/20",
      "flex items-center gap-2",
      "animate-slide-up",
      className
    )}>
      <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
      <span className="text-sm font-medium">Você está offline</span>
    </div>
  );
}

interface SyncIndicatorProps {
  isSyncing: boolean;
  lastSynced?: Date;
  className?: string;
}

export function SyncIndicator({ isSyncing, lastSynced, className }: SyncIndicatorProps) {
  const formatLastSynced = () => {
    if (!lastSynced) return "Nunca sincronizado";
    const now = new Date();
    const diff = now.getTime() - lastSynced.getTime();
    
    if (diff < 60000) return "Agora mesmo";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return lastSynced.toLocaleDateString('pt-BR');
  };

  return (
    <div className={cn(
      "flex items-center gap-2 text-sm text-muted-foreground",
      className
    )}>
      {isSyncing ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin text-primary" />
          <span>Sincronizando...</span>
        </>
      ) : (
        <>
          <div className="w-2 h-2 rounded-full bg-success" />
          <span>{formatLastSynced()}</span>
        </>
      )}
    </div>
  );
}
