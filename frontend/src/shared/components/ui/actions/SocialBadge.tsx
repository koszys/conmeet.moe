'use client';

import type { ComponentType } from 'react';
import { Globe } from 'lucide-react';
import { CONBLOCK } from './Button';
import { cn } from '@/shared/lib/utils';

export type SocialBadgePlatform =
  'instagram' | 'twitter' | 'tiktok' | 'bluesky' | 'discord' | 'kofi' | 'website' | string;

export function InstagramIcon({ className }: { className?: string }) {
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

export function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.34 6.34 0 0 0 1.86-4.49V8.65a8.28 8.28 0 0 0 4.91 1.58V6.78a4.83 4.83 0 0 1-1-.09z" />
    </svg>
  );
}

export function BlueskyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566 1.01 1 1.764 1 4.5c0 1.25.433 7.828 1.084 9.176.84 1.74 3.018 2.32 4.916 1.95-3.056 1.205-5.9 3.447-3.642 6.374 2.458 3.186 6.577.29 8.642-4.04 2.065 4.33 6.184 7.226 8.642 4.04 2.258-2.927-.586-5.17-3.642-6.374 1.898.37 4.076-.21 4.916-1.95C22.567 12.328 23 5.75 23 4.5c0-2.736-1.566-3.49-4.202-1.695C16.046 4.747 13.087 8.686 12 10.8z" />
    </svg>
  );
}

export function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export function KofiIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.022 5.84s-4.464 4.14-4.632 4.298c-.407.382-1.085.37-1.481-.025l-2.946-2.936c-.957-.954-.957-2.502 0-3.456.957-.954 2.509-.954 3.466 0l.221.22.221-.22c.957-.954 2.509-.954 3.466 0 .957.954.957 2.502 0 3.456l-1.021 1.021 2.706-2.358zm6.541-2.909c-.198 1.139-1.246 1.834-2.339 1.551-.129-.033-.254-.085-.373-.153l.261-3.691c1.391-.005 2.65 1.154 2.451 2.293z" />
    </svg>
  );
}

export const SOCIAL_PLATFORMS: Record<
  string,
  {
    name: string;
    icon: ComponentType<{ className?: string }>;
    getUrl: (val: string) => string;
    formatLabel: (val: string) => string;
  }
> = {
  instagram: {
    name: 'Instagram',
    icon: InstagramIcon,
    getUrl: (v) => (v.startsWith('http') ? v : `https://instagram.com/${v.replace(/^@/, '')}`),
    formatLabel: (v) =>
      v.startsWith('http')
        ? v.split('/').filter(Boolean).pop() || v
        : v.startsWith('@')
          ? v
          : `@${v}`,
  },
  twitter: {
    name: 'X (Twitter)',
    icon: TwitterIcon,
    getUrl: (v) => (v.startsWith('http') ? v : `https://x.com/${v.replace(/^@/, '')}`),
    formatLabel: (v) =>
      v.startsWith('http')
        ? v.split('/').filter(Boolean).pop() || v
        : v.startsWith('@')
          ? v
          : `@${v}`,
  },
  tiktok: {
    name: 'TikTok',
    icon: TikTokIcon,
    getUrl: (v) => (v.startsWith('http') ? v : `https://tiktok.com/@${v.replace(/^@/, '')}`),
    formatLabel: (v) =>
      v.startsWith('http')
        ? v.split('/').filter(Boolean).pop() || v
        : v.startsWith('@')
          ? v
          : `@${v}`,
  },
  bluesky: {
    name: 'Bluesky',
    icon: BlueskyIcon,
    getUrl: (v) => (v.startsWith('http') ? v : `https://bsky.app/profile/${v.replace(/^@/, '')}`),
    formatLabel: (v) =>
      v.startsWith('http')
        ? v.split('/').filter(Boolean).pop() || v
        : v.startsWith('@')
          ? v
          : `@${v}`,
  },
  discord: {
    name: 'Discord',
    icon: DiscordIcon,
    getUrl: (v) => (v.startsWith('http') ? v : `https://discord.gg/${v}`),
    formatLabel: (v) => v,
  },
  kofi: {
    name: 'Ko-fi',
    icon: KofiIcon,
    getUrl: (v) => (v.startsWith('http') ? v : `https://ko-fi.com/${v.replace(/^@/, '')}`),
    formatLabel: (v) =>
      v.startsWith('http')
        ? v.split('/').filter(Boolean).pop() || v
        : v.startsWith('@')
          ? v
          : `@${v}`,
  },
  website: {
    name: 'Website',
    icon: Globe,
    getUrl: (v) => (v.startsWith('http') ? v : `https://${v}`),
    formatLabel: (v) => v.replace(/^https?:\/\//, '').replace(/\/$/, ''),
  },
};

export interface SocialBadgeProps {
  platform: SocialBadgePlatform;
  value: string;
  label?: string;
  size?: 'xs' | 'sm';
  className?: string;
}

export function SocialBadge({ platform, value, label, size = 'sm', className }: SocialBadgeProps) {
  const normKey = platform.toLowerCase();
  const config = SOCIAL_PLATFORMS[normKey] || {
    name: platform,
    icon: Globe,
    getUrl: (v: string) => (v.startsWith('http') ? v : `https://${v}`),
    formatLabel: (v: string) => v,
  };

  const Icon = config.icon;
  const href = config.getUrl(value);
  const displayLabel = label || config.formatLabel(value);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        CONBLOCK,
        'hover:border-accent-pop hover:text-accent-pop dark:hover:border-accent-pop dark:hover:text-accent-pop',
        'inline-flex items-center gap-1.5 bg-white text-zinc-800 transition-all dark:bg-zinc-800 dark:text-zinc-200',
        size === 'xs' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs font-bold',
        className
      )}
    >
      <Icon className={cn(size === 'xs' ? 'h-3 w-3' : 'h-3.5 w-3.5', 'shrink-0')} />
      <span>{displayLabel}</span>
    </a>
  );
}

export interface SocialBadgesProps {
  links?:
    Record<string, string | undefined | null> | { [key: string]: string | undefined | null } | null;
  size?: 'xs' | 'sm';
  className?: string;
}

export function SocialBadges({ links, size = 'sm', className }: SocialBadgesProps) {
  if (!links) return null;

  const validEntries = Object.entries(links).filter(([, val]) =>
    Boolean(val && typeof val === 'string' && val.trim().length > 0)
  ) as [string, string][];

  if (validEntries.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {validEntries.map(([platform, val]) => (
        <SocialBadge key={platform} platform={platform} value={val} size={size} />
      ))}
    </div>
  );
}
