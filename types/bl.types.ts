/**
 * Types TypeScript pour le système de gestion des Bills of Lading (BL)
 * Basé sur l'analyse des BL et le schéma de base de données
 * Génération automatique basée sur les migrations Supabase
 */

// ============================================================================
// Enums correspondant aux types PostgreSQL
// ============================================================================

export type ShippingCompanyStatus = 'active' | 'inactive' | 'suspended';

export type ContainerCategory = 
  | 'general_purpose'    // GP - Conteneurs secs standards
  | 'high_cube'         // HC/HQ - Conteneurs haute capacité
  | 'refrigerated'      // RF - Conteneurs frigorifiques
  | 'open_top'          // OT - Conteneurs à toit ouvrant
  | 'flat_rack'         // FR - Conteneurs à plateaux
  | 'tank'              // TK - Conteneurs citernes  
  | 'ventilated'        // VH - Conteneurs ventilés
  | 'bulk'              // BU - Conteneurs en vrac
  | 'platform'          // PL - Plateformes
  | 'roro';             // RoRo - Roll-on/Roll-off

export type ContainerHeightType = 'standard' | 'high_cube';

export type FreightTerms = 'prepaid' | 'collect' | 'prepaid_collect';

export type BLStatus = 
  | 'draft'      // Brouillon
  | 'issued'     // Émis
  | 'shipped'    // Embarqué
  | 'discharged' // Déchargé
  | 'delivered'  // Livré
  | 'cancelled'; // Annulé

export type LoadingMethod = 
  | 'FCL'        // Full Container Load
  | 'LCL'        // Less than Container Load
  | 'RORO'       // Roll-on/Roll-off
  | 'BREAK_BULK'; // Vrac conventionnel

export type ChargeType = 
  | 'ocean_freight'      // Fret maritime de base
  | 'thc_origin'         // Terminal Handling Charges au départ
  | 'thc_destination'    // Terminal Handling Charges à l'arrivée
  | 'documentation'      // Frais de documentation
  | 'seal_fee'           // Frais de scellé
  | 'container_cleaning' // Nettoyage de conteneur
  | 'weighing'           // Pesage
  | 'detention'          // Surestarie
  | 'demurrage'          // Surestarie portuaire
  | 'storage'            // Stockage
  | 'customs_clearance'  // Dédouanement
  | 'inspection'         // Inspection
  | 'fumigation'         // Fumigation
  | 'reefer_monitoring'  // Surveillance frigorifique
  | 'bunker_adjustment'  // Ajustement carburant (BAF)
  | 'currency_adjustment' // Ajustement monétaire (CAF)
  | 'security_surcharge' // Surcharge sécurité
  | 'war_risk_surcharge' // Surcharge risque de guerre
  | 'port_congestion'    // Surcharge congestion portuaire
  | 'peak_season'        // Surcharge haute saison
  | 'heavy_lift'         // Surcharge colis lourd
  | 'oversize'           // Surcharge hors gabarit
  | 'hazmat'             // Surcharge matières dangereuses
  | 'other';             // Autres frais

export type ChargeCategory = 
  | 'mandatory'    // Frais obligatoires
  | 'optional'     // Frais optionnels
  | 'regulatory'   // Frais réglementaires
  | 'surcharge'    // Surcharges
  | 'penalty';     // Pénalités

export type CalculationBasis = 
  | 'per_container' // Par conteneur
  | 'per_teu'       // Par TEU
  | 'per_weight'    // Par poids (kg/tonne)
  | 'per_volume'    // Par volume (m³)
  | 'per_bl'        // Par BL
  | 'percentage'    // Pourcentage
  | 'flat_rate'     // Forfait
  | 'per_day';      // Par jour

export type PaidBy = 'shipper' | 'consignee' | 'third_party';

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'disputed' | 'waived';

// ============================================================================
// Enums pour le système de numérotation de dossiers
// ============================================================================

export type TransportType = 'M' | 'T' | 'A'; // Maritime, Terrestre, Aérien

export type FolderStatus = 
  | 'draft'      // Brouillon
  | 'active'     // Actif (en cours de traitement)
  | 'shipped'    // Expédié
  | 'delivered'  // Livré
  | 'completed'  // Terminé
  | 'cancelled'  // Annulé
  | 'archived';  // Archivé

export type FolderPriority = 'low' | 'normal' | 'urgent' | 'critical';

// ============================================================================
// Types pour les structures JSON
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
// Types pour les tables de base de données
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
  folder?: Folder; // Populated via join
  
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
// Types pour le système de numérotation de dossiers
// ============================================================================

/**
 * Compteur global des dossiers
 */
export interface FolderCounter {
  id: string;
  year: number;
  counter: number;
  created_at: string;
  updated_at: string;
}

