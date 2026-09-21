'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ConventionRow } from './ConventionRow';
import { ConventionRequest } from './ConventionRequest';
import { useConventions } from '../data/api';
import { getConventionPhase, isPast } from '../utils/dates';
import type { Convention, ConventionPhase } from '../types';
import { CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

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
  limitUp?: number;
  showAllLink?: boolean;
  showRequest?: boolean;
  initialTab?: 'upcoming' | 'past';
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
  limitUp,
  showAllLink = false,
  showRequest = true,
  initialTab = 'upcoming',
}: ConventionGridProps) {
  const { data = [], isLoading, isError, refetch } = useConventions();
  const [tab, setTab] = useState<'upcoming' | 'past'>(initialTab);

  const upcoming = data.filter((convention) => !isPast(convention));
  const past = data.filter((convention) => isPast(convention));

  const now = upcoming.filter((convention) => getConventionPhase(convention) === 'now');
  const soon = upcoming.filter((convention) => getConventionPhase(convention) === 'soon');
  const up = upcoming.filter((convention) => getConventionPhase(convention) === 'up');
  const later = limitUp ? up.slice(0, limitUp) : up;

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
      chipClassName: 'bg-accent text-white',
      conventions: soon,
    },
    {
      phase: 'up',
      label: 'COMING UP',
      chipClassName: 'border-2 border-ink text-ink dark:text-zinc-100',
      conventions: later,
    },
  ];

  const upcomingSections = upcomingGroups.filter((group) => group.conventions.length > 0);

  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 md:px-6">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-wide uppercase sm:text-4xl">
            {heading}
            <span className="text-accent-pop ml-3">✦</span>
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">{tagline}</p>
        </div>
        {showAllLink && (
          <Link
            href="/conventions"
            className="border-ink text-ink hover:border-accent-pop hover:text-accent-pop inline-flex items-center gap-2 border-2 bg-white px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors dark:bg-zinc-900 dark:text-zinc-100"
          >
            See all conventions
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="border-ink mt-8 flex items-center gap-2 border-b-2 pb-3">
        <button
          type="button"
          onClick={() => setTab('upcoming')}
          className={cn(
            'font-display border-ink cursor-pointer border-2 px-3.5 py-1.5 text-xs tracking-wider uppercase transition-all',
            tab === 'upcoming'
              ? 'bg-accent -translate-y-0.5 text-white shadow-[2px_2px_0_var(--ink)]'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
          )}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('past')}
          className={cn(
            'font-display border-ink cursor-pointer border-2 px-3.5 py-1.5 text-xs tracking-wider uppercase transition-all',
            tab === 'past'
              ? 'bg-accent -translate-y-0.5 text-white shadow-[2px_2px_0_var(--ink)]'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
          )}
        >
          Past Cons ({past.length})
        </button>
      </div>

      {isLoading && (
        <div className="border-ink mt-8 border-t-2 first:mt-12">
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
            upcomingSections.map((group) => (
              <div key={group.phase} className="border-ink mt-8 border-t-2 first:mt-12">
                <h3 className="font-display mt-10 flex items-center gap-3 text-lg tracking-wide uppercase">
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
          {past.length === 0 ? (
            <p className="border-ink mt-12 border-b-2 border-dashed px-2 py-6 text-center text-zinc-500 dark:border-zinc-600 dark:text-zinc-300">
              No past conventions listed yet.
            </p>
          ) : (
            <div className="border-ink mt-8 border-t-2 first:mt-12">
              <h3 className="font-display mt-10 flex items-center gap-3 text-lg tracking-wide uppercase">
                <span className="border-2 border-zinc-400 bg-zinc-200 px-2 py-1 text-xs text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  ENDED CONVENTIONS
                </span>
              </h3>
              <div className="mt-4">
                {past.map((convention) => (
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
