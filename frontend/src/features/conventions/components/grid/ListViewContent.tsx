'use client';

import { ConventionRow } from './ConventionRow';
import type { Convention, ConventionPhase } from '../../types';
import { CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export interface ConventionGroup {
  phase: ConventionPhase;
  label: string;
  chipClassName: string;
  conventions: Convention[];
}

export interface ListViewContentProps {
  tab: 'upcoming' | 'past' | 'recently-ended';
  upcomingSections: ConventionGroup[];
  pastConventions: Convention[];
  recentlyEndedConventions: Convention[];
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  className?: string;
}

function FilterEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="border-ink mt-8 border-2 border-dashed bg-white p-8 text-center sm:p-12 dark:bg-zinc-900">
      <p className="font-display text-sm tracking-wide uppercase sm:text-base">
        No conventions match your filters
      </p>
      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
        Try searching for a different keyword or resetting your filters.
      </p>
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={onReset}
          className={cn(CONBLOCK_PRIMARY, 'px-5 py-2 text-xs')}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}

export function ListViewContent({
  tab,
  upcomingSections,
  pastConventions,
  recentlyEndedConventions,
  hasActiveFilters,
  onResetFilters,
  className,
}: ListViewContentProps) {
  if (tab === 'upcoming') {
    return (
      <div className={cn('mt-6', className)}>
        {hasActiveFilters && upcomingSections.length === 0 ? (
          <FilterEmptyState onReset={onResetFilters} />
        ) : upcomingSections.length === 0 ? (
          <p className="border-ink mt-12 border-b-2 border-dashed px-2 py-6 text-center text-zinc-500 dark:border-zinc-600 dark:text-zinc-300">
            No upcoming conventions listed right now — check back soon!
          </p>
        ) : (
          upcomingSections.map((group, index) => (
            <div key={group.phase} className={cn('border-ink', index > 0 && 'mt-8 border-t-2')}>
              <h3
                className={cn(
                  'font-display flex items-center gap-3 text-lg tracking-wide uppercase',
                  index === 0 ? 'mt-6' : 'mt-10'
                )}
              >
                <span
                  className={`${group.chipClassName} inline-flex items-center px-2 py-1 text-xs`}
                >
                  {group.label}
                </span>
              </h3>
              <div className="mt-4">
                {group.conventions.map((convention) => (
                  <ConventionRow key={convention.id} convention={convention} phase={group.phase} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  if (tab === 'past') {
    return (
      <div className={cn('mt-6', className)}>
        {hasActiveFilters && pastConventions.length === 0 ? (
          <FilterEmptyState onReset={onResetFilters} />
        ) : pastConventions.length === 0 ? (
          <p className="border-ink mt-12 border-b-2 border-dashed px-2 py-6 text-center text-zinc-500 dark:border-zinc-600 dark:text-zinc-300">
            No past conventions listed yet.
          </p>
        ) : (
          <div className="border-ink">
            <h3 className="font-display mt-6 flex items-center gap-3 text-lg tracking-wide uppercase">
              <span className="border-2 border-zinc-400 bg-zinc-200 px-2 py-1 text-xs text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                ENDED CONVENTIONS
              </span>
            </h3>
            <div className="mt-4">
              {pastConventions.map((convention) => (
                <ConventionRow key={convention.id} convention={convention} phase="past" />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // tab === 'recently-ended'
  return (
    <div className={cn('mt-6', className)}>
      {hasActiveFilters && recentlyEndedConventions.length === 0 ? (
        <FilterEmptyState onReset={onResetFilters} />
      ) : recentlyEndedConventions.length === 0 ? (
        <p className="border-ink mt-12 border-b-2 border-dashed px-2 py-6 text-center text-zinc-500 dark:border-zinc-600 dark:text-zinc-300">
          No conventions ended in the last 30 days.
        </p>
      ) : (
        <div className="border-ink">
          <h3 className="font-display mt-6 flex items-center gap-3 text-lg tracking-wide uppercase">
            <span className="border-2 border-zinc-400 bg-zinc-200 px-2 py-1 text-xs text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              RECENTLY ENDED (LAST 30 DAYS)
            </span>
          </h3>
          <div className="mt-4">
            {recentlyEndedConventions.map((convention) => (
              <ConventionRow key={convention.id} convention={convention} phase="past" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
