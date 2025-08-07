/**
 * Types d'identifiants et branded types
 * Identifiants typés pour éviter les erreurs de substitution
 * 
 * @module Shared/Core/Identifiers
 * @version 2.0.0
 * @since 2025-01-06
 */

// ============================================================================
// Identifiants de base
// ============================================================================

/**
 * Identifiant universel (UUID ou string)
 * Base pour tous les identifiants d'entité
 */
export type EntityId = string;

/**
 * UUID v4 strict
 * @pattern ^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$
 */
export type UUIDv4 = string;

/**
 * Identifiant numérique auto-incrémenté
 */
export type SequentialId = number;

// ============================================================================
// Branded types pour identifiants typés
// ============================================================================

/**
 * Base pour les branded identifiers
 */
declare const brand: unique symbol;
type Brand<T, U> = T & { readonly [brand]: U };

/**
 * Identifiants typés pour éviter les erreurs de substitution
 */
export type UserId = Brand<EntityId, 'UserId'>;
export type SessionId = Brand<EntityId, 'SessionId'>;
export type RequestId = Brand<EntityId, 'RequestId'>;
export type TransactionId = Brand<EntityId, 'TransactionId'>;

/**
 * Identifiants métier spécifiques
 */
export type BillOfLadingId = Brand<EntityId, 'BillOfLadingId'>;
export type FolderId = Brand<EntityId, 'FolderId'>;
export type ContainerId = Brand<EntityId, 'ContainerId'>;
export type DocumentId = Brand<EntityId, 'DocumentId'>;
export type ClientId = Brand<EntityId, 'ClientId'>;
export type CompanyId = Brand<EntityId, 'CompanyId'>;

/**
 * Identifiants système
 */
export type EventId = Brand<EntityId, 'EventId'>;
export type NotificationId = Brand<EntityId, 'NotificationId'>;
export type TaskId = Brand<EntityId, 'TaskId'>;
export type JobId = Brand<EntityId, 'JobId'>;

// ============================================================================
// Identifiants externes et intégrations
// ============================================================================

/**
 * Identifiants de systèmes externes
 */
export type ExternalSystemId = Brand<EntityId, 'ExternalSystemId'>;
export type SupabaseId = Brand<EntityId, 'SupabaseId'>;
export type StripeCustomerId = Brand<EntityId, 'StripeCustomerId'>;
export type GoogleAnalyticsId = Brand<EntityId, 'GoogleAnalyticsId'>;

// ============================================================================
// Helpers pour création d'identifiants
// ============================================================================

/**
 * Créer un identifiant typé à partir d'une chaîne
 */
export function createBrandedId<T extends Brand<EntityId, any>>(id: string): T {
  return id as T;
}

/**
 * Extraire la valeur string d'un identifiant typé
 */
export function extractId<T extends Brand<EntityId, any>>(brandedId: T): string {
  return brandedId as string;
}

/**
 * Vérifier qu'un string est un UUID valide
 */
export function isValidUUID(id: string): id is UUIDv4 {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Vérifier qu'un string est un EntityId valide
 */
export function isValidEntityId(id: unknown): id is EntityId {
  return typeof id === 'string' && id.length > 0;
}