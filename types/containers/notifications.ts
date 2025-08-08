/**
 * Types pour les notifications et communications
 * Configuration des notifications et historique des envois
 * 
 * @module Containers/Notifications
 * @version 2.0.0
 * @since 2025-01-06
 */

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
  quiet_hours?: {
    enabled: boolean;
    start_time: string;             // Format HH:MM
    end_time: string;
    timezone: string;
  };
  
  // Préférences de contenu
  content_preferences: {
    language: 'fr' | 'en' | 'es';
    include_tracking_link: boolean;
    include_contact_info: boolean;
    custom_message?: string;
  };
  
  // État de la configuration
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

/**
 * Historique des notifications envoyées
 */
export interface NotificationHistory {
  id: string;
  container_id: string;
  
  // Détails de la notification
  notification_type: 
    | 'eta_available'
    | 'eta_changed' 
    | 'container_arrived'
    | 'delay_alert'
    | 'customs_cleared'
    | 'ready_for_delivery'
    | 'custom';
  
  // Destinataires
  recipients: Array<{
    type: 'email' | 'sms' | 'push' | 'webhook';
    address: string;              // Email, numéro, URL, etc.
    status: 'sent' | 'delivered' | 'failed' | 'pending';
    error_message?: string;
    delivered_at?: string;
  }>;
  
  // Contenu
  subject?: string;
  message_content: string;
  template_used?: string;
  
  // Contexte
  trigger_event: string;
  container_data_snapshot: {
    container_number: string;
    bl_number: string;
    status: string;
    eta?: string;
    delay_days?: number;
  };
  
  // Métadonnées
  sent_at: string;
  sent_by?: string;              // ID utilisateur si envoi manuel
  automated: boolean;
  batch_id?: string;             // Si envoi groupé
  
  // Tracking
  opened_count: number;
  clicked_count: number;
  last_opened_at?: string;
  
  // Réponses
  client_responses?: Array<{
    response_type: 'acknowledgment' | 'question' | 'complaint';
    response_content: string;
    received_at: string;
  }>;
}

/**
 * Template de notification personnalisable
 */
export interface NotificationTemplate {
  template_id: string;
  template_name: string;
  notification_type: string;
  
  // Contenu du template
  subject_template: string;
  body_template: string;
  
  // Variables disponibles
  available_variables: Array<{
    variable: string;
    description: string;
    example: string;
  }>;
  
  // Localisation
  language: 'fr' | 'en' | 'es';
  localized_versions?: Array<{
    language: string;
    subject: string;
    body: string;
  }>;
  
  // Configuration
  channel: 'email' | 'sms' | 'push' | 'webhook';
  is_default: boolean;
  is_active: boolean;
  
  // Métriques d'utilisation
  usage_count: number;
  last_used: string;
  average_open_rate?: number;
  average_click_rate?: number;
  
  // Métadonnées
  created_at: string;
  updated_at: string;
  created_by: string;
}