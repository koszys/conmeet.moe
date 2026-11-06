'use client';

import { useMemo } from 'react';
import { Search } from 'lucide-react';
import { CONBLOCK } from '@/shared/components/ui';
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

  return (
    <div className="space-y-4">
      {/* Search & Day Row: Search has its own line on tablet and mobile */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search input */}
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by cosplay, character, or room..."
            className="border-ink w-full border-2 bg-zinc-50 py-2 pr-3 pl-9 text-xs shadow-[2px_2px_0_var(--ink)] transition-colors focus:bg-white focus:outline-none dark:bg-zinc-950 dark:focus:bg-black"
          />
        </div>

        {/* Date Filter Pills: Single row, no stacking, responsive compact labels on mobile */}
        {conventionDays.length > 0 && (
          <div className="flex shrink-0 scrollbar-none items-center gap-1.5 overflow-x-auto pr-1 pb-1 sm:gap-2">
            <span className="font-display hidden text-[11px] font-bold tracking-wider text-zinc-500 uppercase sm:inline">
              Day:
            </span>
            <button
              type="button"
              onClick={() => onDateChange(undefined)}
              className={cn(
                CONBLOCK,
                'px-2 py-1 text-xs font-bold whitespace-nowrap uppercase sm:px-2.5',
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
                  'px-2 py-1 text-xs font-bold whitespace-nowrap uppercase sm:px-2.5',
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

      {/* Primary Category Tabs without count badges */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pr-1 pb-3 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => onTabChange('all')}
          className={cn(
            CONBLOCK,
            'inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase',
            activeTab === 'all'
              ? 'bg-accent text-white dark:text-zinc-950'
              : 'bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800'
          )}
        >
          <span>All Meetups</span>
        </button>

        {/* Divider between All Meetups and the rest */}
        <div className="border-ink/30 mx-1 hidden h-6 shrink-0 border-r-2 border-dashed sm:block" />

        <button
          type="button"
          onClick={() => onTabChange('official')}
          className={cn(
            CONBLOCK,
            'inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase',
            activeTab === 'official'
              ? 'text-ink bg-amber-300'
              : 'bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800'
          )}
        >
          <span>★ Official</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('community')}
          className={cn(
            CONBLOCK,
            'inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase',
            activeTab === 'community'
              ? 'bg-accent text-white dark:text-zinc-950'
              : 'bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800'
          )}
        >
          <span>Community / Fan</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('saved')}
          className={cn(
            CONBLOCK,
            'inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase',
            activeTab === 'saved'
              ? 'bg-accent-pop text-white'
              : 'bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800'
          )}
        >
          <span>Saved</span>
        </button>
      </div>
    </div>
  );
}
