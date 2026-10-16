'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ArrowUpRight, List, Star } from 'lucide-react';
import { ConventionCard } from './ConventionCard';
import { ConventionRow } from './ConventionRow';
import { ConventionRequest } from './ConventionRequest';
import { useConventions } from '../../data/api';
import { getConventionPhase, isPast } from '../../utils/dates';
import type { Convention, ConventionPhase } from '../../types';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export interface ConventionsHubProps {
  initialView?: 'featured' | 'list';
  initialTab?: 'upcoming' | 'past';
  className?: string;
}

interface ConventionGroup {
  phase: ConventionPhase;
  label: string;
  chipClassName: string;
  conventions: Convention[];
}

function CardSkeleton() {
  return (
    <div className="border-ink relative flex min-h-60 animate-pulse flex-col justify-between overflow-hidden border-2 bg-zinc-100 shadow-[4px_4px_0_var(--ink)] sm:min-h-64 md:min-h-72 dark:bg-zinc-900">
      <div className="space-y-4 p-5 sm:p-6 md:p-8">
        <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-8 w-2/3 bg-zinc-200 sm:w-1/2 dark:bg-zinc-800" />
        <div className="space-y-2 pt-2">
          <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-1/4 bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="border-ink flex items-center justify-between border-t-2 border-dashed px-5 py-3.5 sm:px-6 md:px-8">
        <div className="h-7 w-20 bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-7 w-24 bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="border-ink flex animate-pulse items-center gap-4 border-b-2 border-dashed px-2 py-6 md:px-4">
      <div className="border-ink h-14 w-14 bg-zinc-200 dark:bg-zinc-800" />
      <div className="flex-1 space-y-2.5">
        <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-1/4 bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
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
  const resolvedInitialTab: 'upcoming' | 'past' =
    paramTab === 'past' ? 'past' : paramTab === 'upcoming' ? 'upcoming' : initialTab;

  const [view, setView] = useState<'featured' | 'list'>(resolvedInitialView);
  const [tab, setTab] = useState<'upcoming' | 'past'>(resolvedInitialTab);

  const { data = [], isLoading, isError, refetch } = useConventions();

  // Handle browser Back / Forward buttons
  useEffect(() => {
    function handlePopState() {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      const t = params.get('tab');
      setView(v === 'list' ? 'list' : 'featured');
      setTab(t === 'past' ? 'past' : 'upcoming');
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
      setTab(paramTab === 'past' ? 'past' : 'upcoming');
    }
  }, [paramView, paramTab]);

  function updateUrl(newView: 'featured' | 'list', newTab: 'upcoming' | 'past') {
    const params = new URLSearchParams();
    if (newView === 'list') {
      params.set('view', 'list');
      if (newTab === 'past') {
        params.set('tab', 'past');
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

  function handleTabChange(newTab: 'upcoming' | 'past') {
    setTab(newTab);
    updateUrl(view, newTab);
  }

  // Featured conventions data (active & upcoming)
  const featured = data.filter((c) => c.is_featured && !isPast(c));

  // All conventions data (List view)
  const allUpcoming = data.filter((c) => !isPast(c));
  const allPast = data
    .filter((c) => isPast(c))
    .sort(
      (a, b) =>
        new Date(b.ends_at).getTime() - new Date(a.ends_at).getTime() ||
        new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
    );

  const now = allUpcoming.filter((c) => getConventionPhase(c) === 'now');
  const soon = allUpcoming.filter((c) => getConventionPhase(c) === 'soon');
  const up = allUpcoming.filter((c) => getConventionPhase(c) === 'up');

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
      <div className="mt-8 flex flex-col gap-4">
        <div
          className={cn(
            'flex flex-wrap items-center gap-2.5 sm:gap-3',
            view === 'featured' && 'border-ink border-b-2 pb-4'
          )}
        >
          <button
            type="button"
            onClick={() => handleViewChange('featured')}
            aria-pressed={view === 'featured'}
            className={cn(
              CONBLOCK,
              'font-display flex items-center gap-2 px-4 py-2 text-xs tracking-wider uppercase transition-all',
              view === 'featured'
                ? 'bg-accent hover:bg-accent-pop text-white shadow-[3px_3px_0_var(--ink)] dark:text-zinc-950 dark:hover:text-white'
                : 'bg-white text-zinc-800 hover:bg-zinc-100 hover:text-black dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
            )}
          >
            <Star className={cn('h-3.5 w-3.5', view === 'featured' && 'fill-current')} />
            <span>Featured Cons</span>
            <span
              className={cn(
                'ml-1 px-1.5 py-0.5 font-mono text-[10px] font-bold',
                view === 'featured'
                  ? 'bg-white/25 text-white dark:bg-zinc-950/20 dark:text-zinc-950'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
              )}
            >
              {featured.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleViewChange('list')}
            aria-pressed={view === 'list'}
            className={cn(
              CONBLOCK,
              'font-display flex items-center gap-2 px-4 py-2 text-xs tracking-wider uppercase transition-all',
              view === 'list'
                ? 'bg-accent hover:bg-accent-pop text-white shadow-[3px_3px_0_var(--ink)] dark:text-zinc-950 dark:hover:text-white'
                : 'bg-white text-zinc-800 hover:bg-zinc-100 hover:text-black dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
            )}
          >
            <List className="h-3.5 w-3.5" />
            <span>List of Cons</span>
            <span
              className={cn(
                'ml-1 px-1.5 py-0.5 font-mono text-[10px] font-bold',
                view === 'list'
                  ? 'bg-white/25 text-white dark:bg-zinc-950/20 dark:text-zinc-950'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
              )}
            >
              {data.length}
            </span>
          </button>
        </div>

        {/* Time Filter Tabs: Only for List of Cons */}
        {view === 'list' && (
          <div className="border-ink flex flex-wrap items-center justify-between gap-2 border-b-2 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTabChange('upcoming')}
                className={cn(
                  CONBLOCK,
                  'font-display px-3.5 py-1.5 text-xs tracking-wider uppercase',
                  tab === 'upcoming'
                    ? 'bg-accent hover:bg-accent-pop text-white dark:text-zinc-950 dark:hover:text-white'
                    : 'hover:border-accent-pop bg-white text-zinc-800 hover:bg-zinc-100 hover:text-black dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
                )}
              >
                Upcoming ({allUpcoming.length})
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('past')}
                className={cn(
                  CONBLOCK,
                  'font-display px-3.5 py-1.5 text-xs tracking-wider uppercase',
                  tab === 'past'
                    ? 'bg-accent hover:bg-accent-pop text-white dark:text-zinc-950 dark:hover:text-white'
                    : 'hover:border-accent-pop bg-white text-zinc-800 hover:bg-zinc-100 hover:text-black dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
                )}
              >
                Past Cons ({allPast.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="mt-8">
          {view === 'featured' ? (
            <div className="flex flex-col gap-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <div>
              <RowSkeleton />
              <RowSkeleton />
              <RowSkeleton />
            </div>
          )}
        </div>
      )}

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
        <div className="mt-8 flex flex-col gap-6">
          {featured.length === 0 ? (
            <div className="border-ink border-2 border-dashed bg-white p-8 text-center sm:p-12 dark:bg-zinc-900">
              <p className="font-display text-sm tracking-wide uppercase sm:text-base">
                No featured conventions right now!
              </p>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
                Check back soon or explore the full list of conventions happening across the
                community.
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => handleViewChange('list')}
                  className={cn(
                    CONBLOCK_PRIMARY,
                    'inline-flex items-center gap-2 px-5 py-2.5 text-xs'
                  )}
                >
                  <span>View All Cons List</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            featured.map((convention) => (
              <ConventionCard key={convention.id} convention={convention} />
            ))
          )}
        </div>
      )}

      {/* Main Content: List View (The Line-up) */}
      {!isLoading && !isError && view === 'list' && tab === 'upcoming' && (
        <div className="mt-6">
          {upcomingSections.length === 0 ? (
            <p className="border-ink mt-12 border-b-2 border-dashed px-2 py-6 text-center text-zinc-500 dark:border-zinc-600 dark:text-zinc-300">
              No upcoming conventions listed right now — check back soon!
            </p>
          ) : (
            upcomingSections.map((group, index) => (
              <div key={group.phase} className={cn('border-ink', index > 0 && 'mt-8 border-t-2')}>
                <h3
                  className={cn(
                    'font-display flex items-center gap-3 text-lg tracking-wide uppercase',
                    index === 0 ? 'mt-6' : 'mt-10'
                  )}
                >
                  <span
                    className={`${group.chipClassName} inline-flex items-center px-2 py-1 text-xs`}
                  >
                    {group.label}
                  </span>
                </h3>
                <div className="mt-4">
                  {group.conventions.map((convention) => (
                    <ConventionRow
                      key={convention.id}
                      convention={convention}
                      phase={group.phase}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!isLoading && !isError && view === 'list' && tab === 'past' && (
        <div className="mt-6">
          {allPast.length === 0 ? (
            <p className="border-ink mt-12 border-b-2 border-dashed px-2 py-6 text-center text-zinc-500 dark:border-zinc-600 dark:text-zinc-300">
              No past conventions listed yet.
            </p>
          ) : (
            <div className="border-ink">
              <h3 className="font-display mt-6 flex items-center gap-3 text-lg tracking-wide uppercase">
                <span className="border-2 border-zinc-400 bg-zinc-200 px-2 py-1 text-xs text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  ENDED CONVENTIONS
                </span>
              </h3>
              <div className="mt-4">
                {allPast.map((convention) => (
                  <ConventionRow key={convention.id} convention={convention} phase="past" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suggest a Convention Box */}
      <ConventionRequest />
    </section>
  );
}
