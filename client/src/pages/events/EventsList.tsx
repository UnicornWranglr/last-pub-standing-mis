import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { currentMonthISO, formatCurrency, formatDate } from '@/lib/utils';
import type { PubEvent } from '@/types/events';
import { useAuth } from '@/contexts/AuthContext';
import { EventForm } from './EventForm';

function groupByDate(events: PubEvent[]) {
  const groups = new Map<string, PubEvent[]>();
  for (const e of events) {
    const list = groups.get(e.event_date) || [];
    list.push(e);
    groups.set(e.event_date, list);
  }
  return Array.from(groups.entries());
}

export function EventsList() {
  const { user } = useAuth();
  const canEdit = user?.role === 'owner' || user?.role === 'manager';
  const canDelete = user?.role === 'owner';
  const [month, setMonth] = useState(currentMonthISO());
  const [events, setEvents] = useState<PubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PubEvent | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await api<PubEvent[]>(`/events?month=${encodeURIComponent(month)}`);
      setEvents(rows);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(event: PubEvent) {
    setEditing(event);
    setFormOpen(true);
  }

  async function handleDelete(event: PubEvent) {
    if (!confirm(`Delete "${event.name}" on ${formatDate(event.event_date)}?`)) return;
    await api(`/events/${event.id}`, { method: 'DELETE' });
    load();
  }

  const grouped = groupByDate(events);

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Workspace
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Events</h1>
          <p className="text-sm text-muted-foreground">Plan and track upcoming events.</p>
        </div>
        <div className="flex items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="month">Month</Label>
            <Input
              id="month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-[160px]"
            />
          </div>
          {canEdit && (
            <Button onClick={openNew}>
              <Plus className="mr-1 h-4 w-4" /> Add event
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">Loading…</div>
      ) : grouped.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No events scheduled for this month.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, list]) => (
            <section key={date} className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground">{formatDate(date)}</h2>
              <div className="space-y-2">
                {list.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold">{event.name}</h3>
                          <span
                            className={
                              event.entry_type === 'paid'
                                ? 'rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'
                                : 'rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground'
                            }
                          >
                            {event.entry_type === 'paid'
                              ? `Paid · ${formatCurrency(event.ticket_price ?? 0)}`
                              : 'Free'}
                          </span>
                        </div>
                        {event.theme && (
                          <p className="text-sm text-muted-foreground">{event.theme}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          {event.event_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {event.event_time.slice(0, 5)}
                            </span>
                          )}
                          {event.contact_name && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" /> {event.contact_name}
                              {event.contact_info && ` · ${event.contact_info}`}
                            </span>
                          )}
                        </div>
                        {event.notes && (
                          <p className="pt-1 text-sm text-muted-foreground">{event.notes}</p>
                        )}
                      </div>
                      {(canEdit || canDelete) && (
                        <div className="flex gap-1 self-end sm:self-start">
                          {canEdit && (
                            <Button variant="ghost" size="icon" onClick={() => openEdit(event)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(event)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <EventForm open={formOpen} onOpenChange={setFormOpen} editing={editing} onSaved={load} />
    </div>
  );
}
