'use client';

import { useEffect, useRef, useState } from 'react';
import { Bookmark, Check, Gift, LayoutGrid, RotateCw, Rows3, UploadCloud } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { CONBLOCK, FilterTab, SearchInput } from '@/shared/components/ui';
import { useHorizontalScrollAffordance } from '@/shared/hooks';
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
    refreshBoard,
    refreshStatus,
  } = state;

  const tabsRef = useRef<HTMLDivElement>(null);
  const [tabsWidth, setTabsWidth] = useState<number | null>(null);

  const { maskStyle: tabsMaskStyle } = useHorizontalScrollAffordance({ ref: tabsRef });
  const { ref: controlsRef, maskStyle: controlsMaskStyle } = useHorizontalScrollAffordance();

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;

    const update = () => {
      const children = Array.from(el.children) as HTMLElement[];
      if (children.length > 0) {
        const first = children[0].getBoundingClientRect();
        const last = children[children.length - 1].getBoundingClientRect();
        const w = Math.round(last.right - first.left + el.scrollLeft);
        if (w > 0) {
          setTabsWidth(w);
          return;
        }
      }
      if (el.scrollWidth > 0) {
        setTabsWidth(el.scrollWidth);
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    Array.from(el.children).forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="border-ink @container flex flex-col gap-3 border-b-2 pb-5">
      {/* Row 1: Filter Tabs */}
      <div
        ref={tabsRef}
        style={tabsMaskStyle}
        className="flex shrink-0 scrollbar-none items-center gap-1.5 overflow-x-auto pb-0.5 sm:gap-2"
      >
        <FilterTab
          isActive={activeTab === 'all'}
          onClick={() => handleTabClick('all')}
          title={`All Freebies (${counts.all})`}
          ariaLabel={`All Freebies (${counts.all})`}
          label="All"
          count={counts.all}
          icon={
            <Gift
              className={cn(
                'h-4 w-4 shrink-0',
                activeTab === 'all'
                  ? 'stroke-[2.5]'
                  : 'stroke-2 text-zinc-800 group-hover:text-black dark:text-white'
              )}
            />
          }
        />

        <FilterTab
          isActive={activeTab === 'saved'}
          onClick={() => handleTabClick('saved')}
          title={`Saved Freebies (${counts.saved})`}
          ariaLabel={`Saved Freebies (${counts.saved})`}
          label={
            <span>
              <span className="hidden sm:inline">My </span>Saved
            </span>
          }
          count={counts.saved}
          icon={
            <Bookmark
              className={cn(
                'h-4 w-4 shrink-0',
                activeTab === 'saved'
                  ? 'fill-current stroke-[2.5]'
                  : 'stroke-2 text-zinc-800 group-hover:text-black dark:text-white'
              )}
            />
          }
        />

        <FilterTab
          isActive={activeTab === 'uploaded'}
          onClick={() => handleTabClick('uploaded')}
          title={`My Uploads (${counts.uploaded})`}
          ariaLabel={`My Uploads (${counts.uploaded})`}
          label={
            <span>
              <span className="hidden sm:inline">My </span>Uploads
            </span>
          }
          count={counts.uploaded}
          icon={
            <UploadCloud
              className={cn(
                'h-4 w-4 shrink-0',
                activeTab === 'uploaded'
                  ? 'stroke-[2.5]'
                  : 'stroke-2 text-zinc-800 group-hover:text-black dark:text-white'
              )}
            />
          }
        />
      </div>

      {/* Row 2: Search & Controls - sized to match tabs above it, wraps to own row when needed, shrinks on mobile */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        {/* Search Box - matches tabs width, wraps to own row when needed, shrinks on mobile */}
        <div
          style={tabsWidth ? { width: `${tabsWidth}px` } : undefined}
          className="relative w-full max-w-full shrink-0"
        >
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            isLoading={Boolean(isFetching && debouncedSearch)}
            placeholder={
              activeTab === 'saved'
                ? 'Search saved freebies, booths...'
                : activeTab === 'uploaded'
                  ? 'Search your uploaded freebies...'
                  : 'Search items, booths...'
            }
          />
        </div>

        {/* Controls Cluster: Vendor Filter, View Density Toggle, and Refresh */}
        <div
          ref={controlsRef}
          style={controlsMaskStyle}
          className="flex w-full max-w-full min-w-0 scrollbar-none items-center gap-1.5 overflow-x-auto pr-3 pb-0.5 sm:w-auto sm:gap-2"
        >
          {/* Vendor Filter */}
          {vendors && vendors.length > 0 ? (
            <select
              value={selectedVendor ?? ''}
              onChange={(e) =>
                setSelectedVendor(e.target.value ? Number(e.target.value) : undefined)
              }
              aria-label="Filter by vendor"
              className="border-ink h-10 max-w-[150px] shrink-0 cursor-pointer border-2 bg-white px-3 text-xs font-bold uppercase shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none focus:outline-none sm:max-w-[180px] dark:bg-zinc-900"
            >
              <option value="">All Vendors ({vendors.length})</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          ) : null}

          {/* View Density Buttons (Separated with individual CONBLOCK hover) */}
          <button
            type="button"
            onClick={() => allCondensed && handleToggleAllCondensed()}
            aria-label="Card view"
            title="Card view (expanded)"
            className={cn(
              CONBLOCK,
              'inline-flex h-10 w-10 shrink-0 items-center justify-center transition-colors',
              !allCondensed
                ? 'bg-accent text-white dark:text-zinc-950'
                : 'bg-white text-zinc-700 hover:bg-zinc-100 hover:text-black dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
            )}
          >
            <LayoutGrid className="h-4 w-4 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={() => !allCondensed && handleToggleAllCondensed()}
            aria-label="Compact view"
            title="Compact view (condensed)"
            className={cn(
              CONBLOCK,
              'inline-flex h-10 w-10 shrink-0 items-center justify-center transition-colors',
              allCondensed
                ? 'bg-accent text-white dark:text-zinc-950'
                : 'bg-white text-zinc-700 hover:bg-zinc-100 hover:text-black dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
            )}
          >
            <Rows3 className="h-4 w-4 stroke-[2.5]" />
          </button>

          {/* Compact Refresh Board Button */}
          <button
            type="button"
            onClick={() => refreshBoard()}
            disabled={refreshStatus !== 'idle'}
            title={
              refreshStatus === 'success'
                ? 'Freebies synced!'
                : refreshStatus === 'refreshing'
                  ? 'Syncing freebies…'
                  : 'Refresh freebies board'
            }
            aria-label="Refresh freebies board"
            className={cn(
              'border-ink inline-flex h-10 w-10 shrink-0 items-center justify-center border-2 bg-white shadow-[2px_2px_0_var(--ink)] transition-all dark:bg-zinc-900',
              refreshStatus === 'idle'
                ? 'cursor-pointer text-zinc-900 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-zinc-50 hover:shadow-none dark:text-white dark:hover:bg-zinc-800'
                : refreshStatus === 'success'
                  ? 'cursor-default bg-emerald-50 dark:bg-emerald-950/30'
                  : 'cursor-not-allowed opacity-75'
            )}
          >
            {refreshStatus === 'success' ? (
              <Check className="animate-pill-pop h-4 w-4 stroke-[2.5] text-emerald-600 dark:text-emerald-400" />
            ) : refreshStatus === 'refreshing' ? (
              <RotateCw className="h-4 w-4 animate-spin stroke-[2.5]" />
            ) : (
              <RotateCw className="h-4 w-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
