'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type MeUser } from '@/shared/lib/api';
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
