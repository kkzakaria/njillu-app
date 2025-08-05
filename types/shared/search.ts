/**
 * Types pour le système de recherche avancée
 * Recherche full-text, filtres complexes, agrégations
 */

import type {
  EntityId,
  Timestamp,
  PaginationParams,
  PaginationInfo,
  SortParam,
  Filter,
  FilterGroup,
  SeverityLevel
} from './common';

// ============================================================================
// Configuration de recherche
// ============================================================================

/**
 * Configuration générale du moteur de recherche
 */
export interface SearchConfiguration {
  // Moteur de recherche
  engine: 'elasticsearch' | 'postgresql' | 'hybrid';
  
  // Index et mapping
  default_index: string;
  entity_mappings: Record<string, {
    index_name: string;
    searchable_fields: string[];
    faceted_fields: string[];
    sortable_fields: string[];
    boost_fields?: Record<string, number>;
  }>;
  
  // Paramètres de recherche
  search_settings: {
    default_operator: 'AND' | 'OR';
    fuzzy_matching: boolean;
    fuzzy_distance: number;
    min_score_threshold: number;
    max_results_per_search: number;
    highlight_enabled: boolean;
    suggest_enabled: boolean;
  };
  
  // Performance
  performance_settings: {
    cache_enabled: boolean;
    cache_ttl_seconds: number;
    async_indexing: boolean;
    batch_index_size: number;
    search_timeout_ms: number;
  };
}

// ============================================================================
// Types de requête de recherche
// ============================================================================

/**
 * Requête de recherche full-text
 */
export interface TextSearchQuery {
  // Query string principal
  query: string;
  
  // Configuration de la recherche textuelle
  search_options: {
    // Champs à rechercher
    fields?: string[];
    field_boosts?: Record<string, number>;
    
    // Options de matching
    match_type: 'all_words' | 'any_word' | 'exact_phrase' | 'fuzzy';
    fuzzy_distance?: number;
    prefix_matching?: boolean;
    wildcard_allowed?: boolean;
    
    // Opérateurs logiques
    default_operator: 'AND' | 'OR';
    phrase_slop?: number;           // Distance autorisée entre mots dans phrase
    
    // Highlighting
    highlight_fields?: string[];
    highlight_pre_tag?: string;
    highlight_post_tag?: string;
    
    // Suggestions et corrections
    suggest_on_typo?: boolean;
    auto_correct?: boolean;
  };
  
  // Filtres contextuels
  contextual_filters?: {
    language?: 'fr' | 'en' | 'es';
    user_permissions?: string[];
    tenant_id?: EntityId;
    classification_level?: string;
  };
}

/**
 * Requête de recherche structurée (filtres et agrégations)
 */
export interface StructuredSearchQuery {
  // Filtres principaux
  filters?: FilterGroup;
  
  // Filtres par facettes
  facet_filters?: Record<string, any[]>;
  
  // Filtres temporels
  date_filters?: {
    field: string;
    from?: Timestamp;
    to?: Timestamp;
    relative?: {
      unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
      amount: number;
      direction: 'past' | 'future';
    };
  }[];
  
  // Filtres géographiques
  geo_filters?: {
    field: string;
    type: 'distance' | 'bounding_box' | 'polygon';
    coordinates?: number[];         // Long, Lat
    distance?: { value: number; unit: 'km' | 'mi' };
    bounding_box?: {
      top_left: number[];
      bottom_right: number[];
    };
    polygon?: number[][];
  }[];
  
  // Filtres numériques et de plage
  range_filters?: {
    field: string;
    min?: number;
    max?: number;
    include_bounds?: boolean;
  }[];
}

/**
 * Requête de recherche combinée (textuelle + structurée)
 */
export interface CombinedSearchQuery {
  // Recherche textuelle
  text_query?: TextSearchQuery;
  
  // Recherche structurée
  structured_query?: StructuredSearchQuery;
  
  // Logique de combinaison
  combination_logic: 'must' | 'should' | 'must_not';
  text_query_weight?: number;      // Poids relatif de la recherche textuelle
  
  // Options globales
  global_options: {
    entity_types?: string[];       // Types d'entités à rechercher
    include_archived?: boolean;
    include_deleted?: boolean;
    user_context?: {
      user_id: EntityId;
      permissions: string[];
      preferences?: Record<string, any>;
    };
  };
}

// ============================================================================
// Paramètres et options de recherche
// ============================================================================

/**
 * Paramètres complets de recherche
 */
