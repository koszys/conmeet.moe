'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { formatDateRange } from '@/shared/lib/dates';
import { cn } from '@/shared/lib/utils';

import { useConventions } from '@/features/conventions/data/api';

const MAX_RESULTS = 6;

export function HeaderSearch() {
  const router = useRouter();
  const { data = [] } = useConventions();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();
  const results = useMemo(() => {
    const q = trimmed.toLowerCase();
    if (q.length < 2) return [];
    return data
      .filter((convention) => convention.name.toLowerCase().includes(q))
      .sort((a, b) => {
        const aStart = a.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bStart = b.name.toLowerCase().startsWith(q) ? 0 : 1;
        return aStart - bStart || a.name.localeCompare(b.name);
      })
      .slice(0, MAX_RESULTS);
  }, [data, trimmed]);

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

  useEffect(() => {
    function openFromMenu() {
      setOpen(true);
      setQuery('');
    }
    window.addEventListener('conmeet:open-search', openFromMenu);
    return () => window.removeEventListener('conmeet:open-search', openFromMenu);
  }, []);

  function select(slug: string) {
    setOpen(false);
    setQuery('');
    router.push(`/conventions/${slug}`);
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
      {results.map((convention, index) => (
        <li key={convention.id}>
          <button
            type="button"
            onClick={() => select(convention.slug)}
            onMouseEnter={() => setActiveIndex(index)}
            className={cn(
              'flex w-full cursor-pointer flex-col items-start border-b-2 border-dashed px-3 py-2.5 text-left last:border-b-0 gap-0.5',
              activeIndex === index && 'bg-accent-soft/50'
            )}
          >
            <span className="truncate text-xs font-bold tracking-widest uppercase">
              {convention.name}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-300">
              {[convention.city, convention.country].filter(Boolean).join(', ')} ·{' '}
              {formatDateRange(convention.starts_at, convention.ends_at)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );

  const empty = (
    <p className="px-3 py-4 text-center text-[11px] uppercase tracking-widest text-zinc-500">
      No conventions match
    </p>
  );

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative hidden min-[900px]:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
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
          className="border-ink bg-white dark:bg-zinc-900 border-2 py-2 pr-3 pl-9 w-40 text-xs tracking-widest text-zinc-700 uppercase placeholder:normal-case placeholder:text-zinc-400 focus:border-accent-pop focus:outline-none lg:w-52 dark:text-zinc-100"
        />
        {open && trimmed.length >= 2 && (
          <div className="border-ink absolute right-0 z-50 mt-2 w-80 border-2 bg-white shadow-[3px_3px_0_var(--ink)] dark:bg-[#373b3e]">
            {results.length > 0 ? list : empty}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Search conventions"
        className="border-ink hover:border-accent-pop hover:text-accent-pop hidden h-10 w-10 cursor-pointer items-center justify-center border-2 text-zinc-700 shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none min-[550px]:max-[900px]:inline-flex dark:text-zinc-200"
      >
        {open ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
      </button>

      {open && (
        <div className="fixed inset-x-0 top-16 z-50 border-ink border-b-2 bg-white min-[900px]:hidden dark:bg-[#373b3e]">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
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
                className="border-ink bg-white dark:bg-zinc-900 h-12 w-full border-2 py-2 pr-3 pl-10 text-xs tracking-widest text-zinc-700 uppercase placeholder:normal-case placeholder:text-zinc-400 focus:border-accent-pop focus:outline-none dark:text-zinc-100"
              />
            </div>
            {trimmed.length >= 2 && (results.length > 0 ? list : empty)}
          </div>
        </div>
      )}
    </div>
  );
}