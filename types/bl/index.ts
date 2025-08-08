/**
 * Module Bills of Lading (BL) - Point d'entrée principal
 * Export hiérarchique de tous les types BL
 */

// ============================================================================
// Enums et types de base
// ============================================================================
export type {
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
  ContainerHeightType
} from './enums';

// ============================================================================
// Interfaces principales
// ============================================================================
export type {
  PartyInfo,
  CompanyContactInfo,
  ContainerSpecialFeatures,
  ShippingCompany,
  ContainerType,
  BillOfLading,
  BLContainer,
  BLCargoDetail,
  BLFreightCharge
} from './core';

// ============================================================================
// Types pour les frais et charges
// ============================================================================
export type {
  ChargesSummaryByCurrency,
  BLStatistics,
  CreateFreightChargeData,
  AddStandardChargesParams,
  GetChargesParams
} from './charges';

// ============================================================================
// Types pour les vues et dashboard
// ============================================================================
export type {
  BLSummaryView,
  BLDetailView,
  BLDashboardView,
  BLSearchParams,
  BLSearchResults,
  BLGlobalStats,
  BLMonthlyReport,
  BLExportConfig,
  BLExportResult
} from './views';

// ============================================================================
// Types de base pour les opérations
// ============================================================================
export type {
  BLFieldValue,
  StatusChangeParams,
  AssignToFolderParams,
  AddChargesParams,
  UpdateShippingCompanyParams,
  BulkExportParams,
  BulkDeleteParams,
  BLBatchOperationParams
} from './parameters';

// ============================================================================
// Types pour les opérations CRUD
// ============================================================================
export type {
  CreateBLData,
  UpdateBLData,
  CreateBLContainerData,
  CreateCargoDetailData
} from './crud';

// ============================================================================
// Types pour les workflows
// ============================================================================
export type {
  BLStatusChangeData,
  BLStatusHistory,
  BLAvailableActions
} from './workflows';

// ============================================================================
// Types pour la validation
// ============================================================================
export type {
  BLValidationRules,
  BLValidationResult
} from './validation';

// ============================================================================
// Types pour les opérations en lot
// ============================================================================
export type {
  BLBatchOperation,
  BLBatchOperationResult
} from './batch';

// ============================================================================
// Types pour l'audit
// ============================================================================
export type {
  BLAuditEntry,
  BLAuditQuery
} from './audit';

// ============================================================================
// Types pour l'intégration
// ============================================================================
export type {
  BLIntegrationConfig,
  BLSyncResult
} from './integration';

// ============================================================================
// Réexports organisés par catégorie
// ============================================================================

// Types de base et enums
export * as BLEnums from './enums';

// Interfaces principales
export * as BLCore from './core';

// Gestion des frais
export * as BLCharges from './charges';

// Vues et affichages
export * as BLViews from './views';

// Paramètres et types de base pour opérations
export * as BLParameters from './parameters';

// Opérations CRUD
export * as BLCrud from './crud';

// Workflows et changements d'état
export * as BLWorkflows from './workflows';

// Validation
export * as BLValidation from './validation';

// Opérations en lot
export * as BLBatch from './batch';

// Audit et traçabilité
export * as BLAudit from './audit';

// Intégration API
export * as BLIntegration from './integration';