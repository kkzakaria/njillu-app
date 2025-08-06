/**
 * Types primitifs et codes standards partagés
 * Définitions de base pour identifiants, codes, timestamps
 * 
 * @module Shared/Core/Primitives  
 * @version 2.0.0
 * @since 2025-01-06
 */

// ============================================================================
// Types temporels
// ============================================================================

/**
 * Timestamp ISO 8601 strict
 * @example "2025-01-06T10:30:00.000Z"
 */
export type Timestamp = string;

/**
 * Date simple au format ISO (YYYY-MM-DD)
 * @example "2025-01-06"
 */
export type ISODate = string;

/**
 * Durée en millisecondes
 */
export type DurationMs = number;

/**
 * Durée en secondes
 */
export type DurationSeconds = number;

// ============================================================================
// Codes standards internationaux
// ============================================================================

/**
 * Code de devise ISO 4217
 * @example "EUR", "USD", "GBP"
 */
export type CurrencyCode = string;

/**
 * Code de pays ISO 3166-1 alpha-2
 * @example "FR", "US", "GB"
 */
export type CountryCode = string;

/**
 * Code de langue ISO 639-1 avec support système
 */
export type LanguageCode = 'fr' | 'en' | 'es';

/**
 * Code de fuseau horaire IANA
 * @example "Europe/Paris", "America/New_York"
 */
export type TimezoneCode = string;

// ============================================================================
// Types numériques spécialisés
// ============================================================================

/**
 * Pourcentage (0-100)
 */
export type Percentage = number;

/**
 * Coordonnée latitude (-90 à 90)
 */
export type Latitude = number;

/**
 * Coordonnée longitude (-180 à 180) 
 */
export type Longitude = number;

/**
 * Position géographique
 */
export interface GeoPosition {
  latitude: Latitude;
  longitude: Longitude;
  altitude?: number;
  accuracy?: number;
}

// ============================================================================
// Types de format et validation
// ============================================================================

/**
 * Format d'email valide
 * @pattern ^[^\s@]+@[^\s@]+\.[^\s@]+$
 */
export type EmailAddress = string;

/**
 * URL valide
 * @pattern ^https?://
 */
export type URL = string;

/**
 * Numéro de téléphone international
 * @example "+33123456789"
 */
export type PhoneNumber = string;

/**
 * Hash hexadécimal (MD5, SHA256, etc.)
 */
export type HexHash = string;

// ============================================================================
// Types de taille et limite
// ============================================================================

/**
 * Taille de fichier en bytes
 */
export type FileSize = number;

/**
 * Nombre de pages
 */
export type PageCount = number;

/**
 * Limite de résultats pour pagination
 */
export type ResultLimit = number;

/**
 * Décalage pour pagination
 */
export type ResultOffset = number;