/**
 * Recherches sauvegardées
 * Gestion de la persistance des requêtes
 * 
 * @module Shared/Search/Persistence/SavedSearch
 * @version 2.0.0
 * @since 2025-01-06
 */

import type { EntityId } from '../../core/identifiers';
import type { Timestamp } from '../../core/primitives';
import type { CombinedSearchQuery } from '../queries/search-query';

// ============================================================================
// Recherches sauvegardées
// ============================================================================

/**
 * Recherche sauvegardée utilisateur
 */
export interface SavedSearch {
  // Identification
  search_id: EntityId;
  user_id: EntityId;
  name: string;
  description?: string;
  
  // Requête sauvegardée
  query: CombinedSearchQuery;
  
  // Configuration
  is_default?: boolean;
  is_public?: boolean;
  is_favorite?: boolean;
  
  // Notifications
  alert_enabled?: boolean;
  alert_frequency?: 'realtime' | 'hourly' | 'daily' | 'weekly';
  last_alert_sent?: Timestamp;
  
  // Métadonnées
  created_at: Timestamp;
  updated_at: Timestamp;
  last_executed?: Timestamp;
  execution_count: number;
  
  // Partage et collaboration
  shared_with?: Array<{
    user_id: EntityId;
    permission: 'view' | 'edit';
    shared_at: Timestamp;
  }>;
  
  // Tags et catégorisation
  tags?: string[];
  category?: string;
  folder?: string;
}

/**
 * Historique de recherche utilisateur
 */
export interface SearchHistory {
  // Identification
  history_id: EntityId;
  user_id: EntityId;
  
  // Requête exécutée
  query: CombinedSearchQuery;
  query_hash: string;  // Hash pour déduplication
  
  // Résultats
  results_count: number;
  execution_time_ms: number;
  
  // Comportement utilisateur
  clicked_results?: Array<{
    result_id: string;
    rank: number;
    clicked_at: Timestamp;
  }>;
  
  // Métadonnées temporelles
  searched_at: Timestamp;
  session_id?: string;
  
  // Contexte
  search_context?: {
    page_url?: string;
    referrer?: string;
    device_type?: 'desktop' | 'mobile' | 'tablet';
    user_agent?: string;
  };
}

/**
 * Statistiques de recherche utilisateur
 */
export interface UserSearchStats {
  user_id: EntityId;
  period_start: Timestamp;
  period_end: Timestamp;
  
  // Compteurs
  total_searches: number;
  unique_queries: number;
  saved_searches_count: number;
  
  // Requêtes populaires
  top_queries: Array<{
    query: string;
    count: number;
    last_searched: Timestamp;
  }>;
  
  // Comportements
  average_results_clicked: number;
  most_clicked_result_types: string[];
  
  // Tendances temporelles
  searches_by_hour: Record<string, number>;
  searches_by_day: Record<string, number>;
}