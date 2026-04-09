import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LogOut,
  LayoutDashboard,
  BanknoteIcon,
  CalendarDays,
  Rocket,
  LineChart,
  Receipt,
  UsersRound,
  Shield,
  Map,
  MoreHorizontal,
} from 'lucide-react';
import { useAuth, type Role } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MobileMoreDrawer } from '@/components/MobileMoreDrawer';

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end: boolean;
  roles: Role[];
};

const allNavItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, roles: ['owner', 'manager', 'staff'] },
  { to: '/insights', label: 'Insights', icon: LineChart, end: false, roles: ['owner', 'manager'] },
  { to: '/takings', label: 'Takings', icon: BanknoteIcon, end: false, roles: ['owner', 'manager', 'staff'] },
  { to: '/events', label: 'Events', icon: CalendarDays, end: false, roles: ['owner', 'manager', 'staff'] },
  { to: '/expenses', label: 'Expenses', icon: Receipt, end: false, roles: ['owner', 'manager'] },
  { to: '/payroll', label: 'Payroll', icon: UsersRound, end: false, roles: ['owner'] },
  { to: '/admin', label: 'Admin', icon: Shield, end: false, roles: ['owner'] },
  { to: '/roadmap', label: 'Roadmap', icon: Map, end: false, roles: ['owner', 'manager', 'staff'] },
  { to: '/deployment', label: 'Deployment', icon: Rocket, end: false, roles: ['owner', 'manager', 'staff'] },
];

// How many items to show in the mobile bottom bar before overflowing into "More"
const MOBILE_VISIBLE = 4;

export function Layout() {
  const { user, logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const navItems = allNavItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  // Mobile: top N in the bar, rest in the drawer
  const mobileVisible = navItems.slice(0, MOBILE_VISIBLE);
  const mobileOverflow = navItems.slice(MOBILE_VISIBLE);

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      {/* Top bar (dark chrome) */}
      <header className="chrome-dark sticky top-0 z-20 border-b border-border bg-background">
        <div className="container flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold font-display">
                LPS
              </div>
              <div className="hidden flex-col leading-tight sm:flex">
                <span className="font-display text-base text-foreground">Last Pub Standing</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  City Pub &amp; Kitchen
                </span>
              </div>
              <span className="font-display text-base text-foreground sm:hidden">LPS</span>
            </div>
            <nav className="hidden flex-wrap items-center gap-1 md:flex">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/15 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground md:inline">
              {user?.username}{' '}
              <span className="text-xs uppercase tracking-wide">({user?.role})</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="mr-1 h-4 w-4" /> Log out
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container flex-1 py-6 pb-24 md:pb-10">
        <Outlet />
      </main>

      {/* Bottom tab bar (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex border-t bg-background md:hidden">
        {mobileVisible.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
        {mobileOverflow.length > 0 && (
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium text-muted-foreground"
          >
            <MoreHorizontal className="h-5 w-5" />
            More
          </button>
        )}
      </nav>

      {/* Mobile "More" drawer for overflow nav items */}
      <MobileMoreDrawer
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        items={mobileOverflow}
      />
    </div>
  );
}
