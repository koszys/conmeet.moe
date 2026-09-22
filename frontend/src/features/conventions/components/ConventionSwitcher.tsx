'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown } from 'lucide-react';
import { formatDateRange } from '@/shared/lib/dates';
import { cn } from '@/shared/lib/utils';

import { useConventions } from '../data/api';
import { isPast } from '../utils/dates';

/**
 * @deprecated Currently unused.
 * Replaced by HeaderSearch in ConventionSidebar for searching and switching conventions directly.
 * Preserved for reference or future dropdown switching needs.
 */
export function ConventionSwitcher({ currentSlug }: { currentSlug: string }) {
  const router = useRouter();
  const { data = [] } = useConventions();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const current = data.find((convention) => convention.slug === currentSlug);
  const upcomingOptions = data.filter(
    (convention) => convention.slug !== currentSlug && !isPast(convention)
  );
  const pastOptions = data
    .filter((convention) => convention.slug !== currentSlug && isPast(convention))
    .sort(
      (a, b) =>
        new Date(b.ends_at).getTime() - new Date(a.ends_at).getTime() ||
        new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
    );
  const options = [...upcomingOptions, ...pastOptions];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  function go(slug: string) {
    setOpen(false);
    if (slug !== currentSlug) {
      router.push(`/conventions/${slug}`);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="border-ink hover:border-accent-pop text-ink flex w-full cursor-pointer items-center justify-between gap-2 border-2 bg-white px-3 py-2.5 text-left text-xs font-bold tracking-widest uppercase dark:bg-zinc-900 dark:text-zinc-100"
      >
        <span className="truncate">{current?.name ?? '…'}</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="border-ink absolute top-full right-0 z-50 mt-2 w-full min-w-56 border-2 bg-white shadow-[3px_3px_0_var(--ink)] dark:bg-[#373b3e]">
          {options.length === 0 ? (
            <p className="px-3 py-3 text-center text-[10px] tracking-widest text-zinc-500 uppercase">
              No other conventions yet
            </p>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {current && (
                <li>
                  <button
                    type="button"
                    onClick={() => go(current.slug)}
                    aria-current="true"
                    className="hover:text-accent-pop border-ink flex w-full cursor-pointer items-center gap-2 border-b-2 border-dashed px-3 py-2.5 text-left text-xs font-bold tracking-widest uppercase"
                  >
                    <Check className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{current.name}</span>
                  </button>
                </li>
              )}
              {options.map((convention) => (
                <li key={convention.id}>
                  <button
                    type="button"
                    onClick={() => go(convention.slug)}
                    className="hover:text-accent-pop border-ink flex w-full cursor-pointer flex-col items-start gap-0.5 border-b-2 border-dashed px-3 py-2.5 text-left last:border-b-0"
                  >
                    <span className="truncate text-xs font-bold tracking-widest uppercase">
                      {convention.name}
                    </span>
                    <span className="text-[10px] tracking-widest text-zinc-500 uppercase dark:text-zinc-300">
                      {[convention.city, convention.country].filter(Boolean).join(', ')} ·{' '}
                      {formatDateRange(convention.starts_at, convention.ends_at)}
                      {isPast(convention) && ' · (Ended)'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
