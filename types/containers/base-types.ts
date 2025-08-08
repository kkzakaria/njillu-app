/**
 * Types de base pour remplacer les types 'any' dans le système containers
 * Types union, interfaces spécialisées et types utilitaires
 * 
 * @module Containers/BaseTypes
 * @version 2.0.0
 * @since 2025-01-06
 */

import type {
  ContainerArrivalStatus,
  ArrivalUrgency,
  DelaySeverity,
  AlertPriority,
  NotificationChannel
} from './enums';

// ============================================================================
// Types union pour les valeurs de changement
// ============================================================================

/**
 * Type union pour les valeurs des champs containers dans les changements
 * Utilisé pour typer les old_value/new_value dans les sync et auto-correction
 */
export type ContainerFieldValue = 
  | string 
  | number 
  | boolean 
  | Date 
  | null 
  | ContainerArrivalStatus
  | ArrivalUrgency
  | DelaySeverity
  | AlertPriority
  | NotificationChannel;

// ============================================================================
// Types pour les conditions d'automation
// ============================================================================

/**
 * Valeur de condition pour l'automation
 * Supporté les comparaisons et filtres dans les règles
 */
export type ConditionValue = 
  | string 
  | number 
  | boolean 
  | Date 
  | string[] 
  | number[]
  | ContainerArrivalStatus
  | ArrivalUrgency
  | DelaySeverity;

// ============================================================================
// Configurations d'automation
// ============================================================================

/**
 * Configuration pour action de notification
 */
export interface NotificationActionConfig {
  channels: NotificationChannel[];
  template_id: string;
  recipients: string[];
  delay_seconds?: number;
  repeat_interval?: number;
  max_repeats?: number;
}

/**
 * Configuration pour action d'alerte
 */
export interface AlertActionConfig {
  priority: AlertPriority;
  title: string;
  description?: string;
  auto_acknowledge?: boolean;
  escalation_rules?: EscalationRule[];
}

/**
 * Configuration pour mise à jour de statut
 */
export interface StatusUpdateConfig {
  new_status: ContainerArrivalStatus;
  reason: string;
  notify_stakeholders: boolean;
  update_eta?: boolean;
}

/**
 * Configuration pour appel API
 */
export interface ApiCallConfig {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  payload?: Record<string, unknown>;
  timeout_ms: number;
  retry_attempts: number;
}

/**
 * Configuration pour déclenchement de workflow
 */
export interface WorkflowTriggerConfig {
  workflow_id: string;
  parameters?: Record<string, string | number>;
  priority: 'high' | 'medium' | 'low';
  async_execution: boolean;
}

/**
 * Configuration pour génération de rapport
 */
export interface ReportGenerationConfig {
  template_id: string;
  output_format: 'pdf' | 'excel' | 'csv';
  recipients: string[];
  schedule?: CronExpression;
}

/**
 * Union des configurations d'action d'automation
 */
export interface AutomationActionConfig {
  type: 'notification' | 'alert' | 'status' | 'api' | 'workflow' | 'report';
  notification?: NotificationActionConfig;
  alert?: AlertActionConfig;
  status?: StatusUpdateConfig;
  api?: ApiCallConfig;
  workflow?: WorkflowTriggerConfig;
  report?: ReportGenerationConfig;
}

// ============================================================================
// Types pour les résultats d'automation
// ============================================================================

/**
 * Résultat d'exécution de notification
 */
export interface NotificationResult {
  sent: boolean;
  channels_used: NotificationChannel[];
  recipients_reached: number;
  error_message?: string;
}

/**
 * Résultat de création d'alerte
 */
export interface AlertResult {
  alert_id: string;
  created: boolean;
  priority_assigned: AlertPriority;
  error_message?: string;
}

/**
 * Résultat de mise à jour de statut
 */
export interface StatusResult {
  updated: boolean;
  old_status: ContainerArrivalStatus;
  new_status: ContainerArrivalStatus;
  timestamp: Date;
  error_message?: string;
}

/**
 * Résultat d'appel API
 */
export interface ApiResult {
  success: boolean;
  status_code: number;
  response_data?: unknown;
  execution_time_ms: number;
  error_message?: string;
}

/**
 * Résultat de déclenchement de workflow
 */
export interface WorkflowResult {
  triggered: boolean;
  workflow_instance_id?: string;
  execution_status: 'started' | 'queued' | 'failed';
  error_message?: string;
}

/**
 * Résultat de génération de rapport
 */
export interface ReportResult {
  generated: boolean;
  report_id?: string;
  output_location?: string;
  size_bytes?: number;
  error_message?: string;
}

/**
 * Union des résultats d'automation
 */
export type AutomationOutput = {
  type: 'notification' | 'alert' | 'status' | 'api' | 'workflow' | 'report';
  timestamp: Date;
  result: NotificationResult | AlertResult | StatusResult | ApiResult | WorkflowResult | ReportResult;
};

// ============================================================================
// Types pour les corrections de validation
// ============================================================================

/**
 * Type pour les corrections suggérées dans la validation
 */
export type ValidationCorrection = 
  | string 
  | number 
  | Date 
  | ContainerArrivalStatus 
  | ArrivalUrgency
  | null;

// ============================================================================
// Types utilitaires
// ============================================================================

/**
 * Expression cron pour la planification
 */
export type CronExpression = string;

/**
 * Règle d'escalade pour les alertes
 */
export interface EscalationRule {
  delay_minutes: number;
  action: 'notify_manager' | 'create_ticket' | 'send_sms';
  parameters?: Record<string, string>;
}