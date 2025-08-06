/**
 * Système de règles automatiques d'alertes
 * Configuration et déclenchement automatique des alertes
 */

import type {
  AlertType,
  AlertSeverity,
  FolderStatus,
  ProcessingStage
} from '../constants/enums';

import type {
  BusinessImpact,
  NotificationMethod
} from './core';

// ============================================================================
// Types pour les conditions de déclenchement
// ============================================================================

/**
 * Conditions temporelles pour les règles
 */
export type TimeBasedCondition = 'days_before_deadline' | 'days_after_creation' | 'hours_without_update';

/**
 * Opérateurs de comparaison
 */
export type ComparisonOperator = 'greater_than' | 'less_than' | 'equal_to';

/**
 * Opérateurs pour les conditions de données
 */
export type DataOperator = 'equals' | 'not_equals' | 'greater' | 'less' | 'contains' | 'exists' | 'is_null';

// ============================================================================
// Interfaces pour les conditions
// ============================================================================

/**
 * Condition basée sur le temps
 */
export interface TimeBasedTrigger {
  condition: TimeBasedCondition;
  threshold: number;
  comparison: ComparisonOperator;
}

/**
 * Condition basée sur les données
 */
export interface DataCondition {
  field_path: string;
  operator: DataOperator;
  value: string | number | boolean | Date | null | undefined;
}

/**
 * Configuration d'escalade
 */
export interface EscalationRule {
  delay_hours: number;
  escalate_to: string[];
  increase_severity: boolean;
}

// ============================================================================
// Configurations principales
// ============================================================================

/**
 * Conditions de déclenchement d'une règle
 */
export interface TriggerConditions {
  folder_status?: FolderStatus[];
  processing_stage?: ProcessingStage[];
  alert_type: AlertType;
  severity_threshold?: AlertSeverity;
  
  // Conditions temporelles
  time_based_triggers?: TimeBasedTrigger[];
  
  // Conditions basées sur les données
  data_conditions?: DataCondition[];
}

/**
 * Configuration de l'alerte générée
 */
export interface AlertConfig {
  title_template: string;
  message_template: string;
  severity: AlertSeverity;
  business_impact: BusinessImpact;
  auto_assign_to?: string;
  auto_assign_team?: string;
  sla_hours?: number;
}

/**
 * Configuration des notifications
 */
export interface NotificationConfig {
  methods: NotificationMethod[];
  recipients: string[];
  escalation_rules?: EscalationRule[];
}

// ============================================================================
// Interface principale
// ============================================================================

/**
 * Règle de génération automatique d'alerte
 */
export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  
  // Conditions de déclenchement
  trigger_conditions: TriggerConditions;
  
  // Configuration de l'alerte générée
  alert_config: AlertConfig;
  
  // Configuration des notifications
  notification_config: NotificationConfig;
  
  // Configuration
  is_active: boolean;
  priority: number;           // Ordre d'évaluation des règles
  
  // Métadonnées
  created_at: string;
  updated_at: string;
  created_by: string;
}