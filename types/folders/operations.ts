/**
 * Types pour les opérations sur les dossiers
 * CRUD, workflows, validation, business logic
 */

import type {
  FolderStatus,
  FolderType,
  FolderCategory,
  FolderPriority,
  FolderUrgency,
  CustomsRegime,
  ComplianceStatus,
  ProcessingStage,
  DocumentStatus,
  ServiceType,
  OperationType
} from './enums';

import type {
  Folder,
  ClientInfo,
  LocationInfo,
  FinancialInfo,
  FolderDocument,
  FolderActivity,
  FolderStatistics
} from './core';

// ============================================================================
// Types pour la création et modification des dossiers
// ============================================================================

/**
 * Données pour créer un nouveau dossier
 */
export interface CreateFolderData {
  // Classification
  type: FolderType;
  category: FolderCategory;
  priority?: FolderPriority;
  urgency?: FolderUrgency;
  
  // Références
  reference_number?: string;
  internal_reference?: string;
  
  // Informations client (obligatoires)
  client_info: ClientInfo;
  consignee_info?: ClientInfo;
  notify_party_info?: ClientInfo;
  
  // Géographie (obligatoire)
  origin: LocationInfo;
  destination: LocationInfo;
  
  // Régime et services
  customs_regime: CustomsRegime;
  service_type: ServiceType;
  operation_type: OperationType;
  
  // Description
  description?: string;
  cargo_description?: string;
  special_instructions?: string;
  
  // Dates de planification
  expected_start_date?: string;
  expected_completion_date?: string;
  deadline_date?: string;
  
  // Informations financières initiales
  financial_info?: Partial<FinancialInfo>;
  
  // Mesures globales estimées
  total_weight_kg?: number;
  total_volume_cbm?: number;
  total_packages?: number;
  
  // Relations
  parent_folder_id?: string;
  related_folder_ids?: string[];
  
  // Bills of Lading à associer immédiatement
  initial_bl_ids?: string[];
}

/**
 * Données pour modifier un dossier existant
 */
export interface UpdateFolderData {
  // Tous les champs sont optionnels pour mise à jour partielle
  type?: FolderType;
  category?: FolderCategory;
  priority?: FolderPriority;
  urgency?: FolderUrgency;
  
  reference_number?: string;
  internal_reference?: string;
  
  client_info?: Partial<ClientInfo>;
  consignee_info?: Partial<ClientInfo>;
  notify_party_info?: Partial<ClientInfo>;
  
  origin?: Partial<LocationInfo>;
  destination?: Partial<LocationInfo>;
  current_location?: Partial<LocationInfo>;
  
  customs_regime?: CustomsRegime;
  compliance_status?: ComplianceStatus;
  service_type?: ServiceType;
  operation_type?: OperationType;
  
  description?: string;
  cargo_description?: string;
  special_instructions?: string;
  notes?: string;
  
  expected_start_date?: string;
  actual_start_date?: string;
  expected_completion_date?: string;
  actual_completion_date?: string;
  deadline_date?: string;
  
  financial_info?: Partial<FinancialInfo>;
  
  total_weight_kg?: number;
  total_volume_cbm?: number;
  total_packages?: number;
  
  related_folder_ids?: string[];
}

// ============================================================================
// Types pour les workflows et transitions d'état
// ============================================================================

/**
 * Changement de statut d'un dossier
 */
export interface FolderStatusTransition {
  folder_id: string;
  from_status: FolderStatus;
  to_status: FolderStatus;
  from_stage?: ProcessingStage;
  to_stage?: ProcessingStage;
  
  // Justification
  reason: string;
  notes?: string;
  supporting_documents?: string[]; // IDs de documents
  
  // Planification
  effective_date?: string;
  scheduled_date?: string;
  
  // Validation
  requires_approval: boolean;
  approved_by?: string;
  approved_at?: string;
  
  // Notifications
  notify_client: boolean;
  notify_team: boolean;
  notification_message?: string;
}

/**
 * Actions disponibles pour un dossier selon son état
 */
export interface FolderAvailableActions {
  folder_id: string;
  current_status: FolderStatus;
  current_stage: ProcessingStage;
  
  // Transitions possibles
  available_status_transitions: Array<{
    target_status: FolderStatus;
    target_stage?: ProcessingStage;
    action_name: string;
    requires_documents?: string[];
    requires_approval: boolean;
    estimated_duration?: string;
  }>;
  
