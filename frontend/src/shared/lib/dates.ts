import { differenceInCalendarDays, format, parseISO } from 'date-fns';

/**
 * Parses an ISO date string (including date-only 'YYYY-MM-DD') into a Date.
 * For date-only strings, parseISO treats them as local calendar midnight
 * rather than UTC midnight, preventing negative UTC timezone rollback (1-day behind).
 */
export function parseDate(dateStr: string): Date {
  return parseISO(dateStr);
}

export function daysUntil(dateStr: string, from: Date = new Date()): number {
  return differenceInCalendarDays(parseDate(dateStr), from);
}

export function formatDateRange(startsAt: string, endsAt: string): string {
  const start = parseDate(startsAt);
  const end = parseDate(endsAt);

  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, 'MMM d')} \u2013 ${format(end, 'MMM d, yyyy')}`;
  }

  return `${format(start, 'MMM d, yyyy')} \u2013 ${format(end, 'MMM d, yyyy')}`;
}

export function formatDateTime(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  try {
    const d = parseDate(dateStr);
    if (isNaN(d.getTime())) return null;
    return format(d, 'MMM d, yyyy \u00b7 HH:mm');
  } catch {
    return null;
  }
}
