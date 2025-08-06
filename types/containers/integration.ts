/**
 * Types pour l'intégration avec les systèmes externes
 * Configuration des compagnies maritimes et résultats de synchronisation
 * 
 * @module Containers/Integration
 * @version 2.0.0
 * @since 2025-01-06
 */

import type {
  ContainerArrivalStatus
} from './enums';

import type {
  ContainerFieldValue
} from './base-types';

// ============================================================================
// Intégrations avec systèmes externes
// ============================================================================

/**
 * Configuration d'intégration avec une compagnie maritime
 */
export interface ShippingLineIntegration {
  integration_id: string;
  shipping_company_id: string;
  company_name: string;
  
  // Type d'intégration
  integration_type: 'api' | 'edi' | 'email_parsing' | 'web_scraping' | 'ftp';
  
  // Configuration technique
  connection_config: {
    // API REST
    base_url?: string;
    api_key?: string;
    authentication_method?: 'api_key' | 'oauth2' | 'basic_auth';
    
    // EDI
    edi_format?: 'x12' | 'edifact' | 'custom';
    edi_endpoint?: string;
    
    // Email
    email_address?: string;
    email_filters?: Array<{
      field: 'subject' | 'sender' | 'body';
      pattern: string;
      action: 'include' | 'exclude';
    }>;
    
    // FTP
    ftp_host?: string;
    ftp_port?: number;
    ftp_username?: string;
    ftp_directory?: string;
    
    // Commun
    timeout_seconds: number;
    retry_attempts: number;
    rate_limit_per_minute?: number;
  };
  
  // Mapping des données
  field_mapping: {
    container_number_field: string;
    eta_field?: string;
    actual_arrival_field?: string;
    status_field?: string;
    location_field?: string;
    
    // Mapping des valeurs de statut
    status_value_mapping?: Record<string, ContainerArrivalStatus>;
    
    // Format des dates
    date_format: string;
    timezone: string;
  };
  
  // Fréquence de synchronisation
  sync_schedule: {
    enabled: boolean;
    frequency: 'real_time' | 'hourly' | 'daily' | 'manual';
    specific_times?: string[];      // Pour fréquence quotidienne
    sync_window_hours?: number;     // Fenêtre de synchronisation
  };
  
  // Gestion des erreurs
  error_handling: {
    continue_on_error: boolean;
    max_consecutive_failures: number;
    escalation_after_failures: number;
    notification_recipients: string[];
  };
  
  // Métriques et monitoring
  monitoring: {
    track_response_times: boolean;
    alert_on_sync_failure: boolean;
    success_rate_threshold: number;
    data_quality_checks: boolean;
  };
  
  // État de l'intégration
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  last_sync_attempt?: string;
  last_successful_sync?: string;
  consecutive_failures: number;
  
  created_at: string;
  updated_at: string;
  created_by: string;
}

/**
 * Résultat de synchronisation avec un système externe
 */
export interface SyncResult {
  sync_id: string;
  integration_id: string;
  shipping_company_name: string;
  
  // Timing
  sync_started_at: string;
  sync_completed_at?: string;
  sync_duration_ms?: number;
  
  // Résultats
  status: 'success' | 'partial_success' | 'failed' | 'cancelled';
  
  // Statistiques
  containers_processed: number;
  containers_updated: number;
  containers_added: number;
  containers_failed: number;
  
  // Détails des modifications
  updates: Array<{
    container_id: string;
    container_number: string;
    changes: Array<{
      field: string;
      old_value?: ContainerFieldValue;
      new_value: ContainerFieldValue;
      confidence_level: 'high' | 'medium' | 'low';
    }>;
    notifications_triggered: number;
  }>;
  
  // Erreurs et avertissements
  errors: Array<{
    container_number?: string;
    error_type: 'connection' | 'parsing' | 'validation' | 'mapping';
    error_code: string;
    error_message: string;
    is_retryable: boolean;
  }>;
  
  warnings: Array<{
    container_number?: string;
    warning_type: string;
    message: string;
    recommended_action?: string;
  }>;
  
  // Qualité des données
  data_quality_metrics: {
    completeness_score: number;        // 0-100
    accuracy_score: number;           // 0-100
    timeliness_score: number;         // 0-100
    consistency_score: number;        // 0-100
  };
  
  // Actions recommandées
  recommended_actions: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    estimated_effort: string;
  }>;
  
  // Prochaine synchronisation
  next_sync_scheduled?: string;
  sync_frequency_adjusted?: boolean;
  new_frequency?: string;
}