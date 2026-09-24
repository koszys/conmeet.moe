'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  Bookmark,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Square,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { formatDateTime } from '@/shared/lib/dates';
import { cn } from '@/shared/lib/utils';
import type { Freebie } from '../types';
import { useToggleClaimFreebie, useToggleSaveFreebie } from '../api/mutations';
import { FreebieImageModal } from './FreebieImageModal';

export function FreebieCard({
  freebie,
  className,
  defaultCondensed = false,
  condensed: externalCondensed,
  onToggleCondensed,
}: {
  freebie: Freebie;
  className?: string;
  defaultCondensed?: boolean;
  condensed?: boolean;
  onToggleCondensed?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const [internalCondensed, setInternalCondensed] = useState(defaultCondensed);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const isCondensed = externalCondensed !== undefined ? externalCondensed : internalCondensed;

  const toggleSave = useToggleSaveFreebie();
  const toggleClaim = useToggleClaimFreebie();

  function requireAuthAction(action: () => void) {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    action();
  }

  function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    requireAuthAction(() => {
      toggleSave.mutate(freebie.id);
    });
  }

  function handleClaim(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    requireAuthAction(() => {
      toggleClaim.mutate(freebie.id);
    });
  }

  function handleToggleCondensed(e?: React.MouseEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onToggleCondensed) {
      onToggleCondensed();
    } else {
      setInternalCondensed((prev) => !prev);
    }
  }

  function handleCardBodyClick(e: React.MouseEvent) {
    // If the user selected text, don't trigger condense
    const selection = typeof window !== 'undefined' ? window.getSelection() : null;
    if (selection && selection.toString().length > 0) {
      return;
    }
    handleToggleCondensed(e);
  }

  const imageUrl = freebie.image_thumb || freebie.image;
  const uploadDateTime = formatDateTime(freebie.created_at);

  return (
    <article
      className={cn(
        'border-ink group flex w-full flex-col justify-between border-2 bg-white shadow-[4px_4px_0_var(--ink)] transition-transform hover:-translate-y-0.5 dark:bg-zinc-900',
        freebie.is_claimed && 'bg-zinc-50/60 opacity-95 dark:bg-zinc-900/60',
        className
      )}
    >
      {/* Clickable Card Body (Click free space to condense/expand) */}
      <div
        onClick={handleCardBodyClick}
        className="cursor-pointer"
        title={isCondensed ? 'Click card to expand' : 'Click card to condense'}
      >
        <div className={cn('p-4 sm:p-5', isCondensed && 'p-3 sm:p-3.5')}>
          {/* Header Row: Vendor Name, Booth Location, Claimed Badge, and Collapse Toggle */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-black tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                {freebie.vendor.name}
              </span>
              {freebie.location ? (
                <span className="border-ink bg-accent-soft/25 text-ink inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[10px] font-bold uppercase shadow-[1px_1px_0_var(--ink)] dark:bg-zinc-800 dark:text-zinc-100">
                  <MapPin className="text-accent h-3 w-3 shrink-0" />
                  {freebie.location}
                </span>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {freebie.is_claimed ? (
                <span className="border-ink bg-accent inline-flex items-center gap-1 border px-1.5 py-0.5 font-mono text-[10px] font-black text-white uppercase shadow-[1px_1px_0_var(--ink)] dark:text-zinc-950">
                  <Check className="h-3 w-3 stroke-3" />
                  CLAIMED
                </span>
              ) : null}

              <button
                type="button"
                onClick={handleToggleCondensed}
                aria-label={isCondensed ? 'Expand card' : 'Condense card'}
                title={isCondensed ? 'Expand card' : 'Condense card'}
                className="border-ink hover:text-ink flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center border text-zinc-500 transition-colors hover:bg-zinc-100 hover:shadow-[1px_1px_0_var(--ink)] dark:hover:bg-zinc-800"
              >
                {isCondensed ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Title, Upload Timestamp, and Image Thumbnail */}
          <div
            className={cn(
              'flex items-start justify-between gap-3',
              isCondensed ? 'mt-2' : 'mt-2.5'
            )}
          >
            <div className="min-w-0 flex-1">
              <h3
                className={cn(
                  'font-display tracking-wide uppercase',
                  isCondensed
                    ? 'text-sm leading-snug sm:text-base'
                    : 'text-base leading-snug sm:text-lg',
                  freebie.is_claimed
                    ? 'text-zinc-500 line-through decoration-zinc-400 decoration-2 dark:text-zinc-400'
                    : 'text-zinc-900 dark:text-zinc-50'
                )}
              >
                {freebie.name}
              </h3>

              {uploadDateTime ? (
                <div
                  className="mt-1 flex items-center gap-1 font-mono text-[10px] font-semibold text-zinc-400 dark:text-zinc-500"
                  title={`Uploaded on ${uploadDateTime}`}
                >
                  <Clock className="h-3 w-3 shrink-0 text-zinc-400 dark:text-zinc-500" />
                  <span>{uploadDateTime}</span>
                </div>
              ) : null}
            </div>

            {imageUrl ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsImageOpen(true);
                }}
                aria-label={`View photo of ${freebie.name}`}
                title="View photo"
                className={cn(
                  'border-ink group/thumb relative shrink-0 cursor-pointer overflow-hidden border-2 bg-zinc-100 shadow-[2px_2px_0_var(--ink)] transition-transform hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--ink)] dark:bg-zinc-800',
                  isCondensed ? 'h-9 w-9' : 'h-11 w-11'
                )}
              >
                <Image
                  src={imageUrl}
                  alt={freebie.name}
                  fill
                  className="object-cover transition-opacity group-hover/thumb:opacity-85"
                  sizes="44px"
                />
                <div className="border-ink absolute -right-0.5 -bottom-0.5 flex h-3.5 w-3.5 items-center justify-center border bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                  <Camera className="h-2 w-2" />
                </div>
              </button>
            ) : null}
          </div>

          {/* Expanded-only Content */}
          {!isCondensed && (
            <>
              {/* Requirements Box */}
              {freebie.requirements ? (
                <div className="border-ink mt-3 border bg-zinc-50/80 p-2.5 shadow-[1px_1px_0_var(--ink)] dark:bg-zinc-800/60">
                  <span className="block text-[10px] font-black tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                    How to get it:
                  </span>
                  <p className="mt-0.5 text-xs leading-relaxed font-medium text-zinc-800 dark:text-zinc-200">
                    {freebie.requirements}
                  </p>
                </div>
              ) : null}

              {/* Description */}
              {freebie.description ? (
                <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {freebie.description}
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="border-ink border-t-2 bg-zinc-50 p-2.5 sm:px-3.5 dark:bg-zinc-800/40"
      >
        <div className="flex items-center justify-between gap-2">
          {/* Check off / Claim button */}
          <button
            type="button"
            onClick={handleClaim}
            disabled={toggleClaim.isPending}
            className={cn(
              CONBLOCK,
              'flex-1 px-2.5 py-1.5 text-xs font-bold uppercase transition-all',
              freebie.is_claimed
                ? 'bg-accent text-white hover:brightness-110 dark:text-zinc-950'
                : 'bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800'
            )}
          >
            {freebie.is_claimed ? (
              <span className="inline-flex items-center justify-center gap-1.5">
                <Check className="h-3.5 w-3.5 stroke-3" />
                <span>CLAIMED</span>
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-1.5 text-zinc-800 dark:text-zinc-200">
                <Square className="h-3.5 w-3.5 stroke-2" />
                <span>CHECK OFF</span>
              </span>
            )}
          </button>

          {/* Save / Bookmark button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={toggleSave.isPending}
            aria-label={freebie.is_saved ? 'Remove from saved' : 'Save freebie'}
            title={freebie.is_saved ? 'Saved' : 'Save'}
            className={cn(
              CONBLOCK,
              'inline-flex h-8 w-8 shrink-0 items-center justify-center text-xs font-bold transition-all',
              freebie.is_saved
                ? 'bg-accent text-white hover:brightness-110 dark:text-zinc-950'
                : 'bg-white text-zinc-800 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800'
            )}
          >
            <Bookmark
              className={cn('h-4 w-4', freebie.is_saved ? 'fill-current stroke-2' : 'stroke-2')}
            />
          </button>
        </div>
      </div>

      {imageUrl ? (
        <FreebieImageModal
          freebie={freebie}
          isOpen={isImageOpen}
          onClose={() => setIsImageOpen(false)}
        />
      ) : null}
    </article>
  );
}
