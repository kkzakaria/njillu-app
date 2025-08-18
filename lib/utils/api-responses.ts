/**
 * Utilities pour standardiser les réponses API
 * Conforme au type ApiResponse<T>
 */

import type { ApiResponse, ResponseStatus, ApiErrorCode } from '@/types/shared';

/**
 * Mapping des codes HTTP vers les codes d'erreur API
 */
const HTTP_TO_API_ERROR_CODE: Record<number, ApiErrorCode> = {
  400: 'VALIDATION_ERROR',
  401: 'AUTHENTICATION_ERROR', 
  403: 'AUTHORIZATION_ERROR',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION_ERROR',
  429: 'RATE_LIMIT_EXCEEDED',
  500: 'INTERNAL_ERROR',
  503: 'SERVICE_UNAVAILABLE',
  504: 'TIMEOUT'
} as const;

/**
 * Créer une réponse d'erreur standardisée
 */
export function createErrorResponse<T = null>(
  httpStatus: number,
  message: string,
  details?: Record<string, unknown>
): ApiResponse<T> {
  const errorCode = HTTP_TO_API_ERROR_CODE[httpStatus] || 'INTERNAL_ERROR';
  
  return {
    status: 'error' as ResponseStatus,
    error: {
      code: errorCode,
      message,
      details
    }
  };
}

/**
 * Créer une réponse de succès standardisée
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  const response: ApiResponse<T> = {
    status: 'success' as ResponseStatus,
    data
  };
  
  if (message) {
    response.messages = [message];
  }
  
  return response;
}

/**
 * Créer une réponse de succès sans données
 */
export function createSuccessMessageResponse(
  message: string
): ApiResponse<null> {
  return {
    status: 'success' as ResponseStatus,
    data: null,
    messages: [message]
  };
}

/**
 * Créer une réponse de validation avec erreurs
 */
export function createValidationErrorResponse(
  errors: Array<{ field?: string; message: string; code?: string }>,
  warnings?: Array<{ field?: string; message: string }>
): ApiResponse<null> {
  return {
    status: 'error' as ResponseStatus,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: { errors, warnings }
    }
  };
}