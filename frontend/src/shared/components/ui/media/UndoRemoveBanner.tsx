'use client';

import { cn } from '@/shared/lib/utils';
import { UndoButton } from '../actions/UndoButton';

export interface UndoRemoveBannerProps {
  onUndo: () => void;
  message?: string;
  className?: string;
}

export function UndoRemoveBanner({
  onUndo,
  message = 'Image will be removed upon saving',
  className,
}: UndoRemoveBannerProps) {
  return (
    <div
      className={cn(
        'border-ink my-2 flex items-center justify-between border-2 border-dashed bg-amber-50/60 p-2.5 shadow-[2px_2px_0_var(--ink)] dark:border-zinc-700 dark:bg-amber-950/20',
        className
      )}
    >
      <span className="text-xs text-zinc-600 italic dark:text-zinc-300">{message}</span>
      <UndoButton onClick={onUndo} size="xs" />
    </div>
  );
}
