import Link from 'next/link';
import { ArrowUpRight, Star } from 'lucide-react';
import { CONBLOCK } from '@/shared/components/ui/button';
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
        CONBLOCK,
        'text-ink hover:border-accent-pop hover:text-accent-pop inline-flex items-center gap-1.5 bg-white px-3.5 py-1.5 text-xs font-bold tracking-widest uppercase hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
        className
      )}
    >
      <Star className="text-accent-pop h-3.5 w-3.5 fill-current" />
      <span>Featured Cons</span>
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}
