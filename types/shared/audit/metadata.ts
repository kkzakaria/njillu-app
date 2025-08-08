/**
 * Métadonnées d'audit pour le système
 * Traçabilité des créations, modifications, suppressions
 * 
 * @module Shared/Audit/Metadata
 * @version 2.0.0
 * @since 2025-01-06
 */

import type { EntityId } from '../core/identifiers';
import type { Timestamp } from '../core/primitives';

// ============================================================================
// Métadonnées d'audit principales
// ============================================================================

/**
 * Métadonnées d'audit complètes pour toute entité
 */
export interface AuditMetadata {
  // Création
  created_at: Timestamp;
  created_by?: EntityId;
  
  // Modification
  updated_at: Timestamp;
  updated_by?: EntityId;
  last_modified_at?: Timestamp;
  last_modified_by?: EntityId;
  
  // Version et contrôle de changement
  version?: number;
  revision_number?: number;
  change_sequence?: number;
  
  // Soft delete (voir soft-delete.ts pour détails)
  deleted_at?: Timestamp;
  deleted_by?: EntityId;
  is_deleted?: boolean;
}

/**
 * Métadonnées d'audit simplifiées pour les entités légères
 */
export interface SimpleAuditInfo {
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: EntityId;
  updated_by?: EntityId;
}

/**
 * Historique des modifications d'une entité
 */
export interface AuditTrail {
  entity_id: EntityId;
  entity_type: string;
  changes: Array<{
    changed_at: Timestamp;
    changed_by?: EntityId;
    change_type: 'created' | 'updated' | 'deleted' | 'restored';
    field_changes?: Record<string, {
      old_value: unknown;
      new_value: unknown;
    }>;
    metadata?: Record<string, string | number | boolean>;
  }>;
}

/**
 * Informations de traçabilité pour les opérations
 */
export interface AuditContext {
  user_id?: EntityId;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  operation: string;
  timestamp: Timestamp;
  request_id?: string;
}