export type MeetupImageLayout = 'banner' | 'poster';

export interface Meetup {
  id: number;
  convention: number;
  convention_slug: string;
  convention_name: string;
  name: string;
  location: string | null;
  starts_at: string;
  ends_at: string;
  image: string | null;
  image_thumb: string | null;
  image_layout?: MeetupImageLayout;
  is_official: boolean;
  created_by: number | null;
  created_by_name: string | null;
  going_count: number;
  save_count: number;
  is_saved: boolean;
  is_going: boolean;
  is_owner: boolean;
  created_at: string;
  updated_at: string;
}

export interface MeetupDetail extends Meetup {
  description: string;
}

export interface MeetupFilters {
  conventionSlug?: string;
  date?: string;
  official?: boolean;
  saved?: boolean;
  q?: string;
}

export interface SaveMeetupToggleResponse {
  is_saved: boolean;
  save_count: number;
}

export interface GoingMeetupToggleResponse {
  is_going: boolean;
  going_count: number;
}
