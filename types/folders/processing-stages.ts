/**
 * Types pour le système de suivi des étapes de traitement de dossier
 * Gestion du workflow et des transitions d'états
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
// Interfaces principales
// ============================================================================

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
  
  // Soft delete
  deleted_at?: string;
  deleted_by?: string;
}

export interface DefaultProcessingStage {
  id: string;
  stage: ProcessingStage;
  sequence_order: number;
  default_duration: string; // Interval PostgreSQL
  is_mandatory: boolean;
  can_be_skipped: boolean;
  requires_approval: boolean;
  default_priority: StagePriority;
  description?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Types de progression et analytics
// ============================================================================

export interface FolderProgress {
  total_stages: number;
  completed_stages: number;
  in_progress_stages: number;
  blocked_stages: number;
  pending_stages: number;
  skipped_stages: number;
  completion_percentage: number;
  current_stage?: ProcessingStage;
  next_stage?: ProcessingStage;
  estimated_completion_date?: string;
  is_on_schedule: boolean;
  overdue_stages: number;
}

export interface StageRequiringAttention {
  folder_id: string;
  folder_number: string;
  stage: ProcessingStage;
  status: StageStatus;
  assigned_to?: string;
  assignee_name?: string;
  days_overdue: number;
  priority: StagePriority;
  blocking_reason?: string;
  attention_score: number;
}

export interface StagePerformanceMetrics {
  stage: ProcessingStage;
  stage_name: string;
  total_completed: number;
  avg_duration?: string; // Interval PostgreSQL
  median_duration?: string;
  min_duration?: string;
  max_duration?: string;
  success_rate: number;
  avg_overdue_days: number;
}

// ============================================================================
// Types pour les opérations de workflow
// ============================================================================

export interface InitializeFolderStagesParams {
  folder_id: string;
  created_by?: string;
}

export interface StartProcessingStageParams {
  folder_id: string;
  stage: ProcessingStage;
  assigned_to?: string;
  started_by?: string;
  notes?: string;
}

export interface CompleteProcessingStageParams {
  folder_id: string;
  stage: ProcessingStage;
  completed_by: string;
  completion_notes?: string;
  documents_received?: string[];
}

export interface BlockProcessingStageParams {
  folder_id: string;
  stage: ProcessingStage;
  blocking_reason: string;
  blocked_by?: string;
}

export interface UnblockProcessingStageParams {
  folder_id: string;
  stage: ProcessingStage;
  unblocked_by?: string;
  resolution_notes?: string;
}

export interface ApproveProcessingStageParams {
  folder_id: string;
  stage: ProcessingStage;
  approved_by: string;
  approval_notes?: string;
}

export interface SkipProcessingStageParams {
  folder_id: string;
  stage: ProcessingStage;
  skipped_by: string;
  skip_reason: string;
}

// ============================================================================
// Types pour les formulaires et UI
// ============================================================================

export interface CreateStageData {
  folder_id: string;
  stage: ProcessingStage;
  sequence_order: number;
  priority?: StagePriority;
  assigned_to?: string;
  due_date?: string;
  estimated_duration?: string;
  notes?: string;
  documents_required?: string[];
  is_mandatory?: boolean;
  can_be_skipped?: boolean;
  requires_approval?: boolean;
}

export interface UpdateStageData {
  status?: StageStatus;
  priority?: StagePriority;
  assigned_to?: string;
  due_date?: string;
  estimated_completion_date?: string;
  notes?: string;
  internal_comments?: string;
  client_visible_comments?: string;
  documents_required?: string[];
  documents_received?: string[];
  blocking_reason?: string;
}

export interface StageTransitionData {
  action: 'start' | 'complete' | 'block' | 'unblock' | 'approve' | 'skip';
  notes?: string;
  blocking_reason?: string;
  resolution_notes?: string;
  approval_notes?: string;
  skip_reason?: string;
  documents_received?: string[];
}

// ============================================================================
// Types pour les vues et dashboard
// ============================================================================

export interface StagesDashboard {
  folder_id: string;
  folder_number: string;
  stages: FolderProcessingStage[];
  progress: FolderProgress;
  alerts: StageAlert[];
}

export interface StageAlert {
  type: 'overdue' | 'blocked' | 'approval_required' | 'high_priority';
  stage: ProcessingStage;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
}

export interface StageSearchParams {
  folder_id?: string;
  stage?: ProcessingStage;
  status?: StageStatus;
  priority?: StagePriority;
  assigned_to?: string;
  due_date_from?: string;
  due_date_to?: string;
  is_overdue?: boolean;
  requires_attention?: boolean;
}

export interface StageSearchResults {
  stages: FolderProcessingStage[];
  total_count: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

// ============================================================================
// Constantes et helpers
// ============================================================================

export const PROCESSING_STAGE_LABELS: Record<ProcessingStage, string> = {
  enregistrement: 'Enregistrement',
  revision_facture_commerciale: 'Révision Facture Commerciale',
  elaboration_fdi: 'Élaboration FDI',
  elaboration_rfcv: 'Élaboration RFCV',
  declaration_douaniere: 'Déclaration Douanière',
  service_exploitation: 'Service Exploitation',
  facturation_client: 'Facturation Client',
  livraison: 'Livraison'
};

export const STAGE_STATUS_LABELS: Record<StageStatus, string> = {
  pending: 'En attente',
  in_progress: 'En cours',
  completed: 'Terminé',
  blocked: 'Bloqué',
  skipped: 'Ignoré'
};

export const STAGE_PRIORITY_LABELS: Record<StagePriority, string> = {
  low: 'Faible',
  normal: 'Normale',
  high: 'Élevée',
  urgent: 'Urgent'
};

// Ordre des étapes dans le workflow
export const STAGE_SEQUENCE: ProcessingStage[] = [
  'enregistrement',
  'revision_facture_commerciale',
  'elaboration_fdi',
  'elaboration_rfcv',
  'declaration_douaniere',
  'service_exploitation',
  'facturation_client',
  'livraison'
];

// ============================================================================
// Type guards et helpers
// ============================================================================

export function isValidProcessingStage(value: string): value is ProcessingStage {
  return STAGE_SEQUENCE.includes(value as ProcessingStage);
}

export function isValidStageStatus(value: string): value is StageStatus {
  return ['pending', 'in_progress', 'completed', 'blocked', 'skipped'].includes(value as StageStatus);
}

export function isValidStagePriority(value: string): value is StagePriority {
  return ['low', 'normal', 'high', 'urgent'].includes(value as StagePriority);
}

export function getStageSequenceOrder(stage: ProcessingStage): number {
  return STAGE_SEQUENCE.indexOf(stage) + 1;
}

export function getNextStage(currentStage: ProcessingStage): ProcessingStage | null {
  const currentIndex = STAGE_SEQUENCE.indexOf(currentStage);
  if (currentIndex >= 0 && currentIndex < STAGE_SEQUENCE.length - 1) {
    return STAGE_SEQUENCE[currentIndex + 1];
  }
  return null;
}

export function getPreviousStage(currentStage: ProcessingStage): ProcessingStage | null {
  const currentIndex = STAGE_SEQUENCE.indexOf(currentStage);
  if (currentIndex > 0) {
    return STAGE_SEQUENCE[currentIndex - 1];
  }
  return null;
}

export function canTransitionTo(fromStatus: StageStatus, toStatus: StageStatus): boolean {
  const validTransitions: Record<StageStatus, StageStatus[]> = {
    pending: ['in_progress', 'blocked', 'skipped'],
    in_progress: ['completed', 'blocked'],
    blocked: ['pending', 'in_progress'],
    completed: [], // Les étapes complétées ne peuvent pas changer
    skipped: []    // Les étapes ignorées ne peuvent pas changer
  };
  
  return validTransitions[fromStatus]?.includes(toStatus) ?? false;
}

export function calculateProgressPercentage(
  completed: number, 
  skipped: number, 
  total: number
): number {
  if (total === 0) return 0;
  return Math.round(((completed + skipped) / total) * 100);
}

export function getAttentionLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export function formatDuration(intervalString?: string): string {
  if (!intervalString) return 'Non défini';
  
  // Parse PostgreSQL interval format (e.g., "2 days", "4:00:00", "1 day 2:30:00")
  const dayMatch = intervalString.match(/(\d+)\s+days?/);
  const timeMatch = intervalString.match(/(\d+):(\d+):(\d+)/);
  
  let result = '';
  
  if (dayMatch) {
    const days = parseInt(dayMatch[1]);
    result += `${days} jour${days > 1 ? 's' : ''}`;
  }
  
  if (timeMatch) {
    const hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    
    if (result) result += ' ';
    
    if (hours > 0) {
      result += `${hours}h`;
      if (minutes > 0) result += `${minutes.toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
      result += `${minutes} min`;
    }
  }
  
  return result || intervalString;
}