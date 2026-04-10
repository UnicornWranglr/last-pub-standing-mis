/**
 * Dummy takings + events data for the Insights wireframe.
 *
 * Generates a deterministic year of daily takings with realistic patterns:
 *   - Day-of-week shape (Sat/Fri busy, Mon quiet)
 *   - Wednesday quiz-night bump
 *   - Saturday live-music spike on roughly 1 in 3 weeks
 *   - Seasonal lifts (summer beer-garden, December Christmas trade)
 *   - January dry-month dip
 *   - Gentle upward growth across the year
 *   - A handful of named special events (Valentine's, St Patrick's,
 *     Halloween, Christmas Eve, NYE)
 *   - Light random noise so the chart isn't too clean
 *
 * Deterministic = same data every render. No persistence, no backend.
 */

export interface DummyTaking {
  date: string; // YYYY-MM-DD
  cash: number;
  card: number;
  total: number;
  notes?: string;
}

export interface DummyEvent {
  date: string;
  name: string;
  type: 'paid' | 'free';
  ticketPrice?: number;
  category: 'quiz' | 'music' | 'special';
  takingsBoost: number; // approximate £ added on top of the day-of-week baseline
}

// Deterministic pseudo-random so render-after-render produces the same numbers.
function seededRandom(seed: number) {
  let x = seed;
  return () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return (x >>> 8) / 0xffffff;
  };
}

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Day-of-week base — Mon..Sun. Sat is the king, Mon the dog.
const DOW_BASE: Record<number, number> = {
  0: 620, // Sun
  1: 240, // Mon
  2: 290, // Tue
  3: 460, // Wed (quiz)
  4: 480, // Thu
  5: 880, // Fri
  6: 1180, // Sat
};

// A few notable named events through the year
type SpecialEventDef = {
  monthDay: string; // MM-DD
  name: string;
  category: DummyEvent['category'];
  type: DummyEvent['type'];
  ticketPrice?: number;
  boost: number;
};

const SPECIAL_EVENTS: SpecialEventDef[] = [
  { monthDay: '02-14', name: "Valentine's Night", category: 'special', type: 'paid', ticketPrice: 35, boost: 720 },
  { monthDay: '03-17', name: "St Patrick's Day", category: 'special', type: 'free', boost: 980 },
  { monthDay: '05-04', name: 'May Day Beer Festival', category: 'special', type: 'paid', ticketPrice: 12, boost: 850 },
  { monthDay: '06-21', name: 'Summer Solstice Garden Party', category: 'special', type: 'free', boost: 640 },
  { monthDay: '07-13', name: 'Live Jazz Trio', category: 'music', type: 'paid', ticketPrice: 8, boost: 540 },
  { monthDay: '08-24', name: 'Bank Holiday BBQ', category: 'special', type: 'free', boost: 920 },
  { monthDay: '10-31', name: 'Halloween Costume Bash', category: 'special', type: 'paid', ticketPrice: 10, boost: 1100 },
  { monthDay: '11-05', name: "Bonfire Night", category: 'special', type: 'free', boost: 580 },
  { monthDay: '12-24', name: "Christmas Eve Singalong", category: 'special', type: 'free', boost: 680 },
  { monthDay: '12-31', name: "New Year's Eve Party", category: 'special', type: 'paid', ticketPrice: 25, boost: 1480 },
];

