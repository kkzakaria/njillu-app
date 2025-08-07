/**
 * Module Containers - Point d'entrée principal
 * Export hiérarchique de tous les types de gestion des conteneurs et arrivées
 * 
 * @module Containers
 * @version 2.0.0
 * @since 2025-01-06
 */

// ============================================================================
// Enums et types de base
// ============================================================================
export type {
  ContainerArrivalStatus,
  ArrivalUrgency,
  DelaySeverity,
  ContainerUrgencyLevel,
  ContainerHealthStatus,
  AlertPriority,
  NotificationChannel
} from './enums';

export type {
  ContainerFieldValue,
  ConditionValue,
  AutomationActionConfig,
  AutomationOutput,
  ValidationCorrection
} from './base-types';

// ============================================================================
// Système de suivi des arrivées - Core
// ============================================================================
export type {
  ContainerArrivalTracking,
  ContainerArrivalHistory
} from './tracking-core';

export type {
  UpdateArrivalData,
  ArrivalTrackingSearchParams,
  UpdateTrackingResult,
  BulkTrackingOperation
} from './tracking-operations';

// ============================================================================
// Métriques et performance
// ============================================================================
export type {
  ArrivalPerformanceMetrics,
  ContainerPerformanceInsights
} from './metrics';

// ============================================================================
// Système d'alertes
// ============================================================================
export type {
  ContainerDelayAlert,
  MissingETAAlert,
  AlertThresholds
} from './alerts';

// ============================================================================
// Notifications et communications
// ============================================================================
export type {
  ArrivalNotificationConfig,
  NotificationHistory,
  NotificationTemplate
} from './notifications';

// ============================================================================
// Opérations CRUD
// ============================================================================
export type {
  CreateArrivalTrackingData,
  BatchUpdateArrivalData,
  BatchOperationResult
} from './crud';

// ============================================================================
// Intégrations avec systèmes externes
// ============================================================================
export type {
  ShippingLineIntegration,
  SyncResult
} from './integration';

// ============================================================================
// Automatisation et règles métier
// ============================================================================
export type {
  ArrivalAutomationRule,
  AutomationExecutionResult
} from './automation';

// ============================================================================
// Validation et contrôle qualité
// ============================================================================
export type {
  ArrivalDataValidationRules,
  ArrivalDataValidationResult
} from './validation';

// ============================================================================
// Recherche et filtrage avancés
// ============================================================================
export type {
  AdvancedContainerSearchParams
} from './search';

// ============================================================================
// Workflows et transitions d'état
// ============================================================================
export type {
  StatusTransition,
  AvailableActions,
  WorkflowActionResult
} from './workflows';

// ============================================================================
// Opérations en lot et traitement groupé
// ============================================================================
export type {
  BatchConfiguration,
  ExtendedBatchResult
} from './batch';

// ============================================================================
// Dashboards et vues analytiques
// ============================================================================
export type {
  ContainerArrivalDashboard,
  ManagerDashboardView,
  OperatorDashboardView,
  ClientDashboardView,
  PerformanceAnalysisView,
  CostImpactAnalysis
} from './dashboards';

export type {
  WidgetConfiguration,
  DashboardFilters,
  CachedDashboardData,
  NavigationDetails,
  ChartConfig,
  TableConfig,
  MapConfig,
  ThresholdConfig,
  InteractionConfig,
  DateRangeFilter,
  StatusFilter,
  CompanyFilter,
  LocationFilter,
  UrgencyFilter,
  CustomFilter,
  TrendData,
  DashboardSummary,
  DashboardConfiguration,
  DashboardSession,
  AlertThresholdType,
  AlertThresholdOverrides
} from './dashboard-types';

// ============================================================================
// Réexports organisés par catégorie
// ============================================================================

/**
 * Énumérations et types de base
 * @namespace
 */
export * as ContainerEnums from './enums';

/**
 * Types union et utilitaires de base
 * @namespace
 */
export * as BaseTypes from './base-types';

/**
 * Système de tracking core
 * @namespace
 */
export * as TrackingCore from './tracking-core';

/**
 * Opérations sur le tracking
 * @namespace
 */
export * as TrackingOps from './tracking-operations';

/**
 * Métriques et analyses de performance
 * @namespace
 */
export * as Metrics from './metrics';

/**
 * Système d'alertes
 * @namespace
 */
export * as Alerts from './alerts';

/**
 * Notifications et communications
 * @namespace
 */
export * as Notifications from './notifications';

/**
 * Opérations CRUD de base
 * @namespace
 */
export * as CRUD from './crud';

/**
 * Intégrations avec systèmes externes
 * @namespace
 */
export * as Integration from './integration';

/**
 * Automatisation et règles métier
 * @namespace
 */
export * as Automation from './automation';

/**
 * Validation et contrôle qualité
 * @namespace
 */
export * as Validation from './validation';

/**
 * Recherche et filtrage avancés
 * @namespace
 */
export * as Search from './search';

/**
 * Workflows et transitions d'état
 * @namespace
 */
export * as Workflows from './workflows';

/**
 * Opérations en lot et traitement groupé
 * @namespace
 */
export * as Batch from './batch';

/**
 * Dashboards et vues analytiques
 * @namespace
 */
export * as Dashboards from './dashboards';

/**
 * Configuration des widgets de dashboard
 * @namespace
 */
export * as DashboardTypes from './dashboard-types';

// ============================================================================
// Types utilitaires pour développeurs
// ============================================================================

import type {
  ContainerDelayAlert,
  MissingETAAlert
} from './alerts';

import type {
  ContainerArrivalDashboard,
  ManagerDashboardView,
  OperatorDashboardView,
  ClientDashboardView,
  PerformanceAnalysisView,
  CostImpactAnalysis
} from './dashboards';

import type {
  BatchOperationResult
} from './crud';

import type {
  ExtendedBatchResult
} from './batch';

import type {
  UpdateTrackingResult
} from './tracking-operations';

import type {
  WorkflowActionResult
} from './workflows';

import type {
  AutomationExecutionResult
} from './automation';

/**
 * Union de tous les types d'alertes du système
 */
export type ContainerAlert = ContainerDelayAlert | MissingETAAlert;

/**
 * Union de toutes les vues de dashboard disponibles
 */
export type DashboardView = 
  | ContainerArrivalDashboard
  | ManagerDashboardView
  | OperatorDashboardView
  | ClientDashboardView
  | PerformanceAnalysisView
  | CostImpactAnalysis;

/**
 * Union de tous les résultats d'opération
 */
export type OperationResult = 
  | BatchOperationResult
  | ExtendedBatchResult
  | UpdateTrackingResult
  | WorkflowActionResult
  | AutomationExecutionResult;

/**
 * Informations de version du module
 * @readonly
 */
export const CONTAINER_TYPES_VERSION = {
  version: '2.0.0',
  release_date: '2025-01-06',
  modules_count: 14,
  types_count: 75,
  breaking_changes: 'Élimination complète des types "any", architecture modulaire'
} as const;