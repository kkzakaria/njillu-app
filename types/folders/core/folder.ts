/**
 * Interface principale Folder - Entité centrale du système
 */

import type {
  FolderStatus,
  FolderType,
  FolderCategory,
  FolderPriority,
  FolderUrgency,
  CustomsRegime,
  ComplianceStatus,
  ProcessingStage,
  HealthStatus,
  PerformanceRating,
  ServiceType,
  OperationType
} from '../constants';

import type {
  ClientInfo,
  LocationInfo,
  FinancialInfo,
  AuditMetadata
} from '../entities';

// Import des types BL depuis le module dédié
import type { BillOfLading } from '../../bl/core';

/**
 * Dossier principal - entité centrale du système
 */
export interface Folder {
  id: string;
  
  // Identification unique
  folder_number: string;        // Format: M250804-000001
  reference_number?: string;    // Référence client
  internal_reference?: string;  // Référence interne
  
  // Classification
  type: FolderType;
  category: FolderCategory;
  priority: FolderPriority;
  urgency: FolderUrgency;
  
  // Informations client
  client_info: ClientInfo;
  consignee_info?: ClientInfo;
  notify_party_info?: ClientInfo;
  
  // Informations géographiques
  origin: LocationInfo;
  destination: LocationInfo;
  current_location?: LocationInfo;
  
  // Statut et workflow
  status: FolderStatus;
  processing_stage: ProcessingStage;
  health_status: HealthStatus;
  performance_rating?: PerformanceRating;
  
  // Régime douanier et conformité
  customs_regime: CustomsRegime;
  compliance_status: ComplianceStatus;
  
  // Services
  service_type: ServiceType;
  operation_type: OperationType;
  
  // Description et notes
  description?: string;
  cargo_description?: string;
  special_instructions?: string;
  notes?: string;
  
  // Dates importantes
  created_date: string;
  expected_start_date?: string;
  actual_start_date?: string;
  expected_completion_date?: string;
  actual_completion_date?: string;
  deadline_date?: string;
  
  // Informations financières
  financial_info: FinancialInfo;
  
  // Métriques de performance
  sla_compliance?: number;      // Pourcentage de respect des SLA
  processing_time_days?: number;
  cost_efficiency?: number;
  
  // Relations
  parent_folder_id?: string;    // Dossier parent (pour sous-dossiers)
  related_folder_ids?: string[]; // Dossiers liés
  
  // Poids et mesures globaux
  total_weight_kg?: number;
  total_volume_cbm?: number;
  total_packages?: number;
  
  // Métadonnées système
  metadata: AuditMetadata;
  
  // Relations (populated via joins)
  bills_of_lading?: BillOfLading[];
  parent_folder?: Folder;
  child_folders?: Folder[];
}

/**
 * Version légère du dossier pour les listes
 */
export interface FolderSummary {
  id: string;
  folder_number: string;
  reference_number?: string;
  type: FolderType;
  category: FolderCategory;
  priority: FolderPriority;
  status: FolderStatus;
  processing_stage: ProcessingStage;
  health_status: HealthStatus;
  client_name: string;
  origin_name: string;
  destination_name: string;
  created_date: string;
  expected_completion_date?: string;
  sla_compliance?: number;
}

/**
 * Configuration d'affichage des dossiers
 */
export interface FolderDisplayConfig {
  show_internal_fields: boolean;
  show_financial_info: boolean;
  show_performance_metrics: boolean;
  show_audit_trail: boolean;
  default_view: 'summary' | 'detailed' | 'timeline';
  custom_fields?: Array<{
    key: string;
    label: string;
    visible: boolean;
    order: number;
  }>;
}