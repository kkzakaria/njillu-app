/**
 * @deprecated - Ce fichier est déprécié. Utilisez les modules workflow/* pour la nouvelle architecture.
 * Ce fichier reste pour la compatibilité ascendante uniquement.
 * 
 * Migration: Utilisez `@/types/folders/workflow/*` à la place
 */

// ============================================================================
// COMPATIBILITÉ ASCENDANTE - Redirections vers les nouveaux modules
// ============================================================================

// Re-export des types depuis les nouveaux modules workflow
export type {
  ProcessingStage,
  StageStatus, 
  StagePriority,
  FolderProcessingStage,
  DefaultProcessingStage,
  FolderProgress,
  StageRequiringAttention,
  StagePerformanceMetrics
} from './workflow/stages';

export type {
  InitializeFolderStagesParams,
  StartProcessingStageParams,
  CompleteProcessingStageParams,
  BlockProcessingStageParams,
  UnblockProcessingStageParams,
  ApproveProcessingStageParams,
  SkipProcessingStageParams,
  StageTransitionData
} from './workflow/transitions';

export type {
  StagesDashboard,
  StageAlert,
  StageSearchParams,
  StageSearchResults
} from './workflow/metrics';

// ============================================================================
// Types dépréciés - maintenir pour compatibilité uniquement
// ============================================================================

/** @deprecated Utilisez ./workflow/transitions à la place */
export interface CreateStageData {
  folder_id: string;
  stage: import('./workflow/stages').ProcessingStage;
  sequence_order: number;
  priority?: import('./workflow/stages').StagePriority;
  assigned_to?: string;
  due_date?: string;
  estimated_duration?: string;
  notes?: string;
  documents_required?: string[];
  is_mandatory?: boolean;
  can_be_skipped?: boolean;
  requires_approval?: boolean;
}

/** @deprecated Utilisez ./workflow/transitions à la place */
export interface UpdateStageData {
  status?: import('./workflow/stages').StageStatus;
  priority?: import('./workflow/stages').StagePriority;
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

// ============================================================================
// Constantes et helpers - maintenus pour compatibilité
// ============================================================================

import type { ProcessingStage, StageStatus, StagePriority } from './workflow/stages';

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
// Helper functions - maintenus pour compatibilité
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
    completed: [],
    skipped: []
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