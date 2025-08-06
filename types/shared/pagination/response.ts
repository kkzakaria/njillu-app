/**
 * Réponses paginées génériques
 * Structures de données pour les réponses avec pagination
 * 
 * @module Shared/Pagination/Response
 * @version 2.0.0
 * @since 2025-01-06
 */

import type { PaginationInfo, CursorPaginationInfo, AdvancedPaginationInfo } from './info';

// ============================================================================
// Réponses paginées
// ============================================================================

/**
 * Réponse paginée générique
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
  
  // Métadonnées optionnelles
  query_time_ms?: number;
  total_count_estimate?: boolean;
}

/**
 * Réponse paginée avec curseur
 */
export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: CursorPaginationInfo;
  query_time_ms?: number;
}

/**
 * Réponse paginée avancée avec métriques complètes
 */
export interface AdvancedPaginatedResponse<T> extends PaginatedResponse<T> {
  pagination: AdvancedPaginationInfo;
  
  // Statistiques avancées
  statistics?: {
    cache_hit_rate?: number;
    database_queries_count?: number;
    index_usage?: string[];
  };
  
  // Debug info
  debug_info?: {
    query_plan?: string;
    performance_warnings?: string[];
    optimization_suggestions?: string[];
  };
}