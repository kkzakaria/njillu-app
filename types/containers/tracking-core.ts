/**
 * Types de base pour le système de suivi des arrivées
 * Interfaces principales et historique des changements
 * 
 * @module Containers/TrackingCore
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

import type { BLContainer } from '../bl/core';

// ============================================================================
// Interfaces de base pour le tracking des arrivées
// ============================================================================

/**
 * Informations complètes de tracking d'un conteneur
 * Interface principale pour le suivi des arrivées en temps réel
 * 
 * @example
 * ```typescript
 * const tracking: ContainerArrivalTracking = {
 *   container_id: "CONT_2025_001234",
 *   container_number: "MSCU1234567",
 *   bl_id: "BL_2025_001234",
 *   bl_number: "BL2025001234",
 *   
 *   shipping_company_id: "COMP_MAERSK",
 *   shipping_company_name: "Maersk Line",
 *   
 *   port_of_discharge: "FRLEH",
 *   estimated_arrival_date: "2025-01-20T06:00:00Z",
 *   
 *   arrival_status: "in_transit",
 *   urgency_level: "scheduled",
 *   health_status: "healthy",
 *   
 *   last_update_date: "2025-01-13T12:00:00Z",
 *   notification_count: 0,
 *   client_informed: false,
 *   
 *   confidence_level: "high"
 * };
 * ```
 * 
 * @see ContainerArrivalStatus pour les statuts disponibles
 * @see ContainerUrgencyLevel pour les niveaux d'urgence
 * @see ContainerHealthStatus pour les indicateurs de santé
 */
export interface ContainerArrivalTracking {
  container_id: string;
  
  // Informations de base du conteneur
  container_number: string;
  bl_id: string;
  bl_number: string;
  
  // Informations de la compagnie maritime
  shipping_company_id: string;
  shipping_company_name: string;
  shipping_company_short?: string;
  
  // Localisation
  port_of_discharge: string;
  arrival_location?: string;
  current_location?: string;
  
  // Dates de suivi
  estimated_arrival_date?: string;
  original_eta?: string;              // ETA originale pour comparaison
  actual_arrival_date?: string;
  last_update_date: string;
  
  // Statut et indicateurs
  arrival_status: ContainerArrivalStatus;
  urgency_level: ContainerUrgencyLevel;
  health_status: ContainerHealthStatus;
  
  // Calculs de délais
  days_until_arrival?: number;        // Négatif si en retard
  delay_days?: number;                // Nombre de jours de retard
  delay_severity?: DelaySeverity;
  
  // Progression du processus
  customs_clearance_date?: string;
  delivery_ready_date?: string;
  final_delivery_date?: string;
  
  // Notifications et communication
  last_notification_sent?: string;
  notification_count: number;
  client_informed: boolean;
  
  // Métadonnées
  notes?: string;
  tracking_source?: string;           // Source des informations de tracking
  confidence_level?: 'high' | 'medium' | 'low'; // Fiabilité des données
  
  // Relations
  container?: BLContainer;
}

/**
 * Historique des changements de statut d'arrivée
 * Audit trail complet des modifications de tracking
 * 
 * @example
 * ```typescript
 * const historyEntry: ContainerArrivalHistory = {
 *   id: "HIST_001234_001",
 *   container_id: "CONT_2025_001234",
 *   
 *   previous_status: "in_transit",
 *   new_status: "delayed",
 *   
 *   previous_eta: "2025-01-20T06:00:00Z",
 *   new_eta: "2025-01-22T14:00:00Z",
 *   
 *   change_reason: "weather_conditions",
 *   change_description: "Tempête en Mer du Nord",
 *   impact_assessment: "moderate",
 *   
 *   client_notified: true,
 *   updated_by: "system_integration",
 *   update_source: "integration",
 *   created_at: "2025-01-15T10:30:00Z"
 * };
 * ```
 * 
 * @see ContainerArrivalStatus pour les statuts de changement
 * @remarks Utilisé pour la traçabilité et l'analyse des tendances
 */
export interface ContainerArrivalHistory {
  id: string;
  container_id: string;
  
  // Changement de statut
  previous_status?: ContainerArrivalStatus;
  new_status: ContainerArrivalStatus;
  
  // Changement de dates
  previous_eta?: string;
  new_eta?: string;
  actual_arrival?: string;
  
  // Contexte du changement
  change_reason: 
    | 'initial_estimate'
    | 'shipping_delay'
    | 'port_congestion'
    | 'weather_conditions'
    | 'customs_delay'
    | 'schedule_change'
    | 'arrived_confirmation'
    | 'manual_update'
    | 'api_sync';
  
  // Détails de l'événement
  change_description?: string;
  impact_assessment?: 'none' | 'minor' | 'moderate' | 'major' | 'critical';
  
  // Notification et communication
  client_notified?: boolean;
  notification_sent_at?: string;
  
  // Source du changement
  updated_by?: string;
  update_source: 'manual' | 'automatic' | 'integration' | 'system';
  data_quality_score?: number;        // 0-100
  
  // Métadonnées
  created_at: string;
  external_reference?: string;        // Référence système externe
}