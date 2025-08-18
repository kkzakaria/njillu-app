/**
 * Module Clients - Point d'entrée principal
 * Export hiérarchique de tous les types pour la gestion des clients
 */

import type {
  ClientStatus,
  PaymentTerms,
  CountryCode,
  LanguageCode,
  ClientPriority,
  ClientRiskLevel
} from './enums';
import type { Client, IndividualClient } from './core';

// ============================================================================
// Enums et types de base
// ============================================================================
export type {
  ClientType,
  ClientStatus,
  Industry,
  PaymentMethod,
  PaymentTerms,
  ContactType,
  CountryCode,
  LanguageCode,
  ClientAuditEventType,
  ClientPriority,
  ClientRiskLevel,
  ClientSortField,
  ClientSearchOperator
} from './enums';

export {
  CLIENT_STATUSES,
  CLIENT_TYPES,
  INDUSTRIES,
  COUNTRY_CODES,
  LANGUAGE_CODES,
  PAYMENT_TERMS,
  CLIENT_TYPE_LABELS,
  CLIENT_STATUS_LABELS,
  INDUSTRY_LABELS,
  isClientType,
  isClientStatus,
  isIndustry,
  isCountryCode,
  isLanguageCode
} from './enums';

// ============================================================================
// Interfaces principales
// ============================================================================
export type {
  ClientAddress,
  ContactInfo,
  CommercialInfo,
  CommercialHistory,
  IndividualInfo,
  ContactPerson,
  LegalInfo,
  BusinessInfo,
  Client,
  IndividualClient,
  BusinessClient,
  ClientDisplayInfo,
  ClientSummary,
  ClientDetail,
  ClientFolder,
  ClientStatistics
} from './core';

export {
  isIndividualClient,
  isBusinessClient,
  getClientDisplayName,
  getClientContactName,
  getClientEmail,
  canDeleteClient
} from './core';

// ============================================================================
// Types pour les opérations CRUD
// ============================================================================
export type {
  CreateIndividualClientData,
  CreateBusinessClientData,
  CreateClientData,
  UpdateIndividualClientData,
  UpdateBusinessClientData,
  UpdateClientData,
  UpdateClientParams,
  ClientFilter,
  ClientFilterGroup,
  ClientSearchParams,
  ClientSearchResults,
  ClientBatchOperation,
  ClientBatchOperationResult,
  DeleteClientParams,
  DeleteClientResult,
  AddContactData,
  UpdateContactData,
  RemoveContactParams,
  ClientValidationResult,
  ClientValidationOptions,
  ClientExportConfig,
  ClientExportResult,
  ClientImportConfig,
  ClientImportResult
} from './operations';

export {
  isCreateIndividualData,
  isCreateBusinessData
} from './operations';

// ============================================================================
// Réexports organisés par catégorie
// ============================================================================

// Types de base et enums
export * as ClientEnums from './enums';

// Interfaces principales
export * as ClientCore from './core';

// Opérations CRUD et utilitaires
export * as ClientOperations from './operations';

// ============================================================================
// Collections thématiques pour l'usage pratique
// ============================================================================

/**
 * Types pour la création et modification de clients
 */
export const ClientMutation = {
  Create: () => import('./operations'),
  Update: () => import('./operations'), 
  Delete: () => import('./operations')
} as const;

/**
 * Types pour la recherche et le filtrage
 */
export const ClientSearch = {
  Params: () => import('./operations'),
  Results: () => import('./operations'),
  Filters: () => import('./operations')
} as const;

/**
 * Types pour les vues et affichages
 */
export const ClientViews = {
  Summary: () => import('./core'),
  Detail: () => import('./core'),
  DisplayInfo: () => import('./core')
} as const;

/**
 * Types pour les opérations en lot
 */
export const ClientBatch = {
  Operation: () => import('./operations'),
  Result: () => import('./operations')
} as const;

/**
 * Types pour l'import/export
 */
export const ClientIO = {
  Export: () => import('./operations'),
  Import: () => import('./operations')
} as const;

// ============================================================================
// Constantes et configurations par défaut
// ============================================================================

/**
 * Configuration par défaut pour un nouveau client
 */
