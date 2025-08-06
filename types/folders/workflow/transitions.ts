/**
 * Workflow transitions - Types pour les transitions d'état
 */

import type { ProcessingStage, StageStatus, StagePriority } from './stages';

/**
 * Paramètres pour initialiser les étapes d'un dossier
 */
export interface InitializeFolderStagesParams {
  folder_id: string;
  created_by: string;
  custom_stages?: Array<{
    stage: ProcessingStage;
    priority?: StagePriority;
    is_mandatory?: boolean;
    estimated_duration?: string;
  }>;
}

/**
 * Paramètres pour démarrer une étape
 */
export interface StartProcessingStageParams {
  folder_id: string;
  stage: ProcessingStage;
  assigned_to?: string;
  started_by: string;
  notes?: string;
  estimated_completion_date?: string;
  priority_override?: StagePriority;
}

/**
 * Paramètres pour compléter une étape
 */
export interface CompleteProcessingStageParams {
  folder_id: string;
  stage: ProcessingStage;
  completed_by: string;
  completion_notes?: string;
  documents_attached?: string[];
  quality_check_passed?: boolean;
  client_notification_required?: boolean;
}

/**
 * Paramètres pour bloquer une étape
 */
export interface BlockProcessingStageParams {
  folder_id: string;
  stage: ProcessingStage;
  blocking_reason: string;
  blocked_by: string;
  expected_resolution_date?: string;
  escalation_required?: boolean;
  client_impact_level?: 'none' | 'low' | 'medium' | 'high';
}

/**
 * Paramètres pour débloquer une étape
 */
export interface UnblockProcessingStageParams {
  folder_id: string;
  stage: ProcessingStage;
  unblocked_by: string;
  resolution_notes: string;
  resume_immediately?: boolean;
  new_estimated_completion?: string;
}

/**
 * Paramètres pour approuver une étape
 */
export interface ApproveProcessingStageParams {
  folder_id: string;
  stage: ProcessingStage;
  approved_by: string;
  approval_notes?: string;
  conditions?: string[];
  auto_advance_to_next?: boolean;
}

/**
 * Paramètres pour ignorer une étape
 */
export interface SkipProcessingStageParams {
  folder_id: string;
  stage: ProcessingStage;
  skipped_by: string;
  skip_reason: SkipReason;
  skip_notes?: string;
  requires_approval?: boolean;
  approved_by?: string;
}

export type SkipReason =
  | 'not_applicable'        // Non applicable à ce dossier
  | 'already_completed'     // Déjà fait ailleurs
  | 'client_request'        // Demande du client
  | 'technical_impossibility' // Impossible techniquement
  | 'regulatory_exemption'  // Exemption réglementaire
  | 'time_constraint'       // Contrainte de temps
  | 'cost_optimization'     // Optimisation des coûts
  | 'alternative_process'   // Processus alternatif utilisé
  | 'other';               // Autre raison

/**
 * Données de transition d'étape
 */
export interface StageTransitionData {
  folder_id: string;
  stage: ProcessingStage;
  from_status: StageStatus;
  to_status: StageStatus;
  
  // Contexte de la transition
  initiated_by: string;
  initiated_at: string;
  reason?: string;
  notes?: string;
  
  // Données spécifiques selon le type de transition
  transition_data?: StartStageData | CompleteStageData | BlockStageData | SkipStageData;
  
  // Validation
  validation_passed: boolean;
  validation_errors?: string[];
  validation_warnings?: string[];
  
  // Impact
  affects_timeline: boolean;
  client_notification_sent?: boolean;
  next_stage_auto_started?: boolean;
}

/**
 * Données spécifiques au démarrage d'étape
 */
export interface StartStageData {
  assigned_to?: string;
  estimated_completion_date?: string;
  priority_override?: StagePriority;
  required_documents?: string[];
}

/**
 * Données spécifiques à la completion d'étape
 */
export interface CompleteStageData {
  completion_notes?: string;
  documents_attached?: string[];
  quality_metrics?: {
    score: number;
    criteria_met: string[];
    criteria_failed?: string[];
  };
  actual_vs_estimated?: {
    estimated_duration: string;
    actual_duration: string;
    variance_percentage: number;
  };
}

/**
 * Données spécifiques au blocage d'étape
 */
export interface BlockStageData {
  blocking_reason: string;
  expected_resolution_date?: string;
  escalation_level: number;
  client_impact_level: 'none' | 'low' | 'medium' | 'high';
  dependencies?: string[];
}

/**
 * Données spécifiques au skip d'étape
 */
export interface SkipStageData {
  skip_reason: SkipReason;
  requires_approval: boolean;
  approved_by?: string;
  approval_date?: string;
  alternative_process?: string;
}

/**
 * Règles de transition entre statuts
 */
export interface StageTransitionRules {
  stage: ProcessingStage;
  allowed_transitions: Array<{
    from_status: StageStatus;
    to_status: StageStatus;
    conditions?: TransitionCondition[];
    required_role?: string;
    requires_approval?: boolean;
    auto_transition_after?: string; // Délai d'auto-transition
  }>;
}

/**
 * Condition pour une transition
 */
export interface TransitionCondition {
  type: 'field_value' | 'time_elapsed' | 'dependency_met' | 'approval_received' | 'custom';
  field?: string;
  operator?: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value?: any;
  dependency_stage?: ProcessingStage;
  custom_validation?: string;
  error_message?: string;
}

/**
 * Machine à états pour les étapes
 */
export interface StageStateMachine {
  current_state: StageStatus;
  available_transitions: Array<{
    to_state: StageStatus;
    action_label: string;
    requires_confirmation: boolean;
    requires_reason: boolean;
    estimated_duration?: string;
  }>;
  transition_history: Array<{
    from_state: StageStatus;
    to_state: StageStatus;
    timestamp: string;
    initiated_by: string;
    reason?: string;
  }>;
}

/**
 * Validation d'une transition proposée
 */
export interface TransitionValidation {
  is_valid: boolean;
  can_proceed: boolean;
  
  errors: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
  
  warnings: Array<{
    code: string;
    message: string;
    can_ignore: boolean;
  }>;
  
  requirements: Array<{
    type: 'approval' | 'document' | 'field' | 'dependency';
    description: string;
    is_met: boolean;
    missing_items?: string[];
  }>;
  
  impact_assessment: {
    affects_timeline: boolean;
    affects_cost: boolean;
    requires_client_notification: boolean;
    estimated_delay_days?: number;
  };
}