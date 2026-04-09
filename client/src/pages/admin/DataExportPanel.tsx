import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { getToken } from '@/lib/api';

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

async function downloadCsv(path: string, fallbackFilename: string) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    alert(`Download failed: HTTP ${res.status}`);
    return;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  // Try to grab the filename from Content-Disposition, fall back otherwise.
  const disposition = res.headers.get('Content-Disposition') || '';
  const match = /filename="([^"]+)"/.exec(disposition);
  const filename = match ? match[1] : fallbackFilename;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const exports = [
  { label: 'Takings', path: '/admin/export/takings.csv', filename: 'takings.csv' },
  { label: 'Events', path: '/admin/export/events.csv', filename: 'events.csv' },
  { label: 'Expenses', path: '/admin/export/expenses.csv', filename: 'expenses.csv' },
  { label: 'Payroll', path: '/admin/export/payroll.csv', filename: 'payroll.csv' },
];

export function DataExportPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Download className="h-4 w-4" /> Data export
        </CardTitle>
        <CardDescription>
          Download a CSV copy of any module. Peace of mind — your data can always be got back out.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {exports.map((e) => (
            <Button
              key={e.path}
              variant="outline"
              size="sm"
              onClick={() => downloadCsv(e.path, e.filename)}
            >
              <Download className="mr-1 h-4 w-4" /> {e.label} CSV
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
