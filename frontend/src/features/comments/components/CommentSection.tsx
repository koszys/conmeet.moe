'use client';

import { MessageSquare } from 'lucide-react';
import { useAlbumComments, useCommentSettings, useMeetupComments } from '../api/queries';
import { useCreateComment, useDeleteComment } from '../api/mutations';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import type { CommentItemData, CommentTargetType } from '../types';
import { cn } from '@/shared/lib/utils';

function countActiveComments(items: CommentItemData[] = []): number {
  return items.reduce((acc, c) => {
    const selfCount = c.is_deleted ? 0 : 1;
    const childrenCount = countActiveComments(c.replies ?? []);
    return acc + selfCount + childrenCount;
  }, 0);
}

export interface CommentSectionProps {
  targetType: CommentTargetType;
  targetId: string | number;
  isUnmounted?: boolean;
  className?: string;
}

export function CommentSection({
  targetType,
  targetId,
  isUnmounted,
  className,
}: CommentSectionProps) {
  const { data: settings } = useCommentSettings();

  // Complete unmount evaluation:
  // If either specific item is marked unmounted, or global sitewide/category switch is on
  const shouldUnmount =
    Boolean(isUnmounted) ||
    Boolean(settings?.unmount_all_comment_sections) ||
    (targetType === 'meetup' && Boolean(settings?.unmount_all_meetup_comments)) ||
    (targetType === 'album' && Boolean(settings?.unmount_all_album_comments));

  if (shouldUnmount) {
    return null; // Zero DOM footprint
  }

  return <ActiveCommentSection targetType={targetType} targetId={targetId} className={className} />;
}

interface ActiveCommentSectionProps {
  targetType: CommentTargetType;
  targetId: string | number;
  className?: string;
}

function ActiveCommentSection({ targetType, targetId, className }: ActiveCommentSectionProps) {
  const meetupQuery = useMeetupComments(targetId, targetType === 'meetup');
  const albumQuery = useAlbumComments(targetId, targetType === 'album');

  const { data: comments, isLoading } = targetType === 'meetup' ? meetupQuery : albumQuery;

  const createComment = useCreateComment(targetType, targetId);
  const deleteComment = useDeleteComment(targetType, targetId);

  // Compute total active comment count recursively including all nested descendants
  const totalCount = countActiveComments(comments);

  const handleCreateComment = async (body: string) => {
    await createComment.mutateAsync({ body });
  };

  const handleReplyComment = async (parentId: number, body: string) => {
    await createComment.mutateAsync({ body, parent: parentId });
  };

  const handleDeleteComment = async (commentId: number) => {
    await deleteComment.mutateAsync(commentId);
  };

  return (
    <section
      className={cn('border-ink border-t-2 pt-8 dark:border-zinc-800', className)}
      aria-label="Comments"
    >
      <div className="border-ink flex items-center justify-between gap-3 border-b-2 pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-zinc-800 dark:text-zinc-200" />
          <h2 className="font-display text-lg tracking-wide uppercase sm:text-xl">
            Comments ({totalCount})
          </h2>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <CommentForm onSubmit={handleCreateComment} isSubmitting={createComment.isPending} />

        <CommentList
          comments={comments}
          isLoading={isLoading}
          onReply={handleReplyComment}
          onDelete={handleDeleteComment}
        />
      </div>
    </section>
  );
}
