/**
 * Client services - Main exports
 * Service layer for client management operations
 */

export { ClientService } from './client-service';
export { ClientSearchService } from './search-service';
export { ClientValidationService } from './validation-service';
export { ClientBatchService } from './batch-service';
export { ContactService } from './contact-service';

// Re-export types for convenience
export type {
  CreateClientData,
  UpdateClientData,
  ClientSearchParams,
  ClientSearchResults,
  ClientValidationResult,
  ClientBatchOperation,
  ClientBatchOperationResult,
  DeleteClientParams,
  DeleteClientResult
} from '@/types/clients/operations';

export type {
  Client,
  IndividualClient,
  BusinessClient,
  ClientSummary,
  ClientDetail,
  ClientStatistics
} from '@/types/clients/core';