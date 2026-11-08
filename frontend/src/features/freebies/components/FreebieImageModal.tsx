'use client';

import Image from 'next/image';
import { Clock, MapPin } from 'lucide-react';
import { formatDateTime } from '@/shared/lib/dates';
import { Modal, ModalHeader } from '@/shared/components/ui';
import type { Freebie } from '../types';

export function FreebieImageModal({
  freebie,
  isOpen,
  onClose,
}: {
  freebie: Freebie;
  isOpen: boolean;
  onClose: () => void;
}) {
  const fullImageUrl = freebie.image || freebie.image_thumb;
  if (!fullImageUrl) return null;

  const uploadDateTime = formatDateTime(freebie.created_at);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      ariaLabelledBy={`freebie-image-title-${freebie.id}`}
      className="overflow-hidden"
    >
      {/* Modal Header */}
      <ModalHeader onClose={onClose}>
        <div className="min-w-0 pr-2">
          <span className="block truncate text-[11px] font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-300">
            {freebie.vendor.name}
          </span>
          <h4
            id={`freebie-image-title-${freebie.id}`}
            className="font-display truncate text-base font-bold tracking-wide text-zinc-900 uppercase dark:text-zinc-50"
          >
            {freebie.name}
          </h4>
        </div>
      </ModalHeader>

      {/* Modal Image Area */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        <Image
          src={fullImageUrl}
          alt={freebie.name}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 672px"
          priority
        />

        {freebie.is_claimed && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <span className="border-ink bg-accent border-2 px-3 py-1 font-mono text-xs font-black tracking-widest text-white uppercase shadow-[2px_2px_0_var(--ink)] dark:text-zinc-950">
              CLAIMED
            </span>
          </div>
        )}
      </div>

      {/* Modal Footer Info */}
      {(freebie.location || uploadDateTime) && (
        <div className="border-ink flex items-center justify-between border-t-2 bg-zinc-50 px-4 py-2.5 font-mono text-xs dark:bg-zinc-800/40">
          {freebie.location ? (
            <div className="flex items-center gap-1.5 font-bold uppercase">
              <MapPin className="text-accent h-3.5 w-3.5 shrink-0" />
              <span className="text-zinc-800 dark:text-zinc-200">{freebie.location}</span>
            </div>
          ) : (
            <div />
          )}

          {uploadDateTime ? (
            <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-300">
              <Clock className="h-3 w-3 shrink-0" />
              <span>Uploaded {uploadDateTime}</span>
            </div>
          ) : null}
        </div>
      )}
    </Modal>
  );
}
