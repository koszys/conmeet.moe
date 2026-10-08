'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export interface BoardEmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  primary?: boolean;
}

interface BoardEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: BoardEmptyStateAction;
}

export function BoardEmptyState({ icon: Icon, title, description, action }: BoardEmptyStateProps) {
  return (
    <div className="border-ink border-2 border-dashed bg-white p-12 text-center shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-900">
      <div className="border-ink bg-accent-soft/25 mx-auto flex h-14 w-14 items-center justify-center border-2 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800">
        <Icon className="text-ink h-7 w-7 dark:text-zinc-100" />
      </div>

      <h3 className="font-display mt-4 text-lg tracking-wide uppercase sm:text-xl">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-xs text-zinc-600 dark:text-zinc-300">
        {description}
      </p>

      {action ? (
        <div className="mt-6 flex justify-center gap-3">
          {action.href ? (
            <Link
              href={action.href}
              className={cn(
                action.primary ? CONBLOCK_PRIMARY : CONBLOCK,
                'inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase'
              )}
            >
              {action.icon ? <action.icon className="h-4 w-4" /> : null}
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className={cn(
                action.primary ? CONBLOCK_PRIMARY : CONBLOCK,
                'inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase'
              )}
            >
              {action.icon ? <action.icon className="h-4 w-4" /> : null}
              {action.label}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
