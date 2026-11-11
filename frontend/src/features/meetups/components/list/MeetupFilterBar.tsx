'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, Calendar, HeartHandshake, Sparkles, Users } from 'lucide-react';
import { CONBLOCK, SearchInput } from '@/shared/components/ui';
import { useHorizontalScrollAffordance } from '@/shared/hooks';
import { cn } from '@/shared/lib/utils';
import { parseDate } from '@/shared/lib/dates';
import { format } from 'date-fns';

export type TabType = 'all' | 'official' | 'community' | 'saved';

interface MeetupFilterBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedDate?: string;
  onDateChange: (date?: string) => void;
  conventionStartsAt?: string;
  conventionEndsAt?: string;
}

export function MeetupFilterBar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  selectedDate,
  onDateChange,
  conventionStartsAt,
  conventionEndsAt,
}: MeetupFilterBarProps) {
  // Generate date day options between convention starts_at and ends_at
  const conventionDays = useMemo(() => {
    if (!conventionStartsAt || !conventionEndsAt) return [];
    try {
      const start = parseDate(conventionStartsAt);
      const end = parseDate(conventionEndsAt);
      const days: { dateStr: string; label: string; shortLabel: string }[] = [];
      const current = new Date(start);

      // Max 14 days guard
      let count = 0;
      while (current <= end && count < 14) {
        const dateStr = format(current, 'yyyy-MM-dd');
        const label = format(current, 'EEE, MMM d');
        const shortLabel = format(current, 'EEE');
        days.push({ dateStr, label, shortLabel });
        current.setDate(current.getDate() + 1);
        count++;
      }
      return days;
    } catch {
      return [];
    }
  }, [conventionStartsAt, conventionEndsAt]);

  const tabsRef = useRef<HTMLDivElement>(null);
  const [tabsWidth, setTabsWidth] = useState<number | null>(null);

  const { maskStyle: tabsMaskStyle } = useHorizontalScrollAffordance({ ref: tabsRef });
  const {
    ref: datePillsRef,
    maskStyle: datePillsMaskStyle,
    checkScroll: checkDatePillsScroll,
  } = useHorizontalScrollAffordance();

  useEffect(() => {
    checkDatePillsScroll();
  }, [conventionDays, checkDatePillsScroll]);

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;

    const update = () => {
      const children = Array.from(el.children) as HTMLElement[];
      if (children.length > 0) {
        const first = children[0].getBoundingClientRect();
        const last = children[children.length - 1].getBoundingClientRect();
        const w = Math.round(last.right - first.left + el.scrollLeft);
        if (w > 0) {
          setTabsWidth(w);
          return;
        }
      }
      if (el.scrollWidth > 0) {
        setTabsWidth(el.scrollWidth);
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    Array.from(el.children).forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="border-ink @container flex flex-col gap-3 border-b-2 pb-5">
      {/* Row 1: Category Filter Tabs */}
      <div
        ref={tabsRef}
        style={tabsMaskStyle}
        className="flex shrink-0 scrollbar-none items-center gap-1.5 overflow-x-auto pb-0.5 sm:gap-2"
      >
        {/* All Meetups */}
        <button
          type="button"
          onClick={() => onTabChange('all')}
          title="All Meetups"
          aria-label="All Meetups"
          className={cn(
            CONBLOCK,
            'group inline-flex h-10 shrink-0 items-center justify-center gap-1.5 px-2.5 text-center text-xs font-bold whitespace-nowrap uppercase sm:px-4',
            activeTab === 'all'
              ? 'bg-accent text-white dark:text-zinc-950'
              : 'bg-white text-zinc-800 hover:bg-zinc-50 hover:text-black dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
          )}
        >
          <Users
            className={cn(
              'h-4 w-4 shrink-0',
              activeTab === 'all'
                ? 'stroke-[2.5]'
                : 'stroke-2 text-zinc-800 group-hover:text-black dark:text-white'
            )}
          />
          <span>
            All<span className="hidden sm:inline"> Meetups</span>
          </span>
        </button>

        {/* Official */}
        <button
          type="button"
          onClick={() => onTabChange('official')}
          title="Official Meetups"
          aria-label="Official Meetups"
          className={cn(
            CONBLOCK,
            'group inline-flex h-10 shrink-0 items-center justify-center gap-1.5 px-2.5 text-center text-xs font-bold whitespace-nowrap uppercase sm:px-4',
            activeTab === 'official'
              ? 'bg-accent text-white dark:text-zinc-950'
              : 'bg-white text-zinc-800 hover:bg-zinc-50 hover:text-black dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
          )}
        >
          <Sparkles
            className={cn(
              'h-4 w-4 shrink-0',
              activeTab === 'official'
                ? 'fill-current stroke-[2.5]'
                : 'stroke-2 text-zinc-800 group-hover:text-black dark:text-white'
            )}
          />
          <span>Official</span>
        </button>

        {/* Community */}
        <button
          type="button"
          onClick={() => onTabChange('community')}
          title="Community / Fan Meetups"
          aria-label="Community / Fan Meetups"
          className={cn(
            CONBLOCK,
            'group inline-flex h-10 shrink-0 items-center justify-center gap-1.5 px-2.5 text-center text-xs font-bold whitespace-nowrap uppercase sm:px-4',
            activeTab === 'community'
              ? 'bg-accent text-white dark:text-zinc-950'
              : 'bg-white text-zinc-800 hover:bg-zinc-50 hover:text-black dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
          )}
        >
          <HeartHandshake
            className={cn(
              'h-4 w-4 shrink-0',
              activeTab === 'community'
                ? 'stroke-[2.5]'
                : 'stroke-2 text-zinc-800 group-hover:text-black dark:text-white'
            )}
          />
          <span>
            Community<span className="hidden sm:inline">/Fan</span>
          </span>
        </button>

        {/* Saved */}
        <button
          type="button"
          onClick={() => onTabChange('saved')}
          title="Saved Meetups"
          aria-label="Saved Meetups"
          className={cn(
            CONBLOCK,
            'group inline-flex h-10 shrink-0 items-center justify-center gap-1.5 px-2.5 text-center text-xs font-bold whitespace-nowrap uppercase sm:px-4',
            activeTab === 'saved'
              ? 'bg-accent text-white dark:text-zinc-950'
              : 'bg-white text-zinc-800 hover:bg-zinc-50 hover:text-black dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
          )}
        >
          <Bookmark
            className={cn(
              'h-4 w-4 shrink-0',
              activeTab === 'saved'
                ? 'fill-current stroke-[2.5]'
                : 'stroke-2 text-zinc-800 group-hover:text-black dark:text-white'
            )}
          />
          <span>Saved</span>
        </button>
      </div>

      {/* Row 2: Search & Day Filter - sized to match tabs above it, wraps to own row when needed, shrinks on mobile */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        {/* Search Input - matches tabs width, wraps to own row when needed, shrinks on mobile */}
        <div
          style={tabsWidth ? { width: `${tabsWidth}px` } : undefined}
          className="relative w-full max-w-full shrink-0"
        >
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            onClear={() => onSearchChange('')}
            placeholder="Search by cosplay, character, or room..."
          />
        </div>

        {/* Date Filter Pills */}
        {conventionDays.length > 0 && (
          <div
            ref={datePillsRef}
            style={datePillsMaskStyle}
            className="flex w-full max-w-full min-w-0 scrollbar-none items-center gap-1.5 overflow-x-auto pr-3 pb-0.5 sm:w-auto sm:gap-2"
          >
            <span className="font-display inline-flex shrink-0 items-center gap-1 text-[11px] font-bold tracking-wider text-zinc-600 uppercase dark:text-zinc-300">
              <Calendar className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-300" />
              Day:
            </span>
            <button
              type="button"
              onClick={() => onDateChange(undefined)}
              className={cn(
                CONBLOCK,
                'shrink-0 px-2 py-1 text-xs font-bold whitespace-nowrap uppercase sm:px-2.5',
                !selectedDate
                  ? 'bg-accent text-white dark:text-zinc-950'
                  : 'bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800'
              )}
            >
              <span className="hidden sm:inline">All Days</span>
              <span className="sm:hidden">All</span>
            </button>
            {conventionDays.map((day) => (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => onDateChange(day.dateStr)}
                className={cn(
                  CONBLOCK,
                  'shrink-0 px-2 py-1 text-xs font-bold whitespace-nowrap uppercase sm:px-2.5',
                  selectedDate === day.dateStr
                    ? 'bg-accent text-white dark:text-zinc-950'
                    : 'bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800'
                )}
              >
                <span className="hidden sm:inline">{day.label}</span>
                <span className="sm:hidden">{day.shortLabel}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
