/**
 * Enums pour le système de gestion des dossiers
 * Types pour les statuts, priorités et classifications
 */

// ============================================================================
// Statuts des dossiers
// ============================================================================

export type FolderStatus = 
  | 'open'        // Dossier ouvert, en cours de traitement
  | 'processing'  // En cours de traitement actif
  | 'completed'   // Dossier terminé avec succès
  | 'closed'      // Dossier fermé définitivement
  | 'on_hold'     // Dossier mis en attente
  | 'cancelled';  // Dossier annulé

// ============================================================================
// Types et catégories de dossiers
// ============================================================================

export type FolderType = 
  | 'import'      // Dossier d'importation
  | 'export'      // Dossier d'exportation
  | 'transit'     // Dossier de transit
  | 'transhipment' // Dossier de transbordement
  | 'storage'     // Dossier de stockage
  | 'consolidation' // Dossier de groupage
  | 'distribution'; // Dossier de distribution

export type FolderCategory = 
  | 'commercial'   // Dossier commercial standard
  | 'urgent'       // Dossier urgent/express
  | 'vip'          // Dossier client VIP
  | 'hazmat'       // Matières dangereuses
  | 'perishable'   // Denrées périssables
  | 'oversized'    // Colis hors dimensions
  | 'fragile'      // Marchandises fragiles
  | 'high_value';  // Forte valeur déclarée

// ============================================================================
// Priorités et urgences
// ============================================================================

export type FolderPriority = 
  | 'low'          // Priorité faible
  | 'normal'       // Priorité normale (défaut DB)
  | 'urgent'       // Urgent (correspond à DB)
  | 'critical';    // Critique (correspond à DB)

// ============================================================================
// Régimes douaniers et réglementaires
// ============================================================================

export type CustomsRegime = 
  | 'import_for_consumption'    // Importation pour consommation
  | 'temporary_admission'       // Admission temporaire
  | 'customs_warehouse'         // Entrepôt sous douane
  | 'transit'                   // Régime de transit
  | 'free_zone'                 // Zone franche
  | 'processing_under_customs'  // Perfectionnement sous douane
  | 'temporary_export'          // Exportation temporaire
  | 'definitive_export'         // Exportation définitive
  | 'duty_free'                 // Exempt de droits
  | 'preferential';             // Régime préférentiel

export type ComplianceStatus = 
  | 'compliant'        // Conforme
  | 'pending_review'   // En attente de vérification
  | 'non_compliant'    // Non conforme
  | 'requires_action'  // Nécessite une action
  | 'under_investigation' // Sous enquête
  | 'exempted';        // Dispensé

// ============================================================================
// États de traitement et workflow
// ============================================================================

export type ProcessingStage = 
  | 'intake'           // Prise en charge initiale
  | 'documentation'    // Préparation documentaire
  | 'customs_clearance' // Dédouanement
  | 'inspection'       // Contrôle/inspection
  | 'storage'          // Mise en stockage
  | 'preparation'      // Préparation à la livraison
  | 'delivery'         // Livraison
  | 'invoicing'        // Facturation
  | 'closure';         // Clôture du dossier

export type DocumentStatus = 
  | 'missing'          // Document manquant
  | 'pending'          // En attente de réception
  | 'received'         // Reçu
  | 'under_review'     // En cours de vérification
  | 'approved'         // Approuvé
  | 'rejected'         // Rejeté
  | 'expired'          // Expiré
  | 'archived';        // Archivé

// ============================================================================
// Alertes et notifications
// ============================================================================

export type AlertType = 
  | 'deadline'         // Échéance approchant
  | 'document_missing' // Document manquant
  | 'compliance_issue' // Problème de conformité
  | 'delay'            // Retard détecté
  | 'cost_overrun'     // Dépassement de coût
  | 'client_request'   // Demande client
  | 'system_error'     // Erreur système
  | 'customs_hold'     // Retenue douanière
  | 'inspection_required' // Inspection requise
  | 'payment_due';     // Paiement en attente

export type AlertSeverity = 
  | 'info'            // Information
  | 'low'             // Faible
  | 'medium'          // Moyen
  | 'high'            // Élevé
  | 'critical';       // Critique

export type AlertStatus = 
  | 'active'          // Alerte active
  | 'acknowledged'    // Alerte accusée réception
  | 'in_progress'     // En cours de traitement
  | 'resolved'        // Alerte résolue
  | 'dismissed'       // Alerte écartée
  | 'escalated';      // Alerte escaladée

// ============================================================================
// Indicateurs de performance et santé
// ============================================================================

export type HealthStatus = 
  | 'healthy'         // Dossier en bonne santé
  | 'warning'         // Attention requise
  | 'critical'        // État critique
  | 'failed';         // Échec

export type PerformanceRating = 
  | 'excellent'       // Performance excellente
  | 'good'            // Bonne performance
  | 'average'         // Performance moyenne
  | 'below_average'   // Sous la moyenne
  | 'poor';           // Performance médiocre

// ============================================================================
// Types de services et opérations
// ============================================================================

export type ServiceType = 
  | 'full_service'    // Service complet
  | 'customs_only'    // Dédouanement uniquement
  | 'transport_only'  // Transport uniquement
  | 'storage_only'    // Stockage uniquement
  | 'documentation'   // Services documentaires
  | 'consulting'      // Conseil
  | 'inspection'      // Services d'inspection
  | 'insurance';      // Services d'assurance

export type OperationType = 
  | 'standard'        // Opération standard
  | 'express'         // Service express
  | 'consolidation'   // Groupage
  | 'deconsolidation' // Dégroupage
  | 'cross_docking'   // Cross-docking
  | 'value_added'     // Services à valeur ajoutée
  | 'special_handling'; // Manutention spéciale