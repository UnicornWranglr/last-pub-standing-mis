import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BanknoteIcon,
  CalendarDays,
  Receipt,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import type { TakingsSummary } from '@/types/takings';

export function Dashboard() {
  const { user } = useAuth();
  const canSeeFinancials = user?.role === 'owner' || user?.role === 'manager';
  const canSeeExpenses = user?.role === 'owner' || user?.role === 'manager';

  const [summary, setSummary] = useState<TakingsSummary | null>(null);
  const [upcoming, setUpcoming] = useState<number | null>(null);

  useEffect(() => {
    if (canSeeFinancials) {
      api<TakingsSummary>('/takings/summary').then(setSummary).catch(() => setSummary(null));
    }
    api<{ count: number }>('/events/upcoming-count')
      .then((r) => setUpcoming(r.count))
      .catch(() => setUpcoming(null));
  }, [canSeeFinancials]);

  // ─── Staff view (lite) ──────────────────────────────────────────────
  if (!canSeeFinancials) {
    return (
      <div className="animate-fade-in-up space-y-8">
        <PageHeading
          eyebrow={`Signed in as ${user?.role}`}
          title={`Welcome back, ${user?.username}`}
          subtitle="Ready for today's shift."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ActionTile
            to="/takings"
            icon={BanknoteIcon}
            title="Log today's takings"
            body="Enter cash and card figures from the till."
          />
          <StatTile
            icon={CalendarDays}
            label="Upcoming events"
            value={upcoming !== null ? String(upcoming) : '—'}
            hint="this month"
            href="/events"
            linkLabel="View"
          />
        </div>
      </div>
    );
  }

  // ─── Owner / Manager view ──────────────────────────────────────────
  return (
    <div className="animate-fade-in-up space-y-8">
      <PageHeading
        eyebrow={`Signed in as ${user?.role}`}
        title={`Welcome back, ${user?.username}`}
        subtitle="Last Pub Standing — here's how things are looking today."
      />

      {/* Top stat row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatTile
          icon={BanknoteIcon}
          label="Takings — this week"
          value={summary ? formatCurrency(summary.weekTotal) : '—'}
        />
        <StatTile
          icon={TrendingUp}
          label="Takings — this month"
          value={summary ? formatCurrency(summary.monthTotal) : '—'}
          highlight
        />
        <StatTile
          icon={CalendarDays}
          label="Upcoming events"
          value={upcoming !== null ? String(upcoming) : '—'}
          hint="this month"
        />
      </div>

      {/* Action tiles */}
      <div>
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Jump to
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ActionTile
            to="/takings"
            icon={BanknoteIcon}
            title="Daily takings"
            body="Log and review till figures."
          />
          <ActionTile
            to="/events"
            icon={CalendarDays}
            title="Events"
            body="Plan upcoming events and contacts."
          />
          {canSeeExpenses && (
            <ActionTile
              to="/expenses"
              icon={Receipt}
              title="Expenses"
              body="Track stock, bills and other costs."
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Reusable page components ─────────────────────────────────────── */

function PageHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-1.5">
      {eyebrow && (
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </div>
      )}
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[32px]">
        {title}
      </h1>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  highlight,
  href,
  linkLabel,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint?: string;
  highlight?: boolean;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <Card
      className={
        'group relative overflow-hidden shadow-soft transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:shadow-soft-lg ' +
        (highlight ? 'ring-1 ring-primary/20' : '')
      }
    >
      {highlight && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary)/0.08),_transparent_70%)]"
        />
      )}
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {label}
            </div>
            <div className="mt-2 text-3xl font-semibold tracking-tight tabular-nums text-foreground">
              {value}
            </div>
            {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform duration-200 group-hover:scale-[1.05]">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {href && linkLabel && (
          <div className="mt-4 flex justify-end">
            <Button asChild variant="outline" size="sm">
              <Link to={href}>
                {linkLabel} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActionTile({
  to,
  icon: Icon,
  title,
  body,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="group relative block overflow-hidden rounded-xl border border-border/60 bg-card p-5 shadow-soft ring-1 ring-black/[0.02] transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft-lg"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-colors duration-200 group-hover:bg-primary/15">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{body}</p>
        </div>
      </div>
    </Link>
  );
}
