/**
 * Types pour la recherche et le filtrage avancés
 * Paramètres de recherche complexe et filtres multi-critères
 * 
 * @module Containers/Search
 * @version 2.0.0
 * @since 2025-01-06
 */

import type {
  ContainerArrivalStatus,
  DelaySeverity,
  ContainerUrgencyLevel,
  ContainerHealthStatus
} from './enums';

// ============================================================================
// Recherche et filtrage avancés
// ============================================================================

/**
 * Paramètres de recherche avancée pour les conteneurs
 */
export interface AdvancedContainerSearchParams {
  // Recherche textuelle avec opérateurs
  search_query?: {
    text: string;
    fields: ('container_number' | 'bl_number' | 'client_name' | 'notes')[];
    operators: ('AND' | 'OR' | 'NOT')[];
    fuzzy_matching: boolean;
  };
  
  // Filtres temporels complexes
  date_filters?: {
    eta_range?: { from: string; to: string };
    arrival_range?: { from: string; to: string };
    created_range?: { from: string; to: string };
    
    // Filtres relatifs
    arriving_in_days?: number;
    delayed_by_days?: number;
    updated_within_hours?: number;
  };
  
  // Filtres de statut et performance
  status_filters?: {
    arrival_statuses?: ContainerArrivalStatus[];
    urgency_levels?: ContainerUrgencyLevel[];
    health_statuses?: ContainerHealthStatus[];
    
    // Conditions combinées
    has_delays: boolean;
    missing_eta: boolean;
    requires_attention: boolean;
    client_vip: boolean;
  };
  
  // Filtres géographiques et logistiques
  logistics_filters?: {
    origin_ports?: string[];
    destination_ports?: string[];
    shipping_companies?: string[];
    vessel_names?: string[];
    container_types?: string[];
  };
  
  // Filtres business et financiers
  business_filters?: {
    client_categories?: string[];
    value_ranges?: Array<{ min: number; max: number; currency: string }>;
    priority_levels?: string[];
    service_types?: string[];
  };
  
  // Métriques et KPI
  metrics_filters?: {
    delay_severity?: DelaySeverity[];
    performance_score_min?: number;
    cost_impact_min?: number;
    client_satisfaction_min?: number;
  };
  
  // Options de recherche
  search_options?: {
    include_archived: boolean;
    include_cancelled: boolean;
    exact_match_only: boolean;
    case_sensitive: boolean;
    include_soft_deleted: boolean;
  };
  
  // Tri et pagination avancés
  sorting?: Array<{
    field: string;
    direction: 'asc' | 'desc';
    priority: number;
  }>;
  
  pagination?: {
    page: number;
    page_size: number;
    max_results?: number;
  };
  
  // Agrégations demandées
  requested_aggregations?: Array<
    | 'count_by_status'
    | 'avg_delay_by_company'
    | 'cost_by_client'
    | 'performance_trends'
  >;
}