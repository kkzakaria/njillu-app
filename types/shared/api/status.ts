/**
 * Statuts de réponse API
 * Énumérations et codes de statut
 * 
 * @module Shared/API/Status
 * @version 2.0.0  
 * @since 2025-01-06
 */

// ============================================================================
// Statuts de réponse
// ============================================================================

/**
 * Statuts de réponse API
 */
export type ResponseStatus = 'success' | 'error' | 'partial' | 'pending';

/**
 * Codes d'erreur API standardisés
 */
export type ApiErrorCode = 
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR' 
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'TIMEOUT'
  | 'INVALID_REQUEST';

/**
 * Mappage des codes d'erreur avec les codes HTTP
 */
export const HTTP_STATUS_CODES: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  AUTHENTICATION_ERROR: 401,
  AUTHORIZATION_ERROR: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMIT_EXCEEDED: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  TIMEOUT: 504,
  INVALID_REQUEST: 400
} as const;