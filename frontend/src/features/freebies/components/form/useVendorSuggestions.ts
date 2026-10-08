'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { UseFormSetValue } from 'react-hook-form';
import type { MultiFreebieFormValues } from './schema';
import { useFreebies, useVendors } from '../../api/queries';

export interface SuggestionVendor {
  id: number;
  name: string;
  isCurrentCon: boolean;
  knownLocations: string[];
}

interface UseVendorSuggestionsProps {
  conventionSlug?: string;
  selectedVendorName: string;
  onSelectVendor?: (canonicalName: string, autoLocation?: string) => void;
  setValue?: UseFormSetValue<MultiFreebieFormValues>;
  firstItemLocation?: string;
  focusNextElementId?: string;
}

export function useVendorSuggestions({
  conventionSlug,
  selectedVendorName,
  onSelectVendor,
  setValue,
  firstItemLocation = '',
  focusNextElementId = 'items.0.name',
}: UseVendorSuggestionsProps) {
  const {
    data: conventionVendors,
    refetch: refetchConventionVendors,
    isFetching: isFetchingConventionVendors,
  } = useVendors(conventionSlug || undefined, { staleTime: 0, refetchOnMount: 'always' });

  const {
    data: allVendors,
    refetch: refetchAllVendors,
    isFetching: isFetchingAllVendors,
  } = useVendors(undefined, { staleTime: 0, refetchOnMount: 'always' });

  const {
    data: conventionFreebies,
    refetch: refetchConventionFreebies,
    isFetching: isFetchingConventionFreebies,
  } = useFreebies(conventionSlug ? { convention: conventionSlug } : undefined);

  async function refreshVendors() {
    await Promise.all([
      refetchConventionVendors(),
      refetchAllVendors(),
      refetchConventionFreebies(),
    ]);
  }

  const isRefreshingVendors =
    isFetchingConventionVendors || isFetchingAllVendors || isFetchingConventionFreebies;

  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [autoFilledFromVendor, setAutoFilledFromVendor] = useState<string | null>(null);

  const inputWrapRef = useRef<HTMLDivElement>(null);
  const suggestListRef = useRef<HTMLDivElement>(null);

  // Build map of vendor name -> array of unique known booth locations at this convention
  const vendorLocationsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    if (conventionFreebies) {
      for (const f of conventionFreebies) {
        if (f.vendor?.name && f.location?.trim()) {
          const key = f.vendor.name.toLowerCase();
          const loc = f.location.trim();
          const existing = map.get(key) || [];
          if (!existing.includes(loc)) {
            existing.push(loc);
            map.set(key, existing);
          }
        }
      }
    }
    return map;
  }, [conventionFreebies]);

  // Combine convention vendors and all registered vendors (prioritizing current con)
  const combinedVendors = useMemo<SuggestionVendor[]>(() => {
    const seen = new Set<string>();
    const list: SuggestionVendor[] = [];

    if (conventionVendors) {
      for (const v of conventionVendors) {
        const lower = v.name.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          list.push({
            id: v.id,
            name: v.name,
            isCurrentCon: true,
            knownLocations: vendorLocationsMap.get(lower) || [],
          });
        }
      }
    }

    if (allVendors) {
      for (const v of allVendors) {
        const lower = v.name.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          list.push({
            id: v.id,
            name: v.name,
            isCurrentCon: false,
            knownLocations: vendorLocationsMap.get(lower) || [],
          });
        }
      }
    }

    return list;
  }, [conventionVendors, allVendors, vendorLocationsMap]);

  // Filter suggestions by typed vendor query
  const filteredSuggestions = useMemo(() => {
    const q = selectedVendorName.trim().toLowerCase();
    if (!q) {
      return combinedVendors.slice(0, 10);
    }
    return combinedVendors.filter((v) => v.name.toLowerCase().includes(q)).slice(0, 15);
  }, [combinedVendors, selectedVendorName]);

  // Close auto-suggest on outside click
  useEffect(() => {
    if (!isSuggestOpen) return;
    function handlePointerDown(e: PointerEvent) {
      if (inputWrapRef.current && !inputWrapRef.current.contains(e.target as Node)) {
        setIsSuggestOpen(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isSuggestOpen]);

  // Scroll highlighted suggestion item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && suggestListRef.current) {
      const items = suggestListRef.current.querySelectorAll('[data-suggest-item]');
      const activeItem = items[highlightedIndex] as HTMLElement | undefined;
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  // Known booth locations for the currently typed/selected vendor
  const knownBooths = useMemo(() => {
    return vendorLocationsMap.get(selectedVendorName.trim().toLowerCase()) || [];
  }, [vendorLocationsMap, selectedVendorName]);

  // Selection & unselection handler
  function handleSelectVendor(
    vendorName: string,
    options?: { toggleIfSelected?: boolean; advanceFocus?: boolean }
  ) {
    const isSelected = selectedVendorName.trim().toLowerCase() === vendorName.trim().toLowerCase();

    if (options?.toggleIfSelected && isSelected) {
      // Explicit toggle off / Unselect
      if (setValue) {
        setValue('vendor_name', '', { shouldValidate: true });
        if (
          autoFilledFromVendor &&
          autoFilledFromVendor.toLowerCase() === vendorName.trim().toLowerCase()
        ) {
          setValue('items.0.location', '', { shouldValidate: true });
        }
      }
      if (onSelectVendor) {
        onSelectVendor('', '');
      }
      setAutoFilledFromVendor(null);
      setIsSuggestOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    // Select
    const match = combinedVendors.find(
      (v) => v.name.toLowerCase() === vendorName.trim().toLowerCase()
    );
    const canonicalName = match ? match.name : vendorName.trim();

    const knownLocs = vendorLocationsMap.get(canonicalName.toLowerCase()) || [];
    let autoLoc: string | undefined = undefined;

    if (knownLocs.length > 0) {
      if (!firstItemLocation.trim() || autoFilledFromVendor) {
        autoLoc = knownLocs[0];
        setAutoFilledFromVendor(canonicalName);
      }
    } else if (autoFilledFromVendor) {
      setAutoFilledFromVendor(null);
    }

    if (setValue) {
      setValue('vendor_name', canonicalName, { shouldValidate: true });
      if (autoLoc !== undefined) {
        setValue('items.0.location', autoLoc, { shouldValidate: true });
      } else if (autoFilledFromVendor) {
        setValue('items.0.location', '', { shouldValidate: true });
      }
    }

    if (onSelectVendor) {
      onSelectVendor(canonicalName, autoLoc);
    }

    setIsSuggestOpen(false);
    setHighlightedIndex(-1);

    if (options?.advanceFocus && focusNextElementId) {
      requestAnimationFrame(() => {
        const target = document.getElementById(focusNextElementId);
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  }

  // Keyboard navigation for suggestions & Enter key advancing
  function handleVendorKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!isSuggestOpen) {
        e.preventDefault();
        setIsSuggestOpen(true);
        setHighlightedIndex(0);
        return;
      }
      e.preventDefault();
      if (e.key === 'ArrowDown') {
        setHighlightedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
      } else {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
      }
      return;
    }

    if (e.key === 'Escape') {
      if (isSuggestOpen) {
        e.preventDefault();
        setIsSuggestOpen(false);
        setHighlightedIndex(-1);
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();

      let vendorToSelect = selectedVendorName.trim();

      if (isSuggestOpen && highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        vendorToSelect = filteredSuggestions[highlightedIndex].name;
      } else if (isSuggestOpen && filteredSuggestions.length > 0) {
        const exactMatch = filteredSuggestions.find(
          (v) => v.name.toLowerCase() === vendorToSelect.toLowerCase()
        );
        if (exactMatch) {
          vendorToSelect = exactMatch.name;
        } else {
          vendorToSelect = filteredSuggestions[0].name;
        }
      }

      if (vendorToSelect) {
        handleSelectVendor(vendorToSelect, { toggleIfSelected: false, advanceFocus: true });
      } else {
        setIsSuggestOpen(false);
        setHighlightedIndex(-1);
        if (focusNextElementId) {
          const loc = document.getElementById(focusNextElementId);
          if (loc) {
            loc.focus();
            loc.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    }
  }

  return {
    conventionVendors,
    allVendors,
    conventionFreebies,
    vendorLocationsMap,
    combinedVendors,
    filteredSuggestions,
    knownBooths,
    isSuggestOpen,
    setIsSuggestOpen,
    highlightedIndex,
    setHighlightedIndex,
    autoFilledFromVendor,
    setAutoFilledFromVendor,
    inputWrapRef,
    suggestListRef,
    handleSelectVendor,
    handleVendorKeyDown,
    refreshVendors,
    isRefreshingVendors,
  };
}
