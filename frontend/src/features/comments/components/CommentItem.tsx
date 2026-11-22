'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CornerDownRight, MessageSquare, Plus, Trash2 } from 'lucide-react';
import {
  CONBLOCK_SECONDARY,
  ConfirmDeleteModal,
  Modal,
  ModalBody,
  ModalHeader,
} from '@/shared/components/ui';
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
  const [isReplyingInModal, setIsReplyingInModal] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isLineHovered, setIsLineHovered] = useState(false);

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

  const handleCollapse = () => {
    setIsLineHovered(false);
    setIsCollapsed(true);
  };

  const handleExpand = () => {
    setIsLineHovered(false);
    setIsCollapsed(false);
  };

  // ---------------------------------------------------------------------------
  // Collapsed / Condensed State (Reddit-style, disabled in modal)
  // ---------------------------------------------------------------------------
  if (!isInModal && isCollapsed) {
    return (
      <div
        className={cn(
          'group flex cursor-pointer items-center justify-between gap-2 rounded-sm transition-colors',
          depth === 0
            ? 'border-ink border-2 bg-zinc-50/80 p-2.5 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/60'
            : 'bg-zinc-100/60 p-2 hover:bg-zinc-200/60 dark:bg-zinc-800/40 dark:hover:bg-zinc-700/40',
          className
        )}
        onClick={handleExpand}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleExpand();
          }
        }}
        title="Click to expand thread"
      >
        <div className="flex min-w-0 items-center gap-2">
          {/* Avatar */}
          <div className="relative shrink-0">
            {comment.author?.avatar_url && !comment.is_deleted ? (
              <img
                src={comment.author.avatar_url}
                alt={displayName}
                className="border-ink relative z-20 h-6 w-6 shrink-0 rounded-full border-2 object-cover"
              />
            ) : (
              <div className="border-ink relative z-20 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white text-[10px] font-bold text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                <span className="bg-accent/20 dark:bg-accent/30 flex h-full w-full items-center justify-center rounded-full">
                  {comment.is_deleted ? '?' : avatarLetter}
                </span>
              </div>
            )}
          </div>

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
            handleExpand();
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

  // Max reply depth is 5 tiers (depths 0, 1, 2, 3, 4). At depth 4, reply button is hidden.
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
        {/* Left Rail: Avatar and vertical line down to replies */}
        <div className="flex w-6 shrink-0 flex-col items-center">
          <div className="relative shrink-0">
            {comment.author?.avatar_url && !comment.is_deleted ? (
              <img
                src={comment.author.avatar_url}
                alt={displayName}
                className="border-ink relative z-20 h-6 w-6 shrink-0 rounded-full border-2 object-cover"
              />
            ) : (
              <div className="border-ink relative z-20 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white text-[10px] font-bold text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                <span className="bg-accent/20 dark:bg-accent/30 flex h-full w-full items-center justify-center rounded-full">
                  {comment.is_deleted ? '?' : avatarLetter}
                </span>
              </div>
            )}
          </div>

          {/* Vertical line directly under avatar down to replies */}
          {hasReplies &&
            (!isInModal ? (
              <button
                type="button"
                onClick={handleCollapse}
                onMouseEnter={() => setIsLineHovered(true)}
                onMouseLeave={() => setIsLineHovered(false)}
                className="group/line mt-0 -mb-2.5 flex w-4 flex-1 cursor-pointer justify-center select-none focus:outline-none"
                title="Click threadline to collapse"
                aria-label="Click threadline to collapse"
              >
                <span
                  className={cn(
                    'h-full transition-colors',
                    isLineHovered
                      ? 'bg-accent-pop w-[2px]'
                      : 'group-hover/line:bg-accent-pop w-[2px] bg-zinc-300 dark:bg-zinc-700'
                  )}
                />
              </button>
            ) : (
              <div className="mt-0 -mb-2.5 flex w-4 flex-1 justify-center select-none">
                <span className="h-full w-[2px] bg-zinc-300 dark:bg-zinc-700" />
              </div>
            ))}
        </div>

        {/* Right Content Column */}
        <div className="min-w-0 flex-1">
          {/* Author Header */}
          <div className="flex items-start justify-between gap-2">
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
                {formattedTime && (
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    · {formattedTime}
                  </span>
                )}
              </div>
            </div>

            {/* Delete Action (Modal Trigger: Zero Horizontal Overflow on Small Screens) */}
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

          {/* Replying-to Context Tag (shown on sub-replies) */}
          {depth > 0 && comment.reply_to_username && !comment.is_deleted && (
            <div className="text-accent-pop mt-1 flex items-center gap-1 text-[11px] font-semibold">
              <span>Replying to @{comment.reply_to_username}</span>
            </div>
          )}

          {/* Comment Body */}
          <div className="mt-1.5 text-sm">
            {comment.is_deleted ? (
              <p className="text-xs text-zinc-500 italic dark:text-zinc-400">
                [This comment has been deleted]
              </p>
            ) : (
              <p className="leading-relaxed font-normal break-words whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                {comment.body}
              </p>
            )}
          </div>

          {/* Inline Actions (Reply) */}
          {canReply ? (
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
          ) : (
            depth >= 4 &&
            !comment.is_deleted &&
            Boolean(onReply) && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-400 italic dark:text-zinc-500">
                <span>Maximum reply depth reached</span>
              </div>
            )
          )}

          {/* Inline Reply Form */}
          {isReplying && (
            <div className="mt-2.5 max-w-full min-w-0 pb-1.5">
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
        </div>
      </div>

      {/* Mobile "Continue (count)" Drill-Down Button for Deep Nesting (depth >= 2, only in main list) */}
      {!isInModal && depth >= 2 && hasReplies && (
        <div className="mt-2.5 sm:hidden">
          <button
            type="button"
            onClick={() => setIsThreadModalOpen(true)}
            className={cn(
              CONBLOCK_SECONDARY,
              'text-accent-pop hover:text-accent-pop/80 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold tracking-wider uppercase'
            )}
          >
            <CornerDownRight className="h-3.5 w-3.5" />
            <span>Continue ({totalDescendants})</span>
          </button>
        </div>
      )}

      {/* Nested Child Replies: Vertical threadline terminates at last reply with no runoff */}
      {hasReplies && (
        <div
          className={cn(
            'mt-2.5 ml-[12px] space-y-2',
            !isInModal && depth >= 2 && 'hidden sm:block'
          )}
        >
          {comment.replies!.map((reply, index) => {
            const isLast = index === comment.replies!.length - 1;
            return (
              <div key={reply.id} className="relative">
                {isLast ? (
                  /* Unified L-curve for final reply: runs down from trunk and curves into avatar with zero runoff */
                  !isInModal ? (
                    <button
                      type="button"
                      onClick={handleCollapse}
                      onMouseEnter={() => setIsLineHovered(true)}
                      onMouseLeave={() => setIsLineHovered(false)}
                      className={cn(
                        'group/line absolute z-10 cursor-pointer transition-colors select-none focus:outline-none',
                        'rounded-bl-md border-b-2 border-l-2',
                        '-left-[1px]',
                        index === 0 ? '-top-2.5' : '-top-2',
                        index === 0 ? 'h-[calc(21px+0.625rem)]' : 'h-[calc(21px+0.5rem)]',
                        'w-[20px]',
                        isLineHovered
                          ? 'border-accent-pop'
                          : 'hover:border-accent-pop border-zinc-300 dark:border-zinc-700'
                      )}
                      title="Click threadline to collapse"
                      aria-label="Click threadline to collapse"
                    />
                  ) : (
                    <div
                      className={cn(
                        'pointer-events-none absolute z-10 select-none',
                        'rounded-bl-md border-b-2 border-l-2 border-zinc-300 dark:border-zinc-700',
                        '-left-[1px]',
                        index === 0 ? '-top-2.5' : '-top-2',
                        index === 0 ? 'h-[calc(21px+0.625rem)]' : 'h-[calc(21px+0.5rem)]',
                        'w-[20px]'
                      )}
                      aria-hidden="true"
                    />
                  )
                ) : (
                  /* Intermediate replies: trunk continues downward past avatar, with fused branch into avatar */
                  <>
                    {!isInModal ? (
                      <button
                        type="button"
                        onClick={handleCollapse}
                        onMouseEnter={() => setIsLineHovered(true)}
                        onMouseLeave={() => setIsLineHovered(false)}
                        className={cn(
                          'group/line absolute left-0 z-10 flex w-4 -translate-x-1/2 cursor-pointer justify-center select-none focus:outline-none',
                          index === 0 ? '-top-2.5' : '-top-2',
                          '-bottom-2'
                        )}
                        title="Click threadline to collapse"
                        aria-label="Click threadline to collapse"
                      >
                        <span
                          className={cn(
                            'h-full transition-colors',
                            isLineHovered
                              ? 'bg-accent-pop w-[2px]'
                              : 'group-hover/line:bg-accent-pop w-[2px] bg-zinc-300 dark:bg-zinc-700'
                          )}
                        />
                      </button>
                    ) : (
                      <div
                        className={cn(
                          'pointer-events-none absolute left-0 z-10 flex w-4 -translate-x-1/2 justify-center select-none',
                          index === 0 ? '-top-2.5' : '-top-2',
                          '-bottom-2'
                        )}
                        aria-hidden="true"
                      >
                        <span className="h-full w-[2px] bg-zinc-300 dark:bg-zinc-700" />
                      </div>
                    )}
                    <span
                      className={cn(
                        'pointer-events-none absolute -left-[1px] z-10 transition-colors',
                        'top-[20px] -translate-y-1/2',
                        'h-[2px] w-[21px]',
                        !isInModal && isLineHovered
                          ? 'bg-accent-pop'
                          : 'bg-zinc-300 dark:bg-zinc-700'
                      )}
                      aria-hidden="true"
                    />
                  </>
                )}
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

      {/* Mobile Deep Thread Drill-Down Modal (Full Screen Width) */}
      {depth >= 2 && hasReplies && (
        <Modal
          isOpen={isThreadModalOpen}
          onClose={() => {
            setIsThreadModalOpen(false);
            setIsReplyingInModal(false);
          }}
          maxWidth="lg"
          ariaLabel="Thread Discussion"
        >
          <ModalHeader
            title="Thread Discussion"
            subtitle={username ? `Replying to @${username}` : undefined}
            onClose={() => {
              setIsThreadModalOpen(false);
              setIsReplyingInModal(false);
            }}
          />
          <ModalBody className="max-h-[80vh] overflow-y-auto p-2.5 pb-8 sm:p-4 sm:pb-10">
            {/* Anchor Comment with Full Threadlines (Non-condensable in modal) */}
            <div className="border-ink rounded-sm border-2 bg-zinc-50/80 p-2.5 dark:bg-zinc-900/50">
              <div className="flex gap-2">
                {/* Left Rail: Avatar and vertical line down to replies */}
                <div className="flex w-6 shrink-0 flex-col items-center">
                  <div className="relative shrink-0">
                    {comment.author?.avatar_url && !comment.is_deleted ? (
                      <img
                        src={comment.author.avatar_url}
                        alt={displayName}
                        className="border-ink relative z-20 h-6 w-6 rounded-full border-2 object-cover"
                      />
                    ) : (
                      <div className="border-ink relative z-20 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white text-[10px] font-bold text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                        <span className="bg-accent/20 dark:bg-accent/30 flex h-full w-full items-center justify-center rounded-full">
                          {comment.is_deleted ? '?' : avatarLetter}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Vertical line directly under avatar down to replies inside modal */}
                  {hasReplies && (
                    <div className="mt-0 -mb-2.5 flex w-4 flex-1 justify-center select-none">
                      <span className="h-full w-[2px] bg-zinc-300 dark:bg-zinc-700" />
                    </div>
                  )}
                </div>

                {/* Right Content Column */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-display text-xs font-bold tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
                        {comment.is_deleted ? '[deleted]' : displayName}
                      </span>
                      {!comment.is_deleted && username && (
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                          @{username}
                        </span>
                      )}
                      {formattedTime && (
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          · {formattedTime}
                        </span>
                      )}
                    </div>
                  </div>

                  {comment.reply_to_username && !comment.is_deleted && (
                    <div className="text-accent-pop mt-0.5 text-[11px] font-semibold">
                      Replying to @{comment.reply_to_username}
                    </div>
                  )}
                  <div className="mt-1.5 text-sm text-zinc-800 dark:text-zinc-200">
                    {comment.is_deleted ? (
                      <p className="text-xs text-zinc-500 italic">
                        [This comment has been deleted]
                      </p>
                    ) : (
                      <p className="leading-relaxed break-words whitespace-pre-wrap">
                        {comment.body}
                      </p>
                    )}
                  </div>

                  {/* Reply button for anchor comment */}
                  {canReply ? (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsReplyingInModal((prev) => !prev)}
                        className={cn(
                          CONBLOCK_SECONDARY,
                          'inline-flex h-6 items-center gap-1 px-2 text-[10px] font-bold tracking-wider uppercase'
                        )}
                      >
                        <CornerDownRight className="h-3 w-3" />
                        <span>Reply</span>
                      </button>
                    </div>
                  ) : (
                    depth >= 4 &&
                    !comment.is_deleted &&
                    Boolean(onReply) && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-400 italic dark:text-zinc-500">
                        <span>Maximum reply depth reached</span>
                      </div>
                    )
                  )}

                  {isReplyingInModal && (
                    <div className="mt-2.5 max-w-full min-w-0 pb-1.5">
                      <CommentForm
                        onSubmit={async (body) => {
                          await handleReplySubmit(body);
                          setIsReplyingInModal(false);
                        }}
                        onCancel={() => setIsReplyingInModal(false)}
                        isSubmitting={isSubmittingReply}
                        placeholder={`Reply to @${displayName}...`}
                        submitLabel="Reply"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Threadline Rail to replies inside modal */}
              {hasReplies && (
                <div className="mt-2.5 ml-[12px] space-y-2">
                  {comment.replies!.map((reply, index) => {
                    const isLast = index === comment.replies!.length - 1;
                    return (
                      <div key={reply.id} className="relative">
                        {isLast ? (
                          /* Static Unified L-curve for final reply in modal */
                          <div
                            className={cn(
                              'pointer-events-none absolute z-10 select-none',
                              'rounded-bl-md border-b-2 border-l-2 border-zinc-300 dark:border-zinc-700',
                              '-left-[1px]',
                              index === 0 ? '-top-2.5' : '-top-2',
                              index === 0 ? 'h-[calc(21px+0.625rem)]' : 'h-[calc(21px+0.5rem)]',
                              'w-[20px]'
                            )}
                            aria-hidden="true"
                          />
                        ) : (
                          /* Static intermediate replies in modal */
                          <>
                            <div
                              className={cn(
                                'pointer-events-none absolute left-0 z-10 flex w-4 -translate-x-1/2 justify-center select-none',
                                index === 0 ? '-top-2.5' : '-top-2',
                                '-bottom-2'
                              )}
                              aria-hidden="true"
                            >
                              <span className="h-full w-[2px] bg-zinc-300 dark:bg-zinc-700" />
                            </div>
                            <span
                              className="pointer-events-none absolute top-[20px] -left-[1px] z-10 h-[2px] w-[21px] -translate-y-1/2 bg-zinc-300 dark:bg-zinc-700"
                              aria-hidden="true"
                            />
                          </>
                        )}
                        <CommentItem
                          comment={reply}
                          onReply={onReply}
                          onDelete={onDelete}
                          depth={depth + 1}
                          isInModal={true}
                          className="ml-2.5"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
}
