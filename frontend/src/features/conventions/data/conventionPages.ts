import { CalendarDays, Gift, Home, LucideIcon, Plus, Users } from 'lucide-react';
import type { Convention, ConventionSectionConfig } from '../types';

export interface ConventionPageConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  getHref: (slug: string) => string;
  isActive: (pathname: string, slug: string) => boolean;
  status?: 'active' | 'soon';
  badge?: string;
  getOverviewSection?: (convention: Convention) => ConventionSectionConfig;
}

export const CONVENTION_PAGES: ConventionPageConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Home,
    getHref: (slug) => `/conventions/${slug}`,
    isActive: (pathname, slug) => pathname === `/conventions/${slug}`,
    status: 'active',
  },
  {
    id: 'meetups',
    label: 'Meetups',
    icon: Users,
    getHref: (slug) => `/conventions/${slug}/meetups`,
    isActive: (pathname, slug) => pathname.startsWith(`/conventions/${slug}/meetups`),
    status: 'active',
    getOverviewSection: (convention) => ({
      id: 'meetups',
      title: 'Meetups',
      icon: Users,
      activityHeader: 'Upcoming Meetups',
      activities: [],
      emptyState: {
        message: 'No meetups scheduled yet. Organize a fan meetup or community meetup!',
        actionLabel: 'Post a Meetup',
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
    }),
  },
  {
    id: 'freebies',
    label: 'Freebies',
    icon: Gift,
    getHref: (slug) => `/conventions/${slug}/freebies`,
    isActive: (pathname, slug) => pathname.startsWith(`/conventions/${slug}/freebies`),
    status: 'active',
    getOverviewSection: (convention) => ({
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
    }),
  },
  {
    id: 'schedule',
    label: 'Schedule',
    icon: CalendarDays,
    getHref: (slug) => `/conventions/${slug}/schedule`,
    isActive: (pathname, slug) => pathname.startsWith(`/conventions/${slug}/schedule`),
    status: 'soon',
    badge: 'soon',
    getOverviewSection: (convention) => ({
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
    }),
  },
];
