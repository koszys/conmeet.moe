'use client';

import type { ReactNode } from 'react';
import { CONBLOCK } from './Button';
import { cn } from '@/shared/lib/utils';

export interface FilterTabProps extends Omit<React.ComponentProps<'button'>, 'children'> {
  isActive: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  label: ReactNode;
  shortLabel?: ReactNode;
  icon?: ReactNode;
  count?: number;
  variant?: 'tab' | 'pill';
  title?: string;
  ariaLabel?: string;
  className?: string;
}

export function FilterTab({
  isActive,
  onClick,
  label,
  shortLabel,
  icon,
  count,
  variant = 'tab',
  title,
  ariaLabel,
  className,
  type = 'button',
  ...props
}: FilterTabProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      aria-pressed={isActive}
      className={cn(
        CONBLOCK,
        'group inline-flex shrink-0 items-center justify-center gap-1.5 font-bold whitespace-nowrap uppercase transition-all select-none',
        variant === 'tab' && 'h-10 px-2.5 text-center text-xs sm:px-4',
        variant === 'pill' && 'px-2 py-1 text-xs sm:px-2.5',
        isActive
          ? 'bg-accent text-white dark:text-zinc-950'
          : 'bg-white text-zinc-800 hover:bg-zinc-50 hover:text-black dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800',
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}

      {shortLabel ? (
        <>
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{shortLabel}</span>
        </>
      ) : (
        <span>{label}</span>
      )}

      {typeof count === 'number' && (
        <span
          className={cn(
            'ml-0.5 inline-flex items-center justify-center rounded-[2px] px-1.5 py-0.5 font-mono text-[10px] leading-none font-bold',
            isActive
              ? 'border border-white/40 bg-white/20 text-white dark:border-black/30 dark:bg-black/20 dark:text-zinc-950'
              : 'border-ink/20 border bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
