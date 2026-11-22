export type MeetupImageLayout = 'banner' | 'poster';

export interface Meetup {
  id: number;
  slug: string;
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
  unmount_comments?: boolean;
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

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  bluesky?: string;
  website?: string;
  [key: string]: string | undefined;
}

export interface MeetupPhoto {
  id: number;
  album: number;
  image: string;
  image_thumb: string;
  caption?: string;
  order: number;
  likes_count: number;
  is_liked: boolean;
  created_at: string;
}

export interface MeetupAlbum {
  id: number;
  meetup: number;
  meetup_slug?: string;
  title: string;
  description: string;
  social_links: SocialLinks;
  cover_photo: number | null;
  cover_photo_url?: string | null;
  cover_thumb_url?: string | null;
  preview_photos?: string[];
  photos_count: number;
  likes_count: number;
  favorites_count: number;
  is_liked: boolean;
  is_favorited: boolean;
  is_owner: boolean;
  unmount_comments?: boolean;
  created_by: number | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface MeetupAlbumDetail extends MeetupAlbum {
  photos: MeetupPhoto[];
}

export type AlbumSortOption = 'all' | 'popular' | 'newest' | 'saved' | 'photos';

export interface AlbumLikeToggleResponse {
  is_liked: boolean;
  likes_count: number;
}

export interface AlbumFavoriteToggleResponse {
  is_favorited: boolean;
  favorites_count: number;
}

export interface PhotoLikeToggleResponse {
  is_liked: boolean;
  likes_count: number;
}
