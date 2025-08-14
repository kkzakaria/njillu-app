/**
 * Interfaces principales pour la gestion des clients
 * Support pour particuliers et entreprises avec discriminated union
 */

import type { 
  EntityId, 
  Timestamp, 
  CurrencyCode, 
  AuditMetadata,
  SoftDeletable 
} from '../shared';

import type {
  ClientType,
  ClientStatus,
  Industry,
  PaymentMethod,
  PaymentTerms,
  ContactType,
  CountryCode,
  LanguageCode,
  ClientPriority,
  ClientRiskLevel
} from './enums';

// ============================================================================
// Interfaces pour les informations géographiques
// ============================================================================

/**
 * Adresse complète d'un client
 */
export interface ClientAddress {
  /** Première ligne d'adresse (rue, numéro) */
  address_line1?: string;
  
  /** Deuxième ligne d'adresse (complément) */
  address_line2?: string;
  
  /** Ville */
  city?: string;
  
  /** Code postal */
  postal_code?: string;
  
  /** État/Province/Région */
  state_province?: string;
  
  /** Code pays ISO 3166-1 alpha-2 */
  country: CountryCode;
}

/**
 * Informations de contact
 */
export interface ContactInfo {
  /** Adresse email */
  email: string;
  
  /** Numéro de téléphone au format international */
  phone?: string;
  
  /** Numéro de téléphone mobile */
  mobile_phone?: string;
  
  /** Numéro de fax */
  fax?: string;
  
  /** Site web */
  website?: string;
  
  /** Adresse complète */
  address?: ClientAddress;
}

// ============================================================================
// Interfaces pour les informations commerciales
// ============================================================================

/**
 * Informations commerciales du client
 */
export interface CommercialInfo {
  /** Limite de crédit accordée */
  credit_limit: number;
  
  /** Devise de la limite de crédit */
  credit_limit_currency: CurrencyCode;
  
  /** Délai de paiement en jours */
  payment_terms_days: number;
  
  /** Conditions de paiement */
  payment_terms: PaymentTerms;
  
  /** Méthodes de paiement acceptées */
  payment_methods: PaymentMethod[];
  
  /** Langue préférée du client */
  preferred_language: LanguageCode;
  
  /** Priorité du client */
  priority: ClientPriority;
  
  /** Niveau de risque */
  risk_level: ClientRiskLevel;
}

/**
 * Historique des transactions commerciales
 */
export interface CommercialHistory {
  /** Montant total des commandes */
  total_orders_amount: number;
  
  /** Nombre total de commandes */
  total_orders_count: number;
  
  /** Montant de la dernière commande */
  last_order_amount?: number;
  
  /** Date de la dernière commande */
  last_order_date?: Timestamp;
  
  /** Solde actuel du compte */
  current_balance: number;
  
  /** Nombre de jours de retard moyen */
  average_payment_delay_days: number;
}

// ============================================================================
// Interfaces pour les particuliers (Individual)
// ============================================================================

/**
 * Informations spécifiques aux particuliers
 */
export interface IndividualInfo {
  /** Prénom */
  first_name: string;
  
  /** Nom de famille */
  last_name: string;
  
  /** Date de naissance */
  date_of_birth?: string; // Format ISO date
  
  /** Numéro de pièce d'identité */
  personal_id?: string;
  
  /** Type de pièce d'identité */
  personal_id_type?: 'passport' | 'national_id' | 'driver_license' | 'other';
  
  /** Titre (Mr, Mme, Dr, etc.) */
  title?: string;
  
  /** Genre */
  gender?: 'male' | 'female' | 'other' | 'not_specified';
  
  /** Profession */
  profession?: string;
}

// ============================================================================
// Interfaces pour les entreprises (Business)
// ============================================================================

/**
 * Personne de contact dans l'entreprise
 */
export interface ContactPerson {
  /** Prénom du contact */
  first_name: string;
  
