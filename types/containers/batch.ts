/**
 * Types pour les opérations en lot et traitement groupé
 * Opérations bulk, traitement par lots et optimisations
 * 
 * @module Containers/Batch
 * @version 2.0.0
 * @since 2025-01-06
 */

import type {
  ContainerArrivalStatus
} from './enums';

import type {
  BatchOperationResult
} from './crud';

// ============================================================================
// Opérations en lot et traitement groupé
// ============================================================================

/**
 * Configuration pour opération en lot avancée
 */
export interface BatchConfiguration {
  batch_id: string;
  batch_name: string;
  
  // Paramètres d'exécution
  execution_config: {
    batch_size: number;                 // Nombre d'éléments par lot
    parallel_processing: boolean;       // Traitement parallèle
    max_concurrent_batches?: number;    // Limite de lots simultanés
    retry_failed_items: boolean;        // Retry automatique
    rollback_on_error: boolean;         // Rollback complet en cas d'erreur
  };
  
  // Critères de sélection
  selection_criteria: {
    container_ids?: string[];
    status_filter?: ContainerArrivalStatus[];
    date_range?: {
      field: 'created_at' | 'eta' | 'updated_at';
      from: string;
      to: string;
    };
    custom_filters?: Array<{
      field: string;
      operator: 'equals' | 'in' | 'greater' | 'less';
      value: unknown;
    }>;
  };
  
  // Validation et sécurité
  validation_rules: {
    validate_before_execution: boolean;
    dry_run_available: boolean;
    require_approval: boolean;
    approval_threshold?: number;        // Seuil nécessitant approbation
  };
  
  // Notification et monitoring
  monitoring: {
    notify_on_completion: boolean;
    notify_on_error: boolean;
    progress_reporting_interval: number; // Secondes
    recipients: string[];
  };
}

/**
 * Résultat d'opération en lot étendu
 */
export interface ExtendedBatchResult extends BatchOperationResult {
  // Configuration utilisée
  batch_configuration: BatchConfiguration;
  
  // Métriques détaillées
  performance_metrics: {
    throughput_items_per_second: number;
    average_latency_ms: number;
    peak_concurrent_operations: number;
    total_network_calls: number;
    cache_hit_rate?: number;
  };
  
  // Analyse des erreurs
  error_analysis: {
    error_categories: Array<{
      category: string;
      count: number;
      percentage: number;
      typical_cause: string;
    }>;
    retry_attempts_made: number;
    items_resolved_on_retry: number;
  };
  
  // Impact business
  business_impact: {
    containers_affected: number;
    estimated_time_saved_hours?: number;
    estimated_cost_impact?: number;
    sla_compliance_rate?: number;
  };
  
  // Recommandations d'optimisation
  optimization_suggestions: Array<{
    suggestion: string;
    category: 'performance' | 'reliability' | 'cost' | 'user_experience';
    estimated_improvement: string;
    implementation_effort: 'low' | 'medium' | 'high';
  }>;
}