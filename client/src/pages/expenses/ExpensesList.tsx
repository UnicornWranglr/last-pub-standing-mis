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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  formatCategory,
  type Expense,
  type ExpensesSummary,
} from '@/types/expenses';
import { ExpensesForm } from './ExpensesForm';

export function ExpensesList() {
  const { user } = useAuth();
  const canDelete = user?.role === 'owner';
  const [rows, setRows] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpensesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, sum] = await Promise.all([
        api<Expense[]>('/expenses'),
        api<ExpensesSummary>('/expenses/summary'),
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

  function openEdit(row: Expense) {
    setEditing(row);
    setFormOpen(true);
  }

  async function handleDelete(row: Expense) {
    const label = row.description || formatCategory(row.category);
    if (!confirm(`Delete expense "${label}" on ${formatDate(row.expense_date)}?`)) return;
    await api(`/expenses/${row.id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Workspace
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground">Log and review costs.</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-1 h-4 w-4" /> Add expense
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              This week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {summary ? formatCurrency(summary.weekTotal) : '—'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              This month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {summary ? formatCurrency(summary.monthTotal) : '—'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              This quarter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {summary ? formatCurrency(summary.quarterTotal) : '—'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              This year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {summary ? formatCurrency(summary.yearTotal) : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
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
                  No expenses yet. Click "Add expense" to log your first one.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{formatDate(row.expense_date)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatCategory(row.category)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.supplier || '—'}
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    {row.description || row.notes ? (
                      <div className="space-y-0.5">
                        {row.description && (
                          <div className="truncate text-sm text-foreground">
                            {row.description}
                          </div>
                        )}
                        {row.notes && (
                          <div className="truncate text-xs italic text-muted-foreground">
                            {row.notes}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatCurrency(row.amount)}
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

      <ExpensesForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSaved={load}
      />
    </div>
  );
}
