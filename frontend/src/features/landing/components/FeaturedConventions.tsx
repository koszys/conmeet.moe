'use client';

import { Star } from 'lucide-react';
import { useConventions } from '@/features/conventions/data/api';
import {
  FeaturedConsButton,
  FeaturedConventionSlider,
  isFeaturedVisible,
  sortFeaturedConventions,
} from '@/features/conventions';
import { MikuLoader } from '@/shared/components/miku';

export function FeaturedConventions() {
  const { data = [], isLoading } = useConventions();

  const featured = sortFeaturedConventions(
    data.filter((convention) => isFeaturedVisible(convention))
  );

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
        <FeaturedConsButton />
      </div>

      <div className="mt-8">
        {isLoading && (
          <div className="flex min-h-[300px] w-full flex-col items-center justify-center py-8">
            <MikuLoader message="Spotlighting featured cons..." size="lg" />
          </div>
        )}
        {!isLoading && <FeaturedConventionSlider conventions={featured} />}
      </div>

      <div className="border-ink mt-12 border-b-2 border-dashed md:mt-16" aria-hidden="true" />
    </section>
  );
}
