'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Bookmark,
  CheckSquare,
  Filter,
  Gift,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
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

  // Queries
  const {
    data: freebies,
    isLoading,
    isError,
  } = useFreebies({
    convention: conventionSlug,
    vendor: selectedVendor,
    saved: activeTab === 'saved' ? true : undefined,
    unclaimed: activeTab === 'unclaimed' ? true : undefined,
    q: searchQuery.trim() || undefined,
  });

  const { data: vendors } = useVendors(conventionSlug);

  function handleTabClick(tab: FilterTab) {
    if ((tab === 'saved' || tab === 'unclaimed') && !user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setActiveTab(tab);
  }

  const savedCount = useMemo(() => {
    if (!freebies) return 0;
    return freebies.filter((f) => f.is_saved).length;
  }, [freebies]);

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
          <div>
            <h1 className="font-display mt-2 text-2xl tracking-wide uppercase sm:text-3xl">
              Freebies
            </h1>
            <p className="mt-1 text-xs text-zinc-600 sm:text-sm dark:text-zinc-300">
              Community-tracked freebies given away from vendors.
            </p>
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
        {/* Filter Tabs */}
        <div className="border-ink inline-flex border-2 bg-zinc-100 p-1 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => handleTabClick('all')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-bold uppercase transition-all',
              activeTab === 'all'
                ? 'border-ink border bg-white text-black shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-900 dark:text-white'
                : 'text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white'
            )}
          >
            All Drops
          </button>
          <button
            type="button"
            onClick={() => handleTabClick('saved')}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase transition-all',
              activeTab === 'saved'
                ? 'border-ink border bg-white text-black shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-900 dark:text-white'
                : 'text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white'
            )}
          >
            <Bookmark className="h-3 w-3" />
            My Saved
          </button>
          <button
            type="button"
            onClick={() => handleTabClick('unclaimed')}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase transition-all',
              activeTab === 'unclaimed'
                ? 'border-ink border bg-white text-black shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-900 dark:text-white'
                : 'text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white'
            )}
          >
            <CheckSquare className="h-3 w-3" />
            Unclaimed
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
              className="border-ink h-10 w-full border-2 bg-white pr-3 pl-9 text-xs font-medium placeholder:text-zinc-400 focus:outline-none dark:bg-zinc-900"
            />
          </div>

          {/* Vendor Filter */}
          {vendors && vendors.length > 0 ? (
            <select
              value={selectedVendor ?? ''}
              onChange={(e) =>
                setSelectedVendor(e.target.value ? Number(e.target.value) : undefined)
              }
              aria-label="Filter by vendor"
              className="border-ink h-10 border-2 bg-white px-3 text-xs font-bold uppercase focus:outline-none dark:bg-zinc-900"
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

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <FreebieSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="border-ink border-2 border-dashed bg-rose-50 p-8 text-center dark:bg-rose-950/20">
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
            Failed to load freebies. Please refresh or check connection.
          </p>
        </div>
      ) : !freebies || freebies.length === 0 ? (
        <div className="border-ink border-2 border-dashed bg-white p-12 text-center shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-900">
          <div className="border-ink mx-auto flex h-14 w-14 items-center justify-center border-2 bg-amber-300 dark:bg-amber-400">
            <Gift className="h-7 w-7 text-black" />
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
                : searchQuery || selectedVendor
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {freebies.map((freebie) => (
            <FreebieCard key={freebie.id} freebie={freebie} />
          ))}
        </div>
      )}
    </div>
  );
}
