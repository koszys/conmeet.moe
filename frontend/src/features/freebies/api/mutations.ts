'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import { freebieKeys } from './queries';
import type { ClaimToggleResponse, Freebie, SaveToggleResponse } from '../types';

export function useToggleSaveFreebie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (freebieId: number) => {
      return api.post(`api/v1/freebies/${freebieId}/save/`).json<SaveToggleResponse>();
    },
    onMutate: async (freebieId: number) => {
      await queryClient.cancelQueries({ queryKey: freebieKeys.all });

      queryClient.setQueriesData<Freebie[]>({ queryKey: freebieKeys.lists() }, (old) => {
        if (!old) return old;
        return old.map((item) => {
          if (item.id === freebieId) {
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
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: freebieKeys.all });
    },
  });
}

export function useToggleClaimFreebie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (freebieId: number) => {
      return api.post(`api/v1/freebies/${freebieId}/claim/`).json<ClaimToggleResponse>();
    },
    onMutate: async (freebieId: number) => {
      await queryClient.cancelQueries({ queryKey: freebieKeys.all });

      queryClient.setQueriesData<Freebie[]>({ queryKey: freebieKeys.lists() }, (old) => {
        if (!old) return old;
        return old.map((item) => {
          if (item.id === freebieId) {
            const nextClaimed = !item.is_claimed;
            return {
              ...item,
              is_claimed: nextClaimed,
              claimed_at: nextClaimed ? new Date().toISOString() : null,
              is_saved: true,
            };
          }
          return item;
        });
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: freebieKeys.all });
    },
  });
}

export function useCreateFreebie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return api.post('api/v1/freebies/', { body: formData }).json<Freebie>();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: freebieKeys.all });
    },
  });
}
