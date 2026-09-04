import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowUpRight, MapPin } from 'lucide-react';
import type { Convention } from '../types';
import { cn } from '@/shared/lib/utils';

function formatDateRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);

  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, 'MMM d')} \u2013 ${format(end, 'MMM d, yyyy')}`;
  }

  return `${format(start, 'MMM d, yyyy')} \u2013 ${format(end, 'MMM d, yyyy')}`;
}

export function ConventionRow({ convention, index }: { convention: Convention; index: number }) {
  const isActive = convention.status === 'active';
  const month = format(new Date(convention.startsAt), 'MMM').toUpperCase();

  return (
    <article className="group border-ink hover:bg-accent-soft/50 border-b-2 border-dashed px-2 py-6 transition-colors md:px-4 dark:hover:bg-zinc-900/40">
      <div className="grid items-center gap-x-4 gap-y-3 md:grid-cols-[4rem_5rem_1fr_auto] md:gap-x-6">
        <span className="font-display text-accent group-hover:text-accent-pop hidden text-4xl leading-none transition-colors md:block">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="border-ink flex h-14 items-center justify-center rounded-md border-2 bg-white px-3 shadow-[3px_3px_0_var(--ink)] dark:bg-zinc-900">
          <span className="font-display text-xs tracking-widest">{month}</span>
        </div>

        <div>
          <h3 className="font-display text-xl tracking-wide uppercase md:text-2xl">
            {convention.name}
            <span className="text-accent-pop ml-2">!</span>
          </h3>
          <p className="text-accent mt-1 text-sm font-medium">
            {formatDateRange(convention.startsAt, convention.endsAt)}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>
              {convention.venue}, {convention.city}
            </span>
          </p>
          <p className="mt-2 hidden max-w-xl text-sm leading-relaxed text-zinc-600 sm:block dark:text-zinc-400">
            {convention.description}
          </p>
        </div>

        <div className="flex flex-row items-center justify-between gap-4 md:flex-col md:items-end">
          <span
            className={cn(
              'font-display border-ink -rotate-6 rounded-full border-2 px-3.5 py-1 text-[11px] tracking-widest uppercase shadow-[2px_2px_0_var(--ink)]',
              isActive
                ? 'bg-accent-pop text-white'
                : 'text-ink bg-white dark:bg-zinc-900 dark:text-zinc-100'
            )}
          >
            {isActive ? 'now!' : 'up!'}
          </span>
          <Link
            href={convention.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${convention.name} website`}
            className="border-ink text-ink hover:border-accent-pop hover:text-accent-pop inline-flex h-9 w-9 items-center justify-center rounded-md border-2 transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none dark:text-zinc-100"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
