'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useConvention } from '@/features/conventions/data/api';
import { isFreebieMutationLocked } from '@/features/conventions/utils/dates';
import { Alert, BackLink, CONBLOCK, FormActions } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { useFreebieSettings } from '../../api';
import { useCreateFreebie } from '../../api/mutations';
import { multiFreebieSchema, type MultiFreebieFormValues } from './schema';
import { useVendorSuggestions } from './useVendorSuggestions';
import { VendorSection } from './VendorSection';
import { FreebieItemCard } from './FreebieItemCard';

export interface FreebieFormProps {
  conventionSlug: string;
  conventionName?: string;
}

export function FreebieForm({ conventionSlug, conventionName }: FreebieFormProps) {
  const { data: convention } = useConvention(conventionSlug);
  const { data: freebieSettings } = useFreebieSettings();
  const isFreebiesUnmounted =
    Boolean(convention?.unmount_freebies) || Boolean(freebieSettings?.unmount_all_freebies);
  const isLocked = isFreebieMutationLocked(convention);
  const resolvedConventionName = conventionName || convention?.name;
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
      items: [{ name: '', location: '', requirements: '', description: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const selectedVendorName = watch('vendor_name') || '';
  const watchedItems = watch('items') || [];

  const suggestions = useVendorSuggestions({
    conventionSlug,
    selectedVendorName,
    firstItemLocation: watchedItems[0]?.location || '',
    setValue,
  });

  function handleItemImageFile(fieldId: string, file: File) {
    if (itemImages[fieldId]) {
      URL.revokeObjectURL(itemImages[fieldId].preview);
    }
    const url = URL.createObjectURL(file);
    setItemImages((prev) => ({
      ...prev,
      [fieldId]: { file, preview: url },
    }));
  }

  function handleItemImageChange(fieldId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleItemImageFile(fieldId, file);
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
        if (item.location?.trim()) formData.append('location', item.location.trim());
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

  if (isFreebiesUnmounted || isLocked) {
    return (
      <div className="border-ink border-2 bg-white p-6 shadow-[6px_6px_0_var(--ink)] sm:p-8 dark:bg-zinc-900">
        <div className="mb-4">
          <BackLink href={`/conventions/${conventionSlug}/freebies`}>Back to Freebies</BackLink>
        </div>
        <div className="py-8 text-center">
          <h2 className="font-display text-lg font-bold uppercase sm:text-xl">
            {isFreebiesUnmounted ? 'Submissions Unavailable' : 'Submissions Closed'}
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            {isFreebiesUnmounted
              ? 'Freebie submissions are currently disabled for this convention.'
              : 'Freebies cannot be added after the convention has ended.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="border-ink border-b-2 pb-5">
        <BackLink href={`/conventions/${conventionSlug}/freebies`}>Back to Freebies</BackLink>

        <div className="mt-3">
          <span className="font-display text-accent-pop text-xs tracking-wider uppercase">
            {resolvedConventionName || 'Convention'}
          </span>
          <h1 className="font-display text-2xl font-black tracking-wider uppercase sm:text-3xl">
            Post Freebie Drops
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Share giveaways, limited merch drops, or stamp rallies for{' '}
            {resolvedConventionName || 'this convention'}.
          </p>
        </div>
      </div>

      {serverError ? (
        <Alert variant="error" className="p-4">
          {serverError}
        </Alert>
      ) : null}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Shared Booth Details Card */}
        <VendorSection
          register={register}
          setValue={setValue}
          errors={errors}
          selectedVendorName={selectedVendorName}
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
            const itemVal = watchedItems[index] || {
              name: '',
              location: '',
              requirements: '',
              description: '',
            };
            const fieldId = field.id;
            const currentImg = itemImages[fieldId];
            const itemErrors = errors.items?.[index];
            const vendorLocations =
              suggestions.vendorLocationsMap.get(selectedVendorName.trim().toLowerCase()) || [];

            return (
              <FreebieItemCard
                key={field.id}
                fieldId={fieldId}
                index={index}
                totalItems={fields.length}
                itemVal={itemVal}
                itemErrors={itemErrors}
                currentImage={currentImg}
                vendorLocations={vendorLocations}
                register={register}
                setValue={setValue}
                onRemoveItem={handleRemoveItem}
                onImageFileSelect={handleItemImageFile}
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
              const prevLocation = watchedItems[fields.length - 1]?.location || '';
              append({ name: '', location: prevLocation, requirements: '', description: '' });
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
              'border-ink inline-flex w-full cursor-pointer items-center justify-center gap-2 border-2 border-dashed bg-zinc-50 px-4 py-3 text-xs font-bold text-zinc-800 uppercase transition-all hover:bg-zinc-100 dark:bg-zinc-800/60 dark:text-white dark:hover:bg-zinc-800'
            )}
          >
            <Plus className="text-accent h-4 w-4 stroke-3" />
            Add Another Freebie from this Vendor
          </button>
        </div>

        {/* Submit Actions */}
        <FormActions
          cancelHref={`/conventions/${conventionSlug}/freebies`}
          submitLabel={`Post ${fields.length === 1 ? 'Freebie' : `${fields.length} Freebies`}`}
          submittingLabel={submittingProgress || 'Posting...'}
          isSubmitting={Boolean(submittingProgress) || createMutation.isPending}
          borderTop
        />
      </form>
    </div>
  );
}
