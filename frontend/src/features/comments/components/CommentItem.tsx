'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CornerDownRight, MessageSquare, Minus, Plus, Trash2 } from 'lucide-react';
import { CONBLOCK_SECONDARY, ConfirmDeleteModal } from '@/shared/components/ui';
import { parseDate } from '@/shared/lib/dates';
import { cn } from '@/shared/lib/utils';
import { CommentForm } from './CommentForm';
import type { CommentItemData } from '../types';

export interface CommentItemProps {
  comment: CommentItemData;
  onReply?: (parentId: number, body: string) => Promise<void> | void;
  onDelete?: (commentId: number) => Promise<void> | void;
  isReply?: boolean;
  depth?: number;
  className?: string;
}

function countDescendants(item: CommentItemData): number {
  let count = 0;
  for (const child of item.replies ?? []) {
    count += (child.is_deleted ? 0 : 1) + countDescendants(child);
  }
  return count;
}

export function CommentItem({
  comment,
  onReply,
  onDelete,
  isReply = false,
  depth = 0,
  className,
}: CommentItemProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const formattedTime = (() => {
    try {
      const date = parseDate(comment.created_at);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return '';
    }
  })();

  const displayName = comment.author?.display_name || comment.author?.username || 'User';
  const username = comment.author?.username;
  const avatarLetter = (displayName[0] || '?').toUpperCase();
  const totalDescendants = countDescendants(comment);

  const handleReplySubmit = async (body: string) => {
    if (!onReply) return;
    setIsSubmittingReply(true);
    try {
      await onReply(comment.id, body);
      setIsReplying(false);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(comment.id);
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Collapsed / Condensed State (Reddit-style)
  // ---------------------------------------------------------------------------
  if (isCollapsed) {
    return (
      <div
        className={cn(
          'border-ink bg-surface shadow-neo flex cursor-pointer items-center justify-between gap-2 border-2 p-2 transition-colors sm:px-3 sm:py-2.5',
          'hover:bg-zinc-100 dark:hover:bg-zinc-800/80',
          isReply && 'bg-zinc-50 dark:bg-zinc-900/60',
          className
        )}
        onClick={() => setIsCollapsed(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsCollapsed(false);
          }
        }}
        title="Click to expand thread"
      >
        <div className="flex min-w-0 items-center gap-2">
          {comment.author?.avatar_url && !comment.is_deleted ? (
            <img
              src={comment.author.avatar_url}
              alt={displayName}
              className="border-ink h-6 w-6 shrink-0 rounded-full border-2 object-cover"
            />
          ) : (
            <div className="border-ink bg-accent/20 dark:bg-accent/30 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold text-zinc-800 dark:text-zinc-200">
              {comment.is_deleted ? '?' : avatarLetter}
            </div>
          )}

          <span className="font-display truncate text-xs font-bold tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
            {comment.is_deleted ? '[deleted]' : displayName}
          </span>

          {!comment.is_deleted && username && (
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

        {/* Expand Button: Kept on the right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(false);
          }}
          className={cn(
            CONBLOCK_SECONDARY,
            'inline-flex h-7 w-7 shrink-0 items-center justify-center p-0 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100'
          )}
          title="Expand thread"
          aria-label="Expand thread"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  // Max reply depth is 5 tiers (depths 0, 1, 2, 3, 4). At depth 4, reply button is hidden.
  const canReply = !comment.is_deleted && Boolean(onReply) && depth < 4;

  return (
    <div
      className={cn(
        'border-ink bg-surface shadow-neo border-2 p-3.5 sm:p-4',
        isReply && 'bg-zinc-50 dark:bg-zinc-900/60',
        className
      )}
    >
      {/* Author Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {comment.author?.avatar_url && !comment.is_deleted ? (
            <img
              src={comment.author.avatar_url}
              alt={displayName}
              className="border-ink h-8 w-8 rounded-full border-2 object-cover"
            />
          ) : (
            <div className="border-ink bg-accent/20 dark:bg-accent/30 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {comment.is_deleted ? '?' : avatarLetter}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <span className="font-display truncate text-xs font-bold tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
                {comment.is_deleted ? '[deleted]' : displayName}
              </span>
              {!comment.is_deleted && username && (
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  @{username}
                </span>
              )}
            </div>

            {formattedTime && (
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{formattedTime}</p>
            )}
          </div>
        </div>

        {/* Action Buttons: Collapse + Delete */}
        <div className="flex items-center gap-1.5">
          {/* Reddit-style Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className={cn(
              CONBLOCK_SECONDARY,
              'inline-flex h-7 w-7 items-center justify-center p-0 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            )}
            title="Collapse thread"
            aria-label="Collapse thread"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          {/* Delete Action */}
          {!comment.is_deleted && comment.can_delete && onDelete && (
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className={cn(
                CONBLOCK_SECONDARY,
                'inline-flex h-7 w-7 items-center justify-center p-0 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300'
              )}
              title="Delete Comment"
              aria-label="Delete Comment"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Replying-to Context Tag (shown on sub-replies) */}
      {depth > 0 && comment.reply_to_username && !comment.is_deleted && (
        <div className="text-accent-pop mt-1.5 flex items-center gap-1 text-[11px] font-semibold">
          <span>Replying to @{comment.reply_to_username}</span>
        </div>
      )}

      {/* Comment Body */}
      <div className="mt-2 text-sm">
        {comment.is_deleted ? (
          <p className="text-xs text-zinc-500 italic dark:text-zinc-400">
            [This comment has been deleted]
          </p>
        ) : (
          <p className="font-medium break-words whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
            {comment.body}
          </p>
        )}
      </div>

      {/* Reply Action: Enabled for any depth up to 4 */}
      {canReply && (
        <div className="mt-3 flex items-center gap-2 border-t border-zinc-200 pt-2.5 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setIsReplying((prev) => !prev)}
            className={cn(
              CONBLOCK_SECONDARY,
              'inline-flex h-7 items-center gap-1 px-2.5 text-[11px] font-bold tracking-wider uppercase'
            )}
          >
            <CornerDownRight className="h-3 w-3" />
            <span>Reply</span>
          </button>
        </div>
      )}

      {/* Inline Reply Form */}
      {isReplying && (
        <div className="mt-3 border-t-2 border-zinc-200 pt-3 dark:border-zinc-800">
          <CommentForm
            onSubmit={handleReplySubmit}
            onCancel={() => setIsReplying(false)}
            isSubmitting={isSubmittingReply}
            placeholder={`Reply to @${displayName}...`}
            submitLabel="Reply"
            autoFocus
          />
        </div>
      )}

      {/* Nested Child Replies: Clamped after depth 1 to avoid narrow mobile squishing */}
      {comment.replies && comment.replies.length > 0 && (
        <div
          className={cn(
            'mt-3.5 space-y-3',
            depth < 2
              ? 'border-l-2 border-zinc-300 pl-3 sm:ml-2 sm:pl-4 dark:border-zinc-700'
              : 'ml-1 border-l-2 border-dashed border-zinc-300/80 pl-2 sm:pl-3 dark:border-zinc-700/80'
          )}
        >
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              isReply={true}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName="this comment"
        itemType="Comment"
        title="Delete Comment"
        warningMessage="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete Comment"
        isPending={isDeleting}
      />
    </div>
  );
}
