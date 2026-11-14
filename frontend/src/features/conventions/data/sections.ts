import { CONVENTION_PAGES } from './conventionPages';
import type { Convention, ConventionSectionConfig } from '../types';

/**
 * Returns default core sections for a convention without mock items (empty state),
 * derived directly from the single source of truth CONVENTION_PAGES registry.
 */
export function getDefaultConventionSections(convention: Convention): ConventionSectionConfig[] {
  return CONVENTION_PAGES.flatMap((page) =>
    page.getOverviewSection ? [page.getOverviewSection(convention)] : []
  );
}
