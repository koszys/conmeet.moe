'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { useGuestSaves } from '@/shared/lib/guestSaves';
import { useDebounce } from '@/shared/hooks';
import type { Freebie } from '../../types';
import { freebieKeys, useFreebies, useVendors } from '../../api/queries';
import type { BoardRefreshStatus, FilterTab, FreebieBoardState } from './types';

export function useFreebieBoardState(conventionSlug: string): FreebieBoardState {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { isGuestSaved, isGuestClaimed } = useGuestSaves();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [selectedVendor, setSelectedVendor] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [allCondensed, setAllCondensed] = useState(false);
  const [cardOverrides, setCardOverrides] = useState<Record<number, boolean>>({});
  const [isAvailableCollapsed, setIsAvailableCollapsed] = useState(false);
  const [isSavedCollapsed, setIsSavedCollapsed] = useState(false);
  const [isToClaimCollapsed, setIsToClaimCollapsed] = useState(false);
  const [isClaimedCollapsed, setIsClaimedCollapsed] = useState(false);

  const freebieQuery = searchParams.get('freebie');
  const initialFreebieId = freebieQuery ? Number(freebieQuery) : null;
  const [selectedFreebieId, setSelectedFreebieId] = useState<number | null>(
    initialFreebieId && !Number.isNaN(initialFreebieId) ? initialFreebieId : null
  );

  // Sync selectedFreebieId during render if query param changes dynamically
  const [prevFreebieQuery, setPrevFreebieQuery] = useState(freebieQuery);
  if (prevFreebieQuery !== freebieQuery) {
    setPrevFreebieQuery(freebieQuery);
    const parsedId = freebieQuery ? Number(freebieQuery) : null;
    setSelectedFreebieId(parsedId && !Number.isNaN(parsedId) ? parsedId : null);
  }

  function handleCloseDetail() {
    setSelectedFreebieId(null);
    if (searchParams.has('freebie')) {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete('freebie');
      const nextQuery = nextParams.toString();
      router.replace(`${pathname}${nextQuery ? `?${nextQuery}` : ''}`, { scroll: false });
    }
  }

  const [editingFreebie, setEditingFreebie] = useState<Freebie | null>(null);
  const [deletingFreebie, setDeletingFreebie] = useState<Freebie | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [refreshStatus, setRefreshStatus] = useState<BoardRefreshStatus>('idle');
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    refetch: refetchFreebies,
  } = useFreebies({
    convention: conventionSlug,
    vendor: selectedVendor,
    q: debouncedSearch.trim() || undefined,
  });

  const { data: vendors, refetch: refetchVendors } = useVendors(conventionSlug);

  async function refreshBoard() {
    if (refreshStatus !== 'idle') return;
    setRefreshStatus('refreshing');
    try {
      const minDelay = new Promise((resolve) => setTimeout(resolve, 1000));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: freebieKeys.all }),
        queryClient.invalidateQueries({ queryKey: freebieKeys.vendors(conventionSlug) }),
        refetchFreebies(),
        refetchVendors(),
        minDelay,
      ]);
      setRefreshStatus('success');
      refreshTimeoutRef.current = setTimeout(() => {
        setRefreshStatus('idle');
      }, 900);
    } catch {
      setRefreshStatus('idle');
    }
  }

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!user) {
      if (activeTab === 'uploaded') {
        setActiveTab('all');
      }
      setEditingFreebie(null);
      setDeletingFreebie(null);
    }
  }, [user, activeTab]);

  const isFiltered = Boolean(debouncedSearch.trim() || selectedVendor !== undefined);

  function handleClearFilters() {
    setSearchQuery('');
    setSelectedVendor(undefined);
  }

  function handleTabClick(tab: FilterTab) {
    if (tab === 'uploaded' && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setActiveTab(tab);
  }

  const counts = useMemo(() => {
    if (!allFreebies) return { all: 0, saved: 0, unclaimed: 0, claimed: 0, uploaded: 0 };
    const isSaved = (f: Freebie) => (user ? f.is_saved : isGuestSaved('freebies', f.id));
    const isClaimed = (f: Freebie) => (user ? f.is_claimed : isGuestClaimed(f.id));

    return {
      all: allFreebies.filter((f) => !isClaimed(f)).length,
      saved: allFreebies.filter((f) => isSaved(f)).length,
      unclaimed: allFreebies.filter((f) => isSaved(f) && !isClaimed(f)).length,
      claimed: allFreebies.filter((f) => isSaved(f) && isClaimed(f)).length,
      uploaded: user
        ? allFreebies.filter(
            (f) => f.is_owner || (f.created_by !== null && f.created_by === user.id)
          ).length
        : 0,
    };
  }, [allFreebies, user, isGuestSaved, isGuestClaimed]);

  const allDrops = useMemo(() => {
    if (!allFreebies) return [];
    return allFreebies.filter((f) => (user ? !f.is_claimed : !isGuestClaimed(f.id)));
  }, [allFreebies, user, isGuestClaimed]);

  const unsavedDrops = useMemo(() => {
    if (!allFreebies) return [];
    const isSaved = (f: Freebie) => (user ? f.is_saved : isGuestSaved('freebies', f.id));
    const isClaimed = (f: Freebie) => (user ? f.is_claimed : isGuestClaimed(f.id));
    return allFreebies.filter((f) => !isClaimed(f) && !isSaved(f));
  }, [allFreebies, user, isGuestSaved, isGuestClaimed]);

  const savedDrops = useMemo(() => {
    if (!allFreebies) return [];
    const isSaved = (f: Freebie) => (user ? f.is_saved : isGuestSaved('freebies', f.id));
    const isClaimed = (f: Freebie) => (user ? f.is_claimed : isGuestClaimed(f.id));
    return allFreebies.filter((f) => !isClaimed(f) && isSaved(f));
  }, [allFreebies, user, isGuestSaved, isGuestClaimed]);

  const uploadedDrops = useMemo(() => {
    if (!allFreebies || !user) return [];
    return allFreebies.filter(
      (f) => f.is_owner || (f.created_by !== null && f.created_by === user.id)
    );
  }, [allFreebies, user]);

  const unclaimedSaved = useMemo(() => {
    if (!allFreebies) return [];
    const isSaved = (f: Freebie) => (user ? f.is_saved : isGuestSaved('freebies', f.id));
    const isClaimed = (f: Freebie) => (user ? f.is_claimed : isGuestClaimed(f.id));
    return allFreebies.filter((f) => isSaved(f) && !isClaimed(f));
  }, [allFreebies, user, isGuestSaved, isGuestClaimed]);

  const claimedSaved = useMemo(() => {
    if (!allFreebies) return [];
    const isSaved = (f: Freebie) => (user ? f.is_saved : isGuestSaved('freebies', f.id));
    const isClaimed = (f: Freebie) => (user ? f.is_claimed : isGuestClaimed(f.id));
    return allFreebies.filter((f) => isSaved(f) && isClaimed(f));
  }, [allFreebies, user, isGuestSaved, isGuestClaimed]);

  const selectedFreebie = useMemo(() => {
    if (!allFreebies || selectedFreebieId === null) return null;
    return allFreebies.find((f) => f.id === selectedFreebieId) ?? null;
  }, [allFreebies, selectedFreebieId]);

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
    refreshStatus,
    refreshBoard,
    allDrops,
    unsavedDrops,
    savedDrops,
    uploadedDrops,
    unclaimedSaved,
    claimedSaved,
    isAvailableCollapsed,
    setIsAvailableCollapsed,
    isSavedCollapsed,
    setIsSavedCollapsed,
    isToClaimCollapsed,
    setIsToClaimCollapsed,
    isClaimedCollapsed,
    setIsClaimedCollapsed,
    selectedFreebieId,
    setSelectedFreebieId,
    selectedFreebie,
    handleCloseDetail,
    editingFreebie,
    setEditingFreebie,
    deletingFreebie,
    setDeletingFreebie,
  };
}
