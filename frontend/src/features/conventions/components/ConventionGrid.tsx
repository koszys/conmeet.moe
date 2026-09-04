import { ConventionRow } from './ConventionRow';
import { ConventionRequest } from './ConventionRequest';
import { CONVENTIONS } from '../data/conventions';

const ACTIVE = CONVENTIONS.filter((convention) => convention.status === 'active');
const UPCOMING = CONVENTIONS.filter((convention) => convention.status === 'upcoming');

export function ConventionGrid() {
  return (
    <section id="conventions" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 md:px-6">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-4xl tracking-tight uppercase sm:text-5xl">
            the line-up!
            <span className="text-accent-pop ml-3">✦</span>
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Only conventions currently on this site are listed here — not every con out there!
          </p>
        </div>
      </div>

      <div className="border-ink mt-12 border-t-2">
        <h3 className="font-display mt-10 flex items-center gap-3 text-2xl tracking-wide uppercase">
          <span className="bg-accent-pop px-2 py-0.5 text-sm text-white">HAPPENING NOW</span>
        </h3>
        <div className="mt-4">
          {ACTIVE.map((convention, index) => (
            <ConventionRow key={convention.id} convention={convention} index={index} />
          ))}
        </div>
      </div>

      <div className="border-ink border-t-2">
        <h3 className="font-display mt-10 flex items-center gap-3 text-2xl tracking-wide uppercase">
          <span className="bg-accent px-2 py-0.5 text-sm text-white">NEXT UP</span>
        </h3>
        <div className="mt-4">
          {UPCOMING.map((convention, index) => (
            <ConventionRow
              key={convention.id}
              convention={convention}
              index={ACTIVE.length + index}
            />
          ))}
        </div>
      </div>

      <ConventionRequest />
    </section>
  );
}
