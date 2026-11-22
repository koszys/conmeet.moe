'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { commentKeys } from './queries';
import type { CommentItemData, CommentTargetType, CreateCommentInput } from '../types';

export function useCreateComment(targetType: CommentTargetType, targetId: string | number) {
  const queryClient = useQueryClient();
  const endpoint =
    targetType === 'meetup'
      ? `api/v1/meetups/${targetId}/comments/`
      : `api/v1/albums/${targetId}/comments/`;

  const targetKey =
    targetType === 'meetup' ? commentKeys.meetup(targetId) : commentKeys.album(targetId);

  return useMutation({
    mutationFn: async (input: CreateCommentInput) => {
      return api
        .post(endpoint, {
          json: {
            body: input.body,
            parent: input.parent ?? null,
          },
        })
        .json<CommentItemData>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: targetKey });
    },
  });
}

export function useDeleteComment(targetType: CommentTargetType, targetId: string | number) {
  const queryClient = useQueryClient();
  const targetKey =
    targetType === 'meetup' ? commentKeys.meetup(targetId) : commentKeys.album(targetId);

  return useMutation({
    mutationFn: async (commentId: number) => {
      await api.delete(`api/v1/comments/${commentId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: targetKey });
    },
  });
}
