export interface Vendor {
  id: number;
  name: string;
  description: string;
  website_url: string | null;
  image: string | null;
}

export interface Freebie {
  id: number;
  name: string;
  description: string;
  requirements: string;
  location: string;
  image: string | null;
  image_thumb: string | null;
  vendor: Vendor;
  convention: number | null;
  convention_slug: string | null;
  convention_name: string | null;
  created_by: number | null;
  created_by_name: string | null;
  is_saved: boolean;
  is_claimed: boolean;
  claimed_at: string | null;
  save_count: number;
  created_at: string;
  updated_at: string;
}

export interface FreebieFilters {
  convention?: string;
  vendor?: number;
  saved?: boolean;
  unclaimed?: boolean;
  claimed?: boolean;
  q?: string;
}

export interface SaveToggleResponse {
  is_saved: boolean;
  save_count: number;
}

export interface ClaimToggleResponse {
  is_claimed: boolean;
  claimed_at: string | null;
}
