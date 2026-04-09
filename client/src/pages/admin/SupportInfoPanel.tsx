import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LifeBuoy, Mail, Github } from 'lucide-react';

export function SupportInfoPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LifeBuoy className="h-4 w-4" /> Support & about
        </CardTitle>
        <CardDescription>Who to call when something needs attention.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Built by
          </div>
          <div className="font-medium">Daniel Peters</div>
        </div>

        <div className="flex items-start gap-2">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Email
            </div>
            <a
              href="mailto:daniel@bneconsulting.co.uk"
              className="text-sm text-primary hover:underline"
            >
              daniel@bneconsulting.co.uk
            </a>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Github className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Source
            </div>
            <a
              href="https://github.com/UnicornWranglr/last-pub-standing-mis"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary hover:underline"
            >
              github.com/UnicornWranglr/last-pub-standing-mis
            </a>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            App
          </div>
          <div className="text-sm">Last Pub Standing MIS · Phase 2</div>
        </div>

        <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          If something looks wrong, broken, or you'd like a change made to how roles / features
          work, just email Daniel directly. Response time is usually same-day.
        </div>
      </CardContent>
    </Card>
  );
}
