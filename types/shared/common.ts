/**
 * Types communs partagés à travers tout le système
 * Interfaces génériques, utilitaires, métadonnées système
 */

// ============================================================================
// Types de base génériques
// ============================================================================

/**
 * Identifiant universel (UUID ou string)
 */
export type EntityId = string;

/**
 * Timestamp ISO 8601
 */
export type Timestamp = string;

/**
 * Code de devise ISO 4217
 */
export type CurrencyCode = string;

/**
 * Code de pays ISO 3166-1 alpha-2
 */
export type CountryCode = string;

/**
 * Code de langue ISO 639-1
 */
export type LanguageCode = 'fr' | 'en' | 'es';

// ============================================================================
// Interfaces de métadonnées système
// ============================================================================

/**
 * Métadonnées d'audit complètes pour toute entité
 */
export interface AuditMetadata {
  // Création
  created_at: Timestamp;
  created_by?: EntityId;
  
  // Modification
  updated_at: Timestamp;
  updated_by?: EntityId;
  last_modified_at?: Timestamp;
  last_modified_by?: EntityId;
  
  // Version et contrôle de changement
  version?: number;
  revision_number?: number;
  change_sequence?: number;
  
  // Soft delete (voir soft-delete.ts pour détails)
  deleted_at?: Timestamp;
  deleted_by?: EntityId;
  
  // Contexte technique
  client_ip?: string;
  user_agent?: string;
  session_id?: string;
  request_id?: string;
  
  // Métadonnées business
  business_context?: string;
  change_reason?: string;
  approval_required?: boolean;
  approved_by?: EntityId;
  approved_at?: Timestamp;
}

/**
 * Informations de traçabilité simplifiées
 */
export interface SimpleAuditInfo {
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: EntityId;
  updated_by?: EntityId;
}

/**
 * Métadonnées de performance et monitoring
 */
export interface PerformanceMetadata {
  // Temps de traitement
  processing_time_ms?: number;
  query_time_ms?: number;
  render_time_ms?: number;
  
  // Utilisation ressources
  memory_usage_mb?: number;
  cpu_usage_percent?: number;
  io_operations_count?: number;
  
  // Cache et optimisation
  cache_hit?: boolean;
  cache_key?: string;
  optimization_applied?: string[];
  
  // Qualité des données
  data_freshness_minutes?: number;
  confidence_score?: number;
  data_source?: string;
  data_version?: string;
}

// ============================================================================
// Types pour la pagination
// ============================================================================

/**
 * Paramètres de pagination standard
 */
export interface PaginationParams {
  page?: number;
  page_size?: number;
  offset?: number;
  limit?: number;
}

/**
 * Information de pagination dans les réponses
 */
export interface PaginationInfo {
  current_page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  next_page?: number;
  previous_page?: number;
  
  // Métadonnées additionnelles
  first_item_index: number;
  last_item_index: number;
  showing_count: number;
}

/**
 * Réponse paginée générique
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
  
  // Métadonnées optionnelles
  query_time_ms?: number;
  total_count_estimate?: boolean;
  filters_applied?: Record<string, any>;
}

// ============================================================================
// Types pour le tri
// ============================================================================

/**
 * Direction de tri
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Paramètre de tri
 */
export interface SortParam {
  field: string;
  direction: SortDirection;
  priority?: number;           // Pour tri multi-colonnes
  null_handling?: 'first' | 'last';
}

/**
 * Options de tri multiples
 */
export interface SortOptions {
  sorts: SortParam[];
  default_direction?: SortDirection;
  case_sensitive?: boolean;
  locale?: string;             // Pour tri localisé
}

// ============================================================================
// Types pour les filtres
// ============================================================================

/**
 * Opérateurs de comparaison
 */
export type FilterOperator = 
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'greater_than_or_equal'
  | 'less_than'
  | 'less_than_or_equal'
  | 'in'
  | 'not_in'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'is_null'
  | 'is_not_null'
  | 'between'
  | 'not_between';

/**
 * Filtre générique
 */
export interface Filter {
  field: string;
  operator: FilterOperator;
  value?: any;
  values?: any[];              // Pour opérateurs 'in', 'between', etc.
  
  // Options
  case_sensitive?: boolean;
  ignore_accents?: boolean;
  
  // Métadonnées
  label?: string;
  description?: string;
}

/**
 * Groupe de filtres avec logique
 */
export interface FilterGroup {
  logic: 'AND' | 'OR';
  filters: (Filter | FilterGroup)[];
  
  // Métadonnées
  name?: string;
  description?: string;
}

// ============================================================================
// Types pour les erreurs et validation
// ============================================================================

/**
 * Niveau de sévérité
 */
export type SeverityLevel = 'info' | 'warning' | 'error' | 'critical';

/**
 * Erreur de validation
 */
