'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/shared/lib/api';
import type { Freebie, FreebieFilters, Vendor } from '../types';

export const freebieKeys = {
  all: ['freebies'] as const,
  lists: () => [...freebieKeys.all, 'list'] as const,
  list: (filters: FreebieFilters) => [...freebieKeys.lists(), filters] as const,
  details: () => [...freebieKeys.all, 'detail'] as const,
  detail: (id: number) => [...freebieKeys.details(), id] as const,
  vendors: (conventionSlug?: string) => ['vendors', conventionSlug] as const,
};

export function useFreebies(filters: FreebieFilters = {}) {
  return useQuery({
    queryKey: freebieKeys.list(filters),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (filters.convention) searchParams.set('convention', filters.convention);
      if (filters.vendor) searchParams.set('vendor', String(filters.vendor));
      if (filters.saved) searchParams.set('saved', 'true');
      if (filters.unclaimed) searchParams.set('unclaimed', 'true');
      if (filters.q) searchParams.set('q', filters.q);

      const queryStr = searchParams.toString();
      const endpoint = queryStr ? `api/v1/freebies/?${queryStr}` : 'api/v1/freebies/';
      return api.get(endpoint).json<Freebie[]>();
    },
  });
}

export function useVendors(conventionSlug?: string) {
  return useQuery({
    queryKey: freebieKeys.vendors(conventionSlug),
    queryFn: async () => {
      const endpoint = conventionSlug
        ? `api/v1/vendors/?convention=${conventionSlug}`
        : 'api/v1/vendors/';
      return api.get(endpoint).json<Vendor[]>();
    },
  });
}
