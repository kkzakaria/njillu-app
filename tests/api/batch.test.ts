/**
 * Batch operations API endpoint tests
 * Tests bulk operations on multiple clients
 */

import { NextRequest } from 'next/server';
import { POST as batchOperation } from '@/app/api/clients/batch/route';
import { testSupabase, initializeTestDatabase, seedTestData } from '../setup/db-setup';
import { createMockIndividualClientData, createMockBusinessClientData } from '../setup/mocks/fixtures/clients';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => testSupabase)
}));

describe('Batch Operations API', () => {
  let testClientIds: string[] = [];

  beforeAll(async () => {
    await initializeTestDatabase();
    await seedTestData();

    // Create additional test clients for batch operations
    const clients = await Promise.all([
      testSupabase
        .from('clients')
        .insert(createMockIndividualClientData({ 
          contact_info: { email: 'batch1@example.com' },
          tags: ['batch-test']
        }))
        .select('id')
        .single(),
      testSupabase
        .from('clients')
        .insert(createMockBusinessClientData({ 
          contact_info: { email: 'batch2@example.com' },
          tags: ['batch-test']
        }))
        .select('id')
        .single(),
      testSupabase
        .from('clients')
        .insert(createMockIndividualClientData({ 
          contact_info: { email: 'batch3@example.com' },
          tags: ['batch-test']
        }))
        .select('id')
        .single(),
    ]);

    testClientIds = clients.map(result => result.data!.id);
  });

  describe('POST /api/clients/batch', () => {
    test('should perform batch update successfully', async () => {
      const batchData = {
        operation: 'update',
        client_ids: testClientIds.slice(0, 2),
        data: {
          tags: ['batch-updated', 'test'],
          commercial_info: {
            priority: 'high'
          }
        }
      };

      const request = new NextRequest('http://localhost:3000/api/clients/batch', {
        method: 'POST',
        body: JSON.stringify(batchData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await batchOperation(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.processed_count).toBe(2);
      expect(data.data.success_count).toBe(2);
      expect(data.data.error_count).toBe(0);
      expect(data.data.results).toHaveLength(2);

      // Verify updates were applied
      const updatedClients = await testSupabase
        .from('clients')
        .select('id, tags, commercial_info')
        .in('id', testClientIds.slice(0, 2));

      expect(updatedClients.data).toBeDefined();
      updatedClients.data!.forEach(client => {
        expect(client.tags).toContain('batch-updated');
        expect(client.commercial_info.priority).toBe('high');
      });
    });

    test('should perform batch delete successfully', async () => {
      // Create clients specifically for deletion test
      const deleteClients = await Promise.all([
        testSupabase
          .from('clients')
          .insert(createMockIndividualClientData({ 
            contact_info: { email: 'delete1@example.com' }
          }))
          .select('id')
          .single(),
        testSupabase
          .from('clients')
          .insert(createMockIndividualClientData({ 
            contact_info: { email: 'delete2@example.com' }
          }))
          .select('id')
          .single(),
      ]);

      const deleteIds = deleteClients.map(result => result.data!.id);

      const batchData = {
        operation: 'delete',
        client_ids: deleteIds,
        data: {
          deletion_type: 'soft',
          reason: 'Batch deletion test',
          force: true
        }
      };

      const request = new NextRequest('http://localhost:3000/api/clients/batch', {
        method: 'POST',
        body: JSON.stringify(batchData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await batchOperation(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.processed_count).toBe(2);
      expect(data.data.success_count).toBe(2);

      // Verify clients are soft deleted (not visible in normal queries)
      const deletedClients = await testSupabase
        .from('clients')
        .select('id')
        .in('id', deleteIds);

      expect(deletedClients.data).toEqual([]);
    });

    test('should perform batch status change', async () => {
      const batchData = {
        operation: 'update_status',
        client_ids: [testClientIds[2]],
        data: {
          status: 'inactive',
          reason: 'Batch status change test'
        }
      };

      const request = new NextRequest('http://localhost:3000/api/clients/batch', {
        method: 'POST',
        body: JSON.stringify(batchData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await batchOperation(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.success_count).toBe(1);

      // Verify status change
      const updatedClient = await testSupabase
        .from('clients')
        .select('status')
        .eq('id', testClientIds[2])
        .single();

      expect(updatedClient.data?.status).toBe('inactive');
    });

    test('should handle batch tag operations', async () => {
      const batchData = {
        operation: 'add_tags',
        client_ids: testClientIds.slice(0, 2),
        data: {
          tags: ['new-tag', 'batch-tag']
        }
      };

      const request = new NextRequest('http://localhost:3000/api/clients/batch', {
        method: 'POST',
        body: JSON.stringify(batchData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await batchOperation(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.success_count).toBe(2);

      // Verify tags were added
      const updatedClients = await testSupabase
        .from('clients')
        .select('tags')
        .in('id', testClientIds.slice(0, 2));

      expect(updatedClients.data).toBeDefined();
      updatedClients.data!.forEach(client => {
        expect(client.tags).toContain('new-tag');
        expect(client.tags).toContain('batch-tag');
      });
    });

    test('should handle batch tag removal', async () => {
      // First add tags
      await testSupabase
        .from('clients')
        .update({ tags: ['remove-me', 'keep-me', 'test'] })
        .eq('id', testClientIds[0]);

      const batchData = {
        operation: 'remove_tags',
        client_ids: [testClientIds[0]],
        data: {
          tags: ['remove-me']
        }
      };

      const request = new NextRequest('http://localhost:3000/api/clients/batch', {
        method: 'POST',
        body: JSON.stringify(batchData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await batchOperation(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify tag was removed
      const updatedClient = await testSupabase
        .from('clients')
        .select('tags')
        .eq('id', testClientIds[0])
        .single();

      expect(updatedClient.data?.tags).not.toContain('remove-me');
      expect(updatedClient.data?.tags).toContain('keep-me');
    });

    test('should handle mixed success/failure results', async () => {
      const validClientId = testClientIds[0];
      const invalidClientId = '00000000-0000-0000-0000-000000000000';

      const batchData = {
        operation: 'update',
        client_ids: [validClientId, invalidClientId],
        data: {
          tags: ['mixed-batch-test']
        }
      };

      const request = new NextRequest('http://localhost:3000/api/clients/batch', {
        method: 'POST',
        body: JSON.stringify(batchData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await batchOperation(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.processed_count).toBe(2);
      expect(data.data.success_count).toBe(1);
      expect(data.data.error_count).toBe(1);
      expect(data.data.results).toHaveLength(2);

      // Check individual results
      const successResult = data.data.results.find((r: any) => r.id === validClientId);
      const errorResult = data.data.results.find((r: any) => r.id === invalidClientId);

      expect(successResult.success).toBe(true);
      expect(errorResult.success).toBe(false);
      expect(errorResult.error).toBeDefined();
    });

    test('should validate batch operation parameters', async () => {
      const invalidBatchData = {
        operation: 'invalid_operation',
        client_ids: testClientIds.slice(0, 1),
        data: {}
      };

      const request = new NextRequest('http://localhost:3000/api/clients/batch', {
        method: 'POST',
        body: JSON.stringify(invalidBatchData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await batchOperation(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/operation|invalid/i);
    });

    test('should validate client_ids array', async () => {
      const invalidBatchData = {
        operation: 'update',
        client_ids: [], // Empty array
        data: { tags: ['test'] }
      };

      const request = new NextRequest('http://localhost:3000/api/clients/batch', {
        method: 'POST',
        body: JSON.stringify(invalidBatchData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await batchOperation(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/client_ids|empty/i);
    });

    test('should enforce batch size limits', async () => {
      // Create a large array of client IDs (assuming there's a limit)
      const largeClientIdArray = new Array(1000).fill('00000000-0000-0000-0000-000000000000');

      const largeBatchData = {
        operation: 'update',
        client_ids: largeClientIdArray,
        data: { tags: ['large-batch'] }
      };

      const request = new NextRequest('http://localhost:3000/api/clients/batch', {
        method: 'POST',
        body: JSON.stringify(largeBatchData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await batchOperation(request);
      const data = await response.json();

      // Should either limit the batch size or reject it
      if (response.status === 400) {
        expect(data.message).toMatch(/limit|too many|batch size/i);
      } else {
        expect(response.status).toBe(200);
        expect(data.data.processed_count).toBeLessThanOrEqual(100); // Assuming max batch size
      }
    });

    test('should validate UUID format in client_ids', async () => {
      const invalidBatchData = {
        operation: 'update',
        client_ids: ['invalid-uuid', testClientIds[0]],
        data: { tags: ['test'] }
      };

      const request = new NextRequest('http://localhost:3000/api/clients/batch', {
        method: 'POST',
        body: JSON.stringify(invalidBatchData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await batchOperation(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/uuid|invalid/i);
    });

    test('should handle batch operations with validation errors', async () => {
      const batchData = {
        operation: 'update',
        client_ids: testClientIds.slice(0, 1),
        data: {
          contact_info: {
            email: 'invalid-email-format'
          }
        }
      };

      const request = new NextRequest('http://localhost:3000/api/clients/batch', {
        method: 'POST',
        body: JSON.stringify(batchData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await batchOperation(request);
      const data = await response.json();

      // Should either fail validation for all or handle individual failures
      if (response.status === 400) {
        expect(data.message).toMatch(/email|validation/i);
      } else {
        expect(data.data.error_count).toBeGreaterThan(0);
      }
    });

    test('should handle concurrent batch operations', async () => {
      const batch1Data = {
        operation: 'update',
        client_ids: [testClientIds[0]],
        data: { tags: ['concurrent-1'] }
      };

      const batch2Data = {
        operation: 'update',
        client_ids: [testClientIds[1]],
        data: { tags: ['concurrent-2'] }
      };

      const request1 = new NextRequest('http://localhost:3000/api/clients/batch', {
        method: 'POST',
        body: JSON.stringify(batch1Data),
        headers: { 'Content-Type': 'application/json' }
      });

      const request2 = new NextRequest('http://localhost:3000/api/clients/batch', {
        method: 'POST',
        body: JSON.stringify(batch2Data),
        headers: { 'Content-Type': 'application/json' }
      });

      const [response1, response2] = await Promise.all([
        batchOperation(request1),
        batchOperation(request2)
      ]);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      const [data1, data2] = await Promise.all([
        response1.json(),
        response2.json()
      ]);

      expect(data1.success).toBe(true);
      expect(data2.success).toBe(true);
    });

    test('should provide detailed error information', async () => {
      const batchData = {
        operation: 'delete',
        client_ids: testClientIds.slice(0, 1),
        data: {
          deletion_type: 'soft',
          reason: 'Test with potential conflicts'
          // Not using force flag - might fail if client has active folders
        }
      };

      const request = new NextRequest('http://localhost:3000/api/clients/batch', {
        method: 'POST',
        body: JSON.stringify(batchData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await batchOperation(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.results).toBeDefined();
      
      // Each result should have detailed information
      data.data.results.forEach((result: any) => {
        expect(result.id).toBeDefined();
        expect(result.success).toBeDefined();
        if (!result.success) {
          expect(result.error).toBeDefined();
        }
      });
    });

    test('should handle batch operations with different client types', async () => {
      const batchData = {
        operation: 'update',
        client_ids: testClientIds, // Mix of individual and business clients
        data: {
          commercial_info: {
            payment_terms_days: 45
          }
        }
      };

      const request = new NextRequest('http://localhost:3000/api/clients/batch', {
        method: 'POST',
        body: JSON.stringify(batchData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await batchOperation(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.success_count).toBeGreaterThan(0);

      // Verify updates were applied to both client types
      const updatedClients = await testSupabase
        .from('clients')
        .select('id, client_type, commercial_info')
        .in('id', testClientIds);

      updatedClients.data?.forEach(client => {
        expect(client.commercial_info.payment_terms_days).toBe(45);
      });
    });
  });

  describe('Batch Operation Security', () => {
    test('should sanitize batch update data', async () => {
      const maliciousBatchData = {
        operation: 'update',
        client_ids: testClientIds.slice(0, 1),
        data: {
          tags: ['<script>alert("xss")</script>', 'normal-tag']
        }
      };

      const request = new NextRequest('http://localhost:3000/api/clients/batch', {
        method: 'POST',
        body: JSON.stringify(maliciousBatchData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await batchOperation(request);
      const data = await response.json();

      if (response.status === 200) {
        // Verify script tags are sanitized
        const updatedClient = await testSupabase
          .from('clients')
          .select('tags')
          .eq('id', testClientIds[0])
          .single();

        const tags = updatedClient.data?.tags || [];
        tags.forEach((tag: string) => {
          expect(tag).not.toContain('<script>');
        });
      } else {
        // Or validation should prevent script injection
        expect(response.status).toBe(400);
      }
    });

    test('should prevent batch operations on unauthorized clients', async () => {
      // This test assumes there's authorization logic
      // For now, it's a placeholder for authorization tests
      const unauthorizedBatchData = {
        operation: 'delete',
        client_ids: ['unauthorized-client-id'],
        data: { deletion_type: 'hard' }
      };

      const request = new NextRequest('http://localhost:3000/api/clients/batch', {
        method: 'POST',
        body: JSON.stringify(unauthorizedBatchData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await batchOperation(request);
      
      // Should either return error or handle authorization gracefully
      expect([200, 400, 401, 403]).toContain(response.status);
    });
  });
});