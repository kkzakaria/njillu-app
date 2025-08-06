/**
 * Système d'alertes pour les dossiers
 * Types pour la gestion des alertes, notifications et escalades
 */

import type {
  AlertType,
  AlertSeverity,
  AlertStatus,
  FolderStatus,
  ProcessingStage
} from './constants/enums';

import type { Folder } from './core/folder';

// ============================================================================
// Interface principale des alertes
// ============================================================================

/**
 * Alerte de dossier - interface complète
 */
export interface FolderAlert {
  id: string;
  folder_id: string;
  
  // Classification de l'alerte
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  
  // Contenu de l'alerte
  title: string;
  message: string;
  description?: string;
  
  // Contexte technique
  source_system?: string;       // Système qui a généré l'alerte
  source_reference?: string;    // Référence dans le système source
  error_code?: string;          // Code d'erreur technique
  
  // Contexte business
  business_impact: 'low' | 'medium' | 'high' | 'critical';
  affected_entities?: Array<{
    entity_type: 'bl' | 'container' | 'document' | 'activity';
    entity_id: string;
    entity_reference?: string;
  }>;
  
  // Informations temporelles
  triggered_at: string;
  first_occurrence?: string;    // Première occurrence du problème
  last_occurrence?: string;     // Dernière occurrence
  occurrence_count: number;     // Nombre d'occurrences
  
  // Échéances et délais
  due_date?: string;           // Date d'échéance pour résolution
  sla_deadline?: string;       // Deadline SLA
  escalation_time?: string;    // Moment d'escalade automatique
  
  // Assignation et responsabilité
  assigned_to?: string;        // Utilisateur assigné
  assigned_at?: string;
  assigned_by?: string;
  team_responsible?: string;   // Équipe responsable
  
  // Résolution
  resolution_notes?: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_method?: 'manual' | 'automatic' | 'escalated';
  
  // Actions recommandées
  recommended_actions?: Array<{
    action_type: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    estimated_effort?: string;
  }>;
  
  // Liens et références
  related_alerts?: string[];   // IDs d'alertes liées
  documentation_urls?: string[];
  support_ticket_id?: string;
  
  // Notifications
  notification_sent: boolean;
  notification_methods?: ('email' | 'sms' | 'push' | 'webhook')[];
  notification_recipients?: string[];
  
  // Métadonnées système
  created_at: string;
  updated_at: string;
  
  // Relations
  folder?: Folder;
}

// ============================================================================
// Types spécialisés d'alertes
// ============================================================================

/**
 * Alerte d'échéance
 */
export interface DeadlineAlert extends Omit<FolderAlert, 'type'> {
  type: 'deadline';
  
  // Spécifique aux échéances
  deadline_type: 'processing' | 'customs' | 'delivery' | 'payment' | 'document_expiry';
  original_deadline: string;
  current_deadline: string;
  days_remaining: number;
  is_overdue: boolean;
  grace_period_days?: number;
}

/**
 * Alerte de conformité
 */
export interface ComplianceAlert extends Omit<FolderAlert, 'type'> {
  type: 'compliance_issue';
  
  // Spécifique à la conformité
  compliance_area: 'customs' | 'safety' | 'environmental' | 'regulatory' | 'quality';
  regulation_reference?: string;
  violation_details: string;
  corrective_actions_required: string[];
  regulatory_deadline?: string;
  potential_penalties?: Array<{
    type: 'fine' | 'suspension' | 'license_revocation';
    amount?: number;
    currency?: string;
    description: string;
  }>;
}

/**
 * Alerte de retard
 */
export interface DelayAlert extends Omit<FolderAlert, 'type'> {
  type: 'delay';
  
  // Spécifique aux retards
  delay_type: 'processing' | 'transport' | 'customs' | 'document' | 'client_response';
  original_schedule: string;
  current_estimate: string;
  delay_duration_hours: number;
  impact_assessment: 'minimal' | 'moderate' | 'significant' | 'critical';
  downstream_impacts?: Array<{
    affected_process: string;
    estimated_delay: string;
    mitigation_possible: boolean;
  }>;
}

/**
 * Alerte de coût
 */
export interface CostAlert extends Omit<FolderAlert, 'type'> {
  type: 'cost_overrun';
  
  // Spécifique aux coûts
  budget_category: 'transport' | 'customs' | 'storage' | 'handling' | 'documentation' | 'other';
  original_budget: number;
  current_cost: number;
  projected_final_cost: number;
  overrun_amount: number;
  overrun_percentage: number;
  currency: string;
  
  // Analyse des causes
  cost_drivers?: Array<{
    category: string;
    description: string;
    amount: number;
    is_avoidable: boolean;
  }>;
}

// ============================================================================
// Configuration et règles d'alertes
// ============================================================================

/**
 * Règle de génération d'alerte
 */
