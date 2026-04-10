import {
  Cloud,
  Server,
  Check,
  AlertTriangle,
  Lightbulb,
  HardDrive,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function Deployment() {
  return (
    <div className="animate-fade-in-up max-w-4xl space-y-8">
      {/* Intro */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Info
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Deployment options
        </h1>
        <p className="text-sm text-muted-foreground">
          Two ways to run the Last Pub Standing MIS. Both work identically
          from a day-to-day user perspective — the difference is where the
          system lives and how it's paid for.
        </p>
      </div>

      {/* What you're using right now */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex gap-3 p-4 text-sm">
          <Lightbulb className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <div className="font-medium">What you're looking at right now</div>
            <p className="text-muted-foreground">
              This website is currently running as a <strong>cloud demo</strong>{' '}
              (Option 1 below) on free-tier hosting — that's why it may have
              taken a moment to wake up when you first loaded it. It's a
              working preview, not the final setup.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Option 1 — Cloud */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <Cloud className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Option 1 — Cloud hosting</CardTitle>
              <CardDescription>
                Runs on professional hosting providers; pay a small monthly fee
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            The whole system lives on rented servers in a UK/EU data centre.
            You access it from any phone, tablet or laptop with an internet
            connection — no computer needed at the pub. The providers handle
            all the technical bits in the background: backups, security
            updates, keeping everything online.
          </p>

          <div className="rounded-md bg-muted/60 p-4">
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Typical monthly cost
            </div>
            <div className="text-2xl font-bold">~£15 – £20 per month</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Roughly £180 – £240 per year. Exact figures depend on current
              provider pricing. Free tier available for demos but not suitable
              for real daily use.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">What you get</h3>
            <ul className="space-y-1.5">
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                Nothing to install, run or maintain at the pub
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                Access from anywhere with an internet connection
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                Automatic daily backups of your data
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                Professional uptime — very rarely down
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                Optional: your own web address (e.g.{' '}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  lps.lastpubstanding.co.uk
                </code>
                ) for about £12 per year
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Things to consider</h3>
            <ul className="space-y-1.5">
              <li className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                The monthly fee carries on forever — it's a subscription
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                Your data lives on the hosting provider's computers, not at
                the pub (kept in a UK/EU data centre, protected and encrypted)
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                If the pub's broadband is down, you can't reach it from inside
                the pub either
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Option 2 — Self-hosted */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Option 2 — Self-hosted</CardTitle>
              <CardDescription>
                Runs on a small computer at the pub; one-off hardware cost
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            A small, silent, low-power computer sits tucked away somewhere at
            the pub — back office, under the bar, comms cupboard — and runs
            the whole system 24 hours a day. Staff connect to it from the
            pub's wi-fi. Your data never leaves the premises.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-muted/60 p-4">
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                One-time cost
              </div>
              <div className="text-2xl font-bold">~£150 – £250</div>
              <p className="mt-1 text-xs text-muted-foreground">
                A small dedicated computer (e.g. Beelink, Minisforum, Intel
                NUC, or similar mini PC)
              </p>
            </div>
            <div className="rounded-md bg-muted/60 p-4">
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Ongoing cost
              </div>
              <div className="text-2xl font-bold">~£10 – £20 / year</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Electricity only. These devices use very little power (8–15W
                on average)
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">What you get</h3>
            <ul className="space-y-1.5">
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                Your data physically stays on your premises — nothing on the
                internet unless you want it to be
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                Still works from inside the pub even if broadband goes down
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                One-off payment — no monthly fees
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                Full control over the data — it's yours, on your kit
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                Can still be accessed from outside the pub if you want
                (requires a little extra setup)
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Things to consider</h3>
            <ul className="space-y-1.5">
              <li className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                Needs someone technical to set it up the first time — I'll
                handle that
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                You're responsible for backups (I can set up automatic
                backups to a USB drive or a cloud folder)
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                If the little computer fails, the system is down until it's
                fixed or swapped for a new one
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                One hardware decision to make up front — but I can recommend
                something that'll last years
              </li>
            </ul>
          </div>

          <div className="flex gap-3 rounded-md border border-primary/30 bg-primary/5 p-3 text-xs">
            <HardDrive className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <div className="font-medium">Already have a NAS?</div>
              <p className="text-muted-foreground">
                If the pub already owns (or is planning to buy) a QNAP,
                Synology, or similar network storage device, many of them can
                run this whole system directly — no extra hardware needed.
                That would make the one-time cost effectively £0.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side by side */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Side by side</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-medium"></th>
                  <th className="py-2 text-left font-medium">Cloud</th>
                  <th className="py-2 text-left font-medium">Self-hosted</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-2 text-muted-foreground">Upfront cost</td>
                  <td className="py-2">£0</td>
                  <td className="py-2">£150 – £250 (hardware)</td>
                </tr>
                <tr>
                  <td className="py-2 text-muted-foreground">Monthly cost</td>
                  <td className="py-2">~£15 – £20</td>
                  <td className="py-2">~£1 (electricity)</td>
                </tr>
                <tr>
                  <td className="py-2 text-muted-foreground">Year 1 total</td>
                  <td className="py-2">~£180 – £240</td>
                  <td className="py-2">~£160 – £270</td>
                </tr>
                <tr>
                  <td className="py-2 text-muted-foreground">
                    Year 2 onwards
                  </td>
                  <td className="py-2">~£180 – £240 / yr</td>
                  <td className="py-2">~£15 / yr</td>
                </tr>
                <tr>
                  <td className="py-2 text-muted-foreground">Who runs it</td>
                  <td className="py-2">Hosting provider</td>
                  <td className="py-2">You own the kit; I help maintain</td>
                </tr>
                <tr>
                  <td className="py-2 text-muted-foreground">Backups</td>
                  <td className="py-2">Automatic, by provider</td>
                  <td className="py-2">Automated on set-up</td>
                </tr>
                <tr>
                  <td className="py-2 text-muted-foreground">
                    Works if broadband fails
                  </td>
                  <td className="py-2">No</td>
                  <td className="py-2">Yes, inside the pub</td>
                </tr>
                <tr>
                  <td className="py-2 text-muted-foreground">Your data is…</td>
                  <td className="py-2">In a UK/EU data centre</td>
                  <td className="py-2">Physically at the pub</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Honest take */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">The honest take</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            Both options work equally well day-to-day. The choice comes down
            to preference and how you like to pay for things.
          </p>
          <div className="space-y-2">
            <p>
              <strong>Pick cloud</strong> if you'd rather pay a small monthly
              fee and have someone else handle the technical side completely.
              It's the simplest path and what most small businesses do these
              days.
            </p>
            <p>
              <strong>Pick self-hosted</strong> if you prefer a one-off cost,
              want the data to physically live at the pub, and are happy
              having a technical person (me) on call when something needs
              attention.
            </p>
          </div>
          <p className="text-muted-foreground">
            Starting with cloud for the first few months and moving to
            self-hosted later is also fine — the data can be exported from one
            and imported into the other. There's no lock-in either way.
          </p>
        </CardContent>
      </Card>

      {/* Over to you */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 text-sm">
          <div className="font-medium">Whenever you're ready</div>
          <p className="mt-1 text-muted-foreground">
            Have a think, and let me know which direction you'd like to go.
            Happy to talk either option through in more detail, or run a
            real-world test for a week before committing to anything.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
