/**
 * Types pour le tri et l'ordonnancement
 * Configuration du tri des résultats
 * 
 * @module Shared/Filtering/Sorting
 * @version 2.0.0
 * @since 2025-01-06
 */

import type { SortDirection, SortMode } from './operators';

// ============================================================================
// Types de tri
// ============================================================================

/**
 * Paramètre de tri simple
 */
export interface SortParam {
  field: string;
  direction: SortDirection;
  
  // Options avancées
  mode?: SortMode;
  missing?: 'first' | 'last';  // Position des valeurs manquantes
  locale?: string;             // Pour tri localisé
  
  // Métadonnées
  display_name?: string;
  priority?: number;           // Ordre de tri multiple
}

/**
 * Options de tri complexes
 */
export interface SortOptions {
  // Tri principal
  primary_sort: SortParam[];
  
  // Tri de désambiguïsation (tie-breaker)
  tie_breaker?: SortParam;
  
  // Performance
  track_scores?: boolean;      // Calculer les scores de pertinence
  stable_sort?: boolean;       // Tri stable pour cohérence
  
  // Limites de performance
  max_sort_fields?: number;
  sort_timeout_ms?: number;
}

/**
 * Configuration de tri prédéfinie
 */
export interface SortPreset {
  id: string;
  name: string;
  description?: string;
  sort_params: SortParam[];
  
  // Contexte d'application
  applicable_to?: string[];    // Types d'entités concernés
  default_for?: string[];      // Contextes où c'est le tri par défaut
  
  // Métadonnées
  created_by?: string;
  is_system_preset?: boolean;
  usage_count?: number;
}

/**
 * Résultat avec informations de tri
 */
export interface SortedResult<T> {
  data: T[];
  sort_applied: SortParam[];
  sort_metadata?: {
    total_comparisons?: number;
    sort_time_ms?: number;
    sort_algorithm?: string;
    memory_used_mb?: number;
  };
}