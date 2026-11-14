'use client';

import { ArrowUpRight } from 'lucide-react';
import { ConventionCard } from '../items';
import type { Convention } from '../../../types';
import { CONBLOCK_PRIMARY } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

export interface FeaturedViewContentProps {
  conventions: Convention[];
  onSwitchToList: () => void;
  className?: string;
}

export function FeaturedViewContent({
  conventions,
  onSwitchToList,
  className,
}: FeaturedViewContentProps) {
  return (
    <div className={cn('mt-8 flex w-full max-w-full min-w-0 flex-col gap-6', className)}>
      {conventions.length === 0 ? (
        <div className="border-ink border-2 border-dashed bg-white p-6 text-center sm:p-12 dark:bg-zinc-900">
          <p className="font-display text-xs tracking-wide uppercase sm:text-base">
            No featured conventions right now!
          </p>
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
            Check back soon or explore the full list of conventions happening across the community.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onSwitchToList}
              className={cn(
                CONBLOCK_PRIMARY,
                'inline-flex items-center gap-2 px-4 py-2 text-xs min-[380px]:px-5 min-[380px]:py-2.5'
              )}
            >
              <span>View All Cons</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        conventions.map((convention) => (
          <ConventionCard key={convention.id} convention={convention} />
        ))
      )}
    </div>
  );
}
