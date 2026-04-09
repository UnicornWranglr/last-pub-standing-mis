import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BanknoteIcon, CalendarDays, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Staff get a minimal dashboard — their job is to log takings, not read totals.
  if (!canSeeFinancials) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {user?.username}
          </h1>
          <p className="text-sm text-muted-foreground">
            Last Pub Standing — ready for today's shift.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BanknoteIcon className="h-5 w-5" /> Log today's takings
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Enter cash and card figures from the till.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/takings">
                  Open <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-5 w-5" /> Upcoming events
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold leading-none">
                  {upcoming ?? '—'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  this month
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/events">
                  View <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Owner / manager: full dashboard
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user?.username}
        </h1>
        <p className="text-sm text-muted-foreground">
          Last Pub Standing — here's how things are looking today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Takings this week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? formatCurrency(summary.weekTotal) : '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Takings this month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary ? formatCurrency(summary.monthTotal) : '—'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming events this month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcoming ?? '—'}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BanknoteIcon className="h-5 w-5" /> Daily takings
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Log and review till figures.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/takings">
                Open <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-5 w-5" /> Events
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Plan upcoming events and contacts.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/events">
                Open <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {canSeeExpenses && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Receipt className="h-5 w-5" /> Expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Track stock, bills and other costs.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/expenses">
                  Open <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
