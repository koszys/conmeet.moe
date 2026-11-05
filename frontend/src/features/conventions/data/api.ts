'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { api, apiTags } from '@/shared/lib/api';

import type { Convention, ConventionRequestResponse } from '../types';

export function useConventions() {
  return useQuery({
    queryKey: apiTags.conventions,
    queryFn: async () => api.get('api/v1/conventions/').json<Convention[]>(),
  });
}

export function useConvention(slug: string) {
  return useQuery({
    queryKey: apiTags.convention(slug),
    queryFn: async () => api.get(`api/v1/conventions/${slug}/`).json<Convention>(),
  });
}

export function useSubmitConventionRequest() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      return api
        .post('api/v1/conventions/requests/', {
          body: formData,
        })
        .json<ConventionRequestResponse>();
    },
  });
}
