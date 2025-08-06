/**
 * Module Workflow - Point d'entrée du système de workflow
 * Export de tous les types relatifs au workflow d'étapes
 */

export * from './stages';
export * from './transitions';
export * from './metrics';

// Re-exports pour compatibilité
export type {
  ProcessingStage,
  StageStatus,
  StagePriority,
  FolderProcessingStage,
  DefaultProcessingStage,
  FolderProgress,
  StageRequiringAttention,
  StageIssueType,
  StagePerformanceMetrics
} from './stages';

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
} from './transitions';

export type {
  StagesDashboard,
  StageAlert,
  StageAlertType,
  StageSearchParams,
  StageSearchResults,
  TeamPerformanceAnalysis,
  StageSLAConfig
} from './metrics';