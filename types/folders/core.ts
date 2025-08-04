/**
 * Interfaces principales du système de gestion des dossiers
 * Types pour les entités centrales : dossiers, relations, métadonnées
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
  DocumentStatus,
  HealthStatus,
  PerformanceRating,
  ServiceType,
  OperationType
} from './enums';

// Import des types BL depuis le module dédié
import type { BillOfLading } from '../bl/core';

// ============================================================================
// Structures JSON communes
// ============================================================================

/**
 * Informations de contact client
 */
export interface ClientInfo {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tax_id?: string;
  client_code?: string;
  account_manager?: string;
}

/**
 * Coordonnées géographiques et informations de lieu
 */
export interface LocationInfo {
  name: string;
  address?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timezone?: string;
  port_code?: string;
  airport_code?: string;
}

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
 * Métadonnées de traçabilité
 */
export interface AuditMetadata {
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  
  // Soft delete
  deleted_at?: string;
  deleted_by?: string;
  
  // Version et historique
  version?: number;
  last_modified_by?: string;
  modification_reason?: string;
}

// ============================================================================
// Interface principale : Dossier
// ============================================================================

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
  alerts?: FolderAlert[];
  documents?: FolderDocument[];
  activities?: FolderActivity[];
  parent_folder?: Folder;
  child_folders?: Folder[];
}

/**
 * Relation entre dossier et Bills of Lading
 */
export interface FolderBLRelation {
  id: string;
  folder_id: string;
  bl_id: string;
  
  // Type de relation
  relation_type: 'primary' | 'secondary' | 'reference';
  
  // Ordre dans le dossier
  sequence_order?: number;
  
  // Statut de la relation
  is_active: boolean;
  
  // Métadonnées de la relation
  linked_at: string;
  linked_by?: string;
  notes?: string;
  
  // Relations (populated via joins)
  folder?: Folder;
  bill_of_lading?: BillOfLading;
}

// ============================================================================
// Documents et pièces jointes
// ============================================================================

/**
 * Document associé à un dossier
 */
export interface FolderDocument {
  id: string;
  folder_id: string;
  
  // Identification du document
  document_name: string;
  document_type: string;        // 'invoice', 'bl', 'certificate', 'permit', etc.
  document_category: 'required' | 'optional' | 'supporting';
  
  // Fichier
  file_name?: string;
  file_path?: string;
  file_size?: number;
  file_type?: string;           // MIME type
  file_hash?: string;           // Pour vérification d'intégrité
  
  // Statut et validation
  status: DocumentStatus;
  is_original: boolean;
  is_certified: boolean;
  
  // Dates importantes
  issued_date?: string;
  expiry_date?: string;
  received_date?: string;
  validated_date?: string;
  
  // Métadonnées
  description?: string;
  notes?: string;
  tags?: string[];
  
  // Traçabilité
  uploaded_by?: string;
  uploaded_at: string;
  validated_by?: string;
  
  // Relations
  folder?: Folder;
}

// ============================================================================
// Activités et historique
// ============================================================================

/**
 * Activité sur un dossier (historique des actions)
 */
export interface FolderActivity {
  id: string;
  folder_id: string;
  
  // Type d'activité
  activity_type: 
    | 'created'
    | 'status_changed'
    | 'document_added'
    | 'document_validated'
    | 'bl_linked'
    | 'bl_unlinked'
    | 'note_added'
    | 'location_updated'
    | 'alert_created'
    | 'alert_resolved'
    | 'cost_updated'
    | 'deadline_changed'
    | 'assigned'
    | 'completed';
  
  // Description de l'activité
  title: string;
  description?: string;
  
  // Détails de l'action
  old_value?: string;
  new_value?: string;
  entity_type?: string;         // Type d'entité affectée
  entity_id?: string;           // ID de l'entité affectée
  
  // Métadonnées
  performed_by?: string;
  performed_at: string;
  ip_address?: string;
  user_agent?: string;
  
  // Contexte business
  business_impact?: 'low' | 'medium' | 'high' | 'critical';
  requires_notification?: boolean;
  
  // Relations
  folder?: Folder;
}

// ============================================================================
// Alertes (définition de base, détails dans alerts.ts)
// ============================================================================

/**
 * Alerte associée à un dossier (interface de base)
 */
export interface FolderAlert {
  id: string;
  folder_id: string;
  created_at: string;
  updated_at: string;
  
  // Sera étendu dans alerts.ts
}

// ============================================================================
// Statistiques et métriques
// ============================================================================

/**
 * Statistiques d'un dossier
 */
export interface FolderStatistics {
  folder_id: string;
  
  // Compteurs
  total_bls: number;
  total_containers: number;
  total_documents: number;
  total_activities: number;
  active_alerts: number;
  
  // Métriques temporelles
  processing_days: number;
  days_until_deadline?: number;
  days_overdue?: number;
  
  // Métriques financières
  total_estimated_cost: number;
  total_actual_cost: number;
  cost_variance_percentage: number;
  
  // Métriques de performance
  document_completion_rate: number;    // Pourcentage de documents complétés
  sla_adherence_rate: number;          // Respect des SLA
  efficiency_score: number;            // Score d'efficacité global
  
  // Métriques de qualité
  error_count: number;
  rework_count: number;
  client_satisfaction_score?: number;
  
  // Dernière mise à jour
  calculated_at: string;
}

// ============================================================================
// Configuration et paramètres
// ============================================================================

/**
 * Paramètres de configuration d'un dossier
 */
export interface FolderConfiguration {
  folder_id: string;
  
  // Paramètres de notification
  notification_settings: {
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
    notification_frequency: 'immediate' | 'daily' | 'weekly';
    recipients: string[];
  };
  
  // Paramètres d'alerte
  alert_settings: {
    deadline_warning_days: number;
    cost_overrun_threshold: number;
    auto_escalation_enabled: boolean;
    escalation_delay_hours: number;
  };
  
  // Paramètres de workflow
  workflow_settings: {
    auto_progression_enabled: boolean;
    approval_required_stages: ProcessingStage[];
    parallel_processing_allowed: boolean;
  };
  
  // Paramètres de reporting
  reporting_settings: {
    generate_daily_reports: boolean;
    include_cost_analysis: boolean;
    include_performance_metrics: boolean;
    report_recipients: string[];
  };
  
  created_at: string;
  updated_at: string;
  updated_by?: string;
}