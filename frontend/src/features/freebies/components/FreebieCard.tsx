'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Bookmark, Check, ChevronDown, ChevronUp, MapPin, Square } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import type { Freebie } from '../types';
import { useToggleClaimFreebie, useToggleSaveFreebie } from '../api/mutations';

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

  return (
    <article
      className={cn(
        'border-ink group flex w-full flex-col justify-between border-2 bg-white shadow-[4px_4px_0_var(--ink)] transition-transform hover:-translate-y-0.5 dark:bg-zinc-900',
        freebie.is_claimed && 'opacity-90',
        className
      )}
    >
      {/* Clickable Card Body (Click free space to condense/expand) */}
      <div
        onClick={handleCardBodyClick}
        className="cursor-pointer"
        title={isCondensed ? 'Click card to expand' : 'Click card to condense'}
      >
        {/* Optional Image Header - only shown when not condensed */}
        {!isCondensed && imageUrl ? (
          <div className="border-ink relative aspect-video w-full overflow-hidden border-b-2 bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={imageUrl}
              alt={freebie.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            {freebie.is_claimed && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                <span className="border-ink bg-accent border-2 px-3 py-1 font-mono text-xs font-black tracking-widest text-white uppercase shadow-[2px_2px_0_var(--ink)] dark:text-zinc-950">
                  CLAIMED
                </span>
              </div>
            )}
          </div>
        ) : null}

        <div className={cn('p-4 sm:p-5', isCondensed && 'p-3 sm:p-3.5')}>
          {/* Vendor, Booth Location, and Collapse Toggle Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                {freebie.vendor.name}
              </span>
              {freebie.location ? (
                <span className="border-ink bg-accent-soft/25 text-ink inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[11px] font-bold uppercase shadow-[1px_1px_0_var(--ink)] dark:bg-zinc-800 dark:text-zinc-100">
                  <MapPin className="text-accent h-3 w-3 shrink-0" />
                  {freebie.location}
                </span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleToggleCondensed}
              aria-label={isCondensed ? 'Expand card' : 'Condense card'}
              title={isCondensed ? 'Expand card' : 'Condense card'}
              className="border-ink hover:text-ink shrink-0 cursor-pointer border p-1 text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {isCondensed ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronUp className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Title */}
          <h3
            className={cn(
              'font-display tracking-wide uppercase',
              isCondensed ? 'mt-1.5 text-sm sm:text-base' : 'mt-2.5 text-base sm:text-lg',
              freebie.is_claimed
                ? 'text-zinc-500 line-through decoration-zinc-400 decoration-2 dark:text-zinc-400'
                : 'text-zinc-900 dark:text-zinc-50'
            )}
          >
            {freebie.name}
          </h3>

          {/* Expanded-only Content */}
          {!isCondensed && (
            <>
              {/* Requirements Box */}
              {freebie.requirements ? (
                <div className="border-ink mt-3 border bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
                  <span className="block text-[10px] font-black tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                    How to get it:
                  </span>
                  <p className="mt-0.5 text-xs text-zinc-800 dark:text-zinc-200">
                    {freebie.requirements}
                  </p>
                </div>
              ) : null}

              {/* Description */}
              {freebie.description ? (
                <p className="mt-2.5 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-300">
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
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
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
              className={cn('h-4 w-4', freebie.is_saved ? 'fill-current stroke-[2.5]' : 'stroke-2')}
            />
          </button>
        </div>
      </div>
    </article>
  );
}
