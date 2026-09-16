'use client';

import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Gift, Globe, Home, MapPin, Users } from 'lucide-react';
import { formatDateRange } from '@/shared/lib/dates';

import { useConvention } from '../data/api';
import { ConventionSwitcher } from './ConventionSwitcher';

const COMING_SOON = [
  { label: 'Freebies', icon: Gift },
  { label: 'Schedule', icon: CalendarDays },
  { label: 'Meetups', icon: Users },
];

export function ConventionSidebar({ slug }: { slug: string }) {
  const { data: convention } = useConvention(slug);

  if (!convention) return null;

  const location = [convention.venue_name, convention.city, convention.country]
    .filter(Boolean)
    .join(', ');

  return (
    <aside className="border-ink hidden w-72 shrink-0 border-r-2 md:sticky md:top-16 md:block md:h-[calc(100vh-4rem)] md:self-start md:overflow-y-auto">
      <div className="border-ink border-b-2 border-dashed p-4">
        <p className="font-display mb-2 text-[10px] tracking-widest text-zinc-500 uppercase dark:text-zinc-400">
         Showing
        </p>
        <ConventionSwitcher currentSlug={slug} />
      </div>

      <div className="p-4">
        <p className="font-display text-[11px] tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          {formatDateRange(convention.starts_at, convention.ends_at)}
        </p>
        <p className="font-display mt-1.5 text-sm tracking-wide uppercase">{convention.name}</p>
        {location && (
          <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{location}</span>
          </p>
        )}
        {convention.is_featured && (
          <span className="border-ink bg-accent-pop font-display mt-3 -rotate-2 inline-block rounded-[2px] border-2 px-2 py-0.5 text-[10px] tracking-wide text-white uppercase shadow-[2px_2px_0_var(--ink)]">
            featured
          </span>
        )}
      </div>

      <nav className="border-ink border-t-2 px-2 py-2" aria-label="Convention sections">
        <Link
          href={`/conventions/${convention.slug}`}
          aria-current="page"
          className="border-ink bg-accent flex items-center gap-2.5 border-b-2 border-dashed px-3 py-2.5 text-xs font-bold tracking-widest text-white uppercase"
        >
          <Home className="h-4 w-4" />
          Overview
        </Link>
        {COMING_SOON.map(({ label, icon: Icon }) => (
          <span
            key={label}
            className="border-ink flex items-center gap-2.5 border-b-2 border-dashed px-3 py-2.5 text-xs font-bold tracking-widest text-zinc-400 uppercase dark:text-zinc-500"
          >
            <Icon className="h-4 w-4" />
            {label}
            <span className="font-display ml-auto -rotate-3 border-2 border-current px-1.5 py-0.5 text-[9px]">
              soon
            </span>
          </span>
        ))}
      </nav>

      {(convention.website_url || convention.map_url) && (
        <div className="border-ink flex flex-col gap-2 border-t-2 p-4">
          {convention.website_url && (
            <a
              href={convention.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="border-ink bg-accent hover:bg-accent-pop inline-flex items-center justify-center gap-2 border-2 px-4 py-2.5 text-xs font-bold tracking-widest text-white uppercase shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
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
              className="border-ink text-ink hover:border-accent-pop hover:text-accent-pop inline-flex items-center justify-center gap-2 border-2 bg-white px-4 py-2.5 text-xs font-bold tracking-widest uppercase transition-colors dark:bg-zinc-900 dark:text-zinc-100"
            >
              <MapPin className="h-4 w-4" />
              View map
            </a>
          )}
        </div>
      )}

      <div className="border-ink border-t-2 p-4">
        <Link
          href="/conventions"
          className="text-accent hover:text-accent-pop inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
          All conventions
        </Link>
      </div>
    </aside>
  );
}