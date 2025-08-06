/**
 * Opérations en lot - Types pour les opérations batch sur les dossiers
 */

import type {
  FolderStatus,
  FolderPriority,
  FolderCategory,
  ProcessingStage
} from '../constants';

import type { UpdateFolderData } from './update';
import type { FolderSearchParams } from './search';

/**
 * Opération batch sur des dossiers
 */
export interface FolderBatchOperation {
  // Identification de l'opération
  operation_id: string;
  operation_type: BatchOperationType;
  
  // Sélection des dossiers
  selection_method: 'explicit' | 'search' | 'all';
  folder_ids?: string[];
  search_criteria?: FolderSearchParams;
  
  // Opération à effectuer
  operation_data: BatchOperationData;
  
  // Options d'exécution
  execution_options: BatchExecutionOptions;
  
  // Métadonnées
  initiated_by: string;
  initiated_at: string;
  scheduled_for?: string;
  
  // État
  status: BatchOperationStatus;
  progress?: BatchProgress;
}

/**
 * Types d'opérations batch
 */
export type BatchOperationType =
  | 'bulk_update'         // Mise à jour en masse
  | 'status_change'       // Changement de statut
  | 'stage_transition'    // Transition d'étape
  | 'assignment'          // Assignation
  | 'document_attach'     // Attachement de documents
  | 'notification_send'   // Envoi de notifications
  | 'export'              // Export de données
  | 'archive'             // Archivage
  | 'delete'              // Suppression
  | 'duplicate'           // Duplication
  | 'merge'               // Fusion
  | 'tag_apply'           // Application de tags
  | 'custom';             // Opération personnalisée

/**
 * Données de l'opération batch
 */
export type BatchOperationData =
  | BulkUpdateData
  | StatusChangeData
  | StageTransitionData
  | AssignmentData
  | DocumentAttachData
  | NotificationData
  | ExportData
  | ArchiveData
  | DeleteData
  | TagData
  | CustomOperationData;

/**
 * Données pour mise à jour en masse
 */
export interface BulkUpdateData {
  type: 'bulk_update';
  updates: UpdateFolderData;
  update_mode: 'merge' | 'replace'; // Fusionner ou remplacer
  conditional_updates?: Array<{
    condition: string;
    updates: UpdateFolderData;
  }>;
}

/**
 * Données pour changement de statut
 */
export interface StatusChangeData {
  type: 'status_change';
  new_status: FolderStatus;
  reason: string;
  notes?: string;
  force_transition?: boolean;
  notify_stakeholders?: boolean;
}

/**
 * Données pour transition d'étape
 */
export interface StageTransitionData {
  type: 'stage_transition';
  new_stage: ProcessingStage;
  reason: string;
  notes?: string;
  auto_assign?: boolean;
  assignee_id?: string;
}

/**
 * Données pour assignation
 */
export interface AssignmentData {
  type: 'assignment';
  assignee_id: string;
  assignment_type: 'primary' | 'secondary' | 'reviewer';
  notes?: string;
  notify_assignee?: boolean;
}

/**
 * Données pour attachement de documents
 */
export interface DocumentAttachData {
  type: 'document_attach';
  document_template_id?: string;
  documents: Array<{
    name: string;
    content?: string;
    url?: string;
    type: string;
  }>;
}

/**
 * Données pour notifications
 */
export interface NotificationData {
  type: 'notification';
  notification_template_id: string;
  recipients: string[];
  custom_message?: string;
  delivery_method: 'email' | 'sms' | 'in_app' | 'all';
}

/**
 * Données pour export
 */
export interface ExportData {
  type: 'export';
  export_format: 'csv' | 'excel' | 'pdf' | 'json';
  export_fields?: string[];
  include_relations?: boolean;
  compress?: boolean;
}

/**
 * Données pour archivage
 */
export interface ArchiveData {
  type: 'archive';
  archive_reason: string;
  retention_period_days?: number;
  notify_stakeholders?: boolean;
}

/**
 * Données pour suppression
 */
export interface DeleteData {
  type: 'delete';
  delete_mode: 'soft' | 'hard';
  reason: string;
  backup_before_delete?: boolean;
}

/**
 * Données pour tags
 */
export interface TagData {
  type: 'tag_apply';
  tags: string[];
  tag_operation: 'add' | 'remove' | 'replace';
}

/**
 * Données pour opération personnalisée
 */
export interface CustomOperationData {
  type: 'custom';
  operation_name: string;
  parameters: Record<string, any>;
}

/**
 * Options d'exécution batch
 */
export interface BatchExecutionOptions {
  // Parallélisme
  max_concurrent_operations: number;
  batch_size: number;
  
  // Gestion d'erreurs
  continue_on_error: boolean;
  max_error_count?: number;
  error_threshold_percentage?: number;
  
  // Performance
  throttle_ms?: number; // Délai entre opérations
  priority: 'low' | 'normal' | 'high';
  
  // Validation
  dry_run: boolean;
  validate_before_execute: boolean;
  
  // Notifications
  notify_on_completion: boolean;
  notify_on_error: boolean;
  notification_recipients?: string[];
  
  // Historique
  create_audit_log: boolean;
  create_backup: boolean;
}

/**
 * Statut d'opération batch
 */
export type BatchOperationStatus =
  | 'pending'       // En attente
  | 'queued'        // En file d'attente
  | 'running'       // En cours d'exécution
  | 'paused'        // En pause
  | 'completed'     // Terminé
  | 'failed'        // Échoué
  | 'cancelled'     // Annulé
  | 'partial';      // Partiellement terminé

/**
 * Progression d'une opération batch
 */
export interface BatchProgress {
  total_items: number;
  processed_items: number;
  successful_items: number;
  failed_items: number;
  skipped_items: number;
  
  percentage_complete: number;
  estimated_completion_time?: string;
  
  current_item?: string;
  current_operation?: string;
  
  errors: Array<{
    folder_id: string;
    error_code: string;
    error_message: string;
    timestamp: string;
  }>;
  
  warnings: Array<{
    folder_id: string;
    warning_message: string;
    timestamp: string;
  }>;
}

/**
 * Résultat d'opération batch
 */
export interface FolderBatchOperationResult {
  operation_id: string;
  status: BatchOperationStatus;
  
  // Résultats détaillés
  total_processed: number;
  successful_count: number;
  failed_count: number;
  skipped_count: number;
  
  // Détails par dossier
  results: Array<{
    folder_id: string;
    status: 'success' | 'failed' | 'skipped';
    error_message?: string;
    warning_messages?: string[];
    changes_made?: string[];
  }>;
  
  // Métriques
  execution_time_ms: number;
  start_time: string;
  end_time: string;
  
  // Fichiers générés (pour exports, etc.)
  generated_files?: Array<{
    filename: string;
    url: string;
    size_bytes: number;
    mime_type: string;
  }>;
  
  // Audit
  audit_log_id?: string;
  backup_id?: string;
}