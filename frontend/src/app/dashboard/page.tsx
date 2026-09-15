'use client';

import { useAuth } from '@/features/auth/auth-provider';
import { RequireAuth } from '@/features/auth/require-auth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <RequireAuth>
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <h1 className="font-display text-3xl tracking-wide [text-shadow:2px_2px_0_color-mix(in_srgb,var(--ink)_22%,transparent)] md:text-4xl">
          Dashboard
        </h1>
        <p className="mt-2 font-bold tracking-widest text-zinc-500 uppercase">
          Welcome back{user ? `, ${user.display_name || user.username}` : ''}
        </p>
        <div className="border-ink mt-8 rounded-none border-2 border-dashed p-8 text-sm text-zinc-500 dark:text-zinc-400">
          Convention schedules, freebies, and meetups land here in Phase 2.
        </div>
      </main>
    </RequireAuth>
  );
}
