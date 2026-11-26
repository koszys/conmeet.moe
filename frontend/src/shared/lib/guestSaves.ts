'use client';

import { useCallback, useEffect, useState } from 'react';

export const GUEST_SAVES_STORAGE_KEY = 'conmeet_guest_saves';
export const MAX_GUEST_SAVES_PER_TYPE = 250;
export const GUEST_SAVES_CHANGE_EVENT = 'conmeet-guest-saves-change';

export type GuestSaveType = 'meetups' | 'freebies' | 'albums' | 'claimed_freebies';

export interface GuestSaves {
  meetups: number[];
  freebies: number[];
  albums: number[];
  claimed_freebies: number[];
}

const EMPTY_GUEST_SAVES: GuestSaves = {
  meetups: [],
  freebies: [],
  albums: [],
  claimed_freebies: [],
};

// In-memory fallback if localStorage is disabled or throws QuotaExceededError
let inMemorySaves: GuestSaves = { ...EMPTY_GUEST_SAVES };

function sanitizeIds(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  const valid = raw
    .map((item) => (typeof item === 'number' ? item : Number(item)))
    .filter((n) => Number.isInteger(n) && n > 0);
  return Array.from(new Set(valid)).slice(-MAX_GUEST_SAVES_PER_TYPE);
}

export function getGuestSaves(): GuestSaves {
  if (typeof window === 'undefined') {
    return { ...EMPTY_GUEST_SAVES };
  }

  try {
    const raw = window.localStorage.getItem(GUEST_SAVES_STORAGE_KEY);
    if (!raw) {
      return { ...inMemorySaves };
    }
    const parsed = JSON.parse(raw);
    const sanitized: GuestSaves = {
      meetups: sanitizeIds(parsed?.meetups),
      freebies: sanitizeIds(parsed?.freebies),
      albums: sanitizeIds(parsed?.albums),
      claimed_freebies: sanitizeIds(parsed?.claimed_freebies),
    };
    inMemorySaves = sanitized;
    return sanitized;
  } catch {
    return { ...inMemorySaves };
  }
}

export function saveGuestSaves(saves: GuestSaves): boolean {
  const sanitized: GuestSaves = {
    meetups: sanitizeIds(saves.meetups),
    freebies: sanitizeIds(saves.freebies),
    albums: sanitizeIds(saves.albums),
    claimed_freebies: sanitizeIds(saves.claimed_freebies),
  };
  inMemorySaves = sanitized;

  let success = false;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(GUEST_SAVES_STORAGE_KEY, JSON.stringify(sanitized));
      success = true;
    } catch {
      // In-memory fallback handles QuotaExceededError or disabled localStorage
      success = false;
    }
    window.dispatchEvent(
      new CustomEvent<GuestSaves>(GUEST_SAVES_CHANGE_EVENT, { detail: sanitized })
    );
  }
  return success;
}

export function isGuestSaved(type: GuestSaveType, id: number): boolean {
  const current = getGuestSaves();
  return current[type].includes(id);
}

export function isGuestClaimed(freebieId: number): boolean {
  const current = getGuestSaves();
  return current.claimed_freebies.includes(freebieId);
}

export function toggleGuestSave(type: GuestSaveType, id: number): boolean {
  if (!id || id <= 0) return false;
  const current = getGuestSaves();
  const list = current[type];
  const exists = list.includes(id);

  let nextList: number[];
  let nextClaimed = current.claimed_freebies;

  if (exists) {
    nextList = list.filter((item) => item !== id);
    if (type === 'freebies') {
      nextClaimed = nextClaimed.filter((item) => item !== id);
    }
  } else {
    nextList = [...list, id];
  }

  const nextSaves: GuestSaves = {
    ...current,
    [type]: nextList,
    claimed_freebies: nextClaimed,
  };

  saveGuestSaves(nextSaves);
  return !exists;
}

export function toggleGuestClaim(freebieId: number): boolean {
  if (!freebieId || freebieId <= 0) return false;
  const current = getGuestSaves();
  const exists = current.claimed_freebies.includes(freebieId);

  let nextClaimed: number[];
  let nextFreebies = current.freebies;

  if (exists) {
    nextClaimed = current.claimed_freebies.filter((item) => item !== freebieId);
  } else {
    nextClaimed = [...current.claimed_freebies, freebieId];
    if (!nextFreebies.includes(freebieId)) {
      nextFreebies = [...nextFreebies, freebieId];
    }
  }

  const nextSaves: GuestSaves = {
    ...current,
    freebies: nextFreebies,
    claimed_freebies: nextClaimed,
  };

  saveGuestSaves(nextSaves);
  return !exists;
}

export function clearGuestSaves(): void {
  inMemorySaves = { ...EMPTY_GUEST_SAVES };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(GUEST_SAVES_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    window.dispatchEvent(
      new CustomEvent<GuestSaves>(GUEST_SAVES_CHANGE_EVENT, { detail: { ...EMPTY_GUEST_SAVES } })
    );
  }
}

export function useGuestSaves() {
  const [guestSaves, setGuestSaves] = useState<GuestSaves>(() => getGuestSaves());

  useEffect(() => {
    function handleChange() {
      setGuestSaves(getGuestSaves());
    }

    window.addEventListener(GUEST_SAVES_CHANGE_EVENT, handleChange);
    window.addEventListener('storage', handleChange);

    return () => {
      window.removeEventListener(GUEST_SAVES_CHANGE_EVENT, handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, []);

  const checkIsSaved = useCallback(
    (type: GuestSaveType, id: number) => {
      return guestSaves[type].includes(id);
    },
    [guestSaves]
  );

  const toggle = useCallback((type: GuestSaveType, id: number) => {
    return toggleGuestSave(type, id);
  }, []);

  const hasAnySaves =
    guestSaves.meetups.length > 0 ||
    guestSaves.freebies.length > 0 ||
    guestSaves.albums.length > 0 ||
    guestSaves.claimed_freebies.length > 0;

  return {
    guestSaves,
    isGuestSaved: checkIsSaved,
    isGuestClaimed: (freebieId: number) => isGuestClaimed(freebieId),
    toggleGuestSave: toggle,
    toggleGuestClaim: (freebieId: number) => toggleGuestClaim(freebieId),
    clearGuestSaves,
    hasAnySaves,
  };
}
