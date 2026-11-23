'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MessageSquare } from 'lucide-react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
import { useAlbumComments, useCommentSettings, useMeetupComments } from '../api/queries';
import { useCreateComment, useDeleteComment } from '../api/mutations';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import type { CommentTargetType } from '../types';
import { Pagination } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

export interface CommentSectionProps {
  targetType: CommentTargetType;
  targetId: string | number;
  isUnmounted?: boolean;
  className?: string;
  pageSize?: number;
}

export function CommentSection({
  targetType,
  targetId,
  isUnmounted,
  className,
  pageSize = 10,
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

  return (
    <ActiveCommentSection
      key={`${targetType}-${targetId}`}
      targetType={targetType}
      targetId={targetId}
      pageSize={pageSize}
      className={className}
    />
  );
}

interface ActiveCommentSectionProps {
  targetType: CommentTargetType;
  targetId: string | number;
  className?: string;
  pageSize?: number;
}

function ActiveCommentSection({
  targetType,
  targetId,
  className,
  pageSize = 10,
}: ActiveCommentSectionProps) {
  const [page, setPage] = useState(1);
  const paginationRef = useRef<HTMLElement>(null);
  const paginationPosRef = useRef<number | null>(null);

  const meetupQuery = useMeetupComments(targetId, targetType === 'meetup');
  const albumQuery = useAlbumComments(targetId, targetType === 'album');

  const { data: comments, isLoading } = targetType === 'meetup' ? meetupQuery : albumQuery;

  const createComment = useCreateComment(targetType, targetId);
  const deleteComment = useDeleteComment(targetType, targetId);

  // Top-level thread pagination
  const topLevelCount = comments?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(topLevelCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const paginatedComments = comments
    ? comments.slice((safePage - 1) * pageSize, safePage * pageSize)
    : [];

  const handlePageChange = (newPage: number) => {
    if (paginationRef.current) {
      paginationPosRef.current = paginationRef.current.getBoundingClientRect().top;
    }
    setPage(newPage);
  };

  useIsomorphicLayoutEffect(() => {
    if (paginationPosRef.current !== null && paginationRef.current) {
      const prevTop = paginationPosRef.current;
      paginationPosRef.current = null;
      const currentTop = paginationRef.current.getBoundingClientRect().top;
      const delta = currentTop - prevTop;
      if (Math.abs(delta) > 0.5) {
        window.scrollBy({ top: delta, behavior: 'instant' });
      }
    }
  }, [page]);

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
          <h2 className="font-display text-lg tracking-wide uppercase sm:text-xl">Comments</h2>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <CommentForm onSubmit={handleCreateComment} isSubmitting={createComment.isPending} />

        <CommentList
          comments={paginatedComments}
          isLoading={isLoading}
          onReply={handleReplyComment}
          onDelete={handleDeleteComment}
        />

        {totalPages > 1 && (
          <Pagination
            ref={paginationRef}
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </section>
  );
}
