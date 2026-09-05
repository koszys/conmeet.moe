import { differenceInCalendarDays, format } from 'date-fns';

export function daysUntil(dateStr: string, from: Date = new Date()): number {
  return differenceInCalendarDays(new Date(dateStr), from);
}

export function formatDateRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);

  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, 'MMM d')} \u2013 ${format(end, 'MMM d, yyyy')}`;
  }

  return `${format(start, 'MMM d, yyyy')} \u2013 ${format(end, 'MMM d, yyyy')}`;
}
