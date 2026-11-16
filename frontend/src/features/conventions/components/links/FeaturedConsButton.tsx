import Link from 'next/link';
import { ArrowUpRight, Star } from 'lucide-react';
import { CONBLOCK_SECONDARY } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

export interface FeaturedConsButtonProps {
  href?: string;
  className?: string;
}

export function FeaturedConsButton({
  href = '/conventions/featured',
  className,
}: FeaturedConsButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        CONBLOCK_SECONDARY,
        'inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold tracking-widest uppercase',
        className
      )}
    >
      <Star className="text-accent-pop h-3.5 w-3.5 fill-current" />
      <span>Featured Cons</span>
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}
