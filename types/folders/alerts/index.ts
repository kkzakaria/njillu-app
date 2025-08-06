/**
 * Point d'entrée unifié pour le système d'alertes modulaire
 * Exports de tous les types d'alertes avec compatibilité ascendante
 */

// ============================================================================
// CORE - Types de base
// ============================================================================
export type {
  BusinessImpact,
  ResolutionMethod,
  NotificationMethod,
  AffectedEntityType,
  ActionPriority,
  AffectedEntity,
  RecommendedAction,
  FolderAlert
} from './core';

// ============================================================================
// SPECIALIZED - Alertes spécialisées
// ============================================================================
export type {
  DeadlineType,
  ComplianceArea,
  DelayType,
  ImpactAssessment,
  BudgetCategory,
  PenaltyType,
  DownstreamImpact,
  PotentialPenalty,
  CostDriver,
  DeadlineAlert,
  ComplianceAlert,
  DelayAlert,
  CostAlert
} from './specialized';

// ============================================================================
// RULES - Système de règles
// ============================================================================
export type {
  TimeBasedCondition,
  ComparisonOperator,
  DataOperator,
  TimeBasedTrigger,
  DataCondition,
  EscalationRule,
  TriggerConditions,
  AlertConfig,
  NotificationConfig,
  AlertRule
} from './rules';

// ============================================================================
// ANALYTICS - Dashboard et métriques
// ============================================================================
export type {
  AlertTypePerformance,
  FolderWithMostAlerts,
  AlertDashboard,
  AlertMetrics
} from './analytics';

// ============================================================================
// OPERATIONS - CRUD
// ============================================================================
export type {
  AlertSortField,
  SortOrder,
  CreateAlertData,
  UpdateAlertData,
  AlertSearchParams
} from './operations';

// ============================================================================
// CONFIG - Configuration système
// ============================================================================
export type {
  Environment,
  AlertSystemConfig
} from './config';