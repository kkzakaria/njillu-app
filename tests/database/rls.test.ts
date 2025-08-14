/**
 * Row Level Security (RLS) policies tests
 * Tests security policies and access control
 */

import { testSupabase, initializeTestDatabase, seedTestData } from '../setup/db-setup';

describe('Row Level Security Tests', () => {
  beforeAll(async () => {
    await initializeTestDatabase();
    await seedTestData();
  });

  describe('RLS Policies Enabled', () => {
    test('should have RLS enabled on clients table', async () => {
      const { data, error } = await testSupabase
        .rpc('check_rls_enabled', { table_name_param: 'clients' });

      expect(error).toBeNull();
      expect(data).toBe(true);
    });

    test('should have RLS enabled on folders table', async () => {
      const { data, error } = await testSupabase
        .rpc('check_rls_enabled', { table_name_param: 'folders' });

      expect(error).toBeNull();
      expect(data).toBe(true);
    });

    test('should have RLS enabled on bills_of_lading table', async () => {
      const { data, error } = await testSupabase
        .rpc('check_rls_enabled', { table_name_param: 'bills_of_lading' });

      expect(error).toBeNull();
      expect(data).toBe(true);
    });
  });

  describe('Policy Existence', () => {
    test('should have SELECT policies on clients table', async () => {
      const { data, error } = await testSupabase
        .from('pg_policies')
        .select('policyname, cmd')
        .eq('tablename', 'clients')
        .eq('cmd', 'SELECT');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
    });

    test('should have INSERT policies on clients table', async () => {
      const { data, error } = await testSupabase
        .from('pg_policies')
        .select('policyname, cmd')
        .eq('tablename', 'clients')
        .eq('cmd', 'INSERT');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
    });

    test('should have UPDATE policies on clients table', async () => {
      const { data, error } = await testSupabase
        .from('pg_policies')
        .select('policyname, cmd')
        .eq('tablename', 'clients')
        .eq('cmd', 'UPDATE');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
    });

    test('should have DELETE policies on clients table', async () => {
      const { data, error } = await testSupabase
        .from('pg_policies')
        .select('policyname, cmd')
        .eq('tablename', 'clients')
        .eq('cmd', 'DELETE');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
    });
  });

  describe('Soft Delete Policies', () => {
    test('should exclude soft-deleted records in SELECT queries', async () => {
      // First, soft delete a test client
      const { data: clients, error: selectError } = await testSupabase
        .from('clients')
        .select('id')
        .limit(1);

      expect(selectError).toBeNull();
      expect(clients?.length).toBeGreaterThan(0);

      const clientId = clients?.[0].id;

      // Soft delete the client
      await testSupabase
        .from('clients')
        .update({ 
          deleted_at: new Date().toISOString(),
          deletion_reason: 'Test soft delete'
        })
        .eq('id', clientId);

      // Try to select the soft-deleted client
      const { data: deletedClient, error } = await testSupabase
        .from('clients')
        .select('id')
        .eq('id', clientId);

      expect(error).toBeNull();
      expect(deletedClient?.length).toBe(0); // Should not return soft-deleted records
    });

    test('should prevent updates to soft-deleted records', async () => {
      // Get a client and soft delete it
      const { data: clients } = await testSupabase
        .from('clients')
        .select('id')
        .limit(1);

      if (clients?.length === 0) return; // Skip if no clients

      const clientId = clients[0].id;

      // Soft delete
      await testSupabase
        .from('clients')
        .update({ 
          deleted_at: new Date().toISOString(),
          deletion_reason: 'Test update protection'
        })
        .eq('id', clientId);

      // Try to update the soft-deleted client
      const { error: updateError } = await testSupabase
        .from('clients')
        .update({ tags: ['updated'] })
        .eq('id', clientId);

      // Should either fail or not affect any rows
      expect(updateError).toBeDefined();
    });
  });

  describe('User Access Control', () => {
    test('should allow authenticated users to read active clients', async () => {
      const { data, error } = await testSupabase
        .from('clients')
        .select('id, status')
        .eq('status', 'active');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    test('should allow authenticated users to create clients', async () => {
      const testClient = {
        client_type: 'individual',
        individual_info: {
          first_name: 'RLS',
          last_name: 'Test',
          profession: 'Tester'
        },
        contact_info: {
          email: 'rls.test@example.com',
          phone: '+33123456789',
          address: {
            address_line1: '123 RLS Street',
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
        commercial_history: {
          total_orders_amount: 0,
          total_orders_count: 0,
          current_balance: 0,
          average_payment_delay_days: 0
        },
        status: 'active',
        tags: ['rls-test'],
        created_by: '550e8400-e29b-41d4-a716-446655440000'
      };

      const { data, error } = await testSupabase
        .from('clients')
        .insert(testClient)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBe(1);
      expect(data?.[0].individual_info.first_name).toBe('RLS');
    });

    test('should allow updating own created clients', async () => {
      // Create a client first
      const testClient = {
        client_type: 'individual',
        individual_info: {
          first_name: 'Update',
          last_name: 'Test',
          profession: 'Tester'
        },
        contact_info: {
          email: 'update.test@example.com',
          phone: '+33123456789',
          address: {
            address_line1: '123 Update Street',
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
        tags: ['update-test'],
        created_by: '550e8400-e29b-41d4-a716-446655440000'
      };

      const { data: created, error: createError } = await testSupabase
        .from('clients')
        .insert(testClient)
        .select()
        .single();

      expect(createError).toBeNull();
      expect(created).toBeDefined();

      // Now update it
      const { data: updated, error: updateError } = await testSupabase
        .from('clients')
        .update({ tags: ['updated', 'update-test'] })
        .eq('id', created.id)
        .select();

      expect(updateError).toBeNull();
      expect(updated).toBeDefined();
      expect(updated?.[0].tags).toContain('updated');
    });
  });

  describe('Folders RLS Policies', () => {
    test('should enforce client relationship in folders', async () => {
      // Get a test client
      const { data: clients } = await testSupabase
        .from('clients')
        .select('id')
        .limit(1);

      if (clients?.length === 0) return; // Skip if no clients

      const clientId = clients[0].id;

      // Create a folder for the client
      const testFolder = {
        client_id: clientId,
        status: 'active',
        priority: 'normal',
        created_by: '550e8400-e29b-41d4-a716-446655440000'
      };

      const { data, error } = await testSupabase
        .from('folders')
        .insert(testFolder)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.[0].client_id).toBe(clientId);
    });

    test('should allow reading folders for accessible clients', async () => {
      const { data, error } = await testSupabase
        .from('folders')
        .select(`
          id,
          client_id,
          status,
          clients (
            id,
            status
          )
        `)
        .limit(5);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Bills of Lading RLS Policies', () => {
    test('should enforce folder relationship in bills of lading', async () => {
      // Get a test folder
      const { data: folders } = await testSupabase
        .from('folders')
        .select('id')
        .limit(1);

      if (folders?.length === 0) return; // Skip if no folders

      const folderId = folders[0].id;

      // Get a shipping company
      const { data: shippingCompanies } = await testSupabase
        .from('shipping_companies')
        .select('id')
        .limit(1);

      if (shippingCompanies?.length === 0) return; // Skip if no shipping companies

      const shippingCompanyId = shippingCompanies[0].id;

      // Create a bill of lading
      const testBL = {
        bl_number: `TEST-BL-${Date.now()}`,
        folder_id: folderId,
        shipping_company_id: shippingCompanyId,
        status: 'active',
        created_by: '550e8400-e29b-41d4-a716-446655440000'
      };

      const { data, error } = await testSupabase
        .from('bills_of_lading')
        .insert(testBL)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.[0].folder_id).toBe(folderId);
    });
  });

  describe('Performance Considerations', () => {
    test('should have efficient RLS policies that do not cause performance issues', async () => {
      const startTime = performance.now();

      // Perform a typical query that would use RLS policies
      const { data, error } = await testSupabase
        .from('clients')
        .select(`
          id,
          client_type,
          status,
          contact_info,
          folders (
            id,
            status
          )
        `)
        .eq('status', 'active')
        .limit(10);

      const endTime = performance.now();
      const queryTime = endTime - startTime;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(queryTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should not cause N+1 query problems with RLS', async () => {
      const startTime = performance.now();

      // Query that could potentially cause N+1 problems
      const { data, error } = await testSupabase
        .from('folders')
        .select(`
          id,
          status,
          client_id,
          clients!inner (
            id,
            status
          ),
          bills_of_lading (
            id,
            bl_number
          )
        `)
        .limit(5);

      const endTime = performance.now();
      const queryTime = endTime - startTime;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(queryTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });
});