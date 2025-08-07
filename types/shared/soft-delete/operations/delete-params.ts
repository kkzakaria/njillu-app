/**
 * Paramètres de suppression logique
 * Configuration pour les opérations de suppression
 * 
 * @module Shared/SoftDelete/Operations/DeleteParams
 * @version 2.0.0
 * @since 2025-01-06
 */

import type { EntityId } from '../../core/identifiers';
import type { Timestamp } from '../../core/primitives';
import type { SoftDeleteConditionValue } from '../../core/value-objects';

// ============================================================================
// Paramètres de suppression
// ============================================================================

/**
 * Paramètres pour suppression logique simple
 */
export interface SoftDeleteParams {
  // Identification
  entity_id: EntityId;
  entity_type: string;
  
  // Motif de suppression
  reason?: string;
  deletion_context?: Record<string, unknown>;
  
  // Options de suppression
  options?: {
    cascade?: boolean;           // Supprimer les entités liées
    force?: boolean;            // Forcer même si des dépendances existent
    schedule_permanent_deletion?: boolean; // Programmer suppression définitive
    permanent_deletion_date?: Timestamp;   // Date de suppression définitive
    
    // Validation
    validate_permissions?: boolean;
    check_dependencies?: boolean;
    
    // Audit
    audit_context?: {
      user_id?: EntityId;
      session_id?: string;
      request_id?: string;
    };
  };
}

/**
 * Paramètres pour suppression logique en lot
 */
export interface BatchSoftDeleteParams {
  // Entités à supprimer
  entities: Array<{
    entity_id: EntityId;
    entity_type: string;
    reason?: string;
  }>;
  
  // Options globales
  global_options: {
    batch_size?: number;
    parallel_processing?: boolean;
    stop_on_error?: boolean;
    transaction_mode?: boolean;
  };
  
  // Options héritées
  common_options?: SoftDeleteParams['options'];
  
  // Contexte du lot
  batch_context: {
    batch_id?: string;
    initiated_by: EntityId;
    batch_reason?: string;
    batch_metadata?: Record<string, unknown>;
  };
}

/**
 * Paramètres de suppression conditionnelle
 */
export interface ConditionalDeleteParams {
  // Critères de sélection
  entity_type: string;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'is_null' | 'is_not_null';
    value: SoftDeleteConditionValue;
  }>;
  
  // Limites de sécurité
  max_affected_records?: number;
  dry_run?: boolean;  // Mode simulation
  
  // Options de suppression
  deletion_options: SoftDeleteParams['options'];
  
  // Métadonnées
  operation_metadata: {
    operation_id: string;
    initiated_by: EntityId;
    operation_reason: string;
    estimated_count?: number;
  };
}