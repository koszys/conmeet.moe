import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
import { ConventionRequestForm } from '@/features/conventions';
import { BackLink } from '@/shared/components/ui';

export const metadata: Metadata = {
  title: 'Request a Convention',
  description: 'Submit a new convention request to be listed on conmeet.moe.',
};

export default function ConventionRequestPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:py-12">
      {/* Back link */}
      <BackLink href="/conventions" className="mb-6">
        Back to Conventions
      </BackLink>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <span className="border-ink bg-accent-pop font-display inline-flex items-center gap-1.5 border-2 px-2.5 py-1 text-xs text-white uppercase shadow-[2px_2px_0_var(--ink)]">
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            COMMUNITY SUBMISSION
          </span>
        </div>

        <h1 className="font-display mt-3 text-2xl tracking-wide uppercase sm:text-3xl md:text-4xl">
          Request a Convention
          <span className="text-accent ml-3">✦</span>
        </h1>

        <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-300">
          Know of a con that isn&apos;t listed yet? Fill in the details below. Each submission is
          reviewed and added to the platform.
        </p>
      </div>

      {/* Form */}
      <ConventionRequestForm />
    </main>
  );
}
