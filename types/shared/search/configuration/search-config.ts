/**
 * Configuration de recherche
 * Paramètres et options pour le moteur de recherche
 * 
 * @module Shared/Search/Configuration/SearchConfig
 * @version 2.0.0
 * @since 2025-01-06
 */

import type { FacetFilters } from '../../core/value-objects';
import type { FilterGroup } from '../../filtering';

// ============================================================================
// Configuration de recherche
// ============================================================================

/**
 * Configuration principale du système de recherche
 */
export interface SearchConfiguration {
  // Moteur de recherche
  engine: 'elasticsearch' | 'solr' | 'custom' | 'database';
  version?: string;
  
  // Index principal
  default_index: string;
  available_indexes: string[];
  
  // Configuration de requête
  default_query_config: {
    max_results: number;
    timeout_ms: number;
    highlight_enabled: boolean;
    facets_enabled: boolean;
    suggestions_enabled: boolean;
  };
  
  // Configuration de performance
  performance_config: {
    cache_enabled: boolean;
    cache_duration_seconds: number;
    max_concurrent_searches: number;
    result_caching_strategy: 'none' | 'query_based' | 'user_based';
  };
  
  // Configuration d'analyse
  analysis_config: {
    default_analyzer: string;
    available_analyzers: string[];
    language_support: string[];
    stemming_enabled: boolean;
    synonyms_enabled: boolean;
  };
}

/**
 * Configuration d'index de recherche
 */
export interface SearchIndexConfig {
  index_name: string;
  entity_type: string;
  
  // Champs de recherche
  searchable_fields: Array<{
    field_name: string;
    field_type: 'text' | 'keyword' | 'number' | 'date' | 'boolean' | 'geo';
    boost?: number;
    analyzer?: string;
    searchable: boolean;
    facetable: boolean;
    sortable: boolean;
  }>;
  
  // Configuration spécialisée
  mappings?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  aliases?: string[];
  
  // Métadonnées
  created_at: string;
  last_updated: string;
  version: number;
}