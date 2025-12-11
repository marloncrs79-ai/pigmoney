import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Wallet,
    Receipt,
    PiggyBank,
    Menu
} from 'lucide-react';

interface NavItem {
    href: string;
    icon: React.ElementType;
    label: string;
}

const navItems: NavItem[] = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { href: '/income', icon: Wallet, label: 'Ganhos' },
    { href: '/expenses', icon: Receipt, label: 'Despesas' },
    { href: '/piggy-bank', icon: PiggyBank, label: 'Cofrinhos' },
];

interface MobileNavProps {
    onMenuClick?: () => void;
}

export function MobileNav({ onMenuClick }: MobileNavProps) {
    const location = useLocation();

    return (
        <nav className="mobile-nav show-mobile" role="navigation" aria-label="Navegação principal">
            <div className="flex items-center justify-around">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href ||
                        (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn('mobile-nav-item', isActive && 'active')}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <Icon className="mobile-nav-icon" strokeWidth={isActive ? 2.5 : 2} />
                            <span className="mobile-nav-label">{item.label}</span>
                        </Link>
                    );
                })}

                <button
                    onClick={onMenuClick}
                    className="mobile-nav-item"
                    aria-label="Abrir menu"
                >
                    <Menu className="mobile-nav-icon" strokeWidth={2} />
                    <span className="mobile-nav-label">Menu</span>
                </button>
            </div>
        </nav>
    );
}
