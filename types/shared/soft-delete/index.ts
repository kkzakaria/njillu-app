/**
 * Point d'entrée du module SoftDelete
 * Export de tous les types de suppression logique
 * 
 * @module Shared/SoftDelete
 * @version 2.0.0
 * @since 2025-01-06
 */

// Interfaces de base
export type {
  SoftDeletable,
  DeletionMetadata,
  DeletionHistory
} from './core/interfaces';

// Paramètres d'opérations
export type {
  SoftDeleteParams,
  BatchSoftDeleteParams,
  ConditionalDeleteParams
} from './operations/delete-params';

// Politiques de rétention
export type {
  RetentionPolicy,
  CleanupSchedule
} from './policies/retention-policy';