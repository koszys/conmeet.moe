'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X } from 'lucide-react';
import { CONBLOCK } from '../actions/Button';
import { cn } from '@/shared/lib/utils';
import { lockBodyScroll } from '@/shared/lib/scrollLock';

const emptySubscribe = () => () => {};

export interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  title?: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

export function ImageLightbox({
  isOpen,
  onClose,
  src,
  alt,
  title,
  subtitle,
  actions,
}: ImageLightboxProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    }

    const unlock = lockBodyScroll();
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      unlock();
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, onClose]);

  if (!isMounted || !isOpen || !src) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || alt || 'Full size image viewer'}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="fixed inset-0 z-[60] flex items-center justify-center overscroll-contain bg-black/85 p-4 backdrop-blur-xs sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92vh] max-w-4xl flex-col items-center"
      >
        {/* Header Bar */}
        <div className="mb-2.5 flex w-full items-center justify-between gap-3 text-white">
          <div className="min-w-0 flex-1">
            {title && (
              <span className="font-display block truncate text-xs font-bold tracking-wider uppercase sm:text-sm">
                {title}
              </span>
            )}
            {subtitle && <div className="mt-0.5 text-[11px] text-zinc-300">{subtitle}</div>}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {actions}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className={cn(
                CONBLOCK,
                'flex h-8 w-8 items-center justify-center bg-white text-zinc-950 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700'
              )}
              title="Close"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Image Box */}
        <div className="border-ink relative max-h-[82vh] overflow-hidden border-2 bg-zinc-950 shadow-[6px_6px_0_var(--ink)]">
          <Image
            src={src}
            alt={alt}
            width={1600}
            height={1600}
            unoptimized
            className="max-h-[82vh] w-auto max-w-full object-contain"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
