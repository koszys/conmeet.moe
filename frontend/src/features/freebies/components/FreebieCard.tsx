'use client';

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Bookmark, Check, MapPin, Square } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import type { Freebie } from '../types';
import { useToggleClaimFreebie, useToggleSaveFreebie } from '../api/mutations';

export function FreebieCard({ freebie, className }: { freebie: Freebie; className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const toggleSave = useToggleSaveFreebie();
  const toggleClaim = useToggleClaimFreebie();

  function requireAuthAction(action: () => void) {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    action();
  }

  function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    requireAuthAction(() => {
      toggleSave.mutate(freebie.id);
    });
  }

  function handleClaim(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    requireAuthAction(() => {
      toggleClaim.mutate(freebie.id);
    });
  }

  const imageUrl = freebie.image_thumb || freebie.image;

  return (
    <article
      className={cn(
        'border-ink group flex flex-col justify-between border-2 bg-white shadow-[4px_4px_0_var(--ink)] transition-transform hover:-translate-y-0.5 dark:bg-zinc-900',
        freebie.is_claimed && 'opacity-90',
        className
      )}
    >
      <div>
        {/* Optional Image Header */}
        {imageUrl ? (
          <div className="border-ink relative aspect-video w-full overflow-hidden border-b-2 bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={imageUrl}
              alt={freebie.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            {freebie.is_claimed && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                <span className="border-ink border-2 bg-emerald-400 px-3 py-1 font-mono text-xs font-black tracking-widest text-black uppercase shadow-[2px_2px_0_var(--ink)]">
                  CLAIMED
                </span>
              </div>
            )}
          </div>
        ) : null}

        <div className="p-4 sm:p-5">
          {/* Vendor and Booth Location Row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
              {freebie.vendor.name}
            </span>
            {freebie.location ? (
              <span className="border-ink inline-flex items-center gap-1 border bg-amber-300 px-2 py-0.5 font-mono text-[11px] font-black text-black uppercase dark:bg-amber-400">
                <MapPin className="h-3 w-3" />
                {freebie.location}
              </span>
            ) : null}
          </div>

          {/* Title */}
          <h3
            className={cn(
              'font-display mt-2.5 text-base tracking-wide uppercase sm:text-lg',
              freebie.is_claimed
                ? 'text-zinc-500 line-through decoration-zinc-400 decoration-2 dark:text-zinc-400'
                : 'text-zinc-900 dark:text-zinc-50'
            )}
          >
            {freebie.name}
          </h3>

          {/* Requirements Box */}
          {freebie.requirements ? (
            <div className="border-ink mt-3 border bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
              <span className="block text-[10px] font-black tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
                How to get it:
              </span>
              <p className="mt-0.5 text-xs text-zinc-800 dark:text-zinc-200">
                {freebie.requirements}
              </p>
            </div>
          ) : null}

          {/* Description */}
          {freebie.description ? (
            <p className="mt-2.5 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-300">
              {freebie.description}
            </p>
          ) : null}
        </div>
      </div>

      {/* Action Footer */}
      <div className="border-ink border-t-2 bg-zinc-50 p-3 sm:px-4 dark:bg-zinc-800/40">
        <div className="flex items-center justify-between gap-3">
          {/* Check off / Claim button */}
          <button
            type="button"
            onClick={handleClaim}
            disabled={toggleClaim.isPending}
            className={cn(
              CONBLOCK,
              'flex-1 text-xs font-bold uppercase transition-all',
              freebie.is_claimed
                ? 'border-emerald-600 bg-emerald-400 text-black hover:bg-emerald-300 dark:border-emerald-400'
                : 'bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800'
            )}
          >
            {freebie.is_claimed ? (
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 stroke-[3]" />
                CLAIMED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                <Square className="h-3.5 w-3.5" />
                CHECK OFF
              </span>
            )}
          </button>

          {/* Save / Bookmark button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={toggleSave.isPending}
            aria-label={freebie.is_saved ? 'Remove from saved' : 'Save freebie'}
            className={cn(
              CONBLOCK,
              'inline-flex items-center gap-1.5 px-3 text-xs font-bold transition-all',
              freebie.is_saved
                ? 'bg-accent text-white hover:brightness-110'
                : 'bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
            )}
          >
            <Bookmark className={cn('h-3.5 w-3.5', freebie.is_saved && 'fill-current')} />
            <span>{freebie.save_count}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
