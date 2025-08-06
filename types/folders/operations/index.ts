/**
 * Module Operations - Point d'entrée des opérations métier
 * Export de toutes les opérations sur les dossiers
 */

export * from './create';
export * from './update';
export * from './search';
export * from './batch';

// Re-exports pour compatibilité
export type {
  CreateFolderData,
  CreateFolderValidation,
  CreateFolderResult,
  CreateFolderOptions,
  FolderTemplate,
  ValidationError,
  ValidationWarning
} from './create';

export type {
  UpdateFolderData,
  FolderStatusTransition,
  FolderAvailableActions,
  SpecificAction,
  ActionCategory,
  ActionCondition,
  UpdateFolderResult,
  UpdateFolderOptions
} from './update';

export type {
  FolderSearchParams,
  FolderSearchResults,
  SearchField,
  SortField,
  CustomFilter,
  FilterOperator,
  SearchStatistics,
  SearchSuggestion,
  SearchFacets,
  SavedSearch
} from './search';

export type {
  FolderBatchOperation,
  BatchOperationType,
  BatchOperationData,
  BulkUpdateData,
  StatusChangeData,
  StageTransitionData,
  AssignmentData,
  DocumentAttachData,
  NotificationData,
  ExportData,
  ArchiveData,
  DeleteData,
  TagData,
  CustomOperationData,
  BatchExecutionOptions,
  BatchOperationStatus,
  BatchProgress,
  FolderBatchOperationResult
} from './batch';