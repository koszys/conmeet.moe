import { ConventionRow } from './ConventionRow';
import { ConventionRequest } from './ConventionRequest';
import { CONVENTIONS } from '../data/conventions';
import { getConventionPhase } from '../utils/dates';
import type { Convention, ConventionPhase } from '../types';

interface ConventionGroup {
  phase: ConventionPhase;
  label: string;
  chipClassName: string;
  conventions: Convention[];
}

export function ConventionGrid() {
  const now = CONVENTIONS.filter((convention) => getConventionPhase(convention) === 'now');
  const soon = CONVENTIONS.filter((convention) => getConventionPhase(convention) === 'soon');
  const later = CONVENTIONS.filter((convention) => getConventionPhase(convention) === 'up');

  const groups: ConventionGroup[] = [
    {
      phase: 'now',
      label: 'HAPPENING NOW',
      chipClassName: 'bg-accent-pop text-white',
      conventions: now,
    },
    {
      phase: 'soon',
      label: 'SOON!',
      chipClassName: 'bg-accent text-white',
      conventions: soon,
    },
    {
      phase: 'up',
      label: 'COMING UP',
      chipClassName: 'border-2 border-ink text-ink dark:text-zinc-100',
      conventions: later,
    },
  ];

  const sections = groups.filter((group) => group.conventions.length > 0);

  return (
    <section id="conventions" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 md:px-6">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-wide uppercase sm:text-4xl">
            the line-up!
            <span className="text-accent-pop ml-3">✦</span>
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">
            Only conventions currently on this site are listed here — not every con out there!
          </p>
        </div>
      </div>

      {sections.map((group) => (
        <div key={group.phase} className="border-ink mt-8 border-t-2 first:mt-12">
          <h3 className="font-display mt-10 flex items-center gap-3 text-lg tracking-wide uppercase">
            <span className={`${group.chipClassName} inline-flex items-center px-2 py-1 text-xs`}>
              {group.label}
            </span>
          </h3>
          <div className="mt-4">
            {group.conventions.map((convention) => (
              <ConventionRow key={convention.id} convention={convention} phase={group.phase} />
            ))}
          </div>
        </div>
      ))}

      <ConventionRequest />
    </section>
  );
}
