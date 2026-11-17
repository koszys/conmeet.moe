'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { CloseButton, CONBLOCK, CONBLOCK_SECONDARY, LikeButton } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { useAuth } from '@/features/auth';
import { useToggleLikePhoto } from '../../api';
import type { MeetupPhoto } from '../../types';

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
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const { user } = useAuth();
  const toggleLikePhoto = useToggleLikePhoto();

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const activePhoto = photos[currentIndex];

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, photos.length, onClose]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !activePhoto) return null;

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-50 flex flex-col bg-zinc-950/95 backdrop-blur-sm"
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
          className="z-20 hidden h-full w-14 shrink-0 cursor-pointer items-center justify-center lg:flex lg:w-16"
          onClick={handlePrev}
        >
          {photos.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photo"
              title="Previous photo"
              className={cn(
                CONBLOCK,
                'border-ink bg-white/90 p-2 text-zinc-900 shadow-[2px_2px_0_var(--ink)] transition-all hover:bg-white dark:bg-zinc-800/90 dark:text-zinc-100 dark:hover:bg-zinc-800'
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
          className="z-20 hidden h-full w-14 shrink-0 cursor-pointer items-center justify-center lg:flex lg:w-16"
          onClick={handleNext}
        >
          {photos.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo"
              title="Next photo"
              className={cn(
                CONBLOCK,
                'border-ink bg-white/90 p-2 text-zinc-900 shadow-[2px_2px_0_var(--ink)] transition-all hover:bg-white dark:bg-zinc-800/90 dark:text-zinc-100 dark:hover:bg-zinc-800'
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
    </div>
  );
}
