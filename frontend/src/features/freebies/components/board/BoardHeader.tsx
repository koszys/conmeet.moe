'use client';

import Link from 'next/link';
import { ArrowLeft, Gift, Plus } from 'lucide-react';
import { CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

interface BoardHeaderProps {
  conventionSlug: string;
  conventionName?: string;
}

export function BoardHeader({ conventionSlug, conventionName }: BoardHeaderProps) {
  return (
    <div className="border-ink border-b-2 pb-5">
      <Link
        href={`/conventions/${conventionSlug}`}
        className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-zinc-600 uppercase hover:underline dark:text-zinc-300 dark:hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {conventionName || 'Convention'} Overview
      </Link>

      <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex items-center gap-3">
          <div className="border-ink bg-accent-soft/25 flex h-11 w-11 shrink-0 items-center justify-center border-2 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800">
            <Gift className="text-ink h-5 w-5 dark:text-zinc-100" />
          </div>
          <div>
            <h1 className="font-display text-2xl tracking-wide uppercase sm:text-3xl">Freebies</h1>
            <p className="mt-0.5 text-xs text-zinc-600 sm:text-sm dark:text-zinc-300">
              Community-tracked freebies given away from vendors.
            </p>
          </div>
        </div>

        <Link
          href={`/conventions/${conventionSlug}/freebies/new`}
          className={cn(
            CONBLOCK_PRIMARY,
            'inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase sm:text-sm'
          )}
        >
          <Plus className="h-4 w-4 stroke-3" />
          Post a Freebie
        </Link>
      </div>
    </div>
  );
}
