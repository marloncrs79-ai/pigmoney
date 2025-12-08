import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, HelpCircle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-background to-accent-50 dark:from-primary-900/20 dark:via-background dark:to-accent-900/20" />
      
      {/* Animated floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-secondary/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "2s" }} />
      </div>

      {/* Main content */}
      <div className="relative flex min-h-screen items-center justify-center p-6">
        <div className="max-w-lg w-full text-center animate-slide-up">
          {/* 404 illustration */}
          <div className="relative mb-8">
            {/* Large 404 text */}
            <h1 className="text-[120px] sm:text-[180px] font-extrabold leading-none tracking-tighter text-primary/10 dark:text-primary/20 select-none">
              404
            </h1>
            
            {/* Overlay icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-card shadow-xl flex items-center justify-center border-4 border-primary/20">
                  <Search className="w-10 h-10 sm:w-14 sm:h-14 text-primary" strokeWidth={1.5} />
                </div>
                {/* Question mark badge */}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary flex items-center justify-center shadow-lg animate-bounce">
                  <HelpCircle className="w-5 h-5 text-secondary-foreground" />
                </div>
              </div>
            </div>
          </div>

          {/* Content card */}
          <div className="glass rounded-3xl p-6 sm:p-8 shadow-xl border border-border/50">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Ops! Página não encontrada
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Parece que você se perdeu no caminho. A página que você está procurando não existe ou foi movida para outro lugar.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/">
                  <Home className="w-5 h-5" />
                  Ir para o início
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </Button>
            </div>
          </div>

          {/* Help text */}
          <p className="mt-6 text-sm text-muted-foreground">
            Precisa de ajuda?{" "}
            <Link to="/guia" className="text-primary hover:underline font-medium">
              Acesse nosso guia
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
