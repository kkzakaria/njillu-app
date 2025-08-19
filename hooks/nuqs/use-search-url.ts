/**
 * Hook nuqs générique pour la gestion de la recherche dans l'URL
 */

'use client';

import { useQueryStates } from 'nuqs';
import { useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import type { SearchState } from './types';
import {
  queryParser,
  clientFiltersParser,
} from './parsers';

// ============================================================================
// URL State Schema for Generic Search
// ============================================================================

const searchSchema = {
  q: queryParser, // Use 'q' for shorter URLs
  filters: clientFiltersParser,
} as const;

// ============================================================================
// Main Hook
// ============================================================================

export function useSearchUrl(debounceMs = 300) {
  const [urlState, setUrlState] = useQueryStates(searchSchema, {
    shallow: false,
    throttleMs: 100, // Fast updates for immediate feedback
    clearOnDefault: true,
    history: 'push',
  });

  // Debounce the query for external use (API calls, etc.)
  const [debouncedQuery] = useDebounce(urlState.q, debounceMs);

  // Transform URL state to SearchState format
  const searchState = useMemo((): SearchState => {
    return {
      query: urlState.q,
      filters: urlState.filters,
    };
  }, [urlState]);

  // Debounced state for API calls
  const debouncedSearchState = useMemo((): SearchState => {
    return {
      query: debouncedQuery,
      filters: urlState.filters,
    };
  }, [debouncedQuery, urlState.filters]);

  // ============================================================================
  // Actions
  // ============================================================================

  const setQuery = (query: string) => {
    setUrlState({ q: query });
  };

  const addFilter = (filter: string) => {
    const currentFilters = urlState.filters;
    if (!currentFilters.includes(filter)) {
      setUrlState({ 
        filters: [...currentFilters, filter]
      });
    }
  };

  const removeFilter = (filter: string) => {
    const currentFilters = urlState.filters;
    setUrlState({
      filters: currentFilters.filter(f => f !== filter)
    });
  };

  const toggleFilter = (filter: string) => {
    const currentFilters = urlState.filters;
    if (currentFilters.includes(filter)) {
      removeFilter(filter);
    } else {
      addFilter(filter);
    }
  };

  const setFilters = (filters: string[]) => {
    setUrlState({ filters });
  };

  const clearFilters = () => {
    setUrlState({ filters: [] });
  };

  const clearAll = () => {
    setUrlState({
      q: '',
      filters: [],
    });
  };

  // ============================================================================
  // Utility functions
  // ============================================================================

  const hasQuery = () => {
    return Boolean(searchState.query.trim());
  };

  const hasFilters = () => {
    return searchState.filters.length > 0;
  };

  const hasActiveSearch = () => {
    return hasQuery() || hasFilters();
  };

  const getActiveFiltersCount = () => {
    return searchState.filters.length;
  };

  // ============================================================================
  // Return API
  // ============================================================================

  return {
    // State (immediate updates)
    ...searchState,
    
    // Debounced state (for API calls)
    debouncedQuery,
    debouncedSearchState,
    
    // Actions
    setQuery,
    addFilter,
    removeFilter,
    toggleFilter,
    setFilters,
    clearFilters,
    clearAll,
    
    // Utilities
    hasQuery,
    hasFilters,
    hasActiveSearch,
    getActiveFiltersCount,
    
    // Raw URL state for advanced use cases
    urlState,
    setUrlState,
  };
}