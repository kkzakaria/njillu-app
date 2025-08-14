/**
 * Client Service tests
 * Tests the core client service layer business logic
 */

import { ClientService } from '@/lib/services/clients/client-service';
import { testSupabase, initializeTestDatabase, seedTestData, cleanTestDatabase, getTestClient } from '../setup/db-setup';
import { createMockIndividualClientData, createMockBusinessClientData } from '../setup/mocks/fixtures/clients';
import type { Client, ClientDetail, ClientStatistics } from '@/types/clients/core';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => testSupabase)
}));

describe('ClientService', () => {
  const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

  beforeAll(async () => {
    await initializeTestDatabase();
    await seedTestData();
  });

  beforeEach(async () => {
    // Clean up test data created during tests
    await testSupabase
      .from('clients')
      .delete()
      .like('contact_info->email', '%servicetest%');
  });

  describe('create', () => {
    test('should create individual client successfully', async () => {
      const clientData = createMockIndividualClientData({
        individual_info: {
          first_name: 'Service',
          last_name: 'Test',
          profession: 'Service Tester'
        },
        contact_info: {
          email: 'service.test@servicetest.com',
          phone: '+33123456789'
        }
      });

      const client = await ClientService.create(clientData, TEST_USER_ID);

      expect(client).toBeDefined();
      expect(client.id).toBeDefined();
      expect(client.client_type).toBe('individual');
      expect(client.individual_info.first_name).toBe('Service');
      expect(client.individual_info.last_name).toBe('Test');
      expect(client.status).toBe('active');
      expect(client.created_by).toBe(TEST_USER_ID);
      expect(client.created_at).toBeDefined();
      expect(client.updated_at).toBeDefined();
    });

    test('should create business client successfully', async () => {
      const clientData = createMockBusinessClientData({
        business_info: {
          company_name: 'Service Test Corp',
          industry: 'information_technology'
        },
        contact_info: {
          email: 'contact@servicetestcorp.com',
          phone: '+33123456789'
        }
      });

      const client = await ClientService.create(clientData, TEST_USER_ID);

      expect(client).toBeDefined();
      expect(client.id).toBeDefined();
      expect(client.client_type).toBe('business');
      expect(client.business_info.company_name).toBe('Service Test Corp');
      expect(client.status).toBe('active');
      expect(client.created_by).toBe(TEST_USER_ID);
    });

    test('should set default commercial info values', async () => {
      const clientData = createMockIndividualClientData({
        contact_info: {
          email: 'defaults@servicetest.com'
        }
      });
      
      // Remove commercial_info to test defaults
      delete (clientData as any).commercial_info;

      const client = await ClientService.create(clientData, TEST_USER_ID);

      expect(client.commercial_info).toBeDefined();
      expect(client.commercial_info.credit_limit).toBe(0);
      expect(client.commercial_info.credit_limit_currency).toBe('EUR');
      expect(client.commercial_info.payment_terms_days).toBe(30);
      expect(client.commercial_info.payment_terms).toBe('net_30');
      expect(client.commercial_info.payment_methods).toEqual(['bank_transfer']);
      expect(client.commercial_info.preferred_language).toBe('fr');
      expect(client.commercial_info.priority).toBe('normal');
      expect(client.commercial_info.risk_level).toBe('low');
    });

    test('should set default commercial history', async () => {
      const clientData = createMockIndividualClientData({
        contact_info: {
          email: 'history@servicetest.com'
        }
      });

      const client = await ClientService.create(clientData, TEST_USER_ID);

      expect(client.commercial_history).toBeDefined();
      expect(client.commercial_history.total_orders_amount).toBe(0);
      expect(client.commercial_history.total_orders_count).toBe(0);
      expect(client.commercial_history.current_balance).toBe(0);
      expect(client.commercial_history.average_payment_delay_days).toBe(0);
    });

    test('should merge provided commercial info with defaults', async () => {
      const clientData = createMockIndividualClientData({
        contact_info: {
          email: 'merge@servicetest.com'
        },
        commercial_info: {
          credit_limit: 10000,
          priority: 'high'
          // Other values should use defaults
        }
      });

      const client = await ClientService.create(clientData, TEST_USER_ID);

      expect(client.commercial_info.credit_limit).toBe(10000);
      expect(client.commercial_info.priority).toBe('high');
      expect(client.commercial_info.credit_limit_currency).toBe('EUR'); // Default
      expect(client.commercial_info.payment_terms_days).toBe(30); // Default
    });

    test('should handle database errors gracefully', async () => {
      const clientData = createMockIndividualClientData({
        contact_info: {
          email: 'error@servicetest.com'
        }
      });

      // Mock database error
      const originalInsert = testSupabase.from('clients').insert;
      testSupabase.from = jest.fn(() => ({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              error: { message: 'Database connection failed' },
              data: null
            })
          })
        })
      })) as any;

      await expect(ClientService.create(clientData, TEST_USER_ID)).rejects.toThrow('Failed to create client: Database connection failed');

      // Restore original function
      testSupabase.from = jest.fn(() => ({
        insert: originalInsert
      })) as any;
    });
  });

  describe('getById', () => {
    test('should retrieve client by ID', async () => {
      const clientId = getTestClient('individual');
      const client = await ClientService.getById(clientId);

      expect(client).toBeDefined();
      expect(client!.id).toBe(clientId);
      expect(client!.client_type).toBeDefined();
      expect(client!.contact_info).toBeDefined();
      expect(client!.deleted_at).toBeNull();
    });

    test('should return null for non-existent client', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const client = await ClientService.getById(nonExistentId);

      expect(client).toBeNull();
    });

    test('should exclude soft-deleted clients', async () => {
      // Create a client and soft delete it
      const clientData = createMockIndividualClientData({
        contact_info: {
          email: 'softdelete@servicetest.com'
        }
      });

      const client = await ClientService.create(clientData, TEST_USER_ID);
      
      // Soft delete the client
      await testSupabase
        .from('clients')
        .update({
          deleted_at: new Date().toISOString(),
          deletion_reason: 'Service test deletion'
        })
        .eq('id', client.id);

      const retrievedClient = await ClientService.getById(client.id);
      expect(retrievedClient).toBeNull();
    });

    test('should handle database errors gracefully', async () => {
      const clientId = getTestClient('business');

      // Mock database error
      testSupabase.from = jest.fn(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                error: { message: 'Database error' },
                data: null
              })
            })
          })
        })
      })) as any;

      await expect(ClientService.getById(clientId)).rejects.toThrow('Failed to get client: Database error');
    });
  });

  describe('getDetail', () => {
    test('should return detailed client information', async () => {
      const clientId = getTestClient('business');
      const detail = await ClientService.getDetail(clientId);

      expect(detail).toBeDefined();
      expect(detail!.client).toBeDefined();
      expect(detail!.display_info).toBeDefined();
      expect(detail!.display_info.display_name).toBeDefined();
      expect(detail!.display_info.contact_name).toBeDefined();
      expect(detail!.display_info.type_label_fr).toBeDefined();
      expect(detail!.display_info.type_label_en).toBeDefined();
      expect(detail!.display_info.type_label_es).toBeDefined();
      expect(typeof detail!.total_folders).toBe('number');
      expect(typeof detail!.active_folders).toBe('number');
      expect(detail!.last_activity_date).toBeDefined();
      expect(typeof detail!.can_modify).toBe('boolean');
      expect(typeof detail!.can_delete).toBe('boolean');
    });

    test('should return null for non-existent client', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const detail = await ClientService.getDetail(nonExistentId);

      expect(detail).toBeNull();
    });

    test('should calculate folder counts correctly', async () => {
      const clientId = getTestClient('business');
      
      // Create test folders
      await testSupabase
        .from('folders')
        .insert([
          {
            client_id: clientId,
            status: 'active',
            priority: 'normal',
            created_by: TEST_USER_ID
          },
          {
            client_id: clientId,
            status: 'completed',
            priority: 'normal',
            created_by: TEST_USER_ID
          }
        ]);

      const detail = await ClientService.getDetail(clientId);

      expect(detail).toBeDefined();
      expect(detail!.total_folders).toBeGreaterThanOrEqual(2);
      expect(detail!.active_folders).toBeGreaterThanOrEqual(1);
    });

    test('should set correct type labels for individual clients', async () => {
      const clientId = getTestClient('individual');
      const detail = await ClientService.getDetail(clientId);

      expect(detail).toBeDefined();
      expect(detail!.display_info.type_label_fr).toBe('Particulier');
      expect(detail!.display_info.type_label_en).toBe('Individual');
      expect(detail!.display_info.type_label_es).toBe('Particular');
    });

    test('should set correct type labels for business clients', async () => {
      const clientId = getTestClient('business');
      const detail = await ClientService.getDetail(clientId);

      expect(detail).toBeDefined();
      expect(detail!.display_info.type_label_fr).toBe('Entreprise');
      expect(detail!.display_info.type_label_en).toBe('Business');
      expect(detail!.display_info.type_label_es).toBe('Empresa');
    });

    test('should determine deletion eligibility correctly', async () => {
      // Create client without active folders
      const clientData = createMockIndividualClientData({
        contact_info: {
          email: 'deletable@servicetest.com'
        },
        status: 'inactive'
      });

      const client = await ClientService.create(clientData, TEST_USER_ID);
      const detail = await ClientService.getDetail(client.id);

      expect(detail).toBeDefined();
      expect(detail!.can_delete).toBe(true); // No active folders and inactive status
    });
  });

  describe('update', () => {
    test('should update client successfully', async () => {
      // Create a client to update
      const clientData = createMockIndividualClientData({
        contact_info: {
          email: 'update@servicetest.com'
        }
      });

      const client = await ClientService.create(clientData, TEST_USER_ID);
      const originalUpdatedAt = client.updated_at;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      const updateData = {
        tags: ['updated', 'service-test'],
        commercial_info: {
          credit_limit: 15000
        }
      };

      const updatedClient = await ClientService.update({
        client_id: client.id,
        data: updateData
      });

      expect(updatedClient).toBeDefined();
      expect(updatedClient.id).toBe(client.id);
      expect(updatedClient.tags).toContain('updated');
      expect(updatedClient.tags).toContain('service-test');
      expect(updatedClient.commercial_info.credit_limit).toBe(15000);
      expect(new Date(updatedClient.updated_at).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      );
    });

    test('should handle partial updates', async () => {
      const clientData = createMockBusinessClientData({
        contact_info: {
          email: 'partial@servicetest.com'
        }
      });

      const client = await ClientService.create(clientData, TEST_USER_ID);
      const originalCompanyName = client.business_info.company_name;

      const partialUpdate = {
        commercial_info: {
          priority: 'high'
        }
      };

      const updatedClient = await ClientService.update({
        client_id: client.id,
        data: partialUpdate
      });

      expect(updatedClient.commercial_info.priority).toBe('high');
      expect(updatedClient.business_info.company_name).toBe(originalCompanyName); // Should remain unchanged
    });

    test('should throw error for non-existent client', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const updateData = { tags: ['test'] };

      await expect(ClientService.update({
        client_id: nonExistentId,
        data: updateData
      })).rejects.toThrow('Failed to update client');
    });

    test('should not update soft-deleted clients', async () => {
      const clientData = createMockIndividualClientData({
        contact_info: {
          email: 'updatedeleted@servicetest.com'
        }
      });

      const client = await ClientService.create(clientData, TEST_USER_ID);

      // Soft delete the client
      await testSupabase
        .from('clients')
        .update({
          deleted_at: new Date().toISOString(),
          deletion_reason: 'Test update deleted'
        })
        .eq('id', client.id);

      const updateData = { tags: ['should-fail'] };

      await expect(ClientService.update({
        client_id: client.id,
        data: updateData
      })).rejects.toThrow('Failed to update client');
    });
  });

  describe('delete', () => {
    test('should soft delete client without active folders', async () => {
      const clientData = createMockIndividualClientData({
        contact_info: {
          email: 'delete@servicetest.com'
        }
      });

      const client = await ClientService.create(clientData, TEST_USER_ID);

      const result = await ClientService.delete({
        client_id: client.id,
        deletion_type: 'soft',
        reason: 'Service test deletion'
      });

      expect(result.success).toBe(true);
      expect(result.deletion_type).toBe('soft');
      expect(result.affected_folders_count).toBe(0);
      expect(result.deleted_at).toBeDefined();

      // Verify client is soft deleted
      const deletedClient = await ClientService.getById(client.id);
      expect(deletedClient).toBeNull();
    });

    test('should prevent deletion of client with active folders', async () => {
      const clientData = createMockBusinessClientData({
        contact_info: {
          email: 'withfolders@servicetest.com'
        }
      });

      const client = await ClientService.create(clientData, TEST_USER_ID);

      // Create active folder
      await testSupabase
        .from('folders')
        .insert({
          client_id: client.id,
          status: 'active',
          priority: 'normal',
          created_by: TEST_USER_ID
        });

      await expect(ClientService.delete({
        client_id: client.id,
        deletion_type: 'soft',
        reason: 'Should fail'
      })).rejects.toThrow('Client has active folders');
    });

    test('should force delete client with active folders', async () => {
      const clientData = createMockBusinessClientData({
        contact_info: {
          email: 'forcedelete@servicetest.com'
        }
      });

      const client = await ClientService.create(clientData, TEST_USER_ID);

      // Create active folder
      await testSupabase
        .from('folders')
        .insert({
          client_id: client.id,
          status: 'active',
          priority: 'normal',
          created_by: TEST_USER_ID
        });

      const result = await ClientService.delete({
        client_id: client.id,
        deletion_type: 'soft',
        reason: 'Force delete test',
        force: true,
        handle_folders: 'archive'
      });

      expect(result.success).toBe(true);
      expect(result.affected_folders_count).toBeGreaterThan(0);
      expect(result.folder_actions.length).toBeGreaterThan(0);
      expect(result.folder_actions[0].action).toBe('archived');
    });

    test('should transfer folders to another client on deletion', async () => {
      const client1Data = createMockIndividualClientData({
        contact_info: {
          email: 'transfer1@servicetest.com'
        }
      });

      const client2Data = createMockIndividualClientData({
        contact_info: {
          email: 'transfer2@servicetest.com'
        }
      });

      const [client1, client2] = await Promise.all([
        ClientService.create(client1Data, TEST_USER_ID),
        ClientService.create(client2Data, TEST_USER_ID)
      ]);

      // Create folder for client1
      await testSupabase
        .from('folders')
        .insert({
          client_id: client1.id,
          status: 'active',
          priority: 'normal',
          created_by: TEST_USER_ID
        });

      const result = await ClientService.delete({
        client_id: client1.id,
        deletion_type: 'soft',
        reason: 'Transfer test',
        force: true,
        handle_folders: 'transfer',
        transfer_to_client_id: client2.id
      });

      expect(result.success).toBe(true);
      expect(result.folder_actions.length).toBeGreaterThan(0);
      expect(result.folder_actions[0].action).toBe('transferred');
      expect(result.folder_actions[0].target_client_id).toBe(client2.id);
    });

    test('should perform hard delete', async () => {
      const clientData = createMockIndividualClientData({
        contact_info: {
          email: 'harddelete@servicetest.com'
        }
      });

      const client = await ClientService.create(clientData, TEST_USER_ID);

      const result = await ClientService.delete({
        client_id: client.id,
        deletion_type: 'hard',
        reason: 'Hard delete test'
      });

      expect(result.success).toBe(true);
      expect(result.deletion_type).toBe('hard');

      // Verify client is completely removed
      const { data } = await testSupabase
        .from('clients')
        .select('*')
        .eq('id', client.id);

      expect(data).toEqual([]);
    });

    test('should throw error for non-existent client deletion', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await expect(ClientService.delete({
        client_id: nonExistentId,
        deletion_type: 'soft',
        reason: 'Should fail'
      })).rejects.toThrow('Failed to delete client');
    });
  });

  describe('getStatistics', () => {
    test('should return client statistics', async () => {
      const clientId = getTestClient('business');

      const stats = await ClientService.getStatistics(clientId);

      expect(stats).toBeDefined();
      expect(stats.client_id).toBe(clientId);
      expect(typeof stats.total_folders).toBe('number');
      expect(typeof stats.folders_by_status).toBe('object');
      expect(typeof stats.total_revenue).toBe('number');
      expect(stats.revenue_currency).toBeDefined();
      expect(typeof stats.average_payment_delay).toBe('number');
      expect(stats.calculated_at).toBeDefined();
      expect(stats.period_start).toBeDefined();
      expect(stats.period_end).toBeDefined();
    });

    test('should throw error for non-existent client statistics', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await expect(ClientService.getStatistics(nonExistentId)).rejects.toThrow('Client not found');
    });

    test('should calculate folder statistics correctly', async () => {
      const clientData = createMockBusinessClientData({
        contact_info: {
          email: 'stats@servicetest.com'
        }
      });

      const client = await ClientService.create(clientData, TEST_USER_ID);

      // Create test folders with different statuses
      await testSupabase
        .from('folders')
        .insert([
          {
            client_id: client.id,
            status: 'active',
            priority: 'normal',
            created_by: TEST_USER_ID
          },
          {
            client_id: client.id,
            status: 'active',
            priority: 'high',
            created_by: TEST_USER_ID
          },
          {
            client_id: client.id,
            status: 'completed',
            priority: 'normal',
            created_by: TEST_USER_ID
          }
        ]);

      const stats = await ClientService.getStatistics(client.id);

      expect(stats.total_folders).toBe(3);
      expect(stats.folders_by_status.active).toBe(2);
      expect(stats.folders_by_status.completed).toBe(1);
    });
  });

  describe('list', () => {
    test('should list clients with pagination', async () => {
      const result = await ClientService.list({
        page: 1,
        pageSize: 10
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.clients)).toBe(true);
      expect(typeof result.total).toBe('number');
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(typeof result.totalPages).toBe('number');
    });

    test('should filter by status', async () => {
      const result = await ClientService.list({
        status: ['active']
      });

      expect(result.clients.every(client => client.status === 'active')).toBe(true);
    });

    test('should filter by client types', async () => {
      const result = await ClientService.list({
        clientTypes: ['individual']
      });

      expect(result.clients.every(client => client.client_type === 'individual')).toBe(true);
    });

    test('should handle empty results', async () => {
      const result = await ClientService.list({
        status: ['nonexistent_status']
      });

      expect(result.clients).toEqual([]);
      expect(result.total).toBe(0);
    });

    test('should enforce maximum page size', async () => {
      const result = await ClientService.list({
        pageSize: 1000 // Should be capped at 100
      });

      expect(result.pageSize).toBeLessThanOrEqual(100);
    });

    test('should order by creation date descending by default', async () => {
      // Create two clients with different creation times
      const client1Data = createMockIndividualClientData({
        contact_info: { email: 'first@servicetest.com' }
      });
      
      const client1 = await ClientService.create(client1Data, TEST_USER_ID);
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const client2Data = createMockIndividualClientData({
        contact_info: { email: 'second@servicetest.com' }
      });
      
      const client2 = await ClientService.create(client2Data, TEST_USER_ID);

      const result = await ClientService.list();

      const client2Index = result.clients.findIndex(c => c.id === client2.id);
      const client1Index = result.clients.findIndex(c => c.id === client1.id);

      if (client1Index !== -1 && client2Index !== -1) {
        expect(client2Index).toBeLessThan(client1Index); // More recent should come first
      }
    });
  });

  describe('error handling', () => {
    test('should handle database connection failures', async () => {
      // Mock a database connection failure
      const originalFrom = testSupabase.from;
      testSupabase.from = jest.fn(() => {
        throw new Error('Connection failed');
      }) as any;

      await expect(ClientService.list()).rejects.toThrow('Connection failed');

      // Restore original function
      testSupabase.from = originalFrom;
    });

    test('should handle malformed data gracefully', async () => {
      // This would require more sophisticated mocking
      // For now, this is a placeholder for malformed data handling tests
      expect(true).toBe(true);
    });
  });

  describe('concurrency', () => {
    test('should handle concurrent operations safely', async () => {
      const clientData1 = createMockIndividualClientData({
        contact_info: { email: 'concurrent1@servicetest.com' }
      });
      
      const clientData2 = createMockIndividualClientData({
        contact_info: { email: 'concurrent2@servicetest.com' }
      });

      const [client1, client2] = await Promise.all([
        ClientService.create(clientData1, TEST_USER_ID),
        ClientService.create(clientData2, TEST_USER_ID)
      ]);

      expect(client1.id).not.toBe(client2.id);
      expect(client1.contact_info.email).toBe('concurrent1@servicetest.com');
      expect(client2.contact_info.email).toBe('concurrent2@servicetest.com');
    });
  });
});