/**
 * Dossier avec numérotation automatique
 */
export interface Folder {
  id: string;
  
  // Numérotation automatique - Format: M250804-001234
  folder_number: string;
  transport_type: TransportType;
  
  // Informations générales du dossier
  title?: string;
  description?: string;
  folder_date: string;  // Date de création du dossier
  
  // Statut et priorité
  status: FolderStatus;
  priority: FolderPriority;
  
  // Informations business
  estimated_value?: number;
  currency?: string; // Code ISO 4217
  
  // Dates importantes
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  
  // Assignation
  assigned_to?: string; // UUID de l'utilisateur
  assigned_user?: any;  // Populated via join
  
  // Relation avec BL (1:1)
  bl_id?: string;
  bill_of_lading?: BillOfLading; // Populated via join
  
  // Métadonnées
  notes?: string;
  tags?: string[]; // JSON array
  
  // Relations utilisateur
  created_by?: string;
  updated_by?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Soft delete fields
  deleted_at?: string;
  deleted_by?: string;
}

// ============================================================================
// Types utilitaires et agrégations
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

/**
 * Statistiques des dossiers par type de transport
 */
export interface FolderStatsByTransport {
  transport_type: TransportType;
  transport_type_label: string;
  total_folders: number;
  active_folders: number;
  deleted_folders: number;
  draft_count: number;
  active_count: number;
  shipped_count: number;
  delivered_count: number;
  completed_count: number;
  cancelled_count: number;
  archived_count: number;
  folders_with_bl: number;
  folders_without_bl: number;
  total_estimated_value?: number;
  avg_estimated_value?: number;
  min_estimated_value?: number;
  max_estimated_value?: number;
  first_folder_date?: string;
  last_folder_date?: string;
  folders_last_30_days: number;
  folders_last_7_days: number;
  folders_today: number;
  active_percentage: number;
  bl_link_percentage: number;
}

/**
 * Statistiques des dossiers par période
 */
export interface FolderStatsByPeriod {
  year: number;
  month: number;
  period_label: string;
  period_start: string;
  total_folders: number;
  active_folders: number;
  maritime_count: number;
  terrestre_count: number;
  aerien_count: number;
  completed_count: number;
  cancelled_count: number;
  total_estimated_value?: number;
  avg_estimated_value?: number;
  folders_with_bl: number;
  completion_rate: number;
  cancellation_rate: number;
}

/**
 * Tableau de bord exécutif
 */
export interface ExecutiveDashboard {
  total_active_folders: number;
  total_deleted_folders: number;
  total_active_bl: number;
  folders_last_30_days: number;
  folders_last_7_days: number;
  folders_today: number;
  maritime_folders: number;
  terrestre_folders: number;
  aerien_folders: number;
  active_in_progress: number;
  currently_shipped: number;
  completed_folders: number;
  cancelled_folders: number;
  folders_with_bl: number;
  folders_without_bl: number;
  bl_without_folder: number;
  total_portfolio_value: number;
  avg_folder_value: number;
  completed_portfolio_value: number;
  global_completion_rate: number;
  bl_link_rate: number;
  current_year_folders: number;
  previous_year_folders: number;
  year_over_year_growth: number;
}

/**
 * Dossier nécessitant attention
 */
export interface FolderRequiringAttention {
  folder_id: string;
  folder_number: string;
  transport_type: TransportType;
  status: FolderStatus;
  title?: string;
  folder_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  priority: FolderPriority;
  assigned_to?: string;
  assignee_email?: string;
  issues: string[];
  attention_score: number;
  days_since_creation: number;
  days_overdue?: number;
}

/**
 * Options de recherche et filtrage des BL
 */
export interface BLSearchOptions {
  bl_number?: string;
  shipping_company_id?: string;
  status?: BLStatus;
  port_of_loading?: string;
  port_of_discharge?: string;
  vessel_name?: string;
  issue_date_from?: string;
  issue_date_to?: string;
  shipper_name?: string;
  consignee_name?: string;
  container_number?: string;
  created_by?: string;
  limit?: number;
  offset?: number;
  sort_by?: 'issue_date' | 'created_at' | 'bl_number' | 'status';
  sort_order?: 'asc' | 'desc';
}

/**
 * Options de recherche et filtrage des dossiers
 */
export interface FolderSearchOptions {
  folder_number?: string;
  transport_type?: TransportType;
  status?: FolderStatus;
  priority?: FolderPriority;
  assigned_to?: string;
  bl_id?: string;
  folder_date_from?: string;
  folder_date_to?: string;
  expected_delivery_from?: string;
  expected_delivery_to?: string;
  created_by?: string;
  has_bl?: boolean;
  estimated_value_min?: number;
  estimated_value_max?: number;
  limit?: number;
  offset?: number;
  sort_by?: 'folder_date' | 'created_at' | 'folder_number' | 'status' | 'priority';
  sort_order?: 'asc' | 'desc';
}

