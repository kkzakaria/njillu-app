/**
 * Types pour la validation des Bills of Lading
 * Règles de validation, résultats et configuration
 * 
 * @module BL/Validation
 * @version 2.0.0
 * @since 2025-01-06
 * 
 * Ce module fournit :
 * - Configuration des règles de validation (BLValidationRules)
 * - Résultats détaillés de validation (BLValidationResult)
 * - Support pour validation business et technique
 * 
 * @example
 * ```typescript
 * import type { BLValidationResult } from '@/types/bl/validation';
 * 
 * const validationResult: BLValidationResult = {
 *   is_valid: false,
 *   errors: [{
 *     field: 'shipper_info.name',
 *     code: 'REQUIRED_FIELD',
 *     message: 'Le nom de l\'expéditeur est obligatoire',
 *     severity: 'error'
 *   }],
 *   completeness_score: 85,
 *   missing_required_fields: ['shipper_info.name'],
 *   suggested_improvements: ['Vérifier les informations de contact']
 * };
 * ```
 */

// ============================================================================
// Types pour la validation des BL
// ============================================================================

/**
 * Règles de validation pour un BL
 */
export interface BLValidationRules {
  bl_number: {
    required: boolean;
    format_pattern?: string;
    uniqueness_check: boolean;
  };
  parties: {
    require_shipper: boolean;
    require_consignee: boolean;
    require_notify_party?: boolean;
    validate_addresses: boolean;
  };
  transport: {
    require_loading_port: boolean;
    require_discharge_port: boolean;
    validate_port_codes: boolean;
  };
  containers: {
    minimum_count?: number;
    maximum_count?: number;
    require_container_numbers: boolean;
    validate_container_format: boolean;
  };
  charges: {
    require_ocean_freight: boolean;
    validate_amounts: boolean;
    require_payment_terms: boolean;
  };
}

/**
 * Résultat de validation d'un BL
 */
export interface BLValidationResult {
  is_valid: boolean;
  errors: Array<{
    field: string;
    code: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  warnings: Array<{
    field: string;
    code: string;
    message: string;
    recommendation?: string;
  }>;
  completeness_score: number; // 0-100
  missing_required_fields: string[];
  suggested_improvements: string[];
}