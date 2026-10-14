'use client';

import Link from 'next/link';
import { ArrowUpRight, Calendar, MapPin, Sparkles, Star } from 'lucide-react';
import { formatDateRange } from '@/shared/lib/dates';
import { CONBLOCK } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { getConventionPhase } from '../utils/dates';
import type { Convention, ConventionPhase } from '../types';
import { ConventionExternalLinks } from './ConventionExternalLinks';

const PHASE_CONFIG: Record<ConventionPhase, { label: string; chipClass: string }> = {
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
  const bannerUrl = convention.banner_thumb || convention.banner;
  const location = [convention.venue_name, convention.city].filter(Boolean).join(', ');

  return (
    <article
      className={cn(
        'border-ink group flex flex-col justify-between border-2 bg-white shadow-[4px_4px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-900',
        phase === 'past' && 'opacity-85 hover:opacity-100',
        className
      )}
    >
      <div>
        {/* Banner container */}
        <Link
          href={`/conventions/${convention.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className="border-ink relative block aspect-video w-full overflow-hidden border-b-2 bg-zinc-100 dark:bg-zinc-800"
        >
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt={convention.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="halftone bg-accent-soft/30 relative flex h-full w-full items-center justify-center p-4 dark:bg-zinc-800/80">
              <span className="font-display text-ink/15 text-3xl font-black tracking-widest uppercase select-none sm:text-4xl dark:text-white/10">
                {convention.name.slice(0, 3)}
              </span>
              <Sparkles className="text-accent absolute right-3 bottom-3 h-5 w-5 rotate-12 opacity-60" />
            </div>
          )}

          {/* Floating Badges */}
          <div className="pointer-events-none absolute inset-x-2.5 top-2.5 flex items-center justify-between gap-2">
            <span
              className={cn(
                'border-ink font-display rounded-none border-2 px-2.5 py-0.5 text-[10px] tracking-wide uppercase shadow-[2px_2px_0_var(--ink)] sm:text-[11px]',
                phaseInfo.chipClass
              )}
            >
              {phaseInfo.label}
            </span>
          </div>
        </Link>

        {/* Card Content */}
        <div className="p-4 sm:p-5">
          <Link href={`/conventions/${convention.slug}`} className="group/link block">
            <h3 className="font-display group-hover/link:text-accent-pop text-lg font-bold tracking-wide uppercase transition-colors sm:text-xl">
              {convention.name}
              {phase !== 'past' && <span className="text-accent-pop ml-1.5">!</span>}
            </h3>
          </Link>

          <div className="text-accent mt-2.5 flex items-center gap-2 text-xs font-semibold sm:text-sm sm:font-medium">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDateRange(convention.starts_at, convention.ends_at)}</span>
          </div>

          {location && (
            <div className="mt-1.5 flex items-center gap-2 text-xs text-zinc-600 sm:text-sm dark:text-zinc-300">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="border-ink mt-2 flex items-center justify-between border-t-2 border-dashed px-4 py-3 sm:px-5">
        <ConventionExternalLinks
          websiteUrl={convention.website_url}
          mapUrl={convention.map_url}
          variant="icon"
        />

        <Link
          href={`/conventions/${convention.slug}`}
          className={cn(
            CONBLOCK,
            'font-display bg-accent hover:bg-accent-pop inline-flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wider text-white uppercase dark:text-zinc-950 dark:hover:text-white'
          )}
        >
          <span>View Con</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
