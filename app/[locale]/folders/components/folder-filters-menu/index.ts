// ============================================================================
// Re-exports pour le module folder-filters-menu
// ============================================================================

// Composant principal
export { FolderFiltersMenu } from './folder-filters-menu';

// Types et interfaces
export type {
  FolderFilters,
  StatusCategory,
  FilterSection,
  FilterOption,
  FilterConfig,
  FolderFiltersMenuProps,
  FilterSectionProps
} from './folder-filter.types';

// Configurations
export { FILTER_CONFIGS } from './folder-filter-configs';

// Handlers et logique métier
export {
  createUpdateFiltersHandler,
  createToggleArrayFilterHandler,
  createClearAllFiltersHandler,
  createFilterHandlers
} from './folder-filter-handlers';

// Composants de section
export { UrgencySection } from './sections/urgency-section';
export { WorkflowSection } from './sections/workflow-section';
export { DeadlinesSection } from './sections/deadlines-section';
export { PerformanceSection } from './sections/performance-section';
export { CostsSection } from './sections/costs-section';
export { PeriodSection } from './sections/period-section';
export { ArchiveSection } from './sections/archive-section';
export { DeletionSection } from './sections/deletion-section';