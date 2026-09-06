import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { formatDateRange } from '@/shared/lib/dates';
import type { Convention, ConventionPhase } from '../types';
import { cn } from '@/shared/lib/utils';

const STAMP: Record<ConventionPhase, string> = {
  now: 'now!',
  soon: 'soon!',
  up: 'up!',
};

export function ConventionRow({
  convention,
  phase,
}: {
  convention: Convention;
  phase: ConventionPhase;
}) {
  const month = format(new Date(convention.startsAt), 'MMM').toUpperCase();

  return (
    <article className="group border-ink hover:bg-accent-soft/50 border-b-2 border-dashed px-2 py-6 transition-colors md:px-4 dark:hover:bg-zinc-900/40">
      <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 md:grid-cols-[5rem_1fr_auto] md:gap-x-6">
        <div className="border-ink flex h-14 items-center justify-center rounded-none border-2 bg-white px-3 shadow-[3px_3px_0_var(--ink)] dark:bg-zinc-900">
          <span className="font-display text-xs tracking-wide">{month}</span>
        </div>

        <div>
          <h3 className="font-display text-base tracking-wide uppercase md:text-xl">
            {convention.name}
            <span className="text-accent-pop ml-2">!</span>
          </h3>
          <p className="text-accent mt-1 text-sm font-medium">
            {formatDateRange(convention.startsAt, convention.endsAt)}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-300">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>
              {convention.venue}, {convention.city}
            </span>
          </p>
          <p className="mt-2 hidden max-w-xl text-sm leading-relaxed text-zinc-600 sm:block dark:text-zinc-300">
            {convention.description}
          </p>
        </div>

        <div className="col-span-2 flex flex-row items-center justify-between gap-4 md:col-span-1 md:flex-col md:items-end">
          <span
            className={cn(
              'font-display border-ink -rotate-6 rounded-[2px] border-2 px-3.5 py-1 text-[11px] tracking-wide uppercase shadow-[2px_2px_0_var(--ink)]',
              phase === 'now' && 'bg-accent-pop text-white',
              phase === 'soon' && 'bg-accent text-white',
              phase === 'up' && 'text-ink bg-white dark:bg-zinc-900 dark:text-zinc-100'
            )}
          >
            {STAMP[phase]}
          </span>
          <Link
            href={convention.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${convention.name} website`}
            className="border-ink text-ink hover:border-accent-pop hover:text-accent-pop inline-flex h-9 w-9 items-center justify-center rounded-none border-2 transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none dark:text-zinc-100"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
