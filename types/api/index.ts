/**
 * Types pour les APIs - Point d'entrée principal
 * Centralisation des types pour toutes les APIs du projet
 * 
 * @module Types/API
 * @version 1.0.0
 * @since 2025-01-22
 */

// ============================================================================
// Folders API Types
// ============================================================================
export type {
  FolderUpdateData,
  StageUpdateData,
  ContainerUpdateData,
  ContainerWithType,
  ArrivalStatusSummary,
  ContainerTypeSummary,
  StatsData,
  FolderStatEntry,
  ContainerBatchUpdate,
  UpdateOptions
} from './folders';

export {
  isContainerWithType,
  isFolderStatEntry,
  createSafeUpdateData
} from './folders';

// ============================================================================
// Future API Types (placeholders)
// ============================================================================

// TODO: Ajouter d'autres types API au fur et à mesure
// export type {} from './bills-of-lading';
// export type {} from './clients';
// export type {} from './users';