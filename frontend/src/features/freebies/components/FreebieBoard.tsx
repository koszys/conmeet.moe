'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Bookmark, CheckSquare, Gift, Loader2, Plus, Search, X } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { useDebounce } from '@/shared/hooks';
import { cn } from '@/shared/lib/utils';
import { useFreebies, useVendors } from '../api/queries';
import { FreebieCard } from './FreebieCard';
import { FreebieSkeleton } from './FreebieSkeleton';

type FilterTab = 'all' | 'saved' | 'unclaimed';

export function FreebieBoard({
  conventionSlug,
  conventionName,
}: {
  conventionSlug: string;
  conventionName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedVendor, setSelectedVendor] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Queries
  const {
    data: allFreebies,
    isLoading,
    isFetching,
    isError,
  } = useFreebies({
    convention: conventionSlug,
    vendor: selectedVendor,
    q: debouncedSearch.trim() || undefined,
  });

  const { data: vendors } = useVendors(conventionSlug);

  function handleTabClick(tab: FilterTab) {
    if ((tab === 'saved' || tab === 'unclaimed') && !user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setActiveTab(tab);
  }

  const counts = useMemo(() => {
    if (!allFreebies) return { all: 0, saved: 0, unclaimed: 0 };
    return {
      all: allFreebies.length,
      saved: allFreebies.filter((f) => f.is_saved).length,
      unclaimed: allFreebies.filter((f) => f.is_saved && !f.is_claimed).length,
    };
  }, [allFreebies]);

  const displayedFreebies = useMemo(() => {
    if (!allFreebies) return [];
    if (activeTab === 'saved') {
      return allFreebies.filter((f) => f.is_saved);
    }
    if (activeTab === 'unclaimed') {
      return allFreebies.filter((f) => f.is_saved && !f.is_claimed);
    }
    return allFreebies;
  }, [allFreebies, activeTab]);

  return (
    <div className="space-y-6">
      {/* Top Navigation & Header */}
      <div className="border-ink border-b-2 pb-5">
        <Link
          href={`/conventions/${conventionSlug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-zinc-600 uppercase hover:underline dark:text-zinc-400"
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
              <h1 className="font-display text-2xl tracking-wide uppercase sm:text-3xl">
                Freebies
              </h1>
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
            <Plus className="h-4 w-4 stroke-[3]" />
            Post a Freebie
          </Link>
        </div>
      </div>

      {/* Filter Bar & Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Filter Tabs - Neo-Brutalist Block Buttons */}
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {/* All Drops */}
          <button
            type="button"
            onClick={() => handleTabClick('all')}
            className={cn(
              'group inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 px-3 py-2 text-center text-xs font-bold uppercase transition-all sm:flex-initial sm:px-4 sm:py-2.5',
              activeTab === 'all'
                ? 'border-ink bg-accent dark:bg-accent border-2 text-white shadow-[3px_3px_0_var(--ink)] dark:text-zinc-950'
                : 'border-ink border-2 bg-white text-zinc-700 shadow-[2px_2px_0_var(--ink)] hover:-translate-y-0.5 hover:bg-zinc-50 hover:text-black hover:shadow-[3px_3px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--ink)] dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white'
            )}
          >
            <Gift
              className={cn(
                'h-4 w-4 shrink-0',
                activeTab === 'all'
                  ? 'stroke-[2.5]'
                  : 'stroke-2 text-zinc-500 group-hover:text-black dark:text-zinc-400 dark:group-hover:text-white'
              )}
            />
            <span>
              All<span className="hidden sm:inline"> Drops</span>
            </span>
            <span
              className={cn(
                'ml-0.5 inline-flex items-center justify-center rounded-[2px] px-1.5 py-0.5 font-mono text-[10px] leading-none font-bold',
                activeTab === 'all'
                  ? 'border border-white/40 bg-white/20 text-white dark:border-black/30 dark:bg-black/20 dark:text-zinc-950'
                  : 'border-ink/20 border bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
              )}
            >
              {counts.all}
            </span>
          </button>

          {/* Saved */}
          <button
            type="button"
            onClick={() => handleTabClick('saved')}
            className={cn(
              'group inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 px-3 py-2 text-center text-xs font-bold uppercase transition-all sm:flex-initial sm:px-4 sm:py-2.5',
              activeTab === 'saved'
                ? 'border-ink bg-accent dark:bg-accent border-2 text-white shadow-[3px_3px_0_var(--ink)] dark:text-zinc-950'
                : 'border-ink border-2 bg-white text-zinc-700 shadow-[2px_2px_0_var(--ink)] hover:-translate-y-0.5 hover:bg-zinc-50 hover:text-black hover:shadow-[3px_3px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--ink)] dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white'
            )}
          >
            <Bookmark
              className={cn(
                'h-4 w-4 shrink-0',
                activeTab === 'saved'
                  ? 'fill-current stroke-[2.5]'
                  : 'stroke-2 text-zinc-500 group-hover:text-black dark:text-zinc-400 dark:group-hover:text-white'
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
                  : 'border-ink/20 border bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
              )}
            >
              {counts.saved}
            </span>
          </button>

          {/* Unclaimed */}
          <button
            type="button"
            onClick={() => handleTabClick('unclaimed')}
            className={cn(
              'group inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 px-3 py-2 text-center text-xs font-bold uppercase transition-all sm:flex-initial sm:px-4 sm:py-2.5',
              activeTab === 'unclaimed'
                ? 'border-ink bg-accent dark:bg-accent border-2 text-white shadow-[3px_3px_0_var(--ink)] dark:text-zinc-950'
                : 'border-ink border-2 bg-white text-zinc-700 shadow-[2px_2px_0_var(--ink)] hover:-translate-y-0.5 hover:bg-zinc-50 hover:text-black hover:shadow-[3px_3px_0_var(--ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--ink)] dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white'
            )}
          >
            <CheckSquare
              className={cn(
                'h-4 w-4 shrink-0',
                activeTab === 'unclaimed'
                  ? 'stroke-[2.5]'
                  : 'stroke-2 text-zinc-500 group-hover:text-black dark:text-zinc-400 dark:group-hover:text-white'
              )}
            />
            <span>Unclaimed</span>
            <span
              className={cn(
                'ml-0.5 inline-flex items-center justify-center rounded-[2px] px-1.5 py-0.5 font-mono text-[10px] leading-none font-bold',
                activeTab === 'unclaimed'
                  ? 'border border-white/40 bg-white/20 text-white dark:border-black/30 dark:bg-black/20 dark:text-zinc-950'
                  : 'border-ink/20 border bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
              )}
            >
              {counts.unclaimed}
            </span>
          </button>
        </div>

        {/* Search & Vendor Dropdown */}
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row lg:max-w-md">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, booths..."
              className="border-ink h-10 w-full border-2 bg-white pr-9 pl-9 text-xs font-medium placeholder:text-zinc-400 focus:outline-none dark:bg-zinc-900"
            />
            {isFetching && debouncedSearch ? (
              <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              </div>
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
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
              onChange={(e) =>
                setSelectedVendor(e.target.value ? Number(e.target.value) : undefined)
              }
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
        </div>
      </div>

      {/* Masonry Content */}
      {isLoading ? (
        <div className="columns-1 gap-6 [column-fill:_balance] sm:columns-2 lg:columns-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <FreebieSkeleton key={i} withImage={i % 2 === 0} />
          ))}
        </div>
      ) : isError ? (
        <div className="border-ink border-2 border-dashed bg-rose-50 p-8 text-center dark:bg-rose-950/20">
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
            Failed to load freebies. Please refresh or check connection.
          </p>
        </div>
      ) : !displayedFreebies || displayedFreebies.length === 0 ? (
        <div className="border-ink border-2 border-dashed bg-white p-12 text-center shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-900">
          <div className="border-ink bg-accent-soft/25 mx-auto flex h-14 w-14 items-center justify-center border-2 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800">
            <Gift className="text-ink h-7 w-7 dark:text-zinc-100" />
          </div>
          <h3 className="font-display mt-4 text-lg tracking-wide uppercase sm:text-xl">
            {activeTab === 'saved'
              ? 'No Saved Freebies Yet'
              : activeTab === 'unclaimed'
                ? 'No Unclaimed Freebies'
                : 'No Freebies Found'}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-xs text-zinc-600 dark:text-zinc-300">
            {activeTab === 'saved'
              ? 'Bookmark freebies to keep track of booths you plan to visit.'
              : activeTab === 'unclaimed'
                ? 'You have checked off all your saved freebies!'
                : debouncedSearch || selectedVendor
                  ? 'No freebies matched your search or vendor filter. Try clearing filters.'
                  : 'No freebies have been shared for this convention yet. Be the first to share one!'}
          </p>
          <div className="mt-6">
            <Link
              href={`/conventions/${conventionSlug}/freebies/new`}
              className={cn(
                CONBLOCK_PRIMARY,
                'inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase'
              )}
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              Submit First Freebie
            </Link>
          </div>
        </div>
      ) : (
        <div className="columns-1 gap-6 [column-fill:_balance] sm:columns-2 lg:columns-3">
          {displayedFreebies.map((freebie) => (
            <FreebieCard key={freebie.id} freebie={freebie} />
          ))}
        </div>
      )}
    </div>
  );
}