export interface SearchParams {
  // Requête principale
  query: TextSearchQuery | StructuredSearchQuery | CombinedSearchQuery;
  
  // Pagination et tri
  pagination?: PaginationParams;
  sorting?: SortParam[];
  
  // Agrégations demandées
  aggregations?: AggregationRequest[];
  
  // Options d'affichage
  result_options?: {
    include_highlights?: boolean;
    include_score?: boolean;
    include_explanation?: boolean;
    fields_to_return?: string[];
    exclude_fields?: string[];
  };
  
  // Performance et debugging
  debug_options?: {
    explain_query?: boolean;
    profile_query?: boolean;
    timeout_ms?: number;
    track_total_hits?: boolean;
  };
}

/**
 * Configuration des facettes et agrégations
 */
export interface AggregationRequest {
  name: string;
  type: 'terms' | 'date_histogram' | 'range' | 'stats' | 'cardinality' | 'nested';
  
  // Configuration par type
  config: {
    // Terms aggregation
    field?: string;
    size?: number;
    min_doc_count?: number;
    
    // Date histogram
    calendar_interval?: 'year' | 'quarter' | 'month' | 'week' | 'day' | 'hour';
    fixed_interval?: string;
    timezone?: string;
    
    // Range aggregation
    ranges?: Array<{
      from?: number;
      to?: number;
      key?: string;
    }>;
    
    // Nested aggregation
    path?: string;
    sub_aggregations?: AggregationRequest[];
  };
  
  // Filtres spécifiques à l'agrégation
  filters?: FilterGroup;
}

// ============================================================================
// Résultats de recherche
// ============================================================================

/**
 * Résultat individuel de recherche
 */
export interface SearchHit<T = any> {
  // Données de l'entité
  source: T;
  
  // Métadonnées de recherche
  score?: number;
  explanation?: string;
  
  // Highlighting
  highlights?: Record<string, string[]>;
  
  // Position et ranking
  rank: number;
  
  // Métadonnées de l'entité
  entity_metadata: {
    entity_type: string;
    entity_id: EntityId;
    index_name: string;
    last_indexed_at: Timestamp;
    version?: number;
  };
  
  // Informations contextuelles
  context?: {
    user_permissions?: string[];
    access_level?: string;
    related_entities?: Array<{
      type: string;
      id: EntityId;
      relationship: string;
    }>;
  };
}

/**
 * Résultats d'agrégation
 */
export interface AggregationResult {
  name: string;
  type: string;
  
  // Buckets pour agrégations terms, date_histogram, range
  buckets?: Array<{
    key: string | number;
    key_as_string?: string;
    doc_count: number;
    score?: number;
    
    // Sous-agrégations
    sub_aggregations?: Record<string, AggregationResult>;
  }>;
  
  // Métriques pour agrégations stats
  metrics?: {
    count?: number;
    min?: number;
    max?: number;
    avg?: number;
    sum?: number;
    cardinality?: number;
  };
  
  // Métadonnées
  doc_count_error_upper_bound?: number;
  sum_other_doc_count?: number;
}

/**
 * Réponse complète de recherche
 */
export interface SearchResponse<T = any> {
  // Résultats principaux
  hits: SearchHit<T>[];
  total_hits: {
    value: number;
    relation: 'eq' | 'gte';      // 'eq' = exact, 'gte' = greater than or equal
  };
  max_score?: number;
  
  // Pagination
  pagination: PaginationInfo;
  
  // Agrégations
  aggregations?: Record<string, AggregationResult>;
  
  // Suggestions et corrections
  suggestions?: {
    text_suggestions?: Array<{
      original: string;
      suggested: string;
      score: number;
    }>;
    
    facet_suggestions?: Record<string, Array<{
      value: string;
      count: number;
      highlighted?: string;
    }>>;
  };
  
  // Métadonnées de la recherche
  search_metadata: {
    query_time_ms: number;
    total_shards?: number;
    successful_shards?: number;
    skipped_shards?: number;
    
    // Debug info (si demandé)
    query_explanation?: string;
    profile_data?: Record<string, any>;
  };
  
  // Filtres appliqués et disponibles
  applied_filters?: FilterGroup;
  available_filters?: Record<string, Array<{
    value: string;
    count: number;
    selected: boolean;
  }>>;
}

// ============================================================================
// Types pour la recherche sauvegardée
// ============================================================================

/**
 * Recherche sauvegardée
 */
export interface SavedSearch {
  search_id: EntityId;
  name: string;
  description?: string;
  
