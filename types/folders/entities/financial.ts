/**
 * Entités financières - Types relatifs aux coûts et facturation
 */

/**
 * Informations financières et coûts
 */
export interface FinancialInfo {
  estimated_cost?: number;
  actual_cost?: number;
  invoiced_amount?: number;
  paid_amount?: number;
  currency: string;
  cost_breakdown?: Array<{
    category: string;
    description: string;
    amount: number;
    currency: string;
  }>;
}

/**
 * Détails de coût avec catégorisation
 */
export interface CostBreakdown {
  category: CostCategory;
  description: string;
  amount: number;
  currency: string;
  tax_rate?: number;
  tax_amount?: number;
  is_billable: boolean;
  cost_center?: string;
}

/**
 * Catégories de coûts
 */
export type CostCategory =
  | 'transport'           // Frais de transport
  | 'customs'            // Frais de douane
  | 'handling'           // Manutention
  | 'storage'            // Stockage
  | 'insurance'          // Assurance
  | 'documentation'      // Frais documentaires
  | 'inspection'         // Contrôles et inspections
  | 'administrative'     // Frais administratifs
  | 'surcharge'          // Surtaxes diverses
  | 'other';             // Autres frais

/**
 * Information de facturation
 */
export interface BillingInfo {
  invoice_number?: string;
  invoice_date?: Date;
  due_date?: Date;
  payment_status: PaymentStatus;
  payment_method?: string;
  payment_reference?: string;
  billing_address?: string;
  tax_registration?: string;
}

/**
 * Statuts de paiement
 */
export type PaymentStatus =
  | 'pending'           // En attente
  | 'partial'           // Partiellement payé
  | 'paid'              // Payé
  | 'overdue'           // En retard
  | 'cancelled';        // Annulé