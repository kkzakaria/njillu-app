/**
 * Types pour le système de suivi des arrivées de conteneurs
 * Tracking, alertes, métriques et notifications d'arrivée
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
    | 'system_sync';
  
  change_description?: string;
  change_source: 'manual' | 'automatic' | 'integration' | 'notification';
  
  // Impact du changement
  delay_impact_hours?: number;
  cost_impact?: number;
  client_impact_level?: 'none' | 'low' | 'medium' | 'high' | 'critical';
  
  // Métadonnées
  changed_at: string;
  changed_by?: string;
  system_source?: string;
  
  // Notifications associées
  notification_sent: boolean;
  notification_method?: ('email' | 'sms' | 'push' | 'webhook')[];
}

// ============================================================================
// Métriques et statistiques des arrivées
// ============================================================================

/**
 * Métriques de performance des arrivées par période
 */
export interface ArrivalPerformanceMetrics {
  period_start: string;
  period_end: string;
  
  // Volumes
  total_containers: number;
  containers_arrived: number;
  containers_delayed: number;
  containers_early: number;
  containers_on_time: number;
  
  // Taux de performance
  on_time_delivery_rate: number;      // Pourcentage
  early_arrival_rate: number;
  delay_rate: number;
  
  // Temps moyens
  average_delay_days: number;
  average_early_days: number;
  longest_delay_days: number;
  
  // Distribution des retards
  delay_distribution: {
    minor_delays: number;             // 1-2 jours
    moderate_delays: number;          // 3-6 jours
    major_delays: number;             // 7+ jours
  };
  
  // Top des causes de retard
  top_delay_reasons: Array<{
    reason: string;
    count: number;
    average_delay_days: number;
    percentage_of_total: number;
  }>;
  
  // Performance par compagnie maritime
  by_shipping_company: Array<{
    company_id: string;
    company_name: string;
    total_containers: number;
    on_time_rate: number;
    average_delay_days: number;
  }>;
  
  // Performance par port
  by_port: Array<{
    port: string;
    total_containers: number;
    on_time_rate: number;
    average_processing_days: number;
  }>;
  
  calculated_at: string;
}

/**
 * Indicateurs en temps réel des arrivées
 */
export interface ArrivalRealTimeIndicators {
  // Aperçu global
  total_active_containers: number;
  containers_arriving_today: number;
  containers_arriving_tomorrow: number;
  containers_arriving_this_week: number;
  containers_overdue: number;
  
  // Alertes actives
  critical_alerts: number;
  high_priority_alerts: number;
  total_active_alerts: number;
  
  // Répartition par urgence
  urgency_breakdown: Record<ArrivalUrgency, number>;
  
  // Répartition par statut de santé
  health_breakdown: Record<ContainerHealthStatus, number>;
  
  // Tendances (comparaison avec période précédente)
  trends: {
    arrival_volume_trend: number;      // % de variation
    on_time_performance_trend: number;
    delay_rate_trend: number;
    customer_satisfaction_trend?: number;
  };
  
  // Prochaines échéances critiques
  upcoming_critical_arrivals: Array<{
    container_id: string;
    container_number: string;
    bl_number: string;
    estimated_arrival_date: string;
    days_until_arrival: number;
    urgency_level: ContainerUrgencyLevel;
    client_name: string;
  }>;
  
  last_updated: string;
}

// ============================================================================
// Alertes spécifiques aux arrivées
// ============================================================================

/**
 * Alerte de retard de conteneur
 */
export interface ContainerDelayAlert {
  id: string;
  container_id: string;
  alert_type: 'container_delay';
  
  // Informations du conteneur
  container_number: string;
  bl_number: string;
  client_name: string;
  
  // Détails du retard
  original_eta: string;
  current_eta?: string;
  delay_days: number;
  delay_severity: DelaySeverity;
  
  // Cause du retard
  delay_reason?: string;
  delay_category: 
    | 'shipping_delay'
    | 'port_congestion'
    | 'weather'
    | 'customs'
    | 'technical_issue'
    | 'unknown';
  
  // Impact estimé
  business_impact: 'low' | 'medium' | 'high' | 'critical';
  cost_impact_estimate?: number;
  client_impact_description?: string;
  
