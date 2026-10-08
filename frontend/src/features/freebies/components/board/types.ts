import type { Freebie, Vendor } from '../../types';

export type FilterTab = 'all' | 'saved' | 'uploaded';

export interface FreebieCounts {
  all: number;
  saved: number;
  unclaimed: number;
  claimed: number;
  uploaded: number;
}

export interface FreebieBoardState {
  activeTab: FilterTab;
  setActiveTab: (tab: FilterTab) => void;
  selectedVendor: number | undefined;
  setSelectedVendor: (vendorId: number | undefined) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  debouncedSearch: string;
  allCondensed: boolean;
  isCardCondensed: (id: number) => boolean;
  handleToggleCardCondensed: (id: number) => void;
  handleToggleAllCondensed: () => void;
  handleTabClick: (tab: FilterTab) => void;
  handleClearFilters: () => void;
  isFiltered: boolean;
  counts: FreebieCounts;
  vendors: Vendor[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  // Partitions
  allDrops: Freebie[];
  unsavedDrops: Freebie[];
  savedDrops: Freebie[];
  uploadedDrops: Freebie[];
  unclaimedSaved: Freebie[];
  claimedSaved: Freebie[];
  // Accordion state
  isToClaimCollapsed: boolean;
  setIsToClaimCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isClaimedCollapsed: boolean;
  setIsClaimedCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}
