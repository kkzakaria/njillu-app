/**
 * Informations de pagination dans les réponses
 * Métadonnées sur l'état de pagination
 * 
 * @module Shared/Pagination/Info
 * @version 2.0.0
 * @since 2025-01-06
 */

import type { PageCount, ResultLimit } from '../core/primitives';

// ============================================================================
// Informations de pagination
// ============================================================================

/**
 * Information de pagination dans les réponses
 */
export interface PaginationInfo {
  current_page: PageCount;
  page_size: ResultLimit;
  total_count: number;
  total_pages: PageCount;
  has_next_page: boolean;
  has_previous_page: boolean;
  next_page?: PageCount;
  previous_page?: PageCount;
}

/**
 * Information de pagination avec curseur
 */
export interface CursorPaginationInfo {
  current_cursor?: string;
  next_cursor?: string;
  previous_cursor?: string;
  has_next_page: boolean;
  has_previous_page: boolean;
  page_size: ResultLimit;
  estimated_total?: number;
}

/**
 * Information de pagination avancée avec métriques
 */
export interface AdvancedPaginationInfo extends PaginationInfo {
  // Performance
  query_time_ms: number;
  total_count_accurate: boolean;   // Si le total est exact ou estimé
  
  // Navigation optimisée
  jump_to_page?: {
    min_page: PageCount;
    max_page: PageCount;
    suggested_pages: PageCount[];   // Pages recommandées pour navigation
  };
  
  // Métadonnées de requête
  sort_applied?: string[];
  filters_applied?: Record<string, unknown>;
}