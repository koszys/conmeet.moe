'use client';

import { Check, RotateCw } from 'lucide-react';
import { CONBLOCK, CONBLOCK_SECONDARY } from './Button';
import { cn } from '@/shared/lib/utils';

export type RefreshStatus = 'idle' | 'refreshing' | 'success';

export interface RefreshButtonProps {
  /** Callback fired when the refresh button is clicked */
  onRefresh: () => void | Promise<void>;
  /** Current state of the refresh operation */
  status?: RefreshStatus;
  /** Name of the entity being refreshed (used for accessibility and tooltips) */
  entityName?: string;
  /** Additional custom class names */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Visual variant: icon-only button or button with text */
  variant?: 'icon' | 'button';
  /** Optional label text when variant is 'button' */
  label?: string;
}

export function RefreshButton({
  onRefresh,
  status = 'idle',
  entityName = 'items',
  className,
  size = 'md',
  variant = 'icon',
  label = 'Refresh',
}: RefreshButtonProps) {
  const isIdle = status === 'idle';
  const isRefreshing = status === 'refreshing';
  const isSuccess = status === 'success';

  const titleText = isSuccess
    ? `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} synced!`
    : isRefreshing
      ? `Syncing ${entityName}…`
      : `Refresh ${entityName}`;

  const iconSizes = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  const icon = isSuccess ? (
    <Check
      className={cn(
        'animate-pill-pop stroke-[2.5] text-emerald-600 dark:text-emerald-400',
        iconSizes
      )}
    />
  ) : isRefreshing ? (
    <RotateCw className={cn('animate-spin stroke-[2.5]', iconSizes)} />
  ) : (
    <RotateCw className={cn('stroke-[2.5]', iconSizes)} />
  );

  return (
    <button
      type="button"
      onClick={() => onRefresh()}
      disabled={!isIdle}
      title={titleText}
      aria-label={titleText}
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-bold tracking-wider uppercase transition-all',
        isIdle && CONBLOCK_SECONDARY,
        !isIdle && CONBLOCK,
        size === 'sm' ? 'h-8 px-2 text-xs' : 'h-10 text-sm',
        variant === 'icon' && (size === 'sm' ? 'w-8 px-0' : 'w-10 px-0'),
        variant === 'button' && 'gap-2 px-3',
        isSuccess &&
          'cursor-default bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
        isRefreshing && 'cursor-not-allowed bg-white opacity-75 dark:bg-zinc-900',
        className
      )}
    >
      {icon}
      {variant === 'button' && (
        <span>{isSuccess ? 'Synced!' : isRefreshing ? 'Syncing…' : label}</span>
      )}
    </button>
  );
}
