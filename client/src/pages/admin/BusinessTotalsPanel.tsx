import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { BusinessTotals } from '@/types/admin';

export function BusinessTotalsPanel() {
  const [totals, setTotals] = useState<BusinessTotals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<BusinessTotals>('/admin/business-totals')
      .then(setTotals)
      .catch(() => setTotals(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4" /> Business totals
        </CardTitle>
        <CardDescription>Revenue, expenses and profit at a glance.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : !totals ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Couldn't load totals.
          </div>
        ) : (
          <div className="space-y-4">
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Revenue
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <Stat label="This week" value={totals.revenue.week} />
                <Stat label="This month" value={totals.revenue.month} />
                <Stat label="This quarter" value={totals.revenue.quarter} />
                <Stat label="This year" value={totals.revenue.year} />
                <Stat label="All time" value={totals.revenue.allTime} />
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Expenses
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <Stat label="This month" value={totals.expenses.month} />
                <Stat label="This year" value={totals.expenses.year} />
                <Stat label="All time" value={totals.expenses.allTime} />
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Payroll (net)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <Stat label="This month" value={totals.payroll.month} />
                <Stat label="This year" value={totals.payroll.year} />
                <Stat label="All time" value={totals.payroll.allTime} />
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Profit (Revenue − Expenses − Payroll)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <Stat label="This month" value={totals.profit.month} highlight />
                <Stat label="This year" value={totals.profit.year} highlight />
                <Stat label="All time" value={totals.profit.allTime} highlight />
              </div>
            </section>

            <section className="flex flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-xs text-muted-foreground">
              <div>
                Events this year: <strong className="text-foreground">{totals.events.thisYear}</strong>
              </div>
              <div>
                Events all time: <strong className="text-foreground">{totals.events.allTime}</strong>
              </div>
              {totals.takings.oldest && (
                <div>
                  Oldest takings record:{' '}
                  <strong className="text-foreground">{totals.takings.oldest}</strong>
                </div>
              )}
            </section>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  const negative = value < 0;
  return (
    <div className="rounded-md border bg-muted/30 px-3 py-2">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={
          'text-base font-bold tabular-nums ' +
          (highlight
            ? negative
              ? 'text-destructive'
              : 'text-green-600'
            : 'text-foreground')
        }
      >
        {formatCurrency(value)}
      </div>
    </div>
  );
}