  /** Nom du contact */
  last_name: string;
  
  /** Titre/Fonction du contact */
  title?: string;
  
  /** Département */
  department?: string;
  
  /** Type de contact */
  contact_type: ContactType;
  
  /** Informations de contact spécifiques */
  contact_info?: Partial<ContactInfo>;
  
  /** Contact principal ? */
  is_primary: boolean;
  
  /** Contact actif ? */
  is_active: boolean;
}

/**
 * Informations légales de l'entreprise
 */
export interface LegalInfo {
  /** Numéro SIRET (France) */
  siret?: string;
  
  /** Numéro de TVA intracommunautaire */
  vat_number?: string;
  
  /** Numéro d'entreprise (Belgique) */
  company_number?: string;
  
  /** Code APE/NAF (France) */
  ape_code?: string;
  
  /** Capital social */
  share_capital?: number;
  
  /** Devise du capital social */
  share_capital_currency?: CurrencyCode;
  
  /** Forme juridique */
  legal_form?: string;
  
  /** Date de création de l'entreprise */
  incorporation_date?: string; // Format ISO date
}

/**
 * Informations spécifiques aux entreprises
 */
export interface BusinessInfo {
  /** Nom de l'entreprise */
  company_name: string;
  
  /** Nom commercial (si différent) */
  trade_name?: string;
  
  /** Secteur d'activité */
  industry: Industry;
  
  /** Description de l'activité */
  business_description?: string;
  
  /** Nombre d'employés */
  employee_count?: number;
  
  /** Chiffre d'affaires annuel */
  annual_turnover?: number;
  
  /** Devise du chiffre d'affaires */
  annual_turnover_currency?: CurrencyCode;
  
  /** Personnes de contact */
  contacts: ContactPerson[];
  
  /** Informations légales */
  legal_info?: LegalInfo;
  
  /** Certification ISO ou autres */
  certifications?: string[];
}

// ============================================================================
// Interface principale - Discriminated Union
// ============================================================================

/**
 * Interface de base commune à tous les clients
 */
interface BaseClient extends SoftDeletable {
  /** Identifiant unique du client */
  id: EntityId;
  
  /** Type de client - Discriminant pour l'union */
  client_type: ClientType;
  
  /** Statut du client */
  status: ClientStatus;
  
  /** Informations de contact principales */
  contact_info: ContactInfo;
  
  /** Informations commerciales */
  commercial_info: CommercialInfo;
  
  /** Historique commercial */
  commercial_history?: CommercialHistory;
  
  /** Notes internes (visibles équipe uniquement) */
  internal_notes?: string;
  
  /** Notes client (visibles par le client) */
  client_notes?: string;
  
  /** Tags pour classification */
  tags?: string[];
  
  /** Utilisateur ayant créé le client */
  created_by: EntityId;
  
  /** Timestamps */
  created_at: Timestamp;
  updated_at: Timestamp;
}

/**
 * Client particulier
 */
export interface IndividualClient extends BaseClient {
  client_type: 'individual';
  individual_info: IndividualInfo;
  business_info?: never; // Exclusion explicite
}

/**
 * Client entreprise
 */
export interface BusinessClient extends BaseClient {
  client_type: 'business';
  business_info: BusinessInfo;
  individual_info?: never; // Exclusion explicite
}

/**
 * Union discriminée de tous les types de clients
 */
export type Client = IndividualClient | BusinessClient;

// ============================================================================
// Interfaces dérivées et utilitaires
// ============================================================================

/**
 * Nom d'affichage calculé selon le type de client
 */
export interface ClientDisplayInfo {
  /** Nom d'affichage principal */
  display_name: string;
  
  /** Nom du contact principal */
  contact_name: string;
  
  /** Label du type en français */
  type_label_fr: string;
  
  /** Label du type en anglais */
  type_label_en: string;
  
  /** Label du type en espagnol */
  type_label_es: string;
}

