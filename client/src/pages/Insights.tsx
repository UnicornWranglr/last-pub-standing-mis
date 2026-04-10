import { useMemo, useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  BanknoteIcon,
  CalendarRange,
  Trophy,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import {
  bestAndWorst,
  dayOfWeekAverages,
  forecastNext,
  generateDummyData,
  previousWindow,
  rollingAverage,
  sumWindow,
  topEventsByImpact,
  type DummyEvent,
  type DummyTaking,
} from './insights/dummyData';

type Period = 30 | 90 | 365;

const PERIOD_LABELS: Record<Period, string> = {
  30: '30 days',
  90: '90 days',
  365: '12 months',
};

const PRIMARY_GOLD = '#C8A13B';
const PRIMARY_GOLD_DEEP = '#A07F23';
const PRIMARY_GOLD_LIGHT = '#E1C475';

export function Insights() {
  // Generate the dummy dataset once and memoise — same numbers every render.
  const { takings, events } = useMemo(() => generateDummyData(), []);
  const [period, setPeriod] = useState<Period>(90);

  // Slice the dataset to the selected window
  const windowed = useMemo(() => takings.slice(-period), [takings, period]);
  const windowedEvents = useMemo(() => {
    const startDate = windowed[0]?.date;
    return events.filter((e) => e.date >= startDate);
  }, [events, windowed]);

  // Stat tiles ---------------------------------------------------------
  const weekTotal = sumWindow(takings, 7);
  const weekPrev = previousWindow(takings, 7);
  const monthTotal = sumWindow(takings, 30);
  const monthPrev = previousWindow(takings, 30);
  const quarterTotal = sumWindow(takings, 90);
  const quarterPrev = previousWindow(takings, 90);
  const yearTotal = sumWindow(takings, 365);
  // No prior-year for the dummy dataset; show as N/A delta
  const yearPrev = 0;

  // Chart data ---------------------------------------------------------
  const rolling = useMemo(() => rollingAverage(windowed, 7), [windowed]);
  const eventsByDate = useMemo(() => {
    const map = new Map<string, DummyEvent>();
    windowedEvents.forEach((e) => map.set(e.date, e));
    return map;
  }, [windowedEvents]);

  const forecast = useMemo(() => forecastNext(takings, 7), [takings]);

  // Combine actual + rolling + forecast into a single dataset for the chart
  const chartData = useMemo(() => {
    const actuals = windowed.map((t, i) => ({
      date: t.date,
      label: shortDate(t.date),
      actual: t.total,
      rolling: rolling[i + (rolling.length - windowed.length)]?.avg ?? null,
      forecast: null as number | null,
      event: eventsByDate.get(t.date)?.name ?? null,
      eventBoost: eventsByDate.get(t.date)?.takingsBoost ?? null,
    }));
    const lastActual = actuals[actuals.length - 1];
    const fc = forecast.map((f) => ({
      date: f.date,
      label: shortDate(f.date),
      actual: null as number | null,
      rolling: null as number | null,
      forecast: f.forecast,
      event: null,
      eventBoost: null,
    }));
    // Stitch the last actual into the first forecast point so the dashed line
    // connects visually rather than starting in mid-air
    if (lastActual && fc.length) {
      fc[0] = { ...fc[0], forecast: lastActual.actual ?? fc[0].forecast };
    }
    return [...actuals, ...fc];
  }, [windowed, rolling, eventsByDate, forecast]);

  // Day-of-week + best/worst -------------------------------------------
  const dowAverages = useMemo(() => dayOfWeekAverages(windowed), [windowed]);
  const { best, worst } = useMemo(() => bestAndWorst(windowed), [windowed]);
  const topEvents = useMemo(() => topEventsByImpact(windowedEvents, 5), [windowedEvents]);

  return (
    <div className="animate-fade-in-up max-w-6xl space-y-8">
      {/* ─── Page heading ─── */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Workspace · Preview
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Insights</h1>
        <p className="text-sm text-muted-foreground">
          Charts, trends and forecasts from your daily takings.
        </p>
      </div>

      {/* ─── Hero / preview banner ─── */}
      <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary)/0.15),_transparent_60%)]"
        />
        <CardContent className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">This is what your insights page will look like</h2>
                <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-primary">
                  Demo data
                </span>
              </div>
              <p className="mt-1.5 max-w-2xl text-xs text-muted-foreground">
                See your weekly, monthly, quarterly and yearly performance at a glance.
                Spot the day-of-week patterns. Watch how events lift your trade. Get a
                simple forecast for the days ahead so you can plan staff and stock with
                confidence. Everything below is built from a year of fake data so you
                can see what the page does — but if you supply your current spreadsheets,
                I'll import them straight into the system and you'll see all your real
                historical data with insights like these from day one.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Period selector ─── */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Showing
        </div>
        <div className="inline-flex rounded-lg border border-border/70 bg-background p-0.5 shadow-soft">
          {(Object.keys(PERIOD_LABELS) as unknown as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(Number(p) as Period)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                period === Number(p)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Last {PERIOD_LABELS[Number(p) as Period]}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Stat tiles ─── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="This week" value={weekTotal} prev={weekPrev} />
        <StatTile label="This month" value={monthTotal} prev={monthPrev} />
        <StatTile label="This quarter" value={quarterTotal} prev={quarterPrev} />
        <StatTile label="This year" value={yearTotal} prev={yearPrev} />
      </div>

      {/* ─── Main chart ─── */}
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <CardTitle className="text-base">Daily takings</CardTitle>
              <CardDescription>
                Last {PERIOD_LABELS[period]} · 7-day rolling average · forecast for the
                week ahead
              </CardDescription>
            </div>
            <Legend />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 24, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PRIMARY_GOLD} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={PRIMARY_GOLD} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={40}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `£${(v / 1000).toFixed(1)}k`}
                  width={48}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke={PRIMARY_GOLD}
                  strokeWidth={2}
                  fill="url(#goldFill)"
                  dot={false}
                  isAnimationActive={false}
                  name="Daily"
                />
                <Line
                  type="monotone"
                  dataKey="rolling"
                  stroke={PRIMARY_GOLD_DEEP}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  name="7-day average"
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke={PRIMARY_GOLD_LIGHT}
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                  isAnimationActive={false}
                  name="Forecast"
                />
                {/* Event markers — render a small dot for each event in the window */}
                {chartData
                  .filter((d) => d.event && d.actual != null)
                  .map((d) => (
                    <ReferenceDot
                      key={d.date}
                      x={d.label}
                      y={d.actual ?? 0}
                      r={4}
                      fill={PRIMARY_GOLD_DEEP}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
                  ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ─── DoW + Best/Worst row ─── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Day of week */}
        <Card className="shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">By day of week</CardTitle>
            <CardDescription>
              Average daily takings across {PERIOD_LABELS[period]}. Spot the patterns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dowAverages} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `£${Math.round(v)}`}
                    width={48}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--primary) / 0.06)' }}
                    content={<DowTooltip />}
                  />
                  <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                    {dowAverages.map((entry, i) => {
                      const max = Math.max(...dowAverages.map((d) => d.avg));
                      const isPeak = entry.avg === max;
                      return (
                        <Cell
                          key={i}
                          fill={isPeak ? PRIMARY_GOLD : `${PRIMARY_GOLD}55`}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Best / worst */}
        <div className="space-y-4">
          <Card className="shadow-soft">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Best day
                  </div>
                  <div className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                    {formatCurrency(best.total)}
                  </div>
                  <div className="text-xs text-muted-foreground">{longDate(best.date)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground ring-1 ring-border">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Quietest day
                  </div>
                  <div className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                    {formatCurrency(worst.total)}
                  </div>
                  <div className="text-xs text-muted-foreground">{longDate(worst.date)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Top events ─── */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Events that moved trade most</CardTitle>
          <CardDescription>
            Ranked by how much takings rose above the day's normal baseline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topEvents.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No events in the selected window.
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {topEvents.map((e, i) => (
                <li key={e.date + e.name} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold tabular-nums text-primary">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{e.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {longDate(e.date)} ·{' '}
                        <span className="capitalize">{e.category}</span>
                        {e.type === 'paid' && e.ticketPrice ? ` · £${e.ticketPrice} entry` : ' · free entry'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Boost
                    </div>
                    <div className="text-base font-semibold tabular-nums text-primary">
                      +{formatCurrency(e.takingsBoost)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ─── Footer note ─── */}
      <Card className="border-primary/30 bg-primary/[0.04]">
        <CardContent className="p-4 text-sm">
          <div className="font-medium">Want to see this with your real data?</div>
          <p className="mt-1 text-muted-foreground">
            Send me the spreadsheets you currently use to track daily takings and events
            and I'll wire them in. The moment that's done this page becomes a window into
            your actual trading history — every chart, every comparison, every forecast,
            built from real numbers instead of the fake ones above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Helper components ────────────────────────────────────────────── */

function StatTile({
  label,
  value,
  prev,
}: {
  label: string;
  value: number;
  prev: number;
}) {
  const delta = prev > 0 ? ((value - prev) / prev) * 100 : null;
  const positive = (delta ?? 0) >= 0;
  const Icon: LucideIcon = label.includes('week')
    ? BanknoteIcon
    : label.includes('month')
    ? CalendarRange
    : label.includes('quarter')
    ? TrendingUp
    : CalendarRange;
  return (
    <Card className="group shadow-soft transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:shadow-soft-lg">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {label}
            </div>
            <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {formatCurrency(value)}
            </div>
            {delta !== null && (
              <div
                className={cn(
                  'mt-1 inline-flex items-center gap-1 text-xs font-medium',
                  positive ? 'text-green-600' : 'text-destructive'
                )}
              >
                {positive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {positive ? '+' : ''}
                {delta.toFixed(1)}% vs previous
              </div>
            )}
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform duration-200 group-hover:scale-[1.05]">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
      <LegendDot color={PRIMARY_GOLD} label="Daily" />
      <LegendDot color={PRIMARY_GOLD_DEEP} label="7-day avg" />
      <LegendDot color={PRIMARY_GOLD_LIGHT} label="Forecast" dashed />
      <LegendDot color={PRIMARY_GOLD_DEEP} label="Event" round />
    </div>
  );
}

function LegendDot({
  color,
  label,
  dashed,
  round,
}: {
  color: string;
  label: string;
  dashed?: boolean;
  round?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {round ? (
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      ) : (
        <span
          className="h-[3px] w-4 rounded-full"
          style={{
            backgroundColor: dashed ? 'transparent' : color,
            backgroundImage: dashed
              ? `linear-gradient(to right, ${color} 60%, transparent 0)`
              : undefined,
            backgroundSize: dashed ? '6px 100%' : undefined,
            backgroundRepeat: dashed ? 'repeat-x' : undefined,
          }}
        />
      )}
      <span>{label}</span>
    </div>
  );
}

interface TooltipPayload {
  payload: {
    date: string;
    actual: number | null;
    rolling: number | null;
    forecast: number | null;
    event: string | null;
    eventBoost: number | null;
  };
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border/80 bg-background/95 px-3 py-2 text-xs shadow-soft-lg backdrop-blur">
      <div className="font-medium text-foreground">{longDate(d.date)}</div>
      {d.actual != null && (
        <div className="mt-1 flex items-center justify-between gap-4 tabular-nums">
          <span className="text-muted-foreground">Takings</span>
          <span className="font-semibold text-foreground">{formatCurrency(d.actual)}</span>
        </div>
      )}
      {d.rolling != null && (
        <div className="flex items-center justify-between gap-4 tabular-nums">
          <span className="text-muted-foreground">7-day avg</span>
          <span className="font-medium text-foreground">{formatCurrency(d.rolling)}</span>
        </div>
      )}
      {d.forecast != null && d.actual == null && (
        <div className="flex items-center justify-between gap-4 tabular-nums">
          <span className="text-muted-foreground">Forecast</span>
          <span className="font-medium text-foreground">{formatCurrency(d.forecast)}</span>
        </div>
      )}
      {d.event && (
        <div className="mt-1.5 border-t border-border/60 pt-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">
            Event
          </div>
          <div className="text-foreground">{d.event}</div>
          {d.eventBoost != null && (
            <div className="text-muted-foreground">+{formatCurrency(d.eventBoost)} boost</div>
          )}
        </div>
      )}
    </div>
  );
}

interface DowTooltipPayload {
  payload: { day: string; avg: number };
}

function DowTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: DowTooltipPayload[];
}) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border/80 bg-background/95 px-3 py-2 text-xs shadow-soft-lg backdrop-blur">
      <div className="font-medium text-foreground">{d.day}</div>
      <div className="text-muted-foreground">
        Avg <span className="font-semibold text-foreground">{formatCurrency(d.avg)}</span>
      </div>
    </div>
  );
}

/* ─── Date helpers ─────────────────────────────────────────────────── */

function shortDate(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${d}/${m}`;
}

function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Used to keep TypeScript happy about unused imports of types
export type { DummyTaking };
