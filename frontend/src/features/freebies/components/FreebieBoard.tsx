'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Bookmark,
  BookmarkX,
  Check,
  CheckSquare,
  ChevronDown,
  Gift,
  LayoutGrid,
  Loader2,
  Plus,
  Rows3,
  Search,
  X,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { useDebounce } from '@/shared/hooks';
import { cn } from '@/shared/lib/utils';
import { useFreebies, useVendors } from '../api/queries';
import { FreebieCard } from './FreebieCard';
import { FreebieSkeleton } from './FreebieSkeleton';

type FilterTab = 'all' | 'saved';

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
  const [allCondensed, setAllCondensed] = useState(false);
  const [cardOverrides, setCardOverrides] = useState<Record<number, boolean>>({});
  const [hideSavedInAll, setHideSavedInAll] = useState(false);
  const [isToClaimCollapsed, setIsToClaimCollapsed] = useState(false);
  const [isClaimedCollapsed, setIsClaimedCollapsed] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  function isCardCondensed(id: number) {
    return cardOverrides[id] !== undefined ? cardOverrides[id] : allCondensed;
  }

  function handleToggleCardCondensed(id: number) {
    setCardOverrides((prev) => ({
      ...prev,
      [id]: !(prev[id] !== undefined ? prev[id] : allCondensed),
    }));
  }

  function handleToggleAllCondensed() {
    setAllCondensed((prev) => {
      const next = !prev;
      setCardOverrides({});
      return next;
    });
  }

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

  const isFiltered = Boolean(debouncedSearch.trim() || selectedVendor !== undefined);

  function handleClearFilters() {
    setSearchQuery('');
    setSelectedVendor(undefined);
  }

  function handleTabClick(tab: FilterTab) {
    if (tab === 'saved' && !user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setActiveTab(tab);
  }

  const counts = useMemo(() => {
    if (!allFreebies) return { all: 0, saved: 0, unclaimed: 0, claimed: 0 };
    return {
      all: allFreebies.filter((f) => !f.is_claimed).length,
      saved: allFreebies.filter((f) => f.is_saved).length,
      unclaimed: allFreebies.filter((f) => f.is_saved && !f.is_claimed).length,
      claimed: allFreebies.filter((f) => f.is_saved && f.is_claimed).length,
    };
  }, [allFreebies]);

  const allDrops = useMemo(() => {
    if (!allFreebies) return [];
    return allFreebies.filter((f) => !f.is_claimed);
  }, [allFreebies]);

  const unsavedDrops = useMemo(() => {
    if (!allFreebies) return [];
    return allFreebies.filter((f) => !f.is_claimed && !f.is_saved);
  }, [allFreebies]);

  const savedDrops = useMemo(() => {
    if (!allFreebies) return [];
    return allFreebies.filter((f) => !f.is_claimed && f.is_saved);
  }, [allFreebies]);

  const unclaimedSaved = useMemo(() => {
    if (!allFreebies) return [];
    return allFreebies.filter((f) => f.is_saved && !f.is_claimed);
  }, [allFreebies]);

  const claimedSaved = useMemo(() => {
    if (!allFreebies) return [];
    return allFreebies.filter((f) => f.is_saved && f.is_claimed);
  }, [allFreebies]);

  return (
    <div className="space-y-6">
      {/* Top Navigation & Header */}
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
            <Plus className="h-4 w-4 stroke-3" />
            Post a Freebie
          </Link>
        </div>
      </div>

      {/* Filter Bar & Controls */}
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
              All<span className="hidden sm:inline"></span>
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

          {/* Saved Freebies */}
          <button
            type="button"
            onClick={() => handleTabClick('saved')}
            className={cn(
              'group inline-flex min-w-[calc(50%-0.25rem)] flex-1 cursor-pointer items-center justify-center gap-1.5 px-3 py-2 text-center text-xs font-bold uppercase transition-all sm:min-w-0 sm:flex-initial sm:px-4 sm:py-2.5',
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

          {/* Hide Saved Toggle Button (Only in All Drops) */}
          {activeTab === 'all' && (
            <button
              type="button"
              onClick={() => setHideSavedInAll((prev) => !prev)}
              aria-pressed={hideSavedInAll}
              title={
                hideSavedInAll ? 'Show bookmarked drops in feed' : 'Hide bookmarked drops from feed'
              }
              className={cn(
                CONBLOCK,
                'inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 px-3 text-xs font-bold uppercase transition-all',
                hideSavedInAll
                  ? 'border-ink bg-accent text-white shadow-[2px_2px_0_var(--ink)] dark:text-zinc-950'
                  : 'border-ink border-2 bg-white text-zinc-700 shadow-[2px_2px_0_var(--ink)] hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              )}
            >
              {hideSavedInAll ? (
                <BookmarkX className="h-4 w-4 stroke-[2.5]" />
              ) : (
                <Bookmark className="h-4 w-4 stroke-2" />
              )}
              <span className="hidden sm:inline">
                {hideSavedInAll ? 'Saved Hidden' : 'Hide Saved'}
              </span>
            </button>
          )}

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
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
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
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
              )}
            >
              <Rows3 className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Grid Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
      ) : activeTab === 'all' ? (
        allDrops.length === 0 ? (
          <div className="border-ink border-2 border-dashed bg-white p-12 text-center shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-900">
            <div className="border-ink bg-accent-soft/25 mx-auto flex h-14 w-14 items-center justify-center border-2 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800">
              {isFiltered ? (
                <Search className="text-ink h-7 w-7 dark:text-zinc-100" />
              ) : (
                <Gift className="text-ink h-7 w-7 dark:text-zinc-100" />
              )}
            </div>
            <h3 className="font-display mt-4 text-lg tracking-wide uppercase sm:text-xl">
              {isFiltered ? 'No Matching Freebies Found' : 'No Active Freebies Found'}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-xs text-zinc-600 dark:text-zinc-300">
              {isFiltered
                ? 'No freebies matched your search or vendor filter. Try clearing filters.'
                : 'No active freebies found for this convention yet. Be the first to share one!'}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {isFiltered ? (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className={cn(
                    CONBLOCK,
                    'inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase'
                  )}
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </button>
              ) : (
                <Link
                  href={`/conventions/${conventionSlug}/freebies/new`}
                  className={cn(
                    CONBLOCK_PRIMARY,
                    'inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase'
                  )}
                >
                  <Plus className="h-4 w-4 stroke-3" />
                  Submit First Freebie
                </Link>
              )}
            </div>
          </div>
        ) : hideSavedInAll ? (
          unsavedDrops.length === 0 ? (
            <div className="border-ink border-2 border-dashed bg-zinc-50/70 p-8 text-center dark:bg-zinc-900/50">
              <div className="border-ink bg-accent mx-auto flex h-10 w-10 items-center justify-center border-2 text-white shadow-[2px_2px_0_var(--ink)] dark:text-zinc-950">
                <BookmarkX className="h-5 w-5 stroke-[2.5]" />
              </div>
              <p className="mt-3 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                {isFiltered
                  ? 'No unsaved drops match your search'
                  : "You've saved all active drops!"}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {isFiltered
                  ? 'Matching drops might already be saved or filtered out.'
                  : 'Switch to My Saved to view your checklist or toggle off \u201cSaved Hidden\u201d.'}
              </p>
              {isFiltered ? (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className={cn(
                      CONBLOCK,
                      'inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase'
                    )}
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear Filters
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {unsavedDrops.map((freebie) => (
                <FreebieCard
                  key={freebie.id}
                  freebie={freebie}
                  condensed={isCardCondensed(freebie.id)}
                  onToggleCondensed={() => handleToggleCardCondensed(freebie.id)}
                />
              ))}
            </div>
          )
        ) : (
          <div className="space-y-8">
            {/* Unsaved drops (Top) */}
            {unsavedDrops.length > 0 && (
              <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {unsavedDrops.map((freebie) => (
                  <FreebieCard
                    key={freebie.id}
                    freebie={freebie}
                    condensed={isCardCondensed(freebie.id)}
                    onToggleCondensed={() => handleToggleCardCondensed(freebie.id)}
                  />
                ))}
              </div>
            )}

            {/* Saved Drops (Bottom - Separated out of the way) */}
            {savedDrops.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="border-ink flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <Bookmark className="text-accent h-4 w-4 fill-current" />
                    <h2 className="font-display text-sm tracking-wider uppercase sm:text-base">
                      Saved
                    </h2>
                    <span className="border-ink/20 border bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {savedDrops.length}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {savedDrops.map((freebie) => (
                    <FreebieCard
                      key={freebie.id}
                      freebie={freebie}
                      condensed={isCardCondensed(freebie.id)}
                      onToggleCondensed={() => handleToggleCardCondensed(freebie.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      ) : /* activeTab === 'saved' */
      counts.saved === 0 ? (
        <div className="border-ink border-2 border-dashed bg-white p-12 text-center shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-900">
          <div className="border-ink bg-accent-soft/25 mx-auto flex h-14 w-14 items-center justify-center border-2 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800">
            {isFiltered ? (
              <Search className="text-ink h-7 w-7 dark:text-zinc-100" />
            ) : (
              <Bookmark className="text-ink h-7 w-7 dark:text-zinc-100" />
            )}
          </div>
          <h3 className="font-display mt-4 text-lg tracking-wide uppercase sm:text-xl">
            {isFiltered ? 'No Matching Saved Freebies' : 'No Saved Freebies Yet'}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-xs text-zinc-600 dark:text-zinc-300">
            {isFiltered
              ? debouncedSearch
                ? `No saved freebies match \u201c${debouncedSearch}\u201d. Try clearing your search.`
                : 'No saved freebies match the selected vendor filter.'
              : 'Bookmark freebies to build your personal checklist for the convention floor.'}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {isFiltered ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className={cn(
                  CONBLOCK,
                  'inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase'
                )}
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={cn(
                  CONBLOCK,
                  'inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase'
                )}
              >
                <Gift className="h-4 w-4" />
                Browse All
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: To Claim */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setIsToClaimCollapsed((prev) => !prev)}
              className="border-ink flex w-full cursor-pointer items-center justify-between border-b pb-2 text-left transition-opacity hover:opacity-80"
              aria-expanded={!isToClaimCollapsed}
            >
              <div className="flex items-center gap-2">
                <CheckSquare className="text-accent h-4 w-4" />
                <h2 className="font-display text-sm tracking-wider uppercase sm:text-base">
                  To Claim
                </h2>
                <span className="border-ink/20 border bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {unclaimedSaved.length}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    isToClaimCollapsed && '-rotate-90'
                  )}
                />
              </div>
            </button>

            {!isToClaimCollapsed &&
              (unclaimedSaved.length > 0 ? (
                <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {unclaimedSaved.map((freebie) => (
                    <FreebieCard
                      key={freebie.id}
                      freebie={freebie}
                      condensed={isCardCondensed(freebie.id)}
                      onToggleCondensed={() => handleToggleCardCondensed(freebie.id)}
                    />
                  ))}
                </div>
              ) : isFiltered ? (
                <div className="border-ink border-2 border-dashed bg-zinc-50/70 p-5 text-center dark:bg-zinc-900/50">
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    No unclaimed freebies match{' '}
                    {debouncedSearch ? (
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        &ldquo;{debouncedSearch}&rdquo;
                      </span>
                    ) : (
                      'the active filter'
                    )}
                    .
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-300">
                    Check the Claimed section below for matching drops.
                  </p>
                </div>
              ) : (
                <div className="border-ink border-2 border-dashed bg-zinc-50/70 p-6 text-center dark:bg-zinc-900/50">
                  <div className="border-ink bg-accent mx-auto flex h-9 w-9 items-center justify-center border-2 text-white shadow-[2px_2px_0_var(--ink)] dark:text-zinc-950">
                    <Check className="h-5 w-5 stroke-3" />
                  </div>
                  <p className="mt-2 text-xs font-bold text-zinc-800 sm:text-sm dark:text-zinc-200">
                    All caught up! You&apos;ve claimed all of your saved freebies.
                  </p>
                </div>
              ))}
          </div>

          {/* Section 2: Claimed */}
          {claimedSaved.length > 0 && (
            <div className="space-y-4 pt-2">
              <button
                type="button"
                onClick={() => setIsClaimedCollapsed((prev) => !prev)}
                className="border-ink flex w-full cursor-pointer items-center justify-between border-b pb-2 text-left transition-opacity hover:opacity-80"
                aria-expanded={!isClaimedCollapsed}
              >
                <div className="flex items-center gap-2">
                  <Check className="text-accent h-4 w-4 stroke-3" />
                  <h2 className="font-display text-sm tracking-wider uppercase sm:text-base">
                    Claimed
                  </h2>
                  <span className="border-ink/20 border bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {claimedSaved.length}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      isClaimedCollapsed && '-rotate-90'
                    )}
                  />
                </div>
              </button>

              {!isClaimedCollapsed && (
                <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {claimedSaved.map((freebie) => (
                    <FreebieCard
                      key={freebie.id}
                      freebie={freebie}
                      condensed={isCardCondensed(freebie.id)}
                      onToggleCondensed={() => handleToggleCardCondensed(freebie.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
