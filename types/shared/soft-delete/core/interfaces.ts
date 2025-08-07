/**
 * Interfaces de base pour soft delete
 * Types fondamentaux pour la suppression logique
 * 
 * @module Shared/SoftDelete/Core/Interfaces
 * @version 2.0.0
 * @since 2025-01-06
 */

import type { EntityId } from '../../core/identifiers';
import type { Timestamp } from '../../core/primitives';
import type { AuditMetadata } from '../../audit';

// ============================================================================
// Interfaces de base
// ============================================================================

/**
 * Interface pour les entités supportant la suppression logique
 */
export interface SoftDeletable {
  // Champs de suppression logique
  deleted_at?: Timestamp;
  deleted_by?: EntityId;
  is_deleted?: boolean;
  
  // Raison de suppression
  deletion_reason?: string;
  deletion_context?: Record<string, unknown>;
  
  // Métadonnées optionnelles
  can_be_restored?: boolean;
  permanent_deletion_at?: Timestamp;
}

/**
 * Métadonnées complètes de suppression
 */
export interface DeletionMetadata {
  // Informations de suppression
  deleted_at: Timestamp;
  deleted_by: EntityId;
  deletion_method: 'manual' | 'automatic' | 'cascade' | 'policy';
  deletion_reason: string;
  
  // Contexte de suppression
  deletion_context: {
    user_agent?: string;
    ip_address?: string;
    session_id?: string;
    request_id?: string;
    batch_id?: string;
  };
  
  // Informations de rétention
  retention_policy?: string;
  permanent_deletion_date?: Timestamp;
  can_be_restored: boolean;
  
  // Entités liées affectées
  cascade_deletions?: Array<{
    entity_type: string;
    entity_id: EntityId;
    relationship: string;
  }>;
}

/**
 * Historique de suppression et restauration
 */
export interface DeletionHistory {
  entity_id: EntityId;
  entity_type: string;
  
  // Historique des actions
  actions: Array<{
    action_type: 'deleted' | 'restored' | 'permanently_deleted';
    timestamp: Timestamp;
    performed_by: EntityId;
    reason?: string;
    metadata?: Record<string, unknown>;
  }>;
  
  // État actuel
  current_state: 'active' | 'soft_deleted' | 'permanently_deleted';
  deletion_count: number;
  restoration_count: number;
  
  // Métadonnées
  created_at: Timestamp;
  updated_at: Timestamp;
}