  // Actions générales disponibles
  available_operations: Array<{
    operation: 'add_bl' | 'remove_bl' | 'update_location' | 'add_document' | 'create_alert' | 'assign_team';
    enabled: boolean;
    reason_if_disabled?: string;
  }>;
  
  // Restrictions
  blocked_operations?: Array<{
    operation: string;
    reason: string;
    can_override: boolean;
  }>;
}

/**
 * Progression d'un dossier dans le workflow
 */
export interface FolderProgress {
  folder_id: string;
  
  // État actuel
  current_status: FolderStatus;
  current_stage: ProcessingStage;
  
  // Progression
  completed_stages: ProcessingStage[];
  next_stages: ProcessingStage[];
  total_stages: number;
  completion_percentage: number;
  
  // Temps
  processing_time_days: number;
  estimated_remaining_days?: number;
  is_on_schedule: boolean;
  
  // Indicateurs
  health_indicators: Array<{
    category: 'timeline' | 'documents' | 'compliance' | 'costs' | 'quality';
    status: 'healthy' | 'warning' | 'critical';
    details: string;
  }>;
  
  // Blocages
  current_blockers?: Array<{
    type: 'document_missing' | 'approval_pending' | 'client_response' | 'system_issue';
    description: string;
    estimated_resolution?: string;
  }>;
}

// ============================================================================
// Types pour la validation
// ============================================================================

/**
 * Règles de validation pour un dossier
 */
export interface FolderValidationRules {
  // Validation des données de base
  basic_data: {
    require_client_info: boolean;
    require_origin_destination: boolean;
    require_service_type: boolean;
    validate_location_codes: boolean;
  };
  
  // Validation documentaire
  documents: {
    required_document_types: string[];
    require_original_documents: boolean;
    allow_expired_documents: boolean;
    document_retention_days: number;
  };
  
  // Validation financière
  financial: {
    require_cost_estimate: boolean;
    cost_variance_threshold_percent: number;
    require_client_credit_check: boolean;
    maximum_folder_value?: number;
  };
  
  // Validation de conformité
  compliance: {
    require_customs_documentation: boolean;
    validate_hs_codes: boolean;
    require_dangerous_goods_certification: boolean;
    enforce_trade_restrictions: boolean;
  };
  
  // Validation temporelle
  timeline: {
    minimum_processing_days: number;
    maximum_processing_days: number;
    require_realistic_deadlines: boolean;
    validate_business_days: boolean;
  };
}

/**
 * Résultat de validation d'un dossier
 */
export interface FolderValidationResult {
  folder_id: string;
  is_valid: boolean;
  
  // Erreurs critiques
  errors: Array<{
    category: 'data' | 'documents' | 'financial' | 'compliance' | 'timeline';
    field?: string;
    code: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    suggested_action?: string;
  }>;
  
  // Avertissements
  warnings: Array<{
    category: string;
    field?: string;
    message: string;
    impact: 'low' | 'medium' | 'high';
    recommendation?: string;
  }>;
  
  // Scores de qualité
  quality_scores: {
    data_completeness: number;      // 0-100
    document_completeness: number;  // 0-100
    compliance_score: number;       // 0-100
    timeline_feasibility: number;   // 0-100
    overall_score: number;          // 0-100
  };
  
  // Améliorations suggérées
  improvements: Array<{
    category: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    estimated_impact: string;
  }>;
  
  validated_at: string;
  validated_by?: string;
}

// ============================================================================
// Types pour les opérations en lot
// ============================================================================

/**
 * Opération en lot sur plusieurs dossiers
 */
export interface FolderBatchOperation {
  operation_type: 
    | 'status_change'
    | 'assign_team'
    | 'update_priority'
    | 'add_tags'
    | 'generate_reports'
    | 'export_data'
    | 'archive'
    | 'delete';
  
  folder_ids: string[];
  parameters: Record<string, any>;
  
  // Options d'exécution
  execution_mode: 'immediate' | 'scheduled' | 'manual_approval';
  scheduled_at?: string;
  notify_on_completion: boolean;
  continue_on_error: boolean;
  
  // Validation préalable
  validate_before_execution: boolean;
  dry_run?: boolean;
}

/**
 * Résultat d'opération en lot
 */
export interface FolderBatchOperationResult {
  operation_id: string;
  operation_type: string;
  
  // Timing
  started_at: string;
  completed_at?: string;
  processing_time_ms: number;
  
