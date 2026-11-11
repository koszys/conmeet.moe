'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { MikuGif, type MikuGifSize } from './MikuGif';

const DEFAULT_CON_MESSAGES = [
  'Checking the convention schedule...',
  'Scanning for meetup drops...',
  'Locating badge pick-up...',
  'Preparing photoshoot coordinates...',
  'Warming up the vocaloids...',
  'Tuning into the con frequency...',
];

export interface MikuLoaderProps {
  /** Custom heading or speech message */
  message?: ReactNode;
  /** Secondary subtitle or helper note */
  subtext?: ReactNode;
  /** Size preset for Miku mascot */
  size?: MikuGifSize | number;
  /** Visual presentation style: 'card' (framed brutalist box) or 'plain' (transparent container) */
  variant?: 'card' | 'plain';
  /** Extra wrapper classes */
  className?: string;
}

export function MikuLoader({
  message,
  subtext,
  size = 'lg',
  variant = 'card',
  className,
}: MikuLoaderProps) {
  const [randomMessage, setRandomMessage] = useState<string>(DEFAULT_CON_MESSAGES[0]);

  useEffect(() => {
    if (!message) {
      const idx = Math.floor(Math.random() * DEFAULT_CON_MESSAGES.length);
      setRandomMessage(DEFAULT_CON_MESSAGES[idx]);
    }
  }, [message]);

  const speechText = message ?? randomMessage;

  const content = (
    <>
      <MikuGif size={size} variant="frameless" speech={speechText} speechPosition="top" priority />
      {subtext && (
        <p className="mt-3 font-mono text-xs tracking-wider text-zinc-500 uppercase dark:text-zinc-400">
          {subtext}
        </p>
      )}
    </>
  );

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center p-6 text-center', className)}
    >
      {variant === 'card' ? (
        <div className="border-ink inline-flex flex-col items-center border-2 bg-white p-6 shadow-[4px_4px_0_var(--ink)] dark:bg-zinc-900">
          {content}
        </div>
      ) : (
        content
      )}
    </div>
  );
}
