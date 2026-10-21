'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Check, Globe, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import type { ConventionFilters } from './ConventionFilterBar';

export interface ConventionFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
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

export function ConventionFilterDrawer({
  isOpen,
  onClose,
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
}: ConventionFilterDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll & listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const activeFiltersCount =
    (filters.location ? 1 : 0) + (filters.year ? 1 : 0) + (tab !== 'upcoming' ? 1 : 0);

  return createPortal(
    <div
      role="dialog"
      aria-modal={isOpen}
      aria-labelledby="filter-drawer-title"
      className={cn(
        'fixed inset-0 z-50 flex justify-end',
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      )}
    >
      {/* Backdrop matching ConventionSidebar */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          'bg-ink/40 fixed inset-0 transition-opacity duration-300 ease-in-out',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      {/* Drawer Container matching ConventionSidebar drawer transition */}
      <div
        className={cn(
          'border-ink relative z-10 flex h-full max-h-[100dvh] w-[85vw] max-w-sm flex-col border-l-2 bg-white transition-transform duration-300 ease-in-out sm:w-full sm:max-w-md dark:bg-zinc-900',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="border-ink flex items-center justify-between border-b-2 p-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="border-ink bg-accent flex h-8 w-8 items-center justify-center border-2 text-white shadow-[2px_2px_0_var(--ink)] dark:text-zinc-950">
              <SlidersHorizontal className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="filter-drawer-title"
                  className="font-display text-base tracking-wide uppercase sm:text-lg dark:text-zinc-100"
                >
                  Filters
                </h2>
                {activeFiltersCount > 0 && (
                  <span className="border-ink bg-accent-soft/50 rounded-[2px] border px-1.5 py-0.5 font-mono text-[10px] font-bold text-zinc-900 uppercase dark:text-zinc-100">
                    {activeFiltersCount} Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Showing {filteredCount} of {totalCount} conventions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={cn(CONBLOCK, 'shrink-0 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800')}
            title="Close filters"
            aria-label="Close filters"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
          {/* Section 1: Timeframe */}
          <div>
            <label className="font-display flex items-center gap-2 text-xs tracking-wider text-zinc-600 uppercase dark:text-zinc-400">
              <Calendar className="h-3.5 w-3.5" />
              Timeframe
            </label>

            <div className="mt-2.5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onTabChange('upcoming')}
                className={cn(
                  'border-ink flex w-full cursor-pointer items-center justify-between border-2 px-3 py-2.5 text-xs font-bold uppercase shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none sm:px-3.5',
                  tab === 'upcoming'
                    ? 'bg-accent text-white dark:text-zinc-950'
                    : 'bg-white text-zinc-800 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700'
                )}
              >
                <span>Upcoming</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px]">({counts.upcoming})</span>
                  {tab === 'upcoming' && <Check className="h-4 w-4 stroke-[2.5]" />}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('recently-ended')}
                className={cn(
                  'border-ink flex w-full cursor-pointer items-center justify-between border-2 px-3 py-2.5 text-xs font-bold uppercase shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none sm:px-3.5',
                  tab === 'recently-ended'
                    ? 'bg-accent text-white dark:text-zinc-950'
                    : 'bg-white text-zinc-800 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700'
                )}
              >
                <span>Recently Ended</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px]">({counts.recentlyEnded})</span>
                  {tab === 'recently-ended' && <Check className="h-4 w-4 stroke-[2.5]" />}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('past')}
                className={cn(
                  'border-ink flex w-full cursor-pointer items-center justify-between border-2 px-3 py-2.5 text-xs font-bold uppercase shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none sm:px-3.5',
                  tab === 'past'
                    ? 'bg-accent text-white dark:text-zinc-950'
                    : 'bg-white text-zinc-800 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700'
                )}
              >
                <span>Past Cons</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px]">({counts.past})</span>
                  {tab === 'past' && <Check className="h-4 w-4 stroke-[2.5]" />}
                </span>
              </button>
            </div>
          </div>

          {/* Section 2: Location */}
          {availableLocations.length > 0 && (
            <div>
              <label
                htmlFor="filter-drawer-location"
                className="font-display flex items-center gap-2 text-xs tracking-wider text-zinc-600 uppercase dark:text-zinc-400"
              >
                <Globe className="h-3.5 w-3.5" />
                Location
              </label>
              <div className="mt-2.5">
                <select
                  id="filter-drawer-location"
                  value={filters.location}
                  onChange={(e) => onFilterChange({ location: e.target.value })}
                  className="border-ink h-11 w-full cursor-pointer border-2 bg-white px-3 text-xs font-bold uppercase shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none focus:outline-none dark:bg-zinc-800 dark:text-zinc-100"
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
                htmlFor="filter-drawer-year"
                className="font-display flex items-center gap-2 text-xs tracking-wider text-zinc-600 uppercase dark:text-zinc-400"
              >
                <Calendar className="h-3.5 w-3.5" />
                Year
              </label>
              <div className="mt-2.5">
                <select
                  id="filter-drawer-year"
                  value={filters.year}
                  onChange={(e) => onFilterChange({ year: e.target.value })}
                  className="border-ink h-11 w-full cursor-pointer border-2 bg-white px-3 text-xs font-bold uppercase shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none focus:outline-none dark:bg-zinc-800 dark:text-zinc-100"
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

        {/* Drawer Footer (Sticky Actions - Right Aligned & Fit Content) */}
        <div className="border-ink flex items-center justify-end gap-2.5 border-t-2 bg-zinc-50 p-4 sm:gap-3 sm:px-6 dark:bg-zinc-950">
          <button
            type="button"
            onClick={onReset}
            title="Reset filters"
            aria-label="Reset filters"
            className={cn(
              CONBLOCK,
              'inline-flex h-10 shrink-0 items-center gap-1.5 bg-white px-3 text-xs font-bold whitespace-nowrap uppercase hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
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
              'inline-flex h-10 shrink-0 items-center justify-center gap-1.5 px-3.5 text-xs font-bold whitespace-nowrap uppercase sm:px-4'
            )}
          >
            Show {filteredCount} {filteredCount === 1 ? 'Con' : 'Cons'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
