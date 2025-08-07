/**
 * Types union spécifiques remplaçant tous les usages de 'any'
 * Types valeurs pour éliminer l'insécurité de type
 * 
 * @module Shared/Core/ValueObjects
 * @version 2.0.0
 * @since 2025-01-06
 */

// ============================================================================
// Types de valeurs pour filtres et requêtes
// ============================================================================

/**
 * Valeur de filtre type-safe (remplace any dans les filtres)
 */
export type FilterValue = 
  | string 
  | number 
  | boolean 
  | Date 
  | null;

/**
 * Tableau de valeurs de filtre (pour opérateurs 'in', 'between', etc.)
 */
export type FilterValueArray = FilterValue[];

/**
 * Toutes les valeurs possibles dans les systèmes de filtrage
 */
export type AnyFilterValue = FilterValue | FilterValueArray;

// ============================================================================
// Types pour les configurations utilisateur
// ============================================================================

/**
 * Objet de préférences structuré
 */
export interface PreferenceObject {
  setting_type: 'display' | 'notification' | 'language' | 'theme';
  value: string | number | boolean;
  is_default: boolean;
  last_updated?: string;
}

/**
 * Valeur de préférence utilisateur type-safe
 */
export type UserPreference = 
  | string 
  | number 
  | boolean 
  | string[] 
  | PreferenceObject;

/**
 * Configuration complète des préférences utilisateur
 */
export type UserPreferences = Record<string, UserPreference>;

// ============================================================================
// Types pour la validation
// ============================================================================

/**
 * Valeur dans un contexte de validation
 */
export type ValidationValue = 
  | string 
  | number 
  | boolean 
  | Date 
  | null 
  | ValidationObject;

/**
 * Objet complexe pour validation
 */
export interface ValidationObject {
  type: 'object' | 'array' | 'nested';
  properties?: Record<string, ValidationValue>;
  items?: ValidationValue[];
  metadata?: Record<string, string | number | boolean>;
}

// ============================================================================
// Types pour les événements système
// ============================================================================

/**
 * Payload de base pour les événements
 */
export interface EventPayload {
  event_type: string;
  timestamp: string;
  source: string;
  user_id?: string;
  session_id?: string;
}

/**
 * Payload étendu pour événements métier
 */
export interface BusinessEventPayload extends EventPayload {
  entity_type: 'bill_of_lading' | 'folder' | 'container_arrival' | 'user';
  entity_id: string;
  action: 'created' | 'updated' | 'deleted' | 'restored';
  changes?: Record<string, { old_value: FilterValue; new_value: FilterValue }>;
}

/**
 * Payload pour événements système
 */
export interface SystemEventPayload extends EventPayload {
  system_component: 'database' | 'api' | 'auth' | 'notification' | 'search';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  stack_trace?: string;
}

// ============================================================================
// Types pour les réponses API
// ============================================================================

/**
 * Détails d'erreur API structurés
 */
export interface ApiErrorDetails {
  error_code: string;
  field?: string;
  constraint?: string;
  actual_value?: FilterValue;
  expected_format?: string;
  suggestion?: string;
}

/**
 * Métadonnées de réponse API
 */
export interface ApiResponseMetadata {
  request_id: string;
  processing_time_ms: number;
  api_version: string;
  rate_limit_remaining?: number;
  warnings?: string[];
}

// ============================================================================
// Types pour les données de recherche
// ============================================================================

/**
 * Entité recherchable de base
 */
export interface SearchableEntity {
  id: string;
  type: 'bill_of_lading' | 'folder' | 'container' | 'user' | 'document';
  title: string;
  description?: string;
  tags?: string[];
  searchable_fields: Record<string, FilterValue>;
}

/**
 * Valeurs de facettes pour recherche
 */
export type FacetValue = string | number | boolean;

/**
 * Filtres de facettes type-safe
 */
export type FacetFilters = Record<string, FacetValue[]>;

/**
 * Données de profil utilisateur pour recherche
 */
export interface UserProfileData {
  user_id: string;
  preferences: UserPreferences;
  search_history: string[];
  favorite_filters: Record<string, FilterValue>;
  custom_fields?: Record<string, FilterValue>;
}

// ============================================================================
// Types utilitaires pour soft-delete
// ============================================================================

/**
 * Valeur de condition pour soft-delete
 */
export type SoftDeleteConditionValue = 
  | string 
  | number 
  | boolean 
  | Date 
  | null
  | string[];

/**
 * Union générale pour éviter 'unknown' quand nécessaire
 */
export type SafeAny = 
  | FilterValue 
  | FilterValueArray 
  | UserPreference 
  | ValidationValue 
  | EventPayload 
  | ApiErrorDetails 
  | SearchableEntity 
  | SoftDeleteConditionValue;