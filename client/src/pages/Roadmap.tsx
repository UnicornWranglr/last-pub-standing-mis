import {
  CheckCircle2,
  Clock,
  Lightbulb,
  UtensilsCrossed,
  ClipboardCheck,
  FileClock,
  Package,
  Users,
  CloudSun,
  CalendarCheck,
  Calculator,
  NotebookPen,
  MessageSquarePlus,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function Roadmap() {
  return (
    <div className="max-w-4xl space-y-6">
      {/* Intro */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Roadmap</h1>
        <p className="text-sm text-muted-foreground">
          Where the system is today, what's coming next, and the longer-term
          wishlist. Not a contract — more a shared map of where we could take
          this as the pub's needs grow.
        </p>
      </div>

      {/* Shipped so far */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-4 w-4 text-green-600" /> Shipped so far
          </CardTitle>
          <CardDescription>What the system already does.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Phase 1
              </h3>
              <ul className="space-y-1 text-sm">
                <li>• Secure login with three roles (owner / manager / staff)</li>
                <li>• Daily takings — cash, card, total, notes</li>
                <li>• Events log — name, theme, entry type, contact info</li>
                <li>• Dashboard with week / month summary</li>
                <li>• Responsive on phone, tablet and desktop</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Phase 2 (you're looking at it)
              </h3>
              <ul className="space-y-1 text-sm">
                <li>• Three-tier permissions (owner / manager / staff)</li>
                <li>• Expenses module with categories (Bar stock, Food stock, Utilities, Fixed, Maintenance)</li>
                <li>• Payroll module (owner only)</li>
                <li>• Admin page with user management, audit log, CSV export</li>
                <li>• Business totals: revenue, expenses, profit by period</li>
                <li>• Insights page — charts, trends, day-of-week patterns, forecasts</li>
                <li>• LPS brand pass on login & header</li>
                <li>• Historical data import from the existing Google Sheet</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next on the list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-primary" /> Next on the list
          </CardTitle>
          <CardDescription>Phase 3 — compliance & legal paperwork, aimed at saving time.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <Item
              icon={ClipboardCheck}
              title="Recurring compliance checklists"
              body="Cellar clean, line clean, fridge temps, toilet checks. 'Last done X days ago' status at a glance."
            />
            <Item
              icon={FileClock}
              title="Certificate expiry tracker"
              body="License renewal, PAT test, gas safety, food hygiene, PRS/PPL music license. Dashboard widget: 'X certificates expire in next 30 days.'"
            />
            <Item
              icon={NotebookPen}
              title="Incident log"
              body="Accidents, complaints, refusals of service, breakages, wastage. Small but real legal value."
            />
            <Item
              icon={UtensilsCrossed}
              title="Food hygiene & HACCP (when kitchen reopens)"
              body="Daily temperature logs, cleaning schedules, allergen records. A legal must-have once the kitchen is trading again."
            />
          </div>
        </CardContent>
      </Card>

      {/* Later / wishlist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4 text-primary" /> Later / wishlist
          </CardTitle>
          <CardDescription>Good ideas we'd build if and when they feel useful.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <Item
              icon={Package}
              title="Stock & cellar log"
              body="Which barrels are on which lines, par levels, 'running low' alerts."
            />
            <Item
              icon={Users}
              title="Supplier address book"
              body="Quick contacts for ordering, feeds automatically into expenses."
            />
            <Item
              icon={CalendarCheck}
              title="Staff + rota"
              body="Simple shift scheduling, hours tracking, swap requests."
            />
            <Item
              icon={CloudSun}
              title="Weather annotation on takings"
              body="One dropdown per day — sunny / mixed / rain. Fascinating pattern data over time."
            />
            <Item
              icon={Calculator}
              title="Cash-up reconciliation"
              body="Compare till counts to Z-read. Catches counting errors or shortages fast."
            />
            <Item
              icon={MessageSquarePlus}
              title="Private bookings / room hire"
              body="Separate from public events — private parties, function room bookings, corporate hire."
            />
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 text-sm">
          <div className="font-medium">Tell Daniel what matters most</div>
          <p className="mt-1 text-muted-foreground">
            This is a rough list, not a commitment. If something here is exactly what you need,
            say so and we'll bump it up the queue. If something's missing that would genuinely
            help, tell us — we'll build it.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Item({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Clock;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <div className="mb-1 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <div className="text-sm font-semibold">{title}</div>
      </div>
      <p className="text-xs text-muted-foreground">{body}</p>
    </div>
  );
}
