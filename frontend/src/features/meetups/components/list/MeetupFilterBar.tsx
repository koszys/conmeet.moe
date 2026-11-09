'use client';

import { useMemo } from 'react';
import { Bookmark, Calendar, HeartHandshake, Sparkles, Users } from 'lucide-react';
import { CONBLOCK, SearchInput } from '@/shared/components/ui';
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
    <div className="@container space-y-4">
      {/* Search & Day Row: Search has its own line on tablet and mobile */}
      <div className="flex flex-col gap-3 @min-[880px]:flex-row @min-[880px]:items-center @min-[880px]:justify-between">
        {/* Search input */}
        <div className="w-full max-w-md min-w-[200px] sm:min-w-[240px]">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            onClear={() => onSearchChange('')}
            placeholder="Search by cosplay, character, or room..."
          />
        </div>

        {/* Date Filter Pills: Single row, no stacking, responsive compact labels on mobile */}
        {conventionDays.length > 0 && (
          <div className="flex shrink-0 scrollbar-none items-center gap-1.5 overflow-x-auto pr-1 pb-1 sm:gap-2">
            <span className="font-display hidden items-center gap-1 text-[11px] font-bold tracking-wider text-zinc-600 uppercase sm:inline-flex dark:text-zinc-300">
              <Calendar className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-300" />
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
            'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase sm:px-3.5',
            activeTab === 'all'
              ? 'bg-accent text-white dark:text-zinc-950'
              : 'bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800'
          )}
        >
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span>All Meetups</span>
        </button>

        {/* Divider between All Meetups and the rest */}
        <div className="border-ink/30 mx-0.5 h-6 shrink-0 self-center border-r-2 border-dashed sm:mx-1" />

        <button
          type="button"
          onClick={() => onTabChange('official')}
          className={cn(
            CONBLOCK,
            'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase sm:px-3.5',
            activeTab === 'official'
              ? 'bg-accent-pop text-white'
              : 'bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800'
          )}
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0 fill-current" />
          <span>Official</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('community')}
          className={cn(
            CONBLOCK,
            'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase sm:px-3.5',
            activeTab === 'community'
              ? 'bg-accent text-white dark:text-zinc-950'
              : 'bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800'
          )}
        >
          <HeartHandshake className="h-3.5 w-3.5 shrink-0" />
          <span>Community/Fan</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('saved')}
          className={cn(
            CONBLOCK,
            'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase sm:px-3.5',
            activeTab === 'saved'
              ? 'bg-accent-pop text-white'
              : 'bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800'
          )}
        >
          <Bookmark className="h-3.5 w-3.5 shrink-0 fill-current" />
          <span>Saved</span>
        </button>
      </div>
    </div>
  );
}
