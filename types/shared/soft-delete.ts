/**
 * Types pour le système de soft delete
 * Gestion de la suppression logique et de la restauration des entités
 */

import type { EntityId, Timestamp, AuditMetadata } from './common';

// ============================================================================
// Interfaces de base pour le soft delete
// ============================================================================

/**
 * Interface pour les entités supportant le soft delete
 */
export interface SoftDeletable {
  deleted_at?: Timestamp;
  deleted_by?: EntityId;
  deletion_reason?: string;
  is_deleted?: boolean;        // Champ calculé pour faciliter les requêtes
}

/**
 * Métadonnées complètes de suppression
 */
export interface DeletionMetadata extends SoftDeletable {
  deletion_type: 'manual' | 'automatic' | 'cascade' | 'policy' | 'cleanup';
  deletion_context?: string;   // Contexte business de la suppression
  deletion_batch_id?: string;  // ID du lot si suppression en masse
  
  // Relations affectées
  related_entities_deleted?: Array<{
    entity_type: string;
    entity_id: EntityId;
    relationship_type: 'parent' | 'child' | 'sibling' | 'reference';
  }>;
  
  // Retention et cleanup
  retention_period_days?: number;
  hard_delete_scheduled_at?: Timestamp;
  can_be_restored: boolean;
  
  // Approbation (si requise)
  deletion_approved_by?: EntityId;
  deletion_approved_at?: Timestamp;
  requires_approval?: boolean;
}

/**
 * Historique des suppressions et restaurations
 */
export interface DeletionHistory {
  id: EntityId;
  entity_type: string;
  entity_id: EntityId;
  
  // Action effectuée
  action: 'soft_delete' | 'restore' | 'hard_delete' | 'purge';
  
  // Contexte de l'action
  performed_by: EntityId;
  performed_at: Timestamp;
  reason?: string;
  notes?: string;
  
  // État avant/après
  previous_state?: 'active' | 'deleted' | 'archived';
  new_state: 'active' | 'deleted' | 'archived' | 'purged';
  
  // Métadonnées de l'action
  action_metadata?: {
    batch_operation_id?: string;
    automation_rule_id?: string;
    cascade_from_entity?: {
      entity_type: string;
      entity_id: EntityId;
    };
    ip_address?: string;
    user_agent?: string;
  };
  
  // Impact et restauration
  entities_affected_count?: number;
  restoration_possible: boolean;
  restoration_deadline?: Timestamp;
  
  // Liens
  parent_action_id?: EntityId;      // Si action en cascade
  related_actions?: EntityId[];     // Actions liées
}

// ============================================================================
// Types pour les opérations de suppression
// ============================================================================

/**
 * Paramètres pour supprimer une entité
 */
export interface SoftDeleteParams {
  entity_type: string;
  entity_id: EntityId;
  
  // Contexte de suppression
  reason: string;
  deletion_type?: 'manual' | 'automatic' | 'cascade' | 'policy' | 'cleanup';
  context?: string;
  
  // Options de cascade
  cascade_delete?: boolean;
  cascade_rules?: Array<{
    relationship_type: string;
    target_entity_type: string;
    action: 'delete' | 'unlink' | 'archive' | 'skip';
  }>;
  
  // Planification
  scheduled_at?: Timestamp;
  retention_period_days?: number;
  
  // Validation et sécurité
  require_confirmation?: boolean;
  confirmation_token?: string;
  bypass_validation?: boolean;
  
  // Métadonnées
  performed_by: EntityId;
  batch_id?: string;
  notes?: string;
}

/**
 * Résultat d'une opération de suppression
 */
export interface SoftDeleteResult {
  operation_id: EntityId;
  
  // Entité principale
  primary_entity: {
    entity_type: string;
    entity_id: EntityId;
    deletion_successful: boolean;
    error_message?: string;
  };
  
  // Entités affectées en cascade
  cascade_results: Array<{
    entity_type: string;
    entity_id: EntityId;
    relationship_type: string;
    action_taken: 'deleted' | 'unlinked' | 'archived' | 'skipped' | 'failed';
    error_message?: string;
  }>;
  
  // Statistiques
  statistics: {
    total_entities_processed: number;
    successful_deletions: number;
    failed_deletions: number;
    cascade_deletions: number;
    warnings_count: number;
  };
  
  // Validation et avertissements
  validation_warnings: Array<{
    type: 'data_integrity' | 'business_rule' | 'dependency' | 'security';
    message: string;
    entity_affected?: { entity_type: string; entity_id: EntityId };
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  
  // Métadonnées de l'opération
  operation_metadata: {
    started_at: Timestamp;
    completed_at: Timestamp;
    duration_ms: number;
    performed_by: EntityId;
    can_be_restored: boolean;
    restoration_deadline?: Timestamp;
  };
}

// ============================================================================
// Types pour la restauration
// ============================================================================

/**
 * Paramètres pour restaurer une entité
 */
export interface RestoreParams {
  entity_type: string;
  entity_id: EntityId;
  
  // Options de restauration
  restore_related_entities?: boolean;
  restore_to_date?: Timestamp;        // Restaurer à un état antérieur
  
  // Validation
  validate_integrity?: boolean;
  resolve_conflicts?: 'auto' | 'manual' | 'fail';
  
  // Gestion des conflits
  conflict_resolution_strategy?: {
    duplicate_handling: 'merge' | 'replace' | 'create_new' | 'fail';
    reference_validation: 'strict' | 'lenient' | 'skip';
    data_consistency_check: boolean;
  };
  