/**
 * Vue simplifiée d'un client pour les listes
 */
export interface ClientSummary {
  id: EntityId;
  client_type: ClientType;
  status: ClientStatus;
  display_name: string;
  email: string;
  phone?: string;
  city?: string;
  country: CountryCode;
  credit_limit: number;
  credit_limit_currency: CurrencyCode;
  created_at: Timestamp;
  updated_at: Timestamp;
}

/**
 * Vue détaillée d'un client avec informations calculées
 */
export interface ClientDetail {
  /** Client de base */
  client: Client;
  
  /** Informations d'affichage calculées */
  display_info: ClientDisplayInfo;
  
  /** Nombre total de dossiers */
  total_folders?: number;
  
  /** Nombre de dossiers actifs */
  active_folders?: number;
  
  /** Dernière activité */
  last_activity_date?: Timestamp;
  
  /** Peut être modifié par l'utilisateur actuel */
  can_modify?: boolean;
  
  /** Peut être supprimé par l'utilisateur actuel */
  can_delete?: boolean;
}

// ============================================================================
// Types pour les relations avec d'autres entités
// ============================================================================

/**
 * Relation client-dossier
 */
export interface ClientFolder {
  /** ID du client */
  client_id: EntityId;
  
  /** ID du dossier */
  folder_id: EntityId;
  
  /** Rôle du client dans le dossier */
  role: 'shipper' | 'consignee' | 'notify_party' | 'bill_to' | 'other';
  
  /** Date d'association */
  associated_at: Timestamp;
}

/**
 * Statistiques d'un client
 */
export interface ClientStatistics {
  /** ID du client */
  client_id: EntityId;
  
  /** Nombre total de dossiers */
  total_folders: number;
  
  /** Nombre de dossiers par statut */
  folders_by_status: Record<string, number>;
  
  /** Chiffre d'affaires total */
  total_revenue: number;
  
  /** Devise du chiffre d'affaires */
  revenue_currency: CurrencyCode;
  
  /** Délai de paiement moyen */
  average_payment_delay: number;
  
  /** Score de satisfaction (0-100) */
  satisfaction_score?: number;
  
  /** Période de calcul */
  calculated_at: Timestamp;
  period_start: Timestamp;
  period_end: Timestamp;
}

// ============================================================================
// Types guards et helpers
// ============================================================================

/**
 * Type guard pour vérifier qu'un client est un particulier
 */
export function isIndividualClient(client: Client): client is IndividualClient {
  return client.client_type === 'individual';
}

/**
 * Type guard pour vérifier qu'un client est une entreprise
 */
export function isBusinessClient(client: Client): client is BusinessClient {
  return client.client_type === 'business';
}

/**
 * Helper pour obtenir le nom d'affichage d'un client
 */
export function getClientDisplayName(client: Client): string {
  if (isIndividualClient(client)) {
    return `${client.individual_info.first_name} ${client.individual_info.last_name}`.trim();
  } else {
    return client.business_info.company_name;
  }
}

/**
 * Helper pour obtenir le contact principal d'un client
 */
export function getClientContactName(client: Client): string {
  if (isIndividualClient(client)) {
    return getClientDisplayName(client);
  } else {
    const primaryContact = client.business_info.contacts.find(c => c.is_primary && c.is_active);
    if (primaryContact) {
      const name = `${primaryContact.first_name} ${primaryContact.last_name}`.trim();
      return primaryContact.title ? `${name} (${primaryContact.title})` : name;
    }
    return client.business_info.company_name;
  }
}

/**
 * Helper pour obtenir l'email principal d'un client
 */
export function getClientEmail(client: Client): string {
  return client.contact_info.email;
}

/**
 * Helper pour déterminer si un client peut être supprimé
 */
export function canDeleteClient(client: Client, hasActiveFolders: boolean): boolean {
  return !hasActiveFolders && client.status === 'inactive';
}