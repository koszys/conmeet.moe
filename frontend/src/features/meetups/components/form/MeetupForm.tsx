'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { useConvention } from '@/features/conventions/data/api';
import { BackLink, FormActions, ImageUpload } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { useCreateMeetup, useUpdateMeetup } from '../../api';
import type { MeetupDetail } from '../../types';

interface MeetupFormProps {
  conventionSlug: string;
  initialData?: MeetupDetail;
  onSuccess?: (meetup: { id: number }) => void;
}

function toLocalDatetimeInput(isoString?: string | null): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function MeetupForm({ conventionSlug, initialData, onSuccess }: MeetupFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: convention } = useConvention(conventionSlug);
  const isEditing = Boolean(initialData);

  const createMutation = useCreateMeetup(conventionSlug);
  const updateMutation = useUpdateMeetup();

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [startsAt, setStartsAt] = useState(() => {
    if (initialData?.starts_at) return toLocalDatetimeInput(initialData.starts_at);
    if (convention?.starts_at) {
      // Default to 12:00 PM on the first convention day
      const d = new Date(convention.starts_at);
      d.setHours(12, 0, 0, 0);
      return toLocalDatetimeInput(d.toISOString());
    }
    return '';
  });
  const [endsAt, setEndsAt] = useState(() => {
    if (initialData?.ends_at) return toLocalDatetimeInput(initialData.ends_at);
    if (convention?.starts_at) {
      // Default to 13:00 (1 hour duration)
      const d = new Date(convention.starts_at);
      d.setHours(13, 0, 0, 0);
      return toLocalDatetimeInput(d.toISOString());
    }
    return '';
  });
  const [description, setDescription] = useState(() => {
    if (!initialData?.description) return '';
    // Strip basic html tags if description is html
    return initialData.description.replace(/<[^>]*>?/gm, '');
  });
  const [isOfficial, setIsOfficial] = useState(initialData?.is_official || false);

  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || initialData?.image_thumb || null
  );
  const [clearImage, setClearImage] = useState(false);

  // Errors & Loading
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const isStaffOrAdmin = Boolean(user && user.role === 'admin');

  const handleImageSelect = (file: File) => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setClearImage(false);
  };

  const handleImageRemove = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    if (isEditing) {
      setClearImage(true);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Meetup title is required';
    if (!location.trim()) errs.location = 'Location or meetup spot is required';
    if (!startsAt) errs.startsAt = 'Start date & time is required';
    if (!endsAt) errs.endsAt = 'End date & time is required';
    if (startsAt && endsAt) {
      const s = new Date(startsAt).getTime();
      const e = new Date(endsAt).getTime();
      if (e <= s) {
        errs.endsAt = 'End time must be after start time';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('location', location.trim());
      formData.append('starts_at', new Date(startsAt).toISOString());
      formData.append('ends_at', new Date(endsAt).toISOString());
      if (description.trim()) {
        formData.append('description', description.trim());
      }
      if (isStaffOrAdmin) {
        formData.append('is_official', isOfficial ? 'true' : 'false');
      }
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (clearImage) {
        formData.append('clear_image', 'true');
      }

      if (isEditing && initialData) {
        const updated = await updateMutation.mutateAsync({
          meetupId: initialData.id,
          formData,
        });
        if (onSuccess) {
          onSuccess(updated);
        } else {
          router.push(`/conventions/${conventionSlug}/meetups/${updated.id}`);
        }
      } else {
        const created = await createMutation.mutateAsync(formData);
        if (onSuccess) {
          onSuccess(created);
        } else {
          router.push(`/conventions/${conventionSlug}/meetups/${created.id}`);
        }
      }
    } catch (err: unknown) {
      let msg = 'Failed to save meetup. Please review your details and try again.';
      if (err && typeof err === 'object' && 'response' in err) {
        const httpErr = err as { response: Response };
        try {
          const data = await httpErr.response.json();
          if (typeof data === 'object' && data !== null) {
            const firstKey = Object.keys(data)[0];
            const firstVal = data[firstKey];
            msg = Array.isArray(firstVal) ? `${firstKey}: ${firstVal[0]}` : String(firstVal);
          }
        } catch {
          // ignore parsing error
        }
      }
      setServerError(msg);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <BackLink href={`/conventions/${conventionSlug}/meetups`}>Back to Meetups</BackLink>

      {/* Page Header */}
      <div>
        <span className="font-display text-accent-pop text-xs tracking-wider uppercase">
          {convention?.name || 'Convention'}
        </span>
        <h1 className="font-display text-2xl font-black tracking-wider uppercase sm:text-3xl">
          {isEditing ? 'Edit Meetup' : 'Host a Meetup'}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {isEditing
            ? 'Update the meetup details, schedule, or meetup location.'
            : 'Organize a cosplay gathering, photoshoot, franchise fan meetup, or panel.'}
        </p>
      </div>

      {serverError && (
        <div className="border-ink flex items-start gap-3 border-2 bg-red-50 p-4 text-sm font-semibold text-red-700 shadow-[4px_4px_0_var(--ink)] dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Main Form Box */}
      <form
        onSubmit={handleSubmit}
        className="border-ink space-y-6 border-2 bg-white p-6 shadow-[6px_6px_0_var(--ink)] sm:p-8 dark:bg-zinc-900"
      >
        {/* Title */}
        <div>
          <label
            htmlFor="meetup-name"
            className="font-display block text-xs tracking-wider uppercase"
          >
            Meetup Title <span className="text-red-500">*</span>
          </label>
          <input
            id="meetup-name"
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            placeholder="e.g. Genshin Impact Cosplay Gathering, Chainsaw Man Fan Meetup"
            className={cn(
              'border-ink mt-1.5 w-full border-2 bg-zinc-50 px-3.5 py-2.5 text-sm shadow-[2px_2px_0_var(--ink)] transition-colors focus:bg-white focus:outline-none dark:bg-zinc-950 dark:focus:bg-black',
              errors.name && 'border-red-500 bg-red-50 dark:bg-red-950/30'
            )}
          />
          {errors.name && (
            <p className="mt-1.5 text-xs font-bold text-red-600 dark:text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="meetup-location"
            className="font-display block text-xs tracking-wider uppercase"
          >
            Location / Gathering Spot <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1.5">
            <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="meetup-location"
              type="text"
              required
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
              }}
              placeholder="e.g. South Terrace Stairs, Room 402B, Hall C Fountain"
              className={cn(
                'border-ink w-full border-2 bg-zinc-50 py-2.5 pr-3.5 pl-9 text-sm shadow-[2px_2px_0_var(--ink)] transition-colors focus:bg-white focus:outline-none dark:bg-zinc-950 dark:focus:bg-black',
                errors.location && 'border-red-500 bg-red-50 dark:bg-red-950/30'
              )}
            />
          </div>
          {errors.location ? (
            <p className="mt-1.5 text-xs font-bold text-red-600 dark:text-red-400">
              {errors.location}
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Be specific so attendees know exactly where to assemble.
            </p>
          )}
        </div>

        {/* Starts At & Ends At */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Starts At */}
          <div>
            <label
              htmlFor="meetup-starts-at"
              className="font-display block text-xs tracking-wider uppercase"
            >
              Starts At <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <Calendar className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="meetup-starts-at"
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => {
                  setStartsAt(e.target.value);
                  if (errors.startsAt) setErrors((prev) => ({ ...prev, startsAt: '' }));
                }}
                className={cn(
                  'border-ink w-full border-2 bg-zinc-50 py-2.5 pr-3.5 pl-9 text-sm shadow-[2px_2px_0_var(--ink)] transition-colors focus:bg-white focus:outline-none dark:bg-zinc-950 dark:focus:bg-black',
                  errors.startsAt && 'border-red-500 bg-red-50 dark:bg-red-950/30'
                )}
              />
            </div>
            {errors.startsAt && (
              <p className="mt-1.5 text-xs font-bold text-red-600 dark:text-red-400">
                {errors.startsAt}
              </p>
            )}
          </div>

          {/* Ends At */}
          <div>
            <label
              htmlFor="meetup-ends-at"
              className="font-display block text-xs tracking-wider uppercase"
            >
              Ends At <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <Clock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="meetup-ends-at"
                type="datetime-local"
                required
                value={endsAt}
                onChange={(e) => {
                  setEndsAt(e.target.value);
                  if (errors.endsAt) setErrors((prev) => ({ ...prev, endsAt: '' }));
                }}
                className={cn(
                  'border-ink w-full border-2 bg-zinc-50 py-2.5 pr-3.5 pl-9 text-sm shadow-[2px_2px_0_var(--ink)] transition-colors focus:bg-white focus:outline-none dark:bg-zinc-950 dark:focus:bg-black',
                  errors.endsAt && 'border-red-500 bg-red-50 dark:bg-red-950/30'
                )}
              />
            </div>
            {errors.endsAt && (
              <p className="mt-1.5 text-xs font-bold text-red-600 dark:text-red-400">
                {errors.endsAt}
              </p>
            )}
          </div>
        </div>

        {/* Banner Image Upload */}
        <div>
          <ImageUpload
            id="meetup_image"
            label="Meetup Banner / Flyer (Optional)"
            description="Upload an official poster, gathering banner, or character artwork (Max 5MB)"
            previewUrl={imagePreview}
            onFileSelect={handleImageSelect}
            onRemove={handleImageRemove}
            aspectRatioClass="aspect-[16/9]"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="meetup-description"
            className="font-display block text-xs tracking-wider uppercase"
          >
            Description & Details (Optional)
          </label>
          <textarea
            id="meetup-description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Introduce the meetup! Include photoshoot schedules, rules for cosplay weapons/props, contact info, Discord invite, or social handles..."
            className="border-ink mt-1.5 w-full border-2 bg-zinc-50 px-3.5 py-2.5 text-sm shadow-[2px_2px_0_var(--ink)] transition-colors focus:bg-white focus:outline-none dark:bg-zinc-950 dark:focus:bg-black"
          />
        </div>

        {/* Staff/Admin Toggle: Official Meetup */}
        {isStaffOrAdmin && (
          <div className="border-ink border-2 bg-amber-50 p-4 shadow-[3px_3px_0_var(--ink)] dark:bg-amber-950/30">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={isOfficial}
                onChange={(e) => setIsOfficial(e.target.checked)}
                className="border-ink mt-1 h-4 w-4 cursor-pointer rounded-none border-2 accent-amber-500"
              />
              <div>
                <span className="font-display flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-900 uppercase dark:text-amber-300">
                  <Sparkles className="h-3.5 w-3.5 fill-current" />
                  Mark as Official Convention Meetup
                </span>
                <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-400/80">
                  Staff privileges enabled: This meetup will be badged as official and listed
                  prominently in the Official filter tab.
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Form Actions */}
        <FormActions
          submitLabel={isEditing ? 'Save Changes' : 'Publish Meetup'}
          cancelHref={`/conventions/${conventionSlug}/meetups`}
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
}
