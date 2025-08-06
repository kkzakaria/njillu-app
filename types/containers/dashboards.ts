/**
 * Types pour les dashboards et vues analytiques des conteneurs
 * Vues principales, dashboards utilisateurs et analyses
 * 
 * @module Containers/Dashboards
 * @version 2.0.0
 * @since 2025-01-06
 */

import type {
  ContainerArrivalStatus,
  ArrivalUrgency,
  DelaySeverity,
  ContainerUrgencyLevel,
  ContainerHealthStatus
} from './enums';

import type {
  ContainerArrivalTracking
} from './tracking-core';

import type {
  ArrivalPerformanceMetrics
} from './metrics';

import type {
  WidgetConfiguration,
  DashboardFilters,
  CachedDashboardData,
  NavigationDetails
} from './dashboard-types';

// ============================================================================
// Dashboard principal des arrivées
// ============================================================================

/**
 * Vue principale du dashboard des arrivées de conteneurs
 */
export interface ContainerArrivalDashboard {
  // Métadonnées du dashboard
  generated_at: string;
  data_freshness_minutes: number;
  total_containers_tracked: number;
  
  // Indicateurs clés de performance (KPI)
  kpis: {
    containers_arriving_today: number;
    containers_arriving_tomorrow: number;
    containers_arriving_this_week: number;
    containers_overdue: number;
    average_delay_days: number;
    on_time_performance_rate: number;
    critical_alerts_count: number;
  };
  
  // Répartition par statut d'arrivée
  status_breakdown: Record<ContainerArrivalStatus, {
    count: number;
    percentage: number;
    trend_vs_last_week: number;      // % de variation
  }>;
  
  // Répartition par niveau d'urgence
  urgency_breakdown: Record<ArrivalUrgency, {
    count: number;
    percentage: number;
    avg_days_until_arrival?: number;
  }>;
  
  // Répartition par santé des conteneurs
  health_breakdown: Record<ContainerHealthStatus, {
    count: number;
    percentage: number;
    description: string;
  }>;
  
  // Top des retards les plus importants
  top_delays: Array<{
    container_id: string;
    container_number: string;
    bl_number: string;
    client_name: string;
    delay_days: number;
    delay_severity: DelaySeverity;
    estimated_cost_impact?: number;
  }>;
  
  // Arrivées imminentes (aujourd'hui et demain)
  imminent_arrivals: Array<{
    container_id: string;
    container_number: string;
    bl_number: string;
    shipping_company_short: string;
    estimated_arrival_date: string;
    arrival_location?: string;
    urgency_level: ContainerUrgencyLevel;
    is_high_value: boolean;
  }>;
  
  // Conteneurs nécessitant une attention
  requires_attention: Array<{
    container_id: string;
    container_number: string;
    bl_number: string;
    issue_type: 'missing_eta' | 'delayed' | 'customs_hold' | 'document_missing';
    issue_description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    days_outstanding: number;
  }>;
  
  // Tendances et évolution
  trends: {
    arrival_volume_trend_7d: number;     // % variation sur 7 jours
    delay_rate_trend_7d: number;
    performance_trend_30d: number;
    client_satisfaction_trend?: number;
  };
}

// ============================================================================
// Vues spécialisées pour différents utilisateurs
// ============================================================================

/**
 * Vue dashboard pour les gestionnaires
 */
export interface ManagerDashboardView {
  // Résumé exécutif
  executive_summary: {
    total_active_containers: number;
    on_time_performance: number;
    cost_variance_percentage: number;
    customer_satisfaction_score?: number;
    revenue_at_risk?: number;
  };
  
  // Performance par équipe
  team_performance: Array<{
    team_name: string;
    containers_managed: number;
    on_time_rate: number;
    avg_resolution_time_hours: number;
    customer_feedback_score?: number;
  }>;
  
  // Performance par client
  client_performance: Array<{
    client_name: string;
    containers_count: number;
    on_time_rate: number;
    total_value: number;
    satisfaction_score?: number;
    risk_level: 'low' | 'medium' | 'high';
  }>;
  
  // Alertes nécessitant escalade
  escalation_required: Array<{
    alert_type: string;
    container_count: number;
    max_delay_days: number;
    estimated_impact: number;
    recommended_action: string;
  }>;
  
