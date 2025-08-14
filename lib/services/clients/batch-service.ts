/**
 * Client batch service - Batch operations
 * Handles bulk operations on multiple clients
 */

import { createClient as createSupabaseClient } from '@/lib/supabase/server';
import type {
  ClientBatchOperation,
  ClientBatchOperationResult,
  UpdateClientData
} from '@/types/clients/operations';
import type { ClientStatus } from '@/types/clients/enums';
import type { EntityId } from '@/types/shared';
import { ClientService } from './client-service';
import { ClientValidationService } from './validation-service';

export class ClientBatchService {
  /**
   * Execute batch operation on multiple clients
   */
  static async executeBatch(
    operation: ClientBatchOperation,
    userId: EntityId
  ): Promise<ClientBatchOperationResult> {
    const startTime = Date.now();
    const result: ClientBatchOperationResult = {
      success_count: 0,
      error_count: 0,
      warning_count: 0,
      success_ids: [],
      errors: [],
      warnings: [],
      execution_time_ms: 0
    };

    // Validate operation
    if (!operation.client_ids.length) {
      throw new Error('No client IDs provided');
    }

    if (operation.client_ids.length > 1000) {
      throw new Error('Batch operation limited to 1000 clients');
    }

    // Pre-flight checks
    await this.performPreflightChecks(operation, result);

    if (result.error_count > 0 && !operation.force) {
      result.execution_time_ms = Date.now() - startTime;
      return result;
    }

    // Execute the operation
    switch (operation.operation) {
      case 'update':
        await this.executeUpdateBatch(operation, result);
        break;
      case 'delete':
        await this.executeDeleteBatch(operation, result);
        break;
      case 'change_status':
        await this.executeStatusChangeBatch(operation, result);
        break;
      case 'add_tags':
        await this.executeAddTagsBatch(operation, result);
        break;
      case 'remove_tags':
        await this.executeRemoveTagsBatch(operation, result);
        break;
      default:
        throw new Error(`Unsupported batch operation: ${operation.operation}`);
    }

    result.execution_time_ms = Date.now() - startTime;
    return result;
  }

  /**
   * Perform pre-flight checks before batch operation
   */
  private static async performPreflightChecks(
    operation: ClientBatchOperation,
    result: ClientBatchOperationResult
  ): Promise<void> {
    const supabase = await createSupabaseClient();

    // Check if all clients exist and are not deleted
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, status, deleted_at')
      .in('id', operation.client_ids);

    if (error) {
      throw new Error(`Pre-flight check failed: ${error.message}`);
    }

    const existingIds = new Set(clients?.map(c => c.id) || []);
    
    // Check for non-existent clients
    for (const clientId of operation.client_ids) {
      if (!existingIds.has(clientId)) {
        result.errors.push({
          client_id: clientId,
          error: 'Client not found',
          error_code: 'NOT_FOUND'
        });
        result.error_count++;
      }
    }

    // Check for deleted clients
    clients?.forEach(client => {
      if (client.deleted_at) {
        result.errors.push({
          client_id: client.id,
          error: 'Client is deleted',
          error_code: 'DELETED_CLIENT'
        });
        result.error_count++;
      }
    });

    // Operation-specific checks
    if (operation.operation === 'delete') {
      await this.checkDeleteConstraints(operation.client_ids, result);
    }

    if (operation.operation === 'change_status' && !operation.data?.new_status) {
      result.errors.push({
        client_id: 'BATCH',
        error: 'New status is required for status change operation',
        error_code: 'MISSING_DATA'
      });
      result.error_count++;
    }
  }

  /**
   * Check delete constraints (active folders, etc.)
   */
  private static async checkDeleteConstraints(
    clientIds: EntityId[],
    result: ClientBatchOperationResult
  ): Promise<void> {
    const supabase = await createSupabaseClient();

    // Check for clients with active folders
    const { data: activeFolders } = await supabase
      .from('folders')
      .select('client_id')
      .in('client_id', clientIds)
      .eq('status', 'active')
      .is('deleted_at', null);

    const clientsWithActiveFolders = new Set(activeFolders?.map(f => f.client_id) || []);

    clientsWithActiveFolders.forEach(clientId => {
      result.warnings.push({
        client_id: clientId,
        warning: 'Client has active folders',
        warning_code: 'ACTIVE_FOLDERS'
      });
      result.warning_count++;
    });
  }

  /**
   * Execute update batch operation
   */
  private static async executeUpdateBatch(
    operation: ClientBatchOperation,
    result: ClientBatchOperationResult
  ): Promise<void> {
    if (!operation.data?.updates) {
      throw new Error('Update data is required for update operation');
    }

    for (const clientId of operation.client_ids) {
      try {
        // Skip if client had pre-flight errors
        if (result.errors.some(e => e.client_id === clientId)) {
          continue;
        }

        // Validate update data
        const validation = await ClientValidationService.validateUpdate(
          clientId,
          operation.data.updates,
          { check_email_uniqueness: false } // Skip for batch operations
        );

        if (!validation.is_valid) {
          result.errors.push({
            client_id: clientId,
            error: validation.errors.map(e => e.message).join(', '),
            error_code: 'VALIDATION_ERROR'
          });
          result.error_count++;
          continue;
        }

        // Perform update
        await ClientService.update({
          client_id: clientId,
          data: operation.data.updates
        });

        result.success_ids.push(clientId);
        result.success_count++;

      } catch (error) {
        result.errors.push({
          client_id: clientId,
          error: error instanceof Error ? error.message : 'Unknown error',
          error_code: 'UPDATE_ERROR'
        });
        result.error_count++;
      }
    }
  }

