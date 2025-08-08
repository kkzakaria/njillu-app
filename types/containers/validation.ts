/**
 * Types pour la validation et le contrôle qualité
 * Règles de validation et résultats de contrôle qualité
 * 
 * @module Containers/Validation
 * @version 2.0.0
 * @since 2025-01-06
 */

import type {
  ContainerArrivalStatus
} from './enums';

import type {
  ContainerFieldValue,
  ValidationCorrection
} from './base-types';

// ============================================================================
// Validation et contrôle qualité
// ============================================================================

/**
 * Règles de validation des données d'arrivée
 */
export interface ArrivalDataValidationRules {
  // Validation des dates
  date_validation: {
    eta_must_be_future: boolean;
    eta_max_days_ahead: number;
    actual_arrival_cannot_be_future: boolean;
    logical_date_sequence_required: boolean;
  };
  
  // Validation des statuts
  status_validation: {
    valid_status_transitions: Array<{
      from_status: ContainerArrivalStatus;
      to_status: ContainerArrivalStatus[];
    }>;
    require_actual_date_for_arrived: boolean;
    auto_correct_inconsistent_status: boolean;
  };
  
  // Validation des localisations
  location_validation: {
    validate_port_codes: boolean;
    require_arrival_location: boolean;
    check_location_consistency: boolean;
    valid_port_list?: string[];
  };
  
  // Validation business
  business_validation: {
    require_eta_within_days: number;
    flag_unusual_delays: boolean;
    unusual_delay_threshold_days: number;
    validate_shipping_company_consistency: boolean;
  };
  
  // Actions sur erreurs
  error_actions: {
    auto_correct_minor_issues: boolean;
    quarantine_invalid_data: boolean;
    notify_data_stewards: boolean;
    create_validation_alerts: boolean;
  };
}

/**
 * Résultat de validation de données d'arrivée
 */
export interface ArrivalDataValidationResult {
  container_id: string;
  container_number: string;
  validation_timestamp: string;
  
  // Résultat global
  is_valid: boolean;
  validation_score: number;           // 0-100
  data_quality_grade: 'A' | 'B' | 'C' | 'D' | 'F';
  
  // Erreurs critiques
  critical_errors: Array<{
    field: string;
    error_type: string;
    error_code: string;
    message: string;
    suggested_correction?: ValidationCorrection;
  }>;
  
  // Avertissements
  warnings: Array<{
    field: string;
    warning_type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    business_impact?: string;
  }>;
  
  // Améliorations suggérées
  suggestions: Array<{
    category: 'completeness' | 'accuracy' | 'consistency' | 'timeliness';
    description: string;
    potential_impact: string;
    implementation_effort: 'low' | 'medium' | 'high';
  }>;
  
  // Métriques de qualité
  quality_metrics: {
    completeness: number;           // % de champs remplis
    accuracy: number;               // % de données exactes
    consistency: number;            // % de cohérence avec autres sources
    timeliness: number;             // % de fraîcheur des données
  };
  
  // Actions automatiques prises
  auto_corrections: Array<{
    field: string;
    old_value: ContainerFieldValue;
    new_value: ContainerFieldValue;
    correction_reason: string;
    confidence_level: 'high' | 'medium' | 'low';
  }>;
  
  // Recommandations d'action
  recommended_actions: Array<{
    action: string;
    priority: 'immediate' | 'urgent' | 'normal' | 'low';
    responsible_team?: string;
    estimated_effort: string;
  }>;
}