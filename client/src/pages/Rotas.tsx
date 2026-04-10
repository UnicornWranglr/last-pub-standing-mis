import { useMemo, useState } from 'react';
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

/* ─── Wireframe data ────────────────────────────────────────────────
 * NONE of this is real or persisted. The whole page is a visual mock
 * to show Simon what rota management could look like once we have his
 * input on the level of detail he wants.
 * ──────────────────────────────────────────────────────────────────── */

type Team = {
  id: string;
  name: string;
  color: string; // hex
  description: string;
};

type Employee = {
  id: string;
  name: string;
  role: 'owner' | 'manager' | 'staff';
  teamId: string;
};

type Shift = {
  employeeId: string;
  dayOffset: number; // 0..6 from Monday of the displayed week
  start: string; // 'HH:MM'
  end: string;
};

const TEAMS: Team[] = [
  { id: 'foh', name: 'Front of House', color: '#C8A13B', description: 'Bar, floor, hosts' },
  { id: 'kitchen', name: 'Kitchen', color: '#8B6F47', description: 'Chefs, KP, prep' },
];

const EMPLOYEES: Employee[] = [
  { id: 'simon', name: 'Simon', role: 'owner', teamId: 'foh' },
  { id: 'karen', name: 'Karen', role: 'manager', teamId: 'foh' },
  { id: 'daniel', name: 'Daniel', role: 'staff', teamId: 'foh' },
  { id: 'alex', name: 'Alex', role: 'staff', teamId: 'kitchen' },
  { id: 'sam', name: 'Sam', role: 'staff', teamId: 'kitchen' },
  { id: 'lisa', name: 'Lisa', role: 'staff', teamId: 'foh' },
];

const SHIFTS: Shift[] = [
  // Karen — Front of House manager, evenings
  { employeeId: 'karen', dayOffset: 0, start: '12:00', end: '20:00' },
  { employeeId: 'karen', dayOffset: 2, start: '12:00', end: '20:00' },
  { employeeId: 'karen', dayOffset: 3, start: '12:00', end: '20:00' },
  { employeeId: 'karen', dayOffset: 4, start: '11:00', end: '23:00' },
  { employeeId: 'karen', dayOffset: 5, start: '11:00', end: '23:00' },

  // Daniel — bar staff, evenings
  { employeeId: 'daniel', dayOffset: 1, start: '16:00', end: '23:00' },
  { employeeId: 'daniel', dayOffset: 2, start: '16:00', end: '23:00' },
  { employeeId: 'daniel', dayOffset: 4, start: '16:00', end: '23:00' },
  { employeeId: 'daniel', dayOffset: 5, start: '16:00', end: '23:00' },
  { employeeId: 'daniel', dayOffset: 6, start: '16:00', end: '23:00' },

  // Lisa — bar staff, daytimes
  { employeeId: 'lisa', dayOffset: 0, start: '10:00', end: '16:00' },
  { employeeId: 'lisa', dayOffset: 1, start: '10:00', end: '16:00' },
  { employeeId: 'lisa', dayOffset: 3, start: '10:00', end: '16:00' },
  { employeeId: 'lisa', dayOffset: 5, start: '10:00', end: '18:00' },
  { employeeId: 'lisa', dayOffset: 6, start: '10:00', end: '18:00' },

  // Alex — chef
  { employeeId: 'alex', dayOffset: 0, start: '10:00', end: '18:00' },
  { employeeId: 'alex', dayOffset: 1, start: '10:00', end: '18:00' },
  { employeeId: 'alex', dayOffset: 2, start: '10:00', end: '18:00' },
  { employeeId: 'alex', dayOffset: 4, start: '10:00', end: '22:00' },
  { employeeId: 'alex', dayOffset: 5, start: '10:00', end: '22:00' },

  // Sam — chef
  { employeeId: 'sam', dayOffset: 2, start: '16:00', end: '23:00' },
  { employeeId: 'sam', dayOffset: 3, start: '16:00', end: '23:00' },
  { employeeId: 'sam', dayOffset: 4, start: '16:00', end: '23:00' },
  { employeeId: 'sam', dayOffset: 5, start: '16:00', end: '23:00' },
  { employeeId: 'sam', dayOffset: 6, start: '12:00', end: '20:00' },
];