export const DEFAULT_CLIENT_CONFIG = {
  /** Statut par défaut */
  default_status: 'active' as ClientStatus,
  
  /** Délai de paiement par défaut */
  default_payment_terms_days: 30,
  
  /** Conditions de paiement par défaut */
  default_payment_terms: 'net_30' as PaymentTerms,
  
  /** Limite de crédit par défaut */
  default_credit_limit: 0,
  
  /** Devise par défaut */
  default_currency: 'EUR' as const,
  
  /** Pays par défaut */
  default_country: 'FR' as CountryCode,
  
  /** Langue par défaut */
  default_language: 'fr' as LanguageCode,
  
  /** Priorité par défaut */
  default_priority: 'normal' as ClientPriority,
  
  /** Niveau de risque par défaut */
  default_risk_level: 'low' as ClientRiskLevel
} as const;

/**
 * Limites et contraintes système
 */
export const CLIENT_CONSTRAINTS = {
  /** Longueur maximale des noms */
  max_name_length: 255,
  
  /** Longueur maximale des notes */
  max_notes_length: 2000,
  
  /** Nombre maximum de tags */
  max_tags_count: 20,
  
  /** Longueur maximale d'un tag */
  max_tag_length: 50,
  
  /** Nombre maximum de contacts par entreprise */
  max_contacts_per_business: 10,
  
  /** Délai de paiement maximum (jours) */
  max_payment_terms_days: 365,
  
  /** Limite de crédit maximale */
  max_credit_limit: 10_000_000,
  
  /** Taille de page maximale pour la recherche */
  max_search_page_size: 100,
  
  /** Nombre maximum de clients pour opérations en lot */
  max_batch_operation_size: 1000
} as const;

/**
 * Messages d'erreur standardisés
 */
export const CLIENT_ERROR_CODES = {
  /** Client non trouvé */
  NOT_FOUND: 'CLIENT_NOT_FOUND',
  
  /** Email déjà utilisé */
  EMAIL_ALREADY_EXISTS: 'CLIENT_EMAIL_ALREADY_EXISTS',
  
  /** SIRET déjà utilisé */
  SIRET_ALREADY_EXISTS: 'CLIENT_SIRET_ALREADY_EXISTS',
  
  /** Client a des dossiers actifs */
  HAS_ACTIVE_FOLDERS: 'CLIENT_HAS_ACTIVE_FOLDERS',
  
  /** Droits insuffisants */
  INSUFFICIENT_PERMISSIONS: 'CLIENT_INSUFFICIENT_PERMISSIONS',
  
  /** Données invalides */
  INVALID_DATA: 'CLIENT_INVALID_DATA',
  
  /** Contact principal requis */
  PRIMARY_CONTACT_REQUIRED: 'CLIENT_PRIMARY_CONTACT_REQUIRED',
  
  /** Limite de crédit dépassée */
  CREDIT_LIMIT_EXCEEDED: 'CLIENT_CREDIT_LIMIT_EXCEEDED'
} as const;

// ============================================================================
// Utilitaires pour le développement
// ============================================================================

/**
 * Fonction utilitaire pour créer un client de test
 */
export function createMockClient(overrides?: Partial<Client>): Client {
  const defaultClient: IndividualClient = {
    id: 'mock-client-id',
    client_type: 'individual',
    status: 'active',
    contact_info: {
      email: 'test@example.com',
      phone: '+33123456789',
      address: {
        address_line1: '123 Rue de Test',
        city: 'Paris',
        postal_code: '75001',
        country: 'FR'
      }
    },
    commercial_info: {
      credit_limit: 10000,
      credit_limit_currency: 'EUR',
      payment_terms_days: 30,
      payment_terms: 'net_30',
      payment_methods: ['bank_transfer'],
      preferred_language: 'fr',
      priority: 'normal',
      risk_level: 'low'
    },
    individual_info: {
      first_name: 'Jean',
      last_name: 'Dupont'
    },
    tags: ['test'],
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: undefined,
    deleted_by: undefined
  };

  return { ...defaultClient, ...overrides } as Client;
}

/**
 * Fonction utilitaire pour valider un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Fonction utilitaire pour valider un SIRET français
 */
export function isValidSiret(siret: string): boolean {
  return /^[0-9]{14}$/.test(siret);
}

/**
 * Fonction utilitaire pour valider un numéro de téléphone
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Format international basique
  return /^[+]?[0-9\s\-()\.]+$/.test(phone);
}