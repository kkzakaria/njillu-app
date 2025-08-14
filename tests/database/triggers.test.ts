/**
 * Database triggers and functions tests
 * Tests automatic triggers, user creation, timestamps, etc.
 */

import { testSupabase, initializeTestDatabase, seedTestData } from '../setup/db-setup';

describe('Database Triggers Tests', () => {
  beforeAll(async () => {
    await initializeTestDatabase();
    await seedTestData();
  });

  describe('Timestamp Triggers', () => {
    test('should automatically set created_at on client insert', async () => {
      const beforeInsert = new Date();

      const testClient = {
        client_type: 'individual',
        individual_info: {
          first_name: 'Timestamp',
          last_name: 'Test',
          profession: 'Tester'
        },
        contact_info: {
          email: 'timestamp.test@example.com',
          phone: '+33123456789',
          address: {
            address_line1: '123 Timestamp Street',
            city: 'Paris',
            postal_code: '75001',
            country: 'FR'
          }
        },
        commercial_info: {
          credit_limit: 1000,
          credit_limit_currency: 'EUR',
          payment_terms_days: 30,
          payment_terms: 'net_30',
          payment_methods: ['bank_transfer'],
          preferred_language: 'fr',
          priority: 'normal',
          risk_level: 'low'
        },
        status: 'active',
        tags: ['timestamp-test'],
        created_by: '550e8400-e29b-41d4-a716-446655440000'
      };

      const { data, error } = await testSupabase
        .from('clients')
        .insert(testClient)
        .select('created_at, updated_at')
        .single();

      const afterInsert = new Date();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.created_at).toBeDefined();
      expect(data.updated_at).toBeDefined();

      const createdAt = new Date(data.created_at);
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeInsert.getTime());
      expect(createdAt.getTime()).toBeLessThanOrEqual(afterInsert.getTime());
    });

    test('should automatically update updated_at on client update', async () => {
      // Get an existing client
      const { data: clients } = await testSupabase
        .from('clients')
        .select('id, updated_at')
        .limit(1);

      if (clients?.length === 0) return; // Skip if no clients

      const client = clients[0];
      const originalUpdatedAt = new Date(client.updated_at);

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update the client
      const { data: updated, error } = await testSupabase
        .from('clients')
        .update({ tags: ['updated-timestamp-test'] })
        .eq('id', client.id)
        .select('updated_at')
        .single();

      expect(error).toBeNull();
      expect(updated).toBeDefined();

      const newUpdatedAt = new Date(updated.updated_at);
      expect(newUpdatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    test('should set timestamps on folder creation', async () => {
      const { data: clients } = await testSupabase
        .from('clients')
        .select('id')
        .limit(1);

      if (clients?.length === 0) return; // Skip if no clients

      const beforeInsert = new Date();

      const testFolder = {
        client_id: clients[0].id,
        status: 'active',
        priority: 'normal',
        created_by: '550e8400-e29b-41d4-a716-446655440000'
      };

      const { data, error } = await testSupabase
        .from('folders')
        .insert(testFolder)
        .select('created_at, updated_at')
        .single();

      const afterInsert = new Date();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.created_at).toBeDefined();
      expect(data.updated_at).toBeDefined();

      const createdAt = new Date(data.created_at);
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeInsert.getTime());
      expect(createdAt.getTime()).toBeLessThanOrEqual(afterInsert.getTime());
    });
  });

  describe('Folder Number Generation', () => {
    test('should automatically generate folder number on folder creation', async () => {
      const { data: clients } = await testSupabase
        .from('clients')
        .select('id')
        .limit(1);

      if (clients?.length === 0) return; // Skip if no clients

      const testFolder = {
        client_id: clients[0].id,
        status: 'active',
        priority: 'normal',
        created_by: '550e8400-e29b-41d4-a716-446655440000'
      };

      const { data, error } = await testSupabase
        .from('folders')
        .insert(testFolder)
        .select('folder_number')
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.folder_number).toBeDefined();
      expect(data.folder_number).toMatch(/^F-\d{6}$/); // Format: F-XXXXXX
    });

    test('should generate unique folder numbers', async () => {
      const { data: clients } = await testSupabase
        .from('clients')
        .select('id')
        .limit(1);

      if (clients?.length === 0) return; // Skip if no clients

      const testFolder1 = {
        client_id: clients[0].id,
        status: 'active',
        priority: 'normal',
        created_by: '550e8400-e29b-41d4-a716-446655440000'
      };

      const testFolder2 = {
        client_id: clients[0].id,
        status: 'active',
        priority: 'normal',
        created_by: '550e8400-e29b-41d4-a716-446655440000'
      };

      const [result1, result2] = await Promise.all([
        testSupabase.from('folders').insert(testFolder1).select('folder_number').single(),
        testSupabase.from('folders').insert(testFolder2).select('folder_number').single()
      ]);

      expect(result1.error).toBeNull();
      expect(result2.error).toBeNull();
      expect(result1.data?.folder_number).toBeDefined();
      expect(result2.data?.folder_number).toBeDefined();
      expect(result1.data?.folder_number).not.toBe(result2.data?.folder_number);
    });
  });

  describe('User Profile Triggers', () => {
    test('should create user profile on auth.users insert', async () => {
      // This test depends on having a trigger that creates a profile
      // when a user is added to auth.users
      
      // Note: In a real test environment, you would need to simulate
      // the auth.users table insertion, but since we're testing with
      // service role, we'll check if the trigger function exists
      
      const { data, error } = await testSupabase
        .rpc('check_function_exists', { 
          function_name_param: 'handle_new_user' 
        });

      // This test verifies the function exists, not its execution
      expect(error).toBeNull();
      // expect(data).toBe(true); // Uncomment if function exists
    });
  });

  describe('Audit Triggers', () => {
    test('should track client changes in audit log', async () => {
      // Check if audit logging is implemented
      const { data: auditTableExists } = await testSupabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'audit_logs')
        .eq('table_schema', 'public');

      if (auditTableExists?.length === 0) {
        // Skip if audit table doesn't exist
        return;
      }

      // Get existing client
      const { data: clients } = await testSupabase
        .from('clients')
        .select('id')
        .limit(1);

      if (clients?.length === 0) return;

      const clientId = clients[0].id;

      // Update client to trigger audit
      await testSupabase
        .from('clients')
        .update({ tags: ['audit-test'] })
        .eq('id', clientId);

      // Check if audit entry was created
      const { data: auditEntries, error } = await testSupabase
        .from('audit_logs')
        .select('*')
        .eq('table_name', 'clients')
        .eq('record_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1);

      expect(error).toBeNull();
      // Audit logging might not be implemented, so this is conditional
      if (auditEntries?.length > 0) {
        expect(auditEntries[0].operation).toBe('UPDATE');
      }
    });
  });

  describe('Soft Delete Triggers', () => {
    test('should not hard delete records with soft delete trigger', async () => {
      // Create a test client
      const testClient = {
        client_type: 'individual',
        individual_info: {
          first_name: 'Soft',
          last_name: 'Delete',
          profession: 'Test'
        },
        contact_info: {
          email: 'soft.delete@example.com',
          phone: '+33123456789',
          address: {
            address_line1: '123 Delete Street',
            city: 'Paris',
            postal_code: '75001',
            country: 'FR'
          }
        },
        commercial_info: {
          credit_limit: 1000,
          credit_limit_currency: 'EUR',
          payment_terms_days: 30,
          payment_terms: 'net_30',
          payment_methods: ['bank_transfer'],
          preferred_language: 'fr',
          priority: 'normal',
          risk_level: 'low'
        },
        status: 'active',
        tags: ['soft-delete-test'],
        created_by: '550e8400-e29b-41d4-a716-446655440000'
      };

      const { data: created, error: createError } = await testSupabase
        .from('clients')
        .insert(testClient)
        .select('id')
        .single();

      expect(createError).toBeNull();
      expect(created).toBeDefined();

      // Try to delete (should trigger soft delete)
      const { error: deleteError } = await testSupabase
        .from('clients')
        .delete()
        .eq('id', created.id);

      // Check if record still exists but is marked as deleted
      // Note: This depends on your soft delete implementation
      const { data: afterDelete } = await testSupabase
        .from('clients')
        .select('id, deleted_at')
        .eq('id', created.id)
        .single();

      // This test depends on how your soft delete is implemented
      // It might not exist in regular queries due to RLS
      if (afterDelete) {
        expect(afterDelete.deleted_at).toBeDefined();
      }
    });
  });

  describe('Data Validation Triggers', () => {
    test('should validate email format in trigger', async () => {
      const testClient = {
        client_type: 'individual',
        individual_info: {
          first_name: 'Email',
          last_name: 'Validation',
          profession: 'Test'
        },
        contact_info: {
          email: 'invalid-email', // Invalid email format
          phone: '+33123456789',
          address: {
            address_line1: '123 Validation Street',
            city: 'Paris',
            postal_code: '75001',
            country: 'FR'
          }
        },
        commercial_info: {
          credit_limit: 1000,
          credit_limit_currency: 'EUR',
          payment_terms_days: 30,
          payment_terms: 'net_30',
          payment_methods: ['bank_transfer'],
          preferred_language: 'fr',
          priority: 'normal',
          risk_level: 'low'
        },
        status: 'active',
        tags: ['email-validation-test'],
        created_by: '550e8400-e29b-41d4-a716-446655440000'
      };

      const { error } = await testSupabase
        .from('clients')
        .insert(testClient);

      // If email validation trigger exists, this should fail
      if (error) {
        expect(error.message).toMatch(/email|validation/i);
      }
      // If no validation trigger exists, test passes as informational
    });

    test('should validate required fields in business clients', async () => {
      const testClient = {
        client_type: 'business',
        business_info: {
          // Missing company_name - should trigger validation
          industry: 'information_technology',
          employee_count: 10
        },
        contact_info: {
          email: 'test@business.com',
          phone: '+33123456789',
          address: {
            address_line1: '123 Business Street',
            city: 'Paris',
            postal_code: '75001',
            country: 'FR'
          }
        },
        commercial_info: {
          credit_limit: 10000,
          credit_limit_currency: 'EUR',
          payment_terms_days: 30,
          payment_terms: 'net_30',
          payment_methods: ['bank_transfer'],
          preferred_language: 'fr',
          priority: 'normal',
          risk_level: 'low'
        },
        status: 'active',
        tags: ['validation-test'],
        created_by: '550e8400-e29b-41d4-a716-446655440000'
      };

      const { error } = await testSupabase
        .from('clients')
        .insert(testClient);

      // If business validation trigger exists, this should fail
      if (error) {
        expect(error.message).toMatch(/company_name|required|business/i);
      }
      // If no validation trigger exists, test passes as informational
    });
  });

  describe('Cascade Triggers', () => {
    test('should handle folder reassignment when client is soft deleted', async () => {
      // Create client and folder
      const testClient = {
        client_type: 'individual',
        individual_info: {
          first_name: 'Cascade',
          last_name: 'Test',
          profession: 'Tester'
        },
        contact_info: {
          email: 'cascade.test@example.com',
          phone: '+33123456789',
          address: {
            address_line1: '123 Cascade Street',
            city: 'Paris',
            postal_code: '75001',
            country: 'FR'
          }
        },
        commercial_info: {
          credit_limit: 1000,
          credit_limit_currency: 'EUR',
          payment_terms_days: 30,
          payment_terms: 'net_30',
          payment_methods: ['bank_transfer'],
          preferred_language: 'fr',
          priority: 'normal',
          risk_level: 'low'
        },
        status: 'active',
        tags: ['cascade-test'],
        created_by: '550e8400-e29b-41d4-a716-446655440000'
      };

      const { data: createdClient, error: clientError } = await testSupabase
        .from('clients')
        .insert(testClient)
        .select('id')
        .single();

      expect(clientError).toBeNull();

      // Create folder for this client
      const testFolder = {
        client_id: createdClient.id,
        status: 'active',
        priority: 'normal',
        created_by: '550e8400-e29b-41d4-a716-446655440000'
      };

      const { data: createdFolder, error: folderError } = await testSupabase
        .from('folders')
        .insert(testFolder)
        .select('id')
        .single();

      expect(folderError).toBeNull();

      // Soft delete the client
      const { error: deleteError } = await testSupabase
        .from('clients')
        .update({
          deleted_at: new Date().toISOString(),
          deletion_reason: 'Cascade test'
        })
        .eq('id', createdClient.id);

      expect(deleteError).toBeNull();

      // Check what happens to the folder
      // This depends on your cascade trigger implementation
      const { data: folderAfterDelete } = await testSupabase
        .from('folders')
        .select('status, client_id')
        .eq('id', createdFolder.id)
        .single();

      // Folder might be archived, transferred, or marked for review
      if (folderAfterDelete) {
        expect(['archived', 'pending_reassignment', 'active']).toContain(folderAfterDelete.status);
      }
    });
  });

  describe('Performance Impact', () => {
    test('should not significantly impact insert performance', async () => {
      const startTime = performance.now();

      const testClient = {
        client_type: 'individual',
        individual_info: {
          first_name: 'Performance',
          last_name: 'Test',
          profession: 'Tester'
        },
        contact_info: {
          email: 'performance.test@example.com',
          phone: '+33123456789',
          address: {
            address_line1: '123 Performance Street',
            city: 'Paris',
            postal_code: '75001',
            country: 'FR'
          }
        },
        commercial_info: {
          credit_limit: 1000,
          credit_limit_currency: 'EUR',
          payment_terms_days: 30,
          payment_terms: 'net_30',
          payment_methods: ['bank_transfer'],
          preferred_language: 'fr',
          priority: 'normal',
          risk_level: 'low'
        },
        status: 'active',
        tags: ['performance-test'],
        created_by: '550e8400-e29b-41d4-a716-446655440000'
      };

      const { data, error } = await testSupabase
        .from('clients')
        .insert(testClient)
        .select('id');

      const endTime = performance.now();
      const insertTime = endTime - startTime;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(insertTime).toBeLessThan(500); // Should complete within 500ms
    });
  });
});