/**
 * Enums pour le système Bills of Lading (BL)
 * Correspondant aux types PostgreSQL de la base de données
 */

// ============================================================================
// Statuts et termes commerciaux
// ============================================================================

export type BLStatus = 
  | 'draft'      // Brouillon
  | 'issued'     // Émis
  | 'shipped'    // Embarqué
  | 'discharged' // Déchargé
  | 'delivered'  // Livré
  | 'cancelled'; // Annulé

export type FreightTerms = 'prepaid' | 'collect' | 'prepaid_collect';

export type LoadingMethod = 
  | 'FCL'        // Full Container Load
  | 'LCL'        // Less than Container Load
  | 'RORO'       // Roll-on/Roll-off
  | 'BREAK_BULK'; // Vrac conventionnel

// ============================================================================
// Types de frais et charges
// ============================================================================

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
// Compagnies maritimes et conteneurs
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