import type { ComponentType, ReactNode } from 'react';

export type ConventionPhase = 'now' | 'soon' | 'up';

export interface Convention {
  id: number;
  name: string;
  slug: string;
  venue_name: string | null;
  city: string | null;
  country: string | null;
  starts_at: string;
  ends_at: string;
  website_url: string | null;
  banner: string | null;
  banner_thumb: string | null;
  is_featured: boolean;
  /** detail-only fields (GET /api/v1/conventions/{slug}/) */
  map_url?: string | null;
  description?: string;
}

export interface SectionActivityItem {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  badge?: {
    text: string;
    variant?: 'accent' | 'pop' | 'neutral';
  };
  stat?: {
    value: string | number;
    label?: string;
    icon?: ComponentType<{ className?: string }>;
  };
  href?: string;
}

export interface ConventionSectionConfig {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  activityHeader?: string;
  activityCountLabel?: string;
  activities: SectionActivityItem[];
  emptyState?: {
    message: string;
    actionLabel?: string;
    actionHref?: string;
  };
  primaryAction: {
    label: string;
    href: string;
    isExternal?: boolean;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    icon?: ComponentType<{ className?: string }>;
  };
  colSpan?: 1 | 2;
  customContent?: ReactNode;
}

export interface ConventionSectionsProps {
  convention: Convention;
  sections?: ConventionSectionConfig[];
  extraSections?: ConventionSectionConfig[];
  className?: string;
}
