import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Shield } from 'lucide-react';

type Cell = boolean | 'lite' | 'read';

const rows: { feature: string; staff: Cell; manager: Cell; owner: Cell }[] = [
  { feature: 'Login / logout', staff: true, manager: true, owner: true },
  { feature: 'Dashboard', staff: 'lite', manager: true, owner: true },
  { feature: 'Insights (charts, metrics)', staff: false, manager: true, owner: true },
  { feature: 'Takings — view', staff: true, manager: true, owner: true },
  { feature: 'Takings — create / edit', staff: true, manager: true, owner: true },
  { feature: 'Takings — delete', staff: false, manager: false, owner: true },
  { feature: 'Events — view', staff: 'read', manager: true, owner: true },
  { feature: 'Events — create / edit', staff: false, manager: true, owner: true },
  { feature: 'Events — delete', staff: false, manager: false, owner: true },
  { feature: 'Expenses — view / create / edit', staff: false, manager: true, owner: true },
  { feature: 'Expenses — delete', staff: false, manager: false, owner: true },
  { feature: 'Payroll (anything)', staff: false, manager: false, owner: true },
  { feature: 'Admin page & user management', staff: false, manager: false, owner: true },
  { feature: 'Deployment page', staff: true, manager: true, owner: true },
  { feature: 'Roadmap page', staff: true, manager: true, owner: true },
];

function renderCell(value: Cell) {
  if (value === true) return <Check className="h-4 w-4 text-green-600" aria-label="Allowed" />;
  if (value === false) return <X className="h-4 w-4 text-muted-foreground" aria-label="Not allowed" />;
  if (value === 'lite')
    return (
      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
        lite
      </span>
    );
  if (value === 'read')
    return (
      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
        read-only
      </span>
    );
  return null;
}

export function RoleMatrixPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-4 w-4" /> Access matrix
        </CardTitle>
        <CardDescription>
          Current permissions for each role. Change requests come via Daniel — the matrix is
          read-only in the app for now.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left font-medium"></th>
                <th className="py-2 text-center font-medium">Staff</th>
                <th className="py-2 text-center font-medium">Manager</th>
                <th className="py-2 text-center font-medium">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.feature}>
                  <td className="py-2 text-muted-foreground">{r.feature}</td>
                  <td className="py-2 text-center">
                    <div className="inline-flex">{renderCell(r.staff)}</div>
                  </td>
                  <td className="py-2 text-center">
                    <div className="inline-flex">{renderCell(r.manager)}</div>
                  </td>
                  <td className="py-2 text-center">
                    <div className="inline-flex">{renderCell(r.owner)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
