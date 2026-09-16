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