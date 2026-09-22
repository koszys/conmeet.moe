'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { cn } from '@/shared/lib/utils';

function subscribe(callback: () => void) {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

function getColumnCountSnapshot(): number {
  if (typeof window === 'undefined') return 3;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 640) return 2;
  return 1;
}

function getServerSnapshot(): number {
  return 3;
}

export function MasonryGrid<T>({
  items,
  renderItem,
  className,
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}) {
  const columnCount = useSyncExternalStore(subscribe, getColumnCountSnapshot, getServerSnapshot);

  const columns = useMemo(() => {
    const count = Math.max(1, columnCount);
    const cols: T[][] = Array.from({ length: count }, () => []);
    items.forEach((item, index) => {
      cols[index % count].push(item);
    });
    return cols;
  }, [items, columnCount]);

  return (
    <div className={cn('flex items-start gap-5', className)}>
      {columns.map((colItems, colIdx) => (
        <div key={colIdx} className="flex min-w-0 flex-1 flex-col gap-5">
          {colItems.map((item, itemIdx) => renderItem(item, itemIdx))}
        </div>
      ))}
    </div>
  );
}
