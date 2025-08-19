/**
 * Hook nuqs pour la gestion des paramètres de recherche client dans l'URL
 */

'use client';

import { useQueryStates } from 'nuqs';
import { useMemo } from 'react';
import type { ClientSearchParams } from '@/types/clients';
import type { ClientSearchState } from './types';
import {
  queryParser,
  pageParser,
  pageSizeParser,
  sortDirectionParser,
  clientFiltersParser,
} from './parsers';
import { parseAsString } from 'nuqs';

// ============================================================================
// URL State Schema for Client Search
// ============================================================================

const clientSearchSchema = {
  query: queryParser,
  filters: clientFiltersParser,
  page: pageParser,
  page_size: pageSizeParser,
  sort_field: parseAsString.withDefault('created_at'),
  sort_direction: sortDirectionParser,
} as const;

// ============================================================================
// Main Hook
// ============================================================================

export function useClientSearchUrl() {
  const [urlState, setUrlState] = useQueryStates(clientSearchSchema, {
    shallow: false,
    throttleMs: 300,
    clearOnDefault: true,
    history: 'push',
  });

  // Transform URL state to ClientSearchParams format
  const searchParams = useMemo((): ClientSearchParams => {
    return {
      query: urlState.query,
      filters: urlState.filters,
      page: urlState.page,
      page_size: urlState.page_size,
      sort_field: urlState.sort_field,
      sort_direction: urlState.sort_direction,
    };
  }, [urlState]);

  // ============================================================================
  // Actions
  // ============================================================================

  const updateSearch = (params: Partial<ClientSearchParams>) => {
    const urlUpdates: Partial<typeof urlState> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (key in clientSearchSchema) {
        urlUpdates[key as keyof typeof urlState] = value as any;
      }
    });

    setUrlState(urlUpdates);
  };

  const setQuery = (query: string) => {
    setUrlState({ 
      query,
      page: 1 // Reset to first page when searching
    });
  };

  const addFilter = (filter: string) => {
    const currentFilters = urlState.filters;
    if (!currentFilters.includes(filter)) {
      setUrlState({ 
        filters: [...currentFilters, filter],
        page: 1 // Reset to first page when filtering
      });
    }
  };

  const removeFilter = (filter: string) => {
    const currentFilters = urlState.filters;
    setUrlState({
      filters: currentFilters.filter(f => f !== filter),
      page: 1 // Reset to first page when filtering
    });
  };

  const clearFilters = () => {
    setUrlState({ 
      filters: [],
      page: 1 
    });
  };

  const setPage = (page: number) => {
    setUrlState({ page });
  };

  const setPageSize = (page_size: number) => {
    setUrlState({ 
      page_size,
      page: 1 // Reset to first page when changing page size
    });
  };

  const setSort = (sort_field: string, sort_direction: 'asc' | 'desc') => {
    setUrlState({ 
      sort_field,
      sort_direction,
      page: 1 // Reset to first page when sorting
    });
  };

  const clearSearch = () => {
    setUrlState({
      query: '',
      filters: [],
      page: 1,
      page_size: 50,
      sort_field: 'created_at',
      sort_direction: 'desc',
    });
  };

  // ============================================================================
  // Return API
  // ============================================================================

  const state: ClientSearchState = {
    searchParams,
  };

  return {
    // State
    ...state,
    
    // Actions
    updateSearch,
    setQuery,
    addFilter,
    removeFilter,
    clearFilters,
    setPage,
    setPageSize,
    setSort,
    clearSearch,
    
    // Raw URL state for advanced use cases
    urlState,
    setUrlState,
  };
}