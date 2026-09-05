import { daysUntil } from '@/shared/lib/dates';
import type { Convention, ConventionPhase } from '../types';

export const SOON_DAYS = 20;

export function getConventionPhase(convention: Convention): ConventionPhase {
  if (convention.status === 'active') {
    return 'now';
  }

  return daysUntil(convention.startsAt) <= SOON_DAYS ? 'soon' : 'up';
}
