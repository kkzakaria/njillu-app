/**
 * Hook nuqs pour la gestion de la pagination dans l'URL
 */

'use client';

import { useQueryStates } from 'nuqs';
import { useMemo } from 'react';
import type { PaginationState } from './types';
import {
  pageParser,
  pageSizeParser,
  sortDirectionParser,
} from './parsers';
import { parseAsString } from 'nuqs';

// ============================================================================
// URL State Schema for Pagination
// ============================================================================

const paginationSchema = {
  page: pageParser,
  page_size: pageSizeParser,
  sort_field: parseAsString,
  sort_direction: sortDirectionParser,
} as const;

// ============================================================================
// Main Hook
// ============================================================================

export function usePaginationUrl(defaultSortField = 'created_at') {
  const [urlState, setUrlState] = useQueryStates(paginationSchema, {
    shallow: false,
    throttleMs: 100, // Faster for pagination
    clearOnDefault: true,
    history: 'push',
  });

  // Transform URL state to PaginationState format
  const paginationState = useMemo((): PaginationState => {
    return {
      page: urlState.page,
      page_size: urlState.page_size,
      sort_field: urlState.sort_field || defaultSortField,
      sort_direction: urlState.sort_direction,
    };
  }, [urlState, defaultSortField]);

  // ============================================================================
  // Actions
  // ============================================================================

  const setPage = (page: number) => {
    setUrlState({ page });
  };

  const setPageSize = (page_size: number) => {
    setUrlState({ 
      page_size,
      page: 1 // Reset to first page when changing page size
    });
  };

  const setSort = (sort_field: string, sort_direction?: 'asc' | 'desc') => {
    const newDirection = sort_direction || (
      urlState.sort_field === sort_field && urlState.sort_direction === 'asc' 
        ? 'desc' 
        : 'asc'
    );

    setUrlState({ 
      sort_field,
      sort_direction: newDirection,
      page: 1 // Reset to first page when sorting
    });
  };

  const nextPage = () => {
    setUrlState({ page: urlState.page + 1 });
  };

  const prevPage = () => {
    if (urlState.page > 1) {
      setUrlState({ page: urlState.page - 1 });
    }
  };

  const goToFirstPage = () => {
    setUrlState({ page: 1 });
  };

  const goToLastPage = (totalPages: number) => {
    setUrlState({ page: Math.max(1, totalPages) });
  };

  const resetPagination = () => {
    setUrlState({
      page: 1,
      page_size: 50,
      sort_field: defaultSortField,
      sort_direction: 'desc',
    });
  };

  // ============================================================================
  // Utility functions
  // ============================================================================

  const canGoNext = (totalItems: number) => {
    const totalPages = Math.ceil(totalItems / paginationState.page_size);
    return paginationState.page < totalPages;
  };

  const canGoPrev = () => {
    return paginationState.page > 1;
  };

  const getOffset = () => {
    return (paginationState.page - 1) * paginationState.page_size;
  };

  const getTotalPages = (totalItems: number) => {
    return Math.ceil(totalItems / paginationState.page_size);
  };

  // ============================================================================
  // Return API
  // ============================================================================

  return {
    // State
    ...paginationState,
    
    // Actions
    setPage,
    setPageSize,
    setSort,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    resetPagination,
    
    // Utilities
    canGoNext,
    canGoPrev,
    getOffset,
    getTotalPages,
    
    // Raw URL state for advanced use cases
    urlState,
    setUrlState,
  };
}