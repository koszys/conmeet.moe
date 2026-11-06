'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { meetupKeys } from './queries';
import type {
  GoingMeetupToggleResponse,
  Meetup,
  MeetupDetail,
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
