/**
 * Enums pour le système de gestion des clients
 * Types d'énumération pour particuliers et entreprises
 */

// ============================================================================
// Enums principaux pour la classification des clients
// ============================================================================

/**
 * Type de client - Discriminant principal pour l'union
 */
export type ClientType = 'individual' | 'business';

/**
 * Statut du client dans le système
 */
export type ClientStatus = 'active' | 'inactive' | 'suspended' | 'archived';

/**
 * Secteurs d'activité pour les entreprises
 */
export type Industry =
  | 'agriculture'
  | 'automotive'
  | 'banking'
  | 'construction'
  | 'consulting'
  | 'education'
  | 'energy'
  | 'finance'
  | 'food_beverage'
  | 'healthcare'
  | 'hospitality'
  | 'information_technology'
  | 'insurance'
  | 'logistics'
  | 'manufacturing'
  | 'media'
  | 'mining'
  | 'pharmaceutical'
  | 'real_estate'
  | 'retail'
  | 'telecommunications'
  | 'textiles'
  | 'transportation'
  | 'utilities'
  | 'other';

// ============================================================================
// Enums pour la gestion commerciale
// ============================================================================

/**
 * Méthodes de paiement acceptées
 */
export type PaymentMethod = 
  | 'bank_transfer'
  | 'check'
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'electronic_payment'
  | 'cryptocurrency'
  | 'other';

/**
 * Conditions de paiement standard
 */
export type PaymentTerms = 
  | 'immediate'    // 0 jours
  | 'net_15'       // 15 jours
  | 'net_30'       // 30 jours (défaut)
  | 'net_45'       // 45 jours
  | 'net_60'       // 60 jours
  | 'net_90'       // 90 jours
  | 'custom';      // Délai personnalisé

/**
 * Types de contact pour les clients
 */
export type ContactType = 
  | 'primary'      // Contact principal
  | 'billing'      // Contact facturation
  | 'delivery'     // Contact livraison
  | 'technical'    // Contact technique
  | 'emergency'    // Contact urgence
  | 'legal'        // Contact juridique
  | 'other';       // Autre type de contact

// ============================================================================
// Enums pour la géolocalisation
// ============================================================================

/**
 * Codes pays ISO 3166-1 alpha-2 supportés
 */
export type CountryCode = 'FR' | 'BE' | 'DE' | 'ES' | 'IT' | 'NL' | 'GB' | 'CH' | 'LU' | 'PT' | 'MA' | 'TN' | 'DZ' | 'SN' | 'CI' | 'OTHER';

/**
 * Codes de langue supportés (ISO 639-1)
 */
export type LanguageCode = 'fr' | 'en' | 'es' | 'de' | 'it' | 'nl' | 'ar';

// ============================================================================
// Enums pour l'audit et les workflows
// ============================================================================

/**
 * Types d'événements pour l'audit des clients
 */
export type ClientAuditEventType = 
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'contact_added'
  | 'contact_updated'
  | 'contact_removed'
  | 'credit_limit_changed'
  | 'payment_terms_changed'
  | 'archived'
  | 'deleted'
  | 'restored';

/**
 * Niveaux de priorité pour les clients
 */
export type ClientPriority = 'low' | 'normal' | 'high' | 'critical';

/**
 * Types de risques client
 */
export type ClientRiskLevel = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// Enums pour la recherche et les filtres
// ============================================================================

/**
 * Critères de tri pour les listes de clients
 */
export type ClientSortField = 
  | 'display_name'     // Nom d'affichage
  | 'email'            // Adresse email
  | 'client_type'      // Type de client
  | 'status'           // Statut
  | 'country'          // Pays
  | 'city'             // Ville
  | 'credit_limit'     // Limite de crédit
  | 'payment_terms_days' // Délai de paiement
  | 'created_at'       // Date de création
  | 'updated_at';      // Date de mise à jour

/**
 * Opérateurs de recherche pour les clients
 */
export type ClientSearchOperator = 
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'in'
  | 'not_in'
  | 'greater_than'
  | 'greater_than_equal'
  | 'less_than'
  | 'less_than_equal'
  | 'between'
  | 'is_null'
  | 'is_not_null';

// ============================================================================
// Collections d'enums organisées
// ============================================================================

/**
 * Ensemble des statuts de client
 */
export const CLIENT_STATUSES: readonly ClientStatus[] = [
  'active',
  'inactive',
  'suspended',
  'archived'
] as const;

/**
 * Ensemble des types de client
 */
export const CLIENT_TYPES: readonly ClientType[] = [
  'individual',
  'business'
] as const;

/**
 * Ensemble des secteurs d'activité
 */
export const INDUSTRIES: readonly Industry[] = [
  'agriculture',
  'automotive',
  'banking',
  'construction',
  'consulting',
  'education',
  'energy',
  'finance',
  'food_beverage',
  'healthcare',
  'hospitality',
  'information_technology',
  'insurance',
  'logistics',
  'manufacturing',
  'media',
  'mining',
  'pharmaceutical',
  'real_estate',
  'retail',
  'telecommunications',
  'textiles',
  'transportation',
  'utilities',
  'other'
] as const;

/**
 * Ensemble des codes pays supportés
 */
