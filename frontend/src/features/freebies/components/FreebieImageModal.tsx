'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Clock, MapPin, X } from 'lucide-react';
import { CONBLOCK } from '@/shared/components/ui/button';
import { formatDateTime } from '@/shared/lib/dates';
import { cn } from '@/shared/lib/utils';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const fullImageUrl = freebie.image || freebie.image_thumb;
  if (!fullImageUrl) return null;

  const uploadDateTime = formatDateTime(freebie.created_at);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`freebie-image-title-${freebie.id}`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px] sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="border-ink relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden border-2 bg-white shadow-[6px_6px_0_var(--ink)] dark:bg-zinc-900"
      >
        {/* Modal Header */}
        <div className="border-ink flex items-center justify-between border-b-2 bg-zinc-50 px-4 py-3 dark:bg-zinc-800/80">
          <div className="min-w-0 pr-2">
            <span className="block truncate text-[11px] font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              {freebie.vendor.name}
            </span>
            <h4
              id={`freebie-image-title-${freebie.id}`}
              className="font-display truncate text-base font-bold tracking-wide text-zinc-900 uppercase dark:text-zinc-50"
            >
              {freebie.name}
            </h4>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo preview"
            className={cn(CONBLOCK, 'shrink-0 p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Image Area */}
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
          <Image
            src={fullImageUrl}
            alt={freebie.name}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, 512px"
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
              <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                <Clock className="h-3 w-3 shrink-0" />
                <span>Uploaded {uploadDateTime}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
