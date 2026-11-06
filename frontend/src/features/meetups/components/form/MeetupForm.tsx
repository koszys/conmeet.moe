'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { useConvention } from '@/features/conventions/data/api';
import { BackLink, FormActions, ImageUpload, CONBLOCK } from '@/shared/components/ui';
import { parseDate } from '@/shared/lib/dates';
import { cn } from '@/shared/lib/utils';
import { useCreateMeetup, useUpdateMeetup } from '../../api';
import type { MeetupDetail } from '../../types';

interface MeetupFormProps {
  conventionSlug: string;
  initialData?: MeetupDetail;
  onSuccess?: (meetup: { id: number }) => void;
  onCancel?: () => void;
}

function toLocalDateAndTimes(isoString?: string | null): { date: string; time: string } {
  if (!isoString) return { date: '', time: '' };
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return { date: '', time: '' };
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
}

export function MeetupForm({ conventionSlug, initialData, onSuccess, onCancel }: MeetupFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: convention } = useConvention(conventionSlug);
  const isEditing = Boolean(initialData);

  const createMutation = useCreateMeetup(conventionSlug);
  const updateMutation = useUpdateMeetup();

  const initialStart = toLocalDateAndTimes(initialData?.starts_at);
  const initialEnd = toLocalDateAndTimes(initialData?.ends_at);

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [selectedDate, setSelectedDate] = useState(initialStart.date);
  const [startTime, setStartTime] = useState(initialStart.time || '12:00');
  const [endTime, setEndTime] = useState(initialEnd.time || '13:00');
  const [description, setDescription] = useState(() => {
    if (!initialData?.description) return '';
    // Strip basic html tags if description is html
    return initialData.description.replace(/<[^>]*>?/gm, '');
  });
  const [isOfficial, setIsOfficial] = useState(initialData?.is_official || false);

  // Generate convention days for easy 1-click day selection
  const conventionDays = useMemo(() => {
    if (!convention?.starts_at || !convention?.ends_at) return [];
    try {
      const start = parseDate(convention.starts_at);
      const end = parseDate(convention.ends_at);
      const days: { dateStr: string; dayNumber: number; label: string; weekday: string }[] = [];
      const current = new Date(start);

      let count = 0;
      while (current <= end && count < 14) {
        const dateStr = format(current, 'yyyy-MM-dd');
        const weekday = format(current, 'EEE');
        const label = format(current, 'MMM d');
        days.push({ dateStr, dayNumber: count + 1, label, weekday });
        current.setDate(current.getDate() + 1);
        count++;
      }
      return days;
    } catch {
      return [];
    }
  }, [convention?.starts_at, convention?.ends_at]);

  // Pre-fill selectedDate with Day 1 when convention loads if creating new meetup
  useEffect(() => {
    if (!isEditing && !selectedDate && conventionDays.length > 0) {
      setSelectedDate(conventionDays[0].dateStr);
    }
  }, [isEditing, selectedDate, conventionDays]);

  const handleStartTimeChange = (newStartTime: string) => {
    setStartTime(newStartTime);
    if (errors.time) setErrors((prev) => ({ ...prev, time: '' }));

    // Automatically suggest end time 1 hour after start time
    if (newStartTime) {
      const [h, m] = newStartTime.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        const nextH = (h + 1) % 24;
        const pad = (n: number) => String(n).padStart(2, '0');
        setEndTime(`${pad(nextH)}:${pad(m)}`);
      }
    }
  };

  const applyDuration = (minutes: number) => {
    if (!startTime) return;
    const [h, m] = startTime.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return;
    const totalMinutes = h * 60 + m + minutes;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    setEndTime(`${pad(endH)}:${pad(endM)}`);
    if (errors.time) setErrors((prev) => ({ ...prev, time: '' }));
  };

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
    if (!selectedDate) errs.date = 'Please pick a convention day or date';
    if (!startTime) errs.time = 'Start time is required';
    if (!endTime) errs.time = 'End time is required';
    if (startTime && endTime && startTime === endTime) {
      errs.time = 'End time cannot be the same as start time';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      const startDateTime = new Date(`${selectedDate}T${startTime}:00`);
      let endDateTime = new Date(`${selectedDate}T${endTime}:00`);

      // If end time is earlier than start time (e.g. overnight meetup), roll forward by 1 day
      if (endDateTime.getTime() <= startDateTime.getTime()) {
        endDateTime = new Date(endDateTime.getTime() + 24 * 60 * 60 * 1000);
      }

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('location', location.trim());
      formData.append('starts_at', startDateTime.toISOString());
      formData.append('ends_at', endDateTime.toISOString());
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
      <BackLink
        href={
          isEditing && initialData
            ? `/conventions/${conventionSlug}/meetups/${initialData.id}`
            : `/conventions/${conventionSlug}/meetups`
        }
      >
        {isEditing ? 'Back to Meetup' : 'Back to Meetups'}
      </BackLink>

      {/* Page Header */}
      <div>
        <span className="font-display text-accent-pop text-xs tracking-wider uppercase">
          {convention?.name || 'Convention'}
        </span>
        <h1 className="font-display text-2xl font-black tracking-wider uppercase sm:text-3xl">
          {isEditing ? 'Edit Meetup' : 'Post a Meetup'}
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
              placeholder="e.g. River Pavilion Meetup #1, Site #1, Room 402B"
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

        {/* Meetup Day & Time Picker */}
        <div className="border-ink border-2 bg-zinc-50/70 p-3.5 shadow-[3px_3px_0_var(--ink)] sm:p-5 dark:bg-zinc-950/60">
          {/* Meetup Day */}
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-1.5 sm:gap-2">
              <label className="font-display flex items-center gap-1.5 text-xs tracking-wider uppercase">
                <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                Meetup Day <span className="text-red-500">*</span>
              </label>
              {convention?.name && (
                <span className="truncate text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  {convention.name}
                </span>
              )}
            </div>

            {conventionDays.length > 0 ? (
              <div className="mt-2.5 space-y-2.5 sm:space-y-3">
                {/* Convention Day Quick Chips: Equal-width row on mobile, flex on desktop */}
                <div className="grid auto-cols-fr grid-flow-col gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
                  {conventionDays.map((d) => {
                    const isSelected = selectedDate === d.dateStr;
                    return (
                      <button
                        key={d.dateStr}
                        type="button"
                        onClick={() => {
                          setSelectedDate(d.dateStr);
                          if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
                        }}
                        className={cn(
                          CONBLOCK,
                          'flex min-w-0 cursor-pointer flex-col items-center px-1.5 py-1.5 text-center transition-all sm:min-w-[76px] sm:px-3.5 sm:py-2',
                          isSelected
                            ? 'bg-accent-pop -translate-y-0.5 text-white shadow-[2px_2px_0_var(--ink)]'
                            : 'bg-white text-zinc-800 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800'
                        )}
                      >
                        <span className="text-[10px] font-bold tracking-tight uppercase opacity-85 sm:tracking-wider">
                          <span className="sm:hidden">
                            D{d.dayNumber} · {d.weekday}
                          </span>
                          <span className="hidden sm:inline">
                            Day {d.dayNumber} · {d.weekday}
                          </span>
                        </span>
                        <span className="text-xs font-black sm:text-sm">{d.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom/Specific date fallback: Stacks on mobile, inline on desktop */}
                <div className="flex flex-col gap-1.5 pt-1 text-xs sm:flex-row sm:items-center sm:gap-2">
                  <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                    Or select another date:
                  </span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
                    }}
                    className={cn(
                      'border-ink w-full border-2 bg-white px-2.5 py-1.5 text-xs font-bold shadow-[2px_2px_0_var(--ink)] focus:outline-none sm:w-auto dark:bg-zinc-900',
                      errors.date && 'border-red-500 bg-red-50 dark:bg-red-950/30'
                    )}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
                  }}
                  className={cn(
                    'border-ink w-full border-2 bg-white px-3 py-2 text-sm font-bold shadow-[2px_2px_0_var(--ink)] focus:outline-none dark:bg-zinc-900',
                    errors.date && 'border-red-500 bg-red-50 dark:bg-red-950/30'
                  )}
                />
              </div>
            )}

            {errors.date && (
              <p className="mt-1.5 text-xs font-bold text-red-600 dark:text-red-400">
                {errors.date}
              </p>
            )}
          </div>

          {/* Time Row */}
          <div className="mt-5 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Start Time */}
              <div>
                <label
                  htmlFor="meetup-start-time"
                  className="font-display block text-xs tracking-wider uppercase"
                >
                  Start Time <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <Clock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="meetup-start-time"
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className={cn(
                      'border-ink w-full border-2 bg-white py-2.5 pr-3.5 pl-9 text-sm font-medium shadow-[2px_2px_0_var(--ink)] transition-colors focus:outline-none dark:bg-zinc-900',
                      errors.time && 'border-red-500 bg-red-50 dark:bg-red-950/30'
                    )}
                  />
                </div>
              </div>

              {/* End Time */}
              <div>
                <label
                  htmlFor="meetup-end-time"
                  className="font-display block text-xs tracking-wider uppercase"
                >
                  End Time <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <Clock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="meetup-end-time"
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      if (errors.time) setErrors((prev) => ({ ...prev, time: '' }));
                    }}
                    className={cn(
                      'border-ink w-full border-2 bg-white py-2.5 pr-3.5 pl-9 text-sm font-medium shadow-[2px_2px_0_var(--ink)] transition-colors focus:outline-none dark:bg-zinc-900',
                      errors.time && 'border-red-500 bg-red-50 dark:bg-red-950/30'
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Quick Duration */}
            <div className="mt-3.5">
              <span className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                Quick duration:
              </span>
              <div className="mt-1.5 grid grid-cols-4 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
                {[
                  { label: '30m', minutes: 30 },
                  { label: '1 hr', minutes: 60 },
                  { label: '1.5 hrs', minutes: 90 },
                  { label: '2 hrs', minutes: 120 },
                ].map((dur) => (
                  <button
                    key={dur.label}
                    type="button"
                    onClick={() => applyDuration(dur.minutes)}
                    className={cn(
                      CONBLOCK,
                      'w-full cursor-pointer bg-white px-1.5 py-1 text-center text-[11px] font-bold text-zinc-700 hover:bg-zinc-100 sm:w-auto sm:px-2.5 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                    )}
                  >
                    +{dur.label}
                  </button>
                ))}
              </div>
            </div>

            {errors.time && (
              <p className="mt-2 text-xs font-bold text-red-600 dark:text-red-400">{errors.time}</p>
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
          <div className="border-ink border-2 bg-pink-50 p-4 shadow-[3px_3px_0_var(--ink)] dark:bg-pink-950/30">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={isOfficial}
                onChange={(e) => setIsOfficial(e.target.checked)}
                className="border-ink accent-accent-pop mt-1 h-4 w-4 cursor-pointer rounded-none border-2"
              />
              <div>
                <span className="font-display flex items-center gap-1.5 text-xs font-bold tracking-wider text-pink-900 uppercase dark:text-pink-300">
                  <Sparkles className="h-3.5 w-3.5 fill-current" />
                  Mark as Official Convention Meetup
                </span>
                <p className="mt-0.5 text-xs text-pink-800/80 dark:text-pink-400/80">
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
          cancelHref={
            onCancel
              ? undefined
              : isEditing && initialData
                ? `/conventions/${conventionSlug}/meetups/${initialData.id}`
                : `/conventions/${conventionSlug}/meetups`
          }
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
}
