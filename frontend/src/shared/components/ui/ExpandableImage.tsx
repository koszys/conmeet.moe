'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/shared/lib/utils';
import { ImageLightbox } from './ImageLightbox';

export interface ExpandableImageProps {
  /** Full-size image URL opened in the lightbox */
  src: string;
  /** Optional thumbnail/preview URL for the trigger (defaults to src) */
  thumbnailSrc?: string;
  /** Accessible alt text for the image */
  alt: string;

  /** Title tooltip for the trigger */
  title?: string;
  /** Custom aria-label for the trigger */
  ariaLabel?: string;
  /** Additional classes applied to the trigger container */
  className?: string;
  /** Additional classes applied to the inner <Image> when auto-rendered */
  imageClassName?: string;

  /** Next.js Image fill layout for the trigger preview */
  fill?: boolean;
  /** Next.js Image width if not using fill */
  width?: number;
  /** Next.js Image height if not using fill */
  height?: number;
  /** Next.js Image priority loading */
  priority?: boolean;
  /** Next.js Image sizes attribute */
  sizes?: string;
  /** Next.js Image unoptimized flag */
  unoptimized?: boolean;

  /** Title displayed in the lightbox header */
  lightboxTitle?: string;
  /** Subtitle displayed in the lightbox header */
  lightboxSubtitle?: React.ReactNode;
  /** Optional action buttons in the lightbox header */
  lightboxActions?: React.ReactNode;

  /** Disables the click-to-expand trigger */
  disabled?: boolean;
  /** Whether to stop event propagation on click (defaults to true) */
  stopPropagation?: boolean;

  /**
   * Optional custom children rendered inside the trigger container
   * (e.g. ambient backdrops, badge overlays, camera icons).
   * If omitted, renders a standard Next.js <Image /> automatically.
   */
  children?: React.ReactNode;
}

export function ExpandableImage({
  src,
  thumbnailSrc,
  alt,
  title = 'Click to expand image',
  ariaLabel,
  className,
  imageClassName,
  fill = true,
  width,
  height,
  priority = false,
  sizes,
  unoptimized = false,
  lightboxTitle,
  lightboxSubtitle,
  lightboxActions,
  disabled = false,
  stopPropagation = true,
  children,
}: ExpandableImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const displaySrc = thumbnailSrc || src;

  const handleOpen = (e: React.SyntheticEvent) => {
    if (disabled || !src) return;
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || !src) return;
    if (e.key === 'Enter' || e.key === ' ') {
      if (stopPropagation) {
        e.preventDefault();
        e.stopPropagation();
      }
      setIsOpen(true);
    }
  };

  return (
    <>
      <div
        role={disabled ? undefined : 'button'}
        tabIndex={disabled ? -1 : 0}
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        title={disabled ? undefined : title}
        aria-label={disabled ? undefined : ariaLabel || title || `Expand ${alt}`}
        className={cn(
          !disabled &&
            'focus-visible:ring-accent-pop cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          className
        )}
      >
        {children ? (
          children
        ) : displaySrc ? (
          <Image
            src={displaySrc}
            alt={alt}
            fill={fill}
            width={!fill ? width : undefined}
            height={!fill ? height : undefined}
            priority={priority}
            sizes={sizes}
            unoptimized={unoptimized}
            className={imageClassName}
          />
        ) : null}
      </div>

      {src ? (
        <ImageLightbox
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          src={src}
          alt={alt}
          title={lightboxTitle}
          subtitle={lightboxSubtitle}
          actions={lightboxActions}
        />
      ) : null}
    </>
  );
}
