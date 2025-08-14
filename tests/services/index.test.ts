/**
 * Services Integration Tests
 * Tests integration between different service layers
 */

import { ClientService } from '@/lib/services/clients/client-service';
import { SearchService } from '@/lib/services/clients/search-service';
import { ValidationService } from '@/lib/services/clients/validation-service';
import { BatchService } from '@/lib/services/clients/batch-service';
import { testSupabase, initializeTestDatabase, seedTestData, cleanTestDatabase } from '../setup/db-setup';
import { createMockIndividualClientData, createMockBusinessClientData } from '../setup/mocks/fixtures/clients';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => testSupabase)
}));

describe('Services Integration', () => {
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
      .like('contact_info->email', '%integration%');
  });

  describe('Service Layer Integration', () => {
    test('should integrate validation with creation workflow', async () => {
      const clientData = createMockIndividualClientData({
        individual_info: {
          first_name: 'Integration',
          last_name: 'Test',
          profession: 'Tester'
        },
        contact_info: {
          email: 'integration@integrationtest.com',
          phone: '+33123456789'
        }
      });

      // Validate before creating
      const validationResult = await ValidationService.validateClientData(clientData);
      expect(validationResult.isValid).toBe(true);

      // Check uniqueness constraints
      const uniqueResult = await ValidationService.checkUniqueConstraints(clientData);
      expect(uniqueResult.isValid).toBe(true);

      // Create client
      const client = await ClientService.create(clientData, TEST_USER_ID);
      expect(client).toBeDefined();
      expect(client.id).toBeDefined();

      // Verify creation through search
      const searchResult = await SearchService.searchClients({
        query: 'integration@integrationtest.com'
      });

      expect(searchResult.clients.length).toBe(1);
      expect(searchResult.clients[0].id).toBe(client.id);
    });

    test('should integrate search with batch operations', async () => {
      // Create multiple clients for search and batch operations
      const clientsData = [
        createMockIndividualClientData({
          individual_info: { first_name: 'SearchBatch', last_name: 'User1' },
          contact_info: { email: 'searchbatch1@integrationtest.com' },
          tags: ['search-test']
        }),
        createMockBusinessClientData({
          business_info: { company_name: 'SearchBatch Corp' },
          contact_info: { email: 'searchbatch2@integrationtest.com' },
          tags: ['search-test']
        }),
        createMockIndividualClientData({
          individual_info: { first_name: 'SearchBatch', last_name: 'User2' },
          contact_info: { email: 'searchbatch3@integrationtest.com' },
          tags: ['search-test']
        })
      ];

      // Batch create clients
      const batchResult = await BatchService.batchCreate(clientsData, TEST_USER_ID);
      expect(batchResult.success).toBe(true);
      expect(batchResult.successful_count).toBe(3);

      // Search for created clients
      const searchResult = await SearchService.searchWithFilters({
        filters: { tags: ['search-test'] }
      });

      expect(searchResult.clients.length).toBe(3);
      const clientIds = searchResult.clients.map(c => c.id);

      // Batch update found clients
      const batchUpdateResult = await BatchService.batchUpdate(clientIds, {
        tags: ['search-test', 'batch-updated'],
        commercial_info: { priority: 'high' }
      });

      expect(batchUpdateResult.success).toBe(true);

      // Verify updates through search
      const updatedSearchResult = await SearchService.searchWithFilters({
        filters: { 
          tags: ['batch-updated'],
          priorities: ['high']
        }
      });

      expect(updatedSearchResult.clients.length).toBe(3);
      expect(updatedSearchResult.clients.every(c => 
        c.tags?.includes('batch-updated') && 
        c.commercial_info.priority === 'high'
      )).toBe(true);
    });

    test('should integrate validation with update workflow', async () => {
      // Create initial client
      const clientData = createMockBusinessClientData({
        contact_info: { email: 'updatevalidation@integrationtest.com' },
        commercial_info: { credit_limit: 10000 }
      });

      const client = await ClientService.create(clientData, TEST_USER_ID);

      // Attempt invalid update
      const invalidUpdate = {
        commercial_info: { credit_limit: -5000 }
      };

      const validationResult = await ValidationService.validateUpdateConstraints(
        client.status,
        invalidUpdate,
        client
      );

      expect(validationResult.isValid).toBe(false);

      // Attempt valid update
      const validUpdate = {
        commercial_info: { credit_limit: 25000 },
        tags: ['updated-client']
      };

      const validUpdateResult = await ValidationService.validateUpdateConstraints(
        client.status,
        validUpdate,
        client
      );

      expect(validUpdateResult.isValid).toBe(true);

      // Perform update
      const updatedClient = await ClientService.update({
        client_id: client.id,
        data: validUpdate
      });

      expect(updatedClient.commercial_info.credit_limit).toBe(25000);
      expect(updatedClient.tags).toContain('updated-client');
    });

    test('should handle complex workflow with all services', async () => {
      // 1. Create multiple clients with different characteristics
      const complexClientsData = [
        createMockIndividualClientData({
          individual_info: { first_name: 'Complex', last_name: 'Individual' },
          contact_info: { email: 'complex.individual@integrationtest.com' },
          commercial_info: { priority: 'high', risk_level: 'low' },
          tags: ['complex', 'individual']
        }),
        createMockBusinessClientData({
          business_info: { company_name: 'Complex Business Corp' },
          contact_info: { email: 'complex.business@integrationtest.com' },
          commercial_info: { priority: 'normal', risk_level: 'medium' },
          tags: ['complex', 'business']
        })
      ];

      // 2. Validate all data before creation
      const validationResults = await Promise.all(
        complexClientsData.map(data => ValidationService.validateClientData(data))
      );

      expect(validationResults.every(result => result.isValid)).toBe(true);

      // 3. Batch create with progress tracking
      let progressUpdates = 0;
      const progressCallback = () => { progressUpdates++; };

      const batchResult = await BatchService.batchCreate(
        complexClientsData, 
        TEST_USER_ID,
        { progressCallback }
      );

      expect(batchResult.success).toBe(true);
      expect(progressUpdates).toBeGreaterThan(0);

      // 4. Search and filter created clients
      const highPrioritySearch = await SearchService.searchWithFilters({
        filters: {
          priorities: ['high'],
          tags: ['complex']
        }
      });

      expect(highPrioritySearch.clients.length).toBe(1);
      expect(highPrioritySearch.clients[0].individual_info?.first_name).toBe('Complex');

      // 5. Get detailed information for business client
      const businessClient = batchResult.successful_operations.find(op => 
        op.input_data.client_type === 'business'
      );

      const businessDetails = await ClientService.getDetail(businessClient!.client_id);
      expect(businessDetails).toBeDefined();
      expect(businessDetails!.display_info.display_name).toBe('Complex Business Corp');

      // 6. Get statistics for business client
      const stats = await ClientService.getStatistics(businessClient!.client_id);
      expect(stats.client_id).toBe(businessClient!.client_id);

      // 7. Batch update with tag management
      const allClientIds = batchResult.successful_operations.map(op => op.client_id);
      
      const tagResult = await BatchService.batchTagManagement({
        client_ids: allClientIds,
        operation: 'add',
        tags: ['integration-complete']
      });

      expect(tagResult.success).toBe(true);

      // 8. Final verification through search
      const finalSearch = await SearchService.searchWithFilters({
        filters: { tags: ['integration-complete'] }
      });

      expect(finalSearch.clients.length).toBe(2);
      expect(finalSearch.clients.every(c => 
        c.tags?.includes('integration-complete')
      )).toBe(true);
    });

    test('should handle error propagation across services', async () => {
      // Create a scenario where errors cascade through services
      const invalidClientData = createMockIndividualClientData({
        individual_info: { first_name: '', last_name: 'ErrorTest' }, // Invalid
        contact_info: { email: 'error@integrationtest.com' }
      });

      // Validation should catch the error
      const validationResult = await ValidationService.validateClientData(invalidClientData);
      expect(validationResult.isValid).toBe(false);

      // Batch operation should fail gracefully
      const batchResult = await BatchService.batchCreate([invalidClientData], TEST_USER_ID);
      expect(batchResult.success).toBe(false);
      expect(batchResult.failed_count).toBe(1);

      // Search should handle empty results gracefully
      const searchResult = await SearchService.searchClients({
        query: 'error@integrationtest.com'
      });

      expect(searchResult.clients).toEqual([]);
      expect(searchResult.total).toBe(0);
    });

    test('should maintain data consistency across service operations', async () => {
      // Create a client
      const clientData = createMockBusinessClientData({
        business_info: { company_name: 'Consistency Corp' },
        contact_info: { email: 'consistency@integrationtest.com' },
        commercial_info: { credit_limit: 50000 }
      });

      const client = await ClientService.create(clientData, TEST_USER_ID);

      // Update through different paths and verify consistency
      
      // 1. Direct service update
      const serviceUpdate = await ClientService.update({
        client_id: client.id,
        data: { tags: ['service-updated'] }
      });

      // 2. Batch update
      const batchUpdate = await BatchService.batchUpdate([client.id], {
        commercial_info: { priority: 'high' }
      });

      expect(batchUpdate.success).toBe(true);

      // 3. Tag management
      const tagUpdate = await BatchService.batchTagManagement({
        client_ids: [client.id],
        operation: 'add',
        tags: ['batch-tagged']
      });

      expect(tagUpdate.success).toBe(true);

      // Verify final state consistency
      const finalClient = await ClientService.getById(client.id);
      expect(finalClient).toBeDefined();
      expect(finalClient!.tags).toContain('service-updated');
      expect(finalClient!.tags).toContain('batch-tagged');
      expect(finalClient!.commercial_info.priority).toBe('high');
      expect(finalClient!.commercial_info.credit_limit).toBe(50000); // Original value preserved

      // Verify through search
      const searchVerification = await SearchService.searchClients({
        query: 'consistency@integrationtest.com'
      });

      expect(searchVerification.clients.length).toBe(1);
      const searchedClient = searchVerification.clients[0];
      
      expect(searchedClient.tags).toContain('service-updated');
      expect(searchedClient.tags).toContain('batch-tagged');
      expect(searchedClient.commercial_info.priority).toBe('high');
    });

    test('should handle concurrent operations safely', async () => {
      // Create initial client
      const clientData = createMockIndividualClientData({
        contact_info: { email: 'concurrent@integrationtest.com' }
      });

      const client = await ClientService.create(clientData, TEST_USER_ID);

      // Perform concurrent operations
      const concurrentOperations = await Promise.allSettled([
        ClientService.update({
          client_id: client.id,
          data: { tags: ['concurrent-1'] }
        }),
        BatchService.batchUpdate([client.id], {
          commercial_info: { priority: 'high' }
        }),
        BatchService.batchTagManagement({
          client_ids: [client.id],
          operation: 'add',
          tags: ['concurrent-2']
        }),
        SearchService.searchClients({
          query: 'concurrent@integrationtest.com'
        })
      ]);

      // At least some operations should succeed
      const successfulOps = concurrentOperations.filter(op => op.status === 'fulfilled');
      expect(successfulOps.length).toBeGreaterThan(0);

      // Final state should be consistent (no corruption)
      const finalClient = await ClientService.getById(client.id);
      expect(finalClient).toBeDefined();
      expect(finalClient!.id).toBe(client.id);
      expect(finalClient!.contact_info.email).toBe('concurrent@integrationtest.com');
    });
  });

  afterAll(async () => {
    await cleanTestDatabase();
  });
});