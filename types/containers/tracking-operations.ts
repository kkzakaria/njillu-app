/**
 * Types pour les opérations sur le tracking
 * Mise à jour manuelle et paramètres de recherche
 * 
 * @module Containers/TrackingOperations
 * @version 2.0.0
 * @since 2025-01-06
 */

import type {
  ContainerArrivalStatus,
  ContainerUrgencyLevel,
  ContainerHealthStatus
} from './enums';

// ============================================================================
// Opérations et actions sur le tracking
// ============================================================================

/**
 * Mise à jour manuelle d'informations d'arrivée
 */
export interface UpdateArrivalData {
  container_id: string;
  
  // Nouvelles informations
  estimated_arrival_date?: string;
  actual_arrival_date?: string;
  arrival_status?: ContainerArrivalStatus;
  arrival_location?: string;
  customs_clearance_date?: string;
  delivery_ready_date?: string;
  
  // Contexte de la mise à jour
  update_reason: string;
  update_source: 'manual' | 'api' | 'email' | 'phone' | 'web_scraping';
  confidence_level?: 'high' | 'medium' | 'low';
  notes?: string;
  
  // Communication
  notify_client: boolean;
  notification_message?: string;
  
  updated_by: string;
}

/**
 * Paramètres de recherche pour le tracking des arrivées
 */
export interface ArrivalTrackingSearchParams {
  // Filtres de base
  container_numbers?: string[];
  bl_numbers?: string[];
  shipping_company_ids?: string[];
  
  // Filtres de statut
  arrival_statuses?: ContainerArrivalStatus[];
  urgency_levels?: ContainerUrgencyLevel[];
  health_statuses?: ContainerHealthStatus[];
  
  // Filtres temporels
  eta_from?: string;
  eta_to?: string;
  arrival_from?: string;
  arrival_to?: string;
  last_update_from?: string;
  last_update_to?: string;
  
  // Filtres de performance
  delayed_only?: boolean;
  max_delay_days?: number;
  missing_eta_only?: boolean;
  requires_attention?: boolean;
  
  // Filtres business
  client_ids?: string[];
  high_value_only?: boolean;
  vip_clients_only?: boolean;
  
  // Options de recherche
  include_delivered?: boolean;
  include_cancelled?: boolean;
  sort_by?: 'eta' | 'delay_days' | 'last_update' | 'priority';
  sort_direction?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  page_size?: number;
  
  // Recherche textuelle
  search_query?: string;
  search_fields?: ('container_number' | 'bl_number' | 'notes')[];
}

/**
 * Résultat d'une opération de mise à jour
 */
export interface UpdateTrackingResult {
  container_id: string;
  update_id: string;
  
  // Résultat de l'opération
  success: boolean;
  error_message?: string;
  warnings?: string[];
  
  // Changements effectués
  changes_made: Array<{
    field: string;
    old_value?: string;
    new_value: string;
  }>;
  
  // Actions déclenchées
  notifications_sent: number;
  alerts_created: number;
  workflows_triggered: string[];
  
  // Impact calculé
  delay_status_changed: boolean;
  urgency_level_changed: boolean;
  client_notification_required: boolean;
  
  // Validation
  data_quality_score: number;        // 0-100
  validation_warnings?: string[];
  
  // Métadonnées
  processed_at: string;
  processing_time_ms: number;
  processed_by: string;
}

/**
 * Paramètres pour opération en lot sur tracking
 */
export interface BulkTrackingOperation {
  operation_type: 'update_status' | 'update_eta' | 'bulk_notification' | 'data_cleanup';
  
  // Sélection des conteneurs
  selection_criteria: ArrivalTrackingSearchParams;
  
  // Données à appliquer
  update_data?: Partial<UpdateArrivalData>;
  
  // Options d'exécution
  dry_run: boolean;
  continue_on_error: boolean;
  batch_size: number;
  
  // Validation
  require_confirmation: boolean;
  estimated_affected_containers?: number;
  
  // Initié par
  initiated_by: string;
  scheduled_for?: string;
}