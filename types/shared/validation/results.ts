/**
 * Résultats de validation
 * Structures pour les résultats de validation avec métriques
 * 
 * @module Shared/Validation/Results  
 * @version 2.0.0
 * @since 2025-01-06
 */

import type { Timestamp } from '../core/primitives';
import type { ValidationError, ValidationErrorCollection } from './errors';

// ============================================================================
// Résultats de validation
// ============================================================================

/**
 * Résultat de validation générique
 */
export interface ValidationResult {
  is_valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  
  // Scores de qualité
  overall_score?: number;         // 0-100
  completeness_score?: number;    // Complétude des données
  accuracy_score?: number;        // Précision des données
  consistency_score?: number;     // Cohérence interne
  
  // Métadonnées de validation
  validated_at: Timestamp;
  validation_version?: string;
  validation_rules_applied?: string[];
  validation_duration_ms?: number;
}

/**
 * Résultat de validation avancé avec détails complets
 */
export interface AdvancedValidationResult extends ValidationResult {
  // Collection d'erreurs organisée
  error_collection: ValidationErrorCollection;
  
  // Métriques détaillées
  quality_metrics: {
    data_quality_score: number;
    business_rule_compliance: number;
    schema_compliance: number;
    field_completion_rate: number;
  };
  
  // Analyse des données
  data_analysis: {
    total_fields_validated: number;
    fields_with_errors: string[];
    fields_with_warnings: string[];
    missing_required_fields: string[];
    unexpected_fields: string[];
  };
  
  // Recommandations
  recommendations?: Array<{
    type: 'fix' | 'improve' | 'optimize';
    priority: 'low' | 'medium' | 'high';
    description: string;
    affected_fields?: string[];
    estimated_effort?: 'minutes' | 'hours' | 'days';
  }>;
}

/**
 * Résultat de validation en lot
 */
export interface BatchValidationResult {
  total_items: number;
  valid_items: number;
  invalid_items: number;
  
  // Résultats par item
  item_results: Array<{
    item_id: string;
    result: ValidationResult;
  }>;
  
  // Statistiques globales
  global_statistics: {
    most_common_errors: Array<{
      error_code: string;
      count: number;
      percentage: number;
    }>;
    fields_with_most_errors: string[];
    average_quality_score: number;
  };
  
  // Métadonnées de traitement
  batch_metadata: {
    started_at: Timestamp;
    completed_at: Timestamp;
    processing_time_ms: number;
    items_per_second: number;
  };
}