import { useEffect, useState, type FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';
import { formatCurrency, todayISO } from '@/lib/utils';
import type { Takings, TakingsInput } from '@/types/takings';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Takings | null;
  onSaved: () => void;
}

export function TakingsForm({ open, onOpenChange, editing, onSaved }: Props) {
  const [date, setDate] = useState(todayISO());
  const [cash, setCash] = useState('0');
  const [card, setCard] = useState('0');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setDate(editing.takings_date);
      setCash(String(editing.cash_takings));
      setCard(String(editing.card_takings));
      setNotes(editing.notes || '');
    } else {
      setDate(todayISO());
      setCash('0');
      setCard('0');
      setNotes('');
    }
    setError(null);
  }, [open, editing]);

  const cashNum = parseFloat(cash) || 0;
  const cardNum = parseFloat(card) || 0;
  const total = cashNum + cardNum;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (cashNum < 0 || cardNum < 0) {
      setError('Amounts must be zero or positive.');
      return;
    }
    setSaving(true);
    const payload: TakingsInput = {
      takings_date: date,
      cash_takings: cashNum,
      card_takings: cardNum,
      notes: notes.trim() || null,
    };
    try {
      if (editing) {
        await api(`/takings/${editing.id}`, { method: 'PUT', body: payload });
      } else {
        await api('/takings', { method: 'POST', body: payload });
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 409
            ? 'A takings entry already exists for that date.'
            : err.message
        );
      } else {
        setError('Something went wrong.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit takings' : 'New takings'}</DialogTitle>
          <DialogDescription>Enter the day's figures from the till reports.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cash">Cash</Label>
              <Input
                id="cash"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={cash}
                onChange={(e) => setCash(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card">Card</Label>
              <Input
                id="card"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={card}
                onChange={(e) => setCard(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="rounded-md bg-muted px-3 py-2 text-sm">
            Total: <span className="font-semibold">{formatCurrency(total)}</span>
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
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
