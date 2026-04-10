import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Archive, AlertTriangle, Check } from 'lucide-react';

export function BackupGuidancePanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Archive className="h-4 w-4" /> Backups
        </CardTitle>
        <CardDescription>How your data is protected today.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex gap-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <div className="font-medium text-amber-900">No automatic cloud backups (free tier)</div>
            <p className="text-amber-800">
              The current hosting plan doesn't include automatic daily backups. If the database
              were lost for any reason, there's no recovery. Use the Data export panel above to
              download manual snapshots regularly, or upgrade the hosting plan to get automated
              daily backups.
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            What you can do today
          </h3>
          <ul className="space-y-1.5">
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              Download CSV exports from the Data export panel above — weekly or monthly is plenty.
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              Keep the exports in a cloud folder (Google Drive, Dropbox) or on a USB drive.
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              Let me know if you want to upgrade the hosting plan — automated daily backups
              are around an extra £5–15 / month depending on the tier.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
