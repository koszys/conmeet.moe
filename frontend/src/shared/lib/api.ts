import ky from 'ky';

export const api = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
  credentials: 'include',
  timeout: 15000,
  retry: { limit: 2, methods: ['get', 'put', 'patch', 'delete'] },
});

export const apiTags = {
  user: ['user'],
  conventions: ['conventions'],
  convention: (slug: string) => ['conventions', slug],
  freebies: (conventionId: string) => ['freebies', conventionId],
  meetups: (conventionId: string) => ['meetups', conventionId],
} as const;
