/**
 * Module Folders - Point d'entrée principal
 * Export hiérarchique de tous les types de gestion des dossiers
 */

// ============================================================================
// Enums et types de base
// ============================================================================
export type {
  FolderStatus,
  FolderType,
  FolderCategory,
  FolderPriority,
  FolderUrgency,
  CustomsRegime,
  ComplianceStatus,
  ProcessingStage,
  DocumentStatus,
  AlertType,
  AlertSeverity,
  AlertStatus,
  HealthStatus,
  PerformanceRating,
  ServiceType,
  OperationType
} from './enums';

// ============================================================================
// Interfaces principales
// ============================================================================
export type {
  ClientInfo,
  LocationInfo,
  FinancialInfo,
  AuditMetadata,
  Folder,
  FolderBLRelation,
  FolderDocument,
  FolderActivity,
  FolderStatistics,
  FolderConfiguration
} from './core';

// ============================================================================
// Système d'alertes
// ============================================================================
export type {
  FolderAlert,
  DeadlineAlert,
  ComplianceAlert,
  DelayAlert,
  CostAlert,
  AlertRule,
  AlertSystemConfig,
  AlertDashboard,
  AlertMetrics,
  CreateAlertData,
  UpdateAlertData,
  AlertSearchParams
} from './alerts';

// ============================================================================
// Système d'étapes de traitement
// ============================================================================
export type {
  ProcessingStage,
  StageStatus,
  StagePriority,
  FolderProcessingStage,
  DefaultProcessingStage,
  FolderProgress as StageProgress,
  StageRequiringAttention,
  StagePerformanceMetrics,
  InitializeFolderStagesParams,
  StartProcessingStageParams,
  CompleteProcessingStageParams,
  BlockProcessingStageParams,
  UnblockProcessingStageParams,
  ApproveProcessingStageParams,
  SkipProcessingStageParams,
  CreateStageData,
  UpdateStageData,
  StageTransitionData,
  StagesDashboard,
  StageAlert,
  StageSearchParams,
  StageSearchResults
} from './processing-stages';

// ============================================================================
// Opérations et workflows
// ============================================================================
export type {
  CreateFolderData,
  UpdateFolderData,
  FolderStatusTransition,
  FolderAvailableActions,
  FolderProgress,
  FolderValidationRules,
  FolderValidationResult,
  FolderBatchOperation,
  FolderBatchOperationResult,
  FolderSearchParams,
  FolderSearchResults,
  FolderExportConfig
} from './operations';

// ============================================================================
// Réexports organisés par catégorie
// ============================================================================

// Types de base et enums
export * as FolderEnums from './enums';

// Interfaces principales
export * as FolderCore from './core';

// Système d'alertes
export * as FolderAlerts from './alerts';

// Système d'étapes de traitement
export * as ProcessingStages from './processing-stages';

// Opérations et workflows
export * as FolderOperations from './operations';