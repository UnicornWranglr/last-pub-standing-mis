import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LogOut,
  LayoutDashboard,
  BanknoteIcon,
  CalendarDays,
  CalendarRange,
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
  { to: '/rotas', label: 'Rotas', icon: CalendarRange, end: false, roles: ['owner', 'manager', 'staff'] },
  { to: '/expenses', label: 'Expenses', icon: Receipt, end: false, roles: ['owner', 'manager'] },
  { to: '/payroll', label: 'Payroll', icon: UsersRound, end: false, roles: ['owner'] },
  { to: '/admin', label: 'Admin', icon: Shield, end: false, roles: ['owner'] },
  { to: '/roadmap', label: 'Roadmap', icon: Map, end: false, roles: ['owner'] },
  { to: '/deployment', label: 'Deployment', icon: Rocket, end: false, roles: ['owner'] },
];

// Mobile: how many items show in the bottom bar before overflowing into "More"
const MOBILE_VISIBLE = 4;

export function Layout() {
  const { user, logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const navItems = allNavItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  // Split navs into groups for the desktop sidebar.
  // Management contains owner-sensitive operational pages: payroll + admin.
  // Info contains owner-only reference pages: roadmap + deployment.
  const managementPaths = ['/payroll', '/admin'];
  const infoPaths = ['/roadmap', '/deployment'];
  const primaryNav = navItems.filter(
    (i) => ![...managementPaths, ...infoPaths].includes(i.to)
  );
  const adminNav = navItems.filter((i) => managementPaths.includes(i.to));
  const infoNav = navItems.filter((i) => infoPaths.includes(i.to));

  // Mobile: top N in the bar, rest in the drawer
  const mobileVisible = navItems.slice(0, MOBILE_VISIBLE);
  const mobileOverflow = navItems.slice(MOBILE_VISIBLE);

  return (
    <div className="relative min-h-screen bg-muted/30">
      {/* Ambient atmospheric glow — subtle pub-signage mood */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_-10%,_hsl(var(--primary)/0.06),_transparent_55%),radial-gradient(circle_at_85%_110%,_hsl(var(--primary)/0.05),_transparent_60%)]"
      />

      {/* ─── Desktop sidebar (md+) ──────────────────────────────────────── */}
      <aside className="chrome-dark fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-border/60 bg-background/95 backdrop-blur-xl md:flex">
        {/* Brand lockup — proper pub-sign scale */}
        <div className="relative px-6 pb-6 pt-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.12),_transparent_70%)]"
          />
          <div className="relative flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-primary/40">
              <span className="font-display text-lg leading-none">LPS</span>
            </div>
            <h1 className="mt-4 font-display text-xl leading-tight text-foreground">
              Last Pub
              <br />
              Standing
            </h1>
            <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
              City Pub &amp; Kitchen
            </p>
          </div>
        </div>

        <div className="mx-6 h-px bg-border/70" />

        {/* Nav groups */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          <NavGroup label="Workspace" items={primaryNav} />
          {adminNav.length > 0 && <NavGroup label="Management" items={adminNav} />}
          {infoNav.length > 0 && <NavGroup label="Info" items={infoNav} />}
        </nav>

        {/* User block pinned to bottom */}
        <div className="border-t border-border/60 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold uppercase text-primary">
              {user?.username?.slice(0, 1) ?? '?'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">
                {user?.username}
              </div>
              <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                {user?.role}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* ─── Mobile sticky top header (< md) ────────────────────────────── */}
      <header className="chrome-dark sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl md:hidden">
        <div className="flex h-14 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-1 ring-primary/40">
              <span className="font-display text-xs leading-none">LPS</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display text-sm text-foreground">Last Pub Standing</span>
              <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                City Pub &amp; Kitchen
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="mr-1 h-4 w-4" /> Out
          </Button>
        </div>
      </header>

      {/* ─── Main content area ──────────────────────────────────────────── */}
      <main className="min-h-screen md:pl-64">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 pb-24 sm:px-6 md:py-10 md:pb-16 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* ─── Mobile bottom tab bar ──────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-border/60 bg-background/90 backdrop-blur-xl md:hidden">
        {mobileVisible.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
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
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium text-muted-foreground"
          >
            <MoreHorizontal className="h-5 w-5" />
            More
          </button>
        )}
      </nav>

      <MobileMoreDrawer
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        items={mobileOverflow}
      />
    </div>
  );
}

/* ─── Helper components ──────────────────────────────────────────────── */

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-smooth',
                  isActive
                    ? 'text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)]'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <>
                      {/* Gradient fade from brand gold → transparent */}
                      <span
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent"
                      />
                      {/* Left edge glow bar */}
                      <span
                        aria-hidden
                        className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_14px_hsl(var(--primary)/0.7)]"
                      />
                    </>
                  )}
                  <item.icon
                    className={cn(
                      'relative h-4 w-4 shrink-0 transition-colors duration-200',
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  <span className="relative">{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
