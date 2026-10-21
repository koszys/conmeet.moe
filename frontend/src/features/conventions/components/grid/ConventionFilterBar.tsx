'use client';

import { useState } from 'react';
import { RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { CONBLOCK } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { ConventionFilterDrawer } from './ConventionFilterDrawer';

export interface ConventionFilters {
  query: string;
  location: string;
  year: string;
}

export interface ConventionFilterBarProps {
  filters: ConventionFilters;
  onFilterChange: (newFilters: Partial<ConventionFilters>) => void;
  onReset: () => void;
  tab: 'upcoming' | 'past' | 'recently-ended';
  onTabChange: (tab: 'upcoming' | 'past' | 'recently-ended') => void;
  counts: {
    upcoming: number;
    past: number;
    recentlyEnded: number;
  };
  availableLocations: string[];
  availableYears: string[];
  filteredCount: number;
  totalCount: number;
  className?: string;
}

export function ConventionFilterBar({
  filters,
  onFilterChange,
  onReset,
  tab,
  onTabChange,
  counts,
  availableLocations,
  availableYears,
  filteredCount,
  totalCount,
  className,
}: ConventionFilterBarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const activeFiltersCount =
    (filters.location ? 1 : 0) + (filters.year ? 1 : 0) + (tab !== 'upcoming' ? 1 : 0);

  const hasActiveFilters = Boolean(
    filters.query || filters.location || filters.year || tab !== 'upcoming'
  );

  return (
    <div className={cn('mt-3 flex flex-col gap-2.5 sm:mt-4', className)}>
      {/* Main Single Row: Search Input & Unified Filter Button */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Search Input */}
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => onFilterChange({ query: e.target.value })}
            placeholder="Search by name, city, venue..."
            aria-label="Search conventions"
            className="border-ink h-10 w-full border-2 bg-white pr-8 pl-9 text-xs font-medium text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => onFilterChange({ query: '' })}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer p-0.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Unified Filter Button */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          title="Open filters"
          aria-label="Open filters"
          className={cn(
            CONBLOCK,
            'inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 px-3 text-xs font-bold whitespace-nowrap uppercase shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none sm:px-4',
            activeFiltersCount > 0
              ? 'bg-accent text-white dark:text-zinc-950'
              : 'bg-white text-zinc-800 hover:bg-zinc-50 hover:text-black dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span
              className={cn(
                'ml-0.5 inline-flex items-center justify-center rounded-[2px] px-1.5 py-0.5 font-mono text-[10px] leading-none font-bold',
                'border border-white/40 bg-white/20 text-white dark:border-black/30 dark:bg-black/20 dark:text-zinc-950'
              )}
            >
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Active Filters Row: Reset & Stats */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2.5 pt-0.5">
          <button
            type="button"
            onClick={onReset}
            title="Reset filters"
            aria-label="Reset filters"
            className={cn(
              CONBLOCK,
              'font-display inline-flex h-6.5 cursor-pointer items-center gap-1 bg-white px-2 text-[9.5px] tracking-wider whitespace-nowrap text-zinc-800 uppercase hover:bg-zinc-100 hover:text-black dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800'
            )}
          >
            <RotateCcw className="h-2.5 w-2.5" />
            <span>Reset</span>
          </button>

          <span className="font-display text-[10.5px] font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
            Showing {filteredCount} of {totalCount}
          </span>
        </div>
      )}

      {/* Filter Drawer / Modal */}
      <ConventionFilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        tab={tab}
        onTabChange={onTabChange}
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onReset}
        availableLocations={availableLocations}
        availableYears={availableYears}
        counts={counts}
        filteredCount={filteredCount}
        totalCount={totalCount}
      />
    </div>
  );
}
