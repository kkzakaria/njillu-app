/**
 * Opérations de recherche - Types pour la recherche et filtrage de dossiers
 */

import type {
  FolderStatus,
  FolderType,
  FolderCategory,
  FolderPriority,
  CustomsRegime,
  ComplianceStatus,
  ProcessingStage,
  HealthStatus,
  PerformanceRating,
  ServiceType,
  OperationType
} from '../constants';

import type { Folder, FolderSummary } from '../core/folder';

/**
 * Paramètres de recherche de dossiers
 */
export interface FolderSearchParams {
  // Recherche textuelle
  search_query?: string;
  search_fields?: SearchField[];
  
  // Filtres de base
  status?: FolderStatus | FolderStatus[];
  type?: FolderType | FolderType[];
  category?: FolderCategory | FolderCategory[];
  priority?: FolderPriority | FolderPriority[];
  
  // Filtres workflow
  processing_stage?: ProcessingStage | ProcessingStage[];
  health_status?: HealthStatus | HealthStatus[];
  performance_rating?: PerformanceRating | PerformanceRating[];
  
  // Filtres réglementaires
  customs_regime?: CustomsRegime | CustomsRegime[];
  compliance_status?: ComplianceStatus | ComplianceStatus[];
  
  // Filtres services
  service_type?: ServiceType | ServiceType[];
  operation_type?: OperationType | OperationType[];
  
  // Filtres de dates
  created_date_from?: string;
  created_date_to?: string;
  expected_completion_from?: string;
  expected_completion_to?: string;
  deadline_date_from?: string;
  deadline_date_to?: string;
  
  // Filtres numériques
  folder_number?: string;
  reference_number?: string;
  internal_reference?: string;
  
  // Filtres géographiques
  origin_country?: string | string[];
  destination_country?: string | string[];
  origin_city?: string | string[];
  destination_city?: string | string[];
  
  // Filtres client
  client_name?: string;
  client_code?: string;
  account_manager?: string;
  
  // Filtres financiers
  estimated_cost_min?: number;
  estimated_cost_max?: number;
  currency?: string | string[];
  
  // Filtres de performance
  sla_compliance_min?: number;
  processing_time_max?: number;
  
  // Relations
  has_bl?: boolean;
  has_alerts?: boolean;
  has_documents?: boolean;
  parent_folder_id?: string;
  
  // Assignation
  assigned_to?: string | string[];
  created_by?: string | string[];
  
  // Filtres avancés
  custom_filters?: CustomFilter[];
  
  // Tri
  sort_by?: SortField;
  sort_order?: 'asc' | 'desc';
  secondary_sort?: {
    field: SortField;
    order: 'asc' | 'desc';
  };
  
  // Pagination
  page?: number;
  page_size?: number;
  offset?: number;
  limit?: number;
  
  // Options de résultat
  include_relations?: boolean;
  include_statistics?: boolean;
  include_alerts?: boolean;
  result_format?: 'summary' | 'detailed' | 'export';
}

/**
 * Champs de recherche textuelle
 */
export type SearchField =
  | 'folder_number'
  | 'reference_number'
  | 'internal_reference'
  | 'description'
  | 'cargo_description'
  | 'special_instructions'
  | 'notes'
  | 'client_name'
  | 'origin_name'
  | 'destination_name'
  | 'all'; // Recherche dans tous les champs

/**
 * Champs de tri disponibles
 */
export type SortField =
  | 'folder_number'
  | 'created_date'
  | 'expected_completion_date'
  | 'actual_completion_date'
  | 'deadline_date'
  | 'priority'
  | 'status'
  | 'processing_stage'
  | 'client_name'
  | 'estimated_cost'
  | 'sla_compliance'
  | 'processing_time_days'
  | 'health_status'
  | 'updated_at';

/**
 * Filtre personnalisé
 */
export interface CustomFilter {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | Date | string[] | number[] | null;
  logical_operator?: 'AND' | 'OR';
}

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'in'
  | 'not_in'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'greater_than_equal'
  | 'less_than'
  | 'less_than_equal'
  | 'between'
  | 'is_null'
  | 'is_not_null'
  | 'is_empty'
  | 'is_not_empty';

/**
 * Résultats de recherche
 */
export interface FolderSearchResults {
  // Résultats
  folders: Folder[] | FolderSummary[];
  
  // Métadonnées de pagination
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  
  // Statistiques de recherche
  search_stats?: SearchStatistics;
  
  // Suggestions
  suggestions?: SearchSuggestion[];
  
  // Facettes pour filtrage
  facets?: SearchFacets;
  
  // Performance
  execution_time_ms: number;
  query_complexity: 'low' | 'medium' | 'high';
}

/**
 * Statistiques de recherche
 */
export interface SearchStatistics {
  by_status: Array<{ status: FolderStatus; count: number }>;
  by_type: Array<{ type: FolderType; count: number }>;
  by_category: Array<{ category: FolderCategory; count: number }>;
  by_priority: Array<{ priority: FolderPriority; count: number }>;
  by_stage: Array<{ stage: ProcessingStage; count: number }>;
  by_month: Array<{ month: string; count: number }>;
}

/**
 * Suggestion de recherche
 */
export interface SearchSuggestion {
  type: 'spelling' | 'filter' | 'related';
  original_query?: string;
  suggested_query: string;
  reason: string;
  confidence: number;
}

/**
 * Facettes pour le filtrage interactif
 */
export interface SearchFacets {
  status: Array<{ value: FolderStatus; count: number; selected: boolean }>;
  type: Array<{ value: FolderType; count: number; selected: boolean }>;
  category: Array<{ value: FolderCategory; count: number; selected: boolean }>;
  priority: Array<{ value: FolderPriority; count: number; selected: boolean }>;
  stage: Array<{ value: ProcessingStage; count: number; selected: boolean }>;
  origin_country: Array<{ value: string; count: number; selected: boolean }>;
  destination_country: Array<{ value: string; count: number; selected: boolean }>;
}

/**
 * Recherche sauvegardée
 */
export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  search_params: FolderSearchParams;
  is_public: boolean;
  created_by: string;
  created_at: string;
  last_used_at?: string;
  use_count: number;
  tags?: string[];
}