  // Configuration de la recherche
  search_params: SearchParams;
  
  // Métadonnées
  created_by: EntityId;
  created_at: Timestamp;
  updated_at: Timestamp;
  last_executed?: Timestamp;
  execution_count: number;
  
  // Partage et permissions
  is_public: boolean;
  shared_with?: EntityId[];
  permissions: {
    can_edit: boolean;
    can_delete: boolean;
    can_share: boolean;
  };
  
  // Alertes et notifications
  alert_config?: {
    enabled: boolean;
    frequency: 'real_time' | 'hourly' | 'daily' | 'weekly';
    threshold_change_percent?: number;
    notification_methods: ('email' | 'push' | 'webhook')[];
    recipients: EntityId[];
  };
  
  // Statistiques
  statistics?: {
    avg_results_count: number;
    avg_execution_time_ms: number;
    most_frequent_results: Array<{
      entity_type: string;
      entity_id: EntityId;
      frequency: number;
    }>;
  };
}

/**
 * Historique d'exécution des recherches
 */
export interface SearchHistory {
  execution_id: EntityId;
  search_id?: EntityId;          // Si recherche sauvegardée
  
  // Paramètres utilisés
  search_params: SearchParams;
  
  // Résultats
  results_count: number;
  execution_time_ms: number;
  success: boolean;
  error_message?: string;
  
  // Contexte utilisateur
  executed_by: EntityId;
  executed_at: Timestamp;
  user_agent?: string;
  ip_address?: string;
  
  // Actions post-recherche
  actions_taken?: Array<{
    action: 'view_details' | 'export' | 'share' | 'save' | 'refine';
    entity_id?: EntityId;
    timestamp: Timestamp;
  }>;
  
  // Évaluation de pertinence (optionnel)
  relevance_feedback?: {
    overall_satisfaction: number;    // 1-5
    relevant_results_count?: number;
    feedback_notes?: string;
    suggested_improvements?: string[];
  };
}

// ============================================================================
// Types pour l'indexation et la synchronisation
// ============================================================================

/**
 * Tâche d'indexation
 */
export interface IndexingTask {
  task_id: EntityId;
  task_type: 'full_reindex' | 'incremental_update' | 'delete' | 'optimize';
  
  // Entités concernées
  entity_types: string[];
  entity_filters?: FilterGroup;
  specific_entity_ids?: EntityId[];
  
  // Configuration
  indexing_config: {
    batch_size: number;
    parallel_workers: number;
    include_related_entities: boolean;
    update_related_indexes: boolean;
  };
  
  // État de la tâche
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    total_entities: number;
    processed_entities: number;
    failed_entities: number;
    current_batch: number;
    completion_percentage: number;
  };
  
  // Timing
  scheduled_at?: Timestamp;
  started_at?: Timestamp;
  completed_at?: Timestamp;
  estimated_completion?: Timestamp;
  
  // Résultats
  results?: {
    entities_indexed: number;
    entities_deleted: number;
    entities_failed: number;
    index_size_mb: number;
    errors: Array<{
      entity_id: EntityId;
      error_code: string;
      error_message: string;
    }>;
  };
  
  // Métadonnées
  created_by: EntityId;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  retry_count: number;
  max_retries: number;
}

/**
 * Configuration de synchronisation en temps réel
 */
export interface RealTimeSyncConfig {
  config_id: EntityId;
  entity_type: string;
  
  // Déclencheurs de synchronisation
  sync_triggers: {
    on_create: boolean;
    on_update: boolean;
    on_delete: boolean;
    on_status_change: boolean;
    field_changes?: string[];       // Synchroniser seulement si ces champs changent
  };
  
  // Configuration de performance
  sync_settings: {
    debounce_ms: number;           // Attendre avant sync pour éviter spam
    batch_updates: boolean;
    max_batch_size: number;
    max_retry_attempts: number;
    backoff_strategy: 'linear' | 'exponential';
  };
  
  // Transformation des données
  field_mappings?: Record<string, string>;
  computed_fields?: Array<{
    name: string;
    expression: string;
    type: 'text' | 'number' | 'date' | 'boolean';
  }>;
  
  // Filtres d'exclusion
  exclusion_filters?: FilterGroup;
  
  // État et monitoring
  is_enabled: boolean;
  last_sync_at?: Timestamp;
  sync_lag_ms?: number;
  error_rate_percent: number;
  
  created_at: Timestamp;
  updated_at: Timestamp;
}