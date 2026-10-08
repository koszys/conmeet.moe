'use client';

import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import type { MultiFreebieFormValues } from './schema';
import { VendorPicker } from './VendorPicker';
import type { useVendorSuggestions } from './useVendorSuggestions';

interface VendorSectionProps {
  register?: UseFormRegister<MultiFreebieFormValues>;
  setValue: UseFormSetValue<MultiFreebieFormValues>;
  errors: FieldErrors<MultiFreebieFormValues>;
  selectedVendorName: string;
  suggestions: ReturnType<typeof useVendorSuggestions>;
}

export function VendorSection({
  setValue,
  errors,
  selectedVendorName,
  suggestions,
}: VendorSectionProps) {
  return (
    <div className="border-ink space-y-4 border-2 bg-white p-4 shadow-[3px_3px_0_var(--ink)] sm:p-5 dark:bg-zinc-900">
      <div className="border-ink border-b-2 border-dashed pb-2">
        <h2 className="font-display text-xs tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
          Vendor Details
        </h2>
        <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
          All freebies below will be posted under this vendor.
        </p>
      </div>

      <VendorPicker
        id="vendor_name"
        value={selectedVendorName}
        onChange={(val) => setValue('vendor_name', val, { shouldValidate: true })}
        onLocationAutoFill={(loc) => setValue('items.0.location', loc, { shouldValidate: true })}
        error={errors.vendor_name?.message}
        suggestions={suggestions}
      />
    </div>
  );
}
