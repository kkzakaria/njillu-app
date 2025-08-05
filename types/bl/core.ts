/**
 * Interfaces principales du système Bills of Lading (BL)
 * Types pour les entités centrales : BL, conteneurs, compagnies
 */

import type {
  BLStatus,
  FreightTerms,
  LoadingMethod,
  ShippingCompanyStatus,
  ContainerCategory,
  ContainerHeightType
} from './enums';

// Importation des types de conteneurs depuis le module dédié
import type { ContainerArrivalStatus } from '../containers/enums';

// ============================================================================
// Structures JSON communes
// ============================================================================

/**
 * Informations de contact pour une partie (expéditeur, destinataire, notify party)
 */
export interface PartyInfo {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  tax_id?: string;
  reference?: string;
}

/**
 * Informations de contact pour une compagnie maritime
 */
export interface CompanyContactInfo {
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  emergency_contact?: string;
}

/**
 * Caractéristiques spéciales d'un type de conteneur
 */
export interface ContainerSpecialFeatures {
  temperature_range?: string;    // Ex: "-25/+25"
  power_required?: boolean;      // Alimentation électrique requise
  hazmat_approved?: boolean;     // Approuvé pour matières dangereuses
  food_grade?: boolean;          // Qualité alimentaire
  ventilation_type?: string;     // Type de ventilation
  door_type?: string;           // Type d'ouverture
  floor_type?: string;          // Type de plancher
}

// ============================================================================
// Entités principales
// ============================================================================

/**
 * Compagnie maritime
 */
export interface ShippingCompany {
  id: string;
  name: string;
  short_name?: string;
  scac_code?: string;  // Standard Carrier Alpha Code (4 lettres)
  iata_code?: string;
  headquarters_country?: string;  // Code ISO 3166-1 alpha-2
  headquarters_city?: string;
  headquarters_address?: string;
  contact_info: CompanyContactInfo;
  status: ShippingCompanyStatus;
  founded_year?: number;
  fleet_size?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Soft delete fields
  deleted_at?: string;
  deleted_by?: string;
}

/**
 * Type de conteneur avec spécifications détaillées
 */
export interface ContainerType {
  id: string;
  iso_code: string;        // Ex: 20GP, 40HC, 40HQ, 20RF
  description: string;
  category: ContainerCategory;
  size_feet: number;       // 20, 40, 45, 53
  height_type: ContainerHeightType;
  
  // Dimensions physiques (en mètres)
  length_meters?: number;   // Longueur externe
  width_meters?: number;    // Largeur externe  
  height_meters?: number;   // Hauteur externe
  
  // Dimensions internes (en mètres)
  internal_length_meters?: number;
  internal_width_meters?: number;
  internal_height_meters?: number;
  
  // Poids et capacités
  tare_weight_kg?: number;      // Poids à vide (kg)
  max_payload_kg?: number;      // Charge utile maximale (kg)
  max_gross_weight_kg?: number; // Poids brut maximal (kg)
  volume_cubic_meters?: number; // Volume interne (m³)
  
  // Équivalence TEU (Twenty-foot Equivalent Unit)
  teu_equivalent: number;
  
  // Caractéristiques spéciales
  special_features: ContainerSpecialFeatures;
  
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Soft delete fields
  deleted_at?: string;
  deleted_by?: string;
}

/**
 * Bill of Lading principal
 */
export interface BillOfLading {
  id: string;
  
  // Identification du BL
  bl_number: string;
  booking_reference?: string;
  export_reference?: string;
  service_contract?: string;
  
  // Compagnie maritime (relation)
  shipping_company_id: string;
  shipping_company?: ShippingCompany; // Populated via join
  
  // Parties impliquées (JSON)
  shipper_info: PartyInfo;
  consignee_info: PartyInfo;
  notify_party_info?: PartyInfo;
  
  // Informations de transport
  port_of_loading: string;
  port_of_discharge: string;
  place_of_receipt?: string;
  place_of_delivery?: string;
  
  // Navire et voyage
  vessel_name?: string;
  voyage_number?: string;
  vessel_imo_number?: string;
  
  // Dates importantes
  issue_date: string;
  shipped_on_board_date?: string;
  estimated_arrival_date?: string;
  
  // Termes commerciaux
  freight_terms: FreightTerms;
  loading_method: LoadingMethod;
  
  // Description générale de la cargaison
  cargo_description?: string;
  total_packages?: number;
  total_gross_weight_kg?: number;
  total_volume_cbm?: number;
  
  // Valeur déclarée
  declared_value_amount?: number;
  declared_value_currency?: string; // Code ISO 4217
  
  // Statut et métadonnées
  status: BLStatus;
  
  // Relations utilisateur
  created_by?: string;
  updated_by?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Soft delete fields
  deleted_at?: string;
  deleted_by?: string;
  
  // Relation avec dossier (1:1)
  folder_id?: string;
  
  // Relations (populated via joins)
  containers?: BLContainer[];
  freight_charges?: BLFreightCharge[];
}

/**
 * Conteneur associé à un BL
 */
export interface BLContainer {
  id: string;
  
  // Relations
  bl_id: string;
  container_type_id: string;
  bill_of_lading?: BillOfLading;     // Populated via join
  container_type?: ContainerType;    // Populated via join
  
  // Identification du conteneur
  container_number: string;  // Format ISO: 4 lettres + 7 chiffres
  seal_number?: string;
  
  // Poids et mesures
  tare_weight_kg?: number;
  gross_weight_kg?: number;
  net_weight_kg?: number;
  volume_cbm?: number;
  
  // Méthode de chargement
  loading_method: LoadingMethod;
  
  // Marques et numéros
  marks_and_numbers?: string;
  
  // Informations de chargement
  shipper_load_stow_count: boolean;
  
  // Suivi des arrivées (nouvelles colonnes)
  estimated_arrival_date?: string;      // Date d'arrivée estimée
  actual_arrival_date?: string;         // Date d'arrivée réelle confirmée
  arrival_status: ContainerArrivalStatus; // Statut d'arrivée
  arrival_notes?: string;               // Notes sur l'arrivée
  arrival_location?: string;            // Terminal/port d'arrivée spécifique
  customs_clearance_date?: string;      // Date de dédouanement
  delivery_ready_date?: string;         // Date de mise à disposition
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Soft delete fields
  deleted_at?: string;
  deleted_by?: string;
  
  // Relations
  cargo_details?: BLCargoDetail[];
}

/**
 * Détails des marchandises par conteneur
 */
export interface BLCargoDetail {
  id: string;
  
  // Référence au conteneur
  container_id: string;
  container?: BLContainer; // Populated via join
  
  // Classification des marchandises
  hs_code?: string;         // Code SH (Système Harmonisé)
  commodity_code?: string;
  
  // Description
  description: string;
  quantity?: number;
  unit_type?: string;       // pieces, cartons, pallets, etc.
  
  // Poids et mesures spécifiques
  weight_kg?: number;
  volume_cbm?: number;
  
  // Marques et numéros spécifiques
  marks_and_numbers?: string;
  
  // Package details
  number_of_packages?: number;
  package_type?: string;    // cartons, bales, drums, etc.
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Soft delete fields
  deleted_at?: string;
  deleted_by?: string;
}

// Forward declaration pour éviter les imports circulaires
export interface BLFreightCharge {
  // Sera défini dans charges.ts
  id: string;
  bl_id: string;
  created_at: string;
  updated_at: string;
}