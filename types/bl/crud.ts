/**
 * Types pour les opérations CRUD sur les Bills of Lading
 * Création, modification et structures de données associées
 * 
 * @module BL/CRUD
 * @version 2.0.0
 * @since 2025-01-06
 * 
 * Ce module contient les types pour :
 * - Création de nouveaux Bills of Lading (CreateBLData)
 * - Modification des BL existants (UpdateBLData)
 * - Création de conteneurs associés (CreateBLContainerData)
 * - Création des détails de cargaison (CreateCargoDetailData)
 * 
 * @example
 * ```typescript
 * import type { CreateBLData, UpdateBLData } from '@/types/bl/crud';
 * 
 * // Création d'un nouveau BL
 * const newBL: CreateBLData = {
 *   bl_number: 'BL001',
 *   shipping_company_id: 'msc-001',
 *   shipper_info: { name: 'ACME Corp' },
 *   consignee_info: { name: 'Global Trading' },
 *   port_of_loading: 'USNYC',
 *   port_of_discharge: 'FRPAR',
 *   freight_terms: 'prepaid',
 *   loading_method: 'fcl',
 *   issue_date: '2025-01-06'
 * };
 * ```
 */

import type {
  BLStatus,
  FreightTerms,
  LoadingMethod
} from './enums';

import type { PartyInfo } from './core';
import type { CreateFreightChargeData } from './charges';

// ============================================================================
// Types pour la création des BL
// ============================================================================

/**
 * Données pour créer un nouveau Bill of Lading
 * 
 * Interface complète pour la création d'un nouveau BL avec tous
 * les champs requis et optionnels. Utilisée par les API de création.
 * 
 * @example
 * ```typescript
 * const blData: CreateBLData = {
 *   bl_number: 'MSC12345',
 *   shipping_company_id: 'msc-mediterranean',
 *   
 *   // Parties obligatoires
 *   shipper_info: {
 *     name: 'Export Industries Ltd',
 *     address: '123 Industrial Blvd',
 *     city: 'Shanghai',
 *     country: 'CN',
 *     email: 'export@industries.com'
 *   },
 *   consignee_info: {
 *     name: 'Import Solutions Inc',
 *     address: '456 Harbor St',
 *     city: 'Los Angeles',
 *     country: 'US'
 *   },
 *   
 *   // Transport
 *   port_of_loading: 'CNSHA',
 *   port_of_discharge: 'USLAX',
 *   vessel_name: 'MSC Magnifica',
 *   voyage_number: '2501E',
 *   
 *   // Dates
 *   issue_date: '2025-01-06',
 *   estimated_arrival_date: '2025-02-15',
 *   
 *   // Termes commerciaux
 *   freight_terms: 'prepaid',
 *   loading_method: 'fcl',
 *   
 *   // Cargaison
 *   cargo_description: 'Electronic goods',
 *   total_packages: 100,
 *   total_gross_weight_kg: 15000
 * };
 * ```
 */
export interface CreateBLData {
  // Identification
  bl_number: string;
  booking_reference?: string;
  export_reference?: string;
  service_contract?: string;
  
  // Compagnie maritime
  shipping_company_id: string;
  
  // Parties impliquées
  shipper_info: PartyInfo;
  consignee_info: PartyInfo;
  notify_party_info?: PartyInfo;
  
  // Transport
  port_of_loading: string;
  port_of_discharge: string;
  place_of_receipt?: string;
  place_of_delivery?: string;
  
  // Navire
  vessel_name?: string;
  voyage_number?: string;
  vessel_imo_number?: string;
  
  // Dates
  issue_date: string;
  shipped_on_board_date?: string;
  estimated_arrival_date?: string;
  
  // Termes commerciaux
  freight_terms: FreightTerms;
  loading_method: LoadingMethod;
  
  // Cargaison
  cargo_description?: string;
  total_packages?: number;
  total_gross_weight_kg?: number;
  total_volume_cbm?: number;
  
  // Valeur déclarée
  declared_value_amount?: number;
  declared_value_currency?: string;
  
  // Conteneurs initiaux (optionnel)
  containers?: CreateBLContainerData[];
  
  // Frais initiaux (optionnel)
  freight_charges?: CreateFreightChargeData[];
}

/**
 * Données pour modifier un BL existant
 */
export interface UpdateBLData {
  // Tous les champs sont optionnels pour permettre les mises à jour partielles
  bl_number?: string;
  booking_reference?: string;
  export_reference?: string;
  service_contract?: string;
  
  shipping_company_id?: string;
  
  shipper_info?: Partial<PartyInfo>;
  consignee_info?: Partial<PartyInfo>;
  notify_party_info?: Partial<PartyInfo>;
  
  port_of_loading?: string;
  port_of_discharge?: string;
  place_of_receipt?: string;
  place_of_delivery?: string;
  
  vessel_name?: string;
  voyage_number?: string;
  vessel_imo_number?: string;
  
  issue_date?: string;
  shipped_on_board_date?: string;
  estimated_arrival_date?: string;
  
  freight_terms?: FreightTerms;
  loading_method?: LoadingMethod;
  
  cargo_description?: string;
  total_packages?: number;
  total_gross_weight_kg?: number;
  total_volume_cbm?: number;
  
  declared_value_amount?: number;
  declared_value_currency?: string;
  
  status?: BLStatus;
}

// ============================================================================
// Types pour la création des conteneurs et cargaison
// ============================================================================

/**
 * Données pour créer un conteneur lié à un BL
 */
export interface CreateBLContainerData {
  container_type_id: string;
  container_number: string;
  seal_number?: string;
  
  // Poids et mesures
  tare_weight_kg?: number;
  gross_weight_kg?: number;
  net_weight_kg?: number;
  volume_cbm?: number;
  
  loading_method: LoadingMethod;
  marks_and_numbers?: string;
  shipper_load_stow_count: boolean;
  
  // Suivi des arrivées
  estimated_arrival_date?: string;
  arrival_location?: string;
  arrival_notes?: string;
  
  // Détails de la cargaison
  cargo_details?: CreateCargoDetailData[];
}

/**
 * Données pour créer les détails de cargaison
 */
export interface CreateCargoDetailData {
  hs_code?: string;
  commodity_code?: string;
  description: string;
  quantity?: number;
  unit_type?: string;
  weight_kg?: number;
  volume_cbm?: number;
  marks_and_numbers?: string;
  number_of_packages?: number;
  package_type?: string;
}