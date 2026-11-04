'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { CONBLOCK, CONBLOCK_PRIMARY, FormActions, ImageUpload } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { useAuth } from '@/features/auth';
import { useSubmitConventionRequest } from '../../data/api';

const conventionRequestSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Convention name must be at least 2 characters')
      .max(120, 'Convention name cannot exceed 120 characters'),
    venue_name: z
      .string()
      .trim()
      .min(1, 'Venue name is required')
      .max(255, 'Venue name cannot exceed 255 characters'),
    city: z
      .string()
      .trim()
      .min(1, 'City / State is required')
      .max(120, 'City / State cannot exceed 120 characters'),
    country: z
      .string()
      .trim()
      .min(1, 'Country is required')
      .max(120, 'Country cannot exceed 120 characters'),
    starts_at: z.string().min(1, 'Start date is required'),
    ends_at: z.string().min(1, 'End date is required'),
    website_url: z
      .string()
      .trim()
      .min(1, 'Official website URL is required')
      .url('Please enter a valid website URL (including https://)'),
    map_url: z
      .string()
      .trim()
      .min(1, 'Venue map link is required')
      .url('Please enter a valid map URL (including https://)'),
    notes: z
      .string()
      .trim()
      .max(2000, 'Notes cannot exceed 2000 characters')
      .optional()
      .or(z.literal('')),
    contact_email: z
      .string()
      .trim()
      .email('Please enter a valid email address')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.starts_at && data.ends_at) {
        return new Date(data.ends_at) >= new Date(data.starts_at);
      }
      return true;
    },
    {
      message: 'End date cannot be before start date',
      path: ['ends_at'],
    }
  );

type ConventionRequestFormValues = z.infer<typeof conventionRequestSchema>;

