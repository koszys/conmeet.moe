import { API_BASE } from '@/shared/lib/api';
import type { Convention } from '../types';

export function formatSlugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function getConventionServer(slug: string): Promise<Convention | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/conventions/${encodeURIComponent(slug)}/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
