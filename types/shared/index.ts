/**
 * Point d'entrée principal du module Shared - Version 2.0
 * Export hiérarchique de tous les types partagés modulaires
 * 
 * @module Shared
 * @version 2.0.0
 * @since 2025-01-06
 * @description Module shared refactorisé avec architecture modulaire
 */

// ============================================================================
// EXPORTS DIRECTS - Types les plus couramment utilisés
// ============================================================================

// Types de base et primitifs
export type {
  EntityId,
  Timestamp,
  CurrencyCode,
  CountryCode,
  LanguageCode,
  UUIDv4
} from './core';

// Métadonnées d'audit
export type {
  AuditMetadata,
  SimpleAuditInfo
} from './audit';

// Pagination standard
export type {
  PaginationParams,
  PaginationInfo,
  PaginatedResponse
} from './pagination';

// Filtres et tri
export type {
  Filter,
  FilterGroup,
  SortParam,
  FilterOperator
} from './filtering';

// Validation
export type {
  ValidationResult,
  ValidationError,
  SeverityLevel
} from './validation';

// Réponses API
export type {
  ApiResponse,
  ResponseStatus
} from './api';

// Suppression logique
export type {
  SoftDeletable,
  DeletionMetadata,
  SoftDeleteParams,
  BatchSoftDeleteParams,
  ConditionalDeleteParams
} from './soft-delete';

// ============================================================================
// EXPORTS MODULAIRES - Accès complet aux modules
// ============================================================================

// Module Core (types de base)
export * as Core from './core';

// Module Audit (métadonnées d'audit et performance)  
export * as Audit from './audit';

// Module Pagination (pagination et réponses paginées)
export * as Pagination from './pagination';

// Module Filtering (filtres, tri, recherche)
export * as Filtering from './filtering';

// Module Validation (validation et erreurs)
export * as Validation from './validation';

// Module API (réponses et statuts)
export * as API from './api';

// Module Events (événements système)
export * as Events from './events';

// Module Search (recherche avancée)
export * as Search from './search';

// Module SoftDelete (suppression logique)
export * as SoftDelete from './soft-delete';

// ============================================================================
// COLLECTIONS THÉMATIQUES - Regroupements logiques
// ============================================================================

/**
 * Types pour les enums et énumérations
 */
export const Enums = {
  Filtering: () => import('./filtering'),
  Validation: () => import('./validation'),
  API: () => import('./api')
} as const;

/**
 * Types pour les interfaces principales (entités métier)
 */
export const CoreTypes = {
  Identifiers: () => import('./core/identifiers'),
  Primitives: () => import('./core/primitives'),
  ValueObjects: () => import('./core/value-objects')
} as const;

/**
 * Types pour les opérations (CRUD, workflows, validation)
 */
export const Operations = {
  Search: () => import('./search'),
  SoftDelete: () => import('./soft-delete'),
  Events: () => import('./events')
} as const;

// ============================================================================
// LEGACY COMPATIBILITY - Rétrocompatibilité temporaire
// ============================================================================

/**
 * @deprecated Utilisez les nouveaux modules spécialisés à la place
 * Maintenus temporairement pour compatibilité
 */
export type {
  SystemEvent,
  EventHandler
} from './events';

// ============================================================================
// MÉTADONNÉES DU SYSTÈME DE TYPES
// ============================================================================

/**
 * Informations sur la version et structure du système de types
 */
export const SharedTypesMetadata = {
  version: '2.0.0',
  created: '2025-01-06',
  description: 'Système de types partagés modulaire pour l\'application NJILLU',
  
  modules: {
    core: {
      description: 'Types de base, primitifs et identifiants',
      files: ['identifiers', 'primitives', 'value-objects'],
      eliminations: ['Remplacement de tous les types any par des types stricts']
    },
    audit: {
      description: 'Métadonnées d\'audit et performance',
      files: ['metadata', 'performance']
    },
    pagination: {
      description: 'Système de pagination complet',
      files: ['params', 'info', 'response']
    },
    filtering: {
      description: 'Filtres, tri et recherche structurée',
      files: ['operators', 'filters', 'sorting']
    },
    validation: {
      description: 'Validation et gestion d\'erreurs',
      files: ['severity', 'errors', 'results']
    },
    api: {
      description: 'Réponses API standardisées',
      files: ['status', 'response']
    },
    events: {
      description: 'Système d\'événements et handlers',
      files: ['system-event', 'event-handler']
    },
    search: {
      description: 'Recherche avancée modulaire',
      files: ['configuration', 'queries', 'results', 'persistence']
    },
    softDelete: {
      description: 'Suppression logique et politiques de rétention',
      files: ['interfaces', 'operations', 'policies']
    }
  },
  
  // Statistiques (approximatives)
  statistics: {
    total_files: 24,
    total_modules: 9,
    total_interfaces: 120,
    total_types: 180,
    any_types_eliminated: 17,
    lines_of_code: 2800
  },
  
  improvements: [
    '100% élimination des types "any"',
    'Architecture modulaire avec séparation des responsabilités',
    'Types stricts avec contraintes génériques',
    'Documentation JSDoc complète',
    'Backward compatibility préservée'
  ]
} as const;