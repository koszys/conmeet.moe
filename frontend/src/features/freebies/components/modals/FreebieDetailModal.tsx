'use client';

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Clock, MapPin, Check, Square } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { BookmarkButton, ExpandableImage, Modal, ModalHeader } from '@/shared/components/ui';
import { formatDateTime } from '@/shared/lib/dates';
import { cn } from '@/shared/lib/utils';
import type { Freebie } from '../../types';
import { useToggleSaveFreebie } from '../../api/mutations';
import { ClaimButton } from '../ClaimButton';

export interface FreebieDetailModalProps {
  freebie: Freebie;
  isOpen: boolean;
  onClose: () => void;
}

export function FreebieDetailModal({ freebie, isOpen, onClose }: FreebieDetailModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const toggleSave = useToggleSaveFreebie();

  const fullImageUrl = freebie.image || freebie.image_thumb;
  const uploadDateTime = formatDateTime(freebie.created_at);

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      ariaLabelledBy={`freebie-detail-title-${freebie.id}`}
      className="flex max-h-[72vh] flex-col overflow-hidden sm:max-h-[85vh]"
      overlayClassName="py-6 px-3.5 sm:p-6"
    >
      {/* Modal Header */}
      <ModalHeader onClose={onClose} className="shrink-0 items-start p-3.5 sm:p-5">
        <div className="min-w-0 flex-1 pr-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black tracking-wider text-zinc-600 uppercase dark:text-zinc-300">
              {freebie.vendor.name}
            </span>
            {freebie.location ? (
              <span className="border-ink bg-accent-soft/25 text-ink inline-flex shrink-0 items-center gap-1 border px-2 py-0.5 font-mono text-[10px] font-bold uppercase shadow-[1px_1px_0_var(--ink)] dark:bg-zinc-800 dark:text-zinc-100">
                <MapPin className="text-accent h-3 w-3 shrink-0" />
                <span>{freebie.location}</span>
              </span>
            ) : null}
          </div>
          <h3
            id={`freebie-detail-title-${freebie.id}`}
            className="font-display mt-2 text-lg font-bold tracking-wide text-zinc-900 uppercase sm:mt-2.5 sm:text-xl dark:text-zinc-50"
          >
            {freebie.name}
          </h3>
          {uploadDateTime ? (
            <div className="mt-1 flex items-center gap-1 font-mono text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
              <Clock className="h-3 w-3 shrink-0 text-zinc-500 dark:text-zinc-300" />
              <span>Uploaded {uploadDateTime}</span>
            </div>
          ) : null}
        </div>
      </ModalHeader>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Large Image View (if present) */}
        {fullImageUrl ? (
          <ExpandableImage
            src={fullImageUrl}
            alt={freebie.name}
            title="Click to view full image"
            className="group/lightbox relative aspect-video max-h-[190px] w-full overflow-hidden bg-zinc-950 sm:max-h-[340px] md:max-h-[380px]"
            lightboxTitle={freebie.name}
            lightboxSubtitle={
              <span>
                {freebie.vendor.name}
                {freebie.location ? ` • ${freebie.location}` : ''}
              </span>
            }
          >
            <Image
              src={fullImageUrl}
              alt={freebie.name}
              fill
              className="object-contain transition-transform duration-300 group-hover/lightbox:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
            />
          </ExpandableImage>
        ) : null}

        {/* Full Details Content */}
        <div className="space-y-3.5 p-3.5 sm:space-y-4 sm:p-5">
          {/* Requirements Box */}
          <div className="border-ink border bg-zinc-50 p-3.5 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800/60">
            <span className="block text-[11px] font-black tracking-wider text-zinc-600 uppercase dark:text-zinc-300">
              How to get it:
            </span>
            <p
              className={cn(
                'mt-1 text-sm leading-relaxed font-medium whitespace-pre-wrap',
                freebie.requirements
                  ? 'text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-600 italic dark:text-zinc-300'
              )}
            >
              {freebie.requirements || 'No requirements provided'}
            </p>
          </div>

          {/* Description & Notes Box */}
          <div className="border-ink border bg-white p-3.5 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-900">
            <span className="block text-[11px] font-black tracking-wider text-zinc-600 uppercase dark:text-zinc-300">
              Additional Notes:
            </span>
            <p
              className={cn(
                'mt-1 text-sm leading-relaxed whitespace-pre-wrap',
                freebie.description
                  ? 'text-zinc-800 dark:text-zinc-200'
                  : 'text-zinc-500 italic dark:text-zinc-300'
              )}
            >
              {freebie.description || 'No additional notes provided.'}
            </p>
          </div>
        </div>
      </div>

      {/* Modal Actions Footer */}
      <div className="border-ink shrink-0 border-t-2 bg-zinc-50 p-2.5 sm:p-3 sm:px-5 dark:bg-zinc-800/40">
        <div className="flex items-center justify-between gap-3">
          {/* Claim Status Pill on Left */}
          <div className="flex items-center gap-2">
            {freebie.is_claimed ? (
              <span className="border-ink bg-accent inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px] font-black tracking-wider text-white uppercase shadow-[1px_1px_0_var(--ink)] dark:text-zinc-950">
                <Check className="h-3.5 w-3.5 stroke-3" />
                <span>CLAIMED</span>
              </span>
            ) : (
              <span className="border-ink inline-flex items-center gap-1.5 border bg-white px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider text-zinc-700 shadow-[1px_1px_0_var(--ink)] dark:bg-zinc-900 dark:text-zinc-200">
                <Square className="h-3.5 w-3.5 stroke-2" />
                <span>UNCLAIMED</span>
              </span>
            )}
          </div>

          {/* Action Buttons on Right (Check off & Bookmark same compact size) */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Check off / Claim button */}
            <ClaimButton freebie={freebie} variant="icon" />

            {/* Save / Bookmark button */}
            <BookmarkButton
              isSaved={freebie.is_saved}
              onClick={handleSave}
              disabled={toggleSave.isPending}
              ariaLabel={freebie.is_saved ? 'Remove from saved' : 'Save freebie'}
              title={freebie.is_saved ? 'Saved' : 'Save'}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
