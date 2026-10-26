import { daysUntil, parseDate } from '@/shared/lib/dates';

import type { Convention, ConventionPhase } from '../types';

export const SOON_DAYS = 20;
export const RECENTLY_ENDED_DAYS = 30;

export function isPast(convention: Convention): boolean {
  return daysUntil(convention.ends_at) < 0;
}

export function isRecentlyEnded(
  convention: Convention,
  daysThreshold = RECENTLY_ENDED_DAYS
): boolean {
  if (!isPast(convention)) return false;
  return daysUntil(convention.ends_at) >= -daysThreshold;
}

export function isFeaturedVisible(
  convention: Convention,
  daysThreshold = RECENTLY_ENDED_DAYS
): boolean {
  if (!convention.is_featured) return false;
  return !isPast(convention) || isRecentlyEnded(convention, daysThreshold);
}

export function sortFeaturedConventions(conventions: Convention[]): Convention[] {
  return [...conventions].sort((a, b) => {
    // 1. Explicit admin priority (1 = highest / first)
    const aPrio = a.featured_priority;
    const bPrio = b.featured_priority;
    const aHasPrio = typeof aPrio === 'number' && aPrio > 0;
    const bHasPrio = typeof bPrio === 'number' && bPrio > 0;

    if (aHasPrio && !bHasPrio) return -1;
    if (!aHasPrio && bHasPrio) return 1;
    if (aHasPrio && bHasPrio && aPrio !== bPrio) {
      return aPrio - bPrio;
    }

    // 2. Closer date priority
    const aPast = isPast(a);
    const bPast = isPast(b);
    if (!aPast && bPast) return -1;
    if (aPast && !bPast) return 1;
    if (!aPast && !bPast) {
      return parseDate(a.starts_at).getTime() - parseDate(b.starts_at).getTime();
    }
    return (
      parseDate(b.ends_at).getTime() - parseDate(a.ends_at).getTime() ||
      parseDate(b.starts_at).getTime() - parseDate(a.starts_at).getTime()
    );
  });
}

export function getConventionPhase(convention: Convention): ConventionPhase {
  if (isPast(convention)) {
    return 'past';
  }

  if (daysUntil(convention.starts_at) <= 0) {
    return 'now';
  }

  return daysUntil(convention.starts_at) <= SOON_DAYS ? 'soon' : 'up';
}
