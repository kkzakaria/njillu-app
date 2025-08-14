/**
 * Types pour les opérations CRUD sur les clients
 * Création, lecture, mise à jour et suppression
 */

import type { EntityId, Timestamp } from '../shared';
import type {
  Client,
  IndividualClient,
  BusinessClient,
  ClientSummary,
  ClientDetail,
  ContactInfo,
  CommercialInfo,
  IndividualInfo,
  BusinessInfo,
  ContactPerson
} from './core';
import type {
  ClientType,
  ClientStatus,
  ClientSortField,
  ClientSearchOperator,
  CountryCode,
  LanguageCode,
  Industry,
  ClientPriority
} from './enums';

// ============================================================================
// Types pour la création de clients
// ============================================================================

/**
 * Données pour créer un client particulier
 */
export interface CreateIndividualClientData {
  /** Type de client */
  client_type: 'individual';
  
  /** Informations personnelles */
  individual_info: Omit<IndividualInfo, 'date_of_birth'> & {
    date_of_birth?: string; // ISO date string
  };
  
  /** Informations de contact */
  contact_info: ContactInfo;
  
  /** Informations commerciales (optionnelles, avec défauts) */
  commercial_info?: Partial<CommercialInfo>;
  
  /** Notes internes */
  internal_notes?: string;
  
  /** Notes client */
  client_notes?: string;
  
  /** Tags */
  tags?: string[];
}

/**
 * Données pour créer un client entreprise
 */
export interface CreateBusinessClientData {
  /** Type de client */
  client_type: 'business';
  
  /** Informations de l'entreprise */
  business_info: Omit<BusinessInfo, 'contacts'> & {
    /** Au moins un contact principal requis */
    contacts: ContactPerson[];
  };
  
  /** Informations de contact principales */
  contact_info: ContactInfo;
  
  /** Informations commerciales (optionnelles, avec défauts) */
  commercial_info?: Partial<CommercialInfo>;
  
  /** Notes internes */
  internal_notes?: string;
  
  /** Notes client */
  client_notes?: string;
  
  /** Tags */
  tags?: string[];
}

/**
 * Union des données de création
 */
export type CreateClientData = CreateIndividualClientData | CreateBusinessClientData;

// ============================================================================
// Types pour la mise à jour de clients
// ============================================================================

/**
 * Données pour mettre à jour un client particulier
 */
export interface UpdateIndividualClientData {
  /** Informations personnelles */
  individual_info?: Partial<IndividualInfo>;
  
  /** Informations de contact */
  contact_info?: Partial<ContactInfo>;
  
  /** Informations commerciales */
  commercial_info?: Partial<CommercialInfo>;
  
  /** Statut */
  status?: ClientStatus;
  
  /** Notes internes */
  internal_notes?: string;
  
  /** Notes client */
  client_notes?: string;
  
  /** Tags */
  tags?: string[];
}

/**
 * Données pour mettre à jour un client entreprise
 */
export interface UpdateBusinessClientData {
  /** Informations de l'entreprise */
  business_info?: Partial<BusinessInfo>;
  
  /** Informations de contact */
  contact_info?: Partial<ContactInfo>;
  
  /** Informations commerciales */
  commercial_info?: Partial<CommercialInfo>;
  
  /** Statut */
  status?: ClientStatus;
  
  /** Notes internes */
  internal_notes?: string;
  
  /** Notes client */
  client_notes?: string;
  
  /** Tags */
  tags?: string[];
}

/**
 * Union des données de mise à jour
 */
export type UpdateClientData = UpdateIndividualClientData | UpdateBusinessClientData;

/**
 * Paramètres pour la mise à jour d'un client
 */
export interface UpdateClientParams {
  /** ID du client à modifier */
  client_id: EntityId;
  
  /** Données à mettre à jour */
  data: UpdateClientData;
  
  /** Version pour gestion optimiste de la concurrence */
  version?: number;
}

// ============================================================================
// Types pour la recherche et le filtrage
// ============================================================================

/**
 * Filtre pour rechercher des clients
 */
export interface ClientFilter {
  /** Champ à filtrer */
  field: ClientSortField;
  
  /** Opérateur de recherche */
  operator: ClientSearchOperator;
  
  /** Valeur à rechercher */
  value: string | number | boolean | string[] | number[];
  
  /** Sensible à la casse ? (pour les opérateurs de texte) */
  case_sensitive?: boolean;
}

/**
 * Groupe de filtres avec logique AND/OR
 */
export interface ClientFilterGroup {
  /** Opérateur logique entre les filtres */
  logic: 'AND' | 'OR';
  