  /**
   * Execute delete batch operation
   */
  private static async executeDeleteBatch(
    operation: ClientBatchOperation,
    result: ClientBatchOperationResult
  ): Promise<void> {
    for (const clientId of operation.client_ids) {
      try {
        // Skip if client had pre-flight errors
        if (result.errors.some(e => e.client_id === clientId)) {
          continue;
        }

        // Perform soft delete
        await ClientService.delete({
          client_id: clientId,
          deletion_type: 'soft',
          reason: 'Batch deletion',
          force: operation.force || false,
          handle_folders: 'keep'
        });

        result.success_ids.push(clientId);
        result.success_count++;

      } catch (error) {
        result.errors.push({
          client_id: clientId,
          error: error instanceof Error ? error.message : 'Unknown error',
          error_code: 'DELETE_ERROR'
        });
        result.error_count++;
      }
    }
  }

  /**
   * Execute status change batch operation
   */
  private static async executeStatusChangeBatch(
    operation: ClientBatchOperation,
    result: ClientBatchOperationResult
  ): Promise<void> {
    const newStatus = operation.data?.new_status as ClientStatus;
    if (!newStatus) {
      throw new Error('New status is required');
    }

    const supabase = await createSupabaseClient();

    try {
      const { data: updatedClients, error } = await supabase
        .from('clients')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .in('id', operation.client_ids)
        .is('deleted_at', null)
        .select('id');

      if (error) {
        throw new Error(`Batch status update failed: ${error.message}`);
      }

      const successIds = updatedClients?.map(c => c.id) || [];
      result.success_ids = successIds;
      result.success_count = successIds.length;

      // Mark any missing IDs as errors
      const successSet = new Set(successIds);
      operation.client_ids.forEach(clientId => {
        if (!successSet.has(clientId)) {
          result.errors.push({
            client_id: clientId,
            error: 'Failed to update status',
            error_code: 'STATUS_UPDATE_FAILED'
          });
          result.error_count++;
        }
      });

    } catch (error) {
      // If batch update fails, mark all as errors
      operation.client_ids.forEach(clientId => {
        result.errors.push({
          client_id: clientId,
          error: error instanceof Error ? error.message : 'Unknown error',
          error_code: 'BATCH_UPDATE_ERROR'
        });
        result.error_count++;
      });
    }
  }

  /**
   * Execute add tags batch operation
   */
  private static async executeAddTagsBatch(
    operation: ClientBatchOperation,
    result: ClientBatchOperationResult
  ): Promise<void> {
    const tagsToAdd = operation.data?.tags || [];
    if (!tagsToAdd.length) {
      throw new Error('Tags are required for add tags operation');
    }

    const supabase = await createSupabaseClient();

    for (const clientId of operation.client_ids) {
      try {
        // Skip if client had pre-flight errors
        if (result.errors.some(e => e.client_id === clientId)) {
          continue;
        }

        // Get current tags
        const { data: client } = await supabase
          .from('clients')
          .select('tags')
          .eq('id', clientId)
          .is('deleted_at', null)
          .single();

        if (!client) {
          result.errors.push({
            client_id: clientId,
            error: 'Client not found',
            error_code: 'NOT_FOUND'
          });
          result.error_count++;
          continue;
        }

        // Merge tags
        const currentTags = client.tags || [];
        const newTags = [...new Set([...currentTags, ...tagsToAdd])];

        // Update client
        const { error } = await supabase
          .from('clients')
          .update({
            tags: newTags,
            updated_at: new Date().toISOString()
          })
          .eq('id', clientId);

        if (error) {
          throw new Error(error.message);
        }

        result.success_ids.push(clientId);
        result.success_count++;

      } catch (error) {
        result.errors.push({
          client_id: clientId,
          error: error instanceof Error ? error.message : 'Unknown error',
          error_code: 'ADD_TAGS_ERROR'
        });
        result.error_count++;
      }
    }
  }

  /**
   * Execute remove tags batch operation
   */
  private static async executeRemoveTagsBatch(
    operation: ClientBatchOperation,
    result: ClientBatchOperationResult
  ): Promise<void> {
    const tagsToRemove = operation.data?.tags || [];
    if (!tagsToRemove.length) {
      throw new Error('Tags are required for remove tags operation');
    }

    const supabase = await createSupabaseClient();

    for (const clientId of operation.client_ids) {
      try {
        // Skip if client had pre-flight errors
        if (result.errors.some(e => e.client_id === clientId)) {
          continue;
        }

        // Get current tags
        const { data: client } = await supabase
          .from('clients')
          .select('tags')
          .eq('id', clientId)
          .is('deleted_at', null)
          .single();

        if (!client) {
          result.errors.push({
            client_id: clientId,
            error: 'Client not found',
            error_code: 'NOT_FOUND'
          });
          result.error_count++;
          continue;
        }

        // Remove tags
        const currentTags = client.tags || [];
        const newTags = currentTags.filter(tag => !tagsToRemove.includes(tag));

        // Update client
        const { error } = await supabase
          .from('clients')
          .update({
            tags: newTags,
            updated_at: new Date().toISOString()
          })
          .eq('id', clientId);

        if (error) {
          throw new Error(error.message);
        }

        result.success_ids.push(clientId);
        result.success_count++;

      } catch (error) {
        result.errors.push({
          client_id: clientId,
          error: error instanceof Error ? error.message : 'Unknown error',
          error_code: 'REMOVE_TAGS_ERROR'
        });
        result.error_count++;
      }
    }
  }

  /**
   * Get batch operation status (for long-running operations)
   */
  static async getBatchStatus(batchId: string): Promise<{
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    result?: ClientBatchOperationResult;
  }> {
    // This would be implemented if you need async batch processing
    // For now, all operations are synchronous
    throw new Error('Batch status tracking not implemented');
  }
}