export type ConventionStatus = 'active' | 'upcoming';

export type ConventionPhase = 'now' | 'soon' | 'up';

export interface Convention {
  id: string;
  name: string;
  slug: string;
  venue: string;
  city: string;
  country: string;
  startsAt: string;
  endsAt: string;
  websiteUrl: string;
  description: string;
  status: ConventionStatus;
}
