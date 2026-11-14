'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowUpRight, MapPin, Sparkles, X } from 'lucide-react';
import { formatDateRange, parseDate } from '@/shared/lib/dates';
import { cn } from '@/shared/lib/utils';
import { BrandMark } from '@/shared/components/brand/BrandMark';
import { IconButton } from '@/shared/components/ui';

import { useConvention } from '../../data/api';
import { useConventionNav } from './ConventionNavProvider';
import { ConventionNavList } from './ConventionNavList';
import { HeaderSearch } from '../search/HeaderSearch';
import { ConventionExternalLinks } from '../links/ConventionExternalLinks';

export function ConventionSidebar({
  slug,
  variant = 'desktop',
  onClose,
}: {
  slug: string;
  variant?: 'desktop' | 'drawer';
  onClose?: () => void;
}) {
  const { data: convention } = useConvention(slug);
  const nav = useConventionNav();

  if (!convention) return null;

  const month = format(parseDate(convention.starts_at), 'MMM').toUpperCase();
  const location = [convention.venue_name, convention.city, convention.country]
    .filter(Boolean)
    .join(', ');

  const content = (
    <>
      <div className="border-ink border-b-2 border-dashed p-4">
        <p className="font-display mb-2 text-[10px] font-bold tracking-widest text-zinc-700 uppercase dark:text-zinc-100">
          Search conventions
        </p>
        <HeaderSearch variant="sidebar" onSelect={onClose} />
      </div>

      <div className="border-ink border-b-2 border-dashed p-4">
        <div className="flex items-center gap-3">
          <div className="border-ink flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-none border-2 bg-white shadow-[3px_3px_0_var(--ink)] dark:bg-zinc-900">
            <span className="font-display text-xs font-bold tracking-wide text-zinc-900 dark:text-white">
              {month}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-display truncate text-sm leading-tight tracking-wide uppercase">
              {convention.name}
            </p>
            <p className="text-accent mt-1 text-xs font-medium">
              {formatDateRange(convention.starts_at, convention.ends_at)}
            </p>
          </div>
        </div>

        {convention.is_featured && (
          <span className="border-ink bg-accent-pop font-display mt-3 inline-block -rotate-2 rounded-[2px] border-2 px-2 py-0.5 text-[10px] tracking-wide text-white uppercase shadow-[2px_2px_0_var(--ink)]">
            featured
          </span>
        )}

        {location && (
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{location}</span>
          </p>
        )}
      </div>

      <nav
        className="border-ink flex flex-col border-b-2 border-dashed px-2 py-2"
        aria-label="Convention sections"
      >
        <ConventionNavList variant="expanded" slug={convention.slug} onClose={onClose} />
      </nav>

      {(convention.website_url || convention.map_url) && (
        <div className="border-ink border-b-2 border-dashed p-4">
          <ConventionExternalLinks
            websiteUrl={convention.website_url}
            mapUrl={convention.map_url}
            variant="full"
          />
        </div>
      )}

      <div className="p-4">
        <Link
          href="/conventions"
          onClick={onClose}
          className="text-accent hover:text-accent-pop inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
          All conventions
        </Link>
      </div>
    </>
  );

  if (variant === 'drawer') {
    return (
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${convention.name} menu`}
        className="border-ink flex h-full flex-col border-r-2 bg-white dark:bg-[#373b3e]"
      >
        <div className="border-ink flex shrink-0 items-center justify-between gap-2 border-b-2 p-4">
          <Link href="/" onClick={onClose} className="group flex min-w-0 items-center gap-2">
            <BrandMark size="sm" boxClassName="shrink-0" />
            <span className="font-display truncate text-xs tracking-wide transition-all duration-200 [text-shadow:2px_2px_0_color-mix(in_srgb,var(--ink)_22%,transparent)] group-hover:translate-y-0.5 group-hover:[text-shadow:1px_1px_0_color-mix(in_srgb,var(--ink)_22%,transparent)]">
              conmeet
              <span className="text-accent group-hover:text-accent-pop transition-colors duration-200">
                .moe
              </span>
            </span>
            <Sparkles className="text-accent h-3 w-3 rotate-12 transition-transform group-hover:rotate-45" />
          </Link>
          <IconButton
            size="sm"
            onClick={onClose}
            aria-label="Close convention menu"
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </IconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{content}</div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        'border-ink relative hidden shrink-0 min-[900px]:sticky min-[900px]:top-16 min-[900px]:block min-[900px]:h-[calc(100vh-4rem)] min-[900px]:self-start min-[900px]:overflow-hidden min-[900px]:border-r-2',
        nav?.isMounted &&
          'min-[900px]:transition-[width] min-[900px]:duration-300 min-[900px]:ease-in-out',
        nav?.sidebarCollapsed ? 'min-[900px]:w-14' : 'min-[900px]:w-72'
      )}
    >
      <div
        className={cn(
          'absolute inset-0 overflow-y-auto',
          nav?.isMounted && 'transition-opacity duration-300',
          nav?.sidebarCollapsed ? 'pointer-events-none opacity-0' : 'opacity-100'
        )}
      >
        {content}
      </div>
      <div
        className={cn(
          'absolute inset-0 scrollbar-none overflow-x-hidden overflow-y-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
          nav?.isMounted && 'transition-opacity duration-300',
          nav?.sidebarCollapsed ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <nav
          aria-label="Convention sections"
          className="flex min-h-full flex-col items-center gap-1 py-2"
        >
          <HeaderSearch variant="collapsed" />
          <div className="border-ink mt-1 w-7 border-t-2 border-dashed" />
          <ConventionNavList variant="collapsed" slug={convention.slug} />

          {(convention.website_url || convention.map_url) && (
            <>
              <div className="border-ink mt-1 w-7 border-t-2 border-dashed" />
              <ConventionExternalLinks
                websiteUrl={convention.website_url}
                mapUrl={convention.map_url}
                variant="icon"
                className="flex-col gap-1"
              />
            </>
          )}
        </nav>
      </div>
    </aside>
  );
}
