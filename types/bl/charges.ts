/**
 * Types pour les frais et charges des Bills of Lading
 * Gestion complète des coûts de transport maritime
 */

import type {
  ChargeType,
  ChargeCategory,
  CalculationBasis,
  PaidBy,
  PaymentStatus
} from './enums';

import type { BillOfLading } from './core';

// ============================================================================
// Interface principale des frais
// ============================================================================

/**
 * Frais et charges associés aux BL
 */
export interface BLFreightCharge {
  id: string;
  
  // Référence au BL
  bl_id: string;
  bill_of_lading?: BillOfLading; // Populated via join
  
  // Classification du frais
  charge_type: ChargeType;
  charge_category: ChargeCategory;
  
  // Description et référence
  description: string;
  charge_code?: string;     // Code interne de la compagnie
  
  // Montant et devise
  amount: number;
  currency: string;         // Code ISO 4217
  
  // Base de calcul
  calculation_basis: CalculationBasis;
  quantity?: number;        // Quantité sur laquelle se base le calcul
  unit_rate?: number;       // Taux unitaire
  
  // Informations sur qui paie
  paid_by: PaidBy;
  payment_status: PaymentStatus;
  
  // Facture et référence comptable
  invoice_number?: string;
  invoice_date?: string;
  due_date?: string;
  
  // Taxes
  tax_rate: number;         // Pourcentage de TVA/taxes
  tax_amount: number;
  total_amount: number;     // Calculé: amount + tax_amount
  
  // Période d'application (pour les frais périodiques)
  period_start?: string;
  period_end?: string;
  
  // Informations complémentaires
  notes?: string;
  
  // Statut
  is_active: boolean;
  
  // Métadonnées
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Soft delete fields
  deleted_at?: string;
  deleted_by?: string;
}

// ============================================================================
// Types utilitaires pour les charges
// ============================================================================

/**
 * Résumé des frais par devise
 */
export interface ChargesSummaryByCurrency {
  currency: string;
  total_amount: number;
  paid_amount: number;
  unpaid_amount: number;
}

/**
 * Statistiques d'un BL
 */
export interface BLStatistics {
  container_count: number;
  total_weight_kg: number;
  total_volume_cbm: number;
  total_charges: number;
  unpaid_charges: number;
  charges_by_currency: ChargesSummaryByCurrency[];
}

// ============================================================================
// Types pour les opérations sur les charges
// ============================================================================

/**
 * Données pour créer un frais
 */
export interface CreateFreightChargeData {
  bl_id: string;
  charge_type: ChargeType;
  charge_category: ChargeCategory;
  description: string;
  amount: number;
  currency?: string;
  calculation_basis: CalculationBasis;
  quantity?: number;
  unit_rate?: number;
  paid_by: PaidBy;
  tax_rate?: number;
  tax_amount?: number;
  notes?: string;
}

/**
 * Paramètres pour la fonction add_standard_charges
 */
export interface AddStandardChargesParams {
  bl_uuid: string;
  shipping_company_name?: string;
}

/**
 * Paramètres pour les fonctions de calcul des frais
 */
export interface GetChargesParams {
  bl_uuid: string;
  charge_type_filter?: ChargeType;
}