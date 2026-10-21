'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface CopyLinkButtonProps {
  /** Optional custom URL to copy. If omitted, uses current window.location.href */
  url?: string;
  /** Label when in normal state (default: 'Copy Link') */
  label?: string;
  /** Label when link has been copied (default: 'Copied!') */
  copiedLabel?: string;
  /** Visual variant: full button, icon-only button, or text ghost link */
  variant?: 'button' | 'icon' | 'ghost' | 'responsive';
  /** Size variant */
  size?: 'sm' | 'md';
  /** Additional custom class names */
  className?: string;
  /** Callback fired after successful copy */
  onCopy?: (url: string) => void;
}

export function CopyLinkButton({
  url,
  label = 'Copy Link',
  copiedLabel = 'Copied!',
  variant = 'button',
  size = 'md',
  className,
  onCopy,
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  async function handleCopy() {
    const textToCopy = url || (typeof window !== 'undefined' ? window.location.href : '');
    if (!textToCopy) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for non-HTTPS or webview environments
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      onCopy?.(textToCopy);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link to clipboard:', err);
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const tooltip = copied ? 'Link copied to clipboard!' : 'Copy link to this page';

  if (variant === 'responsive') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        title={tooltip}
        aria-label={tooltip}
        className={cn(
          'border-ink inline-flex shrink-0 cursor-pointer items-center justify-center border-2 bg-white font-bold whitespace-nowrap uppercase shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none dark:bg-zinc-900',
          size === 'sm'
            ? 'h-8 w-8 p-0 text-xs @min-[680px]:w-auto @min-[680px]:gap-1.5 @min-[680px]:px-3'
            : 'h-10 w-10 p-0 text-xs @min-[680px]:w-auto @min-[680px]:gap-2 @min-[680px]:px-4',
          copied
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
            : 'text-zinc-900 hover:bg-zinc-50 dark:text-white dark:hover:bg-zinc-800',
          className
        )}
      >
        {copied ? (
          <>
            <Check
              className={cn(
                'animate-pill-pop shrink-0 stroke-[2.5] text-emerald-600 dark:text-emerald-400',
                size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
              )}
            />
            <span className="animate-pill-pop hidden @min-[680px]:inline">{copiedLabel}</span>
          </>
        ) : (
          <>
            <LinkIcon className={cn('shrink-0', size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
            <span className="hidden @min-[680px]:inline">{label}</span>
          </>
        )}
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        title={tooltip}
        aria-label={tooltip}
        className={cn(
          'border-ink inline-flex shrink-0 cursor-pointer items-center justify-center border-2 bg-white shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none dark:bg-zinc-900',
          size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
          copied
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
            : 'text-zinc-900 hover:bg-zinc-50 dark:text-white dark:hover:bg-zinc-800',
          className
        )}
      >
        {copied ? (
          <Check
            className={cn(
              'animate-pill-pop stroke-[2.5] text-emerald-600 dark:text-emerald-400',
              size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
            )}
          />
        ) : (
          <LinkIcon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        )}
      </button>
    );
  }

  if (variant === 'ghost') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        title={tooltip}
        aria-label={tooltip}
        className={cn(
          'inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold tracking-wider uppercase transition-colors',
          copied ? 'text-emerald-600 dark:text-emerald-400' : 'text-accent hover:text-accent-pop',
          className
        )}
      >
        {copied ? (
          <>
            <Check className="animate-pill-pop h-3.5 w-3.5 stroke-[2.5]" />
            <span className="animate-pill-pop">{copiedLabel}</span>
          </>
        ) : (
          <>
            <LinkIcon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={tooltip}
      aria-label={tooltip}
      className={cn(
        'border-ink inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 border-2 bg-white font-bold uppercase shadow-[2px_2px_0_var(--ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-0.5 active:translate-y-0.5 active:shadow-none dark:bg-zinc-900',
        size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-4 text-xs sm:px-4.5',
        copied
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
          : 'text-zinc-900 hover:bg-zinc-50 dark:text-white dark:hover:bg-zinc-800',
        className
      )}
    >
      {copied ? (
        <>
          <Check
            className={cn(
              'animate-pill-pop stroke-[2.5] text-emerald-600 dark:text-emerald-400',
              size === 'sm' ? 'h-3.5 w-3.5' : 'h-3.5 w-3.5'
            )}
          />
          <span className="animate-pill-pop">{copiedLabel}</span>
        </>
      ) : (
        <>
          <LinkIcon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-3.5 w-3.5'} />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
