'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { MikuGif } from '@/shared/components/miku';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

export interface BoardEmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  primary?: boolean;
}

interface BoardEmptyStateProps {
  icon?: LucideIcon;
  speech?: string;
  title: string;
  description: string;
  action?: BoardEmptyStateAction;
}

export function BoardEmptyState({ speech, title, description, action }: BoardEmptyStateProps) {
  return (
    <div className="border-ink border-2 border-dashed bg-white p-10 text-center shadow-[4px_4px_0_var(--ink)] sm:p-12 dark:bg-zinc-900">
      <div className="mb-4 flex justify-center">
        <MikuGif size="md" variant="framed" speech={speech} speechPosition="top" />
      </div>

      <h3 className="font-display mt-2 text-lg tracking-wide uppercase sm:text-xl">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-xs text-zinc-600 sm:text-sm dark:text-zinc-300">
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
