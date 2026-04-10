import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Takings, TakingsSummary as TakingsSummaryType } from '@/types/takings';
import { useAuth } from '@/contexts/AuthContext';
import { TakingsForm } from './TakingsForm';
import { TakingsSummary } from './TakingsSummary';

export function TakingsList() {
  const { user } = useAuth();
  const canDelete = user?.role === 'owner';
  const [rows, setRows] = useState<Takings[]>([]);
  const [summary, setSummary] = useState<TakingsSummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Takings | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, sum] = await Promise.all([
        api<Takings[]>('/takings'),
        api<TakingsSummaryType>('/takings/summary'),
      ]);
      setRows(list);
      setSummary(sum);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(row: Takings) {
    setEditing(row);
    setFormOpen(true);
  }

  async function handleDelete(row: Takings) {
    if (!confirm(`Delete takings entry for ${formatDate(row.takings_date)}?`)) return;
    await api(`/takings/${row.id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Workspace
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Daily takings
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter and review daily till figures.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-1 h-4 w-4" /> Add entry
        </Button>
      </div>

      <TakingsSummary summary={summary} />

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Cash</TableHead>
              <TableHead className="text-right">Card</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No takings yet. Click "Add entry" to get started.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{formatDate(row.takings_date)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(row.cash_takings)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(row.card_takings)}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatCurrency(row.total)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {row.notes || '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(row)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TakingsForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSaved={load}
      />
    </div>
  );
}
