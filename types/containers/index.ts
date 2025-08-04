/**
 * Module Containers - Point d'entrée principal
 * Export hiérarchique de tous les types de gestion des conteneurs et arrivées
 */

// ============================================================================
// Enums et types de base
// ============================================================================
export type {
  ContainerArrivalStatus,
  ArrivalUrgency,
  DelaySeverity,
  ContainerUrgencyLevel,
  ContainerHealthStatus
} from './enums';

// ============================================================================
// Système de suivi des arrivées
// ============================================================================
export type {
  ContainerArrivalTracking,
  ContainerArrivalHistory,
  ArrivalPerformanceMetrics,
  ArrivalRealTimeIndicators,
  ContainerDelayAlert,
  MissingETAAlert,
  ArrivalNotificationConfig,
  ArrivalNotificationHistory,
  UpdateArrivalData,
  ArrivalTrackingSearchParams
} from './arrival-tracking';

// ============================================================================
// Dashboards et vues analytiques
// ============================================================================
export type {
  ContainerArrivalDashboard,
  ManagerDashboardView,
  OperatorDashboardView,
  ClientDashboardView,
  PerformanceAnalysisView,
  CostImpactAnalysis,
  DashboardConfiguration,
  DashboardSession
} from './dashboard';

// ============================================================================
// Opérations et intégrations
// ============================================================================
export type {
  CreateArrivalTrackingData,
  BatchUpdateArrivalData,
  BatchOperationResult,
  ShippingLineIntegration,
  SyncResult,
  ArrivalAutomationRule,
  AutomationExecutionResult,
  ArrivalDataValidationRules,
  ArrivalDataValidationResult,
  AdvancedContainerSearchParams
} from './operations';

// ============================================================================
// Réexports organisés par catégorie
// ============================================================================

// Types de base et enums
export * as ContainerEnums from './enums';

// Système de tracking des arrivées
export * as ArrivalTracking from './arrival-tracking';

// Dashboards et analyses
export * as ContainerDashboards from './dashboard';

// Opérations et workflows
export * as ContainerOperations from './operations';