'use client';

import { useEffect, useRef } from 'react';
import { Calendar, Check, Globe, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import type { ConventionFilters } from './ConventionFilterBar';

export interface ConventionFilterPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
  tab: 'upcoming' | 'past' | 'recently-ended';
  onTabChange: (tab: 'upcoming' | 'past' | 'recently-ended') => void;
  filters: ConventionFilters;
  onFilterChange: (newFilters: Partial<ConventionFilters>) => void;
  onReset: () => void;
  availableLocations: string[];
  availableYears: string[];
  counts: {
    upcoming: number;
    past: number;
    recentlyEnded: number;
  };
  filteredCount: number;
  totalCount: number;
}

export function ConventionFilterPopover({
  isOpen,
  onClose,
  triggerRef,
  tab,
  onTabChange,
  filters,
  onFilterChange,
  onReset,
  availableLocations,
  availableYears,
  counts,
  filteredCount,
  totalCount,
}: ConventionFilterPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        (!triggerRef?.current || !triggerRef.current.contains(target))
      ) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const activeFiltersCount =
    (filters.location ? 1 : 0) + (filters.year ? 1 : 0) + (tab !== 'upcoming' ? 1 : 0);

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="filter-popover-title"
      className={cn(
        'border-ink absolute top-full right-0 z-40 mt-2 flex flex-col overflow-hidden border-2 bg-white shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-900',
        'w-[340px] max-w-[calc(100vw-1.5rem)]',
        'animate-in fade-in zoom-in-95 duration-150'
      )}
    >
      {/* Header */}
      <div className="border-ink flex items-center justify-between border-b-2 bg-zinc-50 p-3 dark:bg-zinc-950">
        <div className="flex items-center gap-2">
          <div className="border-ink bg-accent flex h-6 w-6 items-center justify-center border text-white shadow-[1px_1px_0_var(--ink)] dark:text-zinc-950">
            <SlidersHorizontal className="h-3 w-3 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-1.5">
            <h3
              id="filter-popover-title"
              className="font-display text-sm tracking-wide uppercase dark:text-zinc-100"
            >
              Filters
            </h3>
            {activeFiltersCount > 0 && (
              <span className="border-ink bg-accent-soft/50 rounded-[2px] border px-1.5 py-0.5 font-mono text-[9px] font-bold text-zinc-900 uppercase dark:text-zinc-100">
                {activeFiltersCount} Active
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={cn(CONBLOCK, 'shrink-0 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800')}
          title="Close filters"
          aria-label="Close filters"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[65vh] space-y-4 overflow-y-auto p-3.5">
        {/* Section 1: Timeframe */}
        <div>
          <label className="font-display flex items-center gap-1.5 text-xs tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
            <Calendar className="h-3 w-3" />
            Timeframe
          </label>

          <div className="mt-2 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => onTabChange('upcoming')}
              className={cn(
                'border-ink flex w-full cursor-pointer items-center justify-between border-2 px-3 py-2 text-xs font-bold uppercase shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none',
                tab === 'upcoming'
                  ? 'bg-accent text-white dark:text-zinc-950'
                  : 'bg-white text-zinc-800 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700'
              )}
            >
              <span>Upcoming</span>
              <span className="flex items-center gap-1.5">
                <span className="font-mono text-[11px]">({counts.upcoming})</span>
                {tab === 'upcoming' && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('recently-ended')}
              className={cn(
                'border-ink flex w-full cursor-pointer items-center justify-between border-2 px-3 py-2 text-xs font-bold uppercase shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none',
                tab === 'recently-ended'
                  ? 'bg-accent text-white dark:text-zinc-950'
                  : 'bg-white text-zinc-800 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700'
              )}
            >
              <span>Recently Ended</span>
              <span className="flex items-center gap-1.5">
                <span className="font-mono text-[11px]">({counts.recentlyEnded})</span>
                {tab === 'recently-ended' && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('past')}
              className={cn(
                'border-ink flex w-full cursor-pointer items-center justify-between border-2 px-3 py-2 text-xs font-bold uppercase shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none',
                tab === 'past'
                  ? 'bg-accent text-white dark:text-zinc-950'
                  : 'bg-white text-zinc-800 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700'
              )}
            >
              <span>Past Cons</span>
              <span className="flex items-center gap-1.5">
                <span className="font-mono text-[11px]">({counts.past})</span>
                {tab === 'past' && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
              </span>
            </button>
          </div>
        </div>

        {/* Section 2: Location */}
        {availableLocations.length > 0 && (
          <div>
            <label
              htmlFor="filter-popover-location"
              className="font-display flex items-center gap-1.5 text-xs tracking-wider text-zinc-600 uppercase dark:text-zinc-400"
            >
              <Globe className="h-3 w-3" />
              Location
            </label>
            <div className="mt-1.5">
              <select
                id="filter-popover-location"
                value={filters.location}
                onChange={(e) => onFilterChange({ location: e.target.value })}
                className="border-ink h-10 w-full cursor-pointer border-2 bg-white px-2.5 text-xs font-bold uppercase shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none focus:outline-none dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">All Locations ({availableLocations.length})</option>
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Section 3: Year */}
        {availableYears.length > 0 && (
          <div>
            <label
              htmlFor="filter-popover-year"
              className="font-display flex items-center gap-1.5 text-xs tracking-wider text-zinc-600 uppercase dark:text-zinc-400"
            >
              <Calendar className="h-3 w-3" />
              Year
            </label>
            <div className="mt-1.5">
              <select
                id="filter-popover-year"
                value={filters.year}
                onChange={(e) => onFilterChange({ year: e.target.value })}
                className="border-ink h-10 w-full cursor-pointer border-2 bg-white px-2.5 text-xs font-bold uppercase shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none focus:outline-none dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">All Years ({availableYears.length})</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-ink flex items-center justify-between gap-2 border-t-2 bg-zinc-50 p-2.5 sm:p-3 dark:bg-zinc-950">
        <span className="font-mono text-[11px] font-bold tracking-tight whitespace-nowrap text-zinc-500 uppercase dark:text-zinc-400">
          {filteredCount} of {totalCount} cons
        </span>

        <div className="flex shrink-0 items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={onReset}
            title="Reset filters"
            aria-label="Reset filters"
            className={cn(
              CONBLOCK,
              'inline-flex h-8 shrink-0 items-center gap-1 bg-white px-2 text-[11px] font-bold whitespace-nowrap uppercase hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
            )}
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className={cn(
              CONBLOCK_PRIMARY,
              'inline-flex h-8 shrink-0 items-center justify-center gap-1 px-2.5 text-[11px] font-bold whitespace-nowrap uppercase'
            )}
          >
            Show {filteredCount} {filteredCount === 1 ? 'Con' : 'Cons'}
          </button>
        </div>
      </div>
    </div>
  );
}
