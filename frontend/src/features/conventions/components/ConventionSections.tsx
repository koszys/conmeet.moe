'use client';

import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { CONBLOCK, CONBLOCK_PRIMARY } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { useFreebies } from '@/features/freebies';
import type {
  ConventionSectionConfig,
  ConventionSectionsProps,
  SectionActivityItem,
} from '../types';
import { getDefaultConventionSections } from '../data/sections';

export function ConventionSections({
  convention,
  sections: explicitSections,
  extraSections = [],
  className,
}: ConventionSectionsProps) {
  const { data: freebies } = useFreebies({ convention: convention.slug });

  const baseSections = explicitSections ?? getDefaultConventionSections(convention);
  const allSections = baseSections
    .map((sec) => {
      if (sec.id === 'freebies' && freebies && freebies.length > 0) {
        const activeFreebies = freebies.filter((f) => !f.is_claimed);
        return {
          ...sec,
          activityCountLabel: `${freebies.length} logged`,
          activities: activeFreebies.slice(0, 3).map((f) => ({
            id: String(f.id),
            title: f.name,
            subtitle: f.vendor.name,
            meta: f.requirements || undefined,
            badge: f.location ? { text: f.location, variant: 'accent' as const } : undefined,
            href: `/conventions/${convention.slug}/freebies`,
          })),
        };
      }
      return sec;
    })
    .concat(extraSections);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header bar */}
      <div className="border-ink flex flex-col justify-between gap-2 border-b-2 pb-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-display text-xl tracking-wide uppercase sm:text-2xl">
            Convention Activity Hub
          </h2>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
            Freebies, meetups, and schedules for {convention.name}
          </p>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {allSections.map((section) => (
          <ActivityCard key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}

function ActivityCard({ section }: { section: ConventionSectionConfig }) {
  const Icon = section.icon;
  const hasActivities = section.activities.length > 0;

  return (
    <article
      id={section.id}
      className={cn(
        'border-ink group flex flex-col justify-between border-2 bg-white p-5 shadow-[4px_4px_0_var(--ink)] transition-all sm:p-6 dark:bg-zinc-900',
        section.colSpan === 2 ? 'md:col-span-2' : 'md:col-span-1'
      )}
    >
      <div>
        {/* Card Header: Title + Icon */}
        <div className="border-ink flex items-center justify-between border-b-2 pb-4">
          <div className="flex items-center gap-3">
            <div className="border-ink bg-accent-soft/25 flex h-11 w-11 shrink-0 items-center justify-center border-2 shadow-[2px_2px_0_var(--ink)] dark:bg-zinc-800">
              <Icon className="text-ink h-5 w-5 dark:text-zinc-100" />
            </div>
            <div>
              <h3 className="font-display text-base tracking-wide uppercase sm:text-lg">
                {section.title}
              </h3>
              {section.activityCountLabel && (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-300">
                  {section.activityCountLabel}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Activity Items List or Empty State */}
        {hasActivities ? (
          <>
            <div className="mt-3.5 mb-2.5 flex items-center justify-between">
              <span className="font-display text-[11px] tracking-wider text-zinc-500 uppercase dark:text-zinc-300">
                {section.activityHeader ?? 'Recent Activity'}
              </span>
              <Link
                href={section.primaryAction.href}
                className="text-accent hover:text-accent-pop inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase"
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="border-ink divide-ink divide-y-2 border-2 border-dashed bg-zinc-50/70 dark:bg-zinc-950/40">
              {section.activities.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))}
            </div>
          </>
        ) : (
          <div className="border-ink mt-4 border-2 border-dashed p-6 text-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-300">
              {section.emptyState?.message ?? 'No recent activity.'}
            </p>
            {section.emptyState?.actionLabel && section.emptyState?.actionHref && (
              <Link
                href={section.emptyState.actionHref}
                className="text-accent hover:text-accent-pop mt-2 inline-flex items-center gap-1 text-xs font-bold uppercase"
              >
                {section.emptyState.actionLabel}
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        )}

        {/* Optional custom slot */}
        {section.customContent && <div className="mt-3">{section.customContent}</div>}
      </div>

      {/* Card Action Footer */}
      <div className="border-ink mt-5 flex flex-col gap-2 border-t-2 border-dashed pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={section.primaryAction.href}
          className={cn(
            CONBLOCK_PRIMARY,
            'inline-flex flex-1 items-center justify-center gap-1.5 px-4 py-2 text-xs'
          )}
        >
          <span>{section.primaryAction.label}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>

        {section.secondaryAction && (
          <Link
            href={section.secondaryAction.href ?? section.primaryAction.href}
            className={cn(
              CONBLOCK,
              'inline-flex items-center justify-center gap-1.5 bg-white px-3.5 py-2 text-xs font-bold tracking-wider text-zinc-700 uppercase hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
            )}
          >
            {section.secondaryAction.icon && (
              <section.secondaryAction.icon className="h-3.5 w-3.5" />
            )}
            <span>{section.secondaryAction.label}</span>
          </Link>
        )}
      </div>
    </article>
  );
}

function ActivityRow({ item }: { item: SectionActivityItem }) {
  const StatIcon = item.stat?.icon;

  const itemBadgeClasses =
    item.badge?.variant === 'pop'
      ? 'bg-accent-pop/15 text-accent-pop border-accent-pop/40'
      : item.badge?.variant === 'accent'
        ? 'bg-accent/15 text-accent border-accent/40'
        : 'bg-zinc-200/80 text-zinc-700 border-zinc-400 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600';

  const content = (
    <div className="group/row flex items-start justify-between gap-3 p-3 transition-colors hover:bg-white dark:hover:bg-zinc-800/80">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {item.badge && (
            <span
              className={cn(
                'py-0.2 inline-block border px-1.5 text-[10px] font-bold tracking-wider uppercase',
                itemBadgeClasses
              )}
            >
              {item.badge.text}
            </span>
          )}
          <h4 className="group-hover/row:text-accent text-xs font-medium text-zinc-900 transition-colors sm:text-sm dark:text-zinc-100">
            {item.title}
          </h4>
        </div>

        {item.subtitle && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
            <MapPin className="text-accent h-3 w-3 shrink-0" />
            <span className="truncate">{item.subtitle}</span>
          </p>
        )}

        {item.meta && (
          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-300">{item.meta}</p>
        )}
      </div>

      {/* Right side stat badge */}
      {item.stat && (
        <div className="border-ink flex shrink-0 items-center gap-1 border bg-white px-2 py-1 text-[11px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          {StatIcon && <StatIcon className="text-accent h-3 w-3" />}
          <span>{item.stat.value}</span>
          {item.stat.label && <span className="font-normal text-zinc-500">{item.stat.label}</span>}
        </div>
      )}
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
