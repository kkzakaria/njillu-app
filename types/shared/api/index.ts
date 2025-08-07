/**
 * Point d'entrée du module API
 * Export de tous les types API
 * 
 * @module Shared/API
 * @version 2.0.0
 * @since 2025-01-06
 */

export type {
  ResponseStatus,
  ApiErrorCode
} from './status';

export {
  HTTP_STATUS_CODES
} from './status';

export type {
  ApiResponse,
  PaginatedApiResponse,
  CreateResponse,
  UpdateResponse,
  DeleteResponse
} from './response';