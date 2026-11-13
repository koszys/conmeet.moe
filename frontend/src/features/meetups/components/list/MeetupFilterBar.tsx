'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, Calendar, HeartHandshake, Sparkles, Users } from 'lucide-react';
import { FilterTab, RefreshButton, type RefreshStatus, SearchInput } from '@/shared/components/ui';
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
  onRefresh?: () => void;
  refreshStatus?: RefreshStatus;
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
  onRefresh,
  refreshStatus,
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
        <FilterTab
          isActive={activeTab === 'all'}
          onClick={() => onTabChange('all')}
          title="All Meetups"
          ariaLabel="All Meetups"
          label={
            <span>
              All<span className="hidden sm:inline"> Meetups</span>
            </span>
          }
          icon={
            <Users
              className={cn(
                'h-4 w-4 shrink-0',
                activeTab === 'all'
                  ? 'stroke-[2.5]'
                  : 'stroke-2 text-zinc-800 group-hover:text-black dark:text-white'
              )}
            />
          }
        />

        <FilterTab
          isActive={activeTab === 'official'}
          onClick={() => onTabChange('official')}
          title="Official Meetups"
          ariaLabel="Official Meetups"
          label="Official"
          icon={
            <Sparkles
              className={cn(
                'h-4 w-4 shrink-0',
                activeTab === 'official'
                  ? 'fill-current stroke-[2.5]'
                  : 'stroke-2 text-zinc-800 group-hover:text-black dark:text-white'
              )}
            />
          }
        />

        <FilterTab
          isActive={activeTab === 'community'}
          onClick={() => onTabChange('community')}
          title="Community / Fan Meetups"
          ariaLabel="Community / Fan Meetups"
          label={
            <span>
              Community<span className="hidden sm:inline">/Fan</span>
            </span>
          }
          icon={
            <HeartHandshake
              className={cn(
                'h-4 w-4 shrink-0',
                activeTab === 'community'
                  ? 'stroke-[2.5]'
                  : 'stroke-2 text-zinc-800 group-hover:text-black dark:text-white'
              )}
            />
          }
        />

        <FilterTab
          isActive={activeTab === 'saved'}
          onClick={() => onTabChange('saved')}
          title="Saved Meetups"
          ariaLabel="Saved Meetups"
          label="Saved"
          icon={
            <Bookmark
              className={cn(
                'h-4 w-4 shrink-0',
                activeTab === 'saved'
                  ? 'fill-current stroke-[2.5]'
                  : 'stroke-2 text-zinc-800 group-hover:text-black dark:text-white'
              )}
            />
          }
        />
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

        {/* Right side cluster: Date Filter Pills + Refresh Button */}
        <div className="flex w-full max-w-full min-w-0 items-center justify-between gap-2.5 sm:w-auto sm:justify-end sm:gap-3">
          {/* Date Filter Pills */}
          {conventionDays.length > 0 && (
            <div
              ref={datePillsRef}
              style={datePillsMaskStyle}
              className="flex max-w-full min-w-0 flex-1 scrollbar-none items-center gap-1.5 overflow-x-auto pr-2 pb-0.5 sm:w-auto sm:flex-initial sm:gap-2"
            >
              <span className="font-display inline-flex shrink-0 items-center gap-1 text-[11px] font-bold tracking-wider text-zinc-600 uppercase dark:text-zinc-300">
                <Calendar className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-300" />
                Day:
              </span>
              <FilterTab
                variant="pill"
                isActive={!selectedDate}
                onClick={() => onDateChange(undefined)}
                label="All Days"
                shortLabel="All"
              />
              {conventionDays.map((day) => (
                <FilterTab
                  key={day.dateStr}
                  variant="pill"
                  isActive={selectedDate === day.dateStr}
                  onClick={() => onDateChange(day.dateStr)}
                  label={day.label}
                  shortLabel={day.shortLabel}
                />
              ))}
            </div>
          )}

          {/* Refresh Button - positioned to the right of Day */}
          {onRefresh && (
            <RefreshButton onRefresh={onRefresh} status={refreshStatus} entityName="meetups" />
          )}
        </div>
      </div>
    </div>
  );
}
