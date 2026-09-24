'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Camera, ImagePlus, Loader2, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { useVendors } from '../api/queries';
import { useCreateFreebie } from '../api/mutations';

const freebieSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters').max(160, 'Max 160 characters'),
  vendor_name: z
    .string()
    .min(1, 'Vendor / company name is required')
    .max(120, 'Max 120 characters'),
  location: z.string().max(255, 'Max 255 characters').optional(),
  requirements: z.string().optional(),
  description: z.string().optional(),
});

type FreebieFormValues = z.infer<typeof freebieSchema>;

export function FreebieForm({
  conventionSlug,
  conventionName,
}: {
  conventionSlug: string;
  conventionName?: string;
}) {
  const router = useRouter();
  const createMutation = useCreateFreebie();
  const { data: vendors } = useVendors(conventionSlug);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FreebieFormValues>({
    resolver: zodResolver(freebieSchema),
    defaultValues: {
      name: '',
      vendor_name: '',
      location: '',
      requirements: '',
      description: '',
    },
  });

  const selectedVendorName = watch('vendor_name');

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  }

  function removeImage() {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  }

  async function onSubmit(values: FreebieFormValues) {
    setServerError(null);
    try {
      const trimmedVendor = values.vendor_name.trim();
      const existingMatch = vendors?.find(
        (v) => v.name.toLowerCase() === trimmedVendor.toLowerCase()
      );
      const canonicalVendorName = existingMatch ? existingMatch.name : trimmedVendor;

      const formData = new FormData();
      formData.append('name', values.name.trim());
      formData.append('vendor_name', canonicalVendorName);
      formData.append('convention_slug', conventionSlug);
      if (values.location) formData.append('location', values.location.trim());
      if (values.requirements) formData.append('requirements', values.requirements.trim());
      if (values.description) formData.append('description', values.description.trim());
      if (imageFile) formData.append('image', imageFile);

      await createMutation.mutateAsync(formData);
      router.push(`/conventions/${conventionSlug}/freebies`);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        setServerError('Failed to submit freebie. Please check your inputs and try again.');
      } else {
        setServerError('A network error occurred. Please check connection.');
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="border-ink border-b-2 pb-5">
        <Link
          href={`/conventions/${conventionSlug}/freebies`}
          className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-zinc-600 uppercase hover:underline dark:text-zinc-300 dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Freebies Board
        </Link>

        <h1 className="font-display mt-3 text-2xl tracking-wide uppercase sm:text-3xl">
          Post a Freebie Drop
        </h1>
        <p className="mt-1 text-xs text-zinc-600 sm:text-sm dark:text-zinc-300">
          Share a giveaway, limited merch drop, or stamp rally for{' '}
          {conventionName || 'this convention'}.
        </p>
      </div>

      {serverError ? (
        <div className="border-ink border-2 bg-rose-50 p-4 text-xs font-bold text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
          {serverError}
        </div>
      ) : null}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Item Title */}
        <div>
          <label
            htmlFor="name"
            className="border-ink font-display block text-xs tracking-wider uppercase"
          >
            Item Name <span className="text-accent">*</span>
          </label>
          <input
            id="name"
            type="text"
            placeholder="e.g. Genshin Impact Acrylic Keychain"
            {...register('name')}
            className="border-ink focus:ring-accent mt-1.5 h-11 w-full border-2 bg-white px-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
          />
          {errors.name ? (
            <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        {/* Vendor / Booth Name */}
        <div>
          <label
            htmlFor="vendor_name"
            className="font-display block text-xs tracking-wider uppercase"
          >
            Vendor / Company Name <span className="text-accent">*</span>
          </label>
          <input
            id="vendor_name"
            type="text"
            list="existing-vendors"
            autoComplete="off"
            placeholder="e.g. HoYoverse, Good Smile Company, Artist Alley Table A12"
            {...register('vendor_name')}
            className="border-ink focus:ring-accent mt-1.5 h-11 w-full border-2 bg-white px-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
          />
          {vendors && vendors.length > 0 ? (
            <datalist id="existing-vendors">
              {vendors.map((v) => (
                <option key={v.id} value={v.name} />
              ))}
            </datalist>
          ) : null}
          {errors.vendor_name ? (
            <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
              {errors.vendor_name.message}
            </p>
          ) : null}

          {/* Quick select existing vendors */}
          {vendors && vendors.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-300">
                Existing:
              </span>
              {vendors.slice(0, 6).map((v) => {
                const isSelected =
                  selectedVendorName?.trim().toLowerCase() === v.name.toLowerCase();
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setValue('vendor_name', v.name, { shouldValidate: true })}
                    className={cn(
                      'border-ink cursor-pointer border px-2 py-0.5 text-[11px] font-bold uppercase transition-all',
                      isSelected
                        ? 'bg-accent text-white'
                        : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700'
                    )}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Booth Location */}
        <div>
          <label htmlFor="location" className="font-display block text-xs tracking-wider uppercase">
            Booth / Hall Location
          </label>
          <input
            id="location"
            type="text"
            placeholder="e.g. Booth #1420 (Exhibitor Hall A)"
            {...register('location')}
            className="border-ink focus:ring-accent mt-1.5 h-11 w-full border-2 bg-white px-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
          />
          {errors.location ? (
            <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
              {errors.location.message}
            </p>
          ) : null}
        </div>

        {/* Requirements / How to Get It */}
        <div>
          <label
            htmlFor="requirements"
            className="font-display block text-xs tracking-wider uppercase"
          >
            How to Get It (Requirements)
          </label>
          <textarea
            id="requirements"
            rows={2}
            placeholder="e.g. Follow @HoYoverse on X and show badge, or play a 5-minute demo"
            {...register('requirements')}
            className="border-ink focus:ring-accent mt-1.5 w-full border-2 bg-white p-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
          />
        </div>

        {/* Additional Description */}
        <div>
          <label
            htmlFor="description"
            className="font-display block text-xs tracking-wider uppercase"
          >
            Additional Details / Notes
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="e.g. Limited to 200 per day! Drops start at 11:00 AM."
            {...register('description')}
            className="border-ink focus:ring-accent mt-1.5 w-full border-2 bg-white p-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
          />
        </div>

        {/* Image Upload */}
        <div>
          <span className="font-display block text-xs tracking-wider uppercase">
            Photo of Item(s) (Optional)
          </span>

          {imagePreview ? (
            <div className="border-ink relative mt-2 aspect-video w-full max-w-sm overflow-hidden border-2 bg-zinc-100 shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-800">
              <Image src={imagePreview} alt="Preview" fill className="object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="border-ink absolute top-2 right-2 flex h-7 w-7 items-center justify-center border-2 bg-rose-500 text-white shadow-[2px_2px_0_var(--ink)] hover:bg-rose-600"
              >
                <X className="h-4 w-4 stroke-3" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="image-upload"
              className="border-ink mt-2 flex cursor-pointer flex-col items-center justify-center border-2 border-dashed bg-zinc-50 p-6 text-center shadow-[4px_4px_0_var(--ink)] transition-colors hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/60"
            >
              <div className="border-ink bg-accent/20 flex h-10 w-10 items-center justify-center border-2">
                <ImagePlus className="text-accent h-5 w-5" />
              </div>
              <span className="mt-2 text-xs font-bold uppercase">
                Click or Drag Image to Upload
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                PNG, JPG, or WEBP (Max 5MB)
              </span>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit Actions */}
        <div className="border-ink flex items-center justify-end gap-3 border-t-2 pt-5">
          <Link
            href={`/conventions/${conventionSlug}/freebies`}
            className={cn(CONBLOCK, 'px-5 py-2.5 text-xs font-bold uppercase')}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className={cn(
              CONBLOCK_PRIMARY,
              'inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase'
            )}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Post Freebie
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
