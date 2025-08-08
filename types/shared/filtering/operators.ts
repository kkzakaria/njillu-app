/**
 * Opérateurs de filtrage
 * Définition des opérateurs de comparaison et logiques
 * 
 * @module Shared/Filtering/Operators
 * @version 2.0.0
 * @since 2025-01-06
 */

// ============================================================================
// Opérateurs de comparaison
// ============================================================================

/**
 * Opérateurs de comparaison pour les filtres
 */
export type FilterOperator = 
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'greater_than_or_equal'
  | 'less_than'
  | 'less_than_or_equal'
  | 'in'
  | 'not_in'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'is_null'
  | 'is_not_null'
  | 'between'
  | 'not_between';

/**
 * Opérateurs logiques pour groupes de filtres
 */
export type LogicalOperator = 'AND' | 'OR' | 'NOT';

/**
 * Opérateurs de tri
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Modes de tri avancés
 */
export type SortMode = 
  | 'standard'
  | 'natural'          // Tri naturel pour nombres et texte
  | 'case_insensitive' // Ignore la casse
  | 'locale_aware';    // Respecte les règles locales

/**
 * Opérateurs de recherche textuelle
 */
export type TextSearchOperator =
  | 'match'            // Correspondance exacte
  | 'fuzzy'            // Recherche floue
  | 'phrase'           // Phrase exacte
  | 'prefix'           // Préfixe
  | 'wildcard'         // Avec caractères jokers
  | 'regex';           // Expression régulière