/**
 * Workflow stages - Définitions des étapes de traitement
 */

// ============================================================================
// Enums pour les étapes de traitement
// ============================================================================

export type ProcessingStage = 
  | 'enregistrement'               // 1. Prise en charge initiale du dossier
  | 'revision_facture_commerciale' // 2. Vérification documents commerciaux  
  | 'elaboration_fdi'             // 3. Fiche de Déclaration à l'Import
  | 'elaboration_rfcv'            // 4. Rapport Final de Classification et Valeur
  | 'declaration_douaniere'       // 5. Soumission aux autorités douanières
  | 'service_exploitation'        // 6. Paiement factures compagnies, acquisition conteneurs
  | 'facturation_client'          // 7. Élaboration facture finale client
  | 'livraison';                  // 8. Livraison des conteneurs au destinataire

export type StageStatus = 
  | 'pending'      // En attente
  | 'in_progress'  // En cours  
  | 'completed'    // Terminé
  | 'blocked'      // Bloqué (attente externe)
  | 'skipped';     // Ignoré (non applicable)

export type StagePriority = 
  | 'low'          // Priorité faible
  | 'normal'       // Priorité normale
  | 'high'         // Priorité élevée
  | 'urgent';      // Urgent

// ============================================================================
// Interfaces principales des étapes
// ============================================================================

/**
 * Étape de traitement d'un dossier spécifique
 */
export interface FolderProcessingStage {
  id: string;
  folder_id: string;
  
  // Configuration de l'étape
  stage: ProcessingStage;
  status: StageStatus;
  sequence_order: number;
  priority: StagePriority;
  
  // Dates de suivi
  started_at?: string;
  completed_at?: string;
  due_date?: string;
  estimated_completion_date?: string;
  
  // Responsabilités et assignation
  assigned_to?: string;
  completed_by?: string;
  
  // Métadonnées de traitement
  notes?: string;
  internal_comments?: string;
  client_visible_comments?: string;
  documents_required?: string[];
  documents_received?: string[];
  blocking_reason?: string;
  
  // Durées et performance
  estimated_duration?: string; // Interval PostgreSQL
  actual_duration?: string;    // Interval PostgreSQL
  
  // Configuration dynamique
  is_mandatory: boolean;
  can_be_skipped: boolean;
  requires_approval: boolean;
  approval_by?: string;
  approval_date?: string;
  
  // Audit et traçabilité
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

/**
 * Configuration par défaut d'une étape de traitement
 */
export interface DefaultProcessingStage {
  id: string;
  stage: ProcessingStage;
  sequence_order: number;
  
  // Configuration par défaut
  default_priority: StagePriority;
  is_mandatory: boolean;
  can_be_skipped: boolean;
  requires_approval: boolean;
  default_duration?: string; // Interval PostgreSQL
  
  // Métadonnées par défaut
  description?: string;
  instructions?: string;
  required_documents?: string[];
  
  // État
  is_active: boolean;
  
  // Audit
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Progression globale d'un dossier
 */
export interface FolderProgress {
  folder_id: string;
  
  // Compteurs
  total_stages: number;
  completed_stages: number;
  pending_stages: number;
  in_progress_stages: number;
  blocked_stages: number;
  skipped_stages: number;
  
  // Pourcentages
  completion_percentage: number;
  progress_percentage: number; // Inclut les étapes en cours
  
  // Étape courante
  current_stage?: ProcessingStage;
  current_stage_status?: StageStatus;
  current_stage_started_at?: string;
  
  // Prochaine étape
  next_stage?: ProcessingStage;
  next_stage_estimated_start?: string;
  
  // Estimations temporelles
  estimated_completion_date?: string;
  actual_start_date?: string;
  is_on_track: boolean;
  delay_days?: number;
  
  // Performance
  average_stage_duration_days?: number;
  fastest_stage_duration?: string;
  slowest_stage_duration?: string;
}

/**
 * Étape nécessitant attention
 */
export interface StageRequiringAttention {
  folder_id: string;
  folder_number: string;
  stage: ProcessingStage;
  status: StageStatus;
  priority: StagePriority;
  
  // Problème identifié
  issue_type: StageIssueType;
  issue_description: string;
  issue_severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Temporalité
  days_in_current_status: number;
  days_overdue?: number;
  due_date?: string;
  
  // Responsabilité
  assigned_to?: string;
  assigned_to_name?: string;
  escalation_level: number;
  
  // Actions recommandées
  recommended_actions: string[];
  
  // Client
  client_name: string;
  is_client_impacted: boolean;
  requires_client_communication: boolean;
}

export type StageIssueType =
  | 'overdue'              // En retard
  | 'blocked_too_long'     // Bloqué trop longtemps
  | 'missing_documents'    // Documents manquants
  | 'missing_assignment'   // Non assigné
  | 'approval_pending'     // Approbation en attente
  | 'quality_issue'        // Problème de qualité
  | 'client_unresponsive'  // Client ne répond pas
  | 'system_error'         // Erreur système
  | 'resource_unavailable' // Ressource indisponible
  | 'dependency_delayed'   // Dépendance retardée
  | 'other';               // Autre

/**
 * Métriques de performance par étape
 */
export interface StagePerformanceMetrics {
  stage: ProcessingStage;
  
  // Volumes
  total_instances: number;
  completed_instances: number;
  active_instances: number;
  
  // Durées
  average_duration_hours: number;
  median_duration_hours: number;
  min_duration_hours: number;
  max_duration_hours: number;
  
  // Taux
  completion_rate: number;
  on_time_completion_rate: number;
  skip_rate: number;
  block_rate: number;
  
  // Tendances (30 derniers jours)
  trend_completion_rate: number;
  trend_average_duration: number;
  
  // Comparaison
  vs_target_completion_rate?: number;
  vs_target_duration?: number;
  
  // Dernière mise à jour
  calculated_at: string;
  period_start: string;
  period_end: string;
}