'use client';

import { MapPin } from 'lucide-react';
import { formatDateRange } from '@/shared/lib/dates';
import { CONBLOCK_PRIMARY, CopyLinkButton } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

import { useConvention } from '../../data/api';
import { getConventionPhase } from '../../utils/dates';
import { OfficialSiteButton, ViewOnMapButton } from '../links';
import { ConventionSections } from './ConventionSections';
import type { ConventionSectionConfig } from '../../types';

function DetailSkeleton() {
  return (
    <main className="w-full animate-pulse">
      <div className="border-ink min-h-48 border-b-2 bg-zinc-100 sm:min-h-56 md:h-64 lg:h-72 dark:bg-zinc-900" />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-6 h-8 w-1/2 bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-3 h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-8 h-40 bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="h-64 border-2 border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
          <div className="h-64 border-2 border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
        </div>
      </div>
    </main>
  );
}

export function ConventionDetail({
  slug,
  extraSections,
}: {
  slug: string;
  extraSections?: ConventionSectionConfig[];
}) {
  const { data: convention, isLoading, isError, refetch } = useConvention(slug);
  const hasOverview = Boolean(convention?.description && convention.description.trim().length > 0);

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
          <div className="border-ink bg-accent-soft/40 relative flex min-h-48 w-full flex-col justify-center overflow-hidden border-b-2 px-4 py-6 sm:min-h-56 sm:px-6 sm:py-8 md:h-64 md:px-8 lg:h-72 dark:bg-zinc-900">
            {convention.banner && (
              <>
                <img
                  src={convention.banner}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/30 backdrop-blur-[1px] dark:from-zinc-950/95 dark:via-zinc-950/85 dark:to-zinc-950/40"
                />
              </>
            )}

            <div className="relative z-10 flex flex-col items-start justify-center gap-2 sm:gap-2.5">
              <span
                className={cn(
                  'font-display inline-flex -rotate-3 items-center border-2 px-2 py-0.5 text-[10px] tracking-wide uppercase shadow-[2px_2px_0_var(--ink)] sm:px-2.5 sm:text-xs',
                  getConventionPhase(convention) === 'now' && 'border-ink bg-accent-pop text-white',
                  getConventionPhase(convention) === 'soon' &&
                    'border-ink bg-accent text-white dark:text-zinc-950',
                  getConventionPhase(convention) === 'past' &&
                    'border-zinc-400 bg-zinc-200 text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
                  getConventionPhase(convention) === 'up' &&
                    'border-ink text-ink bg-white dark:bg-zinc-900 dark:text-zinc-100'
                )}
              >
                {getConventionPhase(convention) === 'now'
                  ? 'HAPPENING NOW'
                  : getConventionPhase(convention) === 'soon'
                    ? 'SOON!'
                    : getConventionPhase(convention) === 'past'
                      ? 'CON ENDED'
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
              {!hasOverview && (
                <div className="mt-1 sm:mt-1.5">
                  <CopyLinkButton size="sm" />
                </div>
              )}
            </div>
          </div>

          <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 md:px-6">
            {hasOverview && convention.description && (
              <section
                aria-labelledby="overview-heading"
                className="border-ink @container border-2 bg-white p-6 shadow-[4px_4px_0_var(--ink)] sm:p-8 dark:bg-zinc-900"
              >
                <div className="border-ink mb-6 flex items-center justify-between gap-2 border-b-2 border-dashed pb-4">
                  <div className="flex items-center">
                    <h2
                      id="overview-heading"
                      className="font-display bg-accent border-ink inline-block -rotate-1 border-2 px-2.5 py-0.5 text-xs tracking-wider text-white uppercase shadow-[2px_2px_0_var(--ink)] sm:text-sm dark:text-zinc-950"
                    >
                      Overview
                    </h2>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                    <CopyLinkButton size="sm" variant="responsive" />
                    <OfficialSiteButton url={convention.website_url} variant="responsive" />
                    <ViewOnMapButton url={convention.map_url} variant="responsive" />
                  </div>
                </div>

                <div
                  className="[&_a]:text-accent space-y-4 text-base leading-relaxed text-zinc-700 lg:text-lg dark:text-zinc-200 [&_a]:underline [&_a]:decoration-dotted [&_a]:underline-offset-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
                  dangerouslySetInnerHTML={{ __html: convention.description }}
                />
              </section>
            )}

            {/* 2-Column Main Content Area for Sections */}
            <ConventionSections convention={convention} extraSections={extraSections} />
          </div>
        </>
      )}
    </main>
  );
}
