'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import type {
  AlbumSortOption,
  Meetup,
  MeetupAlbum,
  MeetupAlbumDetail,
  MeetupDetail,
  MeetupFilters,
} from '../types';

export const meetupKeys = {
  all: ['meetups'] as const,
  lists: () => [...meetupKeys.all, 'list'] as const,
  list: (filters: MeetupFilters) => [...meetupKeys.lists(), filters] as const,
  details: () => [...meetupKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...meetupKeys.details(), id] as const,
};

export function useMeetups(filters: MeetupFilters = {}) {
  return useQuery({
    queryKey: meetupKeys.list(filters),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (filters.date) searchParams.set('date', filters.date);
      if (typeof filters.official === 'boolean') {
        searchParams.set('official', String(filters.official));
      }
      if (filters.saved) searchParams.set('saved', 'true');
      if (filters.q) searchParams.set('q', filters.q);

      const queryStr = searchParams.toString();
      const basePath = filters.conventionSlug
        ? `api/v1/conventions/${filters.conventionSlug}/meetups/`
        : 'api/v1/meetups/';
      const endpoint = queryStr ? `${basePath}?${queryStr}` : basePath;

      return api.get(endpoint).json<Meetup[]>();
    },
    enabled: Boolean(filters.conventionSlug),
  });
}

export function useMeetup(id: number | string) {
  return useQuery({
    queryKey: meetupKeys.detail(id),
    queryFn: async () => {
      return api.get(`api/v1/meetups/${id}/`).json<MeetupDetail>();
    },
    enabled: Boolean(id),
  });
}

export const albumKeys = {
  all: ['albums'] as const,
  lists: () => [...albumKeys.all, 'list'] as const,
  list: (meetupId: number | string, sort: AlbumSortOption = 'newest') =>
    [...albumKeys.lists(), meetupId, sort] as const,
  details: () => [...albumKeys.all, 'detail'] as const,
  detail: (id: number) => [...albumKeys.details(), id] as const,
};

export function useMeetupAlbums(meetupId: number | string, sort: AlbumSortOption = 'all') {
  return useQuery({
    queryKey: albumKeys.list(meetupId, sort),
    queryFn: async () => {
      return api.get(`api/v1/meetups/${meetupId}/albums/?sort=${sort}`).json<MeetupAlbum[]>();
    },
    enabled: Boolean(meetupId),
  });
}

export function useAlbumDetail(id: number | string) {
  return useQuery({
    queryKey: albumKeys.detail(Number(id)),
    queryFn: async () => {
      return api.get(`api/v1/albums/${id}/`).json<MeetupAlbumDetail>();
    },
    enabled: Boolean(id),
  });
}
