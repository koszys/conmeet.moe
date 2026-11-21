'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Camera, User } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { Badge, BookmarkButton, LikeButton } from '@/shared/components/ui';
import { useToggleFavoriteAlbum, useToggleLikeAlbum } from '../../../api';
import type { MeetupAlbum } from '../../../types';

export interface AlbumCardProps {
  album: MeetupAlbum;
  conventionSlug: string;
  meetupId: number | string;
}

export function AlbumCard({ album, conventionSlug, meetupId }: AlbumCardProps) {
  const { user } = useAuth();
  const toggleLike = useToggleLikeAlbum();
  const toggleFavorite = useToggleFavoriteAlbum();

  const meetupSlugOrId = album.meetup_slug || meetupId;

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = `/login?redirect=/conventions/${conventionSlug}/meetups/${meetupSlugOrId}`;
      return;
    }
    toggleLike.mutate(album.id);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = `/login?redirect=/conventions/${conventionSlug}/meetups/${meetupSlugOrId}`;
      return;
    }
    toggleFavorite.mutate(album.id);
  };

  const albumHref = `/conventions/${conventionSlug}/meetups/${meetupSlugOrId}/gallery/${album.id}`;
  const previewPhotos = album.preview_photos || [];

  return (
    <article className="border-ink group relative flex flex-col border-2 bg-white shadow-[4px_4px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-900">
      {/* Navigation Link */}
      <Link
        href={albumHref}
        aria-label={`View album: ${album.title}`}
        className="absolute inset-x-0 top-0 bottom-14 z-0 cursor-pointer"
      />

      {/* Preview */}
      <div className="border-ink pointer-events-none relative aspect-[16/10] w-full overflow-hidden border-b-2 bg-zinc-100 dark:bg-zinc-800">
        {previewPhotos.length === 0 ? (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-zinc-400 dark:text-zinc-500">
            <Camera className="h-10 w-10 opacity-30" />
            <span className="font-display mt-2 text-[11px] tracking-wider uppercase opacity-60">
              Photoshoot Album
            </span>
          </div>
        ) : previewPhotos.length === 1 ? (
          <Image
            src={previewPhotos[0]}
            alt={album.title}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : previewPhotos.length === 2 ? (
          <div className="grid h-full w-full grid-cols-2 gap-0.5 bg-zinc-900">
            {previewPhotos.map((src, i) => (
              <div key={i} className="relative h-full w-full overflow-hidden bg-zinc-950">
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        ) : previewPhotos.length === 3 ? (
          <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5 bg-zinc-900">
            <div className="relative row-span-2 h-full w-full overflow-hidden bg-zinc-950">
              <Image
                src={previewPhotos[0]}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 20vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            {previewPhotos.slice(1, 3).map((src, i) => (
              <div key={i} className="relative h-full w-full overflow-hidden bg-zinc-950">
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 15vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5 bg-zinc-900">
            {previewPhotos.slice(0, 4).map((src, i) => (
              <div key={i} className="relative h-full w-full overflow-hidden bg-zinc-950">
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 15vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}

        {/* Count Badge */}
        <div className="absolute top-2.5 right-2.5">
          <Badge
            variant="default"
            size="sm"
            className="border-ink border bg-white/95 font-mono text-[11px] font-bold shadow-[1px_1px_0_var(--ink)] backdrop-blur-xs dark:bg-zinc-900/95"
          >
            {album.photos_count} {album.photos_count === 1 ? 'photo' : 'photos'}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="pointer-events-none flex flex-1 flex-col p-3 sm:p-4">
        {/* Title */}
        <h3 className="font-display group-hover:text-accent-pop line-clamp-1 text-sm leading-snug tracking-wide uppercase transition-colors sm:text-base">
          {album.title}
        </h3>

        {/* Description */}
        {album.description && (
          <p className="mt-1 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-300">
            {album.description}
          </p>
        )}

        {/* Creator */}
        <div className="mt-2 mb-2.5 flex items-center gap-1.5 text-[11px] text-zinc-500 sm:mt-2.5 sm:mb-3 dark:text-zinc-300">
          <User className="h-3 w-3 shrink-0 text-zinc-500 dark:text-zinc-400" />
          <span className="truncate">
            Photos by{' '}
            <strong className="font-semibold text-zinc-800 dark:text-zinc-200">
              @{album.created_by_name || 'Attendee'}
            </strong>
          </span>
        </div>

        {/* Actions */}
        <div className="pointer-events-auto relative z-10 mt-auto flex items-center justify-between border-t border-zinc-200 pt-2.5 sm:pt-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <LikeButton
              variant="badge"
              isLiked={album.is_liked}
              count={album.likes_count}
              onClick={handleToggleLike}
            />

            <BookmarkButton
              variant="icon"
              isSaved={album.is_favorited}
              onClick={handleToggleFavorite}
              title={album.is_favorited ? 'Remove from favorites' : 'Favorite album'}
              ariaLabel={album.is_favorited ? 'Remove from favorites' : 'Favorite album'}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
