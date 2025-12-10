import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getUserPlanLabel } from '@/lib/plan-utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AIChatWidget } from '@/components/AIChatWidget';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Wallet,
  PiggyBank,
  Calendar,
  BarChart3,
  LogOut,
  Menu,
  HelpCircle,
  Settings,
  Bot,
  X,
  User,
  Headphones,
  AlertCircle
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

const navGroups = [
  {
    title: 'Visão Geral',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }
    ]
  },
  {
    title: 'Ganhos',
    items: [
      { href: '/income', icon: Wallet, label: 'Salário & Ganhos' }
    ]
  },
  {
    title: 'Gastos',
    items: [
      { href: '/expenses', icon: Receipt, label: 'Despesas' },
      { href: '/cards', icon: CreditCard, label: 'Cartões' }
    ]
  },
  {
    title: 'Conquistas',
    items: [
      { href: '/piggy-bank', icon: PiggyBank, label: 'Cofrinho' },
      { href: '/planning', icon: Calendar, label: 'Planejamento' }
    ]
  },
  {
    title: 'Análise',
    items: [
      { href: '/reports', icon: BarChart3, label: 'Relatórios' }
    ]
  },
  {
    title: 'Suporte',
    items: [
      { href: '/guia', icon: HelpCircle, label: 'Guia' },
      { href: '/support', icon: Headphones, label: 'Central de Suporte' },
      { href: '/support/report-problem', icon: AlertCircle, label: 'Reportar Problema' }
    ]
  }
];

export function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { couple, signOut, plan } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const NavContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary shadow-glow-primary transition-all duration-200 group-hover:scale-110">
            <PiggyBank className="h-6 w-6 text-primary-foreground stroke-[2.5px]" />
          </div>
          <span className="font-display text-xl font-extrabold text-sidebar-foreground tracking-tight">
            PIGMONEY
          </span>
        </Link>
      </div>

      {/* User Actions - Always visible */}
      <div className="px-6 py-6 mb-2">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-sidebar-accent/50 border border-sidebar-border">
          <div className="min-w-0 flex-1 mr-2">
            {couple ? (
              <>
                <div className="flex items-center gap-1.5 mb-1">
                  <User className="h-3 w-3 text-primary" />
                  <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">{getUserPlanLabel(plan)}</p>
                </div>
                <p className="font-bold text-sidebar-foreground truncate text-sm">{couple.name}</p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 mb-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">{getUserPlanLabel(plan)}</p>
                </div>
                <p className="font-bold text-sidebar-foreground text-sm">Minha Conta</p>
              </>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground/70 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
              onClick={() => navigate('/settings')}
              title="Configurações"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
              onClick={handleSignOut}
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 pb-6">
        <nav className="space-y-6">
          {navGroups.map((group, groupIndex) => (
            <div key={group.title}>
              <h4 className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 select-none">
                {group.title}
              </h4>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all duration-200 group',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-bold'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )}
                    >
                      <item.icon className={cn(
                        "h-[18px] w-[18px] stroke-[2px] transition-transform duration-200 group-hover:scale-110",
                        isActive ? "stroke-[2.5px]" : ""
                      )} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
              {/* Separator only between groups, not after the last one */}
              {groupIndex < navGroups.length - 1 && (
                <div className="my-4 mx-2 border-b border-border/40" />
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 flex-shrink-0 bg-sidebar border-r border-sidebar-border lg:block">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 sm:h-16 items-center border-b border-border bg-card px-3 sm:px-4 lg:hidden shadow-duo">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          {/* Default Trigger Hidden but kept for semantic/structure if needed, or we can remove if FAB is the only way */}
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-1 rounded-2xl h-11 w-11 lg:hidden opacity-0 pointer-events-none">
              <Menu className="h-7 w-7" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-72 bg-sidebar p-0 border-r-0">
            <NavContent />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 ml-2 absolute left-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <PiggyBank className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-extrabold text-lg">PIGMONEY</span>
        </div>
      </div>

      {/* PREMIUM MOBILE FAB MENU */}
      <div className="fixed bottom-24 right-6 z-[60] lg:hidden">
        <Button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={cn(
            "h-[54px] w-[54px] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-200 ease-out active:scale-90",
            "bg-[#10B981] hover:bg-[#059669] text-white border-0", // Green official
          )}
          style={{
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)"
          }}
        >
          <div className={cn(
            "transition-all duration-300 transform",
            mobileOpen ? "rotate-90 scale-100" : "rotate-0 scale-100"
          )}>
            {mobileOpen ? (
              <X className="h-7 w-7 stroke-[2.5px]" />
            ) : (
              <Menu className="h-7 w-7 stroke-[2.5px]" />
            )}
          </div>
        </Button>
      </div>

      {/* Main content */}
      <main className="flex-1 pt-14 sm:pt-16 lg:pt-0 w-full">
        <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      <AIChatWidget />
    </div>
  );
}