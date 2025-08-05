/**
 * Module Shared - Point d'entrée principal
 * Export hiérarchique de tous les types partagés et utilitaires communs
 */

// ============================================================================
// Types communs et utilitaires
// ============================================================================
export type {
  EntityId,
  Timestamp,
  CurrencyCode,
  CountryCode,
  LanguageCode,
  AuditMetadata,
  SimpleAuditInfo,
  PerformanceMetadata,
  PaginationParams,
  PaginationInfo,
  PaginatedResponse,
  SortDirection,
  SortParam,
  SortOptions,
  FilterOperator,
  Filter,
  FilterGroup,
  SeverityLevel,
  ValidationError,
  ValidationResult,
  ResponseStatus,
  ApiResponse,
  Optional,
  RequireFields,
  Omit,
  Pick,
  BrandedId,
  UserId,
  FolderId,
  BLId,
  ContainerId,
  CompanyId,
  EnvironmentConfig,
  LocalizationConfig,
  SystemEvent,
  EventHandler
} from './common';

// ============================================================================
// Système de soft delete
// ============================================================================
export type {
  SoftDeletable,
  DeletionMetadata,
  DeletionHistory,
  SoftDeleteParams,
  SoftDeleteResult,
  RestoreParams,
  RestoreResult,
  RetentionPolicy,
  CleanupSchedule,
  SoftDeleteQueryOptions,
  EntityWithSoftDeleteInfo
} from './soft-delete';

// ============================================================================
// Système de recherche avancée
// ============================================================================
export type {
  SearchConfiguration,
  TextSearchQuery,
  StructuredSearchQuery,
  CombinedSearchQuery,
  SearchParams,
  AggregationRequest,
  SearchHit,
  AggregationResult,
  SearchResponse,
  SavedSearch,
  SearchHistory,
  IndexingTask,
  RealTimeSyncConfig
} from './search';

// ============================================================================
// Réexports organisés par catégorie
// ============================================================================

// Types communs et utilitaires génériques
export * as CommonTypes from './common';

// Système de suppression logique
export * as SoftDelete from './soft-delete';

// Système de recherche et indexation
export * as Search from './search';