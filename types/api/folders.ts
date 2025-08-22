/**
 * Types pour les APIs Folders
 * Remplacer les types 'any' par des interfaces TypeScript robustes
 * 
 * @module Types/API/Folders
 * @version 1.0.0
 * @since 2025-01-22
 */

// ============================================================================
// Types pour les opérations de mise à jour
// ============================================================================

/**
 * Données de mise à jour pour un dossier
 * Remplace les 'any' dans app/api/folders/[id]/route.ts
 */
export interface FolderUpdateData extends Record<string, unknown> {
  transport_type?: string;
  status?: string;
  title?: string;
  description?: string;
  client_reference?: string;
  folder_date?: string | Date;
  expected_delivery_date?: string | Date;
  actual_delivery_date?: string | Date;
  priority?: string;
  estimated_value?: number;
  estimated_value_currency?: string;
  internal_notes?: string;
  client_notes?: string;
  client_id?: string;
  assigned_to?: string;
}

/**
 * Données de mise à jour pour une étape de traitement
 * Remplace les 'any' dans app/api/folders/[id]/stages/[stage]/route.ts
 */
export interface StageUpdateData extends Record<string, unknown> {
  status?: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped';
  assigned_to?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimated_duration_hours?: number;
  actual_start_date?: string | Date;
  actual_completion_date?: string | Date;
  notes?: string;
  blocking_reason?: string;
  skip_reason?: string;
  required_documents?: string[];
  completion_percentage?: number;
}

/**
 * Données de mise à jour pour un container
 * Remplace les 'any' dans app/api/folders/[id]/containers/route.ts
 */
export interface ContainerUpdateData extends Record<string, unknown> {
  arrival_status?: string;
  estimated_arrival_date?: string | Date;
  actual_arrival_date?: string | Date;
  delay_reason?: string;
  customs_status?: string;
  inspection_status?: string;
  release_status?: string;
  location?: string;
  terminal?: string;
  notes?: string;
  priority_level?: number;
  tracking_number?: string;
  volume_cbm?: number;
  gross_weight_kg?: number;
  container_type_id?: string;
}

// ============================================================================
// Types pour les containers avec relations
// ============================================================================

/**
 * Interface pour un container avec ses types et métadonnées
 * Remplace les 'any' dans les operations reduce() sur les containers
 */
export interface ContainerWithType {
  id?: string;
  arrival_status?: string | null;
  container_type?: {
    iso_code?: string;
    size_feet?: number;
    teu_equivalent?: number;
  } | null;
  volume_cbm?: number | null;
  gross_weight_kg?: number | null;
  estimated_arrival_date?: string | Date | null;
  actual_arrival_date?: string | Date | null;
  delay_reason?: string | null;
  customs_status?: string | null;
  inspection_status?: string | null;
  release_status?: string | null;
  location?: string | null;
  terminal?: string | null;
  notes?: string | null;
  priority_level?: number | null;
  tracking_number?: string | null;
}

// ============================================================================
// Types pour les résumés et statistiques
// ============================================================================

/**
 * Résumé des statuts d'arrivée des containers
 * Utilise une clé string pour le statut et un nombre pour le compte
 */
export interface ArrivalStatusSummary extends Record<string, number> {}

/**
 * Résumé des types de containers
 * Clé: "{iso_code}_{size_feet}ft", Valeur: nombre de containers
 */
export interface ContainerTypeSummary extends Record<string, number> {}

/**
 * Données de statistiques flexibles
 * Remplace les 'any' dans app/api/folders/stats/route.ts
 */
export interface StatsData extends Record<string, unknown> {
  // Statistiques par statut
  status_counts?: Record<string, number>;
  
  // Statistiques de performance
  performance_metrics?: {
    total_folders?: number;
    completed_folders?: number;
    delayed_folders?: number;
    average_processing_time?: number;
  };
  
  // Statistiques par assigné
  assignee_stats?: Array<{
    assignee_id: string;
    assignee_name?: string;
    folder_count: number;
    completed_count: number;
    pending_count: number;
  }>;
  
  // Statistiques par priorité
  priority_stats?: Record<string, number>;
  
  // Statistiques temporelles
  temporal_stats?: {
    this_week?: number;
    this_month?: number;
    this_year?: number;
  };
}

/**
 * Interface pour un dossier avec données statistiques
 * Remplace les 'any' dans les operations reduce() sur les folders
 */
export interface FolderStatEntry {
  id: string;
  status: string;
  priority?: string;
  assigned_to?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
  expected_delivery_date?: string | Date;
  actual_delivery_date?: string | Date;
  transport_type?: string;
  estimated_value?: number;
  client_id?: string;
}

// ============================================================================
// Types pour les opérations batch
// ============================================================================

/**
 * Mise à jour en lot pour les containers
 */
export interface ContainerBatchUpdate {
  container_updates: Array<{
    id: string;
    data: ContainerUpdateData;
  }>;
}

/**
 * Options pour les opérations de mise à jour
 */
export interface UpdateOptions {
  validate_only?: boolean;
  skip_notifications?: boolean;
  update_modified_date?: boolean;
  include_audit_trail?: boolean;
}

// ============================================================================
// Types utilitaires
// ============================================================================

/**
 * Type guard pour vérifier si un objet est un ContainerWithType valide
 */
export const isContainerWithType = (obj: unknown): obj is ContainerWithType => {
  return typeof obj === 'object' && obj !== null;
};

/**
 * Type guard pour vérifier si un objet est un FolderStatEntry valide
 */
export const isFolderStatEntry = (obj: unknown): obj is FolderStatEntry => {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'status' in obj;
};

/**
 * Utilitaire pour créer des données de mise à jour sécurisées
 */
export const createSafeUpdateData = <T extends Record<string, unknown>>(
  data: unknown,
  allowedFields: (keyof T)[]
): Partial<T> => {
  if (typeof data !== 'object' || data === null) {
    return {};
  }

  const result: Partial<T> = {};
  const dataObj = data as Record<string, unknown>;

  allowedFields.forEach(field => {
    if (field in dataObj && dataObj[field] !== undefined) {
      (result as any)[field] = dataObj[field];
    }
  });

  return result;
};