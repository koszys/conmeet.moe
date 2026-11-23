'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CornerDownRight, Trash2 } from 'lucide-react';
import { CONBLOCK_SECONDARY, ConfirmDeleteModal } from '@/shared/components/ui';
import { parseDate } from '@/shared/lib/dates';
import { cn } from '@/shared/lib/utils';
import { CommentForm } from '../CommentForm';
import { CommentAvatar } from './CommentAvatar';
import { ThreadStem } from './ThreadStem';
import { ThreadBranch } from './ThreadBranch';
import { CollapsedCommentCard } from './CollapsedCommentCard';
import { DeepThreadModal } from './DeepThreadModal';
import type { CommentItemData } from '../../types';

export interface CommentItemProps {
  comment: CommentItemData;
  onReply?: (parentId: number, body: string) => Promise<void> | void;
  onDelete?: (commentId: number) => Promise<void> | void;
  isReply?: boolean;
  depth?: number;
  className?: string;
  isInModal?: boolean;
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
  depth = 0,
  className,
  isInModal = false,
}: CommentItemProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isThreadModalOpen, setIsThreadModalOpen] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isLineHovered, setIsLineHovered] = useState(false);

  const formattedTime = (() => {
    try {
      const date = parseDate(comment.created_at);
      return formatDistanceToNow(date, { addSuffix: true })
        .replace(/(?:about\s+)?(\d+)\s+hours?\s+ago/i, '$1 hr. ago')
        .replace(/^about\s+/i, '');
    } catch {
      return '';
    }
  })();

  const displayName = comment.author?.display_name || comment.author?.username || 'User';
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

  const handleCollapse = () => {
    setIsLineHovered(false);
    setIsCollapsed(true);
  };

  const handleExpand = () => {
    setIsLineHovered(false);
    setIsCollapsed(false);
  };

  // ---------------------------------------------------------------------------
  // Collapsed / Condensed View (Reddit-style, disabled inside modal)
  // ---------------------------------------------------------------------------
  if (!isInModal && isCollapsed) {
    return (
      <CollapsedCommentCard
        depth={depth}
        displayName={displayName}
        isDeleted={comment.is_deleted}
        formattedTime={formattedTime}
        className={className}
        onExpand={handleExpand}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Expanded View
  // ---------------------------------------------------------------------------
  const canReply = !comment.is_deleted && Boolean(onReply) && depth < 4;
  const hasReplies = Boolean(comment.replies && comment.replies.length > 0);

  return (
    <div
      className={cn(
        'relative rounded-sm transition-colors',
        depth === 0
          ? 'border-ink border-2 bg-zinc-50/80 p-2.5 dark:bg-zinc-900/50'
          : 'bg-zinc-100/60 p-2 dark:bg-zinc-800/40',
        className
      )}
    >
      {/* Thread Rail Layout: Left Rail (Avatar + Line) & Right Content */}
      <div className="flex gap-2">
        {/* Left Rail */}
        <div className="flex w-7 shrink-0 flex-col items-center">
          <CommentAvatar
            avatarUrl={comment.author?.avatar_url}
            displayName={displayName}
            avatarLetter={avatarLetter}
            isDeleted={comment.is_deleted}
          />
          {hasReplies && (
            <ThreadStem
              isInteractive={!isInModal}
              isHovered={isLineHovered}
              onCollapse={handleCollapse}
              onHoverChange={setIsLineHovered}
            />
          )}
        </div>

        {/* Right Content Column */}
        <div className="min-w-0 flex-1">
          {/* Author Header */}
          <div className="flex min-h-7 items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span
                className={cn(
                  'font-display truncate text-xs font-bold tracking-wider uppercase',
                  comment.is_deleted
                    ? 'text-zinc-500 dark:text-zinc-300'
                    : 'text-zinc-900 dark:text-zinc-100'
                )}
              >
                {comment.is_deleted ? '[deleted]' : displayName}
              </span>
              {formattedTime && (
                <span className="text-[10px] text-zinc-500 dark:text-zinc-300">
                  · {formattedTime}
                </span>
              )}
            </div>

            {/* Delete Action Button */}
            {!comment.is_deleted && comment.can_delete && onDelete && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className={cn(
                  CONBLOCK_SECONDARY,
                  'inline-flex h-6 w-6 shrink-0 items-center justify-center p-0 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300'
                )}
                title="Delete Comment"
                aria-label="Delete Comment"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Replying-to Context Tag */}
          {depth > 0 && comment.reply_to_username && !comment.is_deleted && (
            <div className="text-accent-pop mt-1 flex items-center gap-1 text-[11px] font-semibold">
              <span>Replying to {comment.reply_to_username}</span>
            </div>
          )}

          {/* Comment Body */}
          <div className="mt-1.5 text-sm">
            {comment.is_deleted ? (
              <p className="text-xs text-zinc-500 italic dark:text-zinc-300">
                [This comment has been deleted]
              </p>
            ) : (
              <p className="leading-relaxed font-normal break-words whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                {comment.body}
              </p>
            )}
          </div>

          {/* Inline Actions (Reply) */}
          {canReply && (
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsReplying((prev) => !prev)}
                className={cn(
                  CONBLOCK_SECONDARY,
                  'inline-flex h-6 items-center gap-1 px-2 text-[10px] font-bold tracking-wider uppercase'
                )}
              >
                <CornerDownRight className="h-3 w-3" />
                <span>Reply</span>
              </button>
            </div>
          )}

          {/* Inline Reply Form */}
          {isReplying && (
            <div className="mt-2.5 max-w-full min-w-0 pb-1.5">
              <CommentForm
                onSubmit={handleReplySubmit}
                onCancel={() => setIsReplying(false)}
                isSubmitting={isSubmittingReply}
                placeholder={`Reply to ${displayName}...`}
                submitLabel="Reply"
                autoFocus
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile "Continue (count)" Drill-Down Button for Deep Nesting */}
      {!isInModal && depth >= 2 && hasReplies && (
        <div className="mt-2 sm:hidden">
          <button
            type="button"
            onClick={() => setIsThreadModalOpen(true)}
            className={cn(
              CONBLOCK_SECONDARY,
              'text-accent-pop hover:text-accent-pop/80 inline-flex h-6 items-center gap-1 px-2 text-[10px] font-bold tracking-wider uppercase'
            )}
          >
            <CornerDownRight className="h-3 w-3" />
            <span>Continue ({totalDescendants})</span>
          </button>
        </div>
      )}

      {/* Nested Child Replies */}
      {hasReplies && (
        <div
          className={cn(
            'mt-2.5 ml-[14px] space-y-2',
            !isInModal && depth >= 2 && 'hidden sm:block'
          )}
        >
          {comment.replies!.map((reply, index) => {
            const isLast = index === comment.replies!.length - 1;
            return (
              <div key={reply.id} className="relative">
                <ThreadBranch
                  isLast={isLast}
                  index={index}
                  isInteractive={!isInModal}
                  isHovered={isLineHovered}
                  onCollapse={handleCollapse}
                  onHoverChange={setIsLineHovered}
                />
                <CommentItem
                  comment={reply}
                  onReply={onReply}
                  onDelete={onDelete}
                  depth={depth + 1}
                  isInModal={isInModal}
                  className="ml-2.5"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {!comment.is_deleted && comment.can_delete && onDelete && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          itemName="this comment"
          itemType="Comment"
          title="Delete Comment?"
          warningMessage="Are you sure you want to delete this comment? This action cannot be undone."
          confirmText="Delete Comment"
          confirmTextMobile="Delete"
          isPending={isDeleting}
        />
      )}

      {/* Mobile Deep Thread Drill-Down Modal */}
      {depth >= 2 && hasReplies && (
        <DeepThreadModal
          isOpen={isThreadModalOpen}
          onClose={() => setIsThreadModalOpen(false)}
          comment={comment}
          displayName={displayName}
          avatarLetter={avatarLetter}
          formattedTime={formattedTime}
          canReply={canReply}
          depth={depth}
          hasReplies={hasReplies}
          onReply={onReply}
          renderChildItem={(reply, childDepth) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              depth={childDepth}
              isInModal
              className="ml-2.5"
            />
          )}
        />
      )}
    </div>
  );
}
