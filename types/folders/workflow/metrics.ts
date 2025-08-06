/**
 * Workflow metrics - Métriques et analytics du workflow
 */

import type { ProcessingStage, StageStatus, StagePriority } from './stages';

/**
 * Dashboard des étapes de traitement
 */
export interface StagesDashboard {
  // Vue d'ensemble
  overview: {
    total_active_folders: number;
    total_stages_in_progress: number;
    total_completed_today: number;
    total_overdue_stages: number;
    average_completion_rate: number;
  };
  
  // Performance par étape
  stage_performance: Array<{
    stage: ProcessingStage;
    active_count: number;
    completed_today: number;
    average_duration_hours: number;
    completion_rate_24h: number;
    overdue_count: number;
  }>;
  
  // Alertes critiques
  critical_alerts: Array<{
    folder_id: string;
    folder_number: string;
    stage: ProcessingStage;
    issue_type: string;
    severity: 'high' | 'critical';
    days_overdue: number;
    assigned_to?: string;
  }>;
  
  // Tendances
  trends: {
    completion_rate_7d: number[];
    avg_duration_7d: number[];
    volume_by_stage_7d: Record<ProcessingStage, number[]>;
  };
  
  // Goulots d'étranglement
  bottlenecks: Array<{
    stage: ProcessingStage;
    current_volume: number;
    capacity_utilization: number;
    avg_wait_time_hours: number;
    suggested_actions: string[];
  }>;
  
  last_updated: string;
}

/**
 * Alerte sur une étape
 */
export interface StageAlert {
  id: string;
  folder_id: string;
  stage: ProcessingStage;
  
  // Type d'alerte
  alert_type: StageAlertType;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  
  // Description
  title: string;
  description: string;
  recommended_actions: string[];
  
  // Temporalité
  triggered_at: string;
  due_date?: string;
  escalation_date?: string;
  
  // Statut
  status: 'active' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed';
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  
  // Assignation
  assigned_to?: string;
  escalated_to?: string;
  
  // Métadonnées
  metadata?: {
    days_overdue?: number;
    expected_completion?: string;
    client_impact_level?: 'none' | 'low' | 'medium' | 'high';
    cost_impact?: number;
    related_alerts?: string[];
  };
}

export type StageAlertType =
  | 'overdue'                    // Étape en retard
  | 'approaching_deadline'       // Échéance approche
  | 'blocked_too_long'          // Bloqué trop longtemps
  | 'missing_assignment'        // Pas d'assignation
  | 'missing_documents'         // Documents manquants
  | 'approval_pending'          // Approbation en attente
  | 'quality_issue'            // Problème qualité détecté
  | 'resource_constraint'       // Contrainte de ressources
  | 'dependency_delay'          // Dépendance retardée
  | 'client_escalation'         // Escalade client
  | 'system_error'             // Erreur système
  | 'performance_degradation'   // Dégradation performance
  | 'capacity_exceeded'         // Capacité dépassée
  | 'compliance_risk'          // Risque de conformité
  | 'cost_overrun'             // Dépassement coût
  | 'other';                   // Autre

/**
 * Paramètres de recherche d'étapes
 */
export interface StageSearchParams {
  // Filtres de base
  folder_ids?: string[];
  stages?: ProcessingStage[];
  statuses?: StageStatus[];
  priorities?: StagePriority[];
  
  // Filtres temporels
  started_after?: string;
  started_before?: string;
  due_after?: string;
  due_before?: string;
  completed_after?: string;
  completed_before?: string;
  
  // Filtres d'assignation
  assigned_to?: string[];
  completed_by?: string[];
  created_by?: string[];
  
  // Filtres de performance
  overdue_only?: boolean;
  blocked_only?: boolean;
  requiring_approval?: boolean;
  has_alerts?: boolean;
  
  // Filtres client
  client_names?: string[];
  folder_numbers?: string[];
  
  // Recherche textuelle
  search_notes?: string;
  search_comments?: string;
  
  // Tri et pagination
  sort_by?: 'due_date' | 'started_at' | 'priority' | 'stage_order' | 'folder_number';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

/**
 * Résultats de recherche d'étapes
 */
export interface StageSearchResults {
  stages: Array<{
    id: string;
    folder_id: string;
    folder_number: string;
    stage: ProcessingStage;
    status: StageStatus;
    priority: StagePriority;
    
    // Assignation
    assigned_to?: string;
    assigned_to_name?: string;
    
    // Dates
    started_at?: string;
    due_date?: string;
    completed_at?: string;
    
    // Client
    client_name: string;
    
    // État
    days_in_status: number;
    is_overdue: boolean;
    has_alerts: boolean;
    
    // Performance
    completion_percentage?: number;
  }>;
  
  // Pagination
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  
  // Statistiques
  summary: {
    by_status: Record<StageStatus, number>;
    by_stage: Record<ProcessingStage, number>;
    by_priority: Record<StagePriority, number>;
    overdue_count: number;
    blocked_count: number;
  };
}

/**
 * Analyse de performance d'équipe
 */
export interface TeamPerformanceAnalysis {
  team_id: string;
  team_name: string;
  period_start: string;
  period_end: string;
  
  // Métriques globales
  overall_metrics: {
    total_stages_completed: number;
    average_completion_time_hours: number;
    on_time_completion_rate: number;
    quality_score_average: number;
    client_satisfaction_score?: number;
  };
  
  // Performance individuelle
  member_performance: Array<{
    user_id: string;
    user_name: string;
    stages_completed: number;
    average_completion_time: number;
    on_time_rate: number;
    quality_score: number;
    specialization_stages: ProcessingStage[];
    improvement_areas: string[];
  }>;
  
  // Performance par étape
  stage_expertise: Array<{
    stage: ProcessingStage;
    team_proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    completion_time_vs_target: number;
    error_rate: number;
    training_needed: boolean;
  }>;
  
  // Recommandations
  recommendations: Array<{
    type: 'training' | 'resource_allocation' | 'process_improvement' | 'tool_upgrade';
    priority: 'low' | 'medium' | 'high';
    description: string;
    estimated_impact: string;
    estimated_effort: string;
  }>;
}

/**
 * Configuration des SLA par étape
 */
export interface StageSLAConfig {
  stage: ProcessingStage;
  
  // Durées cibles
  target_duration_hours: number;
  warning_threshold_hours: number;
  critical_threshold_hours: number;
  
  // Jours ouvrables
  business_hours_only: boolean;
  exclude_weekends: boolean;
  exclude_holidays: boolean;
  
  // Escalation
  escalation_rules: Array<{
    trigger_after_hours: number;
    escalate_to_role: string;
    notification_template: string;
    auto_reassign: boolean;
  }>;
  
  // Exceptions
  client_exceptions: Array<{
    client_type: 'vip' | 'standard' | 'basic';
    duration_multiplier: number;
  }>;
  
  // Performance
  target_completion_rate: number; // % à compléter dans les délais
  minimum_quality_score?: number;
}