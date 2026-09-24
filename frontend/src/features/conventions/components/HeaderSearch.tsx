'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { MapPin, Search, X } from 'lucide-react';
import { formatDateRange } from '@/shared/lib/dates';
import { cn } from '@/shared/lib/utils';
import { IconButton } from '@/shared/components/ui/button';

import { useConventions } from '@/features/conventions/data/api';
import { getConventionPhase, isPast } from '../utils/dates';

const MAX_RESULTS = 8;

export function HeaderSearch({
  variant = 'header',
  onSelect,
}: {
  variant?: 'header' | 'sidebar' | 'collapsed';
  onSelect?: () => void;
}) {
  const router = useRouter();
  const { data = [] } = useConventions();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const trimmed = query.trim();
  const results = useMemo(() => {
    const q = trimmed.toLowerCase();
    if (q.length < 2) return [];

    const tokens = q.split(/\s+/).filter(Boolean);

    return data
      .filter((convention) => {
        const startYear = new Date(convention.starts_at).getFullYear().toString();
        const endYear = new Date(convention.ends_at).getFullYear().toString();
        const searchable =
          `${convention.name} ${startYear} ${endYear} ${convention.slug} ${convention.city ?? ''} ${convention.country ?? ''} ${convention.venue_name ?? ''}`.toLowerCase();
        return tokens.every((token) => searchable.includes(token));
      })
      .sort((a, b) => {
        const aStart = a.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bStart = b.name.toLowerCase().startsWith(q) ? 0 : 1;
        if (aStart !== bStart) return aStart - bStart;

        const aPast = isPast(a);
        const bPast = isPast(b);
        if (aPast !== bPast) {
          return aPast ? 1 : -1;
        }

        if (!aPast) {
          return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
        }

        return new Date(b.ends_at).getTime() - new Date(a.ends_at).getTime();
      })
      .slice(0, MAX_RESULTS);
  }, [data, trimmed]);

  function updatePos() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      if (variant === 'collapsed') {
        const aside = buttonRef.current?.closest('aside');
        const asideRight = aside ? aside.getBoundingClientRect().right : rect.right;
        const top = Math.max(12, Math.min(rect.top, window.innerHeight - 380));
        const left = Math.max(12, Math.min(asideRight + 8, window.innerWidth - 340));
        setPos({ top, left });
      } else {
        setPos({
          top: Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - 400)),
          left: Math.max(8, Math.min(rect.right + 8, window.innerWidth - 328)),
        });
      }
    } else if (variant === 'collapsed') {
      setPos({ top: 72, left: 64 });
    }
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const inside =
        (wrapRef.current && wrapRef.current.contains(event.target as Node)) ||
        (panelRef.current && panelRef.current.contains(event.target as Node));
      if (!inside) {
        setOpen(false);
        setPos(null);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open || variant !== 'collapsed') return;
    function handleScrollOrResize() {
      updatePos();
    }
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize);
    };
  }, [open, variant]);

  useEffect(() => {
    function openFromMenu() {
      setOpen(true);
      setQuery('');
      if (variant === 'sidebar') {
        inputRef.current?.focus();
      }
    }
    window.addEventListener('conmeet:open-search', openFromMenu);
    return () => window.removeEventListener('conmeet:open-search', openFromMenu);
  }, [variant]);

  function select(slug: string) {
    setOpen(false);
    setPos(null);
    setQuery('');
    onSelect?.();
    router.push(`/conventions/${slug}`);
  }

  function toggleSearch() {
    if (open) {
      setOpen(false);
      setPos(null);
      return;
    }
    updatePos();
    setOpen(true);
    setQuery('');
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false);
      setQuery('');
      event.stopPropagation();
    } else if (results.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % results.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((index) => (index - 1 + results.length) % results.length);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        select(results[activeIndex].slug);
      }
    }
  }

  const list = (
    <ul className="max-h-72 overflow-y-auto">
      {results.map((convention, index) => {
        const startYear = new Date(convention.starts_at).getFullYear();
        const showYearBadge = !convention.name.includes(startYear.toString());
        const phase = getConventionPhase(convention);
        const location = [convention.city, convention.country].filter(Boolean).join(', ');

        return (
          <li key={convention.id}>
            <button
              type="button"
              onClick={() => select(convention.slug)}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                'flex w-full cursor-pointer flex-col items-start gap-1 border-b-2 border-dashed px-3 py-2 text-left transition-colors last:border-b-0',
                activeIndex === index && 'bg-accent-soft/50'
              )}
            >
              {/* Row 1: Title + Year badge + Status chip on larger screens */}
              <div className="flex w-full flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold tracking-wide uppercase">{convention.name}</span>
                {showYearBadge && (
                  <span className="border-ink font-display shrink-0 border px-1 py-0.5 text-[9px] tracking-wider text-zinc-700 dark:border-zinc-500 dark:text-zinc-200">
                    {startYear}
                  </span>
                )}
                <span
                  className={cn(
                    'font-display hidden shrink-0 border px-1.5 py-0.5 text-[9px] tracking-wider uppercase sm:inline-flex',
                    phase === 'now' && 'border-ink bg-accent-pop text-white',
                    phase === 'soon' && 'border-ink bg-accent text-white',
                    phase === 'up' &&
                      'border-ink bg-white text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200',
                    phase === 'past' &&
                      'border-zinc-400 bg-zinc-100 text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
                  )}
                >
                  {phase === 'past'
                    ? 'ended'
                    : phase === 'now'
                      ? 'now'
                      : phase === 'soon'
                        ? 'soon'
                        : 'upcoming'}
                </span>
              </div>

              {/* Row 2: Date + Status chip on smaller screens */}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-[10px] font-medium tracking-wider',
                    phase === 'past' ? 'text-zinc-500 dark:text-zinc-300' : 'text-accent'
                  )}
                >
                  {formatDateRange(convention.starts_at, convention.ends_at)}
                </span>
                <span
                  className={cn(
                    'font-display inline-flex shrink-0 border px-1.5 py-0.5 text-[9px] tracking-wider uppercase sm:hidden',
                    phase === 'now' && 'border-ink bg-accent-pop text-white',
                    phase === 'soon' && 'border-ink bg-accent text-white',
                    phase === 'up' &&
                      'border-ink bg-white text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200',
                    phase === 'past' &&
                      'border-zinc-400 bg-zinc-100 text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
                  )}
                >
                  {phase === 'past'
                    ? 'ended'
                    : phase === 'now'
                      ? 'now'
                      : phase === 'soon'
                        ? 'soon'
                        : 'upcoming'}
                </span>
              </div>

              {/* Row 3: Location */}
              {location && (
                <span className="flex items-center gap-1 text-[10px] tracking-wide text-zinc-500 uppercase dark:text-zinc-300">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{location}</span>
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );

  const empty = (
    <p className="px-3 py-4 text-center text-[11px] tracking-widest text-zinc-500 uppercase dark:text-zinc-300">
      No conventions match
    </p>
  );

  return (
    <div ref={wrapRef} className={cn('relative', variant === 'sidebar' ? 'w-full' : 'shrink-0')}>
      {variant === 'sidebar' && (
        <div className="relative w-full">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
              setOpen(event.target.value.trim().length >= 2);
            }}
            onFocus={() => setOpen(trimmed.length >= 2)}
            onKeyDown={onKeyDown}
            placeholder="Search conventions..."
            aria-label="Search conventions"
            className="border-ink focus:border-accent-pop h-9 w-full border-2 bg-white pr-8 pl-9 text-xs tracking-widest text-zinc-700 uppercase placeholder:text-zinc-400 placeholder:normal-case focus:outline-none dark:bg-zinc-900 dark:text-zinc-100"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setOpen(false);
              }}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {open && trimmed.length >= 2 && (
            <div className="border-ink absolute top-full left-0 z-50 mt-1 w-full border-2 bg-white shadow-[3px_3px_0_var(--ink)] dark:bg-[#373b3e]">
              {results.length > 0 ? list : empty}
            </div>
          )}
        </div>
      )}

      {variant === 'header' && (
        <div className="relative hidden min-[900px]:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
              setOpen(event.target.value.trim().length >= 2);
            }}
            onFocus={() => setOpen(trimmed.length >= 2)}
            onKeyDown={onKeyDown}
            placeholder="Search conventions..."
            aria-label="Search conventions"
            className="border-ink focus:border-accent-pop w-40 border-2 bg-white py-2 pr-3 pl-9 text-xs tracking-widest text-zinc-700 uppercase placeholder:text-zinc-400 placeholder:normal-case focus:outline-none lg:w-52 dark:bg-zinc-900 dark:text-zinc-100"
          />
          {open && trimmed.length >= 2 && (
            <div className="border-ink absolute right-0 z-50 mt-2 w-80 border-2 bg-white shadow-[3px_3px_0_var(--ink)] sm:w-96 dark:bg-[#373b3e]">
              {results.length > 0 ? list : empty}
            </div>
          )}
        </div>
      )}

      {variant === 'header' && (
        <IconButton
          ref={buttonRef}
          onClick={toggleSearch}
          aria-label="Search conventions"
          className="hidden h-10 w-10 min-[550px]:max-[900px]:inline-flex"
        >
          {open ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
        </IconButton>
      )}

      {variant === 'collapsed' && (
        <IconButton
          ref={buttonRef}
          onClick={toggleSearch}
          aria-label="Search conventions"
          className="inline-flex h-9 w-9 shadow-[1px_1px_0_var(--ink)]"
        >
          {open ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
        </IconButton>
      )}

      {variant === 'header' &&
        open &&
        createPortal(
          <div
            ref={panelRef}
            className="border-ink fixed inset-x-0 top-16 z-50 border-b-2 bg-white min-[900px]:hidden dark:bg-[#373b3e]"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={onKeyDown}
                  placeholder="Search conventions..."
                  aria-label="Search conventions"
                  className="border-ink focus:border-accent-pop h-12 w-full border-2 bg-white py-2 pr-3 pl-10 text-xs tracking-widest text-zinc-700 uppercase placeholder:text-zinc-400 placeholder:normal-case focus:outline-none dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
              {trimmed.length >= 2 && (results.length > 0 ? list : empty)}
            </div>
          </div>,
          document.body
        )}

      {variant === 'collapsed' &&
        open &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            style={{ top: pos.top, left: pos.left }}
            className="border-ink fixed z-[70] w-80 max-w-[calc(100vw-16px)] border-2 bg-white shadow-[4px_4px_0_var(--ink)] sm:w-96 dark:bg-[#373b3e]"
          >
            <div className="relative border-b-2 border-dashed p-2">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-300" />
              <input
                autoFocus
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search conventions..."
                aria-label="Search conventions"
                className="border-ink focus:border-accent-pop h-10 w-full border-2 bg-white py-2 pr-8 pl-9 text-xs tracking-widest text-zinc-700 uppercase placeholder:text-zinc-500 placeholder:normal-case focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setActiveIndex(0);
                  }}
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {trimmed.length >= 2 && (results.length > 0 ? list : empty)}
          </div>,
          document.body
        )}
    </div>
  );
}
