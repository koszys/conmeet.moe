'use client';

import { useState } from 'react';
import { ConventionRow } from './ConventionRow';
import { ConventionRequest } from './ConventionRequest';
import { useConventions } from '../../data/api';
import { getConventionPhase, isPast } from '../../utils/dates';
import type { Convention, ConventionPhase } from '../../types';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { AllConsButton, FeaturedConsButton } from '../links';

interface ConventionGroup {
  phase: ConventionPhase;
  label: string;
  chipClassName: string;
  conventions: Convention[];
}

interface ConventionGridProps {
  id?: string;
  heading?: string;
  tagline?: string;
  limitNow?: number;
  limitSoon?: number;
  limitUp?: number;
  limitPast?: number;
  showAllLink?: boolean;
  showFeaturedLink?: boolean;
  showRequest?: boolean;
  initialTab?: 'upcoming' | 'past';
  className?: string;
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

export function ConventionGrid({
  id = 'conventions',
  heading = 'the line-up!',
  tagline = 'Only conventions currently on this site are listed here — not every con out there!',
  limitNow,
  limitSoon,
  limitUp,
  limitPast,
  showAllLink = false,
  showFeaturedLink = false,
  showRequest = true,
  initialTab = 'upcoming',
  className,
}: ConventionGridProps) {
  const { data = [], isLoading, isError, refetch } = useConventions();
  const [tab, setTab] = useState<'upcoming' | 'past'>(initialTab);

  const upcoming = data.filter((convention) => !isPast(convention));
  const allPast = data
    .filter((convention) => isPast(convention))
    .sort(
      (a, b) =>
        new Date(b.ends_at).getTime() - new Date(a.ends_at).getTime() ||
        new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
    );

  const now = upcoming.filter((convention) => getConventionPhase(convention) === 'now');
  const soon = upcoming.filter((convention) => getConventionPhase(convention) === 'soon');
  const up = upcoming.filter((convention) => getConventionPhase(convention) === 'up');

  const displayedNow = limitNow ? now.slice(0, limitNow) : now;
  const displayedSoon = limitSoon ? soon.slice(0, limitSoon) : soon;
  const displayedUp = limitUp ? up.slice(0, limitUp) : up;
  const displayedPast = limitPast ? allPast.slice(0, limitPast) : allPast;

  const totalUpcomingCount = now.length + soon.length + up.length;

  const upcomingGroups: ConventionGroup[] = [
    {
      phase: 'now',
      label: 'HAPPENING NOW',
      chipClassName: 'bg-accent-pop text-white',
      conventions: displayedNow,
    },
    {
      phase: 'soon',
      label: 'SOON!',
      chipClassName: 'bg-accent text-white dark:text-zinc-950',
      conventions: displayedSoon,
    },
    {
      phase: 'up',
      label: 'COMING UP',
      chipClassName: 'border-2 border-ink text-ink dark:text-zinc-100',
      conventions: displayedUp,
    },
  ];

  const upcomingSections = upcomingGroups.filter((group) => group.conventions.length > 0);

  return (
    <section id={id} className={cn('mx-auto max-w-6xl scroll-mt-20 px-4 py-20 md:px-6', className)}>
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-wide uppercase sm:text-4xl">
            {heading}
            <span className="text-accent-pop ml-3">✦</span>
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">{tagline}</p>
        </div>
        {showAllLink && (
          <AllConsButton
            tab={tab}
            count={tab === 'upcoming' ? totalUpcomingCount : allPast.length}
          />
        )}
      </div>

      {/* Filter Tabs & Navigation Link */}
      <div className="border-ink mt-8 flex flex-wrap items-center justify-between gap-2 border-b-2 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('upcoming')}
            className={cn(
              CONBLOCK,
              'font-display px-3.5 py-1.5 text-xs tracking-wider uppercase',
              tab === 'upcoming'
                ? 'bg-accent hover:bg-accent-pop text-white dark:text-zinc-950 dark:hover:text-white'
                : 'hover:border-accent-pop bg-white text-zinc-800 hover:bg-zinc-100 hover:text-black dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
            )}
          >
            Upcoming
          </button>
          <button
            type="button"
            onClick={() => setTab('past')}
            className={cn(
              CONBLOCK,
              'font-display px-3.5 py-1.5 text-xs tracking-wider uppercase',
              tab === 'past'
                ? 'bg-accent hover:bg-accent-pop text-white dark:text-zinc-950 dark:hover:text-white'
                : 'hover:border-accent-pop bg-white text-zinc-800 hover:bg-zinc-100 hover:text-black dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
            )}
          >
            Past Cons
          </button>
        </div>

        {showFeaturedLink && <FeaturedConsButton />}
      </div>

      {isLoading && (
        <div className="mt-4">
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </div>
      )}

      {isError && (
        <div className="border-ink bg-accent-soft/50 mt-12 border-2 p-6 text-center shadow-[4px_4px_0_var(--ink)] md:p-8 dark:bg-zinc-900">
          <h3 className="font-display text-lg tracking-wide uppercase">
            could not load the line-up!
          </h3>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
            The conventions list is having a moment. Give it another try?
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className={cn(CONBLOCK_PRIMARY, 'mt-5 inline-flex items-center px-5 py-2.5')}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && tab === 'upcoming' && (
        <>
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
        </>
      )}

      {!isLoading && !isError && tab === 'past' && (
        <>
          {displayedPast.length === 0 ? (
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
                {displayedPast.map((convention) => (
                  <ConventionRow key={convention.id} convention={convention} phase="past" />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showRequest && <ConventionRequest />}
    </section>
  );
}
