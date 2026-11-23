'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { albumKeys, meetupKeys } from './queries';
import type {
  AlbumFavoriteToggleResponse,
  AlbumLikeToggleResponse,
  GoingMeetupToggleResponse,
  Meetup,
  MeetupAlbum,
  MeetupAlbumDetail,
  MeetupDetail,
  PhotoLikeToggleResponse,
  SaveMeetupToggleResponse,
} from '../types';

export function useToggleSaveMeetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (meetupId: number) => {
      return api.post(`api/v1/meetups/${meetupId}/save/`).json<SaveMeetupToggleResponse>();
    },
    onMutate: async (meetupId: number) => {
      await queryClient.cancelQueries({ queryKey: meetupKeys.all });

      queryClient.setQueriesData<Meetup[]>({ queryKey: meetupKeys.lists() }, (old) => {
        if (!old) return old;
        return old.map((item) => {
          if (item.id === meetupId) {
            const nextIsSaved = !item.is_saved;
            return {
              ...item,
              is_saved: nextIsSaved,
              save_count: nextIsSaved ? item.save_count + 1 : Math.max(0, item.save_count - 1),
            };
          }
          return item;
        });
      });

      queryClient.setQueryData<MeetupDetail>(meetupKeys.detail(meetupId), (old) => {
        if (!old) return old;
        const nextIsSaved = !old.is_saved;
        return {
          ...old,
          is_saved: nextIsSaved,
          save_count: nextIsSaved ? old.save_count + 1 : Math.max(0, old.save_count - 1),
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: meetupKeys.all });
    },
  });
}

export function useToggleGoingMeetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (meetupId: number) => {
      return api.post(`api/v1/meetups/${meetupId}/going/`).json<GoingMeetupToggleResponse>();
    },
    onMutate: async (meetupId: number) => {
      await queryClient.cancelQueries({ queryKey: meetupKeys.all });

      queryClient.setQueriesData<Meetup[]>({ queryKey: meetupKeys.lists() }, (old) => {
        if (!old) return old;
        return old.map((item) => {
          if (item.id === meetupId) {
            const nextIsGoing = !item.is_going;
            return {
              ...item,
              is_going: nextIsGoing,
              going_count: nextIsGoing ? item.going_count + 1 : Math.max(0, item.going_count - 1),
            };
          }
          return item;
        });
      });

      queryClient.setQueryData<MeetupDetail>(meetupKeys.detail(meetupId), (old) => {
        if (!old) return old;
        const nextIsGoing = !old.is_going;
        return {
          ...old,
          is_going: nextIsGoing,
          going_count: nextIsGoing ? old.going_count + 1 : Math.max(0, old.going_count - 1),
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: meetupKeys.all });
    },
  });
}

export function useCreateMeetup(conventionSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return api
        .post(`api/v1/conventions/${conventionSlug}/meetups/`, { body: formData })
        .json<Meetup>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetupKeys.all });
    },
  });
}

export function useUpdateMeetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ meetupId, formData }: { meetupId: number; formData: FormData }) => {
      return api.patch(`api/v1/meetups/${meetupId}/`, { body: formData }).json<MeetupDetail>();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: meetupKeys.all });
      queryClient.invalidateQueries({ queryKey: meetupKeys.detail(variables.meetupId) });
    },
  });
}

export function useDeleteMeetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (meetupId: number) => {
      return api.delete(`api/v1/meetups/${meetupId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetupKeys.all });
    },
  });
}

export function useCreateAlbum(meetupId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return api.post(`api/v1/meetups/${meetupId}/albums/`, { body: formData }).json<MeetupAlbum>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
    },
  });
}

export function useUpdateAlbum(albumId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return api.patch(`api/v1/albums/${albumId}/`, { body: formData }).json<MeetupAlbumDetail>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(albumId) });
    },
  });
}

export function useDeleteAlbum(meetupId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (albumId: number) => {
      return api.delete(`api/v1/albums/${albumId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
      if (meetupId) {
        queryClient.invalidateQueries({ queryKey: albumKeys.list(meetupId) });
      }
    },
  });
}

