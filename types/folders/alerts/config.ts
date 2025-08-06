/**
 * Configuration système des alertes
 * Paramètres globaux et configuration du système d'alertes
 */

// ============================================================================
// Types pour la configuration
// ============================================================================

/**
 * Environnements supportés
 */
export type Environment = 'development' | 'staging' | 'production';

// ============================================================================
// Configuration principale
// ============================================================================

/**
 * Configuration globale du système d'alertes
 */
export interface AlertSystemConfig {
  // Paramètres généraux
  enabled: boolean;
  evaluation_interval_minutes: number;
  max_alerts_per_folder: number;
  auto_resolve_after_days: number;
  
  // Paramètres de notification
  notification_batch_size: number;
  notification_rate_limit: number;
  notification_retry_attempts: number;
  
  // Paramètres d'escalade
  default_escalation_delay_hours: number;
  max_escalation_levels: number;
  weekend_escalation_enabled: boolean;
  
  // Paramètres de performance
  alert_retention_days: number;
  enable_alert_aggregation: boolean;
  duplicate_suppression_window_minutes: number;
  
  // Configuration par environnement
  environment: Environment;
  debug_mode: boolean;
  
  updated_at: string;
  updated_by: string;
}