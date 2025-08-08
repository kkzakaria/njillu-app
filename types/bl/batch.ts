/**
 * Types pour les opérations en lot sur les Bills of Lading
 * Traitement groupé, résultats et métriques de performance
 */

import type { BLBatchOperationParams } from './parameters';

// ============================================================================
// Types pour les opérations en lot
// ============================================================================

/**
 * Opération en lot sur plusieurs BL
 */
export interface BLBatchOperation {
  operation_type: 
    | 'status_change'
    | 'assign_to_folder'
    | 'add_charges'
    | 'update_shipping_company'
    | 'bulk_export'
    | 'bulk_delete';
  
  bl_ids: string[];
  parameters: BLBatchOperationParams;
  
  // Options de traitement
  continue_on_error: boolean;
  notify_on_completion: boolean;
  
  // Validation
  dry_run?: boolean; // Simulation sans modification
}

/**
 * Résultat d'une opération en lot
 */
export interface BLBatchOperationResult {
  operation_id: string;
  started_at: string;
  completed_at?: string;
  
  total_items: number;
  processed_items: number;
  successful_items: number;
  failed_items: number;
  
  results: Array<{
    bl_id: string;
    success: boolean;
    error_message?: string;
    warnings?: string[];
  }>;
  
  summary: {
    processing_time_ms: number;
    average_time_per_item: number;
    performance_metrics?: Record<string, number>;
  };
}