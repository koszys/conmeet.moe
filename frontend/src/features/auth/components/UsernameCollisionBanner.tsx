'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../AuthProvider';

export function UsernameCollisionBanner() {
  const { user, usernameCollisionNotice, dismissUsernameCollisionNotice } = useAuth();
  const pathname = usePathname();

  if (!usernameCollisionNotice || !user || pathname === '/settings') {
    return null;
  }

  return (
    <div
      role="alert"
      className="border-ink border-b-2 bg-amber-300 px-4 py-2.5 text-zinc-950 shadow-[0_2px_0_var(--ink)] dark:bg-amber-400 dark:text-zinc-950"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 text-xs font-medium">
        <div className="flex min-w-0 items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-950" />
          <p className="truncate">
            <span className="font-bold">Notice:</span> Your preferred username was already taken, so
            we assigned you <span className="font-mono font-bold">@{user.username}</span>.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/settings?username_collision=1"
            className="hover:text-accent-pop flex items-center gap-1 font-bold tracking-wider uppercase underline underline-offset-2 transition-colors"
          >
            Change username <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={dismissUsernameCollisionNotice}
            aria-label="Dismiss notice"
            className="rounded p-1 transition-colors hover:bg-black/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