  /** Filtres du groupe */
  filters: ClientFilter[];
  
  /** Sous-groupes de filtres */
  groups?: ClientFilterGroup[];
}

/**
 * Paramètres de recherche de clients
 */
export interface ClientSearchParams {
  /** Recherche textuelle libre */
  search_term?: string;
  
  /** Types de clients à inclure */
  client_types?: ClientType[];
  
  /** Statuts à inclure */
  statuses?: ClientStatus[];
  
  /** Pays à inclure */
  countries?: CountryCode[];
  
  /** Secteurs d'activité (entreprises uniquement) */
  industries?: Industry[];
  
  /** Priorités à inclure */
  priorities?: ClientPriority[];
  
  /** Langues préférées */
  languages?: LanguageCode[];
  
  /** Filtres avancés */
  filters?: ClientFilterGroup;
  
  /** Tri */
  sort_field?: ClientSortField;
  sort_direction?: 'asc' | 'desc';
  
  /** Pagination */
  page?: number;
  page_size?: number;
  
  /** Inclure les clients supprimés ? */
  include_deleted?: boolean;
}

/**
 * Résultats de recherche de clients
 */
export interface ClientSearchResults {
  /** Clients trouvés */
  clients: ClientSummary[];
  
  /** Nombre total de résultats */
  total_count: number;
  
  /** Page actuelle */
  current_page: number;
  
  /** Taille de la page */
  page_size: number;
  
  /** Nombre total de pages */
  total_pages: number;
  
  /** Y a-t-il une page suivante ? */
  has_next_page: boolean;
  
  /** Y a-t-il une page précédente ? */
  has_previous_page: boolean;
  
  /** Facettes de recherche */
  facets?: {
    client_types: Record<ClientType, number>;
    statuses: Record<ClientStatus, number>;
    countries: Record<CountryCode, number>;
    industries: Record<Industry, number>;
  };
}

// ============================================================================
// Types pour les opérations en lot
// ============================================================================

/**
 * Opération en lot sur les clients
 */
export interface ClientBatchOperation {
  /** Type d'opération */
  operation: 'update' | 'delete' | 'change_status' | 'add_tags' | 'remove_tags';
  
  /** IDs des clients concernés */
  client_ids: EntityId[];
  
  /** Données pour l'opération (selon le type) */
  data?: {
    /** Pour update */
    updates?: Partial<UpdateClientData>;
    
    /** Pour change_status */
    new_status?: ClientStatus;
    
    /** Pour add_tags/remove_tags */
    tags?: string[];
  };
  
  /** Confirmer l'opération même si des avertissements */
  force?: boolean;
}

/**
 * Résultat d'une opération en lot
 */
export interface ClientBatchOperationResult {
  /** Nombre de clients traités avec succès */
  success_count: number;
  
  /** Nombre d'échecs */
  error_count: number;
  
  /** Nombre d'avertissements */
  warning_count: number;
  
  /** IDs des clients traités avec succès */
  success_ids: EntityId[];
  
  /** Détails des erreurs */
  errors: Array<{
    client_id: EntityId;
    error: string;
    error_code?: string;
  }>;
  
  /** Détails des avertissements */
  warnings: Array<{
    client_id: EntityId;
    warning: string;
    warning_code?: string;
  }>;
  
  /** Temps d'exécution en millisecondes */
  execution_time_ms: number;
}

// ============================================================================
// Types pour la suppression
// ============================================================================

/**
 * Paramètres de suppression d'un client
 */
export interface DeleteClientParams {
  /** ID du client à supprimer */
  client_id: EntityId;
  
  /** Type de suppression */
  deletion_type: 'soft' | 'hard';
  
  /** Raison de la suppression */
  reason?: string;
  
  /** Forcer la suppression même si le client a des dossiers actifs */
  force?: boolean;
  
  /** Que faire des dossiers associés */
  handle_folders?: 'keep' | 'transfer' | 'archive';
  
  /** ID du client de transfert (si handle_folders = 'transfer') */
  transfer_to_client_id?: EntityId;
}

/**
 * Résultat de la suppression d'un client
 */
export interface DeleteClientResult {
  /** Suppression réussie ? */
  success: boolean;
  
  /** Type de suppression effectuée */
  deletion_type: 'soft' | 'hard';
  
  /** Nombre de dossiers affectés */
  affected_folders_count: number;
  
  /** Actions entreprises sur les dossiers */
  folder_actions?: Array<{
    folder_id: EntityId;
    action: 'kept' | 'transferred' | 'archived';
    target_client_id?: EntityId;
  }>;
  
  /** Avertissements */
  warnings?: string[];
  
