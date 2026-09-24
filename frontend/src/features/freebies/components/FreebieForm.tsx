'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ImagePlus, Loader2, Plus, Sparkles, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { useVendors } from '../api/queries';
import { useCreateFreebie } from '../api/mutations';

const freebieItemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters').max(60, 'Max 60 characters'),
  requirements: z.string().max(200, 'Max 200 characters').optional(),
  description: z.string().max(300, 'Max 300 characters').optional(),
});

const multiFreebieSchema = z.object({
  vendor_name: z.string().min(1, 'Vendor / company name is required').max(50, 'Max 50 characters'),
  location: z.string().max(50, 'Max 50 characters').optional(),
  items: z.array(freebieItemSchema).min(1, 'At least one freebie item is required'),
});

type MultiFreebieFormValues = z.infer<typeof multiFreebieSchema>;

function CharCounter({ current, max }: { current: number; max: number }) {
  const isAtLimit = current >= max;
  const isNearLimit = current >= max * 0.85;
  return (
    <span
      className={cn(
        'font-mono text-[10px] tracking-normal transition-colors',
        isAtLimit
          ? 'font-bold text-rose-500 dark:text-rose-400'
          : isNearLimit
            ? 'font-bold text-amber-500 dark:text-amber-400'
            : 'text-zinc-400 dark:text-zinc-500'
      )}
    >
      {current}/{max}
    </span>
  );
}

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

  const [itemImages, setItemImages] = useState<Record<string, { file: File; preview: string }>>({});
  const [submittingProgress, setSubmittingProgress] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MultiFreebieFormValues>({
    resolver: zodResolver(multiFreebieSchema),
    defaultValues: {
      vendor_name: '',
      location: '',
      items: [{ name: '', requirements: '', description: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const selectedVendorName = watch('vendor_name') || '';
  const selectedLocation = watch('location') || '';
  const watchedItems = watch('items') || [];

  function handleItemImageChange(fieldId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (itemImages[fieldId]) {
        URL.revokeObjectURL(itemImages[fieldId].preview);
      }
      const url = URL.createObjectURL(file);
      setItemImages((prev) => ({
        ...prev,
        [fieldId]: { file, preview: url },
      }));
    }
  }

  function removeItemImage(fieldId: string) {
    if (itemImages[fieldId]) {
      URL.revokeObjectURL(itemImages[fieldId].preview);
      setItemImages((prev) => {
        const copy = { ...prev };
        delete copy[fieldId];
        return copy;
      });
    }
  }

  function handleRemoveItem(index: number) {
    const fieldId = fields[index]?.id;
    if (fieldId) {
      removeItemImage(fieldId);
    }
    remove(index);
  }

  async function onSubmit(values: MultiFreebieFormValues) {
    setServerError(null);
    try {
      const trimmedVendor = values.vendor_name.trim();
      const existingMatch = vendors?.find(
        (v) => v.name.toLowerCase() === trimmedVendor.toLowerCase()
      );
      const canonicalVendorName = existingMatch ? existingMatch.name : trimmedVendor;
      const canonicalLocation = values.location?.trim() || '';

      const total = values.items.length;
      for (let i = 0; i < total; i++) {
        const item = values.items[i];
        const fieldId = fields[i]?.id;
        const imageFile = fieldId ? itemImages[fieldId]?.file : undefined;

        setSubmittingProgress(`Submitting ${i + 1} of ${total}…`);

        const formData = new FormData();
        formData.append('name', item.name.trim());
        formData.append('vendor_name', canonicalVendorName);
        formData.append('convention_slug', conventionSlug);
        if (canonicalLocation) formData.append('location', canonicalLocation);
        if (item.requirements?.trim()) formData.append('requirements', item.requirements.trim());
        if (item.description?.trim()) formData.append('description', item.description.trim());
        if (imageFile) formData.append('image', imageFile);

        await createMutation.mutateAsync(formData);
      }

      router.push(`/conventions/${conventionSlug}/freebies`);
    } catch (err: unknown) {
      setSubmittingProgress(null);
      if (err && typeof err === 'object' && 'response' in err) {
        setServerError('Failed to submit freebie(s). Please check your inputs and try again.');
      } else {
        setServerError('A network error occurred. Please check your connection.');
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
          Post Freebie Drops
        </h1>
        <p className="mt-1 text-xs text-zinc-600 sm:text-sm dark:text-zinc-300">
          Share giveaways, limited merch drops, or stamp rallies for{' '}
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
        {/* Shared Booth Details Card */}
        <div className="border-ink space-y-4 border-2 bg-white p-4 shadow-[3px_3px_0_var(--ink)] sm:p-5 dark:bg-zinc-900">
          <div className="border-ink border-b-2 border-dashed pb-2">
            <h2 className="font-display text-xs tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
              Booth & Vendor Details
            </h2>
            <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              Shared across all freebies posted in this entry.
            </p>
          </div>

          {/* Vendor / Booth Name */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="vendor_name"
                className="font-display block text-xs tracking-wider uppercase"
              >
                Vendor / Company Name <span className="text-accent">*</span>
              </label>
              <CharCounter current={selectedVendorName.length} max={50} />
            </div>
            <input
              id="vendor_name"
              type="text"
              list="existing-vendors"
              autoComplete="off"
              maxLength={50}
              placeholder="e.g. HoYoverse, Good Smile Company, Artist Table A12"
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
                    selectedVendorName.trim().toLowerCase() === v.name.toLowerCase();
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
            <div className="flex items-center justify-between">
              <label
                htmlFor="location"
                className="font-display block text-xs tracking-wider uppercase"
              >
                Booth / Hall Location
              </label>
              <CharCounter current={selectedLocation.length} max={50} />
            </div>
            <input
              id="location"
              type="text"
              maxLength={50}
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
        </div>

        {/* Dynamic Freebie Items List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xs tracking-wider text-zinc-700 uppercase dark:text-zinc-300">
              Freebie Items ({fields.length})
            </h2>
          </div>

          {fields.map((field, index) => {
            const itemVal = watchedItems[index] || { name: '', requirements: '', description: '' };
            const fieldId = field.id;
            const currentImg = itemImages[fieldId];
            const itemErrors = errors.items?.[index];

            return (
              <div
                key={field.id}
                className="border-ink space-y-4 border-2 bg-white p-4 shadow-[3px_3px_0_var(--ink)] sm:p-5 dark:bg-zinc-900"
              >
                {/* Item Card Header */}
                <div className="border-ink flex items-center justify-between border-b-2 border-dashed pb-2.5">
                  <span className="font-display text-xs tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
                    Freebie #{index + 1}
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-bold text-rose-600 uppercase transition-colors hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                {/* Item Title */}
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={`items.${index}.name`}
                      className="border-ink font-display block text-xs tracking-wider uppercase"
                    >
                      Item Name <span className="text-accent">*</span>
                    </label>
                    <CharCounter current={(itemVal.name || '').length} max={60} />
                  </div>
                  <input
                    id={`items.${index}.name`}
                    type="text"
                    maxLength={60}
                    placeholder="e.g. Genshin Impact Acrylic Standee"
                    {...register(`items.${index}.name`)}
                    className="border-ink focus:ring-accent mt-1.5 h-11 w-full border-2 bg-white px-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
                  />
                  {itemErrors?.name ? (
                    <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                      {itemErrors.name.message}
                    </p>
                  ) : null}
                </div>

                {/* Requirements / How to Get It */}
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={`items.${index}.requirements`}
                      className="font-display block text-xs tracking-wider uppercase"
                    >
                      How to Get It (Requirements)
                    </label>
                    <CharCounter current={(itemVal.requirements || '').length} max={200} />
                  </div>
                  <textarea
                    id={`items.${index}.requirements`}
                    rows={2}
                    maxLength={200}
                    placeholder="e.g. Follow @HoYoverse on X and show badge, or play demo"
                    {...register(`items.${index}.requirements`)}
                    className="border-ink focus:ring-accent mt-1.5 w-full border-2 bg-white p-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
                  />
                  {itemErrors?.requirements ? (
                    <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                      {itemErrors.requirements.message}
                    </p>
                  ) : null}
                </div>

                {/* Additional Description */}
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={`items.${index}.description`}
                      className="font-display block text-xs tracking-wider uppercase"
                    >
                      Additional Details / Notes
                    </label>
                    <CharCounter current={(itemVal.description || '').length} max={300} />
                  </div>
                  <textarea
                    id={`items.${index}.description`}
                    rows={3}
                    maxLength={300}
                    placeholder="e.g. Limited to 200 per day! Drops start at 11:00 AM."
                    {...register(`items.${index}.description`)}
                    className="border-ink focus:ring-accent mt-1.5 w-full border-2 bg-white p-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
                  />
                  {itemErrors?.description ? (
                    <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                      {itemErrors.description.message}
                    </p>
                  ) : null}
                </div>

                {/* Photo Upload for Item */}
                <div>
                  <span className="font-display block text-xs tracking-wider uppercase">
                    Photo of Item #{index + 1} (Optional)
                  </span>

                  {currentImg ? (
                    <div className="border-ink relative mt-2 aspect-video w-full max-w-sm overflow-hidden border-2 bg-zinc-100 shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-800">
                      <Image
                        src={currentImg.preview}
                        alt={`Preview #${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeItemImage(fieldId)}
                        className="border-ink absolute top-2 right-2 flex h-7 w-7 items-center justify-center border-2 bg-rose-500 text-white shadow-[2px_2px_0_var(--ink)] hover:bg-rose-600"
                      >
                        <X className="h-4 w-4 stroke-3" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor={`image-upload-${fieldId}`}
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
                        id={`image-upload-${fieldId}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleItemImageChange(fieldId, e)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add Another Item Button */}
          <button
            type="button"
            onClick={() => append({ name: '', requirements: '', description: '' })}
            className={cn(
              CONBLOCK,
              'border-ink inline-flex w-full cursor-pointer items-center justify-center gap-2 border-2 border-dashed bg-zinc-50 px-4 py-3 text-xs font-bold text-zinc-800 uppercase transition-all hover:bg-zinc-100 dark:bg-zinc-800/60 dark:text-zinc-200 dark:hover:bg-zinc-800'
            )}
          >
            <Plus className="text-accent h-4 w-4 stroke-3" />
            Add Another Freebie from this Vendor
          </button>
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
            disabled={Boolean(submittingProgress) || createMutation.isPending}
            className={cn(
              CONBLOCK_PRIMARY,
              'inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase'
            )}
          >
            {submittingProgress ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {submittingProgress}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Post {fields.length === 1 ? 'Freebie' : `${fields.length} Freebies`}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
