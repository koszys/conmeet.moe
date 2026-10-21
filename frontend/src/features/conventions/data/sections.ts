import { CalendarDays, Gift, Plus, Users } from 'lucide-react';
import type { Convention, ConventionSectionConfig } from '../types';

/**
 * Returns default core sections for a convention without mock items (empty state).
 */
export function getDefaultConventionSections(convention: Convention): ConventionSectionConfig[] {
  return [
    {
      id: 'freebies',
      title: 'Freebies',
      icon: Gift,
      activityHeader: 'Recent Freebies',
      activities: [],
      emptyState: {
        message: 'No freebies or booth drops shared yet for this convention.',
        actionLabel: 'Submit First Freebie',
        actionHref: `/conventions/${convention.slug}/freebies/new`,
      },
      primaryAction: {
        label: 'View Freebies',
        shortLabel: 'View',
        href: `/conventions/${convention.slug}/freebies`,
      },
      secondaryAction: {
        label: 'Post Freebie',
        shortLabel: 'Post',
        href: `/conventions/${convention.slug}/freebies/new`,
        icon: Plus,
      },
      colSpan: 1,
    },
    {
      id: 'meetups',
      title: 'Cosplay Meetups',
      icon: Users,
      activityHeader: 'Upcoming Meetups',
      activities: [],
      emptyState: {
        message: 'No meetups scheduled yet. Organize a fan meetup or cosplay gathering!',
        actionLabel: 'Host a Meetup',
        actionHref: `/conventions/${convention.slug}/meetups/new`,
      },
      primaryAction: {
        label: 'Browse Meetups',
        shortLabel: 'Browse',
        href: `/conventions/${convention.slug}/meetups`,
      },
      secondaryAction: {
        label: 'Plan Meetup',
        shortLabel: 'Plan',
        href: `/conventions/${convention.slug}/meetups/new`,
        icon: Plus,
      },
      colSpan: 1,
    },
    {
      id: 'schedule',
      title: 'Schedule',
      icon: CalendarDays,
      activityHeader: 'Upcoming Panels & Events',
      activities: [],
      emptyState: {
        message: 'Official timetable has not been published yet.',
        actionLabel: 'Open Timeline',
        actionHref: `/conventions/${convention.slug}/schedule`,
      },
      primaryAction: {
        label: 'Full Schedule',
        shortLabel: 'Schedule',
        href: `/conventions/${convention.slug}/schedule`,
      },
      secondaryAction: {
        label: 'My Schedule',
        shortLabel: 'Mine',
        href: `/conventions/${convention.slug}/schedule`,
        icon: CalendarDays,
      },
      colSpan: 2,
    },
  ];
}
