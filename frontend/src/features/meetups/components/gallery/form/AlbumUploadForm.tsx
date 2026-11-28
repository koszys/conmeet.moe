'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Edit3, Images, Trash2, UploadCloud } from 'lucide-react';
import {
  Alert,
  BackLink,
  CharCounter,
  CloseButton,
  CONBLOCK,
  FormActions,
  TextArea,
  TextInput,
  UndoButton,
} from '@/shared/components/ui';
import { parseApiFieldErrors } from '@/shared/lib/errors';
import { cn } from '@/shared/lib/utils';
import { useCreateAlbum, useMeetup, useMeetupSettings, useUpdateAlbum } from '../../../api';
import type { MeetupAlbumDetail, MeetupPhoto, SocialLinks } from '../../../types';
import { SocialLinksField } from './SocialLinksField';

export interface AlbumUploadFormProps {
  conventionSlug: string;
  meetupId: number | string;
  initialData?: MeetupAlbumDetail;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface PhotoItem {
  id: string;
  file: File;
  previewUrl: string;
}

export function AlbumUploadForm({
  conventionSlug,
  meetupId,
  initialData,
  onSuccess,
  onCancel,
}: AlbumUploadFormProps) {
  const router = useRouter();
  const { data: meetup } = useMeetup(meetupId);
  const { data: meetupSettings } = useMeetupSettings();
  const isEditMode = Boolean(initialData);
  const isGalleryUnmounted =
    !isEditMode && (Boolean(meetup?.unmount_albums) || Boolean(meetupSettings?.unmount_all_albums));

  const createMutation = useCreateAlbum(meetupId);
  const updateMutation = useUpdateAlbum(initialData?.id ?? 0);

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(initialData?.social_links || {});
  const [existingPhotos] = useState<MeetupPhoto[]>(initialData?.photos || []);
  const [deletePhotoIds, setDeletePhotoIds] = useState<Set<number>>(new Set());
  const [newPhotos, setNewPhotos] = useState<PhotoItem[]>([]);

  // Validation & Error State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const newPhotosRef = useRef(newPhotos);
  newPhotosRef.current = newPhotos;

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      newPhotosRef.current.forEach((p) => {
        if (p.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(p.previewUrl);
        }
      });
    };
  }, []);

  const meetupSlugOrId = meetup?.slug || meetupId;
  const galleryHref = `/conventions/${conventionSlug}/meetups/${meetupSlugOrId}/gallery`;

  const activeExistingCount = existingPhotos.filter((p) => !deletePhotoIds.has(p.id)).length;
  const totalPhotosCount = activeExistingCount + newPhotos.length;

  const handleFilesAdded = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    if (errors.photos) {
      setErrors((prev) => ({ ...prev, photos: '' }));
    }

    const isImageFile = (file: File) =>
      file.type.startsWith('image/') || /\.(jpe?g|png|webp|heic|heif|gif)$/i.test(file.name);
    const validFiles = Array.from(fileList).filter(isImageFile);
    const potentialTotal = totalPhotosCount + validFiles.length;

    if (potentialTotal > 30) {
      setErrors((prev) => ({
        ...prev,
        photos: 'You can have a maximum of 30 photos per album.',
      }));
    }

    const availableSlots = Math.max(0, 30 - totalPhotosCount);
    const filesToAdd = validFiles.slice(0, availableSlots);

    const newItems: PhotoItem[] = filesToAdd.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setNewPhotos((prev) => [...prev, ...newItems]);

    // Reset file input value so re-selecting the same file triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFilesAdded(e.dataTransfer.files);
  };

  const removeNewPhoto = (id: string) => {
    setNewPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target && target.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((p) => p.id !== id);
    });

    if (errors.photos) {
      setErrors((prev) => ({ ...prev, photos: '' }));
    }
  };

  const markDeleteExistingPhoto = (photoId: number) => {
    setDeletePhotoIds((prev) => {
      const next = new Set(prev);
      next.add(photoId);
      return next;
    });

    if (errors.photos) {
      setErrors((prev) => ({ ...prev, photos: '' }));
    }
  };

  const restoreExistingPhoto = (photoId: number) => {
    if (totalPhotosCount >= 30) {
      setErrors((prev) => ({
        ...prev,
        photos: 'Cannot restore photo: maximum limit of 30 photos reached.',
      }));
      return;
    }

    setDeletePhotoIds((prev) => {
      const next = new Set(prev);
      next.delete(photoId);
      return next;
    });

    if (errors.photos) {
      setErrors((prev) => ({ ...prev, photos: '' }));
    }
  };

  const clearAllPhotos = () => {
    newPhotos.forEach((p) => {
      if (p.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(p.previewUrl);
      }
    });
    setNewPhotos([]);
    if (existingPhotos.length > 0) {
      setDeletePhotoIds(new Set(existingPhotos.map((p) => p.id)));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Album title is required';
    }

    if (totalPhotosCount === 0) {
      newErrors.photos = 'Please ensure this album contains at least 1 photo.';
    } else if (totalPhotosCount > 30) {
      newErrors.photos = 'You can have a maximum of 30 photos per album.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());

      // Filter empty social links
      const cleanedSocials: Record<string, string> = {};
      Object.entries(socialLinks).forEach(([k, v]) => {
        if (v && v.trim()) {
          cleanedSocials[k] = v.trim();
        }
      });
      formData.append('social_links', JSON.stringify(cleanedSocials));

      if (isEditMode) {
        if (deletePhotoIds.size > 0) {
          formData.append('delete_photo_ids', Array.from(deletePhotoIds).join(','));
        }
        newPhotos.forEach((item) => {
          formData.append('photos', item.file);
        });

        await updateMutation.mutateAsync(formData);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(galleryHref);
        }
      } else {
        newPhotos.forEach((item) => {
          formData.append('photos', item.file);
        });

        await createMutation.mutateAsync(formData);
        router.push(galleryHref);
      }
    } catch (err: unknown) {
      console.error('Failed to save album:', err);
      const fallback = isEditMode
        ? 'Failed to update album. Please try again.'
        : 'Failed to create album. Please verify your photo files and try again.';
      const parsed = await parseApiFieldErrors(err, fallback);
      const firstMessage = parsed.non_field_errors || Object.values(parsed)[0] || fallback;
      setServerError(firstMessage);
    }
  };

  if (isGalleryUnmounted) {
    return (
      <div className="border-ink border-2 bg-white p-6 shadow-[6px_6px_0_var(--ink)] sm:p-8 dark:bg-zinc-900">
        <div className="mb-4">
          <BackLink href={galleryHref}>Back to Gallery</BackLink>
        </div>
        <div className="py-8 text-center">
          <h2 className="font-display text-lg font-bold uppercase sm:text-xl">
            Uploads Unavailable
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Photo album uploads are currently disabled for this meetup.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <BackLink
        href={galleryHref}
        onClick={
          onCancel
            ? (e) => {
                e.preventDefault();
                onCancel();
              }
            : undefined
        }
      >
        {isEditMode
          ? 'Back to Album'
          : meetup?.name
            ? `Back to ${meetup.name} Gallery`
            : 'Back to Photo Gallery'}
      </BackLink>

      {/* Header */}
      <div className="border-ink border-b-2 pb-5">
        <div className="flex items-start gap-3">
          <div className="border-ink bg-accent-soft/25 mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center border-2 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800">
            {isEditMode ? (
              <Edit3 className="text-ink h-5 w-5 dark:text-zinc-100" />
            ) : (
              <Camera className="text-ink h-5 w-5 dark:text-zinc-100" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl tracking-wide uppercase min-[380px]:text-2xl sm:text-3xl">
              {isEditMode ? 'Edit Photo Album' : 'Upload Photo Album'}
            </h1>
            <p className="mt-0.5 text-xs text-zinc-600 sm:text-sm dark:text-zinc-300">
              {isEditMode
                ? 'Update your album title, notes, credits, and photos.'
                : 'Share your meetup shots, cosplay photos, and photographer credits.'}
            </p>
          </div>
        </div>
      </div>

      {serverError && (
        <Alert variant="error" className="p-4 text-sm shadow-[4px_4px_0_var(--ink)]">
          {serverError}
        </Alert>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="border-ink space-y-6 border-2 bg-white p-6 shadow-[6px_6px_0_var(--ink)] sm:p-8 dark:bg-zinc-900"
      >
        {/* Title */}
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="album-title"
              className="font-display block text-xs tracking-wider uppercase"
            >
              Album Title <span className="text-accent">*</span>
            </label>
            <CharCounter current={title.length} max={120} />
          </div>
          <TextInput
            id="album-title"
            maxLength={120}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            onClear={() => {
              setTitle('');
              setErrors((prev) => ({ ...prev, title: 'Album title is required' }));
            }}
            placeholder="e.g. Hatsune Miku Meetup Pics"
            error={Boolean(errors.title)}
            wrapperClassName="mt-1.5"
          />
          {errors.title && (
            <p className="mt-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
              {errors.title}
            </p>
          )}
        </div>

        {/* Photos */}
        <div>
          <div className="flex items-center justify-between">
            <label className="font-display block text-xs tracking-wider uppercase">
              Album Photos <span className="text-accent">*</span>
            </label>
            <span
              className={cn(
                'font-mono text-xs font-bold',
                totalPhotosCount >= 30
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-zinc-500 dark:text-zinc-200'
              )}
            >
              {totalPhotosCount} / 30 Photos
            </span>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'border-ink mt-1.5 border-2 bg-zinc-50/70 p-4 shadow-[3px_3px_0_var(--ink)] transition-colors sm:p-5 dark:bg-zinc-950/60',
              isDragging && 'border-accent bg-accent/10 dark:bg-accent/15',
              errors.photos && 'border-red-500 bg-red-50/40 dark:bg-red-950/20'
            )}
          >
            <input
              ref={fileInputRef}
              id="album-photos-input"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              onChange={(e) => handleFilesAdded(e.target.files)}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center text-center">
              <div className="border-ink bg-accent-soft/20 mb-3 flex h-12 w-12 items-center justify-center border-2 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800">
                <UploadCloud className="text-accent dark:text-accent-soft h-6 w-6" />
              </div>
              <h3 className="font-display text-sm font-bold tracking-wider uppercase">
                {isEditMode ? 'Add More Photos' : 'Select Photos to Upload'}
              </h3>
              <p className="mt-1 max-w-md text-xs text-zinc-600 dark:text-zinc-200">
                Choose up to 30 images (JPEG, PNG, WebP, Live Photos/HEIC). Drag & drop or browse
                files.
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={totalPhotosCount >= 30}
                className={cn(
                  CONBLOCK,
                  'bg-accent hover:bg-accent-pop mt-4 inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-950 dark:hover:text-white'
                )}
              >
                <Images className="h-4 w-4" />
                <span>Browse Files</span>
              </button>
            </div>

            {/* Photos List (Existing & New) */}
            {(existingPhotos.length > 0 || newPhotos.length > 0) && (
              <div className="border-ink mt-5 border-t-2 pt-4">
                <div className="flex items-start justify-between gap-2 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5">
                    <span className="font-display text-xs font-bold tracking-wider text-zinc-700 uppercase dark:text-zinc-300">
                      Photos ({totalPhotosCount})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={clearAllPhotos}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs font-bold whitespace-nowrap text-rose-600 hover:underline dark:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5 shrink-0" />
                    <span>Clear All</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {/* Existing Photos */}
                  {existingPhotos.map((photo) => {
                    const isMarkedDelete = deletePhotoIds.has(photo.id);
                    return (
                      <div
                        key={`existing-${photo.id}`}
                        className={cn(
                          'group relative aspect-square overflow-hidden',
                          isMarkedDelete
                            ? 'border-2 border-transparent bg-zinc-100 dark:bg-zinc-800'
                            : 'border-ink border-2 bg-zinc-100 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800'
                        )}
                      >
                        <img
                          src={photo.image_thumb || photo.image}
                          alt={photo.caption || 'Album photo'}
                          className={cn(
                            'h-full w-full object-cover',
                            isMarkedDelete && 'opacity-70 grayscale'
                          )}
                        />
                        {isMarkedDelete ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 p-1">
                            <UndoButton onClick={() => restoreExistingPhoto(photo.id)} size="xs" />
                          </div>
                        ) : (
                          <CloseButton
                            onClose={() => markDeleteExistingPhoto(photo.id)}
                            title="Remove photo"
                            ariaLabel="Remove photo"
                            className="absolute top-1 right-1 h-6 w-6 bg-white/95 shadow-[1px_1px_0_var(--ink)] dark:bg-zinc-900/95"
                          />
                        )}
                      </div>
                    );
                  })}

                  {/* New Photos */}
                  {newPhotos.map((item) => (
                    <div
                      key={`new-${item.id}`}
                      className="border-ink group relative aspect-square overflow-hidden border-2 bg-zinc-100 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800"
                    >
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="h-full w-full object-cover"
                      />
                      <CloseButton
                        onClose={() => removeNewPhoto(item.id)}
                        title="Remove photo"
                        ariaLabel="Remove photo"
                        className="absolute top-1 right-1 h-6 w-6 bg-white/95 shadow-[1px_1px_0_var(--ink)] dark:bg-zinc-900/95"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {errors.photos && (
            <p className="mt-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
              {errors.photos}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="album-description"
              className="font-display block text-xs tracking-wider uppercase"
            >
              Description & Notes (Optional)
            </label>
            <CharCounter current={description.length} max={1000} />
          </div>
          <TextArea
            id="album-description"
            rows={4}
            maxLength={1000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add photoshoot notes, rules for tagging, cosplayer credits, etc."
            className="mt-1.5"
          />
        </div>

        {/* Social Credits */}
        <SocialLinksField value={socialLinks} onChange={setSocialLinks} />

        {/* Form Actions */}
        <FormActions
          submitLabel={
            isEditMode ? (
              <>
                <span className="hidden sm:inline">Save Changes</span>
                <span className="sm:hidden">Save</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Publish Album</span>
                <span className="sm:hidden">Publish</span>
              </>
            )
          }
          submittingLabel={
            isEditMode ? (
              <>
                <span className="hidden sm:inline">Saving Changes...</span>
                <span className="sm:hidden">Saving...</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Uploading Photos...</span>
                <span className="sm:hidden">Uploading...</span>
              </>
            )
          }
          cancelHref={!onCancel ? galleryHref : undefined}
          onCancel={onCancel}
          isSubmitting={isEditMode ? updateMutation.isPending : createMutation.isPending}
          borderTop
        />
      </form>
    </div>
  );
}
