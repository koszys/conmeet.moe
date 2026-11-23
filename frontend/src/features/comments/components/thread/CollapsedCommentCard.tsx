import { Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface CollapsedCommentCardProps {
  depth: number;
  displayName: string;
  isDeleted: boolean;
  formattedTime: string;
  className?: string;
  onExpand: () => void;
}

/**
 * Condensed Reddit-style one-line strip for collapsed comments.
 */
export function CollapsedCommentCard({
  depth,
  displayName,
  isDeleted,
  formattedTime,
  className,
  onExpand,
}: CollapsedCommentCardProps) {
  return (
    <div
      className={cn(
        'group flex cursor-pointer items-center gap-2 rounded-sm transition-colors select-none',
        depth === 0
          ? 'border-ink border-2 bg-zinc-50/80 p-2.5 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/60'
          : 'bg-zinc-100/60 p-2 hover:bg-zinc-200/60 dark:bg-zinc-800/40 dark:hover:bg-zinc-700/40',
        className
      )}
      onClick={onExpand}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onExpand();
        }
      }}
      title="Click to expand thread"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onExpand();
        }}
        className={cn(
          'border-ink relative z-20 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 bg-white p-0 text-zinc-700 transition-colors',
          'group-hover:border-accent-pop group-hover:text-accent-pop group-hover:bg-accent/10',
          'dark:group-hover:bg-accent/20 dark:bg-zinc-900 dark:text-zinc-300'
        )}
        title="Expand thread"
        aria-label="Expand thread"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>

      <span
        className={cn(
          'font-display truncate text-xs font-bold tracking-wider uppercase',
          isDeleted ? 'text-zinc-500 dark:text-zinc-300' : 'text-zinc-900 dark:text-zinc-100'
        )}
      >
        {isDeleted ? '[deleted]' : displayName}
      </span>

      {formattedTime && (
        <span className="shrink-0 text-[10px] text-zinc-500 dark:text-zinc-300">
          · {formattedTime}
        </span>
      )}
    </div>
  );
}
