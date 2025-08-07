/**
 * Types pour l'automatisation et les règles métier
 * Règles d'automatisation et résultats d'exécution
 * 
 * @module Containers/Automation
 * @version 2.0.0
 * @since 2025-01-06
 */

import type {
  ConditionValue,
  AutomationActionConfig,
  AutomationOutput
} from './base-types';

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
      value: ConditionValue;
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
    
    action_config: AutomationActionConfig;
    
    // Conditions d'exécution
    execute_if?: Array<{
      condition: string;
      value: ConditionValue;
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
    output?: AutomationOutput;
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