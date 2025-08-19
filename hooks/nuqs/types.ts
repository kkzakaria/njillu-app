/**
 * Types partagés pour les hooks nuqs
 */

import type { FolderFilters, StatusCategory } from '@/app/[locale]/folders/components/folder-filters-menu/folder-filter.types';
import type { ClientSearchParams } from '@/types/clients';

// ============================================================================
// Folder Filters State
// ============================================================================

export interface FolderFiltersState {
  filters: FolderFilters;
  statusCategory: StatusCategory;
  activeFiltersCount: number;
}

// ============================================================================
// Client Search State
// ============================================================================

export interface ClientSearchState {
  searchParams: ClientSearchParams;
}

// ============================================================================
// Pagination State
// ============================================================================

export interface PaginationState {
  page: number;
  page_size: number;
  sort_field?: string;
  sort_direction: 'asc' | 'desc';
}

// ============================================================================
// Search State
// ============================================================================

export interface SearchState {
  query: string;
  filters: string[];
}