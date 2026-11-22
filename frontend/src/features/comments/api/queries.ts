'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import type { CommentItemData, CommentSettings } from '../types';

export const commentKeys = {
  all: ['comments'] as const,
  settings: () => [...commentKeys.all, 'settings'] as const,
  meetup: (id: string | number) => [...commentKeys.all, 'meetup', String(id)] as const,
  album: (id: string | number) => [...commentKeys.all, 'album', String(id)] as const,
};

export function useCommentSettings() {
  return useQuery({
    queryKey: commentKeys.settings(),
    queryFn: async () => {
      return api.get('api/v1/comments/settings/').json<CommentSettings>();
    },
    staleTime: 60 * 1000,
  });
}

export function useMeetupComments(meetupId: string | number, enabled = true) {
  return useQuery({
    queryKey: commentKeys.meetup(meetupId),
    queryFn: async () => {
      return api.get(`api/v1/meetups/${meetupId}/comments/`).json<CommentItemData[]>();
    },
    enabled: Boolean(meetupId) && enabled,
  });
}

export function useAlbumComments(albumId: string | number, enabled = true) {
  return useQuery({
    queryKey: commentKeys.album(albumId),
    queryFn: async () => {
      return api.get(`api/v1/albums/${albumId}/comments/`).json<CommentItemData[]>();
    },
    enabled: Boolean(albumId) && enabled,
  });
}
