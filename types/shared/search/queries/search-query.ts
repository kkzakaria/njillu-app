/**
 * Types de requêtes de recherche
 * Requêtes textuelles et structurées
 * 
 * @module Shared/Search/Queries/SearchQuery
 * @version 2.0.0
 * @since 2025-01-06
 */

import type { FacetFilters, UserPreferences } from '../../core/value-objects';
import type { FilterGroup, SortParam } from '../../filtering';
import type { PaginationParams } from '../../pagination';

// ============================================================================
// Types de requêtes de base
// ============================================================================

/**
 * Requête de recherche textuelle
 */
export interface TextSearchQuery {
  // Requête principale
  query: string;
  query_type: 'match' | 'phrase' | 'prefix' | 'fuzzy' | 'wildcard' | 'regex';
  
  // Champs cibles
  fields?: string[];
  default_field?: string;
  
  // Options de recherche
  options: {
    fuzziness?: number | 'AUTO';
    boost?: number;
    minimum_should_match?: string;
    analyzer?: string;
    
    // Options textuelles
    case_sensitive?: boolean;
    ignore_accents?: boolean;
    stemming?: boolean;
  };
}

/**
 * Requête de recherche structurée
 */
export interface StructuredSearchQuery {
  // Index et type
  index?: string;
  entity_types?: string[];
  
  // Filtres principaux
  filters?: FilterGroup;
  
  // Filtres par facettes
  facet_filters?: FacetFilters;
  
  // Filtres temporels
  date_filters?: {
    field: string;
    start_date?: string;
    end_date?: string;
    timezone?: string;
  };
  
  // Tri et pagination
  sort?: SortParam[];
  pagination?: PaginationParams;
  
  // Options de performance
  options?: {
    include_deleted?: boolean;
    user_context?: {
      user_id: string;
      permissions: string[];
      preferences?: UserPreferences;
    };
  };
}

/**
 * Requête de recherche combinée (texte + structure)
 */
export interface CombinedSearchQuery {
  text_query?: TextSearchQuery;
  structured_query?: StructuredSearchQuery;
  
  // Stratégie de combinaison
  combination_strategy: 'must_match_both' | 'should_match_either' | 'boost_text' | 'boost_structured';
  
  // Pondérations
  text_weight?: number;
  structured_weight?: number;
  
  // Options globales
  global_options?: {
    highlight_enabled?: boolean;
    suggestions_enabled?: boolean;
    facets_enabled?: boolean;
    explain_score?: boolean;
  };
}