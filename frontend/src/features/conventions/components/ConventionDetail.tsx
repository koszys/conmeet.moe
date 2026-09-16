'use client';

import Link from 'next/link';
import { ArrowLeft, Globe, MapPin } from 'lucide-react';
import { MikuSilhouette } from '@/shared/components/miku/MikuSilhouette';
import { formatDateRange } from '@/shared/lib/dates';

import { useConvention } from '../data/api';

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
            <Link
              href="/#conventions"
              className="border-ink text-ink hover:border-accent-pop hover:text-accent-pop inline-flex items-center gap-2 border-2 px-5 py-2.5 text-xs font-bold tracking-widest uppercase transition-colors dark:text-zinc-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to line-up
            </Link>
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
          <div className="border-ink relative h-44 overflow-hidden border-b-2 bg-accent-soft/40 md:h-64 dark:bg-zinc-900">
            {convention.banner ? (
              <img src={convention.banner} alt="" className="h-full w-full object-cover" />
            ) : (
              <MikuSilhouette className="text-accent/30 absolute -right-4 bottom-0 hidden h-48 w-auto md:block" />
            )}
          </div>

          <div className="px-6 py-8 md:px-8">
            <Link
              href="/#conventions"
              className="text-accent hover:text-accent-pop inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to line-up
            </Link>

            <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="font-display text-3xl tracking-wide [text-shadow:2px_2px_0_color-mix(in_srgb,var(--ink)_22%,transparent)] sm:text-4xl">
                  {convention.name}
                  <span className="text-accent-pop ml-3">!</span>
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-3 md:hidden">
                  <span className="border-ink text-ink bg-white inline-block border-2 px-3 py-1.5 text-xs font-bold tracking-widest uppercase shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-900 dark:text-zinc-100">
                    {formatDateRange(convention.starts_at, convention.ends_at)}
                  </span>
                  {(convention.venue_name || convention.city || convention.country) && (
                    <span className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-300">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {[convention.venue_name, convention.city, convention.country]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  )}
                  {convention.is_featured && (
                    <span className="border-ink bg-accent-pop font-display -rotate-3 rounded-[2px] border-2 px-3 py-1 text-[11px] tracking-wide text-white uppercase shadow-[2px_2px_0_var(--ink)]">
                      featured
                    </span>
                  )}
                </div>
              </div>

              {(convention.website_url || convention.map_url) && (
                <div className="flex flex-wrap gap-3 md:hidden">
                  {convention.website_url && (
                    <a
                      href={convention.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-ink bg-accent hover:bg-accent-pop inline-flex items-center gap-2 border-2 px-5 py-2.5 text-xs font-bold tracking-widest text-white uppercase shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                    >
                      <Globe className="h-4 w-4" />
                      Official site
                    </a>
                  )}
                  {convention.map_url && (
                    <a
                      href={convention.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-ink text-ink hover:border-accent-pop hover:text-accent-pop inline-flex items-center gap-2 border-2 bg-white px-5 py-2.5 text-xs font-bold tracking-widest uppercase transition-colors dark:bg-zinc-900 dark:text-zinc-100"
                    >
                      <MapPin className="h-4 w-4" />
                      View map
                    </a>
                  )}
                </div>
              )}
            </div>

            {convention.description && (
              <section className="border-ink mt-10 border-t-2 border-dashed py-10">
                <div
                  className="space-y-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-200 [&_a]:text-accent [&_a]:underline [&_a]:decoration-dotted [&_a]:underline-offset-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
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