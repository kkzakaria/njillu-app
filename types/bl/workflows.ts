/**
 * Types pour les workflows et changements d'état des Bills of Lading
 * Gestion des transitions de statut, historique et actions disponibles
 * 
 * @module BL/Workflows
 * @version 2.0.0
 * @since 2025-01-06
 * 
 * Ce module gère le cycle de vie des Bills of Lading :
 * - Changements d'état avec validation (BLStatusChangeData)
 * - Historique des transitions (BLStatusHistory)
 * - Actions disponibles selon l'état (BLAvailableActions)
 * 
 * ## Workflow des statuts BL
 * ```
 * draft → issued → shipped → discharged → delivered
 *                     ↓
 *                 cancelled
 * ```
 * 
 * @example
 * ```typescript
 * import type { BLStatusChangeData, BLAvailableActions } from '@/types/bl/workflows';
 * 
 * // Changement de statut
 * const statusChange: BLStatusChangeData = {
 *   bl_id: 'bl-12345',
 *   new_status: 'shipped',
 *   reason: 'Vessel departed from port',
 *   notify_parties: true,
 *   effective_date: '2025-01-06T10:30:00Z'
 * };
 * ```
 */

import type { BLStatus } from './enums';

// ============================================================================
// Types pour les changements d'état
// ============================================================================

/**
 * Paramètres pour changer le statut d'un BL
 */
export interface BLStatusChangeData {
  bl_id: string;
  new_status: BLStatus;
  reason?: string;
  notes?: string;
  effective_date?: string;
  notify_parties?: boolean;
}

/**
 * Historique des changements de statut
 */
export interface BLStatusHistory {
  id: string;
  bl_id: string;
  previous_status: BLStatus;
  new_status: BLStatus;
  changed_by: string;
  changed_at: string;
  reason?: string;
  notes?: string;
}

/**
 * Actions possibles sur un BL selon son statut actuel
 */
export interface BLAvailableActions {
  bl_id: string;
  current_status: BLStatus;
  available_transitions: Array<{
    target_status: BLStatus;
    action_name: string;
    requires_confirmation: boolean;
    required_fields?: string[];
    validation_rules?: string[];
  }>;
  blocked_reasons?: string[];
}