/**
 * WRAPPER DE COMPATIBILITÉ BACKWARD
 * 
 * Ce fichier maintient la compatibilité avec l'ancien système de types monolithique.
 * Il réexporte tous les types depuis les nouveaux modules modulaires.
 * 
 * ⚠️  DEPRECATED - Ce fichier sera supprimé dans une version future
 * 
 * Migration recommandée :
 * - Remplacer `import { Type } from './types/bl.types'` 
 * - Par `import { Type } from './types'` ou `import { Type } from './types/bl'`
 */

// ============================================================================
// RÉEXPORTS DEPUIS LES NOUVEAUX MODULES
// ============================================================================

// Bills of Lading - Module principal
export type {
  // Enums BL
  BLStatus,
  FreightTerms,
  LoadingMethod,
  ChargeType,
  ChargeCategory,
  CalculationBasis,
  PaidBy,
  PaymentStatus,
  ShippingCompanyStatus,
  ContainerCategory,
  ContainerHeightType,

  // Interfaces principales BL
  PartyInfo,
  CompanyContactInfo,
  ContainerSpecialFeatures,
  ShippingCompany,
  ContainerType,
  BillOfLading,
  BLContainer,
  BLCargoDetail,
  BLFreightCharge,

  // Types pour les charges
  ChargesSummaryByCurrency,
  BLStatistics,
  CreateFreightChargeData,
  AddStandardChargesParams,
  GetChargesParams,

  // Vues et dashboard BL
  BLSummaryView,
  BLDetailView,
  BLDashboardView,
  BLSearchParams,
  BLSearchResults,
  BLGlobalStats,
  BLMonthlyReport,
  BLExportConfig,
  BLExportResult,

  // Opérations BL
  CreateBLData,
  UpdateBLData,
  CreateBLContainerData,
  CreateCargoDetailData,
  BLStatusChangeData,
  BLStatusHistory,
  BLAvailableActions,
  BLValidationRules,
  BLValidationResult,
  BLBatchOperation,
  BLBatchOperationResult,
  BLAuditEntry,
  BLAuditQuery,
  BLIntegrationConfig,
  BLSyncResult
} from './bl';

// Folders - Types de dossiers
export type {
  // Enums Folders
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
  OperationType,

  // Interfaces principales Folders
  ClientInfo,
  LocationInfo,
  FinancialInfo,
  AuditMetadata,
  // Core types
  Folder,
  FolderBLRelation,
  FolderDocument,
  FolderActivity,

  // Système d'alertes
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
  AlertSearchParams,

  // Opérations Folders
  CreateFolderData,
  UpdateFolderData,
  FolderStatusTransition,
  FolderAvailableActions,
  FolderProgress,
  FolderBatchOperation,
  FolderBatchOperationResult,
  FolderSearchParams,
  FolderSearchResults
} from './folders';

// Containers - Types de conteneurs et arrivées
export type {
  // Enums Containers
  ContainerArrivalStatus,
  ArrivalUrgency,
  DelaySeverity,
  ContainerUrgencyLevel,
  ContainerHealthStatus,

  // Suivi des arrivées
  ContainerArrivalTracking,
  ContainerArrivalHistory,
  ArrivalPerformanceMetrics,
  ArrivalRealTimeIndicators,
  ContainerDelayAlert,
  MissingETAAlert,
  ArrivalNotificationConfig,
  ArrivalNotificationHistory,
  UpdateArrivalData,
  ArrivalTrackingSearchParams,

  // Dashboards containers
  ContainerArrivalDashboard,
  ManagerDashboardView,
  OperatorDashboardView,
  ClientDashboardView,
  PerformanceAnalysisView,
  CostImpactAnalysis,
  DashboardConfiguration,
  DashboardSession,

  // Opérations containers
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
} from './containers';

// Shared - Types partagés
export type {
  // Types de base
  EntityId,
  Timestamp,
  CurrencyCode,
  CountryCode,
  LanguageCode,
  SimpleAuditInfo,
  PerformanceMetadata,

  // Pagination et tri
  PaginationParams,
  PaginationInfo,
  PaginatedResponse,
  SortDirection,
  SortParam,
  SortOptions,

  // Filtres et recherche
  FilterOperator,
  Filter,
  FilterGroup,
  TextSearchQuery,
  StructuredSearchQuery,
  CombinedSearchQuery,
  SearchParams,
  SearchResponse,
  SavedSearch,

  // Validation et erreurs
  SeverityLevel,
  ValidationError,
  ValidationResult,
  ResponseStatus,
  ApiResponse,

  // Soft delete
  SoftDeletable,
  DeletionMetadata,
  DeletionHistory,
  SoftDeleteParams,
  SoftDeleteResult,
  RestoreParams,
  RestoreResult,
  RetentionPolicy,
  CleanupSchedule,

  // Types utilitaires
  Optional,
  RequireFields,
  UserId,
  FolderId,
  BLId,
  ContainerId,
  CompanyId
} from './shared';