/* ─── Helpers ──────────────────────────────────────────────────────── */

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun..6=Sat
  const offsetToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + offsetToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function formatRange(start: Date) {
  const end = addDays(start, 6);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${start.toLocaleDateString('en-GB', opts)} – ${end.toLocaleDateString('en-GB', { ...opts, year: 'numeric' })}`;
}

function shiftHours(s: Shift): number {
  const [sh, sm] = s.start.split(':').map(Number);
  const [eh, em] = s.end.split(':').map(Number);
  return Math.max(0, eh + em / 60 - (sh + sm / 60));
}

function teamFor(emp: Employee): Team | undefined {
  return TEAMS.find((t) => t.id === emp.teamId);
}

/* ─── Top-level component ─────────────────────────────────────────── */

export function Rotas() {
  const { user } = useAuth();
  if (user?.role === 'staff') return <StaffRotaView />;
  return <ManagementRotaView />;
}

/* ─── Preview banner (shared) ─────────────────────────────────────── */

function PreviewBanner() {
  return (
    <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary)/0.15),_transparent_60%)]"
      />
      <CardContent className="relative flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold">Wireframe preview</h2>
              <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-primary">
                Mockup
              </span>
            </div>
            <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
              This is a visual sketch of how rota management could work for Last Pub Standing.
              The data here is fake, nothing saves, and the design will evolve once I know
              exactly what level of detail you want. Is this something that's useful / you'd
              want? If so, how do you want this to work? Should staff be able to request shift
              swaps? Track holiday from here? Lock the rota once published? The more I know up
              front, the less I'll need to redo. Anything you spot that should change, let me
              know and I'll iterate.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Staff view ──────────────────────────────────────────────────── */

function StaffRotaView() {
  const { user } = useAuth();
  // For the wireframe we pretend "Daniel" is the signed-in staff member
  const me = EMPLOYEES.find((e) => e.id === 'daniel') ?? EMPLOYEES[2];
  const myShifts = SHIFTS.filter((s) => s.employeeId === me.id);
  const totalHours = myShifts.reduce((sum, s) => sum + shiftHours(s), 0);
  const myTeam = teamFor(me);

  const weekStart = useMemo(() => getWeekStart(new Date()), []);

  // Find the next upcoming shift (today or future)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOffset = Math.floor((today.getTime() - weekStart.getTime()) / 86400000);
  const nextShift =
    myShifts.find((s) => s.dayOffset >= todayOffset) ?? myShifts[0];
  const nextShiftDate = nextShift ? addDays(weekStart, nextShift.dayOffset) : null;

  return (
    <div className="animate-fade-in-up max-w-3xl space-y-8">
      <div className="space-y-1.5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Workspace · Preview
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">My rota</h1>
        <p className="text-sm text-muted-foreground">
          Your shifts for this week. Updated by your manager.
        </p>
      </div>

      <PreviewBanner />

      {/* Next shift hero */}
      {nextShift && nextShiftDate && (
        <Card className="relative overflow-hidden shadow-soft-lg">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary)/0.10),_transparent_65%)]"
          />
          <CardContent className="relative p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Your next shift
                </div>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  {nextShiftDate.toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </div>
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {nextShift.start} – {nextShift.end}
                  </span>
                  {myTeam && (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{
                        backgroundColor: `${myTeam.color}1f`,
                        color: myTeam.color,
                      }}
                    >
                      {myTeam.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <CalendarRange className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* This week */}
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">This week</CardTitle>
              <CardDescription>{formatRange(weekStart)}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Total
              </div>
              <div className="text-xl font-semibold tabular-nums text-foreground">
                {totalHours.toFixed(1)} hrs
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border/60">
            {DAYS.map((day, i) => {
              const shift = myShifts.find((s) => s.dayOffset === i);
              const date = addDays(weekStart, i);
              const isToday = date.getTime() === today.getTime();
              return (
                <li
                  key={day}
                  className={cn(
                    'flex items-center justify-between py-3',
                    isToday && 'rounded-lg bg-primary/[0.06] px-3'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {day}
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {date.getDate()}
                      </div>
                    </div>
                    {shift ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span className="font-medium text-foreground">
                          {shift.start} – {shift.end}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({shiftHours(shift).toFixed(1)} hrs)
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Off</span>
                    )}
                  </div>
                  {isToday && (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-primary">
                      Today
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Team rota — skeleton */}
      <Card className="border-dashed shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" /> {myTeam?.name ?? 'Team'} rota
          </CardTitle>
          <CardDescription>Coming later — see who else is on with you.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Once teams are set up, you'll see the whole {myTeam?.name ?? 'team'} schedule here so
          you know who you're working with each shift. For now this is just a placeholder.
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Signed in as <strong className="text-foreground">{user?.username}</strong>. The shift
        data shown is fake — this is a wireframe.
      </p>
    </div>
  );
}

/* ─── Owner / Manager view ────────────────────────────────────────── */

function ManagementRotaView() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [teamFilter, setTeamFilter] = useState<string>('all');

  const visibleEmployees =
    teamFilter === 'all'
      ? EMPLOYEES
      : EMPLOYEES.filter((e) => e.teamId === teamFilter);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Workspace · Preview
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Rotas</h1>
          <p className="text-sm text-muted-foreground">
            Plan the team's shifts for the week.
          </p>
        </div>
        <Button disabled title="Wireframe — not wired up yet">
          <Plus className="mr-1 h-4 w-4" /> Add shift
        </Button>
      </div>

      <PreviewBanner />

      {/* Toolbar */}
      <Card className="shadow-soft">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeekStart(addDays(weekStart, -7))}
              title="Previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekStart(getWeekStart(new Date()))}
            >
              This week
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeekStart(addDays(weekStart, 7))}
              title="Next week"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="ml-3 text-sm font-medium text-foreground">
              {formatRange(weekStart)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="team-filter"
              className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Team
            </label>
            <select
              id="team-filter"
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <option value="all">All teams</option>
              {TEAMS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Calendar grid + teams panel */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Schedule grid */}
        <Card className="overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="sticky left-0 z-10 bg-muted/30 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Employee
                  </th>
                  {DAYS.map((day, i) => {
                    const date = addDays(weekStart, i);
                    const isToday = date.getTime() === today.getTime();
                    return (
                      <th
                        key={day}
                        className={cn(
                          'px-2 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground',
                          isToday && 'text-primary'
                        )}
                      >
                        <div>{day}</div>
                        <div
                          className={cn(
                            'mt-0.5 text-base font-semibold normal-case tracking-normal',
                            isToday ? 'text-primary' : 'text-foreground'
                          )}
                        >
                          {date.getDate()}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {visibleEmployees.map((emp) => {
                  const team = teamFor(emp);
                  const empShifts = SHIFTS.filter((s) => s.employeeId === emp.id);
                  const empHours = empShifts.reduce((sum, s) => sum + shiftHours(s), 0);
                  return (
                    <tr key={emp.id} className="group">
                      <td className="sticky left-0 z-10 bg-card px-4 py-3 group-hover:bg-muted/30">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold uppercase text-primary">
                            {emp.name.slice(0, 1)}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-foreground">
                              {emp.name}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {team && (
                                <span
                                  className="inline-block h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: team.color }}
                                />
                              )}
                              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                {emp.role} · {empHours.toFixed(0)}h
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      {DAYS.map((_day, i) => {
                        const shift = empShifts.find((s) => s.dayOffset === i);
                        return (
                          <td key={i} className="px-2 py-2 align-middle">
                            {shift ? (
                              <button
                                type="button"
                                disabled
                                className="block w-full cursor-not-allowed rounded-lg border px-2 py-1.5 text-center text-[11px] font-medium leading-tight transition-colors"
                                style={{
                                  borderColor: `${team?.color ?? '#999'}40`,
                                  backgroundColor: `${team?.color ?? '#999'}14`,
                                  color: team?.color ?? 'hsl(var(--foreground))',
                                }}
                                title={`${emp.name}: ${shift.start} – ${shift.end}`}
                              >
                                {shift.start}
                                <br />
                                {shift.end}
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="block w-full cursor-not-allowed rounded-lg border border-dashed border-border/60 py-2 text-center text-[10px] font-medium text-muted-foreground/60 transition-colors hover:border-primary/40 hover:bg-primary/[0.04]"
                                title="Add shift (preview only)"
                              >
                                +
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Teams skeleton panel */}
        <div className="space-y-4">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" /> Teams
              </CardTitle>
              <CardDescription>Group employees for easier scheduling.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {TEAMS.map((t) => {
                const members = EMPLOYEES.filter((e) => e.teamId === t.id);
                return (
                  <div
                    key={t.id}
                    className="rounded-lg border border-border/60 bg-muted/20 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: t.color }}
                      />
                      <div className="text-sm font-semibold text-foreground">{t.name}</div>
                      <span className="ml-auto text-[10px] uppercase tracking-widest text-muted-foreground">
                        {members.length} ppl
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{t.description}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {members.map((m) => (
                        <span
                          key={m.id}
                          className="rounded-full bg-background px-2 py-0.5 text-[10px] font-medium text-foreground ring-1 ring-border/60"
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-dashed shadow-soft">
            <CardContent className="p-4 text-xs text-muted-foreground">
              <div className="font-semibold text-foreground">Coming with the real version</div>
              <ul className="mt-2 space-y-1.5">
                <SkeletonItem text="Drag-and-drop shifts between days/people" />
                <SkeletonItem text="Conflict detection (double-booking, max hours)" />
                <SkeletonItem text="Per-team views and filters" />
                <SkeletonItem text="Holiday and sickness tracking" />
                <SkeletonItem text="Shift swap requests from staff" />
                <SkeletonItem text="Total hours per person, week-on-week" />
                <SkeletonItem text="Export to PDF / print rota for the staff board" />
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}

function SkeletonItem({ icon: Icon = Sparkles, text }: { icon?: LucideIcon; text: string }) {
  return (
    <li className="flex gap-2">
      <Icon className="mt-0.5 h-3 w-3 shrink-0 text-primary/70" />
      {text}
    </li>
  );
}
