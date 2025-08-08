/**
 * Point d'entrée du module Search
 * Export de tous les types de recherche
 * 
 * @module Shared/Search
 * @version 2.0.0
 * @since 2025-01-06
 */

// Configuration
export type {
  SearchConfiguration,
  SearchIndexConfig
} from './configuration/search-config';

// Requêtes
export type {
  TextSearchQuery,
  StructuredSearchQuery,
  CombinedSearchQuery
} from './queries/search-query';

// Résultats
export type {
  SearchHit,
  AggregationResult,
  SearchResponse
} from './results/search-response';

// Persistance
export type {
  SavedSearch,
  SearchHistory,
  UserSearchStats
} from './persistence/saved-search';