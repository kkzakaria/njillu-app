/**
 * Types pour les opérations sur les conteneurs et le système d'arrivées
 * CRUD, workflows, intégrations, synchronisation des données
 */

import type {
  ContainerArrivalStatus,
  ArrivalUrgency,
  DelaySeverity,
  ContainerUrgencyLevel,
  ContainerHealthStatus
} from './enums';

import type {
  ContainerArrivalTracking,
  UpdateArrivalData,
  ArrivalNotificationConfig
} from './arrival-tracking';

// ============================================================================
// Opérations CRUD sur les données d'arrivée
// ============================================================================

/**
 * Données pour créer un nouveau tracking d'arrivée
 */
export interface CreateArrivalTrackingData {
  container_id: string;
  
  // Dates de planification
  estimated_arrival_date?: string;
  original_eta?: string;
  
  // Localisation
  arrival_location?: string;
  port_of_discharge: string;
  
  // Configuration initiale
  initial_status?: ContainerArrivalStatus;
  tracking_source?: string;
  confidence_level?: 'high' | 'medium' | 'low';
  
  // Notifications
  enable_notifications?: boolean;
  notification_config?: Partial<ArrivalNotificationConfig>;
  
  // Métadonnées
  notes?: string;
  created_by: string;
}

/**
 * Données pour mise à jour en lot des informations d'arrivée
 */
export interface BatchUpdateArrivalData {
  updates: Array<{
    container_id: string;
    data: Partial<UpdateArrivalData>;
  }>;
  
  // Options globales
  global_options: {
    update_source: 'manual' | 'api' | 'integration' | 'scheduled_sync';
    batch_reason?: string;
    notify_clients: boolean;
    validate_before_update: boolean;
    rollback_on_error: boolean;
  };
  
  // Métadonnées
  initiated_by: string;
  scheduled_execution?: string;
}

/**
 * Résultat d'une opération en lot
 */
export interface BatchOperationResult {
  operation_id: string;
  operation_type: string;
  
  // Résultats globaux
  total_items: number;
  successful_items: number;
  failed_items: number;
  skipped_items: number;
  
  // Détails par conteneur
  item_results: Array<{
    container_id: string;
    container_number?: string;
    success: boolean;
    error_code?: string;
    error_message?: string;
    warnings?: string[];
    processing_time_ms?: number;
  }>;
  
  // Métriques de performance
  execution_time_ms: number;
  average_time_per_item: number;
  peak_memory_usage?: number;
  
  // Historique et traçabilité
  executed_at: string;
  executed_by: string;
  rollback_available: boolean;
  rollback_deadline?: string;
  
  // Recommandations
  post_execution_actions?: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high';
    description: string;
  }>;
}

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
      old_value?: any;
      new_value: any;
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

// ============================================================================
// Automatisation et règles métier
// ============================================================================

/**
 * Règle d'automatisation pour le traitement des arrivées
 */
export interface ArrivalAutomationRule {
  rule_id: string;
  rule_name: string;
  description: string;
  
  // Conditions de déclenchement
  trigger_conditions: {
    // Événements système
    on_events: Array<
      | 'eta_received'
      | 'eta_changed'
      | 'container_arrived'
      | 'status_changed'
      | 'delay_detected'
      | 'customs_cleared'
    >;
    
    // Conditions sur les données
    data_conditions?: Array<{
      field: string;
      operator: 'equals' | 'not_equals' | 'greater' | 'less' | 'contains' | 'changed';
      value: any;
    }>;
    
    // Conditions temporelles
    time_conditions?: Array<{
      condition: 'days_before_eta' | 'days_after_eta' | 'hours_without_update';
      threshold: number;
    }>;
    
    // Filtres par entité
    entity_filters?: {
      shipping_companies?: string[];
      client_categories?: string[];
      container_types?: string[];
      priority_levels?: string[];
    };
  };
  
  // Actions à exécuter
  actions: Array<{
    action_type: 
      | 'send_notification'
      | 'create_alert'
      | 'update_status'
      | 'assign_to_team'
      | 'trigger_workflow'
      | 'call_api'
      | 'generate_report';
    
    action_config: Record<string, any>;
    
    // Conditions d'exécution
    execute_if?: Array<{
      condition: string;
      value: any;
    }>;
    
    // Délai d'exécution
    delay_minutes?: number;
    max_executions?: number;        // Limite d'exécutions par conteneur
  }>;
  
