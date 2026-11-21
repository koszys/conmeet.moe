'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { CloseButton } from '../actions/CloseButton';
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
  const containerRef = useRef<HTMLDivElement>(null);
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

  // Prevent wheel and touch gesture scrolling while lightbox is active
  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;

    const preventDefault = (e: Event) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    container.addEventListener('wheel', preventDefault, { passive: false });
    container.addEventListener('touchmove', preventDefault, { passive: false });

    return () => {
      container.removeEventListener('wheel', preventDefault);
      container.removeEventListener('touchmove', preventDefault);
    };
  }, [isOpen]);

  if (!isMounted || !isOpen || !src) return null;

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={title || alt || 'Full size image viewer'}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="fixed inset-0 z-[60] flex touch-none items-center justify-center overscroll-contain bg-black/85 p-2.5 backdrop-blur-xs select-none sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92vh] max-w-[calc(100vw-24px)] min-w-0 flex-col items-center sm:max-w-4xl"
      >
        {/* Header Bar */}
        <div className="mb-2 flex w-full max-w-[calc(100vw-24px)] items-center justify-between gap-2.5 text-white sm:mb-2.5 sm:max-w-full sm:gap-3">
          <div className="min-w-0 flex-1">
            {title && (
              <span className="font-display block truncate text-xs font-bold tracking-wider uppercase sm:text-sm">
                {title}
              </span>
            )}
            {subtitle && (
              <div className="mt-0.5 truncate text-[10px] text-zinc-300 sm:text-[11px]">
                {subtitle}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {actions}
            <CloseButton onClose={onClose} size="sm" />
          </div>
        </div>

        {/* Image Box */}
        <div className="border-ink relative flex max-h-[78vh] max-w-[calc(100vw-28px)] items-center justify-center overflow-hidden border-2 bg-zinc-950 shadow-[3px_3px_0_var(--ink)] sm:max-h-[82vh] sm:max-w-full sm:shadow-[6px_6px_0_var(--ink)]">
          <Image
            src={src}
            alt={alt}
            width={1600}
            height={1600}
            unoptimized
            className="max-h-[78vh] w-auto max-w-full object-contain sm:max-h-[82vh]"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
