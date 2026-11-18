'use client';

import { Globe } from 'lucide-react';
import {
  BlueskyIcon,
  InstagramIcon,
  SocialBadge,
  SocialBadges,
  TextInput,
  TikTokIcon,
  TwitterIcon,
} from '@/shared/components/ui';
import type { SocialLinks } from '../../types';

export { SocialBadge, SocialBadges };

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
          Social Credits (Optional)
        </span>
      </div>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
        Add your handles for credit or so others can find you!
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
