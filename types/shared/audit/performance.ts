/**
 * Métadonnées de performance pour l'audit
 * Monitoring et métriques de performance des opérations
 * 
 * @module Shared/Audit/Performance
 * @version 2.0.0
 * @since 2025-01-06
 */

import type { DurationMs, Timestamp } from '../core/primitives';

// ============================================================================
// Métriques de performance
// ============================================================================

/**
 * Métadonnées de performance pour les opérations
 */
export interface PerformanceMetadata {
  // Temps d'exécution
  execution_time_ms: DurationMs;
  database_time_ms?: DurationMs;
  network_time_ms?: DurationMs;
  
  // Utilisation des ressources
  memory_used_mb?: number;
  cpu_usage_percent?: number;
  
  // Compteurs
  database_queries_count?: number;
  cache_hits?: number;
  cache_misses?: number;
  
  // Timestamps détaillés
  started_at: Timestamp;
  completed_at: Timestamp;
}

/**
 * Seuils de performance pour alertes
 */
export interface PerformanceThresholds {
  max_execution_time_ms: DurationMs;
  max_memory_mb: number;
  max_cpu_percent: number;
  max_database_queries: number;
  target_cache_hit_rate_percent: number;
}

/**
 * Rapport de performance d'une opération
 */
export interface PerformanceReport {
  operation_name: string;
  metrics: PerformanceMetadata;
  thresholds: PerformanceThresholds;
  alerts: Array<{
    type: 'warning' | 'error' | 'critical';
    message: string;
    threshold_exceeded: string;
    actual_value: number;
    threshold_value: number;
  }>;
  optimization_suggestions?: string[];
}