import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
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
  Sparkles,
  Settings,
  Bot
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/expenses', icon: Receipt, label: 'Despesas' },
  { href: '/cards', icon: CreditCard, label: 'Cartões' },
  { href: '/income', icon: Wallet, label: 'Receitas' },
  { href: '/piggy-bank', icon: PiggyBank, label: 'Cofrinho' },
  { href: '/planning', icon: Calendar, label: 'Planejamento' },
  { href: '/reports', icon: BarChart3, label: 'Relatórios' },
  { href: '/guia', icon: HelpCircle, label: 'Guia' },
];

export function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { couple, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const NavContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-4 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-primary shadow-glow-primary transition-all duration-200 group-hover:scale-110">
            <PiggyBank className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
          </div>
          <span className="font-display text-lg sm:text-xl font-extrabold text-sidebar-foreground">
            PIGMONEY
          </span>
        </Link>
      </div>

      {/* Couple name & Actions */}
      {couple && (
        <div className="border-b border-sidebar-border px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-secondary" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sua conta</p>
            </div>
            <p className="font-bold text-sidebar-foreground truncate mt-1">{couple.name}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
              onClick={() => navigate('/settings')}
              title="Configurações"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg"
              onClick={handleSignOut}
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-3 sm:px-3 sm:py-4">
        <nav className="space-y-1 sm:space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-3 py-3.5 sm:px-4 sm:py-3 text-sm font-bold transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-duo'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:scale-[1.02]'
                )}
              >
                <item.icon className="h-6 w-6 sm:h-5 sm:w-5" />
                {item.label}
              </Link>
            );
          })}
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
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-1 rounded-2xl h-11 w-11">
              <Menu className="h-7 w-7" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-72 bg-sidebar p-0 border-r-0">
            <NavContent />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 ml-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <PiggyBank className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-extrabold text-lg">PIGMONEY</span>
        </div>
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