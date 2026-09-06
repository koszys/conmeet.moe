import { CalendarDays, Gift, Users } from 'lucide-react';

const FEATURES = [
  {
    id: 'freebies',
    title: 'Freebies',
    description:
      'Community-submitted freebies, with the ability to keep track of what you already got!',
    icon: Gift,
  },
  {
    id: 'meetups',
    title: 'Meetups',
    description:
      'Official and unofficial gatherings with a simple Going/RSVP system and public headcounts. Find others who are also attending to share your socials, pictures, etc!',
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
    <section id="features" className="halftone border-ink relative scroll-mt-20 border-y-2 py-20">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <h2 className="font-display text-xl tracking-wide uppercase sm:text-3xl">how it works!</h2>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">
          Three little things that make every con way less stressful. Pick a convention, plan your
          day, show up and have fun!
        </p>

        <ol className="mt-10">
          {FEATURES.map((feature, index) => (
            <li
              key={feature.id}
              id={feature.id}
              className="group border-ink flex scroll-mt-24 flex-row items-start gap-3 border-b-2 border-dashed py-8 transition-colors last:border-b-0 sm:gap-4 md:gap-8"
            >
              <div className="flex shrink-0 flex-col items-center gap-2">
                <span className="font-display text-accent group-hover:text-accent-pop text-2xl leading-none transition-colors sm:text-3xl md:text-4xl">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="border-ink flex h-10 w-10 items-center justify-center rounded-none border-2 bg-white shadow-[2px_2px_0_var(--ink)] sm:h-12 sm:w-12 dark:bg-zinc-900">
                  <feature.icon className="text-accent h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="font-display text-lg tracking-wide uppercase sm:text-xl">
                  {feature.title}
                </h3>
                <p className="mt-2 max-w-xl leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {feature.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
