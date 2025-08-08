/**
 * Module Folders - Point d'entrée principal (v2.0)
 * Export hiérarchique de tous les types de gestion des dossiers avec architecture modulaire
 * 
 * Version 2.0 - Architecture modulaire avec compatibilité ascendante
 */

// ============================================================================
// CONSTANTS & ENUMS (Nouvelle architecture modulaire)
// ============================================================================
export type {
  FolderStatus,
  FolderType,
  FolderCategory,
  FolderPriority,
  CustomsRegime,
  ComplianceStatus,
  DocumentStatus,
  AlertType,
  AlertSeverity,
  AlertStatus,
  HealthStatus,
  PerformanceRating,
  ServiceType,
  OperationType
} from './constants/enums';

// Stage-related enums from workflow module
export type {
  ProcessingStage,
  StageStatus,
  StagePriority
} from './workflow/stages';

// ============================================================================
// ENTITIES (Entités métier modulaires)
// ============================================================================
export type {
  ClientInfo,
  ExtendedClientInfo
} from './entities/client';

export type {
  LocationInfo,
  PortInfo,
  GeoCoordinates
} from './entities/location';

export type {
  FinancialInfo,
  CostBreakdown,
  BillingInfo
} from './entities/financial';

export type {
  AuditMetadata,
  AuditLogEntry,
  AuditAction
} from './entities/audit';

// ============================================================================
// CORE (Entités principales)
// ============================================================================
export type {
  Folder,
  FolderSummary,
  FolderDisplayConfig
} from './core/folder';

export type {
  FolderBLRelation,
  FolderDocument,
  FolderActivity,
  DocumentCategory,
  DocumentType,
  ActivityType,
  ActivityCategory
} from './core/folder-relations';

// ============================================================================
// WORKFLOW (Système de workflow modulaire)
// ============================================================================
export type {
  FolderProcessingStage,
  DefaultProcessingStage,
  FolderProgress,
  StageRequiringAttention,
  StagePerformanceMetrics,
  StageIssueType
} from './workflow/stages';

export type {
  InitializeFolderStagesParams,
  StartProcessingStageParams,
  CompleteProcessingStageParams,
  BlockProcessingStageParams,
  UnblockProcessingStageParams,
  ApproveProcessingStageParams,
  SkipProcessingStageParams,
  SkipReason,
  StageTransitionData,
  StartStageData,
  CompleteStageData,
  BlockStageData,
  SkipStageData,
  StageTransitionRules,
  TransitionCondition,
  StageStateMachine,
  TransitionValidation
} from './workflow/transitions';

export type {
  StagesDashboard,
  StageAlert,
  StageAlertType,
  StageSearchParams,
  StageSearchResults,
  TeamPerformanceAnalysis,
  StageSLAConfig
} from './workflow/metrics';

// ============================================================================
// OPERATIONS (Opérations CRUD modulaires)
// ============================================================================
export type {
  CreateFolderData,
  FolderTemplate,
  CreateFolderValidation,
  CreateFolderResult,
  CreateFolderOptions,
  ValidationError,
  ValidationWarning
} from './operations/create';

export type {
  UpdateFolderData,
  FolderStatusTransition,
  FolderAvailableActions,
  SpecificAction,
  ActionCategory,
  ActionCondition,
  UpdateFolderResult,
  UpdateFolderOptions
} from './operations/update';

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
} from './operations/search';

export type {
  FolderBatchOperation,
  BatchOperationType,
  BatchOperationData,
  BulkUpdateData,
  StatusChangeData,
  StageTransitionData as BatchStageTransitionData,
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
} from './operations/batch';

// ============================================================================
// ALERTS (Système d'alertes modulaire v2.0)
// ============================================================================
export type {
  // Core alert types
  FolderAlert,
  BusinessImpact,
  ResolutionMethod,
  NotificationMethod,
  
  // Specialized alert types
  DeadlineAlert,
  ComplianceAlert,
  DelayAlert,
  CostAlert,
  DeadlineType,
  ComplianceArea,
  
  // Rules and triggers
  AlertRule,
  TriggerConditions,
  AlertConfig,
  
  // Analytics and reporting
  AlertDashboard,
  AlertMetrics,
  
  // Operations
  CreateAlertData,
  UpdateAlertData,
  AlertSearchParams,
  
  // Configuration
  AlertSystemConfig,
  Environment
} from './alerts';

// ============================================================================
// BACKWARD COMPATIBILITY LAYER - Types dépréciés maintenus
// ============================================================================

// Anciens imports via processing-stages.ts (maintenant deprecié mais fonctionnel)
// Note: Ces exports sont commentés car ils causent des conflits avec les nouveaux modules
// Utilisez directement les imports des modules workflow/* à la place
/*
export type {
  ProcessingStage as LegacyProcessingStage,
  StageStatus as LegacyStageStatus,
  StagePriority as LegacyStagePriority,
  FolderProcessingStage as LegacyFolderProcessingStage,
  DefaultProcessingStage as LegacyDefaultProcessingStage,
  FolderProgress as LegacyStageProgress,
  StageRequiringAttention as LegacyStageRequiringAttention,
  StagePerformanceMetrics as LegacyStagePerformanceMetrics,
  InitializeFolderStagesParams as LegacyInitializeFolderStagesParams,
  StartProcessingStageParams as LegacyStartProcessingStageParams,
  CompleteProcessingStageParams as LegacyCompleteProcessingStageParams,
  BlockProcessingStageParams as LegacyBlockProcessingStageParams,
  UnblockProcessingStageParams as LegacyUnblockProcessingStageParams,
  ApproveProcessingStageParams as LegacyApproveProcessingStageParams,
  SkipProcessingStageParams as LegacySkipProcessingStageParams,
  StageTransitionData as LegacyStageTransitionData,
  StagesDashboard as LegacyStagesDashboard,
  StageAlert as LegacyStageAlert,
  StageSearchParams as LegacyStageSearchParams,
  StageSearchResults as LegacyStageSearchResults,
  // Types dépréciés mais maintenus
  CreateStageData,
  UpdateStageData
} from './processing-stages';
*/

// Anciens imports core.ts -> Redirection vers les nouvelles entités
/** @deprecated Utilisez ./entities/client ClientInfo à la place */
export type { ClientInfo as OldClientInfo } from './entities/client';
/** @deprecated Utilisez ./entities/location LocationInfo à la place */
export type { LocationInfo as OldLocationInfo } from './entities/location';
/** @deprecated Utilisez ./entities/financial FinancialInfo à la place */
export type { FinancialInfo as OldFinancialInfo } from './entities/financial';
/** @deprecated Utilisez ./entities/audit AuditMetadata à la place */
export type { AuditMetadata as OldAuditMetadata } from './entities/audit';

// ============================================================================
// ORGANIZED NAMESPACE EXPORTS (v2.0)
// ============================================================================

// Constants et énumérations
export * as FolderConstants from './constants/enums';

// Entités métier
export * as FolderEntities from './entities';

// Core business logic
export * as FolderCore from './core';

// Système de workflow
export * as FolderWorkflow from './workflow';

// Opérations CRUD
export * as FolderOperations from './operations';

// Système d'alertes
export * as FolderAlerts from './alerts';

// ============================================================================
// LEGACY NAMESPACE EXPORTS (Compatibilité v1.0)
// ============================================================================

/** @deprecated Utilisez FolderConstants à la place */
export * as FolderEnums from './constants/enums';

/** @deprecated Utilisez FolderWorkflow à la place */
export * as ProcessingStages from './processing-stages';