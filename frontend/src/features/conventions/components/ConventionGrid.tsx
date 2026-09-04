import { ConventionCard } from './ConventionCard';
import { CONVENTIONS } from '../data/conventions';

const ACTIVE = CONVENTIONS.filter((convention) => convention.status === 'active');
const UPCOMING = CONVENTIONS.filter((convention) => convention.status === 'upcoming');

export function ConventionGrid() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          Active Conventions
        </h2>
        <span className="text-sm text-zinc-500">{ACTIVE.length} upcoming</span>
      </div>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
        Conventions happening soon. Placeholder data for now.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ACTIVE.map((convention) => (
          <ConventionCard key={convention.id} convention={convention} />
        ))}
      </div>

      <h2 className="mt-16 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
        Coming Soon
      </h2>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
        Planning ahead? Here&apos;s what&apos;s on the horizon.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {UPCOMING.map((convention) => (
          <ConventionCard key={convention.id} convention={convention} />
        ))}
      </div>
    </>
  );
}
