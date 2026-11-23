'use client';

import { EmptyState } from '@/shared/components/ui';
import { CommentItem } from './thread';
import type { CommentItemData } from '../types';

export interface CommentListProps {
  comments?: CommentItemData[];
  isLoading?: boolean;
  onReply?: (parentId: number, body: string) => Promise<void> | void;
  onDelete?: (commentId: number) => Promise<void> | void;
}

export function CommentList({
  comments = [],
  isLoading = false,
  onReply,
  onDelete,
}: CommentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-ink animate-pulse rounded-sm border-2 bg-zinc-50/80 p-2.5 dark:bg-zinc-900/50"
          >
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="min-w-0 space-y-1.5">
                <div className="h-3 w-28 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-2 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>
            <div className="mt-2 space-y-1.5 pl-8">
              <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <EmptyState
        mascot
        mascotSpeech="Be the first to say something!"
        title="No Comments Yet"
        description=""
        className="border-zinc-300 dark:border-zinc-700"
      />
    );
  }

  return (
    <div className="space-y-3 sm:space-y-3.5">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} onReply={onReply} onDelete={onDelete} />
      ))}
    </div>
  );
}
