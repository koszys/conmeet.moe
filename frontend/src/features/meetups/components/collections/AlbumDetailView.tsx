'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Archive,
  Bookmark,
  Check,
  CheckSquare,
  Clock,
  Download,
  Heart,
  Loader2,
  Maximize2,
  Trash2,
  User as UserIcon,
} from 'lucide-react';
import {
  BackLink,
  CONBLOCK,
  CONBLOCK_PRIMARY,
  CONBLOCK_SECONDARY,
  CopyLinkButton,
  EmptyState,
} from '@/shared/components/ui';
import { MikuLoader } from '@/shared/components/miku';
import { cn } from '@/shared/lib/utils';
import { useAuth } from '@/features/auth';
import {
  useAlbumDetail,
  useMeetup,
  useToggleFavoriteAlbum,
  useToggleLikeAlbum,
  useToggleLikePhoto,
} from '../../api';
import { type DownloadProgress, downloadPhotosAsZip } from '../../utils/downloadZip';
import { SocialBadges } from './SocialLinksField';
import { PhotoLightbox } from './PhotoLightbox';
import { DeleteAlbumModal } from './DeleteAlbumModal';

export interface AlbumDetailViewProps {
  conventionSlug: string;
  meetupId: number | string;
  albumId: number | string;
}

export function AlbumDetailView({ conventionSlug, meetupId, albumId }: AlbumDetailViewProps) {
  const router = useRouter();
  const { user } = useAuth();

  const { data: meetup } = useMeetup(meetupId);
  const { data: album, isLoading, isError } = useAlbumDetail(albumId);

  const toggleLikeAlbum = useToggleLikeAlbum();
  const toggleFavoriteAlbum = useToggleFavoriteAlbum();
  const toggleLikePhoto = useToggleLikePhoto();

  // Selection mode state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<number>>(new Set());

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // ZIP Download progress state
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);

  const meetupSlugOrId = album?.meetup_slug || meetup?.slug || meetupId;
  const galleryHref = `/conventions/${conventionSlug}/meetups/${meetupSlugOrId}/gallery`;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center py-16">
        <MikuLoader message="Loading photo album..." size="lg" />
      </div>
    );
  }

  if (isError || !album) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <EmptyState
          title="Album Not Found"
          description="The photo album you are looking for does not exist or has been removed."
          action={
            <Link
              href={galleryHref}
              className={cn(
                CONBLOCK_PRIMARY,
                'inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase'
              )}
            >
              Back to Photo Gallery
            </Link>
          }
        />
      </div>
    );
  }

  const isOwnerOrAdmin = Boolean(
    user && (album.is_owner || user.role === 'admin' || user.id === album.created_by)
  );

  const photos = album.photos || [];

  const handleToggleLikeAlbum = () => {
    if (!user) {
      window.location.href = `/login?redirect=/conventions/${conventionSlug}/meetups/${meetupSlugOrId}/gallery/${album.id}`;
      return;
    }
    toggleLikeAlbum.mutate(album.id);
  };

  const handleToggleFavoriteAlbum = () => {
    if (!user) {
      window.location.href = `/login?redirect=/conventions/${conventionSlug}/meetups/${meetupSlugOrId}/gallery/${album.id}`;
      return;
    }
    toggleFavoriteAlbum.mutate(album.id);
  };

  const handleTogglePhotoSelect = (photoId: number) => {
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedPhotoIds.size === photos.length) {
      setSelectedPhotoIds(new Set());
    } else {
      setSelectedPhotoIds(new Set(photos.map((p) => p.id)));
    }
  };

  // ZIP Download helper
  const handleDownloadZip = async (targetPhotos = photos) => {
    if (!targetPhotos.length || downloadProgress) return;

    try {
      const sanitizedTitle = album.title.replace(/[^a-zA-Z0-9_-]/g, '_');
      await downloadPhotosAsZip({
        photos: targetPhotos.map((p, idx) => ({
          id: p.id,
          url: p.image,
          name: `${sanitizedTitle}_${String(idx + 1).padStart(3, '0')}`,
        })),
        zipFilename: `${sanitizedTitle}_photos.zip`,
        onProgress: (p) => setDownloadProgress(p),
      });

      // Clear progress after short delay
      setTimeout(() => {
        setDownloadProgress(null);
      }, 1500);
    } catch (err) {
      console.error('Download failed:', err);
      setDownloadProgress(null);
    }
  };

  const selectedPhotos = photos.filter((p) => selectedPhotoIds.has(p.id));

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      {/* Top Navigation Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackLink href={galleryHref}>
          {meetup?.name ? `Back to ${meetup.name} Gallery` : 'Back to Photo Gallery'}
        </BackLink>

        {/* Action button cluster */}
        <div className="flex flex-wrap items-center gap-2">
          <CopyLinkButton variant="responsive" />

          {/* Like button */}
          <button
            type="button"
            onClick={handleToggleLikeAlbum}
            title={album.is_liked ? 'Liked' : 'Like Album'}
            className={cn(
              'inline-flex h-10 items-center gap-1.5 px-3 text-xs font-bold tracking-wider uppercase transition-all sm:px-3.5',
              album.is_liked
                ? 'border-accent bg-accent text-white dark:text-zinc-950'
                : CONBLOCK_SECONDARY
            )}
          >
            <Heart
              className={cn(
                'h-4 w-4',
                album.is_liked ? 'fill-current text-white dark:text-zinc-950' : 'text-zinc-600'
              )}
            />
            <span>{album.likes_count}</span>
          </button>

          {/* Favorite bookmark button */}
          <button
            type="button"
            onClick={handleToggleFavoriteAlbum}
            title={album.is_favorited ? 'Bookmarked' : 'Bookmark Album'}
            className={cn(
              'inline-flex h-10 items-center gap-1.5 px-3 text-xs font-bold tracking-wider uppercase transition-all sm:px-3.5',
              album.is_favorited
                ? 'border-accent-pop bg-accent-pop text-white dark:text-zinc-950'
                : CONBLOCK_SECONDARY
            )}
          >
            <Bookmark
              className={cn(
                'h-4 w-4',
                album.is_favorited ? 'fill-current text-white dark:text-zinc-950' : 'text-zinc-600'
              )}
            />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Download All (ZIP) button */}
          <button
            type="button"
            onClick={() => handleDownloadZip(photos)}
            disabled={Boolean(downloadProgress) || photos.length === 0}
            className={cn(
              CONBLOCK_SECONDARY,
              'inline-flex h-10 items-center gap-1.5 px-3 text-xs font-bold tracking-wider uppercase disabled:opacity-60 sm:px-3.5'
            )}
          >
            {downloadProgress ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  {downloadProgress.status === 'compressing'
                    ? 'Packaging...'
                    : `${downloadProgress.current}/${downloadProgress.total}`}
                </span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download ZIP</span>
                <span className="sm:hidden">ZIP</span>
              </>
            )}
          </button>

          {/* Delete button if author/admin */}
          {isOwnerOrAdmin && (
            <button
              type="button"
              onClick={() => setIsDeleteOpen(true)}
              title="Delete Album"
              className={cn(
                CONBLOCK,
                'border-ink inline-flex h-10 items-center gap-1.5 bg-rose-50 px-3 text-xs font-bold text-rose-700 shadow-[2px_2px_0_var(--ink)] hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
              )}
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Album Header Card */}
      <section className="border-ink space-y-4 border-2 bg-white p-6 shadow-[6px_6px_0_var(--ink)] sm:p-8 dark:bg-zinc-900">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {meetup && (
              <Link
                href={`/conventions/${conventionSlug}/meetups/${meetupSlugOrId}`}
                className="border-ink inline-flex items-center gap-1 border-2 bg-zinc-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-zinc-700 uppercase shadow-[2px_2px_0_var(--ink)] transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {meetup.name}
              </Link>
            )}
            <span className="border-ink bg-accent/15 text-accent dark:bg-accent/25 inline-flex items-center gap-1 border-2 px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase shadow-[2px_2px_0_var(--ink)]">
              <Archive className="h-3 w-3" />
              <span>
                {photos.length} {photos.length === 1 ? 'Photo' : 'Photos'}
              </span>
            </span>
          </div>

          <h1 className="font-display mt-3 text-2xl font-bold tracking-wide uppercase sm:text-3xl md:text-4xl">
            {album.title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5" />
              <span>{album.created_by_name || 'Anonymous Attendee'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {new Date(album.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
              </span>
            </span>
          </div>
        </div>

        {/* Social media links if provided */}
        {album.social_links && Object.keys(album.social_links).length > 0 && (
          <div className="border-t border-zinc-200 pt-2 dark:border-zinc-800">
            <span className="font-display mb-2 block text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              Photographer & Social Credits
            </span>
            <SocialBadges links={album.social_links} />
          </div>
        )}

        {/* Description text */}
        {album.description && (
          <div className="border-t border-zinc-200 pt-2 text-sm leading-relaxed text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
            <p className="whitespace-pre-line">{album.description}</p>
          </div>
        )}
      </section>

      {/* Photos Grid Toolbar */}
      <div className="border-ink flex flex-wrap items-center justify-between gap-3 border-b-2 pb-4">
        <h2 className="font-display text-lg tracking-wide uppercase sm:text-xl">
          Photos ({photos.length})
        </h2>

        <div className="flex items-center gap-2">
          {photos.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setIsSelectMode((prev) => !prev);
                setSelectedPhotoIds(new Set());
              }}
              className={cn(
                'inline-flex h-9 items-center gap-1.5 px-3 text-xs font-bold uppercase transition-all',
                isSelectMode
                  ? 'border-ink border-2 bg-zinc-900 text-white shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-100 dark:text-zinc-900'
                  : CONBLOCK_SECONDARY
              )}
            >
              <CheckSquare className="h-3.5 w-3.5" />
              <span>{isSelectMode ? 'Exit Selection' : 'Select Photos'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Photos Grid */}
      {photos.length === 0 ? (
        <EmptyState
          title="No Photos in Album"
          description="This album does not have any uploaded photos yet."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {photos.map((photo, idx) => {
            const isSelected = selectedPhotoIds.has(photo.id);

            return (
              <div
                key={photo.id}
                onClick={() => {
                  if (isSelectMode) {
                    handleTogglePhotoSelect(photo.id);
                  } else {
                    setLightboxIndex(idx);
                  }
                }}
                className={cn(
                  'border-ink group relative aspect-square cursor-pointer overflow-hidden border-2 bg-zinc-100 shadow-[3px_3px_0_var(--ink)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)] dark:bg-zinc-800',
                  isSelected && 'ring-accent ring-4 ring-offset-2'
                )}
              >
                {/* Photo image */}
                <Image
                  src={photo.image_thumb || photo.image}
                  alt={photo.caption || `${album.title} - Photo ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Selection Checkbox Badge */}
                {isSelectMode ? (
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <div
                      className={cn(
                        'border-ink flex h-6 w-6 items-center justify-center border-2 transition-colors',
                        isSelected
                          ? 'border-accent bg-accent text-white dark:text-zinc-950'
                          : 'border-white bg-white/90 text-transparent shadow-[2px_2px_0_rgba(0,0,0,0.5)]'
                      )}
                    >
                      <Check className="h-4 w-4 stroke-3" />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Hover Overlay with Lightbox Indicator */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-zinc-950/20 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="border-ink bg-white/95 p-2 text-zinc-900 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800/95 dark:text-zinc-100">
                        <Maximize2 className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Bottom overlay: Photo likes */}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!user) {
                            window.location.href = `/login?redirect=/conventions/${conventionSlug}/meetups/${meetupSlugOrId}/gallery/${album.id}`;
                            return;
                          }
                          toggleLikePhoto.mutate({ photoId: photo.id, albumId: album.id });
                        }}
                        className={cn(
                          'border-ink inline-flex items-center gap-1 rounded-sm border border-black/40 px-2 py-0.5 text-xs font-bold shadow-[1px_1px_0_rgba(0,0,0,0.5)] transition-transform hover:scale-105',
                          photo.is_liked
                            ? 'bg-accent text-white dark:text-zinc-950'
                            : 'bg-white/90 text-zinc-800 dark:bg-zinc-800/90 dark:text-zinc-200'
                        )}
                      >
                        <Heart className={cn('h-3 w-3', photo.is_liked && 'fill-current')} />
                        <span>{photo.likes_count}</span>
                      </button>

                      <span className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white/90">
                        #{idx + 1}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Bar in Selection Mode */}
      {isSelectMode && (
        <div className="border-ink fixed inset-x-4 bottom-6 z-40 mx-auto max-w-xl border-2 bg-white p-3.5 shadow-[6px_6px_0_var(--ink)] sm:px-6 sm:py-4 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-xs font-bold tracking-wider uppercase sm:text-sm">
                {selectedPhotoIds.size} / {photos.length} Selected
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-accent ml-1 text-xs font-bold uppercase hover:underline"
              >
                {selectedPhotoIds.size === photos.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownloadZip(selectedPhotos)}
                disabled={selectedPhotoIds.size === 0 || Boolean(downloadProgress)}
                className={cn(
                  CONBLOCK_PRIMARY,
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wider uppercase disabled:opacity-50'
                )}
              >
                {downloadProgress ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Packaging...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    <span>Download ({selectedPhotoIds.size})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsSelectMode(false)}
                className={cn(CONBLOCK_SECONDARY, 'px-3 py-1.5 text-xs font-bold uppercase')}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          albumTitle={album.title}
          conventionSlug={conventionSlug}
          meetupSlugOrId={meetupSlugOrId}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteAlbumModal
        album={album}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={() => router.push(galleryHref)}
      />
    </div>
  );
}
