import { useState, type ReactNode } from 'react';
import { CornerDownRight } from 'lucide-react';
import { CONBLOCK_SECONDARY, Modal, ModalBody, ModalHeader } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { CommentForm } from '../CommentForm';
import { CommentAvatar } from './CommentAvatar';
import { ThreadStem } from './ThreadStem';
import { ThreadBranch } from './ThreadBranch';
import type { CommentItemData } from '../../types';

export interface DeepThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  comment: CommentItemData;
  displayName: string;
  username?: string;
  avatarLetter: string;
  formattedTime: string;
  canReply: boolean;
  depth: number;
  hasReplies: boolean;
  onReply?: (parentId: number, body: string) => Promise<void> | void;
  renderChildItem: (reply: CommentItemData, childDepth: number) => ReactNode;
}

/**
 * Mobile drill-down modal for viewing deep comment subtrees with full width.
 */
export function DeepThreadModal({
  isOpen,
  onClose,
  comment,
  displayName,
  username,
  avatarLetter,
  formattedTime,
  canReply,
  depth,
  hasReplies,
  onReply,
  renderChildItem,
}: DeepThreadModalProps) {
  const [isReplyingInModal, setIsReplyingInModal] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const handleModalReplySubmit = async (body: string) => {
    if (!onReply) return;
    setIsSubmittingReply(true);
    try {
      await onReply(comment.id, body);
      setIsReplyingInModal(false);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setIsReplyingInModal(false);
      }}
      maxWidth="lg"
      ariaLabel="Thread Discussion"
    >
      <ModalHeader
        title="Thread Discussion"
        subtitle={username ? `Replying to @${username}` : undefined}
        onClose={() => {
          onClose();
          setIsReplyingInModal(false);
        }}
      />
      <ModalBody className="max-h-[80vh] overflow-y-auto p-2.5 pb-8 sm:p-4 sm:pb-10">
        <div className="border-ink rounded-sm border-2 bg-zinc-50/80 p-2.5 dark:bg-zinc-900/50">
          <div className="flex gap-2">
            {/* Left Rail */}
            <div className="flex w-6 shrink-0 flex-col items-center">
              <CommentAvatar
                avatarUrl={comment.author?.avatar_url}
                displayName={displayName}
                avatarLetter={avatarLetter}
                isDeleted={comment.is_deleted}
              />
              {hasReplies && <ThreadStem isInteractive={false} />}
            </div>

            {/* Right Content */}
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
                  <p className="text-xs text-zinc-500 italic">[This comment has been deleted]</p>
                ) : (
                  <p className="leading-relaxed break-words whitespace-pre-wrap">{comment.body}</p>
                )}
              </div>

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
                    onSubmit={handleModalReplySubmit}
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

          {/* Child Replies inside Modal (Static Non-Condensable Threadlines) */}
          {hasReplies && (
            <div className="mt-2.5 ml-[12px] space-y-2">
              {comment.replies!.map((reply, index) => {
                const isLast = index === comment.replies!.length - 1;
                return (
                  <div key={reply.id} className="relative">
                    <ThreadBranch isLast={isLast} index={index} isInteractive={false} />
                    {renderChildItem(reply, depth + 1)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
}
