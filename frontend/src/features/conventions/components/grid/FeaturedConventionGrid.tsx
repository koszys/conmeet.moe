'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Star } from 'lucide-react';
import { ConventionCard } from './ConventionCard';
import { ConventionRequest } from './ConventionRequest';
import { useConventions } from '../../data/api';
import { isPast } from '../../utils/dates';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export interface FeaturedConventionGridProps {
  initialTab?: 'upcoming' | 'past';
  className?: string;
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

export function FeaturedConventionGrid({
  initialTab = 'upcoming',
  className,
}: FeaturedConventionGridProps) {
  const { data = [], isLoading, isError, refetch } = useConventions();
  const [tab, setTab] = useState<'upcoming' | 'past'>(initialTab);

  const featured = data.filter((convention) => convention.is_featured);
  const upcoming = featured.filter((convention) => !isPast(convention));
  const past = featured
    .filter((convention) => isPast(convention))
    .sort(
      (a, b) =>
        new Date(b.ends_at).getTime() - new Date(a.ends_at).getTime() ||
        new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
    );

  const displayed = tab === 'upcoming' ? upcoming : past;

  return (
    <section
      id="featured-conventions"
      className={cn('mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:px-6 md:py-20', className)}
    >
      <div className="flex flex-col items-start gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="border-ink bg-accent-pop font-display inline-flex items-center gap-1.5 border-2 px-2.5 py-1 text-xs text-white uppercase shadow-[2px_2px_0_var(--ink)]">
              <Star className="h-3.5 w-3.5 fill-current" />
              SPOTLIGHT
            </span>
          </div>
          <h1 className="font-display mt-3 text-2xl tracking-wide uppercase sm:text-4xl">
            featured conventions
            <span className="text-accent ml-3">★</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base dark:text-zinc-300">
            Cons you definitely don&apos;t want to miss — handpicked and spotlighted.
          </p>
        </div>
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

        <Link
          href="/conventions"
          className={cn(
            CONBLOCK,
            'text-ink hover:border-accent-pop hover:text-accent-pop inline-flex items-center gap-1.5 bg-white px-3.5 py-1.5 text-xs font-bold tracking-widest uppercase hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800'
          )}
        >
          <span>All Cons</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading && (
        <div className="mt-8 flex flex-col gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {isError && (
        <div className="border-ink bg-accent-soft/50 mt-12 border-2 p-6 text-center shadow-[4px_4px_0_var(--ink)] md:p-8 dark:bg-zinc-900">
          <h3 className="font-display text-lg tracking-wide uppercase">
            could not load featured cons!
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

      {!isLoading && !isError && (
        <div className="mt-8 flex flex-col gap-6">
          {displayed.length === 0 ? (
            <div className="border-ink border-2 border-dashed bg-white p-8 text-center sm:p-12 dark:bg-zinc-900">
              <p className="font-display text-sm tracking-wide uppercase sm:text-base">
                {tab === 'upcoming'
                  ? 'No upcoming featured conventions right now!'
                  : 'No past featured conventions listed yet.'}
              </p>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
                Check back soon or explore the full roster of conventions happening across the
                community.
              </p>
              <div className="mt-6 flex justify-center">
                <Link
                  href="/conventions"
                  className={cn(
                    CONBLOCK_PRIMARY,
                    'inline-flex items-center gap-2 px-5 py-2.5 text-xs'
                  )}
                >
                  <span>All Cons</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            displayed.map((convention) => (
              <ConventionCard key={convention.id} convention={convention} />
            ))
          )}
        </div>
      )}

      <ConventionRequest />
    </section>
  );
}
