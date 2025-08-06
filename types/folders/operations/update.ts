/**
 * Opérations de mise à jour - Types pour la modification de dossiers
 */

import type {
  FolderType,
  FolderCategory,
  FolderPriority,
  FolderUrgency,
  CustomsRegime,
  ServiceType,
  OperationType,
  FolderStatus,
  ProcessingStage,
  HealthStatus,
  PerformanceRating,
  ComplianceStatus
} from '../constants';

import type {
  ClientInfo,
  LocationInfo,
  FinancialInfo
} from '../entities';

/**
 * Données pour modifier un dossier existant
 */
export interface UpdateFolderData {
  // Tous les champs sont optionnels pour mise à jour partielle
  type?: FolderType;
  category?: FolderCategory;
  priority?: FolderPriority;
  urgency?: FolderUrgency;
  
  reference_number?: string;
  internal_reference?: string;
  
  client_info?: Partial<ClientInfo>;
  consignee_info?: Partial<ClientInfo>;
  notify_party_info?: Partial<ClientInfo>;
  
  origin?: Partial<LocationInfo>;
  destination?: Partial<LocationInfo>;
  current_location?: Partial<LocationInfo>;
  
  customs_regime?: CustomsRegime;
  compliance_status?: ComplianceStatus;
  
  service_type?: ServiceType;
  operation_type?: OperationType;
  
  description?: string;
  cargo_description?: string;
  special_instructions?: string;
  notes?: string;
  
  expected_start_date?: string;
  actual_start_date?: string;
  expected_completion_date?: string;
  actual_completion_date?: string;
  deadline_date?: string;
  
  financial_info?: Partial<FinancialInfo>;
  
  total_weight_kg?: number;
  total_volume_cbm?: number;
  total_packages?: number;
  
  related_folder_ids?: string[];
}

/**
 * Transition de statut de dossier
 */
export interface FolderStatusTransition {
  folder_id: string;
  from_status: FolderStatus;
  to_status: FolderStatus;
  from_stage?: ProcessingStage;
  to_stage?: ProcessingStage;
  
  // Justification
  reason: string;
  notes?: string;
  
  // Validation
  force_transition?: boolean; // Pour outrepasser les règles
  skip_validations?: string[]; // Validations à ignorer
  
  // Notifications
  notify_stakeholders?: boolean;
  notification_message?: string;
  
  // Métadonnées
  initiated_by: string;
  initiated_at: string;
}

/**
 * Actions disponibles sur un dossier
 */
export interface FolderAvailableActions {
  folder_id: string;
  current_status: FolderStatus;
  current_stage: ProcessingStage;
  
  // Actions possibles
  can_update: boolean;
  can_change_status: boolean;
  can_change_stage: boolean;
  can_assign: boolean;
  can_archive: boolean;
  can_delete: boolean;
  can_duplicate: boolean;
  can_split: boolean;
  can_merge: boolean;
  
  // Transitions autorisées
  allowed_status_transitions: FolderStatus[];
  allowed_stage_transitions: ProcessingStage[];
  
  // Actions spécifiques
  specific_actions: SpecificAction[];
}

/**
 * Action spécifique selon le contexte
 */
export interface SpecificAction {
  action_id: string;
  label: string;
  description?: string;
  icon?: string;
  category: ActionCategory;
  requires_confirmation: boolean;
  requires_reason: boolean;
  is_destructive: boolean;
  conditions?: ActionCondition[];
}

export type ActionCategory =
  | 'status'      // Changement de statut
  | 'assignment'  // Assignation
  | 'document'    // Gestion documentaire
  | 'financial'   // Financier
  | 'notification'// Notification
  | 'integration' // Intégration externe
  | 'administrative'; // Administratif

/**
 * Condition pour une action
 */
export interface ActionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: string | number | boolean | Date | string[] | number[] | null;
  error_message?: string;
}

/**
 * Résultat d'une mise à jour
 */
export interface UpdateFolderResult {
  success: boolean;
  updated_fields?: string[];
  warnings?: Array<{
    field: string;
    message: string;
  }>;
  errors?: Array<{
    field: string;
    code: string;
    message: string;
  }>;
  
  // État après mise à jour
  new_status?: FolderStatus;
  new_stage?: ProcessingStage;
  
  // Actions déclenchées
  triggered_actions?: string[];
  
  // Notifications envoyées
  notifications_sent?: Array<{
    recipient_type: string;
    recipient_id: string;
    notification_type: string;
  }>;
}

/**
 * Options de mise à jour
 */
export interface UpdateFolderOptions {
  // Validation
  skip_validation: boolean;
  validation_level: 'basic' | 'standard' | 'strict';
  
  // Notifications
  send_notifications: boolean;
  notification_recipients?: string[];
  custom_notification_message?: string;
  
  // Audit
  audit_reason?: string;
  audit_metadata?: Record<string, string | number | boolean | null>;
  
  // Intégrations
  sync_external_systems: boolean;
  external_system_ids?: string[];
  
  // Comportement
  create_snapshot: boolean; // Sauvegarder l'état avant modif
  auto_calculate_fields: boolean; // Recalculer les champs dérivés
}