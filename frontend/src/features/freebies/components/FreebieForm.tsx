'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { useCreateFreebie } from '../api/mutations';
import {
  multiFreebieSchema,
  type MultiFreebieFormValues,
  useVendorSuggestions,
  VendorSection,
  FreebieItemCard,
} from './form';

export function FreebieForm({
  conventionSlug,
  conventionName,
}: {
  conventionSlug: string;
  conventionName?: string;
}) {
  const router = useRouter();
  const createMutation = useCreateFreebie();

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

  const suggestions = useVendorSuggestions({
    conventionSlug,
    selectedVendorName,
    selectedLocation,
    setValue,
  });

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
      const existingMatch = suggestions.combinedVendors.find(
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
        <VendorSection
          register={register}
          setValue={setValue}
          errors={errors}
          selectedVendorName={selectedVendorName}
          selectedLocation={selectedLocation}
          suggestions={suggestions}
        />

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
              <FreebieItemCard
                key={field.id}
                fieldId={fieldId}
                index={index}
                totalItems={fields.length}
                itemVal={itemVal}
                itemErrors={itemErrors}
                currentImage={currentImg}
                register={register}
                onRemoveItem={handleRemoveItem}
                onImageChange={handleItemImageChange}
                onImageRemove={removeItemImage}
              />
            );
          })}

          {/* Add Another Item Button */}
          <button
            type="button"
            onClick={() => {
              const nextIndex = fields.length;
              append({ name: '', requirements: '', description: '' });
              requestAnimationFrame(() => {
                const target = document.getElementById(`items.${nextIndex}.name`);
                if (target) {
                  target.focus();
                  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              });
            }}
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
