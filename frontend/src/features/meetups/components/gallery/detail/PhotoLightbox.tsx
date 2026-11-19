'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { CloseButton, CONBLOCK_SECONDARY, LikeButton } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { lockBodyScroll } from '@/shared/lib/scrollLock';
import { useAuth } from '@/features/auth';
import { useToggleLikePhoto } from '../../../api';
import type { MeetupPhoto } from '../../../types';

const emptySubscribe = () => () => {};

export interface PhotoLightboxProps {
  photos: MeetupPhoto[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  albumTitle?: string;
  conventionSlug: string;
  meetupSlugOrId: string | number;
}

export function PhotoLightbox({
  photos,
  initialIndex,
  isOpen,
  onClose,
  albumTitle = 'Photo',
  conventionSlug,
  meetupSlugOrId,
}: PhotoLightboxProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const { user } = useAuth();
  const toggleLikePhoto = useToggleLikePhoto();
  const containerRef = useRef<HTMLDivElement>(null);

  const activePhoto = photos[currentIndex];

  // Keyboard navigation & body scroll locking
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
      } else if (e.key === 'ArrowRight') {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
      }
    }

    const unlock = lockBodyScroll();
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unlock();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, photos.length, onClose]);

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

  if (!isMounted || !isOpen || !activePhoto) return null;

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  // Touch Swipe for mobile (swipe left/right to navigate without indicators)
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isHorizontalSwipeRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = e.touches[0].clientX - touchStartXRef.current;
    const diffY = e.touches[0].clientY - touchStartYRef.current;

    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
        isHorizontalSwipeRef.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartXRef.current;
    const swipeThreshold = 40;

    if (isHorizontalSwipeRef.current && Math.abs(diffX) >= swipeThreshold) {
      if (diffX < 0) {
        // Swiped left -> next
        setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
      } else {
        // Swiped right -> prev
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    isHorizontalSwipeRef.current = null;
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      window.location.href = `/login?redirect=/conventions/${conventionSlug}/meetups/${meetupSlugOrId}`;
      return;
    }
    toggleLikePhoto.mutate({ photoId: activePhoto.id, albumId: activePhoto.album });
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(activePhoto.image);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${albumTitle.replace(/\s+/g, '_')}_photo_${currentIndex + 1}.webp`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download photo:', err);
      // Fallback: open in new tab
      window.open(activePhoto.image, '_blank');
    }
  };

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-[60] flex touch-none flex-col overscroll-contain bg-zinc-950/95 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-4 py-3 sm:px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="font-mono text-xs font-bold text-zinc-400">
          {currentIndex + 1}/{photos.length}
        </span>

        <div className="flex items-center gap-2">
          {/* Like */}
          <LikeButton
            variant="badge"
            isLiked={activePhoto.is_liked}
            count={activePhoto.likes_count}
            onClick={handleLike}
            title={activePhoto.is_liked ? 'Liked' : 'Like Photo'}
            ariaLabel={activePhoto.is_liked ? 'Liked' : 'Like Photo'}
            className="h-9 px-3"
          />

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            title="Download full size photo"
            aria-label="Download full size photo"
            className={cn(
              CONBLOCK_SECONDARY,
              'inline-flex h-9 items-center gap-1.5 px-3 text-xs font-bold uppercase transition-all'
            )}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Close */}
          <CloseButton onClick={onClose} ariaLabel="Close photo viewer" size="md" />
        </div>
      </div>

      {/* Photo Area */}
      <div
        className="relative flex flex-1 items-center justify-between p-2 select-none sm:p-4 lg:px-6 lg:py-6"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous (desktop) */}
        <div
          className="group/prev z-20 hidden h-full w-14 shrink-0 cursor-pointer items-center justify-center lg:flex lg:w-16"
          onClick={handlePrev}
        >
          {photos.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photo"
              title="Previous photo"
              className={cn(
                CONBLOCK_SECONDARY,
                'group-hover/prev:border-accent-pop group-hover/prev:text-accent-pop dark:group-hover/prev:border-accent-pop dark:group-hover/prev:text-accent-pop p-2 text-zinc-900 transition-all group-hover/prev:translate-x-0.5 group-hover/prev:translate-y-0.5 group-hover/prev:shadow-none dark:text-zinc-100'
              )}
            >
              <ChevronLeft className="h-6 w-6 stroke-3" />
            </button>
          )}
        </div>

        {/* Image Container */}
        <div className="relative flex h-full max-h-[82vh] min-w-0 flex-1 items-center justify-center">
          {/* Side click zones */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous photo"
                tabIndex={-1}
                className="absolute inset-y-0 left-0 z-0 hidden w-1/2 cursor-pointer focus:outline-none lg:block"
              />
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next photo"
                tabIndex={-1}
                className="absolute inset-y-0 right-0 z-0 hidden w-1/2 cursor-pointer focus:outline-none lg:block"
              />
            </>
          )}

          {/* Active Photo */}
          <div
            className="relative z-10 flex max-h-[82vh] max-w-full items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activePhoto.image}
              alt={activePhoto.caption || `${albumTitle} - Photo ${currentIndex + 1}`}
              width={1920}
              height={1080}
              priority
              unoptimized
              className="border-ink max-h-[82vh] w-auto max-w-full border-2 object-contain shadow-[4px_4px_0_var(--ink)]"
            />
          </div>
        </div>

        {/* Next (desktop) */}
        <div
          className="group/next z-20 hidden h-full w-14 shrink-0 cursor-pointer items-center justify-center lg:flex lg:w-16"
          onClick={handleNext}
        >
          {photos.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo"
              title="Next photo"
              className={cn(
                CONBLOCK_SECONDARY,
                'group-hover/next:border-accent-pop group-hover/next:text-accent-pop dark:group-hover/next:border-accent-pop dark:group-hover/next:text-accent-pop p-2 text-zinc-900 transition-all group-hover/next:translate-x-0.5 group-hover/next:translate-y-0.5 group-hover/next:shadow-none dark:text-zinc-100'
              )}
            >
              <ChevronRight className="h-6 w-6 stroke-3" />
            </button>
          )}
        </div>
      </div>

      {/* Caption */}
      {activePhoto.caption && (
        <div
          className="border-t border-zinc-800 bg-zinc-900/90 px-4 py-2.5 text-center text-sm font-semibold text-zinc-200"
          onClick={(e) => e.stopPropagation()}
        >
          {activePhoto.caption}
        </div>
      )}
    </div>,
    document.body
  );
}
