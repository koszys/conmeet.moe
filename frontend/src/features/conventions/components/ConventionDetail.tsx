'use client';

import { MapPin } from 'lucide-react';
import { formatDateRange } from '@/shared/lib/dates';

import { useConvention } from '../data/api';
import { getConventionPhase } from '../utils/dates';
import { ConventionSwitcher } from './ConventionSwitcher';

function DetailSkeleton() {
  return (
    <main className="w-full animate-pulse">
      <div className="border-ink h-44 border-b-2 bg-zinc-100 md:h-64 dark:bg-zinc-900" />
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
              className="border-ink bg-accent cursor-pointer border-2 px-5 py-2.5 text-xs font-bold tracking-widest text-white uppercase shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isLoading && !isError && convention && (
        <>
          <div className="border-b-2 px-4 pt-6 sm:px-6 md:hidden">
            <ConventionSwitcher currentSlug={slug} />
          </div>

          <div className="border-ink relative h-44 w-full overflow-hidden border-b-2 bg-accent-soft/40 md:h-72 lg:h-80 dark:bg-zinc-900">
{convention.banner ? (
              <img src={convention.banner} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-start justify-center gap-3 px-6 md:px-10">
                <span
                  className={`font-display ${
                    getConventionPhase(convention) === 'now'
                      ? 'bg-accent-pop'
                      : getConventionPhase(convention) === 'soon'
                        ? 'bg-accent'
                        : 'border-2 border-ink text-ink dark:text-zinc-100'
                  } inline-flex -rotate-3 items-center px-2.5 py-1 text-xs tracking-wide text-white uppercase shadow-[2px_2px_0_var(--ink)]`}
                >
                  {getConventionPhase(convention) === 'now'
                    ? 'HAPPENING NOW'
                    : getConventionPhase(convention) === 'soon'
                      ? 'SOON!'
                      : 'COMING UP'}
                </span>
                <h2 className="font-display text-3xl tracking-wide uppercase [text-shadow:3px_3px_0_color-mix(in_srgb,var(--ink)_22%,transparent)] sm:text-5xl lg:text-6xl">
                  {convention.name}
                </h2>
                {(convention.venue_name || convention.city || convention.country) && (
                  <p className="flex items-center gap-1.5 text-sm font-bold tracking-widest text-zinc-600 uppercase dark:text-zinc-300">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {[
                      formatDateRange(convention.starts_at, convention.ends_at),
                      convention.venue_name,
                      convention.city,
                      convention.country,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
            {convention.description && (
              <section className="border-ink py-10">
                <div
                  className="space-y-4 text-base leading-relaxed text-zinc-700 lg:text-lg dark:text-zinc-200 [&_a]:text-accent [&_a]:underline [&_a]:decoration-dotted [&_a]:underline-offset-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
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