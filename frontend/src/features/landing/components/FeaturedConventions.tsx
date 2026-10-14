'use client';

import { Star } from 'lucide-react';
import { useConventions } from '@/features/conventions/data/api';
import { isPast } from '@/features/conventions/utils/dates';
import { ConventionCard } from '@/features/conventions';

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

      <div className="mt-8 flex flex-col gap-6">
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

      <div className="border-ink mt-12 border-b-2 border-dashed md:mt-16" aria-hidden="true" />
    </section>
  );
}
