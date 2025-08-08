/**
 * Politiques de rétention pour soft delete
 * Configuration des règles de rétention et nettoyage
 * 
 * @module Shared/SoftDelete/Policies/RetentionPolicy
 * @version 2.0.0
 * @since 2025-01-06
 */

import type { EntityId } from '../../core/identifiers';
import type { Timestamp } from '../../core/primitives';
import type { DurationMs } from '../../core/primitives';

// ============================================================================
// Politiques de rétention
// ============================================================================

/**
 * Politique de rétention pour un type d'entité
 */
export interface RetentionPolicy {
  // Identification
  policy_id: string;
  policy_name: string;
  entity_type: string;
  
  // Configuration de rétention
  retention_config: {
    // Durée de rétention avant suppression définitive
    soft_delete_retention_days: number;
    
    // Suppression automatique
    auto_permanent_deletion: boolean;
    grace_period_days?: number;  // Délai de grâce avant suppression auto
    
    // Conditions spéciales
    extended_retention_conditions?: Array<{
      condition_name: string;
      field: string;
      operator: string;
      value: unknown;
      extended_days: number;
      reason: string;
    }>;
  };
  
  // Configuration de nettoyage
  cleanup_config: {
    cleanup_enabled: boolean;
    cleanup_schedule: 'daily' | 'weekly' | 'monthly';
    cleanup_batch_size: number;
    cleanup_time_window?: {
      start_hour: number;  // 0-23
      end_hour: number;    // 0-23
      timezone: string;
    };
  };
  
  // Notifications et alertes
  notification_config?: {
    notify_before_deletion: boolean;
    notification_days_before: number[];
    notification_recipients: EntityId[];
    escalation_policy?: string;
  };
  
  // Exceptions et cas spéciaux
  exceptions?: Array<{
    exception_name: string;
    condition: Record<string, unknown>;
    action: 'never_delete' | 'custom_retention' | 'immediate_delete';
    custom_retention_days?: number;
    reason: string;
  }>;
  
  // Métadonnées de la politique
  created_by: EntityId;
  created_at: Timestamp;
  updated_at: Timestamp;
  version: number;
  is_active: boolean;
  
  // Statistiques d'application
  stats?: {
    entities_affected: number;
    permanent_deletions_performed: number;
    last_cleanup_run?: Timestamp;
    next_cleanup_scheduled?: Timestamp;
  };
}

/**
 * Configuration de nettoyage planifié
 */
export interface CleanupSchedule {
  // Identification
  schedule_id: string;
  schedule_name: string;
  
  // Politiques concernées
  retention_policies: string[];  // IDs des politiques
  
  // Programmation
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    cron_expression?: string;  // Pour fréquence custom
    timezone: string;
    
    // Fenêtre d'exécution
    execution_window?: {
      start_time: string;  // HH:mm format
      max_duration_minutes: number;
    };
  };
  
  // Paramètres d'exécution
  execution_config: {
    batch_size: number;
    max_concurrent_batches: number;
    pause_between_batches_ms: DurationMs;
    stop_on_error: boolean;
    
    // Limites de sécurité
    max_deletions_per_run?: number;
    confirm_before_large_batches?: number;
  };
  
  // Monitoring et reporting
  monitoring: {
    send_reports: boolean;
    report_recipients: EntityId[];
    alert_on_errors: boolean;
    alert_on_large_batches: boolean;
    
    // Métriques à tracker
    track_performance: boolean;
    track_error_rates: boolean;
  };
  
  // État et historique
  is_active: boolean;
  last_execution?: {
    started_at: Timestamp;
    completed_at?: Timestamp;
    status: 'success' | 'error' | 'partial' | 'cancelled';
    items_processed: number;
    items_deleted: number;
    errors_count: number;
  };
  
  next_execution?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}