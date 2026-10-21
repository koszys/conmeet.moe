'use client';

import Link from 'next/link';
import { ArrowUpRight, Calendar, Clock, MapPin, Sparkles } from 'lucide-react';
import { formatDateRange } from '@/shared/lib/dates';
import { CONBLOCK } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { getConventionPhase } from '../../utils/dates';
import type { Convention, ConventionPhase } from '../../types';
import { ConventionExternalLinks } from '../links/ConventionExternalLinks';

const PHASE_CONFIG: Record<
  ConventionPhase,
  { label: string; chipClass: string; icon?: React.ComponentType<{ className?: string }> }
> = {
  now: {
    label: 'HAPPENING NOW',
    chipClass: 'bg-accent-pop text-white',
  },
  soon: {
    label: 'SOON!',
    chipClass: 'bg-accent text-white dark:text-zinc-950',
  },
  up: {
    label: 'COMING UP',
    chipClass: 'bg-white text-ink dark:bg-zinc-900 dark:text-zinc-100',
  },
  past: {
    label: 'ENDED',
    chipClass:
      'border-zinc-400 bg-zinc-200 text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
  },
};

export interface ConventionCardProps {
  convention: Convention;
  className?: string;
}

export function ConventionCard({ convention, className }: ConventionCardProps) {
  const phase = getConventionPhase(convention);
  const phaseInfo = PHASE_CONFIG[phase];
  const bannerUrl = convention.banner || convention.banner_thumb;
  const location = [convention.venue_name, convention.city].filter(Boolean).join(', ');

  return (
    <article
      className={cn(
        'border-ink group relative flex min-h-60 flex-col justify-between overflow-hidden border-2 bg-white shadow-[4px_4px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--ink)] sm:min-h-64 md:min-h-72 dark:bg-zinc-900',
        phase === 'past' && 'opacity-85 hover:opacity-100',
        className
      )}
    >
      {/* Background Banner Image & Overlay */}
      {bannerUrl ? (
        <>
          <img
            src={bannerUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/90 to-white/70 backdrop-blur-[1px] md:bg-gradient-to-r md:from-white/95 md:via-white/85 md:to-white/40 dark:bg-gradient-to-b dark:from-zinc-950/95 dark:via-zinc-950/90 dark:to-zinc-950/70 dark:md:bg-gradient-to-r dark:md:from-zinc-950/95 dark:md:via-zinc-950/85 dark:md:to-zinc-950/40"
          />
        </>
      ) : (
        <div className="halftone bg-accent-soft/30 absolute inset-0 dark:bg-zinc-800/80">
          <Sparkles className="text-accent absolute right-6 bottom-6 h-8 w-8 rotate-12 opacity-40" />
        </div>
      )}

      {/* Background clickable area for navigation */}
      <Link
        href={`/conventions/${convention.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="absolute inset-0 z-0"
      />

      {/* Card Content & Action Footer */}
      <div className="relative z-10 flex flex-1 flex-col justify-between">
        <div className="p-5 sm:p-6 md:p-8">
          {/* Phase Badge */}
          <div className="mb-3 flex items-center">
            <span
              className={cn(
                'border-ink font-display inline-flex -rotate-2 items-center gap-1.5 border-2 px-2.5 py-0.5 text-[10px] tracking-wide uppercase shadow-[2px_2px_0_var(--ink)] sm:text-[11px]',
                phaseInfo.chipClass
              )}
            >
              {phaseInfo.icon && <phaseInfo.icon className="h-3 w-3 shrink-0" />}
              <span>{phaseInfo.label}</span>
            </span>
          </div>

          {/* Convention Title */}
          <Link href={`/conventions/${convention.slug}`} className="group/link block">
            <h3 className="font-display group-hover/link:text-accent-pop text-xl font-bold tracking-wide uppercase transition-colors sm:text-2xl md:text-3xl">
              {convention.name}
              {phase !== 'past' && <span className="text-accent-pop ml-2">!</span>}
            </h3>
          </Link>

          {/* Date & Location */}
          <div className="mt-3 flex flex-col gap-1.5 sm:mt-4 sm:gap-2">
            <div className="text-accent flex items-center gap-2 text-xs font-semibold sm:text-sm sm:font-medium">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{formatDateRange(convention.starts_at, convention.ends_at)}</span>
            </div>

            {location && (
              <div className="flex items-center gap-2 text-xs text-zinc-700 sm:text-sm dark:text-zinc-300">
                <MapPin className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card Action Footer */}
        <div className="border-ink relative z-10 flex items-center justify-between border-t-2 border-dashed bg-white/60 px-5 py-3.5 backdrop-blur-xs sm:px-6 md:px-8 dark:bg-zinc-950/60">
          <ConventionExternalLinks
            websiteUrl={convention.website_url}
            mapUrl={convention.map_url}
            variant="icon"
          />

          <Link
            href={`/conventions/${convention.slug}`}
            className={cn(
              CONBLOCK,
              'font-display bg-accent hover:bg-accent-pop inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs tracking-wider text-white uppercase dark:text-zinc-950 dark:hover:text-white'
            )}
          >
            <span>View Con</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
