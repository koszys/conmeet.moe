'use client';

import { cn } from '@/shared/lib/utils';

export interface CharCounterProps {
  current: number;
  max: number;
  className?: string;
}

export function CharCounter({ current, max, className }: CharCounterProps) {
  const isAtLimit = current >= max;
  const isNearLimit = current >= max * 0.85;

  return (
    <span
      className={cn(
        'font-mono text-[10px] tracking-normal transition-colors',
        isAtLimit
          ? 'font-bold text-rose-500 dark:text-rose-400'
          : isNearLimit
            ? 'font-bold text-zinc-700 dark:text-zinc-100'
            : 'text-zinc-500 dark:text-zinc-300',
        className
      )}
    >
      {current}/{max}
    </span>
  );
}
