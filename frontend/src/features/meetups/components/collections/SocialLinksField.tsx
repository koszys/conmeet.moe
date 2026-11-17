'use client';

import { Globe } from 'lucide-react';
import { TextInput } from '@/shared/components/ui';
import type { SocialLinks } from '../../types';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.34 6.34 0 0 0 1.86-4.49V8.65a8.28 8.28 0 0 0 4.91 1.58V6.78a4.83 4.83 0 0 1-1-.09z" />
    </svg>
  );
}

function BlueskyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566 1.01 1 1.764 1 4.5c0 1.25.433 7.828 1.084 9.176.84 1.74 3.018 2.32 4.916 1.95-3.056 1.205-5.9 3.447-3.642 6.374 2.458 3.186 6.577.29 8.642-4.04 2.065 4.33 6.184 7.226 8.642 4.04 2.258-2.927-.586-5.17-3.642-6.374 1.898.37 4.076-.21 4.916-1.95C22.567 12.328 23 5.75 23 4.5c0-2.736-1.566-3.49-4.202-1.695C16.046 4.747 13.087 8.686 12 10.8z" />
    </svg>
  );
}

export interface SocialLinksFieldProps {
  value: SocialLinks;
  onChange: (links: SocialLinks) => void;
}

export function SocialLinksField({ value, onChange }: SocialLinksFieldProps) {
  return (
    <div className="border-ink border-2 bg-zinc-50/70 p-3.5 shadow-[3px_3px_0_var(--ink)] sm:p-5 dark:bg-zinc-950/60">
      <div className="flex items-center gap-2">
        <Globe className="text-accent dark:text-accent-soft h-4 w-4 shrink-0" />
        <span className="font-display text-xs tracking-wider uppercase">
          Photographer & Social Credits (Optional)
        </span>
      </div>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
        Add your handles or links so cosplayers, models, and attendees know who to credit and tag.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="social-instagram"
            className="font-display block text-[11px] tracking-wider text-zinc-600 uppercase dark:text-zinc-400"
          >
            Instagram
          </label>
          <TextInput
            id="social-instagram"
            icon={InstagramIcon}
            value={value.instagram || ''}
            onChange={(e) => onChange({ ...value, instagram: e.target.value })}
            onClear={() => onChange({ ...value, instagram: '' })}
            placeholder="@photographer"
            wrapperClassName="mt-1"
            inputSize="sm"
          />
        </div>

        <div>
          <label
            htmlFor="social-twitter"
            className="font-display block text-[11px] tracking-wider text-zinc-600 uppercase dark:text-zinc-400"
          >
            X / Twitter
          </label>
          <TextInput
            id="social-twitter"
            icon={TwitterIcon}
            value={value.twitter || ''}
            onChange={(e) => onChange({ ...value, twitter: e.target.value })}
            onClear={() => onChange({ ...value, twitter: '' })}
            placeholder="@photographer"
            wrapperClassName="mt-1"
            inputSize="sm"
          />
        </div>

        <div>
          <label
            htmlFor="social-tiktok"
            className="font-display block text-[11px] tracking-wider text-zinc-600 uppercase dark:text-zinc-400"
          >
            TikTok
          </label>
          <TextInput
            id="social-tiktok"
            icon={TikTokIcon}
            value={value.tiktok || ''}
            onChange={(e) => onChange({ ...value, tiktok: e.target.value })}
            onClear={() => onChange({ ...value, tiktok: '' })}
            placeholder="@photographer"
            wrapperClassName="mt-1"
            inputSize="sm"
          />
        </div>

        <div>
          <label
            htmlFor="social-bluesky"
            className="font-display block text-[11px] tracking-wider text-zinc-600 uppercase dark:text-zinc-400"
          >
            Bluesky
          </label>
          <TextInput
            id="social-bluesky"
            icon={BlueskyIcon}
            value={value.bluesky || ''}
            onChange={(e) => onChange({ ...value, bluesky: e.target.value })}
            onClear={() => onChange({ ...value, bluesky: '' })}
            placeholder="@handle.bsky.social"
            wrapperClassName="mt-1"
            inputSize="sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="social-website"
            className="font-display block text-[11px] tracking-wider text-zinc-600 uppercase dark:text-zinc-400"
          >
            Website / Portfolio
          </label>
          <TextInput
            id="social-website"
            icon={Globe}
            value={value.website || ''}
            onChange={(e) => onChange({ ...value, website: e.target.value })}
            onClear={() => onChange({ ...value, website: '' })}
            placeholder="https://myphotos.com"
            wrapperClassName="mt-1"
            inputSize="sm"
          />
        </div>
      </div>
    </div>
  );
}
