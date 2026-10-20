import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CONBLOCK } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export interface AllConsButtonProps {
  count?: number;
  tab?: 'upcoming' | 'past' | 'recently-ended';
  view?: 'featured' | 'list';
  href?: string;
  className?: string;
}

export function AllConsButton({ count, tab, view = 'list', href, className }: AllConsButtonProps) {
  const queryParts: string[] = [];
  if (view) queryParts.push(`view=${view}`);
  if (tab === 'past') {
    queryParts.push('tab=past');
  } else if (tab === 'recently-ended') {
    queryParts.push('tab=recently-ended');
  }
  const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  const targetHref = href ?? `/conventions${query}`;
  const label = count !== undefined ? `All Cons (${count})` : 'All Cons';

  return (
    <Link
      href={targetHref}
      className={cn(
        CONBLOCK,
        'text-ink hover:border-accent-pop hover:text-accent-pop inline-flex items-center gap-1.5 bg-white px-3.5 py-1.5 text-xs font-bold tracking-widest uppercase hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
        className
      )}
    >
      <span>{label}</span>
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}
