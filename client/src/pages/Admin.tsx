import { RoleMatrixPanel } from './admin/RoleMatrixPanel';
import { BusinessTotalsPanel } from './admin/BusinessTotalsPanel';
import { UsersPanel } from './admin/UsersPanel';
import { AuditLogPanel } from './admin/AuditLogPanel';
import { DataExportPanel } from './admin/DataExportPanel';
import { BackupGuidancePanel } from './admin/BackupGuidancePanel';
import { SupportInfoPanel } from './admin/SupportInfoPanel';

export function Admin() {
  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="space-y-1.5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Management · Owner only
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Admin</h1>
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
