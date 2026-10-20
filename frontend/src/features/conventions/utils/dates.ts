import { daysUntil } from '@/shared/lib/dates';

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

export function getConventionPhase(convention: Convention): ConventionPhase {
  if (isPast(convention)) {
    return 'past';
  }

  if (daysUntil(convention.starts_at) <= 0) {
    return 'now';
  }

  return daysUntil(convention.starts_at) <= SOON_DAYS ? 'soon' : 'up';
}
