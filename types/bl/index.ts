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
// Types pour les opérations et workflows
// ============================================================================
export type {
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
} from './operations';

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

// Opérations et workflows
export * as BLOperations from './operations';