export function useToggleLikeAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (albumId: number) => {
      return api.post(`api/v1/albums/${albumId}/like/`).json<AlbumLikeToggleResponse>();
    },
    onMutate: async (albumId: number) => {
      await queryClient.cancelQueries({ queryKey: albumKeys.all });

      queryClient.setQueriesData<MeetupAlbum[]>({ queryKey: albumKeys.lists() }, (old) => {
        if (!old) return old;
        return old.map((item) => {
          if (item.id === albumId) {
            const nextIsLiked = !item.is_liked;
            return {
              ...item,
              is_liked: nextIsLiked,
              likes_count: nextIsLiked ? item.likes_count + 1 : Math.max(0, item.likes_count - 1),
            };
          }
          return item;
        });
      });

      queryClient.setQueryData<MeetupAlbumDetail>(albumKeys.detail(albumId), (old) => {
        if (!old) return old;
        const nextIsLiked = !old.is_liked;
        return {
          ...old,
          is_liked: nextIsLiked,
          likes_count: nextIsLiked ? old.likes_count + 1 : Math.max(0, old.likes_count - 1),
        };
      });
    },
    onSettled: (_, __, albumId) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(albumId) });
    },
  });
}

export function useToggleFavoriteAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (albumId: number) => {
      return api.post(`api/v1/albums/${albumId}/favorite/`).json<AlbumFavoriteToggleResponse>();
    },
    onMutate: async (albumId: number) => {
      await queryClient.cancelQueries({ queryKey: albumKeys.all });

      queryClient.setQueriesData<MeetupAlbum[]>({ queryKey: albumKeys.lists() }, (old) => {
        if (!old) return old;
        return old.map((item) => {
          if (item.id === albumId) {
            const nextIsFavorited = !item.is_favorited;
            return {
              ...item,
              is_favorited: nextIsFavorited,
              favorites_count: nextIsFavorited
                ? item.favorites_count + 1
                : Math.max(0, item.favorites_count - 1),
            };
          }
          return item;
        });
      });

      queryClient.setQueryData<MeetupAlbumDetail>(albumKeys.detail(albumId), (old) => {
        if (!old) return old;
        const nextIsFavorited = !old.is_favorited;
        return {
          ...old,
          is_favorited: nextIsFavorited,
          favorites_count: nextIsFavorited
            ? old.favorites_count + 1
            : Math.max(0, old.favorites_count - 1),
        };
      });
    },
    onSettled: (_, __, albumId) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(albumId) });
    },
  });
}

export function useToggleLikePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ photoId }: { photoId: number; albumId: number | string }) => {
      return api.post(`api/v1/photos/${photoId}/like/`).json<PhotoLikeToggleResponse>();
    },
    onMutate: async ({ photoId, albumId }) => {
      await queryClient.cancelQueries({ queryKey: albumKeys.detail(albumId) });

      const updatePhotos = (old: MeetupAlbumDetail | undefined) => {
        if (!old) return old;
        return {
          ...old,
          photos: old.photos.map((p) => {
            if (p.id === photoId) {
              const nextIsLiked = !p.is_liked;
              return {
                ...p,
                is_liked: nextIsLiked,
                likes_count: nextIsLiked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1),
              };
            }
            return p;
          }),
        };
      };

      queryClient.setQueryData<MeetupAlbumDetail>(albumKeys.detail(albumId), updatePhotos);
      queryClient.setQueriesData<MeetupAlbumDetail>({ queryKey: albumKeys.details() }, (old) => {
        if (!old || (old.id !== Number(albumId) && String(old.id) !== String(albumId))) return old;
        return updatePhotos(old);
      });
    },
    onSuccess: (data, { photoId, albumId }) => {
      const applyServerData = (old: MeetupAlbumDetail | undefined) => {
        if (!old) return old;
        return {
          ...old,
          photos: old.photos.map((p) => {
            if (p.id === photoId) {
              return {
                ...p,
                is_liked: data.is_liked,
                likes_count: data.likes_count,
              };
            }
            return p;
          }),
        };
      };

      queryClient.setQueryData<MeetupAlbumDetail>(albumKeys.detail(albumId), applyServerData);
      queryClient.setQueriesData<MeetupAlbumDetail>({ queryKey: albumKeys.details() }, (old) => {
        if (!old || (old.id !== Number(albumId) && String(old.id) !== String(albumId))) return old;
        return applyServerData(old);
      });
    },
    onSettled: (_, __, { albumId }) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(albumId) });
    },
  });
}
