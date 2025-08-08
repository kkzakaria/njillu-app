/**
 * Types de réponses API
 * Structures standardisées pour les réponses
 * 
 * @module Shared/API/Response
 * @version 2.0.0
 * @since 2025-01-06
 */

import type { ApiErrorDetails, ApiResponseMetadata } from '../core/value-objects';
import type { ResponseStatus, ApiErrorCode } from './status';

// ============================================================================
// Réponses API
// ============================================================================

/**
 * Réponse API générique type-safe
 */
export interface ApiResponse<T = unknown> {
  status: ResponseStatus;
  data?: T;
  
  // En cas d'erreur
  error?: {
    code: ApiErrorCode;
    message: string;
    details?: ApiErrorDetails;
    stack_trace?: string;
  };
  
  // Messages et avertissements
  messages?: string[];
  warnings?: string[];
  
  // Métadonnées
  metadata?: ApiResponseMetadata;
}

/**
 * Réponse API avec pagination
 */
export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

/**
 * Réponse pour opération de création
 */
export interface CreateResponse<T> extends ApiResponse<T> {
  created_id?: string;
  location?: string;  // URL de la ressource créée
}

/**
 * Réponse pour opération de mise à jour
 */
export interface UpdateResponse<T> extends ApiResponse<T> {
  updated_fields?: string[];
  previous_version?: number;
  current_version?: number;
}

/**
 * Réponse pour opération de suppression
 */
export interface DeleteResponse extends ApiResponse<void> {
  deleted_id?: string;
  soft_deleted?: boolean;
  permanent?: boolean;
}