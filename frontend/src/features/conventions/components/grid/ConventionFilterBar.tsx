'use client';

import { RotateCcw, Search, X } from 'lucide-react';
import { CONBLOCK } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export interface ConventionFilters {
  query: string;
  location: string;
  year: string;
}

export interface ConventionFilterBarProps {
  filters: ConventionFilters;
  onFilterChange: (newFilters: Partial<ConventionFilters>) => void;
  onReset: () => void;
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
  availableLocations,
  availableYears,
  filteredCount,
  totalCount,
  className,
}: ConventionFilterBarProps) {
  const hasActiveFilters = Boolean(filters.query || filters.location || filters.year);

  return (
    <div className={cn('mt-3 flex flex-col gap-2.5 sm:mt-4', className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => onFilterChange({ query: e.target.value })}
            placeholder="Search by name, city, venue..."
            aria-label="Search conventions"
            className="border-ink h-8.5 w-full border-2 bg-white pr-7 pl-8 text-[11px] font-medium text-zinc-900 placeholder:text-zinc-500 focus:outline-none sm:h-9 sm:text-xs dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => onFilterChange({ query: '' })}
              className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer p-0.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Dropdowns (Side-by-side on mobile, inline on desktop) */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          {/* Location Dropdown */}
          {availableLocations.length > 0 && (
            <select
              value={filters.location}
              onChange={(e) => onFilterChange({ location: e.target.value })}
              aria-label="Filter by location"
              className="border-ink h-8.5 w-full cursor-pointer truncate border-2 bg-white px-2 text-[10.5px] font-bold uppercase shadow-[1.5px_1.5px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none focus:outline-none sm:h-9 sm:w-auto sm:px-3 sm:text-xs dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Locations</option>
              {availableLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          )}

          {/* Year Dropdown */}
          {availableYears.length > 0 && (
            <select
              value={filters.year}
              onChange={(e) => onFilterChange({ year: e.target.value })}
              aria-label="Filter by year"
              className="border-ink h-8.5 w-full cursor-pointer border-2 bg-white px-2 text-[10.5px] font-bold uppercase shadow-[1.5px_1.5px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none focus:outline-none sm:h-9 sm:w-auto sm:px-3 sm:text-xs dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">All Years</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Reset Button (on desktop sits in line) */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className={cn(
              CONBLOCK,
              'font-display hidden h-8.5 shrink-0 cursor-pointer items-center gap-1.5 bg-white px-2.5 text-[10.5px] tracking-wider whitespace-nowrap text-zinc-800 uppercase hover:bg-zinc-100 hover:text-black sm:inline-flex sm:h-9 sm:px-3 sm:text-xs dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800'
            )}
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Mobile Active Filters Row: Reset & Stats */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <button
            type="button"
            onClick={onReset}
            className={cn(
              CONBLOCK,
              'font-display inline-flex h-7.5 cursor-pointer items-center gap-1 bg-white px-2 text-[10px] tracking-wider whitespace-nowrap text-zinc-800 uppercase hover:bg-zinc-100 hover:text-black sm:hidden dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800'
            )}
          >
            <RotateCcw className="h-2.5 w-2.5" />
            <span>Reset Filters</span>
          </button>

          <span className="font-display text-[10px] font-bold tracking-wider text-zinc-500 uppercase sm:ml-auto sm:text-[11px] dark:text-zinc-400">
            Showing {filteredCount} of {totalCount}
          </span>
        </div>
      )}
    </div>
  );
}
