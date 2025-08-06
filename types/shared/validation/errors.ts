/**
 * Types d'erreurs de validation
 * Structure des erreurs et messages de validation
 * 
 * @module Shared/Validation/Errors
 * @version 2.0.0
 * @since 2025-01-06
 */

import type { ValidationValue } from '../core/value-objects';
import type { SeverityLevel } from './severity';

// ============================================================================
// Erreurs de validation
// ============================================================================

/**
 * Erreur de validation avec contexte complet
 */
export interface ValidationError {
  field?: string;
  code: string;
  message: string;
  severity: SeverityLevel;
  
  // Contexte de la valeur
  current_value?: ValidationValue;
  expected_value?: ValidationValue;
  suggested_correction?: ValidationValue;
  
  // Métadonnées de validation
  validation_rule?: string;
  error_path?: string;
  related_fields?: string[];
  
  // Informations d'aide
  help_text?: string;
  documentation_url?: string;
  examples?: ValidationValue[];
}

/**
 * Erreur de validation de schéma avec structure
 */
export interface SchemaValidationError extends ValidationError {
  schema_path: string;
  schema_rule: string;
  constraint_violated: string;
  
  // Contexte du schéma
  schema_version?: string;
  schema_type?: 'json_schema' | 'custom' | 'database';
}

/**
 * Erreur de validation business avec règles métier
 */
export interface BusinessValidationError extends ValidationError {
  business_rule: string;
  rule_category: 'integrity' | 'consistency' | 'policy' | 'compliance';
  
  // Contexte business
  affected_entities?: string[];
  business_impact?: 'low' | 'medium' | 'high' | 'critical';
  recommended_action?: string;
}

/**
 * Collection d'erreurs organisée par type
 */
export interface ValidationErrorCollection {
  field_errors: ValidationError[];
  schema_errors: SchemaValidationError[];
  business_errors: BusinessValidationError[];
  
  // Résumé
  total_errors: number;
  errors_by_severity: Record<SeverityLevel, number>;
  blocking_errors_count: number;
  
  // Métadonnées
  validation_context?: string;
  validation_timestamp: string;
}