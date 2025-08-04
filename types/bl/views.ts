/**
 * Types pour les vues et dashboard du système Bills of Lading
 * Interfaces pour les requêtes et affichages agrégés
 */

import type {
  BLStatus,
  FreightTerms,
  LoadingMethod,
  ChargeType,
  PaymentStatus
} from './enums';

import type { BillOfLading, BLContainer, ShippingCompany } from './core';
import type { BLFreightCharge } from './charges';

// ============================================================================
// Types pour les vues dashboard
// ============================================================================

/**
 * Vue résumée d'un BL pour listes et tableaux
 */
export interface BLSummaryView {
  id: string;
  bl_number: string;
  shipping_company_name: string;
  shipping_company_short?: string;
  shipper_name: string;
  consignee_name: string;
  port_of_loading: string;
  port_of_discharge: string;
  status: BLStatus;
  container_count: number;
  total_weight_kg?: number;
  total_volume_cbm?: number;
  issue_date: string;
  estimated_arrival_date?: string;
  created_at: string;
  folder_number?: string;
}

/**
 * Vue détaillée d'un BL avec toutes les relations
 */
export interface BLDetailView {
  // Informations de base du BL
  bill_of_lading: BillOfLading;
  
  // Relations complètes
  shipping_company: ShippingCompany;
  containers: BLContainer[];
  freight_charges: BLFreightCharge[];
  
  // Statistiques calculées
  statistics: {
    container_count: number;
    total_weight_kg: number;
    total_volume_cbm: number;
    total_charges: number;
    unpaid_charges: number;
    charges_by_currency: Array<{
      currency: string;
      total_amount: number;
      paid_amount: number;
      unpaid_amount: number;
    }>;
  };
  
  // Statut global
  overall_status: {
    arrival_status: string;
    payment_status: string;
    completion_percentage: number;
    pending_actions: string[];
  };
}

/**
 * Vue pour le dashboard principal des BL
 */
export interface BLDashboardView {
  id: string;
  bl_number: string;
  shipping_company_name: string;
  shipper_name: string;
  consignee_name: string;
  port_of_discharge: string;
  status: BLStatus;
  freight_terms: FreightTerms;
  
  // Métriques importantes
  container_count: number;
  containers_arrived: number;
  containers_pending: number;
  
  // Dates clés
  issue_date: string;
  shipped_on_board_date?: string;
  estimated_arrival_date?: string;
  
  // Financier
  total_charges: number;
  paid_charges: number;
  currency: string;
  payment_status: PaymentStatus;
  
  // Indicateurs visuels
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  health_status: 'healthy' | 'warning' | 'critical';
  days_until_arrival?: number;
  
  created_at: string;
}

// ============================================================================
// Types pour les recherches et filtres
// ============================================================================

/**
 * Paramètres de recherche des BL
 */
export interface BLSearchParams {
  // Recherche textuelle
  search_query?: string;
  
  // Filtres par statut
  status?: BLStatus[];
  
  // Filtres par dates
  issue_date_from?: string;
  issue_date_to?: string;
  arrival_date_from?: string;
  arrival_date_to?: string;
  
  // Filtres par compagnie et ports
  shipping_company_ids?: string[];
  ports_of_loading?: string[];
  ports_of_discharge?: string[];
  
  // Filtres par termes commerciaux
  freight_terms?: FreightTerms[];
  loading_methods?: LoadingMethod[];
  
  // Filtres financiers
  payment_status?: PaymentStatus[];
  charge_types?: ChargeType[];
  
  // Filtres par conteneurs
  container_types?: string[];
  has_containers_overdue?: boolean;
  
  // Pagination et tri
  page?: number;
  page_size?: number;
  sort_by?: 'bl_number' | 'issue_date' | 'arrival_date' | 'created_at' | 'status';
  sort_order?: 'asc' | 'desc';
}

/**
 * Résultats de recherche des BL
 */
export interface BLSearchResults {
  data: BLSummaryView[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    page_size: number;
  };
  filters_applied: BLSearchParams;
  aggregations: {
    by_status: Record<BLStatus, number>;
    by_shipping_company: Array<{
      company_id: string;
      company_name: string;
      count: number;
    }>;
    by_port_discharge: Array<{
      port: string;
      count: number;
    }>;
  };
}

// ============================================================================  
// Types pour les statistiques et rapports
// ============================================================================

/**
 * Statistiques globales des BL
 */
export interface BLGlobalStats {
  // Compteurs globaux
  total_bls: number;
  active_bls: number;
  completed_bls: number;
  
  // Répartition par statut
  by_status: Record<BLStatus, number>;
  
  // Répartition par période
  this_month: number;
  last_month: number;
  this_year: number;
  
  // Métriques de performance
  average_processing_days: number;
  on_time_delivery_rate: number;
  
  // Financier
  total_charges_amount: number;
  paid_charges_amount: number;
  outstanding_charges_amount: number;
  
  // Tendances (évolution sur 30 jours)
  trends: {
    new_bls_trend: number;      // % de variation
    completion_trend: number;   // % de variation
    payment_trend: number;      // % de variation
  };
}

/**
 * Rapport mensuel des BL
 */
export interface BLMonthlyReport {
  month: string;                // Format: YYYY-MM
  
  // Volumes
  new_bls: number;
  completed_bls: number;
  total_containers: number;
  
  // Performance
  average_processing_days: number;
  on_time_delivery_rate: number;
  
  // Top compagnies
  top_shipping_companies: Array<{
    company_name: string;
    bl_count: number;
    container_count: number;
    total_charges: number;
  }>;
  
  // Top destinations
  top_destinations: Array<{
    port: string;
    bl_count: number;
    container_count: number;
  }>;
  
  // Problèmes identifiés
  issues: {
    overdue_containers: number;
    payment_delays: number;
    missing_documents: number;
  };
}

// ============================================================================
// Types pour l'export et les rapports
// ============================================================================

/**
 * Configuration d'export des BL
 */
export interface BLExportConfig {
  format: 'csv' | 'xlsx' | 'pdf';
  
  // Champs à inclure
  fields: Array<
    | 'basic_info'          // BL number, dates, status
    | 'parties'             // Shipper, consignee, notify party
    | 'transport_info'      // Ports, vessel, voyage
    | 'container_details'   // Container info, weights, measures
    | 'freight_charges'     // All charges and payments
    | 'tracking_info'       // Arrival tracking, status updates
  >;
  
  // Filtres (mêmes que BLSearchParams)
  filters?: BLSearchParams;
  
  // Options spécifiques au format
  options?: {
    // Pour CSV
    delimiter?: string;
    encoding?: string;
    
    // Pour Excel
    include_charts?: boolean;
    separate_sheets?: boolean;
    
    // Pour PDF
    include_summary?: boolean;
    template?: 'detailed' | 'summary' | 'commercial';
  };
}

/**
 * Résultat d'export
 */
export interface BLExportResult {
  success: boolean;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  records_count?: number;
  error_message?: string;
  generated_at: string;
}