/**
 * Données pour créer un nouveau BL
 */
export interface CreateBLData {
  bl_number: string;
  shipping_company_id: string;
  shipper_info: PartyInfo;
  consignee_info: PartyInfo;
  notify_party_info?: PartyInfo;
  port_of_loading: string;
  port_of_discharge: string;
  place_of_receipt?: string;
  place_of_delivery?: string;
  vessel_name?: string;
  voyage_number?: string;
  issue_date: string;
  freight_terms: FreightTerms;
  loading_method: LoadingMethod;
  cargo_description?: string;
  booking_reference?: string;
  export_reference?: string;
}

/**
 * Données pour créer un conteneur
 */
export interface CreateContainerData {
  bl_id: string;
  container_type_id: string;
  container_number: string;
  seal_number?: string;
  gross_weight_kg?: number;
  loading_method: LoadingMethod;
  marks_and_numbers?: string;
  shipper_load_stow_count?: boolean;
}

/**
 * Données pour créer un détail de marchandise
 */
export interface CreateCargoDetailData {
  container_id: string;
  description: string;
  hs_code?: string;
  quantity?: number;
  unit_type?: string;
  weight_kg?: number;
  volume_cbm?: number;
  number_of_packages?: number;
  package_type?: string;
  marks_and_numbers?: string;
}

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
 * Données pour créer un nouveau dossier
 */
export interface CreateFolderData {
  transport_type: TransportType;
  title?: string;
  description?: string;
  folder_date?: string; // Si non fourni, utilise CURRENT_DATE
  status?: FolderStatus; // Par défaut 'draft'
  priority?: FolderPriority; // Par défaut 'normal'
  estimated_value?: number;
  currency?: string;
  expected_delivery_date?: string;
  assigned_to?: string;
  bl_id?: string;
  notes?: string;
  tags?: string[];
}

/**
 * Données pour mettre à jour un dossier
 */
export interface UpdateFolderData {
  title?: string;
  description?: string;
  status?: FolderStatus;
  priority?: FolderPriority;
  estimated_value?: number;
  currency?: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  assigned_to?: string;
  notes?: string;
  tags?: string[];
}

/**
 * Paramètres pour les fonctions de liaison dossier-BL
 */
export interface FolderBLLinkParams {
  folder_id: string;
  bl_id?: string;
  new_bl_id?: string;
}

/**
 * Paramètres pour les fonctions de réassignation
 */
export interface SwapFolderBLParams {
  folder1_id: string;
  folder2_id: string;
}

/**
 * Paramètres pour la réassignation en masse
 */
export interface BulkReassignParams {
  reassignments: Array<{
    folder_id: string;
    new_bl_id: string;
  }>;
}

// ============================================================================
// Types pour les réponses API
// ============================================================================

/**
 * Réponse standard des API
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Réponse paginée
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  error?: string;
}

/**
 * BL avec toutes ses relations
 */
export interface BLWithRelations extends BillOfLading {
  shipping_company: ShippingCompany;
  containers: (BLContainer & {
    container_type: ContainerType;
    cargo_details: BLCargoDetail[];
  })[];
  freight_charges: BLFreightCharge[];
  statistics: BLStatistics;
}

// ============================================================================
// Types pour les fonctions utilitaires de la base de données
// ============================================================================

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

// ============================================================================
// Types pour les opérations de soft delete
// ============================================================================

/**
 * Résultat d'une opération de soft delete
 */
export interface SoftDeleteResult {
  success: boolean;
  bl_id?: string;
  container_id?: string;
  cargo_detail_id?: string;
  charge_id?: string;
  bl_number?: string;
  container_number?: string;
  description?: string;
  amount?: number;
  currency?: string;
  deleted_at: string;
  deleted_by: string;
  cascade_summary?: {
    containers_deleted?: number;
    cargo_details_deleted?: number;
    freight_charges_deleted?: number;
  };
}

/**
 * Résultat d'une opération de restauration
 */
export interface RestoreResult {
  success: boolean;
  bl_id: string;
  bl_number: string;
  restored_at: string;
  restored_by: string;
  cascade_summary: {
    containers_restored: number;
    cargo_details_restored: number;
    freight_charges_restored: number;
  };
}

/**
 * BL supprimé avec informations d'audit
 */
export interface DeletedBL {
  id: string;
  bl_number: string;
  shipping_company_name: string;
  deleted_at: string;
  deleted_by_name: string;
  containers_count: number;
  total_charges: number;
}

/**
 * Statistiques de suppression pour un utilisateur
 */
export interface DeletionStats {
  deleted_bls: number;
  deleted_containers: number;
  deleted_cargo_details: number;
  deleted_freight_charges: number;
  last_deletion_date?: string;
}

