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
import type { PayrollEntry, PayrollInput } from '@/types/payroll';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: PayrollEntry | null;
  onSaved: () => void;
}

export function PayrollForm({ open, onOpenChange, editing, onSaved }: Props) {
  const [periodStart, setPeriodStart] = useState(todayISO());
  const [periodEnd, setPeriodEnd] = useState(todayISO());
  const [employeeName, setEmployeeName] = useState('');
  const [grossPay, setGrossPay] = useState('0');
  const [ni, setNi] = useState('0');
  const [pension, setPension] = useState('0');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setPeriodStart(editing.pay_period_start);
      setPeriodEnd(editing.pay_period_end);
      setEmployeeName(editing.employee_name);
      setGrossPay(String(editing.gross_pay));
      setNi(String(editing.ni_contribution));
      setPension(String(editing.pension));
      setNotes(editing.notes || '');
    } else {
      setPeriodStart(todayISO());
      setPeriodEnd(todayISO());
      setEmployeeName('');
      setGrossPay('0');
      setNi('0');
      setPension('0');
      setNotes('');
    }
    setError(null);
  }, [open, editing]);

  const grossNum = parseFloat(grossPay) || 0;
  const niNum = parseFloat(ni) || 0;
  const pensionNum = parseFloat(pension) || 0;
  const net = grossNum - niNum - pensionNum;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (periodEnd < periodStart) {
      setError('Period end must be on or after period start.');
      return;
    }
    if (grossNum < 0 || niNum < 0 || pensionNum < 0) {
      setError('Amounts must be zero or positive.');
      return;
    }
    if (net < 0) {
      setError('Net pay would be negative — NI + pension exceed gross pay.');
      return;
    }

    setSaving(true);
    const payload: PayrollInput = {
      pay_period_start: periodStart,
      pay_period_end: periodEnd,
      employee_name: employeeName.trim(),
      gross_pay: grossNum,
      ni_contribution: niNum,
      pension: pensionNum,
      notes: notes.trim() || null,
    };

    try {
      if (editing) {
        await api(`/payroll/${editing.id}`, { method: 'PUT', body: payload });
      } else {
        await api('/payroll', { method: 'POST', body: payload });
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
          <DialogTitle>{editing ? 'Edit payroll entry' : 'New payroll entry'}</DialogTitle>
          <DialogDescription>
            Record a pay period for one employee. Net pay is calculated automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee_name">Employee name</Label>
            <Input
              id="employee_name"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              required
              maxLength={255}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period_start">Period start</Label>
              <Input
                id="period_start"
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period_end">Period end</Label>
              <Input
                id="period_end"
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gross_pay">Gross pay (£)</Label>
              <Input
                id="gross_pay"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={grossPay}
                onChange={(e) => setGrossPay(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ni">NI (£)</Label>
              <Input
                id="ni"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={ni}
                onChange={(e) => setNi(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pension">Pension (£)</Label>
              <Input
                id="pension"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={pension}
                onChange={(e) => setPension(e.target.value)}
              />
            </div>
          </div>
          <div className="rounded-md bg-muted px-3 py-2 text-sm">
            Net pay: <span className="font-semibold">{formatCurrency(Math.max(0, net))}</span>
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
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
