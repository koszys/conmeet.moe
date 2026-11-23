import { Plus } from 'lucide-react';
import { CONBLOCK_SECONDARY } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { CommentAvatar } from './CommentAvatar';

export interface CollapsedCommentCardProps {
  depth: number;
  displayName: string;
  avatarLetter: string;
  avatarUrl?: string | null;
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
  avatarLetter,
  avatarUrl,
  isDeleted,
  formattedTime,
  className,
  onExpand,
}: CollapsedCommentCardProps) {
  return (
    <div
      className={cn(
        'group flex cursor-pointer items-center justify-between gap-2 rounded-sm transition-colors',
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
      <div className="flex min-w-0 items-center gap-2">
        <CommentAvatar
          avatarUrl={avatarUrl}
          displayName={displayName}
          avatarLetter={avatarLetter}
          isDeleted={isDeleted}
        />

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

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onExpand();
        }}
        className={cn(
          CONBLOCK_SECONDARY,
          'inline-flex h-6 w-6 shrink-0 items-center justify-center p-0 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100'
        )}
        title="Expand thread"
        aria-label="Expand thread"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}
