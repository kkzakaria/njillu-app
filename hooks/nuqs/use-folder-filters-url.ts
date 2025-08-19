/**
 * Hook nuqs pour la gestion des filtres de dossiers dans l'URL
 * 
 * Provides type-safe URL state management for folder filters with:
 * - Automatic serialization/deserialization
 * - Integration with existing filter types
 * - Compatibility with next-intl routing
 */

'use client';

import { useQueryStates } from 'nuqs';
import { useMemo } from 'react';
import type { FolderFilters, StatusCategory } from '@/app/[locale]/folders/components/folder-filters-menu/folder-filter.types';
import type { FolderFiltersState } from './types';
import {
  queryParser,
  statusCategoryParser,
  priorityParser,
  folderTypeParser,
  categoryParser,
  healthStatusParser,
  processingStageParser,
  transportModeParser,
  transitTypeParser,
  slaThresholdParser,
  deadlineProximityParser,
  isOverdueParser,
  completionPeriodParser,
  performanceRatingParser,
  archiveAgeParser,
  deletionPeriodParser,
} from './parsers';

// ============================================================================
// URL State Schema for Folder Filters
// ============================================================================

const folderFiltersSchema = {
  // Common filters
  client_search: queryParser,
  type: folderTypeParser,
  category: categoryParser,
  
  // Active-specific filters
  priority: priorityParser,
  health_status: healthStatusParser,
  processing_stage: processingStageParser,
  transport_mode: transportModeParser,
  transit_type: transitTypeParser,
  sla_threshold: slaThresholdParser,
  deadline_proximity: deadlineProximityParser,
  is_overdue: isOverdueParser,
  
  // Completed-specific filters
  completion_period: completionPeriodParser,
  performance_rating: performanceRatingParser,
  
  // Archived-specific filters
  archive_age: archiveAgeParser,
  
  // Deleted-specific filters
  deletion_period: deletionPeriodParser,
  
  // Status category (separate from filters but related)
  status: statusCategoryParser,
} as const;

// ============================================================================
// Main Hook
// ============================================================================

export function useFolderFiltersUrl() {
  const [urlState, setUrlState] = useQueryStates(folderFiltersSchema, {
    // Options for better UX
    shallow: false, // Allow deep linking
    throttleMs: 300, // Debounce URL updates
    clearOnDefault: true, // Clean URLs by removing default values
    history: 'push', // Use history.pushState for better navigation
  });

  // Transform URL state to FolderFilters format
  const filters = useMemo((): FolderFilters => {
    const {
      status, // Extract status separately
      ...filterData
    } = urlState;

    return {
      ...filterData,
      // Handle undefined/null values properly
      client_search: filterData.client_search || undefined,
      type: filterData.type?.length ? filterData.type : undefined,
      category: filterData.category?.length ? filterData.category : undefined,
      priority: filterData.priority?.length ? filterData.priority : undefined,
      health_status: filterData.health_status?.length ? filterData.health_status : undefined,
      processing_stage: filterData.processing_stage?.length ? filterData.processing_stage : undefined,
      transport_mode: filterData.transport_mode?.length ? filterData.transport_mode : undefined,
      transit_type: filterData.transit_type?.length ? filterData.transit_type : undefined,
      sla_threshold: filterData.sla_threshold || undefined,
      deadline_proximity: filterData.deadline_proximity || undefined,
      is_overdue: filterData.is_overdue || undefined,
      completion_period: filterData.completion_period || undefined,
      performance_rating: filterData.performance_rating || undefined,
      archive_age: filterData.archive_age || undefined,
      deletion_period: filterData.deletion_period || undefined,
    };
  }, [urlState]);

  // Count active filters (excluding status)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    
    if (filters.client_search) count++;
    if (filters.type?.length) count++;
    if (filters.category?.length) count++;
    if (filters.priority?.length) count++;
    if (filters.health_status?.length) count++;
    if (filters.processing_stage?.length) count++;
    if (filters.transport_mode?.length) count++;
    if (filters.transit_type?.length) count++;
    if (filters.sla_threshold) count++;
    if (filters.deadline_proximity) count++;
    if (filters.is_overdue) count++;
    if (filters.completion_period) count++;
    if (filters.performance_rating) count++;
    if (filters.archive_age) count++;
    if (filters.deletion_period) count++;
    
    return count;
  }, [filters]);

  // ============================================================================
  // Actions
  // ============================================================================

  const updateFilters = (newFilters: Partial<FolderFilters>) => {
    const urlUpdates: Partial<typeof urlState> = {};
    
    // Transform filters back to URL format
    Object.entries(newFilters).forEach(([key, value]) => {
      if (key in folderFiltersSchema) {
        urlUpdates[key as keyof typeof urlState] = value as any;
      }
    });

    setUrlState(urlUpdates);
  };

  const clearAllFilters = () => {
    setUrlState({
      client_search: undefined,
      type: [],
      category: [],
      priority: [],
      health_status: [],
      processing_stage: [],
      transport_mode: [],
      transit_type: [],
      sla_threshold: undefined,
      deadline_proximity: undefined,
      is_overdue: undefined,
      completion_period: undefined,
      performance_rating: undefined,
      archive_age: undefined,
      deletion_period: undefined,
    });
  };

  const setStatusCategory = (status: StatusCategory) => {
    setUrlState({ status });
  };

  // ============================================================================
  // Return API
  // ============================================================================

  const state: FolderFiltersState = {
    filters,
    statusCategory: urlState.status,
    activeFiltersCount,
  };

  return {
    // State
    ...state,
    
    // Actions
    updateFilters,
    clearAllFilters,
    setStatusCategory,
    
    // Raw URL state for advanced use cases
    urlState,
    setUrlState,
  };
}