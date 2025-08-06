/**
 * Opérations de création - Types pour la création de dossiers
 */

import type {
  FolderType,
  FolderCategory,
  FolderPriority,
  FolderUrgency,
  CustomsRegime,
  ServiceType,
  OperationType
} from '../constants';

import type {
  ClientInfo,
  LocationInfo,
  FinancialInfo
} from '../entities';

/**
 * Données pour créer un nouveau dossier
 */
export interface CreateFolderData {
  // Classification
  type: FolderType;
  category: FolderCategory;
  priority?: FolderPriority;
  urgency?: FolderUrgency;
  
  // Références
  reference_number?: string;
  internal_reference?: string;
  
  // Informations client (obligatoires)
  client_info: ClientInfo;
  consignee_info?: ClientInfo;
  notify_party_info?: ClientInfo;
  
  // Géographie (obligatoire)
  origin: LocationInfo;
  destination: LocationInfo;
  
  // Régime et services
  customs_regime: CustomsRegime;
  service_type: ServiceType;
  operation_type: OperationType;
  
  // Description
  description?: string;
  cargo_description?: string;
  special_instructions?: string;
  
  // Dates de planification
  expected_start_date?: string;
  expected_completion_date?: string;
  deadline_date?: string;
  
  // Informations financières initiales
  financial_info?: Partial<FinancialInfo>;
  
  // Mesures globales estimées
  total_weight_kg?: number;
  total_volume_cbm?: number;
  total_packages?: number;
  
  // Relations
  parent_folder_id?: string;
  related_folder_ids?: string[];
  
  // Bills of Lading à associer immédiatement
  initial_bl_ids?: string[];
}

/**
 * Validation des données de création
 */
export interface CreateFolderValidation {
  is_valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Erreur de validation
 */
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Avertissement de validation
 */
export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  suggestion?: string;
}

/**
 * Résultat de création d'un dossier
 */
export interface CreateFolderResult {
  success: boolean;
  folder_id?: string;
  folder_number?: string;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
}

/**
 * Options de création avancées
 */
export interface CreateFolderOptions {
  // Auto-génération
  auto_generate_number: boolean;
  auto_assign_to_creator: boolean;
  auto_create_initial_stages: boolean;
  
  // Notifications
  notify_client: boolean;
  notify_team: boolean;
  notification_template?: string;
  
  // Intégrations
  sync_with_external_systems: boolean;
  external_system_ids?: string[];
  
  // Validation
  skip_validation: boolean;
  validation_level: 'basic' | 'standard' | 'strict';
}

/**
 * Template de création de dossier
 */
export interface FolderTemplate {
  id: string;
  name: string;
  description?: string;
  
  // Valeurs par défaut
  default_values: Partial<CreateFolderData>;
  
  // Champs obligatoires spécifiques au template
  required_fields: string[];
  
  // Champs cachés/désactivés
  hidden_fields?: string[];
  disabled_fields?: string[];
  
  // Règles de validation spécifiques
  validation_rules?: Array<{
    field: string;
    rule: string;
    message: string;
  }>;
  
  // Métadonnées
  category: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at?: string;
}