  // Prévisions et planification
  forecasts: {
    expected_arrivals_next_7_days: number;
    expected_delays_next_7_days: number;
    capacity_utilization_forecast: number;
    resource_requirements_forecast: string[];
  };
}

/**
 * Vue dashboard pour les opérateurs
 */
export interface OperatorDashboardView {
  // Tâches du jour
  daily_tasks: {
    containers_to_track: number;
    eta_updates_needed: number;
    customer_notifications_pending: number;
    customs_clearances_due: number;
    deliveries_scheduled: number;
  };
  
  // File d'attente prioritaire
  priority_queue: Array<{
    container_id: string;
    container_number: string;
    task_type: 'update_eta' | 'resolve_delay' | 'notify_client' | 'clear_customs';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date: string;
    estimated_effort_minutes: number;
    client_vip: boolean;
  }>;
  
  // Alertes actives assignées
  assigned_alerts: Array<{
    alert_id: string;
    container_number: string;
    alert_type: string;
    severity: string;
    assigned_since_hours: number;
    sla_deadline: string;
    client_notified: boolean;
  }>;
  
  // Outils et raccourcis
  quick_actions: {
    containers_needing_eta: string[];     // IDs des conteneurs
    ready_for_notification: string[];
    awaiting_confirmation: string[];
    require_follow_up: string[];
  };
  
  // Performance personnelle
  personal_metrics: {
    containers_handled_today: number;
    avg_resolution_time_minutes: number;
    customer_satisfaction_score?: number;
    productivity_score: number;
  };
}

/**
 * Vue dashboard pour les clients
 */
export interface ClientDashboardView {
  client_id: string;
  client_name: string;
  
  // Aperçu des conteneurs du client
  container_overview: {
    total_containers: number;
    in_transit: number;
    arrived: number;
    delayed: number;
    ready_for_pickup: number;
  };
  
  // Conteneurs en transit
  containers_in_transit: Array<{
    container_number: string;
    bl_number: string;
    origin: string;
    destination: string;
    estimated_arrival_date?: string;
    status: ContainerArrivalStatus;
    urgency_level: ContainerUrgencyLevel;
    tracking_url?: string;
  }>;
  
  // Arrivées prévues
  upcoming_arrivals: Array<{
    container_number: string;
    bl_number: string;
    estimated_arrival_date: string;
    arrival_location: string;
    requires_action: boolean;
    action_description?: string;
    contact_info?: string;
  }>;
  
  // Notifications récentes
  recent_notifications: Array<{
    date: string;
    type: string;
    container_number: string;
    message: string;
    action_required: boolean;
  }>;
  
  // Métriques de service
  service_metrics: {
    on_time_delivery_rate: number;
    average_transit_time_days: number;
    customer_satisfaction_score?: number;
    cost_efficiency_rating?: number;
  };
}

// ============================================================================
// Vues analytiques et rapports
// ============================================================================

/**
 * Analyse comparative des performances
 */
export interface PerformanceAnalysisView {
  analysis_period: {
    start_date: string;
    end_date: string;
    comparison_period_start?: string;
    comparison_period_end?: string;
  };
  
  // Métriques globales
  overall_metrics: ArrivalPerformanceMetrics;
  
  // Comparaison par compagnie maritime
  shipping_company_comparison: Array<{
    company_id: string;
    company_name: string;
    metrics: {
      total_containers: number;
      on_time_rate: number;
      average_delay_days: number;
      cost_per_container: number;
      customer_satisfaction: number;
    };
    ranking: number;
    trend: 'improving' | 'stable' | 'declining';
  }>;
  
  // Analyse par port de destination
  port_analysis: Array<{
    port_code: string;
    port_name: string;
    metrics: {
      container_volume: number;
      congestion_score: number;
      average_processing_days: number;
      delay_probability: number;
    };
    seasonal_patterns?: Array<{
      month: number;
      typical_delay_days: number;
      volume_multiplier: number;
    }>;
  }>;
  
  // Analyse des causes de retard
  delay_cause_analysis: Array<{
    cause_category: string;
    occurrences: number;
    average_delay_days: number;
    total_cost_impact: number;
    mitigation_strategies: string[];
    prevention_score: number;        // 0-100, capacité de prévention
  }>;
  
