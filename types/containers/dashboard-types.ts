/**
 * Types spécialisés pour les dashboards et widgets containers
 * Configuration, filtres, cache et navigation
 * 
 * @module Containers/DashboardTypes
 * @version 2.0.0
 * @since 2025-01-06
 */

import type {
  ContainerArrivalStatus,
  ArrivalUrgency,
  DelaySeverity
} from './enums';

import type {
  ContainerArrivalTracking
} from './tracking-core';

import type {
  ContainerDelayAlert,
  MissingETAAlert
} from './alerts';

import type {
  ArrivalPerformanceMetrics
} from './metrics';

// ============================================================================
// Types pour configuration des widgets
// ============================================================================

/**
 * Configuration pour widget graphique
 */
export interface ChartConfig {
  chart_type: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
  x_axis: string;
  y_axis: string;
  groupby?: string;
  colors?: string[];
  show_legend: boolean;
  show_grid: boolean;
}

/**
 * Configuration pour widget tableau
 */
export interface TableConfig {
  columns: Array<{
    field: string;
    header: string;
    width?: number;
    sortable: boolean;
    filterable: boolean;
  }>;
  pagination: boolean;
  rows_per_page: number;
  show_search: boolean;
}

/**
 * Configuration pour widget carte
 */
export interface MapConfig {
  center_lat: number;
  center_lng: number;
  zoom_level: number;
  marker_clustering: boolean;
  heat_map_enabled: boolean;
  show_routes: boolean;
}

/**
 * Configuration pour seuils d'alerte
 */
export interface ThresholdConfig {
  warning_threshold: number;
  critical_threshold: number;
  comparison_operator: 'greater' | 'less' | 'equal';
  color_coding: {
    good: string;
    warning: string;
    critical: string;
  };
}

/**
 * Configuration pour interactions widget
 */
export interface InteractionConfig {
  clickable: boolean;
  drill_down_target?: string;
  tooltip_enabled: boolean;
  export_enabled: boolean;
  refresh_enabled: boolean;
}

/**
 * Configuration complète d'un widget
 */
export interface WidgetConfiguration {
  type: 'kpi' | 'chart' | 'table' | 'alert' | 'map';
  dataSource: string;
  refreshInterval?: number;
  visualization?: ChartConfig | TableConfig | MapConfig;
  thresholds?: ThresholdConfig;
  interactions?: InteractionConfig;
  custom_styling?: {
    background_color?: string;
    border_color?: string;
    font_family?: string;
    font_size?: number;
  };
}

// ============================================================================
// Types pour les filtres de dashboard
// ============================================================================

/**
 * Filtre par plage de dates
 */
export interface DateRangeFilter {
  start_date: Date;
  end_date: Date;
  preset?: 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'custom';
}

/**
 * Filtre par statut
 */
export interface StatusFilter {
  selected_statuses: ContainerArrivalStatus[];
  exclude_mode: boolean;
}

/**
 * Filtre par compagnie
 */
export interface CompanyFilter {
  company_ids: string[];
  include_subsidiaries: boolean;
}

/**
 * Filtre par localisation
 */
export interface LocationFilter {
  ports: string[];
  regions: string[];
  countries: string[];
}

/**
 * Filtre par urgence
 */
export interface UrgencyFilter {
  urgency_levels: ArrivalUrgency[];
  include_escalated: boolean;
}

/**
 * Filtre personnalisé
 */
export interface CustomFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater' | 'less' | 'in' | 'between';
  value: string | number | Date | string[] | number[];
  label: string;
}

/**
 * Tous les filtres de dashboard
 */
export interface DashboardFilters {
  dateRange?: DateRangeFilter;
  status?: StatusFilter;
  company?: CompanyFilter;
  location?: LocationFilter;
  urgency?: UrgencyFilter;
  customFilters?: CustomFilter[];
}

// ============================================================================
// Types pour les données en cache
// ============================================================================

/**
 * Données en cache du dashboard
 */
export type CachedDashboardData = {
  metrics?: ArrivalPerformanceMetrics;
  containers?: ContainerArrivalTracking[];
  alerts?: (ContainerDelayAlert | MissingETAAlert)[];
  trends?: TrendData;
  summary?: DashboardSummary;
  lastRefresh: Date;
  expiry: Date;
};

/**
 * Données de tendance pour les graphiques
 */
export interface TrendData {
  daily_arrivals: Array<{
    date: string;
    count: number;
    on_time: number;
    delayed: number;
  }>;
  performance_trend: Array<{
    period: string;
    average_delay_hours: number;
    on_time_percentage: number;
  }>;
  status_distribution: Array<{
    status: ContainerArrivalStatus;
    count: number;
    percentage: number;
  }>;
}

/**
 * Résumé du dashboard
 */
export interface DashboardSummary {
  total_containers: number;
  on_time_arrivals: number;
  delayed_arrivals: number;
  average_delay_hours: number;
  critical_alerts: number;
  last_updated: Date;
}

// ============================================================================
// Types pour la navigation
// ============================================================================

/**
 * Types de seuils d'alerte configurables
 */
export type AlertThresholdType = 
  | 'delay_days'
  | 'delay_percentage'
  | 'cost_impact'
  | 'eta_confidence'
  | 'performance_score'
  | 'satisfaction_rating';

/**
 * Configuration des seuils d'alerte personnalisés
 */
export type AlertThresholdOverrides = Partial<Record<AlertThresholdType, number>>;

/**
 * Détails de navigation dans l'historique
 */
export interface NavigationDetails {
  previousView?: string;
  targetView: string;
  filters?: DashboardFilters;
  timestamp: Date;
  trigger: 'user' | 'auto' | 'drill_down';
  context?: {
    widget_id?: string;
    clicked_element?: string;
    search_query?: string;
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
    alert_threshold_overrides?: AlertThresholdOverrides;
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