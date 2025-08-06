/**
 * Entités audit - Types relatifs à la traçabilité et l'audit
 */

/**
 * Métadonnées de traçabilité
 */
export interface AuditMetadata {
  created_by: string;
  created_at: Date;
  updated_by?: string;
  updated_at?: Date;
  version?: number;
  change_history?: Array<AuditLogEntry>;
}

/**
 * Entrée de journal d'audit
 */
export interface AuditLogEntry {
  timestamp: Date;
  user_id: string;
  user_name?: string;
  action: AuditAction;
  entity_type: string;
  entity_id: string;
  changes?: Array<FieldChange>;
  metadata?: Record<string, string | number | boolean | null>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Changement de champ pour l'audit
 */
export interface FieldChange {
  field_name: string;
  old_value?: string | number | boolean | Date | null | Record<string, unknown> | unknown[];
  new_value?: string | number | boolean | Date | null | Record<string, unknown> | unknown[];
  field_type?: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
}

/**
 * Actions d'audit disponibles
 */
export type AuditAction =
  | 'create'            // Création d'entité
  | 'update'            // Mise à jour
  | 'delete'            // Suppression
  | 'restore'           // Restauration
  | 'view'              // Consultation
  | 'export'            // Export de données
  | 'import'            // Import de données
  | 'archive'           // Archivage
  | 'approve'           // Approbation
  | 'reject'            // Rejet
  | 'escalate'          // Escalade
  | 'assign'            // Assignation
  | 'unassign'          // Désassignation
  | 'comment'           // Ajout de commentaire
  | 'status_change'     // Changement de statut
  | 'document_upload'   // Upload de document
  | 'document_delete'   // Suppression de document
  | 'notification_sent' // Notification envoyée
  | 'login'             // Connexion utilisateur
  | 'logout';           // Déconnexion utilisateur

/**
 * Configuration d'audit pour une entité
 */
export interface AuditConfig {
  enabled: boolean;
  track_views: boolean;
  track_exports: boolean;
  retention_days?: number;
  excluded_fields?: string[];
  anonymize_after_days?: number;
}