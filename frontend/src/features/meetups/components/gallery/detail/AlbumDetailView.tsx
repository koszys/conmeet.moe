'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Archive, CheckSquare, Clock, Download, Loader2, User as UserIcon } from 'lucide-react';
import {
  BackLink,
  BookmarkButton,
  CONBLOCK,
  CONBLOCK_PRIMARY,
  CONBLOCK_SECONDARY,
  CopyLinkButton,
  DeleteButton,
  EditButton,
  EmptyState,
  LikeButton,
  SocialBadges,
} from '@/shared/components/ui';
import { MikuLoader } from '@/shared/components/miku';
import { cn } from '@/shared/lib/utils';
import { useAuth } from '@/features/auth';
import { CommentSection } from '@/features/comments';
import {
  useAlbumDetail,
  useMeetup,
  useToggleFavoriteAlbum,
  useToggleLikeAlbum,
  useToggleLikePhoto,
} from '../../../api';
import { type DownloadProgress, downloadPhotosAsZip } from '../../../utils/downloadZip';
import { PhotoLightbox } from './PhotoLightbox';
import { DeleteAlbumModal } from './DeleteAlbumModal';
import { AlbumUploadForm } from '../form/AlbumUploadForm';
import { AlbumPhotoCard } from './AlbumPhotoCard';
import { AlbumSelectionBar } from './AlbumSelectionBar';

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

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);

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

  if (isEditing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <AlbumUploadForm
          conventionSlug={conventionSlug}
          meetupId={meetupId}
          initialData={album}
          onSuccess={() => {
            setIsEditing(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onCancel={() => {
            setIsEditing(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
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
    <div
      className={cn(
        'mx-auto max-w-6xl space-y-6 px-4 py-8 transition-all sm:px-6',
        isSelectMode && 'pb-24 sm:pb-28'
      )}
    >
      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackLink href={galleryHref}>
          {meetup?.name ? `Back to ${meetup.name} Gallery` : 'Back to Photo Gallery'}
        </BackLink>

        {/* Actions */}
        {isOwnerOrAdmin && (
          <div className="flex items-center gap-2">
            <EditButton
              variant="button"
              onClick={() => setIsEditing(true)}
              title="Edit Album"
              ariaLabel="Edit Album"
            />
            <DeleteButton
              variant="button"
              colorStyle="danger-solid"
              onClick={() => setIsDeleteOpen(true)}
              title="Delete Album"
              ariaLabel="Delete Album"
            />
          </div>
        )}
      </div>

      {/* Header Card */}
      <section className="border-ink space-y-4 border-2 bg-white p-6 shadow-[6px_6px_0_var(--ink)] sm:p-8 dark:bg-zinc-900">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {meetup && (
              <Link
                href={`/conventions/${conventionSlug}/meetups/${meetupSlugOrId}`}
                className={cn(
                  CONBLOCK,
                  'hover:text-accent dark:hover:text-accent inline-flex items-center gap-1 bg-zinc-100 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-zinc-800 uppercase dark:bg-zinc-800 dark:text-zinc-200'
                )}
              >
                {meetup.name}
              </Link>
            )}
            <span className="border-ink bg-accent/15 dark:bg-accent/25 inline-flex items-center gap-1 border-2 px-2 py-0.5 text-[11px] font-black tracking-wider text-zinc-950 uppercase shadow-[2px_2px_0_var(--ink)] dark:text-zinc-50">
              <Archive className="text-accent h-3 w-3" />
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

        {/* Social Credits */}
        {album.social_links && Object.keys(album.social_links).length > 0 && (
          <div className="border-t border-zinc-200 pt-2 dark:border-zinc-800">
            <span className="font-display mb-2 block text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              Social Credits
            </span>
            <SocialBadges links={album.social_links} />
          </div>
        )}

        {/* Description */}
        {album.description && (
          <div className="border-t border-zinc-200 pt-2 text-sm leading-relaxed text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
            <p className="whitespace-pre-line">{album.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2.5 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <LikeButton
            variant="responsive"
            isLiked={album.is_liked}
            count={album.likes_count}
            onClick={handleToggleLikeAlbum}
            title={album.is_liked ? 'Liked' : 'Like Album'}
            ariaLabel={album.is_liked ? 'Liked' : 'Like Album'}
            className="h-9 sm:h-10"
          />

          <BookmarkButton
            variant="responsive"
            isSaved={album.is_favorited}
            onClick={handleToggleFavoriteAlbum}
            savedLabel="Saved"
            unsavedLabel="Save"
            className="h-9 sm:h-10"
          />

          <CopyLinkButton variant="responsive" className="h-9 sm:h-10" />
        </div>
      </section>

      {/* Toolbar */}
      <div className="border-ink flex flex-wrap items-center justify-between gap-3 border-b-2 pb-4">
        <h2 className="font-display text-lg tracking-wide uppercase sm:text-xl">
          Photos ({photos.length})
        </h2>

        <div className="flex items-center gap-2">
          {photos.length > 0 && (
            <button
              type="button"
              onClick={() => handleDownloadZip(photos)}
              disabled={Boolean(downloadProgress)}
              className={cn(
                CONBLOCK_SECONDARY,
                'inline-flex h-9 items-center gap-1.5 px-3 text-xs font-bold uppercase disabled:opacity-60'
              )}
            >
              {downloadProgress ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>
                    {downloadProgress.status === 'compressing'
                      ? 'Packaging...'
                      : `${downloadProgress.current}/${downloadProgress.total}`}
                  </span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download ZIP</span>
                  <span className="sm:hidden">ZIP</span>
                </>
              )}
            </button>
          )}

          {photos.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setIsSelectMode((prev) => !prev);
                setSelectedPhotoIds(new Set());
              }}
              className={cn(
                CONBLOCK,
                'inline-flex h-9 items-center gap-1.5 px-3 text-xs font-bold uppercase transition-all',
                isSelectMode
                  ? 'hover:border-accent-pop hover:text-accent-pop dark:hover:border-accent-pop dark:hover:text-accent-pop bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
                  : 'hover:border-accent-pop hover:text-accent-pop dark:hover:border-accent-pop dark:hover:text-accent-pop bg-white text-zinc-800 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800'
              )}
            >
              <CheckSquare className="h-3.5 w-3.5" />
              <span>{isSelectMode ? 'Exit Selection' : 'Select Photos'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <EmptyState
          title="No Photos in Album"
          description="This album does not have any uploaded photos yet."
        />
      ) : (
        <div className="grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 sm:gap-4 md:grid-cols-3">
          {photos.map((photo, idx) => (
            <AlbumPhotoCard
              key={photo.id}
              photo={photo}
              index={idx}
              albumTitle={album.title}
              isSelectMode={isSelectMode}
              isSelected={selectedPhotoIds.has(photo.id)}
              onSelect={handleTogglePhotoSelect}
              onOpenLightbox={(index) => setLightboxIndex(index)}
              onToggleLike={(photoId) => {
                if (!user) {
                  window.location.href = `/login?redirect=/conventions/${conventionSlug}/meetups/${meetupSlugOrId}/gallery/${album.id}`;
                  return;
                }
                toggleLikePhoto.mutate({ photoId, albumId: album.id });
              }}
            />
          ))}
        </div>
      )}

      {/* Comments Section */}
      <CommentSection
        targetType="album"
        targetId={album.id}
        isUnmounted={album.unmount_comments}
        className="mt-8 border-t-2 border-zinc-200 pt-8 dark:border-zinc-800"
      />

      {/* Selection Bar */}
      {isSelectMode && (
        <AlbumSelectionBar
          selectedCount={selectedPhotoIds.size}
          totalCount={photos.length}
          isAllSelected={selectedPhotoIds.size === photos.length}
          onToggleSelectAll={handleSelectAll}
          onDownload={() => handleDownloadZip(selectedPhotos)}
          isPackaging={Boolean(downloadProgress)}
          onDone={() => {
            setIsSelectMode(false);
            setSelectedPhotoIds(new Set());
          }}
        />
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          key={lightboxIndex}
          photos={photos}
          initialIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          albumTitle={album.title}
          conventionSlug={conventionSlug}
          meetupSlugOrId={meetupSlugOrId}
        />
      )}

      {/* Delete Modal */}
      <DeleteAlbumModal
        album={album}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={() => router.push(galleryHref)}
      />
    </div>
  );
}
