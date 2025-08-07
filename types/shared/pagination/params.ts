/**
 * Paramètres de pagination
 * Configuration des requêtes paginées
 * 
 * @module Shared/Pagination/Params
 * @version 2.0.0
 * @since 2025-01-06
 */

import type { ResultLimit, ResultOffset, PageCount } from '../core/primitives';

// ============================================================================
// Paramètres de pagination
// ============================================================================

/**
 * Paramètres de pagination standard
 */
export interface PaginationParams {
  page?: PageCount;
  page_size?: ResultLimit;
  offset?: ResultOffset;
  limit?: ResultLimit;
}

/**
 * Paramètres de pagination avec curseur pour grandes collections
 */
export interface CursorPaginationParams {
  cursor?: string;
  limit?: ResultLimit;
  direction?: 'forward' | 'backward';
}

/**
 * Paramètres de pagination avancée
 */
export interface AdvancedPaginationParams extends PaginationParams {
  // Optimisations
  count_total?: boolean;        // Calculer le total (coûteux sur grandes tables)
  estimate_total?: boolean;     // Estimation rapide du total
  
  // Navigation
  deep_pagination?: boolean;    // Support pagination profonde
  stable_sort?: boolean;        // Tri stable pour cohérence
  
  // Performance
  max_items?: ResultLimit;      // Limite absolue pour sécurité
  timeout_ms?: number;          // Timeout pour requêtes longues
}