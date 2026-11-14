'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { CONVENTION_PAGES } from '../../data/conventionPages';

export interface ConventionNavListProps {
  variant: 'expanded' | 'collapsed';
  slug: string;
  onClose?: () => void;
}

export function ConventionNavList({ variant, slug, onClose }: ConventionNavListProps) {
  const pathname = usePathname();

  return (
    <>
      {CONVENTION_PAGES.map((page) => {
        const Icon = page.icon;
        const active = page.isActive(pathname, slug);
        const href = page.getHref(slug);
        const isSoon = page.status === 'soon';

        if (variant === 'collapsed') {
          if (isSoon) {
            return (
              <span
                key={page.id}
                title={`${page.label} (${page.badge ?? 'soon'})`}
                aria-label={`${page.label} (${page.badge ?? 'soon'})`}
                className="border-ink flex h-9 w-9 cursor-not-allowed items-center justify-center border-2 text-zinc-400 dark:text-zinc-500"
              >
                <Icon className="h-4 w-4" />
              </span>
            );
          }

          return (
            <Link
              key={page.id}
              href={href}
              aria-current={active ? 'page' : undefined}
              aria-label={page.label}
              title={page.label}
              className={cn(
                'border-ink flex h-9 w-9 cursor-pointer items-center justify-center border-2 shadow-[1px_1px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none',
                active
                  ? 'bg-accent text-white dark:text-zinc-950'
                  : 'hover:border-accent-pop hover:text-accent-pop bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
              )}
            >
              <Icon className="h-4 w-4" />
            </Link>
          );
        }

        // Expanded variant (desktop expanded & mobile drawer)
        if (isSoon) {
          return (
            <span
              key={page.id}
              className="border-ink flex items-center gap-2.5 border-b-2 border-dashed px-3 py-2.5 text-xs font-bold tracking-widest text-zinc-400 uppercase dark:text-zinc-500"
            >
              <Icon className="h-4 w-4" />
              {page.label}
              <span className="font-display ml-auto -rotate-3 border-2 border-current px-1.5 py-0.5 text-[9px]">
                {page.badge ?? 'soon'}
              </span>
            </span>
          );
        }

        return (
          <Link
            key={page.id}
            href={href}
            aria-current={active ? 'page' : undefined}
            onClick={onClose}
            className={cn(
              'border-ink flex items-center gap-2.5 border-b-2 border-dashed px-3 py-2.5 text-xs font-bold tracking-widest uppercase transition-colors',
              active
                ? 'bg-accent text-white dark:text-zinc-950'
                : 'text-zinc-700 hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-800'
            )}
          >
            <Icon className="h-4 w-4" />
            {page.label}
          </Link>
        );
      })}
    </>
  );
}
