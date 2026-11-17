'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Download, Heart } from 'lucide-react';
import { CloseButton, CONBLOCK, CONBLOCK_SECONDARY } from '@/shared/components/ui';
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
      {/* Top action bar */}
      <div
        className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-4 py-3 sm:px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="font-mono text-xs font-bold text-zinc-400">
          {currentIndex + 1} / {photos.length}
        </span>

        <div className="flex items-center gap-2">
          {/* Like button */}
          <button
            type="button"
            onClick={handleLike}
            title={activePhoto.is_liked ? 'Liked' : 'Like Photo'}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 px-3 text-xs font-bold tracking-wider uppercase transition-all',
              activePhoto.is_liked
                ? 'border-accent bg-accent text-white dark:text-zinc-950'
                : CONBLOCK_SECONDARY
            )}
          >
            <Heart
              className={cn(
                'h-3.5 w-3.5',
                activePhoto.is_liked
                  ? 'fill-current text-white dark:text-zinc-950'
                  : 'text-zinc-600'
              )}
            />
            <span>{activePhoto.likes_count}</span>
          </button>

          {/* Download photo button */}
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

          {/* Close button */}
          <CloseButton onClick={onClose} ariaLabel="Close photo viewer" size="md" />
        </div>
      </div>

      {/* Main photo area */}
      <div
        className="relative flex flex-1 items-center justify-center p-2 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous button */}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous photo"
            className={cn(
              CONBLOCK,
              'border-ink absolute top-1/2 left-3 z-10 -translate-y-1/2 bg-white/90 p-2 text-zinc-900 shadow-[2px_2px_0_var(--ink)] transition-transform hover:scale-105 active:scale-95 sm:left-6 dark:bg-zinc-800/90 dark:text-zinc-100'
            )}
          >
            <ChevronLeft className="h-6 w-6 stroke-3" />
          </button>
        )}

        {/* The active image */}
        <div className="relative flex max-h-[82vh] max-w-full items-center justify-center">
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

        {/* Next button */}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next photo"
            className={cn(
              CONBLOCK,
              'border-ink absolute top-1/2 right-3 z-10 -translate-y-1/2 bg-white/90 p-2 text-zinc-900 shadow-[2px_2px_0_var(--ink)] transition-transform hover:scale-105 active:scale-95 sm:right-6 dark:bg-zinc-800/90 dark:text-zinc-100'
            )}
          >
            <ChevronRight className="h-6 w-6 stroke-3" />
          </button>
        )}
      </div>

      {/* Caption footer if provided */}
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
