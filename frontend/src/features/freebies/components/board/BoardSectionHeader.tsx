'use client';

import { ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface BoardSectionHeaderProps {
  title: string;
  count: number;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export function BoardSectionHeader({
  title,
  count,
  icon: Icon,
  iconClassName = 'text-accent h-4 w-4',
  isCollapsed,
  onToggle,
  className,
}: BoardSectionHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'border-ink flex w-full cursor-pointer items-center justify-between border-b pb-2 text-left transition-opacity hover:opacity-80',
        className
      )}
      aria-expanded={!isCollapsed}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className={iconClassName} />}
        <h2 className="font-display text-sm tracking-wider uppercase sm:text-base">{title}</h2>
        <span className="border-ink/20 border bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {count}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <ChevronDown
          className={cn('h-4 w-4 transition-transform duration-200', isCollapsed && '-rotate-90')}
        />
      </div>
    </button>
  );
}

// Convenient alias
export const BoardSectionToggle = BoardSectionHeader;
