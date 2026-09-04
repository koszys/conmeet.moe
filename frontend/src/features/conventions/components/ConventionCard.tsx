import Link from 'next/link';
import { format } from 'date-fns';
import { ExternalLink, MapPin } from 'lucide-react';
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

export function ConventionCard({ convention }: { convention: Convention }) {
  const isActive = convention.status === 'active';

  return (
    <article className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{convention.name}</h3>
        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
            isActive
              ? 'bg-accent-soft text-accent'
              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
          )}
        >
          {isActive ? 'Active' : 'Upcoming'}
        </span>
      </div>

      <time className="text-accent mt-1 text-sm font-medium">
        {formatDateRange(convention.startsAt, convention.endsAt)}
      </time>

      <p className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span>
          {convention.venue}, {convention.city}
        </span>
      </p>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {convention.description}
      </p>

      <Link
        href={convention.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent hover:text-accent-hover mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
      >
        Visit site
        <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}