  // Métadonnées
  performed_by: EntityId;
  reason?: string;
  notes?: string;
}

/**
 * Résultat d'une opération de restauration
 */
export interface RestoreResult {
  operation_id: EntityId;
  
  // Entité principale
  primary_entity: {
    entity_type: string;
    entity_id: EntityId;
    restoration_successful: boolean;
    new_entity_id?: EntityId;        // Si nouvelle entité créée
    error_message?: string;
  };
  
  // Entités restaurées en cascade
  cascade_restorations: Array<{
    entity_type: string;
    entity_id: EntityId;
    restoration_status: 'restored' | 'partial' | 'failed' | 'skipped';
    new_entity_id?: EntityId;
    error_message?: string;
  }>;
  
  // Conflits détectés et résolus
  conflicts_resolved: Array<{
    conflict_type: 'duplicate_key' | 'broken_reference' | 'data_inconsistency';
    entity_affected: { entity_type: string; entity_id: EntityId };
    resolution_applied: string;
    manual_action_required?: boolean;
  }>;
  
  // Statistiques
  statistics: {
    total_entities_processed: number;
    successful_restorations: number;
    partial_restorations: number;
    failed_restorations: number;
    conflicts_resolved: number;
  };
  
  // Métadonnées
  operation_metadata: {
    started_at: Timestamp;
    completed_at: Timestamp;
    duration_ms: number;
    performed_by: EntityId;
    data_integrity_verified: boolean;
  };
}

// ============================================================================
// Types pour la gestion des politiques de rétention
// ============================================================================

/**
 * Politique de rétention pour les entités supprimées
 */
export interface RetentionPolicy {
  policy_id: EntityId;
  policy_name: string;
  description?: string;
  
  // Critères d'application
  applies_to: {
    entity_types: string[];
    conditions?: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  };
  
  // Règles de rétention
  retention_rules: {
    soft_delete_retention_days: number;
    hard_delete_after_days?: number;
    archive_before_hard_delete?: boolean;
    archive_retention_years?: number;
  };
  
  // Actions automatiques
  automated_actions: {
    send_deletion_warnings: boolean;
    warning_days_before?: number[];
    auto_archive_enabled: boolean;
    auto_hard_delete_enabled: boolean;
    require_approval_for_hard_delete: boolean;
  };
  
  // Exceptions et exclusions
  exceptions: {
    exclude_entity_ids?: EntityId[];
    exclude_if_referenced?: boolean;
    exclude_high_value_entities?: boolean;
    custom_exclusion_rules?: Array<{
      condition: string;
      reason: string;
    }>;
  };
  
  // Configuration
  is_active: boolean;
  priority: number;                   // Ordre d'évaluation
  
  // Métadonnées
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: EntityId;
  last_executed?: Timestamp;
  execution_count: number;
}

/**
 * Planification de cleanup automatique
 */
export interface CleanupSchedule {
  schedule_id: EntityId;
  schedule_name: string;
  
  // Configuration de la planification
  schedule_config: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    specific_time?: string;          // HH:MM format
    specific_day?: number;           // Jour du mois ou de la semaine
    timezone: string;
  };
  
  // Actions planifiées
  scheduled_actions: Array<{
    action_type: 'archive' | 'hard_delete' | 'notification' | 'report';
    entity_criteria: {
      entity_types: string[];
      age_threshold_days: number;
      additional_filters?: Array<{
        field: string;
        operator: string;
        value: any;
      }>;
    };
    
    // Configuration spécifique à l'action
    action_config?: {
      batch_size?: number;
      max_processing_time_minutes?: number;
      notification_recipients?: EntityId[];
      require_manual_approval?: boolean;
    };
  }>;
  
  // Sécurité et validation
  safety_checks: {
    max_entities_per_execution: number;
    require_backup_before_hard_delete: boolean;
    dry_run_before_execution: boolean;
    stop_on_errors: boolean;
  };
  
  // État et monitoring
  is_enabled: boolean;
  last_execution?: {
    started_at: Timestamp;
    completed_at?: Timestamp;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    entities_processed: number;
    errors_count: number;
  };
  
  // Métadonnées
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: EntityId;
}

// ============================================================================
// Types pour les requêtes et filtres
// ============================================================================

/**
 * Options pour inclure/exclure les entités supprimées dans les requêtes
 */
export interface SoftDeleteQueryOptions {
  include_deleted?: boolean;
  deleted_only?: boolean;
  
  // Filtres temporels
  deleted_after?: Timestamp;
  deleted_before?: Timestamp;
  deleted_by_users?: EntityId[];
  
  // Filtres par type de suppression
  deletion_types?: ('manual' | 'automatic' | 'cascade' | 'policy' | 'cleanup')[];
  
  // Options de restauration
  only_restorable?: boolean;
  restoration_deadline_before?: Timestamp;
  
  // Tri spécifique aux suppressions
  sort_by_deletion_date?: 'asc' | 'desc';
}

/**
 * Métadonnées enrichies pour les entités avec soft delete
 */
export interface EntityWithSoftDeleteInfo<T> {
  entity: T;
  
  // État de suppression
  deletion_info?: {
    is_deleted: boolean;
    deleted_at?: Timestamp;
    deleted_by?: EntityId;
    deletion_reason?: string;
    can_be_restored: boolean;
    restoration_deadline?: Timestamp;
  };
  
  // Historique de suppressions/restaurations
  deletion_history?: DeletionHistory[];
  
  // Relations affectées
  related_deletions?: Array<{
    entity_type: string;
    entity_id: EntityId;
    relationship_type: string;
    deletion_status: 'deleted' | 'active' | 'archived';
  }>;
}