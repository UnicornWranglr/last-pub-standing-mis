import { useEffect, useState, type FormEvent } from 'react';
import { Check, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';
import { formatCurrency, todayISO } from '@/lib/utils';
import type { Takings, TakingsInput } from '@/types/takings';

function formatToday() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function StaffTakings() {
  const today = todayISO();
  const todayLabel = formatToday();

  const [existing, setExisting] = useState<Takings | null>(null);
  const [loading, setLoading] = useState(true);
  const [cash, setCash] = useState('0');
  const [card, setCard] = useState('0');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Load today's entry on mount
  useEffect(() => {
    let cancelled = false;
    api<Takings[]>(`/takings?from=${today}&to=${today}`)
      .then((rows) => {
        if (cancelled) return;
        const entry = rows[0] ?? null;
        setExisting(entry);
        if (entry) {
          setCash(String(entry.cash_takings));
          setCard(String(entry.card_takings));
          setNotes(entry.notes || '');
        }
      })
      .catch(() => {
        /* leave the form empty so they can still save */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [today]);

  const cashNum = parseFloat(cash) || 0;
  const cardNum = parseFloat(card) || 0;
  const total = cashNum + cardNum;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setJustSaved(false);
    if (cashNum < 0 || cardNum < 0) {
      setError('Amounts must be zero or positive.');
      return;
    }
    setSaving(true);
    const payload: TakingsInput = {
      takings_date: today,
      cash_takings: cashNum,
      card_takings: cardNum,
      notes: notes.trim() || null,
    };
    try {
      let entry: Takings;
      if (existing) {
        entry = await api<Takings>(`/takings/${existing.id}`, {
          method: 'PUT',
          body: payload,
        });
      } else {
        entry = await api<Takings>('/takings', {
          method: 'POST',
          body: payload,
        });
      }
      setExisting(entry);
      setJustSaved(true);
      // Auto-clear the "just saved" pulse after a few seconds
      window.setTimeout(() => setJustSaved(false), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="animate-fade-in-up max-w-2xl space-y-8">
      {/* Page heading */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Workspace
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Daily takings
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter today's till figures. You can come back and update these any time before the
          end of the day.
        </p>
      </div>

      {/* The form card */}
      <Card className="overflow-hidden shadow-soft-lg">
        <CardHeader className="border-b border-border/60 bg-muted/30">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">{todayLabel}</CardTitle>
            {existing?.updated_at && (
              <span
                className={
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ' +
                  (justSaved
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground')
                }
              >
                <Check className="h-3 w-3" />
                {justSaved ? 'Saved just now' : `Last saved ${formatTime(existing.updated_at)}`}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cash">Cash takings</Label>
                  <Input
                    id="cash"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={cash}
                    onChange={(e) => setCash(e.target.value)}
                    required
                    autoFocus={!existing}
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card">Card takings</Label>
                  <Input
                    id="card"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={card}
                    onChange={(e) => setCard(e.target.value)}
                    required
                    className="h-12 text-lg"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/[0.06] p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Total
                </div>
                <div className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                  {formatCurrency(total)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything unusual about the day…"
                  rows={3}
                />
              </div>

              {error && (
                <div
                  className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <p className="text-xs text-muted-foreground">
                  Date is locked to today.
                </p>
                <Button type="submit" size="lg" disabled={saving}>
                  {saving
                    ? 'Saving…'
                    : justSaved
                    ? 'Saved ✓'
                    : existing
                    ? 'Update entry'
                    : 'Save entry'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Helper note */}
      <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          Need to fix an entry from a previous day? Ask a manager — they can edit historical
          records from the full takings view.
        </p>
      </div>
    </div>
  );
}
