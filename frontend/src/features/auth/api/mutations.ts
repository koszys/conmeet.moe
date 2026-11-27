'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE, api, type MeUser, type OAuthProvider } from '@/shared/lib/api';
import { useAuth } from '../AuthProvider';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return api.patch('api/v1/auth/me/', { body: formData }).json<MeUser>();
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries();
    },
  });
}

export function useUnlinkProvider() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: async (provider: OAuthProvider) => {
      return api.delete(`api/v1/auth/providers/${provider}/`).json<MeUser>();
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries();
    },
  });
}

export function useStartProviderLink() {
  return useMutation({
    mutationFn: async ({
      provider,
      mode = 'connect',
      next = '/settings',
    }: {
      provider: OAuthProvider;
      mode?: 'connect' | 'relink';
      next?: string;
    }) => {
      const res = await api
        .post('api/v1/auth/providers/link/', {
          json: { provider, mode, next },
        })
        .json<{ path: string }>();
      return `${API_BASE}${res.path}`;
    },
  });
}