  /** Date de suppression */
  deleted_at: Timestamp;
}

// ============================================================================
// Types pour la gestion des contacts d'entreprise
// ============================================================================

/**
 * Données pour ajouter un contact à une entreprise
 */
export interface AddContactData {
  /** ID du client entreprise */
  client_id: EntityId;
  
  /** Informations du contact */
  contact: Omit<ContactPerson, 'is_active'> & {
    is_active?: boolean; // Défaut: true
  };
}

/**
 * Données pour modifier un contact d'entreprise
 */
export interface UpdateContactData {
  /** ID du client entreprise */
  client_id: EntityId;
  
  /** Index du contact dans la liste */
  contact_index: number;
  
  /** Modifications à apporter */
  updates: Partial<ContactPerson>;
}

/**
 * Paramètres pour supprimer un contact d'entreprise
 */
export interface RemoveContactParams {
  /** ID du client entreprise */
  client_id: EntityId;
  
  /** Index du contact dans la liste */
  contact_index: number;
  
  /** Désactiver au lieu de supprimer ? */
  deactivate_only?: boolean;
}

// ============================================================================
// Types pour la validation
// ============================================================================

/**
 * Résultat de validation d'un client
 */
export interface ClientValidationResult {
  /** Validation réussie ? */
  is_valid: boolean;
  
  /** Erreurs de validation */
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  
  /** Avertissements */
  warnings: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

/**
 * Options de validation
 */
export interface ClientValidationOptions {
  /** Valider l'unicité de l'email ? */
  check_email_uniqueness?: boolean;
  
  /** Valider l'unicité du SIRET ? */
  check_siret_uniqueness?: boolean;
  
  /** Valider les formats (email, téléphone, etc.) ? */
  check_formats?: boolean;
  
  /** Valider les contraintes métier ? */
  check_business_rules?: boolean;
  
  /** ID du client à exclure de la validation (pour les mises à jour) */
  exclude_client_id?: EntityId;
}

// ============================================================================
// Types pour l'export/import
// ============================================================================

/**
 * Configuration d'export de clients
 */
export interface ClientExportConfig {
  /** Format d'export */
  format: 'csv' | 'excel' | 'json';
  
  /** Clients à exporter */
  client_ids?: EntityId[];
  
  /** Critères de sélection (si client_ids non fourni) */
  search_params?: ClientSearchParams;
  
  /** Champs à inclure */
  fields?: string[];
  
  /** Inclure les informations commerciales sensibles ? */
  include_sensitive_data?: boolean;
  
  /** Langue pour les labels */
  language?: LanguageCode;
}

/**
 * Résultat d'export de clients
 */
export interface ClientExportResult {
  /** Export réussi ? */
  success: boolean;
  
  /** URL de téléchargement du fichier */
  download_url?: string;
  
  /** Nombre de clients exportés */
  exported_count: number;
  
  /** Taille du fichier en bytes */
  file_size_bytes: number;
  
  /** Erreurs rencontrées */
  errors?: string[];
  
  /** Date d'expiration du lien de téléchargement */
  expires_at: Timestamp;
}

/**
 * Configuration d'import de clients
 */
export interface ClientImportConfig {
  /** Données à importer */
  data: CreateClientData[];
  
  /** Stratégie en cas de doublon d'email */
  duplicate_strategy: 'skip' | 'update' | 'error';
  
  /** Valider avant import ? */
  validate_before_import?: boolean;
  
  /** Mode de traitement */
  mode: 'test' | 'import';
}

/**
 * Résultat d'import de clients
 */
export interface ClientImportResult {
  /** Import réussi ? */
  success: boolean;
  
  /** Nombre de clients créés */
  created_count: number;
  
  /** Nombre de clients mis à jour */
  updated_count: number;
  
  /** Nombre de clients ignorés */
  skipped_count: number;
  
  /** Nombre d'erreurs */
  error_count: number;
  
  /** Détails des erreurs */
  errors: Array<{
    row_index: number;
    client_data: Partial<CreateClientData>;
    error: string;
    error_code?: string;
  }>;
  
  /** IDs des clients créés */
  created_ids: EntityId[];
  
  /** IDs des clients mis à jour */
  updated_ids: EntityId[];
}

// ============================================================================
// Types helpers pour les opérations
// ============================================================================

/**
 * Type guard pour les données de création de particulier
 */
export function isCreateIndividualData(data: CreateClientData): data is CreateIndividualClientData {
  return data.client_type === 'individual';
}

/**
 * Type guard pour les données de création d'entreprise
 */
export function isCreateBusinessData(data: CreateClientData): data is CreateBusinessClientData {
  return data.client_type === 'business';
}