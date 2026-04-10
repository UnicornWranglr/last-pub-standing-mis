import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/lib/api';

export function Login() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="chrome-dark relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6 text-foreground">
      {/* Atmospheric gold glow — "pub sign at night" */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,_hsl(var(--primary)/0.18),_transparent_55%),radial-gradient(circle_at_80%_110%,_hsl(var(--primary)/0.10),_transparent_60%)]"
      />
      {/* Subtle grid texture for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,_white_1px,_transparent_1px),linear-gradient(to_bottom,_white_1px,_transparent_1px)] [background-size:48px_48px]"
      />

      <div className="relative w-full max-w-sm space-y-10">
        {/* Brand lockup — full sign scale */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 rounded-2xl bg-primary/30 blur-2xl"
            />
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/30 ring-1 ring-primary/50">
              <span className="font-display text-2xl leading-none">LPS</span>
            </div>
          </div>
          <h1 className="mt-6 font-display text-4xl leading-[0.95] tracking-tight text-foreground">
            Last Pub
            <br />
            Standing
          </h1>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/90">
            City Pub &amp; Kitchen
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Management Information System
          </p>
        </div>

        {/* Glass form card */}
        <div className="relative rounded-2xl border border-border/80 bg-card/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl ring-1 ring-white/[0.04]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Username
              </Label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="h-11 bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-background/50"
              />
            </div>
            {error && (
              <div
                className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {error}
              </div>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Trouble logging in? Email me at{' '}
          <a
            href="mailto:daniel@bneconsulting.co.uk"
            className="text-primary hover:underline"
          >
            daniel@bneconsulting.co.uk
          </a>
        </p>
      </div>
    </div>
  );
}
