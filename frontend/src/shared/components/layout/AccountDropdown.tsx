'use client';

import type { RefObject } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { LogOut, Settings, UserRound } from 'lucide-react';
import type { MeUser } from '@/shared/lib/api';

export interface AccountDropdownProps {
  user: MeUser;
  popupRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onLogout: () => void;
}

export function AccountDropdown({ user, popupRef, onClose, onLogout }: AccountDropdownProps) {
  return createPortal(
    <div
      ref={popupRef}
      role="menu"
      aria-label="Account menu"
      className="border-ink fixed top-16 right-4 z-[70] w-52 rounded-none border-2 bg-white shadow-[3px_3px_0_var(--ink)] dark:bg-[#373b3e]"
    >
      {/* User Header */}
      <div className="border-ink flex items-center gap-2.5 border-b-2 border-dashed px-3.5 py-3">
        <div className="border-ink flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden border-2 bg-zinc-100 dark:bg-zinc-800">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserRound className="h-4 w-4 text-zinc-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs leading-tight font-bold">
            {user.display_name || user.username}
          </p>
          <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-300">@{user.username}</p>
        </div>
      </div>

      {/* Menu Actions */}
      <div className="py-1">
        <Link
          href="/settings"
          onClick={onClose}
          className="group hover:text-accent-pop flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold tracking-wider uppercase transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
        >
          <Settings className="group-hover:text-accent-pop h-4 w-4 text-zinc-600 transition-colors dark:text-zinc-300" />
          <span>Settings</span>
        </Link>
      </div>

      {/* Logout Action */}
      <div className="border-ink border-t-2 border-dashed py-1">
        <button
          type="button"
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="group hover:text-accent-pop flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-bold tracking-wider uppercase transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
        >
          <LogOut className="group-hover:text-accent-pop h-4 w-4 text-zinc-600 transition-colors dark:text-zinc-300" />
          <span>Log out</span>
        </button>
      </div>
    </div>,
    document.body
  );
}