  // Configuration
  is_active: boolean;
  priority: number;                   // Ordre d'évaluation
  execution_mode: 'immediate' | 'scheduled' | 'manual_approval';
  
  // Gestion des erreurs
  error_handling: {
    continue_on_error: boolean;
    retry_attempts: number;
    escalate_on_failure: boolean;
    escalation_recipients?: string[];
  };
  
  // Historique et métriques
  created_at: string;
  updated_at: string;
  created_by: string;
  last_executed?: string;
  execution_count: number;
  success_rate: number;
}

/**
 * Résultat d'exécution d'une règle d'automatisation
 */
export interface AutomationExecutionResult {
  execution_id: string;
  rule_id: string;
  rule_name: string;
  
  // Contexte d'exécution
  triggered_by_event: string;
  container_id: string;
  container_number: string;
  
  // Résultat global
  status: 'success' | 'partial_success' | 'failed' | 'skipped';
  execution_time_ms: number;
  
  // Résultats par action
  action_results: Array<{
    action_type: string;
    status: 'success' | 'failed' | 'skipped';
    output?: any;
    error_message?: string;
    execution_time_ms: number;
  }>;
  
  // Impact
  notifications_sent: number;
  alerts_created: number;
  status_changes_made: number;
  
  // Métadonnées
  executed_at: string;
  retry_count?: number;
  next_retry_at?: string;
}

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
    suggested_correction?: any;
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
    old_value: any;
    new_value: any;
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

// ============================================================================
// Recherche et filtrage avancés
// ============================================================================

/**
 * Paramètres de recherche avancée pour les conteneurs
 */
export interface AdvancedContainerSearchParams {
  // Recherche textuelle avec opérateurs
  search_query?: {
    text: string;
    fields: ('container_number' | 'bl_number' | 'client_name' | 'notes')[];
    operators: ('AND' | 'OR' | 'NOT')[];
    fuzzy_matching: boolean;
  };
  
  // Filtres temporels complexes
  date_filters?: {
    eta_range?: { from: string; to: string };
    arrival_range?: { from: string; to: string };
    created_range?: { from: string; to: string };
    
    // Filtres relatifs
    arriving_in_days?: number;
    delayed_by_days?: number;
    updated_within_hours?: number;
  };
  
  // Filtres de statut et performance
  status_filters?: {
    arrival_statuses?: ContainerArrivalStatus[];
    urgency_levels?: ContainerUrgencyLevel[];
    health_statuses?: ContainerHealthStatus[];
    
    // Conditions combinées
    has_delays: boolean;
    missing_eta: boolean;
    requires_attention: boolean;
    client_vip: boolean;
  };
  
  // Filtres géographiques et logistiques
  logistics_filters?: {
    origin_ports?: string[];
    destination_ports?: string[];
    shipping_companies?: string[];
    vessel_names?: string[];
    container_types?: string[];
  };
  
  // Filtres business et financiers
  business_filters?: {
    client_categories?: string[];
    value_ranges?: Array<{ min: number; max: number; currency: string }>;
    priority_levels?: string[];
    service_types?: string[];
  };
  
  // Métriques et KPI
  metrics_filters?: {
    delay_severity?: DelaySeverity[];
    performance_score_min?: number;
    cost_impact_min?: number;
    client_satisfaction_min?: number;
  };
  
  // Options de recherche
  search_options?: {
    include_archived: boolean;
    include_cancelled: boolean;
    exact_match_only: boolean;
    case_sensitive: boolean;
    include_soft_deleted: boolean;
  };
  
  // Tri et pagination avancés
  sorting?: Array<{
    field: string;
    direction: 'asc' | 'desc';
    priority: number;
  }>;
  
  pagination?: {
    page: number;
    page_size: number;
    max_results?: number;
  };
  
  // Agrégations demandées
  requested_aggregations?: Array<
    | 'count_by_status'
    | 'avg_delay_by_company'
    | 'cost_by_client'
    | 'performance_trends'
  >;
}