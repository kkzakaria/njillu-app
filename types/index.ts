/**
 * Point d'entrée principal du système de types modulaire
 * Export hiérarchique de tous les modules de types
 * 
 * Architecture modulaire :
 * - bl/          → Bills of Lading
 * - folders/     → Gestion des dossiers
 * - containers/  → Suivi des conteneurs et arrivées
 * - shared/      → Types communs et utilitaires
 */

// ============================================================================
// EXPORTS DIRECTS - Types les plus couramment utilisés
// ============================================================================

// Types de base partagés (architecture modulaire v2.0)
export type {
  EntityId,
  Timestamp,
  CurrencyCode,
  CountryCode,
  LanguageCode,
  AuditMetadata,
  PaginationParams,
  PaginationInfo,
  PaginatedResponse,
  SortParam,
  Filter,
  FilterGroup,
  ValidationResult,
  ApiResponse
} from './shared';

// Interfaces principales Bills of Lading
export type {
  BillOfLading,
  BLContainer,
  BLFreightCharge,
  ShippingCompany,
  ContainerType,
  PartyInfo
} from './bl/core';

export type {
  BLStatus,
  FreightTerms,
  LoadingMethod,
  ChargeType,
  PaymentStatus
} from './bl/enums';

// Interfaces principales Folders
export type {
  Folder
} from './folders/core';

export type {
  FolderAlert
} from './folders/alerts';

export type {
  ClientInfo,
  LocationInfo,
  FinancialInfo
} from './folders/entities';

export type {
  FolderStatus,
  FolderType,
  FolderPriority,
  ProcessingStage,
  AlertType,
  AlertSeverity
} from './folders/constants';

// Interfaces principales Containers
export type {
  ContainerArrivalTracking
} from './containers/tracking-core';

export type {
  ArrivalPerformanceMetrics
} from './containers/metrics';

export type {
  ContainerArrivalDashboard
} from './containers/dashboards';

export type {
  ContainerArrivalStatus,
  ArrivalUrgency,
  ContainerHealthStatus
} from './containers/enums';

// Système de soft delete (architecture modulaire v2.0)
export type {
  SoftDeletable,
  DeletionMetadata,
  SoftDeleteParams,
  ConditionalDeleteParams
} from './shared';

// Système List-Detail Layout (responsive UI/UX)
export type {
  ListViewItem,
  ListViewResponse,
  ListItemBadge,
  ListItemAction,
  DetailViewData,
  DetailViewActivity,
  DetailViewTab,
  DetailViewRelated,
  ListDetailLayoutConfig,
  ListApiParams,
  DetailApiParams,
  BulkOperationParams,
  SearchSuggestion,
  ListViewAggregates,
  ListViewFacet,
  LayoutMode,
  CacheConfig,
  PerformanceMetrics
} from './shared';

// ============================================================================
// EXPORTS MODULAIRES - Accès complet aux modules
// ============================================================================

// Module Bills of Lading complet
export * as BL from './bl';
export * as BillsOfLading from './bl';

// Module Folders complet
export * as Folders from './folders';
export * as Dossiers from './folders';

// Module Containers complet
export * as Containers from './containers';
export * as Conteneurs from './containers';

// Module Shared complet
export * as Shared from './shared';
export * as Commun from './shared';

// ============================================================================
// EXPORTS SPÉCIALISÉS - Accès direct aux sous-modules
// ============================================================================

// Sous-modules Bills of Lading
export * as BLEnums from './bl/enums';
export * as BLCore from './bl/core';
export * as BLCharges from './bl/charges';
export * as BLViews from './bl/views';
// Note: bl/operations.ts a été décomposé en modules spécialisés
export * as BLOperations from './bl';

// Sous-modules Folders
export * as FolderEnums from './folders/constants';
export * as FolderCore from './folders/core';
export * as FolderEntities from './folders/entities';
export * as FolderWorkflow from './folders/workflow';
export * as FolderAlerts from './folders/alerts';
export * as FolderOperations from './folders/operations';

// Sous-modules Containers
export * as ContainerEnums from './containers/enums';
export * as TrackingCore from './containers/tracking-core';
export * as ContainerDashboards from './containers/dashboards';
// Note: containers modules ont été décomposés en architecture modulaire
export * as ContainerOperations from './containers';

// Sous-modules Shared (architecture modulaire v2.0)
export * as SharedCore from './shared/core';
export * as SharedAudit from './shared/audit';
export * as SharedPagination from './shared/pagination';
export * as SharedFiltering from './shared/filtering';
export * as SharedValidation from './shared/validation';
export * as SharedAPI from './shared/api';
export * as SharedEvents from './shared/events';
export * as SharedSearch from './shared/search';
export * as SharedSoftDelete from './shared/soft-delete';

// ============================================================================
// COLLECTIONS THÉMATIQUES - Regroupements logiques
// ============================================================================

/**
 * Types pour les enums (statuts, catégories, etc.)
 */
export const Enums = {
  BL: () => import('./bl/enums'),
  Folders: () => import('./folders/constants'),
  Containers: () => import('./containers/enums')
} as const;

/**
 * Types pour les interfaces principales (entités métier)
 */
