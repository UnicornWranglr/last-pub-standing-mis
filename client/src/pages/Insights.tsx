import {
  LineChart as LineChartIcon,
  BarChart3,
  CalendarDays,
  TrendingUp,
  Sparkles,
  Hourglass,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function Insights() {
  return (
    <div className="animate-fade-in-up max-w-5xl space-y-8">
      <div className="space-y-1.5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Workspace
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Insights</h1>
        <p className="text-sm text-muted-foreground">
          Charts, trends and forecasts built from your takings data.
        </p>
      </div>

      {/* Coming-soon banner */}
      <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary)/0.15),_transparent_60%)]" />
        <CardContent className="relative flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Coming next</h2>
                <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-primary">
                  Phase 2b
                </span>
              </div>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Historical takings are being imported from the existing Google Sheet this week.
                Once that lands, this page lights up with daily/weekly/monthly/quarterly charts,
                day-of-week pattern analysis, event correlation markers and a simple
                moving-average forecast.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
            <Hourglass className="h-3.5 w-3.5" />
            In progress
          </div>
        </CardContent>
      </Card>

      {/* Preview grid of the upcoming panels */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          What you'll see here
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Preview
            icon={LineChartIcon}
            title="Daily takings — last 30 / 90 / 365 days"
            body="Line chart with a 7-day rolling average overlay. Toggle the window. Hover for the exact day's total and the closest event."
          />
          <Preview
            icon={BarChart3}
            title="Day-of-week breakdown"
            body='"Your Saturdays average £X, Mondays £Y." Instant pattern-reveal — you cannot see this in a spreadsheet.'
          />
          <Preview
            icon={CalendarDays}
            title="Event overlay on the timeline"
            body="Every event becomes a marker on the takings chart. Tells you whether quiz night actually moved trade, or whether it just shifted it."
          />
          <Preview
            icon={TrendingUp}
            title="Quarter / year tiles + forecast"
            body="This-week / this-month / this-quarter / this-year totals with vs-previous-period deltas. Simple moving-average projection for the next few weekends."
          />
        </div>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Why not live yet?</CardTitle>
          <CardDescription>Short answer: waiting on real data.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Charts without data look worse than no charts at all. As soon as you share the
          existing trading-history spreadsheet, a one-off import will push every historical
          day into the database and this page will come to life with years of real trade —
          not a placeholder.
        </CardContent>
      </Card>
    </div>
  );
}

function Preview({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof LineChartIcon;
  title: string;
  body: string;
}) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:border-primary/40 hover:shadow-md">
      <CardContent className="flex gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold">{title}</div>
          <p className="mt-1 text-xs text-muted-foreground">{body}</p>
        </div>
      </CardContent>
    </Card>
  );
}