// Generate a year ending today.
export function generateDummyData(): {
  takings: DummyTaking[];
  events: DummyEvent[];
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - 364);

  const rng = seededRandom(42);
  const takings: DummyTaking[] = [];
  const events: DummyEvent[] = [];

  // Pre-index special events by date for quick lookup
  const specialByDate = new Map<string, SpecialEventDef>();
  for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
    for (const ev of SPECIAL_EVENTS) {
      const [m, d] = ev.monthDay.split('-').map(Number);
      const year = start.getFullYear() + yearOffset;
      const date = new Date(year, m - 1, d);
      const key = fmtDate(date);
      specialByDate.set(key, ev);
    }
  }

  for (let i = 0; i < 365; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = fmtDate(date);
    const dow = date.getDay();
    const month = date.getMonth(); // 0=Jan

    // 1. Base by day-of-week
    let amount = DOW_BASE[dow];

    // 2. Seasonal multiplier
    if (month >= 5 && month <= 7) {
      // Jun/Jul/Aug — beer garden weather
      amount *= 1.18;
    }
    if (month === 11) {
      // December — Christmas trade
      amount *= 1.22;
    }
    if (month === 0) {
      // January — dry month
      amount *= 0.82;
    }

    // 3. Gentle upward growth across the year (~8% by year-end)
    amount *= 1 + (i / 365) * 0.08;

    // 4. Random noise ±12%
    amount *= 0.88 + rng() * 0.24;

    // 5. Quiz night every Wednesday — already baked into DOW base, but add an event marker
    let dayEvent: DummyEvent | undefined;
    if (dow === 3) {
      dayEvent = {
        date: key,
        name: 'Wednesday Quiz Night',
        type: 'free',
        category: 'quiz',
        takingsBoost: 180,
      };
    }

    // 6. Live music on roughly 1 in 3 Saturdays
    if (dow === 6 && rng() < 0.34) {
      const boost = 380 + Math.round(rng() * 260);
      amount += boost;
      const acts = ['Acoustic Duo', 'The Late Bells', 'Tom Reeves Trio', 'Soul Stack', 'The Lockwoods', 'Friday Drift'];
      const name = acts[Math.floor(rng() * acts.length)] + ' — Live';
      dayEvent = {
        date: key,
        name,
        type: 'paid',
        ticketPrice: 5,
        category: 'music',
        takingsBoost: boost,
      };
    }

    // 7. Special named events override
    const special = specialByDate.get(key);
    if (special) {
      amount += special.boost;
      dayEvent = {
        date: key,
        name: special.name,
        type: special.type,
        ticketPrice: special.ticketPrice,
        category: special.category,
        takingsBoost: special.boost,
      };
    }

    // 8. Round and split cash/card (roughly 28% cash these days)
    const total = Math.round(amount);
    const cash = Math.round(total * (0.24 + rng() * 0.08));
    const card = total - cash;

    // 9. Light notes for some days
    let notes: string | undefined;
    if (rng() < 0.04) {
      const sample = [
        'Quiet evening, weather was rough',
        'Rammed all night',
        'Coach trip in around 7',
        'Fridge issue mid-shift',
        'Big stag do in the back room',
        'Local football match on the screens',
      ];
      notes = sample[Math.floor(rng() * sample.length)];
    }

    takings.push({ date: key, cash, card, total, notes });
    if (dayEvent) events.push(dayEvent);
  }

  return { takings, events };
}

/* ─── Aggregation helpers ──────────────────────────────────────────── */

export function sumWindow(takings: DummyTaking[], days: number): number {
  return takings.slice(-days).reduce((s, t) => s + t.total, 0);
}

export function previousWindow(takings: DummyTaking[], days: number): number {
  const slice = takings.slice(-days * 2, -days);
  return slice.reduce((s, t) => s + t.total, 0);
}

export function rollingAverage(takings: DummyTaking[], window = 7): { date: string; avg: number }[] {
  return takings.map((t, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = takings.slice(start, i + 1);
    const avg = slice.reduce((s, x) => s + x.total, 0) / slice.length;
    return { date: t.date, avg: Math.round(avg) };
  });
}

export function dayOfWeekAverages(takings: DummyTaking[]): { day: string; avg: number }[] {
  const buckets: number[][] = [[], [], [], [], [], [], []];
  for (const t of takings) {
    const d = new Date(t.date);
    buckets[d.getDay()].push(t.total);
  }
  // Reorder to Mon..Sun for display
  const order = [1, 2, 3, 4, 5, 6, 0];
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return order.map((dow, i) => {
    const bucket = buckets[dow];
    const avg = bucket.length ? bucket.reduce((s, x) => s + x, 0) / bucket.length : 0;
    return { day: labels[i], avg: Math.round(avg) };
  });
}

export function bestAndWorst(takings: DummyTaking[]): { best: DummyTaking; worst: DummyTaking } {
  let best = takings[0];
  let worst = takings[0];
  for (const t of takings) {
    if (t.total > best.total) best = t;
    if (t.total < worst.total) worst = t;
  }
  return { best, worst };
}

/**
 * Simple forecast: project the next N days using the average of the last
 * 4 occurrences of that day-of-week, with a tiny growth factor. Honest
 * "trading vibes", not ML.
 */
export function forecastNext(takings: DummyTaking[], days = 7): { date: string; forecast: number }[] {
  const out: { date: string; forecast: number }[] = [];
  const lastDate = new Date(takings[takings.length - 1].date);
  for (let i = 1; i <= days; i++) {
    const next = new Date(lastDate);
    next.setDate(next.getDate() + i);
    const dow = next.getDay();
    // Find the last 4 same-DoW values
    const sameDow = takings
      .filter((t) => new Date(t.date).getDay() === dow)
      .slice(-4);
    const avg = sameDow.length
      ? sameDow.reduce((s, t) => s + t.total, 0) / sameDow.length
      : 0;
    out.push({ date: fmtDate(next), forecast: Math.round(avg * 1.02) });
  }
  return out;
}

/**
 * Top events by takings boost relative to the day-of-week baseline.
 * Used for the "events that moved trade most" panel.
 */
export function topEventsByImpact(events: DummyEvent[], limit = 5): DummyEvent[] {
  return [...events]
    .sort((a, b) => b.takingsBoost - a.takingsBoost)
    .slice(0, limit);
}