export function ConventionRequestForm() {
  const { user } = useAuth();
  const submitMutation = useSubmitConventionRequest();

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConventionRequestFormValues>({
    resolver: zodResolver(conventionRequestSchema),
    defaultValues: {
      name: '',
      venue_name: '',
      city: '',
      country: '',
      starts_at: '',
      ends_at: '',
      website_url: '',
      map_url: '',
      notes: '',
      contact_email: '',
    },
  });

  function handleFileSelect(file: File) {
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  }

  function removeBanner() {
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerFile(null);
    setBannerPreview(null);
  }

  const onSubmit = async (values: ConventionRequestFormValues) => {
    setServerError(null);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('venue_name', values.venue_name);
      formData.append('city', values.city);
      formData.append('country', values.country);
      formData.append('starts_at', values.starts_at);
      formData.append('ends_at', values.ends_at);
      formData.append('website_url', values.website_url);
      formData.append('map_url', values.map_url);
      if (values.notes) formData.append('notes', values.notes);
      if (values.contact_email) formData.append('contact_email', values.contact_email);
      if (bannerFile) formData.append('banner', bannerFile);

      await submitMutation.mutateAsync(formData);
      setSubmittedName(values.name);
      setIsSuccess(true);
      reset();
      removeBanner();
    } catch (err: unknown) {
      let message = 'An error occurred while submitting your request. Please try again.';
      if (err && typeof err === 'object' && 'response' in err) {
        const httpErr = err as { response: Response };
        try {
          const data = await httpErr.response.json();
          if (typeof data === 'object' && data !== null) {
            const firstKey = Object.keys(data)[0];
            const firstVal = data[firstKey];
            message = Array.isArray(firstVal) ? `${firstKey}: ${firstVal[0]}` : String(firstVal);
          }
        } catch {
          // ignore json parse error
        }
      }
      setServerError(message);
    }
  };

  if (isSuccess) {
    return (
      <div className="border-ink border-2 bg-white p-6 shadow-[6px_6px_0_var(--ink)] sm:p-10 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
          <div className="border-ink bg-accent/20 flex h-16 w-16 items-center justify-center rounded-full border-2 text-teal-600 dark:text-teal-400">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <h2 className="font-display mt-6 text-xl tracking-wide uppercase sm:text-2xl">
            Request Submitted!
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-300">
            Thank you for helping grow <strong>conmeet.moe</strong>! We received your request for{' '}
            <span className="text-accent-pop font-bold">{submittedName}</span>. Our team will review
            the details and publish the convention soon.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/conventions"
              className={cn(
                CONBLOCK_PRIMARY,
                'px-6 py-3 text-xs font-bold tracking-widest uppercase'
              )}
            >
              Browse Conventions
            </Link>
            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className={cn(
                CONBLOCK,
                'bg-white px-6 py-3 text-xs font-bold tracking-widest text-zinc-900 uppercase hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700'
              )}
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="border-ink border-2 bg-red-100 p-4 text-xs font-semibold text-red-700 shadow-[3px_3px_0_var(--ink)] dark:bg-red-950/60 dark:text-red-300">
          {serverError}
        </div>
      )}

      {/* Submitter Context Banner */}
      {user ? (
        <div className="border-ink bg-accent-soft/40 flex items-center justify-between border-2 px-4 py-2.5 text-xs shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">Submitting as:</span>
            <span className="text-accent-pop font-display">@{user.username}</span>
          </div>
          <span className="hidden text-[11px] text-zinc-500 sm:inline">Linked to your account</span>
        </div>
      ) : null}

      {/* Section 1: Convention Basics */}
      <div className="border-ink border-2 bg-white p-5 shadow-[4px_4px_0_var(--ink)] sm:p-7 dark:bg-zinc-900">
        <h3 className="font-display border-ink inline-block border-b-2 pb-1 text-sm tracking-wider uppercase">
          Convention Basics
        </h3>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="name" className="font-display block text-xs tracking-wider uppercase">
              Convention Name <span className="text-accent-pop">*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. AnimeNYC 2027"
              {...register('name')}
              className={cn(
                'border-ink mt-1.5 w-full border-2 bg-zinc-50 px-3.5 py-2 text-sm shadow-[2px_2px_0_var(--ink)] transition-colors focus:bg-white focus:outline-none dark:bg-zinc-950 dark:focus:bg-black',
                errors.name && 'border-red-500 focus:border-red-500'
              )}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="starts_at"
                className="font-display block text-xs tracking-wider uppercase"
              >
                Start Date <span className="text-accent-pop">*</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  id="starts_at"
                  type="date"
                  {...register('starts_at')}
                  className={cn(
                    'border-ink w-full border-2 bg-zinc-50 px-3.5 py-2 text-sm shadow-[2px_2px_0_var(--ink)] transition-colors focus:bg-white focus:outline-none dark:bg-zinc-950 dark:focus:bg-black',
                    errors.starts_at && 'border-red-500 focus:border-red-500'
                  )}
                />
              </div>
              {errors.starts_at && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.starts_at.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="ends_at"
                className="font-display block text-xs tracking-wider uppercase"
              >
                End Date <span className="text-accent-pop">*</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  id="ends_at"
                  type="date"
                  {...register('ends_at')}
                  className={cn(
                    'border-ink w-full border-2 bg-zinc-50 px-3.5 py-2 text-sm shadow-[2px_2px_0_var(--ink)] transition-colors focus:bg-white focus:outline-none dark:bg-zinc-950 dark:focus:bg-black',
                    errors.ends_at && 'border-red-500 focus:border-red-500'
                  )}
                />
              </div>
              {errors.ends_at && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.ends_at.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Venue & Location */}
      <div className="border-ink border-2 bg-white p-5 shadow-[4px_4px_0_var(--ink)] sm:p-7 dark:bg-zinc-900">
        <h3 className="font-display border-ink inline-block border-b-2 pb-1 text-sm tracking-wider uppercase">
          Venue & Location
        </h3>

        <div className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="venue_name"
              className="font-display block text-xs tracking-wider uppercase"
            >
              Venue Name <span className="text-accent-pop">*</span>
            </label>
            <input
              id="venue_name"
              type="text"
              placeholder="e.g. Javits Center"
              {...register('venue_name')}
              className="border-ink mt-1.5 w-full border-2 bg-zinc-50 px-3.5 py-2 text-sm shadow-[2px_2px_0_var(--ink)] transition-colors focus:bg-white focus:outline-none dark:bg-zinc-950 dark:focus:bg-black"
            />
            {errors.venue_name && (
              <p className="text-accent-pop mt-1 text-xs">{errors.venue_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="city" className="font-display block text-xs tracking-wider uppercase">
                City / State <span className="text-accent-pop">*</span>
              </label>
              <input
                id="city"
                type="text"
                placeholder="e.g. New York, NY"
                {...register('city')}
                className="border-ink mt-1.5 w-full border-2 bg-zinc-50 px-3.5 py-2 text-sm shadow-[2px_2px_0_var(--ink)] transition-colors focus:bg-white focus:outline-none dark:bg-zinc-950 dark:focus:bg-black"
              />
              {errors.city && <p className="text-accent-pop mt-1 text-xs">{errors.city.message}</p>}
            </div>

            <div>
              <label
                htmlFor="country"
                className="font-display block text-xs tracking-wider uppercase"
              >
                Country <span className="text-accent-pop">*</span>
              </label>
              <input
                id="country"
                type="text"
                placeholder="e.g. United States"
                {...register('country')}
                className="border-ink mt-1.5 w-full border-2 bg-zinc-50 px-3.5 py-2 text-sm shadow-[2px_2px_0_var(--ink)] transition-colors focus:bg-white focus:outline-none dark:bg-zinc-950 dark:focus:bg-black"
              />
              {errors.country && (
                <p className="text-accent-pop mt-1 text-xs">{errors.country.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Links & Banner */}
      <div className="border-ink border-2 bg-white p-5 shadow-[4px_4px_0_var(--ink)] sm:p-7 dark:bg-zinc-900">
        <h3 className="font-display border-ink inline-block border-b-2 pb-1 text-sm tracking-wider uppercase">
          Links & Artwork
        </h3>

        <div className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="website_url"
              className="font-display block text-xs tracking-wider uppercase"
            >
              Official Website URL <span className="text-accent-pop">*</span>
            </label>
            <div className="relative mt-1.5">
              <input
                id="website_url"
                type="url"
                placeholder="https://animenyc.com/"
                {...register('website_url')}
                className={cn(
                  'border-ink w-full border-2 bg-zinc-50 px-3.5 py-2 text-sm shadow-[2px_2px_0_var(--ink)] transition-colors focus:bg-white focus:outline-none dark:bg-zinc-950 dark:focus:bg-black',
                  errors.website_url && 'border-red-500 focus:border-red-500'
                )}
              />
            </div>
            {errors.website_url && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.website_url.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="map_url"
              className="font-display block text-xs tracking-wider uppercase"
            >
              Venue Map Link <span className="text-accent-pop">*</span>
            </label>
            <div className="relative mt-1.5">
              <input
                id="map_url"
                type="url"
                placeholder="https://maps.google.com/?q=..."
                {...register('map_url')}
                className={cn(
                  'border-ink w-full border-2 bg-zinc-50 px-3.5 py-2 text-sm shadow-[2px_2px_0_var(--ink)] transition-colors focus:bg-white focus:outline-none dark:bg-zinc-950 dark:focus:bg-black',
                  errors.map_url && 'border-red-500 focus:border-red-500'
                )}
              />
            </div>
            {errors.map_url && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.map_url.message}
              </p>
            )}
          </div>

          {/* Banner Upload using shared ImageUpload component */}
          <div className="pt-2">
            <ImageUpload
              id="convention_banner_upload"
              label="Convention Banner / Logo (Optional)"
              description="PNG, JPG, or WEBP (Max 5MB)"
              previewUrl={bannerPreview}
              onFileSelect={handleFileSelect}
              onRemove={removeBanner}
            />
          </div>
        </div>
      </div>

      {/* Section 4: Notes & Submitter Contact */}
      <div className="border-ink border-2 bg-white p-5 shadow-[4px_4px_0_var(--ink)] sm:p-7 dark:bg-zinc-900">
        <h3 className="font-display border-ink inline-block border-b-2 pb-1 text-sm tracking-wider uppercase">
          Notes & Details
        </h3>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="notes" className="font-display block text-xs tracking-wider uppercase">
              Additional Info / Sources (Optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder="e.g. FanCons link, guest announcements, ticketing page..."
              {...register('notes')}
              className="border-ink mt-1.5 w-full border-2 bg-zinc-50 px-3.5 py-2 text-sm shadow-[2px_2px_0_var(--ink)] transition-colors focus:bg-white focus:outline-none dark:bg-zinc-950 dark:focus:bg-black"
            />
            {errors.notes && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.notes.message}</p>
            )}
          </div>

          {!user ? (
            <div>
              <label
                htmlFor="contact_email"
                className="font-display block text-xs tracking-wider uppercase"
              >
                Your Contact Email (Optional)
              </label>
              <input
                id="contact_email"
                type="email"
                placeholder="you@example.com"
                {...register('contact_email')}
                className={cn(
                  'border-ink mt-1.5 w-full border-2 bg-zinc-50 px-3.5 py-2 text-sm shadow-[2px_2px_0_var(--ink)] transition-colors focus:bg-white focus:outline-none dark:bg-zinc-950 dark:focus:bg-black',
                  errors.contact_email && 'border-red-500 focus:border-red-500'
                )}
              />
              <p className="mt-1 text-[11px] text-zinc-500">
                Optional: if we need to clarify details before publishing.
              </p>
              {errors.contact_email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.contact_email.message}
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Submit Actions */}
      <FormActions
        cancelHref="/conventions"
        submitLabel="Submit Convention Request"
        submittingLabel="Submitting..."
        isSubmitting={isSubmitting || submitMutation.isPending}
        className="pt-2"
      />
    </form>
  );
}
