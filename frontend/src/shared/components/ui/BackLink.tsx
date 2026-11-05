'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface BackLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function BackLink({ href, children, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'font-display hover:text-accent-pop group inline-flex items-center gap-2 text-xs tracking-wider text-zinc-600 uppercase transition-colors dark:text-zinc-400',
        className
      )}
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
      <span>{children}</span>
    </Link>
  );
}
