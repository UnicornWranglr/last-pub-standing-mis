import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface Item {
  to: string;
  label: string;
  icon: LucideIcon;
  end: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  items: Item[];
}

export function MobileMoreDrawer({ open, onClose, items }: Props) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 md:hidden">
      {/* Overlay */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      {/* Sheet */}
      <div className="absolute inset-x-0 bottom-0 rounded-t-xl border-t bg-background p-4 shadow-lg animate-fade-in">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">More</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <ul className="divide-y">
          {items.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 py-3 text-sm font-medium',
                    isActive ? 'text-primary' : 'text-foreground'
                  )
                }
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}