export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  
  // Conditions de déclenchement
  trigger_conditions: {
    folder_status?: FolderStatus[];
    processing_stage?: ProcessingStage[];
    alert_type: AlertType;
    severity_threshold?: AlertSeverity;
    
    // Conditions temporelles
    time_based_triggers?: Array<{
      condition: 'days_before_deadline' | 'days_after_creation' | 'hours_without_update';
      threshold: number;
      comparison: 'greater_than' | 'less_than' | 'equal_to';
    }>;
    
    // Conditions basées sur les données
    data_conditions?: Array<{
      field_path: string;
      operator: 'equals' | 'not_equals' | 'greater' | 'less' | 'contains' | 'exists' | 'is_null';
      value: string | number | boolean | Date | null | undefined;
    }>;
  };
  
  // Configuration de l'alerte générée
  alert_config: {
    title_template: string;
    message_template: string;
    severity: AlertSeverity;
    business_impact: 'low' | 'medium' | 'high' | 'critical';
    auto_assign_to?: string;
    auto_assign_team?: string;
    sla_hours?: number;
  };
  
  // Configuration des notifications
  notification_config: {
    methods: ('email' | 'sms' | 'push' | 'webhook')[];
    recipients: string[];
    escalation_rules?: Array<{
      delay_hours: number;
      escalate_to: string[];
      increase_severity: boolean;
    }>;
  };
  
  // Configuration
  is_active: boolean;
  priority: number;           // Ordre d'évaluation des règles
  
  // Métadonnées
  created_at: string;
  updated_at: string;
  created_by: string;
}

/**
 * Paramètres globaux du système d'alertes
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
  environment: 'development' | 'staging' | 'production';
  debug_mode: boolean;
  
  updated_at: string;
  updated_by: string;
}

// ============================================================================
// Dashboard et métriques d'alertes
// ============================================================================

/**
 * Vue dashboard des alertes
 */
export interface AlertDashboard {
  // Compteurs globaux
  total_active_alerts: number;
  critical_alerts: number;
  overdue_alerts: number;
  unassigned_alerts: number;
  
  // Répartition par type
  alerts_by_type: Record<AlertType, number>;
  
  // Répartition par sévérité
  alerts_by_severity: Record<AlertSeverity, number>;
  
  // Tendances temporelles
  new_alerts_today: number;
  resolved_alerts_today: number;
  average_resolution_time_hours: number;
  
  // Top dossiers avec alertes
  folders_with_most_alerts: Array<{
    folder_id: string;
    folder_number: string;
    alert_count: number;
    highest_severity: AlertSeverity;
  }>;
  
  // Performance du système
  alert_resolution_rate: number;          // Pourcentage d'alertes résolues
  sla_compliance_rate: number;            // Respect des SLA
  average_first_response_time_hours: number;
  
  // Dernière mise à jour
  generated_at: string;
}

/**
 * Métrique de performance des alertes
 */
export interface AlertMetrics {
  period_start: string;
  period_end: string;
  
  // Volumes
  total_alerts_generated: number;
  total_alerts_resolved: number;
  alerts_auto_resolved: number;
  alerts_escalated: number;
  
  // Temps de traitement
  average_detection_time_minutes: number;
  average_response_time_hours: number;
  average_resolution_time_hours: number;
  
  // Efficacité
  false_positive_rate: number;
  duplicate_alert_rate: number;
  alert_recurrence_rate: number;
  
  // Impact business
  business_impact_prevented: number;      // Valeur estimée des problèmes évités
  cost_of_downtime_avoided: number;
  
  // Performance par type
  performance_by_type: Record<AlertType, {
    count: number;
    avg_resolution_time_hours: number;
    resolution_rate: number;
  }>;
  
  calculated_at: string;
}

// ============================================================================  
// Opérations sur les alertes
// ============================================================================

/**
 * Paramètres pour créer une alerte
 */
export interface CreateAlertData {
  folder_id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  description?: string;
  business_impact: 'low' | 'medium' | 'high' | 'critical';
  due_date?: string;
  assigned_to?: string;
  recommended_actions?: Array<{
    action_type: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

/**
 * Paramètres pour mettre à jour une alerte
 */
export interface UpdateAlertData {
  status?: AlertStatus;
  severity?: AlertSeverity;
  assigned_to?: string;
  due_date?: string;
  resolution_notes?: string;
  recommended_actions?: Array<{
    action_type: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

/**
 * Paramètres pour rechercher les alertes
 */
export interface AlertSearchParams {
  folder_ids?: string[];
  types?: AlertType[];
  severities?: AlertSeverity[];
  statuses?: AlertStatus[];
  assigned_to?: string[];
  created_from?: string;
  created_to?: string;
  due_from?: string;
  due_to?: string;
  business_impact?: ('low' | 'medium' | 'high' | 'critical')[];
  
  // Tri et pagination
  sort_by?: 'created_at' | 'severity' | 'due_date' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}