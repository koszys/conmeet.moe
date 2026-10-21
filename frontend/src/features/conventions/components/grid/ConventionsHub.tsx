'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Star } from 'lucide-react';
import { ConventionRequest } from './ConventionRequest';
import { ConventionFilterBar, type ConventionFilters } from './ConventionFilterBar';
import { ConventionsViewSwitcher } from './ConventionsViewSwitcher';
import { ConventionsTimeTabs } from './ConventionsTimeTabs';
import { FeaturedViewContent } from './FeaturedViewContent';
import { ListViewContent, type ConventionGroup } from './ListViewContent';
import { ConventionsHubSkeleton } from './ConventionsHubSkeleton';
import { useConventions } from '../../data/api';
import {
  getConventionPhase,
  isFeaturedVisible,
  isPast,
  isRecentlyEnded,
  sortFeaturedConventions,
} from '../../utils/dates';
import { matchesConventionFilters } from '../../utils/filters';
import { CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export interface ConventionsHubProps {
  initialView?: 'featured' | 'list';
  initialTab?: 'upcoming' | 'past' | 'recently-ended';
  className?: string;
}

export function ConventionsHub({
  initialView = 'featured',
  initialTab = 'upcoming',
  className,
}: ConventionsHubProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const paramView = searchParams?.get('view');
  const paramTab = searchParams?.get('tab');

  const resolvedInitialView: 'featured' | 'list' =
    paramView === 'list' ? 'list' : paramView === 'featured' ? 'featured' : initialView;
  const resolvedInitialTab: 'upcoming' | 'past' | 'recently-ended' =
    paramTab === 'recently-ended'
      ? 'recently-ended'
      : paramTab === 'past'
        ? 'past'
        : paramTab === 'upcoming'
          ? 'upcoming'
          : initialTab;

  const [view, setView] = useState<'featured' | 'list'>(resolvedInitialView);
  const [tab, setTab] = useState<'upcoming' | 'past' | 'recently-ended'>(resolvedInitialTab);
  const [filters, setFilters] = useState<ConventionFilters>({
    query: '',
    location: '',
    year: '',
  });

  const hasActiveFilters = Boolean(filters.query || filters.location || filters.year);

  function handleFilterChange(newFilters: Partial<ConventionFilters>) {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }

  function handleResetFilters() {
    setFilters({ query: '', location: '', year: '' });
  }

  const { data = [], isLoading, isError, refetch } = useConventions();

  // Handle browser Back / Forward buttons
  useEffect(() => {
    function handlePopState() {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      const t = params.get('tab');
      setView(v === 'list' ? 'list' : 'featured');
      setTab(t === 'recently-ended' ? 'recently-ended' : t === 'past' ? 'past' : 'upcoming');
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync state if Next.js searchParams change externally (e.g. clicking header links)
  const prevParamsRef = useRef({ paramView, paramTab });
  useEffect(() => {
    if (prevParamsRef.current.paramView !== paramView) {
      prevParamsRef.current.paramView = paramView;
      setView(paramView === 'list' ? 'list' : 'featured');
    }
    if (prevParamsRef.current.paramTab !== paramTab) {
      prevParamsRef.current.paramTab = paramTab;
      setTab(
        paramTab === 'recently-ended' ? 'recently-ended' : paramTab === 'past' ? 'past' : 'upcoming'
      );
    }
  }, [paramView, paramTab]);

  function updateUrl(newView: 'featured' | 'list', newTab: 'upcoming' | 'past' | 'recently-ended') {
    const params = new URLSearchParams();
    if (newView === 'list') {
      params.set('view', 'list');
      if (newTab === 'past') {
        params.set('tab', 'past');
      } else if (newTab === 'recently-ended') {
        params.set('tab', 'recently-ended');
      }
    } else {
      params.set('view', 'featured');
    }

    const query = params.toString();
    const targetUrl = query ? `${pathname}?${query}` : pathname;
    window.history.replaceState(null, '', targetUrl);
  }

  function handleViewChange(newView: 'featured' | 'list') {
    setView(newView);
    updateUrl(newView, tab);
  }

  function handleTabChange(newTab: 'upcoming' | 'past' | 'recently-ended') {
    setTab(newTab);
    updateUrl(view, newTab);
  }

  // Featured conventions data (active, upcoming, & recently ended)
  const featured = sortFeaturedConventions(data.filter((c) => isFeaturedVisible(c)));

  // All conventions data (List view)
  const allUpcoming = data.filter((c) => !isPast(c));
  const allPast = data
    .filter((c) => isPast(c))
    .sort(
      (a, b) =>
        new Date(b.ends_at).getTime() - new Date(a.ends_at).getTime() ||
        new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
    );
  const recentlyEnded = allPast.filter((c) => isRecentlyEnded(c));

  // Extract unique locations and years for filters
  const availableLocations = useMemo(() => {
    const locSet = new Set<string>();
    for (const c of data) {
      const loc = [c.city, c.country].filter(Boolean).join(', ');
      if (loc) locSet.add(loc);
    }
    return Array.from(locSet).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const availableYears = useMemo(() => {
    const yearSet = new Set<string>();
    for (const c of data) {
      if (c.starts_at) yearSet.add(new Date(c.starts_at).getFullYear().toString());
      if (c.ends_at) yearSet.add(new Date(c.ends_at).getFullYear().toString());
    }
    return Array.from(yearSet).sort((a, b) => b.localeCompare(a));
  }, [data]);

  // Filtered datasets for the list view
  const filteredUpcoming = allUpcoming.filter((c) => matchesConventionFilters(c, filters));
  const filteredPast = allPast.filter((c) => matchesConventionFilters(c, filters));
  const filteredRecentlyEnded = recentlyEnded.filter((c) => matchesConventionFilters(c, filters));

  const now = filteredUpcoming.filter((c) => getConventionPhase(c) === 'now');
  const soon = filteredUpcoming.filter((c) => getConventionPhase(c) === 'soon');
  const up = filteredUpcoming.filter((c) => getConventionPhase(c) === 'up');

  const upcomingGroups: ConventionGroup[] = [
    {
      phase: 'now',
      label: 'HAPPENING NOW',
      chipClassName: 'bg-accent-pop text-white',
      conventions: now,
    },
    {
      phase: 'soon',
      label: 'SOON!',
      chipClassName: 'bg-accent text-white dark:text-zinc-950',
      conventions: soon,
    },
    {
      phase: 'up',
      label: 'COMING UP',
      chipClassName: 'border-2 border-ink text-ink dark:text-zinc-100',
      conventions: up,
    },
  ];

  const upcomingSections = upcomingGroups.filter((group) => group.conventions.length > 0);

  const currentTotalCount =
    tab === 'upcoming'
      ? allUpcoming.length
      : tab === 'recently-ended'
        ? recentlyEnded.length
        : allPast.length;

  const currentFilteredCount =
    tab === 'upcoming'
      ? filteredUpcoming.length
      : tab === 'recently-ended'
        ? filteredRecentlyEnded.length
        : filteredPast.length;

  return (
    <section
      id="conventions-hub"
      className={cn(
        'mx-auto scroll-mt-20 px-4 py-16 transition-all md:px-6 md:py-20',
        view === 'featured' ? 'max-w-7xl' : 'max-w-6xl',
        className
      )}
    >
      {/* Header Info */}
      <div className="flex flex-col items-start gap-4">
        <div>
          {view === 'featured' && (
            <div className="flex items-center gap-2">
              <span className="border-ink bg-accent-pop font-display inline-flex items-center gap-1.5 border-2 px-2.5 py-1 text-xs text-white uppercase shadow-[2px_2px_0_var(--ink)]">
                <Star className="h-3.5 w-3.5 fill-current" />
                SPOTLIGHT
              </span>
            </div>
          )}
          <h1 className="font-display mt-3 text-2xl tracking-wide uppercase sm:text-4xl">
            {view === 'featured' ? 'featured conventions' : 'all conventions'}
            <span className={view === 'featured' ? 'text-accent ml-3' : 'text-accent-pop ml-3'}>
              {view === 'featured' ? '★' : '✦'}
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base dark:text-zinc-300">
            {view === 'featured'
              ? "Cons you definitely don't want to miss."
              : 'Browse what conventions are currently on this site.'}
          </p>
        </div>
      </div>

      {/* Primary View Switcher: Two Separate Choices */}
      <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:gap-4">
        <ConventionsViewSwitcher view={view} onViewChange={handleViewChange} />

        {/* Time Filter Tabs & Filter Bar: Only for List of Cons */}
        {view === 'list' && (
          <div className="border-ink flex flex-col border-b-2 pb-3 sm:pb-4">
            <ConventionsTimeTabs
              tab={tab}
              onTabChange={handleTabChange}
              counts={{
                upcoming: allUpcoming.length,
                past: allPast.length,
                recentlyEnded: recentlyEnded.length,
              }}
            />

            <ConventionFilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              availableLocations={availableLocations}
              availableYears={availableYears}
              filteredCount={currentFilteredCount}
              totalCount={currentTotalCount}
            />
          </div>
        )}
      </div>

      {/* Loading Skeletons */}
      {isLoading && <ConventionsHubSkeleton view={view} />}

      {/* Error State */}
      {isError && (
        <div className="border-ink bg-accent-soft/50 mt-12 border-2 p-6 text-center shadow-[4px_4px_0_var(--ink)] md:p-8 dark:bg-zinc-900">
          <h3 className="font-display text-lg tracking-wide uppercase">
            could not load the conventions!
          </h3>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
            The conventions list is having a moment. Give it another try?
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className={cn(CONBLOCK_PRIMARY, 'mt-4 px-5 py-2 text-xs')}
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content: Featured View */}
      {!isLoading && !isError && view === 'featured' && (
        <FeaturedViewContent
          conventions={featured}
          onSwitchToList={() => handleViewChange('list')}
        />
      )}

      {/* Main Content: List View (The Line-up) */}
      {!isLoading && !isError && view === 'list' && (
        <ListViewContent
          tab={tab}
          upcomingSections={upcomingSections}
          pastConventions={filteredPast}
          recentlyEndedConventions={filteredRecentlyEnded}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
        />
      )}

      {/* Suggest a Convention Box */}
      <ConventionRequest />
    </section>
  );
}
