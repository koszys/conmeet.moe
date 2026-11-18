'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';
import { LikeButton } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import type { MeetupPhoto } from '../../types';

export interface AlbumPhotoCardProps {
  photo: MeetupPhoto;
  index: number;
  albumTitle: string;
  isSelectMode: boolean;
  isSelected: boolean;
  onSelect: (photoId: number) => void;
  onOpenLightbox: (index: number) => void;
  onToggleLike: (photoId: number) => void;
}

export function AlbumPhotoCard({
  photo,
  index,
  albumTitle,
  isSelectMode,
  isSelected,
  onSelect,
  onOpenLightbox,
  onToggleLike,
}: AlbumPhotoCardProps) {
  return (
    <div
      onClick={() => {
        if (isSelectMode) {
          onSelect(photo.id);
        } else {
          onOpenLightbox(index);
        }
      }}
      className={cn(
        'group relative aspect-square overflow-hidden border-2 transition-all',
        isSelectMode ? 'cursor-pointer' : 'cursor-zoom-in',
        isSelectMode && isSelected
          ? 'border-accent ring-accent -translate-y-1 shadow-[4px_4px_0_var(--accent)] ring-2'
          : 'border-ink bg-zinc-100 shadow-[3px_3px_0_var(--ink)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)] dark:bg-zinc-800'
      )}
    >
      {/* Photo Image */}
      <Image
        src={photo.image_thumb || photo.image}
        alt={photo.caption || `${albumTitle} - Photo ${index + 1}`}
        fill
        sizes="(max-width: 380px) 100vw, (max-width: 768px) 50vw, 33vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Selected Tint Overlay */}
      {isSelectMode && isSelected && (
        <div className="bg-accent/15 pointer-events-none absolute inset-0 z-[5]" />
      )}

      {/* Selection Checkbox */}
      {isSelectMode ? (
        <div className="absolute top-2.5 left-2.5 z-10">
          <div
            className={cn(
              'border-ink flex h-6 w-6 items-center justify-center border-2 transition-all',
              isSelected
                ? 'border-ink bg-accent text-white shadow-[2px_2px_0_var(--ink)] dark:text-zinc-950'
                : 'border-ink bg-white/95 text-transparent shadow-[2px_2px_0_var(--ink)] group-hover:text-zinc-400 dark:bg-zinc-900/95'
            )}
          >
            <Check className="h-3.5 w-3.5 stroke-[3.5]" />
          </div>
        </div>
      ) : (
        /* Default Bottom Overlay: Like & Index */
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-2">
          <LikeButton
            variant="badge"
            isLiked={photo.is_liked}
            count={photo.likes_count}
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike(photo.id);
            }}
            title={photo.is_liked ? 'Unlike Photo' : 'Like Photo'}
            ariaLabel={photo.is_liked ? 'Unlike Photo' : 'Like Photo'}
            className="px-2 py-0.5 text-xs"
          />

          <span className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white/90">
            #{index + 1}
          </span>
        </div>
      )}
    </div>
  );
}