export const Core = {
  BL: () => import('./bl/core'),
  Folders: () => import('./folders/core'),
  Containers: () => import('./containers/tracking-core'),
  Shared: () => import('./shared')
} as const;

/**
 * Types pour les opérations (CRUD, workflows, validation)
 */
export const Operations = {
  BL: () => import('./bl'),
  Folders: () => import('./folders/operations'),
  Containers: () => import('./containers')
} as const;

/**
 * Types pour les vues et dashboards
 */
export const Views = {
  BL: () => import('./bl/views'),
  Containers: () => import('./containers/dashboards')
} as const;

/**
 * Types pour les systèmes spécialisés
 */
export const Systems = {
  Alerts: () => import('./folders/alerts'),
  Charges: () => import('./bl/charges'),
  SoftDelete: () => import('./shared/soft-delete'),
  Search: () => import('./shared/search')
} as const;

// ============================================================================
// UTILITAIRES DE TYPE - Helpers et types dérivés
// ============================================================================

/**
 * Union de tous les IDs d'entité principaux
 */
export type MainEntityId = 
  | string  // BillOfLading['id']
  | string  // Folder['id'] 
  | string  // BLContainer['id']
  | string; // ContainerArrivalTracking['container_id']

/**
 * Union de tous les statuts principaux
 */
export type MainEntityStatus = 
  | import('./bl/enums').BLStatus
  | import('./folders/constants').FolderStatus
  | import('./containers/enums').ContainerArrivalStatus;

/**
 * Types d'entité supportés dans le système
 */
export type EntityType = 
  | 'bill_of_lading'
  | 'bl_container'
  | 'bl_freight_charge'
  | 'shipping_company'
  | 'container_type'
  | 'folder'
  | 'folder_alert'
  | 'folder_document'
  | 'container_arrival_tracking';

/**
 * Mapping entre types d'entité et leurs interfaces
 */
export interface EntityTypeMap {
  bill_of_lading: import('./bl/core').BillOfLading;
  bl_container: import('./bl/core').BLContainer;
  bl_freight_charge: import('./bl/charges').BLFreightCharge;
  shipping_company: import('./bl/core').ShippingCompany;
  container_type: import('./bl/core').ContainerType;
  folder: import('./folders/core').Folder;
  folder_alert: import('./folders/alerts').FolderAlert;
  folder_document: import('./folders/core').FolderDocument;
  container_arrival_tracking: import('./containers/tracking-core').ContainerArrivalTracking;
}

/**
 * Helper pour obtenir le type d'une entité
 */
export type GetEntityType<T extends EntityType> = EntityTypeMap[T];

/**
 * Helper pour obtenir l'union de tous les types d'entité
 */
export type AnyEntity = EntityTypeMap[EntityType];

// ============================================================================
// MÉTADONNÉES DU SYSTÈME DE TYPES
// ============================================================================

/**
 * Informations sur la version et structure du système de types
 */
export const TypeSystemMetadata = {
  version: '2.0.0',
  created: '2025-08-04',
  description: 'Système de types modulaire pour l\'application NJILLU',
  
  modules: {
    bl: {
      description: 'Bills of Lading - Gestion des connaissements maritimes',
      files: ['enums', 'core', 'charges', 'views', 'operations'],
      entities: ['BillOfLading', 'BLContainer', 'BLFreightCharge', 'ShippingCompany', 'ContainerType']
    },
    folders: {
      description: 'Folders - Système de gestion des dossiers',
      files: ['enums', 'core', 'alerts', 'operations'],
      entities: ['Folder', 'FolderAlert', 'FolderDocument', 'FolderActivity']
    },
    containers: {
      description: 'Containers - Suivi des arrivées de conteneurs',
      files: ['enums', 'arrival-tracking', 'dashboard', 'operations'],
      entities: ['ContainerArrivalTracking', 'ContainerDelayAlert', 'ArrivalPerformanceMetrics']
    },
    shared: {
      description: 'Shared - Types communs et utilitaires système (architecture modulaire v2.0)',
      files: ['core', 'audit', 'pagination', 'filtering', 'validation', 'api', 'events', 'search', 'soft-delete'],
      entities: ['EntityId', 'AuditMetadata', 'PaginatedResponse', 'Filter', 'ValidationResult', 'ApiResponse', 'SearchParams', 'SoftDeletable']
    }
  },
  
  // Statistiques (approximatives)
  statistics: {
    total_files: 40,
    total_interfaces: 240,
    total_enums: 65,
    total_types: 350,
    lines_of_code: 7300
  }
} as const;

// ============================================================================
// VALIDATION DU SYSTÈME DE TYPES
// ============================================================================

/**
 * Fonction utilitaire pour valider qu'un objet respecte une interface donnée
 * Utilisée principalement pour le debugging et les tests
 */
export function validateEntity<T extends EntityType>(
  entityType: T,
  data: unknown
): data is GetEntityType<T> {
  // Implémentation basique - pourrait être étendue avec une vraie validation
  return typeof data === 'object' && data !== null && 'id' in data;
}

/**
 * Type guard pour vérifier qu'un statut appartient à un type d'entité
 */
export function isValidStatus<T extends MainEntityStatus>(
  status: unknown,
  validStatuses: readonly T[]
): status is T {
  return typeof status === 'string' && validStatuses.includes(status as T);
}