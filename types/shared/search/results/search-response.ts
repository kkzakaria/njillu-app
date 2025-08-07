/**
 * Réponses de recherche
 * Structures pour les résultats de recherche
 * 
 * @module Shared/Search/Results/SearchResponse
 * @version 2.0.0
 * @since 2025-01-06
 */

import type { SearchableEntity, UserProfileData } from '../../core/value-objects';
import type { PaginationInfo } from '../../pagination';
import type { FilterGroup } from '../../filtering';

// ============================================================================
// Résultats de recherche
// ============================================================================

/**
 * Résultat individuel de recherche (hit)
 */
export interface SearchHit<T extends SearchableEntity = SearchableEntity> {
  // Données de l'entité
  source: T;
  
  // Métadonnées de recherche
  score: number;
  rank: number;
  index: string;
  
  // Mise en évidence
  highlight?: Record<string, string[]>;
  
  // Contexte de correspondance
  matched_fields?: string[];
  explanation?: {
    value: number;
    description: string;
    details: unknown[];
  };
  
  // Métadonnées additionnelles
  version?: number;
  sort_values?: unknown[];
}

/**
 * Agrégation de recherche
 */
export interface AggregationResult {
  name: string;
  type: 'terms' | 'date_histogram' | 'range' | 'stats' | 'cardinality';
  
  // Résultats d'agrégation
  buckets?: Array<{
    key: string | number;
    key_as_string?: string;
    doc_count: number;
    sub_aggregations?: Record<string, AggregationResult>;
  }>;
  
  // Statistiques (pour type 'stats')
  stats?: {
    count: number;
    min: number;
    max: number;
    avg: number;
    sum: number;
  };
  
  // Cardinalité (pour type 'cardinality')
  value?: number;
}

/**
 * Réponse complète de recherche
 */
export interface SearchResponse<T extends SearchableEntity = SearchableEntity> {
  // Résultats principaux
  hits: SearchHit<T>[];
  total_hits: {
    value: number;
    relation: 'eq' | 'gte';  // exact ou estimation
  };
  max_score?: number;
  
  // Pagination
  pagination: PaginationInfo;
  
  // Agrégations et facettes
  aggregations?: Record<string, AggregationResult>;
  
  // Suggestions
  suggestions?: Array<{
    text: string;
    score: number;
    frequency?: number;
  }>;
  
  // Métadonnées de performance
  performance: {
    took_ms: number;
    timed_out: boolean;
    shards: {
      total: number;
      successful: number;
      failed: number;
      skipped?: number;
    };
    
    // Debug info (si demandé)
    query_explanation?: string;
    profile_data?: UserProfileData;
  };
  
  // Filtres appliqués et disponibles
  applied_filters?: FilterGroup;
  available_filters?: Array<{
    field: string;
    type: string;
    values: Array<{ value: unknown; count: number }>;
  }>;
}