'use client';

import { List, Star } from 'lucide-react';
import { tabButtonClasses } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

export interface ConventionsViewSwitcherProps {
  view: 'featured' | 'list';
  onViewChange: (view: 'featured' | 'list') => void;
  className?: string;
}

const SWITCHER_SIZE_CLASSES =
  'w-full min-w-0 gap-1 px-1 py-1.5 text-[8.5px] tracking-tight whitespace-nowrap min-[360px]:gap-1 min-[360px]:px-1.5 min-[360px]:text-[9.5px] min-[380px]:gap-1.5 min-[380px]:px-2 min-[380px]:text-[10px] min-[440px]:text-[11px] min-[440px]:tracking-normal sm:w-auto sm:gap-2 sm:px-4 sm:py-2 sm:text-xs sm:tracking-wider';

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
        className={tabButtonClasses(view === 'featured', SWITCHER_SIZE_CLASSES)}
      >
        <Star
          className={cn(
            'h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5',
            view === 'featured' && 'fill-current'
          )}
        />
        <span className="min-w-0 truncate">
          <span className="hidden min-[440px]:inline">Featured Cons</span>
          <span className="min-[440px]:hidden">Featured</span>
        </span>
      </button>

      <button
        type="button"
        onClick={() => onViewChange('list')}
        aria-pressed={view === 'list'}
        className={tabButtonClasses(view === 'list', SWITCHER_SIZE_CLASSES)}
      >
        <List className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
        <span className="min-w-0 truncate">All Cons</span>
      </button>
    </div>
  );
}
