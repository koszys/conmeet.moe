'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Pencil,
  Square,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { BookmarkButton, CONBLOCK, ExpandableImage } from '@/shared/components/ui';
import { formatDateTime } from '@/shared/lib/dates';
import { cn } from '@/shared/lib/utils';
import type { Freebie } from '../types';
import { useToggleClaimFreebie, useToggleSaveFreebie } from '../api/mutations';
import { FreebieDetailModal } from './FreebieDetailModal';
import { EditFreebieModal } from './EditFreebieModal';
import { DeleteFreebieModal } from './DeleteFreebieModal';

export function FreebieCard({
  freebie,
  className,
  defaultCondensed = false,
  condensed: externalCondensed,
  onToggleCondensed,
  canManage = false,
}: {
  freebie: Freebie;
  className?: string;
  defaultCondensed?: boolean;
  condensed?: boolean;
  onToggleCondensed?: () => void;
  canManage?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const [internalCondensed, setInternalCondensed] = useState(defaultCondensed);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const isCondensed = externalCondensed !== undefined ? externalCondensed : internalCondensed;

  const isOwner = Boolean(
    user && (freebie.is_owner || (freebie.created_by !== null && freebie.created_by === user.id))
  );

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

  function handleCardBodyClick() {
    // If the user selected text, don't trigger modal
    const selection = typeof window !== 'undefined' ? window.getSelection() : null;
    if (selection && selection.toString().length > 0) {
      return;
    }
    setIsDetailOpen(true);
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
      {/* Clickable Card Body (Click anywhere to open full details modal) */}
      <div
        onClick={handleCardBodyClick}
        className="flex flex-1 cursor-pointer flex-col justify-between"
        title="Click to view full details"
      >
        <div className={cn('flex flex-1 flex-col p-4 sm:p-5', isCondensed && 'p-3 sm:p-3.5')}>
          {/* Header Row: Vendor Name, Booth Location, and Collapse Toggle */}
          <div className="flex h-7 items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
              <span className="truncate text-[11px] font-black tracking-wider text-zinc-600 uppercase dark:text-zinc-200">
                {freebie.vendor.name}
              </span>
              {freebie.location ? (
                <span className="border-ink bg-accent-soft/25 text-ink inline-flex max-w-[130px] shrink-0 items-center gap-1 border px-2 py-0.5 font-mono text-[10px] font-bold uppercase shadow-[1px_1px_0_var(--ink)] dark:bg-zinc-800 dark:text-zinc-100">
                  <MapPin className="text-accent h-3 w-3 shrink-0" />
                  <span className="truncate">{freebie.location}</span>
                </span>
              ) : null}
            </div>

            {/* Upgraded Expand / Condense Button with CONBLOCK */}
            <div className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={handleToggleCondensed}
                aria-label={isCondensed ? 'Expand card' : 'Condense card'}
                title={isCondensed ? 'Expand card' : 'Condense card'}
                className={cn(
                  CONBLOCK,
                  'flex h-7 w-7 shrink-0 items-center justify-center bg-white text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700'
                )}
              >
                {isCondensed ? (
                  <ChevronDown className="h-4 w-4 stroke-[2.5]" />
                ) : (
                  <ChevronUp className="h-4 w-4 stroke-[2.5]" />
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
                  'font-display line-clamp-2 tracking-wide uppercase',
                  isCondensed
                    ? 'min-h-[2.5rem] text-sm leading-snug sm:min-h-[2.75rem] sm:text-base'
                    : 'min-h-[2.75rem] text-base leading-snug sm:min-h-[3rem] sm:text-lg',
                  freebie.is_claimed
                    ? 'text-zinc-600 dark:text-zinc-300'
                    : 'text-zinc-900 dark:text-zinc-50'
                )}
              >
                {freebie.name}
              </h3>

              <div
                className="mt-1 flex h-4 items-center gap-1 font-mono text-[10px] font-semibold text-zinc-600 dark:text-zinc-300"
                title={uploadDateTime ? `Uploaded on ${uploadDateTime}` : undefined}
              >
                {uploadDateTime ? (
                  <>
                    <Clock className="h-3 w-3 shrink-0 text-zinc-500 dark:text-zinc-300" />
                    <span>{uploadDateTime}</span>
                  </>
                ) : null}
              </div>
            </div>

            {imageUrl ? (
              <ExpandableImage
                src={freebie.image || freebie.image_thumb || ''}
                thumbnailSrc={imageUrl}
                alt={freebie.name}
                ariaLabel={`Expand photo of ${freebie.name}`}
                title="Click to expand photo"
                className={cn(
                  CONBLOCK,
                  'group/thumb relative shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800',
                  isCondensed ? 'h-9 w-9' : 'h-11 w-11'
                )}
                lightboxTitle={freebie.name}
                lightboxSubtitle={
                  <span>
                    {freebie.vendor.name}
                    {freebie.location ? ` • ${freebie.location}` : ''}
                  </span>
                }
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
              </ExpandableImage>
            ) : null}
          </div>

          {/* Expanded-only Content */}
          {!isCondensed && (
            <div className="mt-3 flex flex-1 flex-col justify-between">
              {/* Requirements Box */}
              <div className="border-ink flex min-h-[58px] flex-col justify-center border bg-zinc-50/80 p-2.5 shadow-[1px_1px_0_var(--ink)] dark:bg-zinc-800/60">
                <span className="block text-[10px] font-black tracking-wider text-zinc-500 uppercase dark:text-zinc-300">
                  How to get it:
                </span>
                <p
                  className={cn(
                    'mt-0.5 line-clamp-2 text-xs leading-relaxed font-medium',
                    freebie.requirements
                      ? 'text-zinc-800 dark:text-zinc-100'
                      : 'text-zinc-600 italic dark:text-zinc-300'
                  )}
                >
                  {freebie.requirements || 'No requirements provided'}
                </p>
              </div>

              {/* Description */}
              <p
                className={cn(
                  'mt-2.5 line-clamp-2 min-h-[2rem] text-xs leading-relaxed',
                  freebie.description
                    ? 'text-zinc-700 dark:text-zinc-200'
                    : 'text-zinc-500 italic dark:text-zinc-300'
                )}
              >
                {freebie.description || 'No additional notes provided.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="border-ink mt-auto shrink-0 border-t-2 bg-zinc-50 p-2.5 sm:px-3.5 dark:bg-zinc-800/40"
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

          <div className="flex shrink-0 items-center gap-1.5">
            {/* Save / Bookmark button */}
            <BookmarkButton
              isSaved={freebie.is_saved}
              onClick={handleSave}
              disabled={toggleSave.isPending}
              ariaLabel={freebie.is_saved ? 'Remove from saved' : 'Save freebie'}
              title={freebie.is_saved ? 'Saved' : 'Save'}
            />

            {/* Owner Edit & Delete Buttons (Only in My Uploads) */}
            {canManage && isOwner ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsEditOpen(true);
                  }}
                  aria-label={`Edit ${freebie.name}`}
                  title="Edit freebie"
                  className={cn(
                    CONBLOCK,
                    'inline-flex h-8 w-8 shrink-0 items-center justify-center bg-white text-xs font-bold text-zinc-700 transition-all hover:bg-zinc-100 hover:text-black dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white'
                  )}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDeleteOpen(true);
                  }}
                  aria-label={`Delete ${freebie.name}`}
                  title="Delete freebie"
                  className={cn(
                    CONBLOCK,
                    'inline-flex h-8 w-8 shrink-0 items-center justify-center bg-white text-xs font-bold text-rose-600 transition-all hover:bg-rose-50 hover:text-rose-700 dark:bg-zinc-900 dark:text-rose-400 dark:hover:bg-rose-950/40'
                  )}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <FreebieDetailModal
        freebie={freebie}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        canManage={canManage}
        onEdit={() => setIsEditOpen(true)}
        onDelete={() => setIsDeleteOpen(true)}
      />

      {isEditOpen ? (
        <EditFreebieModal
          freebie={freebie}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      ) : null}

      {isDeleteOpen ? (
        <DeleteFreebieModal
          freebie={freebie}
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
        />
      ) : null}
    </article>
  );
}
