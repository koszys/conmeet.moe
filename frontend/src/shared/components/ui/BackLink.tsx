'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface BackLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function BackLink({ href, children, className, onClick }: BackLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'font-display group hover:text-accent-pop dark:hover:text-accent-pop inline-flex items-center gap-2 text-xs font-bold tracking-wider text-zinc-800 uppercase transition-colors dark:text-white',
        className
      )}
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
      <span>{children}</span>
    </Link>
  );
}