  // Résultats
  total_folders: number;
  successful_operations: number;
  failed_operations: number;
  skipped_operations: number;
  
  // Détails par dossier
  folder_results: Array<{
    folder_id: string;
    folder_number: string;
    success: boolean;
    error_message?: string;
    warnings?: string[];
    processing_time_ms?: number;
  }>;
  
  // Statistiques globales
  performance_metrics: {
    average_time_per_folder: number;
    peak_memory_usage?: number;
    database_queries_count?: number;
  };
  
  // Rapport final
  summary_report?: {
    successful_folders: string[];
    failed_folders: string[];
    recommendations: string[];
  };
}

// ============================================================================
// Types pour la recherche et les filtres
// ============================================================================

/**
 * Paramètres de recherche des dossiers
 */
export interface FolderSearchParams {
  // Recherche textuelle
  search_query?: string;
  search_fields?: ('folder_number' | 'reference_number' | 'description' | 'client_name')[];
  
  // Filtres de statut et type
  statuses?: FolderStatus[];
  types?: FolderType[];
  categories?: FolderCategory[];
  priorities?: FolderPriority[];
  processing_stages?: ProcessingStage[];
  
  // Filtres géographiques
  origin_countries?: string[];
  destination_countries?: string[];
  origin_cities?: string[];
  destination_cities?: string[];
  
  // Filtres clients
  client_names?: string[];
  client_codes?: string[];
  
  // Filtres temporels
  created_from?: string;
  created_to?: string;
  deadline_from?: string;
  deadline_to?: string;
  completion_from?: string;
  completion_to?: string;
  
  // Filtres financiers
  cost_min?: number;
  cost_max?: number;
  currency?: string;
  
  // Filtres de performance
  health_status?: ('healthy' | 'warning' | 'critical')[];
  has_active_alerts?: boolean;
  is_overdue?: boolean;
  
  // Filtres de relations
  has_bls?: boolean;
  bl_count_min?: number;
  bl_count_max?: number;
  parent_folder_id?: string;
  
  // Pagination et tri
  page?: number;
  page_size?: number;
  sort_by?: 'created_at' | 'folder_number' | 'deadline_date' | 'status' | 'priority';
  sort_order?: 'asc' | 'desc';
}

/**
 * Résultats de recherche de dossiers
 */
export interface FolderSearchResults {
  folders: Array<Folder & {
    // Données additionnelles pour l'affichage
    bl_count: number;
    alert_count: number;
    completion_percentage: number;
    days_until_deadline?: number;
  }>;
  
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    page_size: number;
    has_next_page: boolean;
    has_previous_page: boolean;
  };
  
  // Agrégations pour filtres
  aggregations: {
    by_status: Record<FolderStatus, number>;
    by_type: Record<FolderType, number>;
    by_priority: Record<FolderPriority, number>;
    by_processing_stage: Record<ProcessingStage, number>;
  };
  
  // Métadonnées de recherche
  search_metadata: {
    query_time_ms: number;
    total_folders_in_system: number;
    filters_applied: Partial<FolderSearchParams>;
  };
}

// ============================================================================
// Types pour l'export et le reporting
// ============================================================================

/**
 * Configuration d'export de dossiers
 */
export interface FolderExportConfig {
  format: 'csv' | 'xlsx' | 'pdf' | 'json';
  
  // Sélection des données
  include_sections: Array<
    | 'basic_info'
    | 'client_info'
    | 'location_info'
    | 'financial_info'
    | 'bl_summary'
    | 'document_list'
    | 'activity_log'
    | 'alert_summary'
    | 'statistics'
  >;
  
  // Filtres (utilise FolderSearchParams)
  filters?: FolderSearchParams;
  
  // Options de format
  format_options?: {
    // CSV
    delimiter?: string;
    include_headers?: boolean;
    date_format?: string;
    
    // Excel
    create_summary_sheet?: boolean;
    include_charts?: boolean;
    freeze_header_row?: boolean;
    
    // PDF
    include_cover_page?: boolean;
    page_orientation?: 'portrait' | 'landscape';
    font_size?: number;
    
    // JSON
    pretty_print?: boolean;
    include_metadata?: boolean;
  };
  
  // Métadonnées
  report_title?: string;
  report_description?: string;
  generated_by?: string;
  confidentiality_level?: 'public' | 'internal' | 'confidential' | 'restricted';
}