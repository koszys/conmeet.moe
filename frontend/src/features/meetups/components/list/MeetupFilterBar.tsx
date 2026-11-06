'use client';

import { useMemo } from 'react';
import { Search } from 'lucide-react';
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
  counts?: {
    all: number;
    official: number;
    community: number;
    saved: number;
  };
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
  counts,
}: MeetupFilterBarProps) {
  // Generate date day options between convention starts_at and ends_at
  const conventionDays = useMemo(() => {
    if (!conventionStartsAt || !conventionEndsAt) return [];
    try {
      const start = parseDate(conventionStartsAt);
      const end = parseDate(conventionEndsAt);
      const days: { dateStr: string; label: string }[] = [];
      const current = new Date(start);

      // Max 14 days guard
      let count = 0;
      while (current <= end && count < 14) {
        const dateStr = format(current, 'yyyy-MM-dd');
        const label = format(current, 'EEE, MMM d');
        days.push({ dateStr, label });
        current.setDate(current.getDate() + 1);
        count++;
      }
      return days;
    } catch {
      return [];
    }
  }, [conventionStartsAt, conventionEndsAt]);

  return (
    <div className="space-y-4">
      {/* Search & Day Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by cosplay, character, or room..."
            className="border-ink w-full border-2 bg-zinc-50 py-2 pr-3 pl-9 text-xs shadow-[2px_2px_0_var(--ink)] transition-colors focus:bg-white focus:outline-none dark:bg-zinc-950 dark:focus:bg-black"
          />
        </div>

        {/* Date Filter Dropdown or Pills */}
        {conventionDays.length > 0 && (
          <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="font-display hidden text-[11px] tracking-wider text-zinc-500 uppercase sm:inline">
              Day:
            </span>
            <button
              type="button"
              onClick={() => onDateChange(undefined)}
              className={cn(
                'border-ink border-2 px-2.5 py-1 text-xs font-bold whitespace-nowrap uppercase shadow-[2px_2px_0_var(--ink)] transition-all',
                !selectedDate
                  ? 'bg-accent text-white dark:text-zinc-950'
                  : 'bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800'
              )}
            >
              All Days
            </button>
            {conventionDays.map((day) => (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => onDateChange(day.dateStr)}
                className={cn(
                  'border-ink border-2 px-2.5 py-1 text-xs font-bold whitespace-nowrap uppercase shadow-[2px_2px_0_var(--ink)] transition-all',
                  selectedDate === day.dateStr
                    ? 'bg-accent text-white dark:text-zinc-950'
                    : 'bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800'
                )}
              >
                {day.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Primary Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => onTabChange('all')}
          className={cn(
            'border-ink inline-flex items-center gap-1.5 border-2 px-3.5 py-1.5 text-xs font-bold uppercase shadow-[2px_2px_0_var(--ink)] transition-all',
            activeTab === 'all'
              ? 'bg-accent text-white dark:text-zinc-950'
              : 'bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800'
          )}
        >
          <span>All Meetups</span>
          {counts && (
            <span className="border-ink ml-1 rounded-none border-l pl-1.5 opacity-80">
              {counts.all}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('official')}
          className={cn(
            'border-ink inline-flex items-center gap-1.5 border-2 px-3.5 py-1.5 text-xs font-bold uppercase shadow-[2px_2px_0_var(--ink)] transition-all',
            activeTab === 'official'
              ? 'text-ink bg-amber-300'
              : 'bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800'
          )}
        >
          <span>★ Official Only</span>
          {counts && (
            <span className="border-ink ml-1 rounded-none border-l pl-1.5 opacity-80">
              {counts.official}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('community')}
          className={cn(
            'border-ink inline-flex items-center gap-1.5 border-2 px-3.5 py-1.5 text-xs font-bold uppercase shadow-[2px_2px_0_var(--ink)] transition-all',
            activeTab === 'community'
              ? 'bg-accent text-white dark:text-zinc-950'
              : 'bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800'
          )}
        >
          <span>Community / Fan</span>
          {counts && (
            <span className="border-ink ml-1 rounded-none border-l pl-1.5 opacity-80">
              {counts.community}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('saved')}
          className={cn(
            'border-ink inline-flex items-center gap-1.5 border-2 px-3.5 py-1.5 text-xs font-bold uppercase shadow-[2px_2px_0_var(--ink)] transition-all',
            activeTab === 'saved'
              ? 'bg-accent-pop text-white'
              : 'bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800'
          )}
        >
          <span>Saved</span>
          {counts && (
            <span className="border-ink ml-1 rounded-none border-l pl-1.5 opacity-80">
              {counts.saved}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