/**
 * Enregistrement supprimé dans la vue d'audit
 */
export interface AuditDeletedRecord {
  table_name: string;
  id: string;
  identifier: string;
  deleted_at: string;
  deleted_by: string;
  deleted_by_name: string;
  deleted_by_email: string;
}

/**
 * Résultat de vérification d'intégrité des soft deletes
 */
export interface SoftDeleteIntegrityIssue {
  table_name: string;
  issue_type: string;
  issue_count: number;
  issue_description: string;
}

/**
 * Résultat de nettoyage des enregistrements supprimés
 */
export interface CleanupResult {
  success: boolean;
  cleanup_date: string;
  cleaned_by: string;
  cleaned_at: string;
  records_cleaned: {
    bills_of_lading: number;
    containers: number;
    cargo_details: number;
    freight_charges: number;
  };
}

/**
 * Paramètres pour les fonctions de soft delete
 */
export interface SoftDeleteParams {
  bl_uuid?: string;
  container_uuid?: string;
  cargo_detail_uuid?: string;
  charge_uuid?: string;
  user_id?: string;
}

/**
 * Options de recherche pour les enregistrements supprimés
 */
export interface DeletedRecordsSearchOptions {
  table_name?: string;
  deleted_by?: string;
  deleted_from?: string;  // Date de début
  deleted_to?: string;    // Date de fin
  limit?: number;
  offset?: number;
  sort_by?: 'deleted_at' | 'table_name' | 'deleted_by_name';
  sort_order?: 'asc' | 'desc';
}

// ============================================================================
// Types étendus avec soft delete
// ============================================================================

/**
 * BL avec informations de soft delete visible
 */
export interface BLWithSoftDelete extends BillOfLading {
  is_deleted: boolean;
  deleted_at?: string;
  deleted_by?: string;
  deleted_by_name?: string;
  can_restore: boolean;
}

/**
 * Vue active des BL (équivalent à active_bills_of_lading)
 */
export interface ActiveBillOfLading extends Omit<BillOfLading, 'deleted_at' | 'deleted_by'> {
  // Les BL actifs n'ont pas de champs deleted_at/deleted_by
}

/**
 * Types pour les vues actives
 */
export interface ActiveBLContainer extends Omit<BLContainer, 'deleted_at' | 'deleted_by'> {}
export interface ActiveBLCargoDetail extends Omit<BLCargoDetail, 'deleted_at' | 'deleted_by'> {}
export interface ActiveBLFreightCharge extends Omit<BLFreightCharge, 'deleted_at' | 'deleted_by'> {}
export interface ActiveShippingCompany extends Omit<ShippingCompany, 'deleted_at' | 'deleted_by'> {}
export interface ActiveContainerType extends Omit<ContainerType, 'deleted_at' | 'deleted_by'> {}

/**
 * Dossier avec informations de soft delete visible
 */
export interface FolderWithSoftDelete extends Folder {
  is_deleted: boolean;
  deleted_at?: string;
  deleted_by?: string;
  deleted_by_name?: string;
  can_restore: boolean;
}

/**
 * Vue active des dossiers (équivalent à active_folders)
 */
export interface ActiveFolder extends Omit<Folder, 'deleted_at' | 'deleted_by'> {
  // Les dossiers actifs n'ont pas de champs deleted_at/deleted_by
}

/**
 * Dossier avec toutes ses relations
 */
export interface FolderWithRelations extends Folder {
  assigned_user?: any; // User data populated via join
  bill_of_lading?: BillOfLading; // BL data populated via join
}

/**
 * Vue complète dossier avec BL
 */
export interface FolderWithBL {
  folder_id: string;
  folder_number: string;
  transport_type: TransportType;
  folder_status: FolderStatus;
  folder_title?: string;
  folder_date: string;
  folder_created_at: string;
  assigned_to?: string;
  bl_id?: string;
  bl_number?: string;
  bl_issue_date?: string;
  shipper_name?: string;
  consignee_name?: string;
  port_of_loading?: string;
  port_of_discharge?: string;
  relationship_status: string;
}

/**
 * Vue complète BL avec dossier
 */
export interface BLWithFolder {
  bl_id: string;
  bl_number: string;
  bl_issue_date: string;
  shipper_name?: string;
  consignee_name?: string;
  port_of_loading: string;
  port_of_discharge: string;
  bl_created_at: string;
  folder_id?: string;
  folder_number?: string;
  transport_type?: TransportType;
  folder_status?: FolderStatus;
  folder_title?: string;
  relationship_status: string;
}

// ============================================================================
// Types exportés par défaut
// ============================================================================

// Tous les types sont disponibles via import nommés :
// import { Folder, TransportType, FolderStatus } from './bl.types'