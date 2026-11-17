'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Camera, Images, Trash2, UploadCloud } from 'lucide-react';
import {
  BackLink,
  CharCounter,
  CloseButton,
  CONBLOCK,
  FormActions,
  TextArea,
  TextInput,
} from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { useCreateAlbum, useMeetup } from '../../api';
import type { SocialLinks } from '../../types';
import { SocialLinksField } from './SocialLinksField';

export interface AlbumUploadFormProps {
  conventionSlug: string;
  meetupId: number | string;
}

interface PhotoItem {
  id: string;
  file: File;
  previewUrl: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function AlbumUploadForm({ conventionSlug, meetupId }: AlbumUploadFormProps) {
  const router = useRouter();
  const { data: meetup } = useMeetup(meetupId);
  const createMutation = useCreateAlbum(meetupId);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  // Validation & Error State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      photos.forEach((p) => {
        if (p.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(p.previewUrl);
        }
      });
    };
  }, [photos]);

  const meetupSlugOrId = meetup?.slug || meetupId;
  const galleryHref = `/conventions/${conventionSlug}/meetups/${meetupSlugOrId}/gallery`;

  const handleFilesAdded = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    if (errors.photos) {
      setErrors((prev) => ({ ...prev, photos: '' }));
    }

    const newFiles = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    const totalCount = photos.length + newFiles.length;

    if (totalCount > 30) {
      setErrors((prev) => ({
        ...prev,
        photos: 'You can upload a maximum of 30 photos per album.',
      }));
    }

    const availableSlots = Math.max(0, 30 - photos.length);
    const filesToAdd = newFiles.slice(0, availableSlots);

    const newItems: PhotoItem[] = filesToAdd.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...newItems]);

    // Reset file input value so re-selecting the same file triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
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

  const clearAllPhotos = () => {
    photos.forEach((p) => {
      if (p.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(p.previewUrl);
      }
    });
    setPhotos([]);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Album title is required';
    }

    if (photos.length === 0) {
      newErrors.photos = 'Please select at least 1 photo for this album.';
    } else if (photos.length > 30) {
      newErrors.photos = 'You can upload a maximum of 30 photos per album.';
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

      photos.forEach((item) => {
        formData.append('photos', item.file);
      });

      await createMutation.mutateAsync(formData);
      router.push(galleryHref);
    } catch (err: unknown) {
      console.error('Failed to create album:', err);
      let message = 'Failed to create album. Please verify your photo files and try again.';
      if (err && typeof err === 'object' && 'response' in err) {
        try {
          const res = err as { response: Response };
          const data = await res.response.json();
          if (data && typeof data === 'object') {
            const firstError = Object.values(data)[0];
            if (Array.isArray(firstError)) {
              message = firstError[0];
            } else if (typeof firstError === 'string') {
              message = firstError;
            }
          }
        } catch {
          // Fall back to default error message
        }
      }
      setServerError(message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <BackLink href={galleryHref}>
        {meetup?.name ? `Back to ${meetup.name} Gallery` : 'Back to Photo Gallery'}
      </BackLink>

      {/* Header */}
      <div className="border-ink border-b-2 pb-5">
        <div className="flex items-start gap-3">
          <div className="border-ink bg-accent-soft/25 mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center border-2 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800">
            <Camera className="text-ink h-5 w-5 dark:text-zinc-100" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl tracking-wide uppercase min-[380px]:text-2xl sm:text-3xl">
              Upload Photo Album
            </h1>
            <p className="mt-0.5 text-xs text-zinc-600 sm:text-sm dark:text-zinc-300">
              Share your meetup shots, cosplay photos, and photographer credits.
            </p>
          </div>
        </div>
      </div>

      {serverError && (
        <div className="border-ink flex items-start gap-3 border-2 bg-red-50 p-4 text-sm font-semibold text-red-700 shadow-[4px_4px_0_var(--ink)] dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Main Form Box matching MeetupForm */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="border-ink space-y-6 border-2 bg-white p-6 shadow-[6px_6px_0_var(--ink)] sm:p-8 dark:bg-zinc-900"
      >
        {/* Album Title */}
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
            placeholder="e.g. Friday Cosplay Gathering, Sunday Sunset Photoshoot"
            error={Boolean(errors.title)}
            wrapperClassName="mt-1.5"
          />
          {errors.title && (
            <p className="mt-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
              {errors.title}
            </p>
          )}
        </div>

        {/* Photos Selection Field */}
        <div>
          <div className="flex items-center justify-between">
            <label className="font-display block text-xs tracking-wider uppercase">
              Album Photos <span className="text-accent">*</span>
            </label>
            <span
              className={cn(
                'font-mono text-xs font-bold',
                photos.length >= 30
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-zinc-500 dark:text-zinc-400'
              )}
            >
              {photos.length} / 30 Photos
            </span>
          </div>

          <div
            className={cn(
              'border-ink mt-1.5 border-2 bg-zinc-50/70 p-4 shadow-[3px_3px_0_var(--ink)] sm:p-5 dark:bg-zinc-950/60',
              errors.photos && 'border-red-500 bg-red-50/40 dark:bg-red-950/20'
            )}
          >
            <input
              ref={fileInputRef}
              id="album-photos-input"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFilesAdded(e.target.files)}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center text-center">
              <div className="border-ink bg-accent-soft/20 mb-3 flex h-12 w-12 items-center justify-center border-2 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800">
                <UploadCloud className="text-accent dark:text-accent-soft h-6 w-6" />
              </div>
              <h3 className="font-display text-sm font-bold tracking-wider uppercase">
                Select Photos to Upload
              </h3>
              <p className="mt-1 max-w-md text-xs text-zinc-600 dark:text-zinc-400">
                Choose up to 30 images (JPEG, PNG, WebP). The first photo will serve as the cover.
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photos.length >= 30}
                className={cn(
                  CONBLOCK,
                  'bg-accent hover:bg-accent-pop mt-4 inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-950 dark:hover:text-white'
                )}
              >
                <Images className="h-4 w-4" />
                <span>Browse Files</span>
              </button>
            </div>

            {/* Selected Photos Preview Grid */}
            {photos.length > 0 && (
              <div className="border-ink mt-5 border-t-2 pt-4">
                <div className="flex items-center justify-between pb-3">
                  <span className="font-display text-xs font-bold tracking-wider text-zinc-700 uppercase dark:text-zinc-300">
                    Selected Photos ({photos.length})
                  </span>
                  <button
                    type="button"
                    onClick={clearAllPhotos}
                    className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-rose-600 hover:underline dark:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear All</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {photos.map((item, index) => (
                    <div
                      key={item.id}
                      className="border-ink group relative aspect-square overflow-hidden border-2 bg-zinc-100 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800"
                    >
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="h-full w-full object-cover"
                      />
                      {index === 0 && (
                        <span className="border-ink bg-accent absolute top-1 left-1 border px-1.5 py-0.5 text-[9px] font-bold text-white uppercase dark:text-zinc-950">
                          Cover
                        </span>
                      )}
                      <CloseButton
                        onClose={() => removePhoto(item.id)}
                        title="Remove photo"
                        ariaLabel="Remove photo"
                        className="absolute top-1 right-1 h-6 w-6 bg-white/95 shadow-[1px_1px_0_var(--ink)] dark:bg-zinc-900/95"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-center text-[9px] font-medium text-white">
                        {formatBytes(item.file.size)}
                      </div>
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

        {/* Description & Details */}
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

        {/* Social Credits Section */}
        <SocialLinksField value={socialLinks} onChange={setSocialLinks} />

        {/* Form Actions matching MeetupForm */}
        <FormActions
          submitLabel={
            <>
              <span className="hidden sm:inline">Publish Album</span>
              <span className="sm:hidden">Publish</span>
            </>
          }
          submittingLabel="Uploading Photos..."
          cancelHref={galleryHref}
          isSubmitting={createMutation.isPending}
          borderTop
        />
      </form>
    </div>
  );
}
