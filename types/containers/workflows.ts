/**
 * Types pour la gestion des workflows et transitions d'état
 * États, transitions et actions disponibles pour les conteneurs
 * 
 * @module Containers/Workflows
 * @version 2.0.0
 * @since 2025-01-06
 */

import type {
  ContainerArrivalStatus,
  ArrivalUrgency
} from './enums';

// ============================================================================
// Workflows et transitions d'état
// ============================================================================

/**
 * Définition d'une transition d'état valide
 */
export interface StatusTransition {
  from_status: ContainerArrivalStatus;
  to_status: ContainerArrivalStatus;
  transition_name: string;
  
  // Conditions requises
  required_conditions?: Array<{
    field: string;
    condition: 'exists' | 'not_empty' | 'valid_date' | 'positive_number';
    error_message?: string;
  }>;
  
  // Actions automatiques lors de la transition
  automatic_actions?: Array<{
    action: 'update_eta' | 'send_notification' | 'create_alert' | 'update_urgency';
    parameters?: Record<string, unknown>;
  }>;
  
  // Permissions requises
  required_permissions?: string[];
  
  // Validation métier
  business_validation?: {
    validate_dates: boolean;
    validate_location: boolean;
    validate_documents: boolean;
  };
}

/**
 * Actions disponibles pour un conteneur dans son état actuel
 */
export interface AvailableActions {
  container_id: string;
  current_status: ContainerArrivalStatus;
  current_urgency: ArrivalUrgency;
  
  // Transitions d'état possibles
  status_transitions: Array<{
    target_status: ContainerArrivalStatus;
    action_label: string;
    requires_confirmation: boolean;
    estimated_duration_hours?: number;
  }>;
  
  // Actions de données
  data_actions: Array<{
    action: 'update_eta' | 'add_note' | 'update_location' | 'change_urgency';
    label: string;
    icon?: string;
    requires_input: boolean;
  }>;
  
  // Actions de communication
  communication_actions: Array<{
    action: 'notify_client' | 'send_alert' | 'escalate_issue';
    label: string;
    recipients?: string[];
    template_options?: string[];
  }>;
  
  // Restrictions
  restrictions?: Array<{
    action: string;
    reason: string;
    required_permission?: string;
  }>;
}

/**
 * Résultat d'une action de workflow
 */
export interface WorkflowActionResult {
  action_id: string;
  container_id: string;
  action_type: string;
  
  // Résultat
  success: boolean;
  error_message?: string;
  warnings?: string[];
  
  // Changements effectués
  status_changed?: {
    from_status: ContainerArrivalStatus;
    to_status: ContainerArrivalStatus;
  };
  
  data_updated?: Array<{
    field: string;
    old_value: unknown;
    new_value: unknown;
  }>;
  
  // Actions déclenchées
  triggered_actions?: Array<{
    action_type: string;
    status: 'success' | 'failed' | 'pending';
    details?: string;
  }>;
  
  // Métadonnées
  executed_at: string;
  executed_by: string;
  execution_time_ms: number;
}