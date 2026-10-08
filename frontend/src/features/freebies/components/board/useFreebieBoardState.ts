'use client';

import { useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth';
import { useDebounce } from '@/shared/hooks';
import { useFreebies, useVendors } from '../../api/queries';
import type { FilterTab, FreebieBoardState } from './types';

export function useFreebieBoardState(conventionSlug: string): FreebieBoardState {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedVendor, setSelectedVendor] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [allCondensed, setAllCondensed] = useState(false);
  const [cardOverrides, setCardOverrides] = useState<Record<number, boolean>>({});
  const [isToClaimCollapsed, setIsToClaimCollapsed] = useState(false);
  const [isClaimedCollapsed, setIsClaimedCollapsed] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  function isCardCondensed(id: number) {
    return cardOverrides[id] !== undefined ? cardOverrides[id] : allCondensed;
  }

  function handleToggleCardCondensed(id: number) {
    setCardOverrides((prev) => ({
      ...prev,
      [id]: !(prev[id] !== undefined ? prev[id] : allCondensed),
    }));
  }

  function handleToggleAllCondensed() {
    setAllCondensed((prev) => {
      const next = !prev;
      setCardOverrides({});
      return next;
    });
  }

  // Queries
  const {
    data: allFreebies,
    isLoading,
    isFetching,
    isError,
  } = useFreebies({
    convention: conventionSlug,
    vendor: selectedVendor,
    q: debouncedSearch.trim() || undefined,
  });

  const { data: vendors } = useVendors(conventionSlug);

  const isFiltered = Boolean(debouncedSearch.trim() || selectedVendor !== undefined);

  function handleClearFilters() {
    setSearchQuery('');
    setSelectedVendor(undefined);
  }

  function handleTabClick(tab: FilterTab) {
    if ((tab === 'saved' || tab === 'uploaded') && !user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setActiveTab(tab);
  }

  const counts = useMemo(() => {
    if (!allFreebies) return { all: 0, saved: 0, unclaimed: 0, claimed: 0, uploaded: 0 };
    return {
      all: allFreebies.filter((f) => !f.is_claimed).length,
      saved: allFreebies.filter((f) => f.is_saved).length,
      unclaimed: allFreebies.filter((f) => f.is_saved && !f.is_claimed).length,
      claimed: allFreebies.filter((f) => f.is_saved && f.is_claimed).length,
      uploaded: user
        ? allFreebies.filter(
            (f) => f.is_owner || (f.created_by !== null && f.created_by === user.id)
          ).length
        : 0,
    };
  }, [allFreebies, user]);

  const allDrops = useMemo(() => {
    if (!allFreebies) return [];
    return allFreebies.filter((f) => !f.is_claimed);
  }, [allFreebies]);

  const unsavedDrops = useMemo(() => {
    if (!allFreebies) return [];
    return allFreebies.filter((f) => !f.is_claimed && !f.is_saved);
  }, [allFreebies]);

  const savedDrops = useMemo(() => {
    if (!allFreebies) return [];
    return allFreebies.filter((f) => !f.is_claimed && f.is_saved);
  }, [allFreebies]);

  const uploadedDrops = useMemo(() => {
    if (!allFreebies || !user) return [];
    return allFreebies.filter(
      (f) => f.is_owner || (f.created_by !== null && f.created_by === user.id)
    );
  }, [allFreebies, user]);

  const unclaimedSaved = useMemo(() => {
    if (!allFreebies) return [];
    return allFreebies.filter((f) => f.is_saved && !f.is_claimed);
  }, [allFreebies]);

  const claimedSaved = useMemo(() => {
    if (!allFreebies) return [];
    return allFreebies.filter((f) => f.is_saved && f.is_claimed);
  }, [allFreebies]);

  return {
    activeTab,
    setActiveTab,
    selectedVendor,
    setSelectedVendor,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    allCondensed,
    isCardCondensed,
    handleToggleCardCondensed,
    handleToggleAllCondensed,
    handleTabClick,
    handleClearFilters,
    isFiltered,
    counts,
    vendors,
    isLoading,
    isFetching,
    isError,
    allDrops,
    unsavedDrops,
    savedDrops,
    uploadedDrops,
    unclaimedSaved,
    claimedSaved,
    isToClaimCollapsed,
    setIsToClaimCollapsed,
    isClaimedCollapsed,
    setIsClaimedCollapsed,
  };
}
