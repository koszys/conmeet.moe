import { Star } from 'lucide-react';

const ITEMS = ['FREEBIES', 'MEETUPS', 'SCHEDULES', 'COMMUNITY', 'HAVE FUN'];

export function Marquee() {
  const row = [...ITEMS, ...ITEMS];

  return (
    <div className="border-ink bg-accent-soft overflow-hidden border-y-2 py-3 dark:bg-zinc-900">
      <div className="animate-marquee flex w-max whitespace-nowrap">
        {row.map((item, index) => (
          <span
            key={index}
            className="font-display flex items-center gap-3 px-8 text-xs tracking-[0.3em] uppercase"
          >
            {item}
            <Star className="fill-accent-pop text-accent-pop h-3 w-3" />
          </span>
        ))}
      </div>
    </div>
  );
}
