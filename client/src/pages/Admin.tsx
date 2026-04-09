import { RoleMatrixPanel } from './admin/RoleMatrixPanel';
import { BusinessTotalsPanel } from './admin/BusinessTotalsPanel';
import { UsersPanel } from './admin/UsersPanel';
import { AuditLogPanel } from './admin/AuditLogPanel';
import { DataExportPanel } from './admin/DataExportPanel';
import { BackupGuidancePanel } from './admin/BackupGuidancePanel';
import { SupportInfoPanel } from './admin/SupportInfoPanel';

export function Admin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Owner-only controls, business-wide totals and system info.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RoleMatrixPanel />
        <BusinessTotalsPanel />
      </div>

      <UsersPanel />

      <AuditLogPanel />

      <DataExportPanel />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BackupGuidancePanel />
        <SupportInfoPanel />
      </div>
    </div>
  );
}