export interface ValidationError {
  field?: string;
  code: string;
  message: string;
  severity: SeverityLevel;
  
  // Contexte additionnel
  current_value?: any;
  expected_value?: any;
  suggested_correction?: any;
  
  // Métadonnées
  validation_rule?: string;
  error_path?: string;
  related_fields?: string[];
}

/**
 * Résultat de validation générique
 */
export interface ValidationResult {
  is_valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  
  // Scores de qualité
  overall_score?: number;      // 0-100
  completeness_score?: number;
  accuracy_score?: number;
  
  // Métadonnées
  validated_at: Timestamp;
  validation_version?: string;
  validation_rules_applied?: string[];
}

// ============================================================================
// Types pour les réponses API
// ============================================================================

/**
 * Statut de réponse standardisé
 */
export type ResponseStatus = 'success' | 'error' | 'warning' | 'partial';

/**
 * Réponse API générique
 */
export interface ApiResponse<T = any> {
  status: ResponseStatus;
  data?: T;
  
  // En cas d'erreur
  error?: {
    code: string;
    message: string;
    details?: any;
    stack_trace?: string;
  };
  
  // Messages et avertissements
  messages?: Array<{
    type: 'info' | 'warning' | 'error';
    message: string;
    code?: string;
  }>;
  
  // Métadonnées
  metadata?: {
    request_id: string;
    timestamp: Timestamp;
    version: string;
    processing_time_ms: number;
    rate_limit?: {
      remaining: number;
      reset_at: Timestamp;
    };
  };
  
  // Pagination (si applicable)
  pagination?: PaginationInfo;
}

// ============================================================================
// Types utilitaires génériques
// ============================================================================

/**
 * Rend tous les champs optionnels (équivalent à Partial<T>)
 */
export type Optional<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Rend certains champs requis
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Exclut certains champs
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Inclut seulement certains champs
 */
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * Type pour les IDs avec branding (type safety)
 */
export type BrandedId<T extends string> = string & { readonly brand: T };

/**
 * IDs typés pour différentes entités
 */
export type UserId = BrandedId<'User'>;
export type FolderId = BrandedId<'Folder'>;
export type BLId = BrandedId<'BL'>;
export type ContainerId = BrandedId<'Container'>;
export type CompanyId = BrandedId<'Company'>;

// ============================================================================
// Types pour les configurations
// ============================================================================

/**
 * Configuration d'environnement
 */
export interface EnvironmentConfig {
  environment: 'development' | 'staging' | 'production';
  debug_mode: boolean;
  log_level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  
  // Features toggles
  feature_flags: Record<string, boolean>;
  
  // Limites système
  rate_limits: {
    api_requests_per_minute: number;
    concurrent_operations: number;
    max_file_size_mb: number;
    max_export_records: number;
  };
  
  // Timeouts
  timeouts: {
    api_timeout_ms: number;
    database_timeout_ms: number;
    cache_timeout_ms: number;
    background_job_timeout_ms: number;
  };
}

/**
 * Configuration de localisation
 */
export interface LocalizationConfig {
  default_language: LanguageCode;
  supported_languages: LanguageCode[];
  default_currency: CurrencyCode;
  default_timezone: string;
  
  // Formats
  date_format: string;
  time_format: string;
  number_format: {
    decimal_separator: string;
    thousands_separator: string;
    decimal_places: number;
  };
  
  // Préférences régionales
  first_day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6;  // 0 = dimanche
  measurement_system: 'metric' | 'imperial';
}

// ============================================================================
// Types pour les événements système
// ============================================================================

/**
 * Événement système générique
 */
export interface SystemEvent<T = any> {
  event_id: EntityId;
  event_type: string;
  event_category: 'system' | 'business' | 'security' | 'performance';
  
  // Contenu
  payload: T;
  
  // Contexte
  entity_type?: string;
  entity_id?: EntityId;
  user_id?: UserId;
  session_id?: string;
  
  // Timing
  occurred_at: Timestamp;
  processed_at?: Timestamp;
  
  // Métadonnées
  source_system: string;
  correlation_id?: string;
  causation_id?: string;
  
  // Traçabilité
  trace_id?: string;
  span_id?: string;
  parent_event_id?: EntityId;
  
  // Sécurité
  classification?: 'public' | 'internal' | 'confidential' | 'restricted';
  retention_period_days?: number;
}

/**
 * Handler d'événement
 */
export interface EventHandler<T = any> {
  handler_id: string;
  event_types: string[];
  priority: number;
  
  // Configuration
  is_async: boolean;
  retry_policy?: {
    max_attempts: number;
    backoff_strategy: 'linear' | 'exponential';
    base_delay_ms: number;
  };
  
  // Filtres
  filters?: FilterGroup[];
  
  // Métadonnées
  created_at: Timestamp;
  last_executed?: Timestamp;
  execution_count: number;
  success_rate: number;
}