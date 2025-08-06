/**
 * Relations entre dossiers et entités liées
 */

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
  
  // Métadonnées de la relation
  relationship_notes?: string;
  
  // Audit
  created_by: string;
  created_at: string;
  updated_by?: string;
  updated_at?: string;
}

/**
 * Document attaché à un dossier
 */
export interface FolderDocument {
  id: string;
  folder_id: string;
  
  // Informations du document
  document_name: string;
  document_type: string;
  document_category: DocumentCategory;
  file_path: string;
  file_size_bytes: number;
  mime_type: string;
  
  // Métadonnées
  upload_date: string;
  uploaded_by: string;
  description?: string;
  tags?: string[];
  
  // Statut et validation
  status: DocumentStatus;
  is_required: boolean;
  validation_status?: 'valid' | 'invalid' | 'pending' | 'expired';
  validation_notes?: string;
  validated_by?: string;
  validated_at?: string;
  
  // Dates importantes
  document_date?: string;
  expiry_date?: string;
  
  // Contrôle d'accès
  is_confidential: boolean;
  access_level: 'public' | 'internal' | 'restricted' | 'confidential';
  
  // Version et révision
  version?: string;
  revision_number?: number;
  replaces_document_id?: string;
}

/**
 * Catégories de documents
 */
export type DocumentCategory =
  | 'commercial'        // Documents commerciaux (factures, etc.)
  | 'transport'         // Documents de transport (BL, etc.)
  | 'customs'           // Documents douaniers
  | 'insurance'         // Documents d'assurance
  | 'certificate'       // Certificats (origine, qualité, etc.)
  | 'permit'            // Permis et autorisations
  | 'correspondence'    // Correspondance
  | 'invoice'           // Factures et documents financiers
  | 'legal'             // Documents légaux
  | 'technical'         // Spécifications techniques
  | 'photo'             // Photos et images
  | 'other';            // Autres documents

/**
 * Types de documents
 */
export const DOCUMENT_TYPES = {
  // Documents commerciaux
  COMMERCIAL_INVOICE: 'commercial_invoice',
  PACKING_LIST: 'packing_list',
  PURCHASE_ORDER: 'purchase_order',
  SALES_CONTRACT: 'sales_contract',
  PROFORMA_INVOICE: 'proforma_invoice',
  
  // Documents de transport
  BILL_OF_LADING: 'bill_of_lading',
  AIRWAY_BILL: 'airway_bill',
  ROAD_WAYBILL: 'road_waybill',
  RAIL_WAYBILL: 'rail_waybill',
  
  // Documents douaniers
  CUSTOMS_DECLARATION: 'customs_declaration',
  IMPORT_LICENSE: 'import_license',
  EXPORT_LICENSE: 'export_license',
  CERTIFICATE_OF_ORIGIN: 'certificate_of_origin',
  
  // Certificats
  QUALITY_CERTIFICATE: 'quality_certificate',
  HEALTH_CERTIFICATE: 'health_certificate',
  PHYTOSANITARY_CERTIFICATE: 'phytosanitary_certificate',
  
  // Documents d'assurance
  INSURANCE_POLICY: 'insurance_policy',
  INSURANCE_CERTIFICATE: 'insurance_certificate',
  
  // Autres
  PHOTO: 'photo',
  CORRESPONDENCE: 'correspondence',
  TECHNICAL_SPEC: 'technical_specification',
  OTHER: 'other'
} as const;

export type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES];

/**
 * Activité sur un dossier
 */
export interface FolderActivity {
  id: string;
  folder_id: string;
  
  // Type d'activité
  activity_type: ActivityType;
  activity_category: ActivityCategory;
  
  // Description
  title: string;
  description?: string;
  
  // Utilisateur et dates
  performed_by: string;
  performed_by_name?: string;
  performed_at: string;
  
  // Contexte
  location?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  
  // Métadonnées
  metadata?: Record<string, any>;
  
  // Impact
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  
  // Visibilité
  is_internal: boolean;
  is_client_visible: boolean;
}

/**
 * Types d'activité
 */
export type ActivityType =
  | 'status_change'     // Changement de statut
  | 'document_upload'   // Upload de document
  | 'document_update'   // Mise à jour de document
  | 'comment_added'     // Commentaire ajouté
  | 'assignment_change' // Changement d'assignation
  | 'location_update'   // Mise à jour de localisation
  | 'cost_update'       // Mise à jour des coûts
  | 'alert_triggered'   // Alerte déclenchée
  | 'alert_resolved'    // Alerte résolue
  | 'milestone_reached' // Étape franchie
  | 'delay_reported'    // Retard signalé
  | 'issue_reported'    // Problème signalé
  | 'issue_resolved'    // Problème résolu
  | 'approval_requested'// Demande d'approbation
  | 'approval_granted'  // Approbation accordée
  | 'approval_rejected' // Approbation refusée
  | 'communication_sent'// Communication envoyée
  | 'payment_received'  // Paiement reçu
  | 'customs_cleared'   // Dédouané
  | 'delivery_completed'// Livraison terminée
  | 'other';           // Autre

/**
 * Catégories d'activité
 */
export type ActivityCategory =
  | 'administrative'    // Administrative
  | 'operational'       // Opérationnelle
  | 'financial'         // Financière
  | 'customs'           // Douanière
  | 'transport'         // Transport
  | 'client'            // Relation client
  | 'system'            // Système
  | 'compliance';       // Conformité

import type { DocumentStatus } from '../constants';