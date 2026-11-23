import { MessageSquare, Plus } from 'lucide-react';
import { CONBLOCK_SECONDARY } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { CommentAvatar } from './CommentAvatar';

export interface CollapsedCommentCardProps {
  depth: number;
  displayName: string;
  username?: string;
  avatarLetter: string;
  avatarUrl?: string | null;
  isDeleted: boolean;
  formattedTime: string;
  totalDescendants: number;
  className?: string;
  onExpand: () => void;
}

/**
 * Condensed Reddit-style one-line strip for collapsed comments.
 */
export function CollapsedCommentCard({
  depth,
  displayName,
  username,
  avatarLetter,
  avatarUrl,
  isDeleted,
  formattedTime,
  totalDescendants,
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

        <span className="font-display truncate text-xs font-bold tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
          {isDeleted ? '[deleted]' : displayName}
        </span>

        {!isDeleted && username && (
          <span className="hidden text-[11px] font-medium text-zinc-500 sm:inline dark:text-zinc-400">
            @{username}
          </span>
        )}

        {formattedTime && (
          <span className="shrink-0 text-[10px] text-zinc-500 dark:text-zinc-400">
            · {formattedTime}
          </span>
        )}

        {totalDescendants > 0 && (
          <span className="border-ink bg-accent/15 dark:bg-accent/25 inline-flex shrink-0 items-center gap-1.5 border-2 px-2 py-0.5 text-[10px] font-bold tracking-wider text-zinc-900 uppercase shadow-[1.5px_1.5px_0px_#000] select-none sm:text-[11px] dark:text-zinc-100 dark:shadow-[1.5px_1.5px_0px_#fff]">
            <MessageSquare className="text-accent-pop h-3 w-3 shrink-0" />
            <span>
              +{totalDescendants} {totalDescendants === 1 ? 'reply' : 'replies'}
            </span>
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
