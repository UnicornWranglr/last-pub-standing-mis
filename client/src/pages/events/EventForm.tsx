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
import { todayISO } from '@/lib/utils';
import type { EntryType, PubEvent, PubEventInput } from '@/types/events';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: PubEvent | null;
  onSaved: () => void;
}

export function EventForm({ open, onOpenChange, editing, onSaved }: Props) {
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('');
  const [eventDate, setEventDate] = useState(todayISO());
  const [eventTime, setEventTime] = useState('');
  const [entryType, setEntryType] = useState<EntryType>('free');
  const [ticketPrice, setTicketPrice] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setTheme(editing.theme || '');
      setEventDate(editing.event_date);
      // DB returns "HH:MM:SS" - trim to "HH:MM" for the time input
      setEventTime(editing.event_time ? editing.event_time.slice(0, 5) : '');
      setEntryType(editing.entry_type);
      setTicketPrice(editing.ticket_price != null ? String(editing.ticket_price) : '');
      setContactName(editing.contact_name || '');
      setContactInfo(editing.contact_info || '');
      setNotes(editing.notes || '');
    } else {
      setName('');
      setTheme('');
      setEventDate(todayISO());
      setEventTime('');
      setEntryType('free');
      setTicketPrice('');
      setContactName('');
      setContactInfo('');
      setNotes('');
    }
    setError(null);
  }, [open, editing]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (entryType === 'paid') {
      const price = parseFloat(ticketPrice);
      if (Number.isNaN(price) || price < 0) {
        setError('Ticket price is required for paid events.');
        return;
      }
    }

    setSaving(true);
    const payload: PubEventInput = {
      name: name.trim(),
      theme: theme.trim() || null,
      event_date: eventDate,
      event_time: eventTime || null,
      entry_type: entryType,
      ticket_price: entryType === 'paid' ? parseFloat(ticketPrice) : null,
      contact_name: contactName.trim() || null,
      contact_info: contactInfo.trim() || null,
      notes: notes.trim() || null,
    };

    try {
      if (editing) {
        await api(`/events/${editing.id}`, { method: 'PUT', body: payload });
      } else {
        await api('/events', { method: 'POST', body: payload });
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit event' : 'New event'}</DialogTitle>
          <DialogDescription>
            Track name, theme, timing, entry type, and contact details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={255}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="theme">Theme (optional)</Label>
            <Input
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              maxLength={255}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">Date</Label>
              <Input
                id="event_date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_time">Time (optional)</Label>
              <Input
                id="event_time"
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry_type">Entry type</Label>
              <select
                id="entry_type"
                value={entryType}
                onChange={(e) => setEntryType(e.target.value as EntryType)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket_price">
                Ticket price {entryType === 'paid' && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="ticket_price"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
                disabled={entryType !== 'paid'}
                required={entryType === 'paid'}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_name">Contact name</Label>
              <Input
                id="contact_name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_info">Contact info</Label>
              <Input
                id="contact_info"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="phone / email / @handle"
                maxLength={255}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
