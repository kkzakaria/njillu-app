/**
 * Analytics et dashboards du système d'alertes
 * Métriques, performances et tableaux de bord
 */

import type {
  AlertType,
  AlertSeverity
} from '../constants/enums';

// ============================================================================
// Types pour les métriques
// ============================================================================

/**
 * Performance par type d'alerte
 */
export interface AlertTypePerformance {
  count: number;
  avg_resolution_time_hours: number;
  resolution_rate: number;
}

/**
 * Dossier avec le plus d'alertes
 */
export interface FolderWithMostAlerts {
  folder_id: string;
  folder_number: string;
  alert_count: number;
  highest_severity: AlertSeverity;
}

// ============================================================================
// Dashboard principal
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
  folders_with_most_alerts: FolderWithMostAlerts[];
  
  // Performance du système
  alert_resolution_rate: number;          // Pourcentage d'alertes résolues
  sla_compliance_rate: number;            // Respect des SLA
  average_first_response_time_hours: number;
  
  // Dernière mise à jour
  generated_at: string;
}

// ============================================================================
// Métriques de performance
// ============================================================================

/**
 * Métriques de performance des alertes sur une période
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
  performance_by_type: Record<AlertType, AlertTypePerformance>;
  
  calculated_at: string;
}