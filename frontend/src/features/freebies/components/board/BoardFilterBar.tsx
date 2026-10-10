'use client';

import { Bookmark, Gift, LayoutGrid, Loader2, Rows3, Search, UploadCloud, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { FreebieBoardState } from './types';

interface BoardFilterBarProps {
  state: FreebieBoardState;
}

export function BoardFilterBar({ state }: BoardFilterBarProps) {
  const {
    activeTab,
    handleTabClick,
    counts,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    isFetching,
    vendors,
    selectedVendor,
    setSelectedVendor,
    allCondensed,
    handleToggleAllCondensed,
  } = state;

  return (
    <div className="border-ink flex flex-col gap-3 border-b-2 pb-5 lg:flex-row lg:items-center lg:justify-between">
      {/* Filter Tabs - Neo-Brutalist Block Buttons */}
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        {/* All Freebies */}
        <button
          type="button"
          onClick={() => handleTabClick('all')}
          className={cn(
            'group inline-flex min-w-[calc(50%-0.25rem)] flex-1 cursor-pointer items-center justify-center gap-1.5 px-3 py-2 text-center text-xs font-bold uppercase transition-all sm:min-w-0 sm:flex-initial sm:px-4 sm:py-2.5',
            activeTab === 'all'
              ? 'border-ink bg-accent dark:bg-accent border-2 text-white shadow-[3px_3px_0_var(--ink)] dark:text-zinc-950'
              : 'border-ink border-2 bg-white text-zinc-800 shadow-[2px_2px_0_var(--ink)] hover:-translate-y-0.5 hover:bg-zinc-50 hover:text-black hover:shadow-[3px_3px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--ink)] dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
          )}
        >
          <Gift
            className={cn(
              'h-4 w-4 shrink-0',
              activeTab === 'all'
                ? 'stroke-[2.5]'
                : 'stroke-2 text-zinc-800 group-hover:text-black dark:text-white'
            )}
          />
          <span>All</span>
          <span
            className={cn(
              'ml-0.5 inline-flex items-center justify-center rounded-[2px] px-1.5 py-0.5 font-mono text-[10px] leading-none font-bold',
              activeTab === 'all'
                ? 'border border-white/40 bg-white/20 text-white dark:border-black/30 dark:bg-black/20 dark:text-zinc-950'
                : 'border-ink/20 border bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
            )}
          >
            {counts.all}
          </span>
        </button>

        {/* Saved Freebies */}
        <button
          type="button"
          onClick={() => handleTabClick('saved')}
          className={cn(
            'group inline-flex min-w-[calc(50%-0.25rem)] flex-1 cursor-pointer items-center justify-center gap-1.5 px-3 py-2 text-center text-xs font-bold uppercase transition-all sm:min-w-0 sm:flex-initial sm:px-4 sm:py-2.5',
            activeTab === 'saved'
              ? 'border-ink bg-accent dark:bg-accent border-2 text-white shadow-[3px_3px_0_var(--ink)] dark:text-zinc-950'
              : 'border-ink border-2 bg-white text-zinc-800 shadow-[2px_2px_0_var(--ink)] hover:-translate-y-0.5 hover:bg-zinc-50 hover:text-black hover:shadow-[3px_3px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--ink)] dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
          )}
        >
          <Bookmark
            className={cn(
              'h-4 w-4 shrink-0',
              activeTab === 'saved'
                ? 'fill-current stroke-[2.5]'
                : 'stroke-2 text-zinc-800 group-hover:text-black dark:text-white'
            )}
          />
          <span>
            <span className="hidden md:inline">My </span>Saved
          </span>
          <span
            className={cn(
              'ml-0.5 inline-flex items-center justify-center rounded-[2px] px-1.5 py-0.5 font-mono text-[10px] leading-none font-bold',
              activeTab === 'saved'
                ? 'border border-white/40 bg-white/20 text-white dark:border-black/30 dark:bg-black/20 dark:text-zinc-950'
                : 'border-ink/20 border bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
            )}
          >
            {counts.saved}
          </span>
        </button>

        {/* Uploaded Freebies */}
        <button
          type="button"
          onClick={() => handleTabClick('uploaded')}
          className={cn(
            'group inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 px-3 py-2 text-center text-xs font-bold uppercase transition-all sm:flex-initial sm:px-4 sm:py-2.5',
            activeTab === 'uploaded'
              ? 'border-ink bg-accent dark:bg-accent border-2 text-white shadow-[3px_3px_0_var(--ink)] dark:text-zinc-950'
              : 'border-ink border-2 bg-white text-zinc-800 shadow-[2px_2px_0_var(--ink)] hover:-translate-y-0.5 hover:bg-zinc-50 hover:text-black hover:shadow-[3px_3px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--ink)] dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
          )}
        >
          <UploadCloud
            className={cn(
              'h-4 w-4 shrink-0',
              activeTab === 'uploaded'
                ? 'stroke-[2.5]'
                : 'stroke-2 text-zinc-800 group-hover:text-black dark:text-white'
            )}
          />
          <span>
            <span className="hidden md:inline">My </span>Uploads
          </span>
          <span
            className={cn(
              'ml-0.5 inline-flex items-center justify-center rounded-[2px] px-1.5 py-0.5 font-mono text-[10px] leading-none font-bold',
              activeTab === 'uploaded'
                ? 'border border-white/40 bg-white/20 text-white dark:border-black/30 dark:bg-black/20 dark:text-zinc-950'
                : 'border-ink/20 border bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
            )}
          >
            {counts.uploaded}
          </span>
        </button>
      </div>

      {/* Search, Vendor Filter, and Density Toggle */}
      <div className="flex flex-1 flex-wrap items-center gap-2.5 sm:flex-nowrap lg:max-w-xl">
        {/* Search Box */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 dark:text-zinc-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'saved'
                ? 'Search saved freebies, booths...'
                : activeTab === 'uploaded'
                  ? 'Search your uploaded freebies...'
                  : 'Search items, booths...'
            }
            className="border-ink h-10 w-full border-2 bg-white pr-9 pl-9 text-xs font-medium text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
          />
          {isFetching && debouncedSearch ? (
            <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            </div>
          ) : searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer p-0.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        {/* Vendor Filter */}
        {vendors && vendors.length > 0 ? (
          <select
            value={selectedVendor ?? ''}
            onChange={(e) => setSelectedVendor(e.target.value ? Number(e.target.value) : undefined)}
            aria-label="Filter by vendor"
            className="border-ink h-10 cursor-pointer border-2 bg-white px-3 text-xs font-bold uppercase focus:outline-none dark:bg-zinc-900"
          >
            <option value="">All Vendors ({vendors.length})</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        ) : null}

        {/* View Density Segmented Toggle (Cards vs Condensed) */}
        <div
          className="border-ink inline-flex h-10 shrink-0 items-stretch border-2 bg-white shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-900"
          role="group"
          aria-label="View density"
        >
          <button
            type="button"
            onClick={() => allCondensed && handleToggleAllCondensed()}
            aria-label="Card view"
            title="Card view (expanded)"
            className={cn(
              'flex h-full w-10 cursor-pointer items-center justify-center transition-colors',
              !allCondensed
                ? 'bg-accent text-white dark:text-zinc-950'
                : 'text-zinc-700 hover:bg-zinc-100 hover:text-black dark:text-white dark:hover:bg-zinc-800'
            )}
          >
            <LayoutGrid className="h-4 w-4 stroke-[2.5]" />
          </button>
          <div className="border-ink border-r-2" />
          <button
            type="button"
            onClick={() => !allCondensed && handleToggleAllCondensed()}
            aria-label="Compact view"
            title="Compact view (condensed)"
            className={cn(
              'flex h-full w-10 cursor-pointer items-center justify-center transition-colors',
              allCondensed
                ? 'bg-accent text-white dark:text-zinc-950'
                : 'text-zinc-700 hover:bg-zinc-100 hover:text-black dark:text-white dark:hover:bg-zinc-800'
            )}
          >
            <Rows3 className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
