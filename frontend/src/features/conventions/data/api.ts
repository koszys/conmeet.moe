'use client';

import { useQuery } from '@tanstack/react-query';
import { api, apiTags } from '@/shared/lib/api';

import type { Convention } from '../types';

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