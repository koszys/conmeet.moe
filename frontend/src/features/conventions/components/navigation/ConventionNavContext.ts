'use client';

import { createContext, useContext } from 'react';

export interface ConventionNavValue {
  open: boolean;
  toggle: () => void;
  close: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isMounted: boolean;
}

export const ConventionNavContext = createContext<ConventionNavValue | null>(null);

export function useConventionNav() {
  return useContext(ConventionNavContext);
}
