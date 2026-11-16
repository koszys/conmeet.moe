'use client';

import { tabButtonClasses } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

export interface ConventionsTimeTabsProps {
  tab: 'upcoming' | 'past' | 'recently-ended';
  onTabChange: (tab: 'upcoming' | 'past' | 'recently-ended') => void;
  counts: {
    upcoming: number;
    past: number;
    recentlyEnded: number;
  };
  className?: string;
}

const TAB_SIZE_CLASSES =
  'w-full px-0.5 py-1 text-[8.5px] tracking-tighter whitespace-nowrap min-[350px]:px-1.5 min-[350px]:text-[9.5px] min-[350px]:tracking-tight sm:w-auto sm:px-3.5 sm:py-1.5 sm:text-xs sm:tracking-wider';

export function ConventionsTimeTabs({
  tab,
  onTabChange,
  counts,
  className,
}: ConventionsTimeTabsProps) {
  return (
    <div
      className={cn('grid grid-cols-3 gap-1 sm:flex sm:w-auto sm:items-center sm:gap-2', className)}
    >
      <button
        type="button"
        onClick={() => onTabChange('upcoming')}
        className={tabButtonClasses(tab === 'upcoming', TAB_SIZE_CLASSES)}
      >
        <span>Upcoming ({counts.upcoming})</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('past')}
        className={tabButtonClasses(tab === 'past', TAB_SIZE_CLASSES)}
      >
        <span className="hidden sm:inline">Past Cons</span>
        <span className="sm:hidden">Past</span>
        <span className="ml-0.5">({counts.past})</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('recently-ended')}
        className={tabButtonClasses(tab === 'recently-ended', TAB_SIZE_CLASSES)}
      >
        <span className="hidden sm:inline">Recently Ended</span>
        <span className="sm:hidden">Recent</span>
        <span className="ml-0.5">({counts.recentlyEnded})</span>
      </button>
    </div>
  );
}
