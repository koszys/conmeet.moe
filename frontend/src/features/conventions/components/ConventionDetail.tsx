'use client';

import { MapPin } from 'lucide-react';
import { formatDateRange } from '@/shared/lib/dates';
import { CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

import { useConvention } from '../data/api';
import { getConventionPhase } from '../utils/dates';

function DetailSkeleton() {
  return (
    <main className="w-full animate-pulse">
      <div className="border-ink min-h-40 border-b-2 bg-zinc-100 sm:min-h-48 md:h-56 lg:h-64 dark:bg-zinc-900" />
      <div className="px-6 py-8 md:px-8">
        <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-6 h-8 w-1/2 bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-3 h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-8 h-40 bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </main>
  );
}

export function ConventionDetail({ slug }: { slug: string }) {
  const { data: convention, isLoading, isError, refetch } = useConvention(slug);

  return (
    <main className="w-full">
      {isLoading && <DetailSkeleton />}

      {isError && (
        <div className="flex w-full flex-col items-center px-6 py-24 text-center">
          <h1 className="font-display text-2xl tracking-wide uppercase sm:text-3xl">
            could not find that convention!
          </h1>
          <p className="mt-3 max-w-md text-zinc-600 dark:text-zinc-300">
            This con either doesn&apos;t exist or isn&apos;t published yet.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => void refetch()}
              className={cn(CONBLOCK_PRIMARY, 'px-5 py-2.5')}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isLoading && !isError && convention && (
        <>
          <div className="border-ink bg-accent-soft/40 relative flex min-h-40 w-full flex-col justify-center border-b-2 px-4 py-4 sm:min-h-48 sm:px-6 sm:py-5 md:h-56 md:px-8 lg:h-64 dark:bg-zinc-900">
            {convention.banner ? (
              <img src={convention.banner} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-start justify-center gap-2 sm:gap-2.5">
                <span
                  className={`font-display ${
                    getConventionPhase(convention) === 'now'
                      ? 'bg-accent-pop'
                      : getConventionPhase(convention) === 'soon'
                        ? 'bg-accent'
                        : 'border-ink text-ink border-2 dark:text-zinc-100'
                  } inline-flex -rotate-3 items-center px-2 py-0.5 text-[10px] tracking-wide text-white uppercase shadow-[2px_2px_0_var(--ink)] sm:px-2.5 sm:text-xs`}
                >
                  {getConventionPhase(convention) === 'now'
                    ? 'HAPPENING NOW'
                    : getConventionPhase(convention) === 'soon'
                      ? 'SOON!'
                      : 'COMING UP'}
                </span>
                <h1 className="font-display text-lg leading-snug tracking-wide break-words uppercase [text-shadow:2px_2px_0_color-mix(in_srgb,var(--ink)_22%,transparent)] sm:text-2xl sm:[text-shadow:3px_3px_0_color-mix(in_srgb,var(--ink)_22%,transparent)] md:text-4xl lg:text-5xl">
                  {convention.name}
                </h1>
                <div className="mt-0.5 flex flex-col items-start gap-1 sm:mt-1">
                  <p className="text-accent text-xs font-semibold sm:text-sm sm:font-medium">
                    {formatDateRange(convention.starts_at, convention.ends_at)}
                  </p>
                  {(convention.venue_name || convention.city || convention.country) && (
                    <p className="flex items-start gap-1.5 text-xs font-bold tracking-wider text-zinc-600 uppercase sm:text-sm sm:tracking-widest dark:text-zinc-300">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                      <span className="break-words">
                        {[convention.venue_name, convention.city, convention.country]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
            {convention.description && (
              <section className="border-ink py-10">
                <div
                  className="[&_a]:text-accent space-y-4 text-base leading-relaxed text-zinc-700 lg:text-lg dark:text-zinc-200 [&_a]:underline [&_a]:decoration-dotted [&_a]:underline-offset-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
                  dangerouslySetInnerHTML={{ __html: convention.description }}
                />
              </section>
            )}
          </div>
        </>
      )}
    </main>
  );
}
