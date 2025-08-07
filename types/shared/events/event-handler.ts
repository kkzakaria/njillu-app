/**
 * Gestionnaires d'événements
 * Types pour la gestion et le traitement des événements
 * 
 * @module Shared/Events/EventHandler
 * @version 2.0.0
 * @since 2025-01-06
 */

import type { EventPayload } from '../core/value-objects';
import type { SystemEvent } from './system-event';

// ============================================================================
// Gestionnaires d'événements
// ============================================================================

/**
 * Handler d'événement avec contraintes de type
 */
export interface EventHandler<T extends EventPayload = EventPayload> {
  handler_id: string;
  handler_name: string;
  event_types: string[];
  priority: number;
  
  // Configuration de traitement
  processing_config: {
    batch_size?: number;
    max_retry_count?: number;
    retry_delay_ms?: number;
    timeout_ms?: number;
    parallel_processing?: boolean;
  };
  
  // Filtres d'événements
  filters?: {
    source_services?: string[];
    event_categories?: string[];
    priority_levels?: string[];
    custom_filters?: Record<string, unknown>;
  };
  
  // Métadonnées du handler
  created_at: string;
  last_executed?: string;
  is_active: boolean;
  execution_stats?: {
    total_processed: number;
    success_count: number;
    error_count: number;
    average_processing_time_ms: number;
  };
}

/**
 * Contexte d'exécution d'un handler
 */
export interface HandlerExecutionContext {
  handler_id: string;
  event: SystemEvent;
  execution_id: string;
  
  // Métadonnées d'exécution
  started_at: string;
  attempt_number: number;
  max_attempts: number;
  
  // Services disponibles
  services?: {
    logger?: unknown;
    database?: unknown;
    cache?: unknown;
    notifications?: unknown;
  };
}

/**
 * Résultat d'exécution d'un handler
 */
export interface HandlerExecutionResult {
  execution_id: string;
  success: boolean;
  
  // Timing
  started_at: string;
  completed_at: string;
  duration_ms: number;
  
  // Résultats
  result_data?: unknown;
  error_message?: string;
  error_details?: unknown;
  
  // Actions de suivi
  follow_up_events?: SystemEvent[];
  notifications_sent?: string[];
  
  // Métriques
  metrics?: {
    database_queries: number;
    cache_operations: number;
    external_api_calls: number;
    memory_used_mb?: number;
  };
}