export const COUNTRY_CODES: readonly CountryCode[] = [
  'FR', 'BE', 'DE', 'ES', 'IT', 'NL', 'GB', 'CH', 'LU', 'PT', 
  'MA', 'TN', 'DZ', 'SN', 'CI', 'OTHER'
] as const;

/**
 * Ensemble des codes de langue supportés
 */
export const LANGUAGE_CODES: readonly LanguageCode[] = [
  'fr', 'en', 'es', 'de', 'it', 'nl', 'ar'
] as const;

/**
 * Ensemble des conditions de paiement
 */
export const PAYMENT_TERMS: readonly PaymentTerms[] = [
  'immediate',
  'net_15',
  'net_30',
  'net_45',
  'net_60',
  'net_90',
  'custom'
] as const;

// ============================================================================
// Types guards et utilitaires
// ============================================================================

/**
 * Vérifie si une valeur est un type de client valide
 */
export function isClientType(value: unknown): value is ClientType {
  return typeof value === 'string' && CLIENT_TYPES.includes(value as ClientType);
}

/**
 * Vérifie si une valeur est un statut de client valide
 */
export function isClientStatus(value: unknown): value is ClientStatus {
  return typeof value === 'string' && CLIENT_STATUSES.includes(value as ClientStatus);
}

/**
 * Vérifie si une valeur est un secteur d'activité valide
 */
export function isIndustry(value: unknown): value is Industry {
  return typeof value === 'string' && INDUSTRIES.includes(value as Industry);
}

/**
 * Vérifie si une valeur est un code pays valide
 */
export function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === 'string' && COUNTRY_CODES.includes(value as CountryCode);
}

/**
 * Vérifie si une valeur est un code de langue valide
 */
export function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === 'string' && LANGUAGE_CODES.includes(value as LanguageCode);
}

// ============================================================================
// Mappings pour l'internationalisation
// ============================================================================

/**
 * Labels pour les types de clients (multilingue)
 */
export const CLIENT_TYPE_LABELS = {
  individual: {
    fr: 'Particulier',
    en: 'Individual',
    es: 'Particular'
  },
  business: {
    fr: 'Entreprise',
    en: 'Business',
    es: 'Empresa'
  }
} as const;

/**
 * Labels pour les statuts de clients (multilingue)
 */
export const CLIENT_STATUS_LABELS = {
  active: {
    fr: 'Actif',
    en: 'Active',
    es: 'Activo'
  },
  inactive: {
    fr: 'Inactif',
    en: 'Inactive',
    es: 'Inactivo'
  },
  suspended: {
    fr: 'Suspendu',
    en: 'Suspended',
    es: 'Suspendido'
  },
  archived: {
    fr: 'Archivé',
    en: 'Archived',
    es: 'Archivado'
  }
} as const;

/**
 * Labels pour les secteurs d'activité (multilingue)
 */
export const INDUSTRY_LABELS = {
  agriculture: { fr: 'Agriculture', en: 'Agriculture', es: 'Agricultura' },
  automotive: { fr: 'Automobile', en: 'Automotive', es: 'Automoción' },
  banking: { fr: 'Banque', en: 'Banking', es: 'Banca' },
  construction: { fr: 'Construction', en: 'Construction', es: 'Construcción' },
  consulting: { fr: 'Conseil', en: 'Consulting', es: 'Consultoría' },
  education: { fr: 'Éducation', en: 'Education', es: 'Educación' },
  energy: { fr: 'Énergie', en: 'Energy', es: 'Energía' },
  finance: { fr: 'Finance', en: 'Finance', es: 'Finanzas' },
  food_beverage: { fr: 'Agroalimentaire', en: 'Food & Beverage', es: 'Alimentación y Bebidas' },
  healthcare: { fr: 'Santé', en: 'Healthcare', es: 'Salud' },
  hospitality: { fr: 'Hôtellerie', en: 'Hospitality', es: 'Hostelería' },
  information_technology: { fr: 'Technologies de l\'information', en: 'Information Technology', es: 'Tecnología de la Información' },
  insurance: { fr: 'Assurance', en: 'Insurance', es: 'Seguros' },
  logistics: { fr: 'Logistique', en: 'Logistics', es: 'Logística' },
  manufacturing: { fr: 'Fabrication', en: 'Manufacturing', es: 'Manufactura' },
  media: { fr: 'Médias', en: 'Media', es: 'Medios' },
  mining: { fr: 'Mines', en: 'Mining', es: 'Minería' },
  pharmaceutical: { fr: 'Pharmaceutique', en: 'Pharmaceutical', es: 'Farmacéutico' },
  real_estate: { fr: 'Immobilier', en: 'Real Estate', es: 'Inmobiliario' },
  retail: { fr: 'Commerce de détail', en: 'Retail', es: 'Venta minorista' },
  telecommunications: { fr: 'Télécommunications', en: 'Telecommunications', es: 'Telecomunicaciones' },
  textiles: { fr: 'Textile', en: 'Textiles', es: 'Textiles' },
  transportation: { fr: 'Transport', en: 'Transportation', es: 'Transporte' },
  utilities: { fr: 'Services publics', en: 'Utilities', es: 'Servicios públicos' },
  other: { fr: 'Autre', en: 'Other', es: 'Otro' }
} as const;