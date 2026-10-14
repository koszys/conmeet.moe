'use client';

import { Star } from 'lucide-react';
import { useConventions } from '@/features/conventions/data/api';
import { isPast } from '@/features/conventions/utils/dates';
import { ConventionCard } from '@/features/conventions/components/ConventionCard';
import { cn } from '@/shared/lib/utils';

function CardSkeleton() {
  return (
    <div className="border-ink flex animate-pulse flex-col border-2 bg-white shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-900">
      <div className="border-ink aspect-video w-full border-b-2 bg-zinc-200 dark:bg-zinc-800" />
      <div className="space-y-3 p-4 sm:p-5">
        <div className="h-5 w-2/3 bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-1/3 bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="border-ink mt-2 border-t-2 border-dashed p-4">
        <div className="h-7 w-20 bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

export function FeaturedConventions() {
  const { data = [], isLoading } = useConventions();

  const featured = data.filter((convention) => convention.is_featured && !isPast(convention));

  if (!isLoading && featured.length === 0) {
    return null;
  }

  return (
    <section
      id="featured-conventions"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-16 pb-4 md:px-6"
    >
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="border-ink bg-accent-pop font-display inline-flex items-center gap-1.5 border-2 px-2.5 py-1 text-xs text-white uppercase shadow-[2px_2px_0_var(--ink)]">
              <Star className="h-3.5 w-3.5 fill-current" />
              SPOTLIGHT
            </span>
          </div>
          <h2 className="font-display mt-3 text-2xl tracking-wide uppercase sm:text-4xl">
            featured conventions
            <span className="text-accent ml-3">★</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base dark:text-zinc-300">
            Cons you definitely don&apos;t want to miss.
          </p>
        </div>
      </div>

      <div
        className={cn(
          'mt-8 grid gap-6',
          featured.length === 1 && 'max-w-xl grid-cols-1',
          featured.length === 2 && 'grid-cols-1 md:grid-cols-2',
          featured.length >= 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        )}
      >
        {isLoading && (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        )}

        {!isLoading &&
          featured.map((convention) => (
            <ConventionCard key={convention.id} convention={convention} />
          ))}
      </div>
    </section>
  );
}
