'use client';

import { List, Star } from 'lucide-react';
import { CONBLOCK } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export interface ConventionsViewSwitcherProps {
  view: 'featured' | 'list';
  onViewChange: (view: 'featured' | 'list') => void;
  className?: string;
}

export function ConventionsViewSwitcher({
  view,
  onViewChange,
  className,
}: ConventionsViewSwitcherProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-1.5 sm:flex sm:w-auto sm:items-center sm:gap-3',
        view === 'featured' && 'border-ink border-b-2 pb-4',
        className
      )}
    >
      <button
        type="button"
        onClick={() => onViewChange('featured')}
        aria-pressed={view === 'featured'}
        className={cn(
          CONBLOCK,
          'font-display flex w-full items-center justify-center gap-1 px-1 py-1.5 text-[9.5px] tracking-tight whitespace-nowrap uppercase transition-all min-[350px]:gap-1.5 min-[350px]:px-2.5 min-[350px]:text-[11px] min-[350px]:tracking-normal sm:w-auto sm:gap-2 sm:px-4 sm:py-2 sm:text-xs sm:tracking-wider',
          view === 'featured'
            ? 'bg-accent hover:bg-accent-pop text-white shadow-[3px_3px_0_var(--ink)] dark:text-zinc-950 dark:hover:text-white'
            : 'bg-white text-zinc-800 hover:bg-zinc-100 hover:text-black dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
        )}
      >
        <Star
          className={cn(
            'h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5',
            view === 'featured' && 'fill-current'
          )}
        />
        <span>Featured Cons</span>
      </button>

      <button
        type="button"
        onClick={() => onViewChange('list')}
        aria-pressed={view === 'list'}
        className={cn(
          CONBLOCK,
          'font-display flex w-full items-center justify-center gap-1 px-1 py-1.5 text-[9.5px] tracking-tight whitespace-nowrap uppercase transition-all min-[350px]:gap-1.5 min-[350px]:px-2.5 min-[350px]:text-[11px] min-[350px]:tracking-normal sm:w-auto sm:gap-2 sm:px-4 sm:py-2 sm:text-xs sm:tracking-wider',
          view === 'list'
            ? 'bg-accent hover:bg-accent-pop text-white shadow-[3px_3px_0_var(--ink)] dark:text-zinc-950 dark:hover:text-white'
            : 'bg-white text-zinc-800 hover:bg-zinc-100 hover:text-black dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800'
        )}
      >
        <List className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
        <span>List of Cons</span>
      </button>
    </div>
  );
}
