/**
 * Types pour l'audit et la traçabilité des Bills of Lading
 * Historique des changements, requêtes d'audit et journalisation
 */

import type { BLFieldValue } from './parameters';

// ============================================================================
// Types pour l'audit et la traçabilité
// ============================================================================

/**
 * Entrée d'audit pour les BL
 */
export interface BLAuditEntry {
  id: string;
  bl_id: string;
  
  // Action effectuée
  action: 
    | 'created'
    | 'updated'
    | 'status_changed'
    | 'container_added'
    | 'container_removed'
    | 'charge_added'
    | 'charge_updated'
    | 'deleted'
    | 'restored';
  
  // Détails de l'action
  entity_type: 'bl' | 'container' | 'charge' | 'cargo_detail';
  entity_id?: string;
  
  // Changements
  old_values?: Record<string, BLFieldValue>;
  new_values?: Record<string, BLFieldValue>;
  
  // Métadonnées
  performed_by: string;
  performed_at: string;
  ip_address?: string;
  user_agent?: string;
  
  // Contexte business
  reason?: string;
  notes?: string;
  reference_number?: string;
}

/**
 * Paramètres pour requêter l'historique d'audit
 */
export interface BLAuditQuery {
  bl_ids?: string[];
  actions?: string[];
  entity_types?: string[];
  performed_by?: string[];
  date_from?: string;
  date_to?: string;
  
  // Pagination
  page?: number;
  page_size?: number;
  sort_by?: 'performed_at' | 'action' | 'performed_by';
  sort_order?: 'asc' | 'desc';
}