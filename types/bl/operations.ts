/**
 * Types pour les opérations et actions sur les Bills of Lading
 * CRUD, validation, business logic, workflows
 */

import type {
  BLStatus,
  FreightTerms,
  LoadingMethod,
  ChargeType,
  PaymentStatus
} from './enums';

import type { PartyInfo } from './core';
import type { CreateFreightChargeData } from './charges';

// ============================================================================
// Types de base pour les valeurs et paramètres
// ============================================================================

/**
 * Type union pour les valeurs des champs BL dans l'audit et les opérations
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
 */
export type BLBatchOperationParams = 
  | StatusChangeParams
  | AssignToFolderParams
  | AddChargesParams
  | UpdateShippingCompanyParams
  | BulkExportParams
  | BulkDeleteParams;

// ============================================================================
// Types pour la création et modification des BL
// ============================================================================

/**
 * Données pour créer un nouveau BL
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

// ============================================================================
// Types pour les workflows et changements d'état
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

// ============================================================================
// Types pour la validation
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

// ============================================================================
// Types pour l'audit et la traçabilité
// ============================================================================

/**
 * Entrée d'audit pour les BL
 */
export interface BLAuditEntry {
  id: string;
  bl_id: string;
  
  // Action effectuée
  action: 
    | 'created'
    | 'updated'
    | 'status_changed'
    | 'container_added'
    | 'container_removed'
    | 'charge_added'
    | 'charge_updated'
    | 'deleted'
    | 'restored';
  
  // Détails de l'action
  entity_type: 'bl' | 'container' | 'charge' | 'cargo_detail';
  entity_id?: string;
  
  // Changements
  old_values?: Record<string, BLFieldValue>;
  new_values?: Record<string, BLFieldValue>;
  
  // Métadonnées
  performed_by: string;
  performed_at: string;
  ip_address?: string;
  user_agent?: string;
  
  // Contexte business
  reason?: string;
  notes?: string;
  reference_number?: string;
}

/**
 * Paramètres pour requêter l'historique d'audit
 */
export interface BLAuditQuery {
  bl_ids?: string[];
  actions?: string[];
  entity_types?: string[];
  performed_by?: string[];
  date_from?: string;
  date_to?: string;
  
  // Pagination
  page?: number;
  page_size?: number;
  sort_by?: 'performed_at' | 'action' | 'performed_by';
  sort_order?: 'asc' | 'desc';
}

// ============================================================================
// Types pour l'intégration et les API
// ============================================================================

/**
 * Configuration d'intégration avec des systèmes externes
 */
export interface BLIntegrationConfig {
  system_name: string;
  system_type: 'erp' | 'tms' | 'customs' | 'tracking' | 'billing';
  
  // Endpoints
  base_url: string;
  authentication: {
    type: 'api_key' | 'oauth2' | 'basic_auth';
    credentials: Record<string, string>;
  };
  
  // Mapping des champs
  field_mapping: Record<string, string>;
  
  // Configuration de synchronisation
  sync_direction: 'inbound' | 'outbound' | 'bidirectional';
  sync_frequency: 'real_time' | 'hourly' | 'daily' | 'manual';
  
  // Gestion des erreurs
  retry_policy: {
    max_attempts: number;
    backoff_strategy: 'linear' | 'exponential';
    timeout_ms: number;
  };
}

/**
 * Résultat de synchronisation avec un système externe
 */
export interface BLSyncResult {
  integration_name: string;
  sync_started_at: string;
  sync_completed_at?: string;
  
  status: 'success' | 'partial_success' | 'failed';
  
  statistics: {
    total_records: number;
    synchronized_records: number;
    failed_records: number;
    skipped_records: number;
  };
  
  errors: Array<{
    bl_id: string;
    error_code: string;
    error_message: string;
    retry_possible: boolean;
  }>;
  
  next_sync_scheduled?: string;
}