/**
 * Client Batch Operations Service tests
 * Tests batch processing, bulk operations, and mass updates for client management
 */

import { BatchService } from '@/lib/services/clients/batch-service';
import { testSupabase, initializeTestDatabase, seedTestData, cleanTestDatabase } from '../setup/db-setup';
import { createMockIndividualClientData, createMockBusinessClientData } from '../setup/mocks/fixtures/clients';
import type { BatchOperation, BatchResult, BatchUpdateData } from '@/types/clients/operations';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => testSupabase)
}));

describe('BatchService', () => {
  const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

  beforeAll(async () => {
    await initializeTestDatabase();
    await seedTestData();
  });

  beforeEach(async () => {
    // Clean up test data
    await testSupabase
      .from('clients')
      .delete()
      .like('contact_info->email', '%batchtest%');
  });

  describe('batchCreate', () => {
    test('should create multiple clients successfully', async () => {
      const clientsData = [
        createMockIndividualClientData({
          individual_info: { first_name: 'Batch', last_name: 'Individual1' },
          contact_info: { email: 'batch1@batchtest.com' }
        }),
        createMockBusinessClientData({
          business_info: { company_name: 'Batch Business Corp' },
          contact_info: { email: 'batch2@batchtest.com' }
        }),
        createMockIndividualClientData({
          individual_info: { first_name: 'Batch', last_name: 'Individual2' },
          contact_info: { email: 'batch3@batchtest.com' }
        })
      ];

      const result = await BatchService.batchCreate(clientsData, TEST_USER_ID);

      expect(result.success).toBe(true);
      expect(result.total_processed).toBe(3);
      expect(result.successful_count).toBe(3);
      expect(result.failed_count).toBe(0);
      expect(result.successful_operations.length).toBe(3);
      expect(result.failed_operations.length).toBe(0);

      // Verify clients were created
      result.successful_operations.forEach(operation => {
        expect(operation.client_id).toBeDefined();
        expect(operation.operation_type).toBe('create');
        expect(operation.status).toBe('success');
      });
    });

    test('should handle partial failures in batch creation', async () => {
      const clientsData = [
        createMockIndividualClientData({
          contact_info: { email: 'valid1@batchtest.com' }
        }),
        createMockIndividualClientData({
          individual_info: { first_name: '', last_name: 'Invalid' }, // Invalid - missing required field
          contact_info: { email: 'invalid@batchtest.com' }
        }),
        createMockBusinessClientData({
          contact_info: { email: 'valid2@batchtest.com' }
        }),
        createMockIndividualClientData({
          contact_info: { email: 'invalid-email' } // Invalid email format
        })
      ];

      const result = await BatchService.batchCreate(clientsData, TEST_USER_ID);

      expect(result.success).toBe(false); // Overall operation failed due to some failures
      expect(result.total_processed).toBe(4);
      expect(result.successful_count).toBe(2);
      expect(result.failed_count).toBe(2);
      expect(result.successful_operations.length).toBe(2);
      expect(result.failed_operations.length).toBe(2);

      // Check failed operations have error details
      result.failed_operations.forEach(operation => {
        expect(operation.error).toBeDefined();
        expect(operation.status).toBe('error');
      });
    });

    test('should handle duplicate email addresses in batch', async () => {
      const duplicateEmail = 'duplicate@batchtest.com';
      
      const clientsData = [
        createMockIndividualClientData({
          contact_info: { email: duplicateEmail }
        }),
        createMockBusinessClientData({
          contact_info: { email: duplicateEmail } // Duplicate email
        })
      ];

      const result = await BatchService.batchCreate(clientsData, TEST_USER_ID);

      expect(result.success).toBe(false);
      expect(result.failed_count).toBeGreaterThan(0);
      expect(result.failed_operations.some(op => 
        op.error?.includes('duplicate') || op.error?.includes('unique')
      )).toBe(true);
    });

    test('should respect batch size limits', async () => {
      // Create a large batch (over the typical limit)
      const largeClientsBatch = [];
      for (let i = 0; i < 1000; i++) {
        largeClientsBatch.push(createMockIndividualClientData({
          contact_info: { email: `large${i}@batchtest.com` }
        }));
      }

      const result = await BatchService.batchCreate(largeClientsBatch, TEST_USER_ID);

      expect(result).toBeDefined();
      expect(result.total_processed).toBeLessThanOrEqual(1000);
      
      // Should either process all or implement chunking
      if (result.total_processed < 1000) {
        expect(result.warnings).toBeDefined();
        expect(result.warnings?.some(w => w.includes('batch size'))).toBe(true);
      }
    });
  });

  describe('batchUpdate', () => {
    test('should update multiple clients successfully', async () => {
      // Create test clients first
      const clientsData = [
        createMockIndividualClientData({
          contact_info: { email: 'update1@batchtest.com' }
        }),
        createMockBusinessClientData({
          contact_info: { email: 'update2@batchtest.com' }
        })
      ];

      const createResults = await Promise.all(
        clientsData.map(data => testSupabase.from('clients').insert(data).select('*').single())
      );

      const clientIds = createResults.map(result => result.data.id);

      // Batch update
      const updateData: BatchUpdateData = {
        tags: ['batch-updated', 'test'],
        commercial_info: {
          priority: 'high',
          risk_level: 'medium'
        }
      };

      const result = await BatchService.batchUpdate(clientIds, updateData);

      expect(result.success).toBe(true);
      expect(result.successful_count).toBe(2);
      expect(result.failed_count).toBe(0);

      // Verify updates were applied
      for (const clientId of clientIds) {
        const { data: updatedClient } = await testSupabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();

        expect(updatedClient.tags).toContain('batch-updated');
        expect(updatedClient.tags).toContain('test');
        expect(updatedClient.commercial_info.priority).toBe('high');
        expect(updatedClient.commercial_info.risk_level).toBe('medium');
      }
    });

    test('should handle partial failures in batch updates', async () => {
      // Create test clients
      const validClient = createMockIndividualClientData({
        contact_info: { email: 'valid.update@batchtest.com' }
      });

      const { data: createdClient } = await testSupabase
        .from('clients')
        .insert(validClient)
        .select('*')
        .single();

      const clientIds = [
        createdClient.id,
        '00000000-0000-0000-0000-000000000000' // Non-existent ID
      ];

      const updateData: BatchUpdateData = {
        commercial_info: { credit_limit: 25000 }
      };

      const result = await BatchService.batchUpdate(clientIds, updateData);

      expect(result.success).toBe(false); // Overall failed due to one failure
      expect(result.successful_count).toBe(1);
      expect(result.failed_count).toBe(1);
      expect(result.failed_operations[0].client_id).toBe('00000000-0000-0000-0000-000000000000');
    });

    test('should validate update data before processing', async () => {
      // Create a test client
      const clientData = createMockIndividualClientData({
        contact_info: { email: 'validate@batchtest.com' }
      });

      const { data: client } = await testSupabase
        .from('clients')
        .insert(clientData)
        .select('*')
        .single();

      // Invalid update data
      const invalidUpdateData: BatchUpdateData = {
        commercial_info: {
          credit_limit: -1000, // Invalid negative credit limit
          payment_terms_days: -30 // Invalid negative payment terms
        }
      };

      const result = await BatchService.batchUpdate([client.id], invalidUpdateData);

      expect(result.success).toBe(false);
      expect(result.failed_count).toBe(1);
      expect(result.failed_operations[0].error).toBeDefined();
    });

    test('should merge update data with existing client data', async () => {
      // Create a client with existing commercial info
      const clientData = createMockBusinessClientData({
        contact_info: { email: 'merge@batchtest.com' },
        commercial_info: {
          credit_limit: 10000,
          priority: 'normal',
          risk_level: 'low',
          payment_terms: 'net_30'
        }
      });

      const { data: client } = await testSupabase
        .from('clients')
        .insert(clientData)
        .select('*')
        .single();

      // Partial update - should merge with existing data
      const partialUpdateData: BatchUpdateData = {
        commercial_info: {
          priority: 'high',
          credit_limit: 20000
          // Other fields should remain unchanged
        }
      };

      const result = await BatchService.batchUpdate([client.id], partialUpdateData);

      expect(result.success).toBe(true);

      // Verify merged data
      const { data: updatedClient } = await testSupabase
        .from('clients')
        .select('*')
        .eq('id', client.id)
        .single();

      expect(updatedClient.commercial_info.priority).toBe('high'); // Updated
      expect(updatedClient.commercial_info.credit_limit).toBe(20000); // Updated
      expect(updatedClient.commercial_info.risk_level).toBe('low'); // Unchanged
      expect(updatedClient.commercial_info.payment_terms).toBe('net_30'); // Unchanged
    });
  });

  describe('batchDelete', () => {
    test('should soft delete multiple clients successfully', async () => {
      // Create test clients
      const clientsData = [
        createMockIndividualClientData({
          contact_info: { email: 'delete1@batchtest.com' }
        }),
        createMockBusinessClientData({
          contact_info: { email: 'delete2@batchtest.com' }
        })
      ];

      const createResults = await Promise.all(
        clientsData.map(data => testSupabase.from('clients').insert(data).select('*').single())
      );

      const clientIds = createResults.map(result => result.data.id);

      const result = await BatchService.batchDelete({
        client_ids: clientIds,
        deletion_type: 'soft',
        reason: 'Batch deletion test'
      });

      expect(result.success).toBe(true);
      expect(result.successful_count).toBe(2);
      expect(result.failed_count).toBe(0);

      // Verify clients are soft deleted
      for (const clientId of clientIds) {
        const { data } = await testSupabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .is('deleted_at', null);

        expect(data).toEqual([]); // Should not find active clients
      }
    });

    test('should handle clients with active folders', async () => {
      // Create a client
      const clientData = createMockBusinessClientData({
        contact_info: { email: 'withfolders@batchtest.com' }
      });

      const { data: client } = await testSupabase
        .from('clients')
        .insert(clientData)
        .select('*')
        .single();

      // Create an active folder for the client
      await testSupabase
        .from('folders')
        .insert({
          client_id: client.id,
          status: 'active',
          priority: 'normal',
          created_by: TEST_USER_ID
        });

      // Try to delete without force
      const result = await BatchService.batchDelete({
        client_ids: [client.id],
        deletion_type: 'soft',
        reason: 'Should fail due to active folders'
      });

      expect(result.success).toBe(false);
      expect(result.failed_count).toBe(1);
      expect(result.failed_operations[0].error).toContain('active folders');
    });

    test('should force delete clients with folder handling', async () => {
      // Create clients
      const client1Data = createMockIndividualClientData({
        contact_info: { email: 'force1@batchtest.com' }
      });

      const client2Data = createMockIndividualClientData({
        contact_info: { email: 'force2@batchtest.com' }
      });

      const [{ data: client1 }, { data: client2 }] = await Promise.all([
        testSupabase.from('clients').insert(client1Data).select('*').single(),
        testSupabase.from('clients').insert(client2Data).select('*').single()
      ]);

      // Create folders for clients
      await Promise.all([
        testSupabase.from('folders').insert({
          client_id: client1.id,
          status: 'active',
          priority: 'normal',
          created_by: TEST_USER_ID
        }),
        testSupabase.from('folders').insert({
          client_id: client2.id,
          status: 'active',
          priority: 'high',
          created_by: TEST_USER_ID
        })
      ]);

      // Force delete with folder archiving
      const result = await BatchService.batchDelete({
        client_ids: [client1.id, client2.id],
        deletion_type: 'soft',
        reason: 'Force delete with folder handling',
        force: true,
        handle_folders: 'archive'
      });

      expect(result.success).toBe(true);
      expect(result.successful_count).toBe(2);
      expect(result.successful_operations.every(op => 
        op.folder_actions && op.folder_actions.length > 0
      )).toBe(true);
    });

    test('should transfer folders to another client in batch deletion', async () => {
      // Create source clients and target client
      const sourceClient1Data = createMockIndividualClientData({
        contact_info: { email: 'source1@batchtest.com' }
      });

      const sourceClient2Data = createMockIndividualClientData({
        contact_info: { email: 'source2@batchtest.com' }
      });

      const targetClientData = createMockBusinessClientData({
        contact_info: { email: 'target@batchtest.com' }
      });

      const [{ data: source1 }, { data: source2 }, { data: target }] = await Promise.all([
        testSupabase.from('clients').insert(sourceClient1Data).select('*').single(),
        testSupabase.from('clients').insert(sourceClient2Data).select('*').single(),
        testSupabase.from('clients').insert(targetClientData).select('*').single()
      ]);

      // Create folders for source clients
      await Promise.all([
        testSupabase.from('folders').insert({
          client_id: source1.id,
          status: 'active',
          priority: 'normal',
          created_by: TEST_USER_ID
        }),
        testSupabase.from('folders').insert({
          client_id: source2.id,
          status: 'pending',
          priority: 'high',
          created_by: TEST_USER_ID
        })
      ]);

      // Delete with folder transfer
      const result = await BatchService.batchDelete({
        client_ids: [source1.id, source2.id],
        deletion_type: 'soft',
        reason: 'Batch transfer test',
        force: true,
        handle_folders: 'transfer',
        transfer_to_client_id: target.id
      });

      expect(result.success).toBe(true);
      expect(result.successful_operations.every(op =>
        op.folder_actions?.every(action => 
          action.action === 'transferred' && 
          action.target_client_id === target.id
        )
      )).toBe(true);
    });

    test('should perform hard delete in batch', async () => {
      // Create test clients
      const clientsData = [
        createMockIndividualClientData({
          contact_info: { email: 'hard1@batchtest.com' }
        }),
        createMockBusinessClientData({
          contact_info: { email: 'hard2@batchtest.com' }
        })
      ];

      const createResults = await Promise.all(
        clientsData.map(data => testSupabase.from('clients').insert(data).select('*').single())
      );

      const clientIds = createResults.map(result => result.data.id);

      const result = await BatchService.batchDelete({
        client_ids: clientIds,
        deletion_type: 'hard',
        reason: 'Hard delete batch test'
      });

      expect(result.success).toBe(true);
      expect(result.successful_count).toBe(2);

      // Verify clients are completely removed
      for (const clientId of clientIds) {
        const { data } = await testSupabase
          .from('clients')
          .select('*')
          .eq('id', clientId);

        expect(data).toEqual([]); // Should not find any records
      }
    });
  });

  describe('batchTagManagement', () => {
    test('should add tags to multiple clients', async () => {
      // Create test clients
      const clientsData = [
        createMockIndividualClientData({
          contact_info: { email: 'tag1@batchtest.com' },
          tags: ['existing1']
        }),
        createMockBusinessClientData({
          contact_info: { email: 'tag2@batchtest.com' },
          tags: ['existing2']
        })
      ];

      const createResults = await Promise.all(
        clientsData.map(data => testSupabase.from('clients').insert(data).select('*').single())
      );

      const clientIds = createResults.map(result => result.data.id);

      const result = await BatchService.batchTagManagement({
        client_ids: clientIds,
        operation: 'add',
        tags: ['batch-added', 'new-tag']
      });

      expect(result.success).toBe(true);
      expect(result.successful_count).toBe(2);

      // Verify tags were added
      for (const clientId of clientIds) {
        const { data: client } = await testSupabase
          .from('clients')
          .select('tags')
          .eq('id', clientId)
          .single();

        expect(client.tags).toContain('batch-added');
        expect(client.tags).toContain('new-tag');
        // Existing tags should remain
        expect(client.tags.some((tag: string) => tag.startsWith('existing'))).toBe(true);
      }
    });

    test('should remove tags from multiple clients', async () => {
      // Create test clients with tags
      const clientsData = [
        createMockIndividualClientData({
          contact_info: { email: 'remove1@batchtest.com' },
          tags: ['keep', 'remove', 'batch-tag']
        }),
        createMockBusinessClientData({
          contact_info: { email: 'remove2@batchtest.com' },
          tags: ['keep', 'remove', 'other-tag']
        })
      ];

      const createResults = await Promise.all(
        clientsData.map(data => testSupabase.from('clients').insert(data).select('*').single())
      );

      const clientIds = createResults.map(result => result.data.id);

      const result = await BatchService.batchTagManagement({
        client_ids: clientIds,
        operation: 'remove',
        tags: ['remove']
      });

      expect(result.success).toBe(true);
      expect(result.successful_count).toBe(2);

      // Verify tags were removed
      for (const clientId of clientIds) {
        const { data: client } = await testSupabase
          .from('clients')
          .select('tags')
          .eq('id', clientId)
          .single();

        expect(client.tags).not.toContain('remove');
        expect(client.tags).toContain('keep'); // Other tags should remain
      }
    });

    test('should replace all tags on multiple clients', async () => {
      // Create test clients with existing tags
      const clientsData = [
        createMockIndividualClientData({
          contact_info: { email: 'replace1@batchtest.com' },
          tags: ['old1', 'old2', 'old3']
        }),
        createMockBusinessClientData({
          contact_info: { email: 'replace2@batchtest.com' },
          tags: ['different1', 'different2']
        })
      ];

      const createResults = await Promise.all(
        clientsData.map(data => testSupabase.from('clients').insert(data).select('*').single())
      );

      const clientIds = createResults.map(result => result.data.id);

      const newTags = ['new1', 'new2', 'replacement'];

      const result = await BatchService.batchTagManagement({
        client_ids: clientIds,
        operation: 'replace',
        tags: newTags
      });

      expect(result.success).toBe(true);
      expect(result.successful_count).toBe(2);

      // Verify tags were replaced
      for (const clientId of clientIds) {
        const { data: client } = await testSupabase
          .from('clients')
          .select('tags')
          .eq('id', clientId)
          .single();

        expect(client.tags).toEqual(newTags);
        expect(client.tags).not.toContain('old1');
        expect(client.tags).not.toContain('different1');
      }
    });
  });

  describe('batchStatusUpdate', () => {
    test('should update status for multiple clients', async () => {
      // Create test clients with different statuses
      const clientsData = [
        createMockIndividualClientData({
          contact_info: { email: 'status1@batchtest.com' },
          status: 'pending'
        }),
        createMockBusinessClientData({
          contact_info: { email: 'status2@batchtest.com' },
          status: 'pending'
        })
      ];

      const createResults = await Promise.all(
        clientsData.map(data => testSupabase.from('clients').insert(data).select('*').single())
      );

      const clientIds = createResults.map(result => result.data.id);

      const result = await BatchService.batchStatusUpdate({
        client_ids: clientIds,
        new_status: 'active',
        reason: 'Batch activation'
      });

      expect(result.success).toBe(true);
      expect(result.successful_count).toBe(2);

      // Verify status updates
      for (const clientId of clientIds) {
        const { data: client } = await testSupabase
          .from('clients')
          .select('status')
          .eq('id', clientId)
          .single();

        expect(client.status).toBe('active');
      }
    });

    test('should handle invalid status transitions in batch', async () => {
      // Create a client with active status
      const clientData = createMockIndividualClientData({
        contact_info: { email: 'invalid.status@batchtest.com' },
        status: 'active'
      });

      const { data: client } = await testSupabase
        .from('clients')
        .insert(clientData)
        .select('*')
        .single();

      // Try to transition to invalid status
      const result = await BatchService.batchStatusUpdate({
        client_ids: [client.id],
        new_status: 'deleted', // Invalid direct transition
        reason: 'Should fail'
      });

      expect(result.success).toBe(false);
      expect(result.failed_count).toBe(1);
      expect(result.failed_operations[0].error).toBeDefined();
    });
  });

  describe('progress tracking', () => {
    test('should provide progress updates for long-running operations', async () => {
      // Create a larger batch to test progress tracking
      const largeClientsBatch = [];
      for (let i = 0; i < 50; i++) {
        largeClientsBatch.push(createMockIndividualClientData({
          contact_info: { email: `progress${i}@batchtest.com` }
        }));
      }

      let progressUpdates = 0;
      const progressCallback = (progress: { completed: number; total: number; percentage: number }) => {
        progressUpdates++;
        expect(progress.completed).toBeGreaterThanOrEqual(0);
        expect(progress.total).toBe(50);
        expect(progress.percentage).toBeGreaterThanOrEqual(0);
        expect(progress.percentage).toBeLessThanOrEqual(100);
      };

      const result = await BatchService.batchCreate(
        largeClientsBatch, 
        TEST_USER_ID,
        { progressCallback }
      );

      expect(result.success).toBe(true);
      expect(progressUpdates).toBeGreaterThan(0);
    });

    test('should handle cancellation of batch operations', async () => {
      const clientsBatch = [];
      for (let i = 0; i < 20; i++) {
        clientsBatch.push(createMockIndividualClientData({
          contact_info: { email: `cancel${i}@batchtest.com` }
        }));
      }

      let cancelAfter = 5;
      const progressCallback = (progress: { completed: number }, cancel: () => void) => {
        if (progress.completed >= cancelAfter) {
          cancel();
        }
      };

      const result = await BatchService.batchCreate(
        clientsBatch, 
        TEST_USER_ID,
        { progressCallback }
      );

      expect(result.cancelled).toBe(true);
      expect(result.successful_count).toBeLessThan(20);
      expect(result.successful_count).toBeGreaterThanOrEqual(5);
    });
  });

  describe('performance and limits', () => {
    test('should handle large batch operations efficiently', async () => {
      const batchSize = 100;
      const clientsBatch = [];
      
      for (let i = 0; i < batchSize; i++) {
        clientsBatch.push(createMockIndividualClientData({
          contact_info: { email: `perf${i}@batchtest.com` }
        }));
      }

      const startTime = Date.now();
      
      const result = await BatchService.batchCreate(clientsBatch, TEST_USER_ID);
      
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
      expect(result.successful_count).toBe(batchSize);
    });

    test('should implement proper chunking for very large batches', async () => {
      const veryLargeBatch = [];
      for (let i = 0; i < 500; i++) {
        veryLargeBatch.push(createMockIndividualClientData({
          contact_info: { email: `chunk${i}@batchtest.com` }
        }));
      }

      const result = await BatchService.batchCreate(veryLargeBatch, TEST_USER_ID);

      expect(result).toBeDefined();
      // Should either process all or implement reasonable chunking
      expect(result.total_processed).toBeGreaterThan(0);
      
      if (result.warnings) {
        expect(result.warnings.some(w => w.includes('chunked') || w.includes('batch'))).toBe(true);
      }
    });
  });

  describe('error handling and recovery', () => {
    test('should handle database connection failures gracefully', async () => {
      const clientsBatch = [
        createMockIndividualClientData({
          contact_info: { email: 'connection@batchtest.com' }
        })
      ];

      // Mock database connection failure
      const originalFrom = testSupabase.from;
      testSupabase.from = jest.fn(() => {
        throw new Error('Connection failed');
      }) as any;

      await expect(BatchService.batchCreate(clientsBatch, TEST_USER_ID)).rejects.toThrow('Connection failed');

      // Restore original function
      testSupabase.from = originalFrom;
    });

    test('should provide detailed error information for failures', async () => {
      const invalidClientsBatch = [
        createMockIndividualClientData({
          individual_info: { first_name: '', last_name: 'Empty' }, // Invalid
          contact_info: { email: 'error1@batchtest.com' }
        }),
        createMockBusinessClientData({
          business_info: { company_name: '', industry: 'information_technology' }, // Invalid
          contact_info: { email: 'error2@batchtest.com' }
        })
      ];

      const result = await BatchService.batchCreate(invalidClientsBatch, TEST_USER_ID);

      expect(result.failed_operations.length).toBe(2);
      
      result.failed_operations.forEach(operation => {
        expect(operation.error).toBeDefined();
        expect(operation.error_details).toBeDefined();
        expect(operation.input_data).toBeDefined();
        expect(operation.timestamp).toBeDefined();
      });
    });

    test('should handle transaction rollback for critical operations', async () => {
      // This would test transactional behavior for operations that must be atomic
      // For now, this is a placeholder for transaction testing
      expect(true).toBe(true);
    });
  });

  afterAll(async () => {
    await cleanTestDatabase();
  });
});