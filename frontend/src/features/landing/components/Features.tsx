import { CalendarDays, Gift, Users } from 'lucide-react';

const FEATURES = [
  {
    id: 'freebies',
    title: 'Freebie Tracker',
    description:
      'Community-submitted swag and giveaways, so you never walk past the booth giving out the good stuff.',
    icon: Gift,
  },
  {
    id: 'meetups',
    title: 'Meetups',
    description:
      'Official and unofficial gatherings with a simple Going/RSVP system and public headcounts.',
    icon: Users,
  },
  {
    id: 'schedules',
    title: 'Personal Schedule',
    description:
      'Combine events and saved meetups into one chronological timeline to avoid overlapping plans.',
    icon: CalendarDays,
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:px-6">
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
        Everything for your next convention
      </h2>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
        One place to find and organize what matters at the con.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.id}
            id={feature.id}
            className="scroll-mt-24 rounded-xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="bg-accent-soft flex h-11 w-11 items-center justify-center rounded-lg">
              <feature.icon className="text-accent h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
