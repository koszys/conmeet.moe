import { cn } from '@/shared/lib/utils';

interface CharCounterProps {
  current: number;
  max: number;
}

export function CharCounter({ current, max }: CharCounterProps) {
  const isAtLimit = current >= max;
  const isNearLimit = current >= max * 0.85;

  return (
    <span
      className={cn(
        'font-mono text-[10px] tracking-normal transition-colors',
        isAtLimit
          ? 'font-bold text-rose-500 dark:text-rose-400'
          : isNearLimit
            ? 'font-bold text-zinc-700 dark:text-zinc-200'
            : 'text-zinc-400 dark:text-zinc-500'
      )}
    >
      {current}/{max}
    </span>
  );
}
