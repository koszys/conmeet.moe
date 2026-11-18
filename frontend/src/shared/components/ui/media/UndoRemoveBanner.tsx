'use client';

import { Undo2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

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
      <button
        type="button"
        onClick={onUndo}
        className="inline-flex cursor-pointer items-center gap-1 font-mono text-xs font-bold text-teal-600 hover:underline dark:text-teal-400"
      >
        <Undo2 className="h-3.5 w-3.5" />
        Undo
      </button>
    </div>
  );
}