  // Actions recommandées
  recommended_actions: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high';
    estimated_effort: string;
    deadline?: string;
  }>;
  
  // Communication
  client_notified: boolean;
  notification_methods: ('email' | 'sms' | 'phone' | 'portal')[];
  last_communication_date?: string;
  
  // Résolution
  is_resolved: boolean;
  resolution_date?: string;
  resolution_notes?: string;
  
  created_at: string;
  updated_at: string;
}

/**
 * Alerte de conteneur manquant d'ETA
 */
export interface MissingETAAlert {
  id: string;
  container_id: string;
  alert_type: 'missing_eta';
  
  // Informations du conteneur
  container_number: string;
  bl_number: string;
  shipping_company_name: string;
  
  // Contexte
  days_since_creation: number;
  expected_eta_by?: string;           // Date à laquelle l'ETA devrait être disponible
  last_contact_attempt?: string;
  contact_attempts_count: number;
  
  // Sources potentielles d'information
  suggested_contacts: Array<{
    contact_type: 'shipping_line' | 'agent' | 'terminal' | 'client';
    contact_info: string;
    last_contacted?: string;
  }>;
  
  // Priorité
  urgency_score: number;              // 1-10 basé sur l'importance du conteneur
  client_priority: 'standard' | 'high' | 'vip';
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Notifications et communications
// ============================================================================

/**
 * Configuration de notification pour les arrivées
 */
export interface ArrivalNotificationConfig {
  container_id?: string;               // Si spécifique à un conteneur
  client_id?: string;                  // Si spécifique à un client
  is_global: boolean;                  // Configuration globale
  
  // Déclencheurs de notification
  triggers: {
    eta_available: boolean;
    eta_changed: boolean;
    container_arrived: boolean;
    delay_detected: boolean;
    customs_cleared: boolean;
    ready_for_delivery: boolean;
  };
  
  // Seuils d'alerte
  delay_threshold_days: number;        // Retard minimum pour alerte
  advance_notice_days: number;         // Notification X jours avant arrivée
  
  // Méthodes de notification préférées
  notification_methods: {
    email: {
      enabled: boolean;
      addresses: string[];
      template?: string;
    };
    sms: {
      enabled: boolean;
      numbers: string[];
    };
    push: {
      enabled: boolean;
      user_ids: string[];
    };
    webhook: {
      enabled: boolean;
      url?: string;
      headers?: Record<string, string>;
    };
  };
  
  // Fréquence et timing
  notification_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  business_hours_only: boolean;
  timezone: string;
  
  // Personnalisation
  language: 'fr' | 'en' | 'es';
  include_tracking_link: boolean;
  include_contact_info: boolean;
  custom_message?: string;
  
  created_at: string;
  updated_at: string;
  created_by: string;
}

/**
 * Historique des notifications envoyées
 */
export interface ArrivalNotificationHistory {
  id: string;
  container_id: string;
  
  // Type et contenu
  notification_type: 
    | 'eta_update'
    | 'arrival_confirmation'
    | 'delay_alert'
    | 'customs_cleared'
    | 'ready_pickup'
    | 'status_change';
  
  subject: string;
  message_content: string;
  
  // Destinataires
  recipients: Array<{
    type: 'email' | 'sms' | 'push' | 'webhook';
    address: string;
    delivery_status: 'sent' | 'delivered' | 'failed' | 'bounced';
    delivery_time?: string;
    error_message?: string;
  }>;
  
  // Métadonnées
  sent_at: string;
  sent_by?: string;
  trigger_event: string;
  related_alert_id?: string;
  
  // Interaction
  opened_at?: string;
  clicked_at?: string;
  replied_at?: string;
  client_acknowledged: boolean;
}

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
  
  // Filtres de performance
  delayed_only?: boolean;
  arrived_only?: boolean;
  missing_eta_only?: boolean;
  overdue_days_min?: number;
  
  // Filtres géographiques
  ports_of_discharge?: string[];
  arrival_locations?: string[];
  
  // Tri et pagination
  sort_by?: 'eta' | 'arrival_date' | 'delay_days' | 'urgency' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}