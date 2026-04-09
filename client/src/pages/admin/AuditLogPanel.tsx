import { useCallback, useEffect, useState } from 'react';
import { History, RefreshCcw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import type { AuditLogEntry } from '@/types/admin';

export function AuditLogPanel() {
  const [rows, setRows] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api<AuditLogEntry[]>('/admin/audit-log?limit=100');
      setRows(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4" /> Audit log
            </CardTitle>
            <CardDescription>
              Last 100 actions — logins, creates, updates and deletes across all modules.
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={load}>
            <RefreshCcw className="mr-1 h-4 w-4" /> Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">When</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No audit entries yet.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString('en-GB')}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {r.username || '—'}
                    </TableCell>
                    <TableCell className="text-xs capitalize">{r.action}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.resource_type || '—'}
                      {r.resource_id != null && (
                        <span className="ml-1 text-muted-foreground">#{r.resource_id}</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate text-xs text-muted-foreground">
                      {r.details ? JSON.stringify(r.details) : '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
