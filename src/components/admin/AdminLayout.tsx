import { useAdminGuard } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
    Users,
    Activity,
    FileText,
    LayoutDashboard,
    LogOut,
    ShieldCheck,
    Menu,
    MessageSquare,
    XCircle
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const { isChecking, isAdmin } = useAdminGuard();
    const { signOut, user } = useAuth();
    const location = useLocation();

    if (isChecking) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                    <p className="font-medium text-gray-500">Verificando permissões...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return null; // Hook handles redirect
    }

    const menuItems = [
        { icon: LayoutDashboard, label: 'Visão Geral', path: '/admin' },
        { icon: Users, label: 'Usuários', path: '/admin/users' },
        { icon: Activity, label: 'Métricas', path: '/admin/metrics' },
        { icon: FileText, label: 'Logs do Sistema', path: '/admin/logs' },
        { icon: MessageSquare, label: 'Reports', path: '/admin/reports' },
        { icon: XCircle, label: 'Cancelamentos', path: '/admin/cancellations' },
    ];

    const SidebarContent = () => (
        <div className="flex h-full flex-col bg-slate-900 text-white">
            <div className="flex h-16 items-center px-6 border-b border-slate-800">
                <ShieldCheck className="h-6 w-6 text-indigo-400 mr-2" />
                <span className="text-lg font-bold tracking-tight">PigAdmin</span>
            </div>

            <div className="flex-1 py-6 px-3 space-y-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            location.pathname === item.path
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </Link>
                ))}
            </div>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                        {user?.email?.[0].toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="truncate text-xs font-medium text-slate-300">{user?.email}</p>
                        <p className="text-[10px] text-slate-500">Administrador</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-slate-700 bg-transparent text-slate-400 hover:text-white hover:bg-slate-800"
                    onClick={() => signOut()}
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 shrink-0">
                <div className="fixed inset-y-0 left-0 w-64">
                    <SidebarContent />
                </div>
            </div>

            {/* Mobile Sidebar */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="icon" variant="secondary">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72 border-r-slate-800 bg-slate-900">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}
