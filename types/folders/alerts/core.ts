/**
 * Types core du système d'alertes
 * Interface principale et types de base pour les alertes de dossiers
 */

import type {
  AlertType,
  AlertSeverity,
  AlertStatus
} from '../constants/enums';

import type { Folder } from '../core/folder';

// ============================================================================
// Types de base
// ============================================================================

/**
 * Impact business d'une alerte
 */
export type BusinessImpact = 'low' | 'medium' | 'high' | 'critical';

/**
 * Méthodes de résolution d'alerte
 */
export type ResolutionMethod = 'manual' | 'automatic' | 'escalated';

/**
 * Méthodes de notification disponibles
 */
export type NotificationMethod = 'email' | 'sms' | 'push' | 'webhook';

/**
 * Types d'entités affectées par une alerte
 */
export type AffectedEntityType = 'bl' | 'container' | 'document' | 'activity';

/**
 * Niveaux de priorité pour les actions recommandées
 */
export type ActionPriority = 'low' | 'medium' | 'high';

/**
 * Entité affectée par une alerte
 */
export interface AffectedEntity {
  entity_type: AffectedEntityType;
  entity_id: string;
  entity_reference?: string;
}

/**
 * Action recommandée pour résoudre une alerte
 */
export interface RecommendedAction {
  action_type: string;
  description: string;
  priority: ActionPriority;
  estimated_effort?: string;
}

// ============================================================================
// Interface principale
// ============================================================================

/**
 * Alerte de dossier - interface complète
 */
export interface FolderAlert {
  id: string;
  folder_id: string;
  
  // Classification de l'alerte
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  
  // Contenu de l'alerte
  title: string;
  message: string;
  description?: string;
  
  // Contexte technique
  source_system?: string;       // Système qui a généré l'alerte
  source_reference?: string;    // Référence dans le système source
  error_code?: string;          // Code d'erreur technique
  
  // Contexte business
  business_impact: BusinessImpact;
  affected_entities?: AffectedEntity[];
  
  // Informations temporelles
  triggered_at: string;
  first_occurrence?: string;    // Première occurrence du problème
  last_occurrence?: string;     // Dernière occurrence
  occurrence_count: number;     // Nombre d'occurrences
  
  // Échéances et délais
  due_date?: string;           // Date d'échéance pour résolution
  sla_deadline?: string;       // Deadline SLA
  escalation_time?: string;    // Moment d'escalade automatique
  
  // Assignation et responsabilité
  assigned_to?: string;        // Utilisateur assigné
  assigned_at?: string;
  assigned_by?: string;
  team_responsible?: string;   // Équipe responsable
  
  // Résolution
  resolution_notes?: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_method?: ResolutionMethod;
  
  // Actions recommandées
  recommended_actions?: RecommendedAction[];
  
  // Liens et références
  related_alerts?: string[];   // IDs d'alertes liées
  documentation_urls?: string[];
  support_ticket_id?: string;
  
  // Notifications
  notification_sent: boolean;
  notification_methods?: NotificationMethod[];
  notification_recipients?: string[];
  
  // Métadonnées système
  created_at: string;
  updated_at: string;
  
  // Relations
  folder?: Folder;
}