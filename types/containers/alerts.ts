/**
 * Types pour les alertes spécifiques aux arrivées
 * Alertes de retard, ETA manquant et système de notifications
 * 
 * @module Containers/Alerts
 * @version 2.0.0
 * @since 2025-01-06
 */

import type {
  DelaySeverity,
  ArrivalUrgency
} from './enums';

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
  
  // État de l'alerte
  status: 'active' | 'acknowledged' | 'resolved' | 'escalated';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  
  // Escalade
  escalation_level: 0 | 1 | 2 | 3;    // 0 = normal, 3 = maximum
  escalation_history: Array<{
    level: number;
    escalated_at: string;
    escalated_to: string;
    reason: string;
  }>;
}

/**
 * Alerte pour conteneur sans ETA
 */
export interface MissingETAAlert {
  id: string;
  container_id: string;
  alert_type: 'missing_eta';
  
  // Informations du conteneur
  container_number: string;
  bl_number: string;
  client_name: string;
  
  // Contexte de l'absence d'ETA
  days_without_eta: number;
  last_known_location?: string;
  shipping_company_name: string;
  
  // Urgence
  urgency_level: ArrivalUrgency;
  business_priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Actions prises
  follow_up_actions: Array<{
    action: 'contacted_shipping_line' | 'requested_update' | 'client_informed' | 'escalated';
    taken_at: string;
    taken_by: string;
    result?: string;
    notes?: string;
  }>;
  
  // Prochaines étapes
  next_follow_up_date: string;
  follow_up_frequency: 'daily' | 'every_2_days' | 'weekly';
  max_wait_days: number;
  
  // État de l'alerte
  status: 'active' | 'eta_received' | 'abandoned' | 'escalated';
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  
  // Métadonnées
  auto_generated: boolean;
  trigger_rule?: string;
}

/**
 * Configuration des seuils d'alerte
 */
export interface AlertThresholds {
  // Seuils de retard
  delay_thresholds: {
    minor_delay_days: number;         // Alerte d'information
    moderate_delay_days: number;      // Alerte d'attention
    major_delay_days: number;         // Alerte critique
  };
  
  // Seuils ETA manquant
  eta_missing_thresholds: {
    initial_alert_days: number;       // Première alerte
    escalation_days: number;          // Escalade automatique
    abandon_threshold_days: number;   // Abandon du suivi
  };
  
  // Configuration par client
  client_specific_thresholds?: Array<{
    client_id: string;
    custom_delay_days?: number;
    custom_eta_missing_days?: number;
    priority_multiplier: number;
  }>;
  
  // Configuration par compagnie
  shipping_company_adjustments?: Array<{
    company_id: string;
    reliability_score: number;        // 0-100
    threshold_adjustment_days: number; // +/- jours
  }>;
}