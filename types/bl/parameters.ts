/**
 * Types de base pour les valeurs et paramètres des opérations BL
 * Unions, paramètres d'opérations, types fondamentaux
 * 
 * @module BL/Parameters
 * @version 2.0.0
 * @since 2025-01-06
 * 
 * Ce module contient :
 * - Type union BLFieldValue pour les valeurs dans l'audit
 * - Paramètres spécialisés pour chaque type d'opération en lot
 * - Union discriminée des paramètres d'opérations
 * 
 * @example
 * ```typescript
 * import type { BLFieldValue, StatusChangeParams } from '@/types/bl/parameters';
 * 
 * // Utilisation des paramètres
 * const params: StatusChangeParams = {
 *   new_status: 'shipped',
 *   reason: 'Vessel departed',
 *   notify_parties: true
 * };
 * ```
 */

import type {
  BLStatus,
  FreightTerms,
  LoadingMethod,
  ChargeType,
  PaymentStatus
} from './enums';

import type { PartyInfo } from './core';

// ============================================================================
// Types de base pour les valeurs
// ============================================================================

/**
 * Type union pour les valeurs des champs BL dans l'audit et les opérations
 * 
 * Utilisé pour typer les changements dans l'audit trail et les opérations
 * sur les Bills of Lading. Supporte tous les types de valeurs possibles
 * dans les champs BL.
 * 
 * @example
 * ```typescript
 * const auditChange: Record<string, BLFieldValue> = {
 *   status: 'shipped',           // BLStatus
 *   issue_date: new Date(),      // Date
 *   shipper_info: {              // PartyInfo
 *     name: 'ACME Corp',
 *     address: '123 Main St'
 *   },
 *   total_packages: 42,          // number
 *   is_consolidated: true        // boolean
 * };
 * ```
 */
export type BLFieldValue = 
  | string 
  | number 
  | boolean 
  | Date 
  | null 
  | PartyInfo 
  | FreightTerms 
  | BLStatus 
  | LoadingMethod 
  | ChargeType 
  | PaymentStatus;

// ============================================================================
// Paramètres pour opérations en lot
// ============================================================================

/**
 * @section Paramètres d'opérations en lot
 * 
 * Cette section définit les paramètres spécialisés pour chaque type
 * d'opération en lot disponible dans le système BL.
 * 
 * Chaque interface de paramètres correspond à un type d'opération :
 * - StatusChangeParams : Changement de statut groupé
 * - AssignToFolderParams : Assignation à un dossier
 * - AddChargesParams : Ajout de frais en masse
 * - UpdateShippingCompanyParams : Changement de compagnie maritime
 * - BulkExportParams : Configuration d'export en lot
 * - BulkDeleteParams : Suppression groupée
 */

/**
 * Paramètres pour changement de statut en lot
 */
export interface StatusChangeParams {
  new_status: BLStatus;
  reason?: string;
  notes?: string;
  effective_date?: string;
  notify_parties?: boolean;
}

/**
 * Paramètres pour assignation à un dossier en lot
 */
export interface AssignToFolderParams {
  folder_id: string;
  overwrite_existing?: boolean;
  reason?: string;
}

/**
 * Paramètres pour ajout de frais en lot
 */
export interface AddChargesParams {
  charges: Array<{
    charge_type: ChargeType;
    amount: number;
    currency: string;
    description?: string;
  }>;
  apply_to_all?: boolean;
}

/**
 * Paramètres pour mise à jour de compagnie maritime en lot
 */
export interface UpdateShippingCompanyParams {
  new_shipping_company_id: string;
  reason?: string;
  update_related_charges?: boolean;
}

/**
 * Paramètres pour export en lot
 */
export interface BulkExportParams {
  format: 'excel' | 'csv' | 'pdf';
  include_containers?: boolean;
  include_charges?: boolean;
  include_cargo_details?: boolean;
  template_id?: string;
}

/**
 * Paramètres pour suppression en lot
 */
export interface BulkDeleteParams {
  soft_delete?: boolean;
  reason: string;
  cascade_containers?: boolean;
  cascade_charges?: boolean;
}

/**
 * Type union pour tous les paramètres d'opérations BL en lot
 * 
 * Union discriminée permettant de typer de manière sûre les paramètres
 * selon le type d'opération en lot à effectuer. Le TypeScript inférera
 * automatiquement le bon type de paramètres selon le contexte.
 * 
 * @example
 * ```typescript
 * // Type safety automatique selon operation_type
 * const batchOp: BLBatchOperation = {
 *   operation_type: 'status_change',
 *   bl_ids: ['bl-1', 'bl-2'],
 *   parameters: {
 *     // TypeScript sait que c'est StatusChangeParams
 *     new_status: 'shipped',
 *     reason: 'Vessel departed',
 *     notify_parties: true
 *   },
 *   continue_on_error: false,
 *   notify_on_completion: true
 * };
 * ```
 * 
 * @see BLBatchOperation pour l'utilisation complète
 */
export type BLBatchOperationParams = 
  | StatusChangeParams
  | AssignToFolderParams
  | AddChargesParams
  | UpdateShippingCompanyParams
  | BulkExportParams
  | BulkDeleteParams;