  // Prédictions et recommandations
  predictions: {
    next_month_delay_rate: number;
    risk_containers: string[];      // IDs des conteneurs à risque
    capacity_forecast: number;
    cost_optimization_opportunities: Array<{
      opportunity: string;
      estimated_savings: number;
      implementation_effort: 'low' | 'medium' | 'high';
    }>;
  };
}

/**
 * Rapport de coûts et impacts financiers
 */
export interface CostImpactAnalysis {
  analysis_period: {
    start_date: string;
    end_date: string;
  };
  
  // Coûts directs des retards
  delay_costs: {
    total_delay_cost: number;
    cost_per_delay_day: number;
    most_expensive_delay: {
      container_id: string;
      delay_days: number;
      cost_impact: number;
    };
    
    // Répartition par type de coût
    cost_breakdown: {
      storage_costs: number;
      demurrage_charges: number;
      expediting_fees: number;
      customer_penalties: number;
      operational_overhead: number;
    };
  };
  
  // Impact sur les clients
  customer_impact: {
    affected_customers: number;
    total_compensation_paid: number;
    relationships_at_risk: number;
    estimated_revenue_loss: number;
    
    // Top clients impactés
    most_impacted_clients: Array<{
      client_name: string;
      containers_delayed: number;
      financial_impact: number;
      satisfaction_drop: number;
      risk_of_churn: 'low' | 'medium' | 'high';
    }>;
  };
  
  // Opportunités d'amélioration
  improvement_opportunities: Array<{
    category: 'process' | 'technology' | 'supplier' | 'communication';
    description: string;
    estimated_cost_savings: number;
    implementation_cost: number;
    roi_percentage: number;
    payback_period_months: number;
  }>;
  
  // Benchmarking industrie
  industry_comparison?: {
    industry_average_delay_rate: number;
    our_performance_percentile: number;
    best_in_class_benchmark: number;
    gap_analysis: string[];
  };
}

// ============================================================================
// Configuration et session des dashboards
// ============================================================================

/**
 * Configuration personnalisée d'un dashboard
 */
export interface DashboardConfiguration {
  dashboard_id: string;
  user_id: string;
  dashboard_type: 'manager' | 'operator' | 'client' | 'analyst';
  
  // Layout et widgets
  layout: {
    widgets: Array<{
      widget_id: string;
      widget_type: 'kpi' | 'chart' | 'table' | 'alert' | 'map';
      position: { x: number; y: number; width: number; height: number };
      configuration: WidgetConfiguration;
      is_visible: boolean;
      refresh_interval_seconds?: number;
    }>;
    
    theme: 'light' | 'dark' | 'auto';
    layout_type: 'grid' | 'flex' | 'custom';
  };
  
  // Filtres par défaut
  default_filters: {
    date_range: 'today' | 'week' | 'month' | 'quarter' | 'custom';
    custom_date_from?: string;
    custom_date_to?: string;
    shipping_companies?: string[];
    priority_levels?: string[];
    client_filter?: string[];
  };
  
  // Alertes et notifications
  alert_preferences: {
    real_time_alerts: boolean;
    email_digest: 'none' | 'daily' | 'weekly';
    push_notifications: boolean;
    alert_sound: boolean;
    alert_threshold_overrides?: Record<string, number>;
  };
  
  // Personnalisation
  display_preferences: {
    timezone: string;
    date_format: string;
    number_format: string;
    language: 'fr' | 'en' | 'es';
    currency: string;
  };
  
  created_at: string;
  updated_at: string;
  last_accessed: string;
}

/**
 * État de session d'un dashboard
 */
export interface DashboardSession {
  session_id: string;
  user_id: string;
  dashboard_id: string;
  
  // État actuel
  current_filters: DashboardFilters;
  selected_date_range: {
    start_date: string;
    end_date: string;
  };
  active_view: string;
  zoom_level?: number;
  
  // Données en cache
  cached_data?: CachedDashboardData;
  cache_timestamp?: string;
  cache_expiry?: string;
  
  // Historique de navigation
  navigation_history: Array<{
    timestamp: string;
    action: 'filter_change' | 'view_change' | 'drill_down' | 'export';
    details: NavigationDetails;
  }>;
  
  // Métriques de session
  session_start: string;
  last_activity: string;
  page_views: number;
  actions_performed: number;
  
  // État de synchronisation
  is_live_sync: boolean;
  last_data_refresh: string;
  pending_updates: number;
}