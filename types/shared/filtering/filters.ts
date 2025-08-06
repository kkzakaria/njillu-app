/**
 * Types de filtres
 * Structures pour les filtres simples et groupés
 * 
 * @module Shared/Filtering/Filters
 * @version 2.0.0
 * @since 2025-01-06
 */

import type { FilterValue, FilterValueArray } from '../core/value-objects';
import type { FilterOperator, LogicalOperator, TextSearchOperator } from './operators';

// ============================================================================
// Filtres de base
// ============================================================================

/**
 * Filtre générique
 */
export interface Filter {
  field: string;
  operator: FilterOperator;
  value?: FilterValue;
  values?: FilterValueArray;   // Pour opérateurs 'in', 'between', etc.
  
  // Options de traitement
  case_sensitive?: boolean;
  ignore_accents?: boolean;
  null_handling?: 'include' | 'exclude' | 'as_empty_string';
  
  // Métadonnées
  display_name?: string;
  description?: string;
}

/**
 * Filtre textuel avec options avancées
 */
export interface TextFilter extends Omit<Filter, 'operator'> {
  operator: TextSearchOperator;
  query: string;
  
  // Options de recherche textuelle
  boost?: number;              // Pondération du score
  minimum_should_match?: string; // Ex: "75%"
  fuzziness?: number | 'AUTO';  // Distance d'édition
  analyzer?: string;           // Analyseur de texte à utiliser
}

/**
 * Filtre de plage (dates, nombres)
 */
export interface RangeFilter {
  field: string;
  min_value?: FilterValue;
  max_value?: FilterValue;
  include_min?: boolean;
  include_max?: boolean;
  
  // Pour les dates
  timezone?: string;
  date_format?: string;
}

/**
 * Filtre géographique
 */
export interface GeoFilter {
  field: string;
  type: 'distance' | 'bounding_box' | 'polygon';
  
  // Pour distance
  distance?: {
    center: { lat: number; lon: number };
    radius: number;
    unit: 'km' | 'm' | 'mi' | 'ft';
  };
  
  // Pour bounding box
  bounding_box?: {
    top_left: { lat: number; lon: number };
    bottom_right: { lat: number; lon: number };
  };
  
  // Pour polygone
  polygon?: Array<{ lat: number; lon: number }>;
}

// ============================================================================
// Groupes de filtres
// ============================================================================

/**
 * Groupe de filtres avec logique booléenne
 */
export interface FilterGroup {
  operator: LogicalOperator;
  filters: Array<Filter | TextFilter | RangeFilter | GeoFilter | FilterGroup>;
  
  // Options de groupe
  boost?: number;              // Pondération du groupe
  minimum_should_match?: number; // Pour opérateur OR
  
  // Métadonnées
  name?: string;
  description?: string;
}

/**
 * Collection de filtres organisée
 */
export interface FilterCollection {
  // Filtres principaux
  must: FilterGroup[];         // Conditions obligatoires (AND)
  should: FilterGroup[];       // Conditions optionnelles (OR)
  must_not: FilterGroup[];     // Conditions d'exclusion (NOT)
  
  // Filtres contextuels
  post_filter?: FilterGroup;   // Appliqué après agrégations
  
  // Métadonnées
  name?: string;
  version?: string;
  created_by?: string;
}