// ============================================================================
// CONSTANTES ET HELPERS LEGACY
// ============================================================================

/**
 * @deprecated Utiliser les enums directement depuis les modules
 */
export const BL_STATUSES = [
  'draft',
  'issued', 
  'shipped',
  'discharged',
  'delivered',
  'cancelled'
] as const;

/**
 * @deprecated Utiliser les enums directement depuis les modules
 */
export const FOLDER_STATUSES = [
  'open',
  'processing',
  'completed',
  'closed',
  'on_hold',
  'cancelled'
] as const;

/**
 * @deprecated Utiliser les enums directement depuis les modules
 */
export const CONTAINER_ARRIVAL_STATUSES = [
  'scheduled',
  'delayed',
  'arrived',
  'early',
  'cancelled'
] as const;

// ============================================================================
// TYPES LEGACY SPÉCIFIQUES (si nécessaires)
// ============================================================================

/**
 * @deprecated Type legacy pour compatibilité
 * Utiliser BillOfLading depuis le module bl
 */
export type BL = import('./bl/core').BillOfLading;

/**
 * @deprecated Type legacy pour compatibilité  
 * Utiliser Folder depuis le module folders
 */
export type FolderLegacy = import('./folders/core').Folder;

/**
 * @deprecated Type legacy pour compatibilité
 * Utiliser ContainerArrivalTracking depuis le module containers
 */
export type ContainerTracking = import('./containers/arrival-tracking').ContainerArrivalTracking;

// ============================================================================
// FONCTIONS UTILITAIRES LEGACY
// ============================================================================

/**
 * @deprecated Fonction legacy pour validation BL
 * Utiliser les nouveaux validateurs depuis BLOperations
 */
export function validateBL(bl: any): boolean {
  console.warn('validateBL is deprecated. Use validation from BL operations module');
  return bl && typeof bl.id === 'string' && typeof bl.bl_number === 'string';
}

/**
 * @deprecated Fonction legacy pour validation Folder
 * Utiliser les nouveaux validateurs depuis FolderOperations
 */
export function validateFolder(folder: any): boolean {
  console.warn('validateFolder is deprecated. Use validation from Folder operations module');
  return folder && typeof folder.id === 'string' && typeof folder.folder_number === 'string';
}

// ============================================================================
// MESSAGES D'AVERTISSEMENT
// ============================================================================

if (typeof console !== 'undefined' && console.warn) {
  console.warn(
    '⚠️  ATTENTION: Vous utilisez le système de types legacy (bl.types.ts).\n' +
    '   Ce fichier sera supprimé dans une version future.\n' +
    '   Veuillez migrer vers les nouveaux modules:\n' +
    '   - import { BillOfLading } from "./types/bl"\n' +
    '   - import { Folder } from "./types/folders"\n' +
    '   - import { ContainerArrivalTracking } from "./types/containers"\n' +
    '   - import { CommonTypes } from "./types/shared"\n' +
    '   Ou utiliser l\'import principal:\n' +
    '   - import { BillOfLading, Folder } from "./types"'
  );
}

// ============================================================================
// EXPORT DEFAULT POUR COMPATIBILITÉ
// ============================================================================

/**
 * Export par défaut pour compatibilité avec les imports `import bl from ...`
 */
const legacyExport = {
  // Modules principaux
  BL: () => import('./bl'),
  Folders: () => import('./folders'), 
  Containers: () => import('./containers'),
  Shared: () => import('./shared'),
  
  // Constantes legacy
  BL_STATUSES,
  FOLDER_STATUSES,
  CONTAINER_ARRIVAL_STATUSES,
  
  // Fonctions legacy
  validateBL,
  validateFolder,
  
  // Métadonnées
  _deprecated: true,
  _migrationGuide: 'https://docs.njillu.com/migration/types-v2',
  _version: '1.0.0-legacy'
};

export default legacyExport;