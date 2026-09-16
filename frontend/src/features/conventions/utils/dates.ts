import { daysUntil } from '@/shared/lib/dates';

import type { Convention, ConventionPhase } from '../types';

export const SOON_DAYS = 20;

export function isPast(convention: Convention): boolean {
  return daysUntil(convention.ends_at) < 0;
}

export function getConventionPhase(convention: Convention): ConventionPhase {
  if (daysUntil(convention.starts_at) <= 0 && !isPast(convention)) {
    return 'now';
  }

  return daysUntil(convention.starts_at) <= SOON_DAYS ? 'soon' : 'up';
}