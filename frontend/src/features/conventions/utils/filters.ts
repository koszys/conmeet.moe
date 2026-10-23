import type { Convention } from '../types';
import type { ConventionFilters } from '../components/grid/ConventionFilterBar';
import { parseDate } from '@/shared/lib/dates';

export function matchesConventionFilters(
  convention: Convention,
  filters: ConventionFilters
): boolean {
  if (filters.query) {
    const q = filters.query.trim().toLowerCase();
    const nameMatch = convention.name.toLowerCase().includes(q);
    const venueMatch = convention.venue_name
      ? convention.venue_name.toLowerCase().includes(q)
      : false;
    const cityMatch = convention.city ? convention.city.toLowerCase().includes(q) : false;
    const countryMatch = convention.country ? convention.country.toLowerCase().includes(q) : false;
    if (!nameMatch && !venueMatch && !cityMatch && !countryMatch) {
      return false;
    }
  }

  if (filters.location) {
    const loc = [convention.city, convention.country].filter(Boolean).join(', ');
    if (loc !== filters.location) {
      return false;
    }
  }

  if (filters.year) {
    const startYear = parseDate(convention.starts_at).getFullYear().toString();
    const endYear = parseDate(convention.ends_at).getFullYear().toString();
    if (startYear !== filters.year && endYear !== filters.year) {
      return false;
    }
  }

  return true;
}
