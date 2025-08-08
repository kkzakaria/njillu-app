/**
 * Types pour les opérations CRUD sur les données d'arrivée de conteneurs
 * Création, modification et résultats des opérations de base
 * 
 * @module Containers/CRUD
 * @version 2.0.0
 * @since 2025-01-06
 */

import type {
  ContainerArrivalStatus
} from './enums';

import type {
  UpdateArrivalData
} from './tracking-operations';

import type {
  ArrivalNotificationConfig
} from './notifications';

// ============================================================================
// Opérations CRUD sur les données d'arrivée
// ============================================================================

/**
 * Données pour créer un nouveau tracking d'arrivée
 */
export interface CreateArrivalTrackingData {
  container_id: string;
  
  // Dates de planification
  estimated_arrival_date?: string;
  original_eta?: string;
  
  // Localisation
  arrival_location?: string;
  port_of_discharge: string;
  
  // Configuration initiale
  initial_status?: ContainerArrivalStatus;
  tracking_source?: string;
  confidence_level?: 'high' | 'medium' | 'low';
  
  // Notifications
  enable_notifications?: boolean;
  notification_config?: Partial<ArrivalNotificationConfig>;
  
  // Métadonnées
  notes?: string;
  created_by: string;
}

/**
 * Données pour mise à jour en lot des informations d'arrivée
 */
export interface BatchUpdateArrivalData {
  updates: Array<{
    container_id: string;
    data: Partial<UpdateArrivalData>;
  }>;
  
  // Options globales
  global_options: {
    update_source: 'manual' | 'api' | 'integration' | 'scheduled_sync';
    batch_reason?: string;
    notify_clients: boolean;
    validate_before_update: boolean;
    rollback_on_error: boolean;
  };
  
  // Métadonnées
  initiated_by: string;
  scheduled_execution?: string;
}

/**
 * Résultat d'une opération en lot
 */
export interface BatchOperationResult {
  operation_id: string;
  operation_type: string;
  
  // Résultats globaux
  total_items: number;
  successful_items: number;
  failed_items: number;
  skipped_items: number;
  
  // Détails par conteneur
  item_results: Array<{
    container_id: string;
    container_number?: string;
    success: boolean;
    error_code?: string;
    error_message?: string;
    warnings?: string[];
    processing_time_ms?: number;
  }>;
  
  // Métriques de performance
  execution_time_ms: number;
  average_time_per_item: number;
  peak_memory_usage?: number;
  
  // Historique et traçabilité
  executed_at: string;
  executed_by: string;
  rollback_available: boolean;
  rollback_deadline?: string;
  
  // Recommandations
  post_execution_actions?: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high';
    description: string;
  }>;
}