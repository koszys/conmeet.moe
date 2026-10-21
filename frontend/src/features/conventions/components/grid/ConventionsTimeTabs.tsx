'use client';

import { CONBLOCK } from '@/shared/components/ui/button';
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
        className={cn(
          CONBLOCK,
          'font-display flex w-full items-center justify-center px-0.5 py-1 text-[8.5px] tracking-tighter whitespace-nowrap uppercase min-[350px]:px-1.5 min-[350px]:text-[9.5px] min-[350px]:tracking-tight sm:w-auto sm:px-3.5 sm:py-1.5 sm:text-xs sm:tracking-wider',
          tab === 'upcoming'
            ? 'bg-accent hover:bg-accent-pop text-white dark:text-zinc-950 dark:hover:text-white'
            : 'hover:border-accent-pop bg-white text-zinc-800 hover:bg-zinc-100 hover:text-black dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
        )}
      >
        <span>Upcoming ({counts.upcoming})</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('past')}
        className={cn(
          CONBLOCK,
          'font-display flex w-full items-center justify-center px-0.5 py-1 text-[8.5px] tracking-tighter whitespace-nowrap uppercase min-[350px]:px-1.5 min-[350px]:text-[9.5px] min-[350px]:tracking-tight sm:w-auto sm:px-3.5 sm:py-1.5 sm:text-xs sm:tracking-wider',
          tab === 'past'
            ? 'bg-accent hover:bg-accent-pop text-white dark:text-zinc-950 dark:hover:text-white'
            : 'hover:border-accent-pop bg-white text-zinc-800 hover:bg-zinc-100 hover:text-black dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
        )}
      >
        <span className="hidden sm:inline">Past Cons</span>
        <span className="sm:hidden">Past</span>
        <span className="ml-0.5">({counts.past})</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('recently-ended')}
        className={cn(
          CONBLOCK,
          'font-display flex w-full items-center justify-center px-0.5 py-1 text-[8.5px] tracking-tighter whitespace-nowrap uppercase min-[350px]:px-1.5 min-[350px]:text-[9.5px] min-[350px]:tracking-tight sm:w-auto sm:px-3.5 sm:py-1.5 sm:text-xs sm:tracking-wider',
          tab === 'recently-ended'
            ? 'bg-accent hover:bg-accent-pop text-white dark:text-zinc-950 dark:hover:text-white'
            : 'hover:border-accent-pop bg-white text-zinc-800 hover:bg-zinc-100 hover:text-black dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
        )}
      >
        <span className="hidden sm:inline">Recently Ended</span>
        <span className="sm:hidden">Recent</span>
        <span className="ml-0.5">({counts.recentlyEnded})</span>
      </button>
    </div>
  );
}
