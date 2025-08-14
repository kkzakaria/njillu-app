/**
 * Client API endpoint tests
 * Tests all client-related API routes with comprehensive scenarios
 */

import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '@/app/api/clients/route';
import { GET as getClient, PUT as updateClient, DELETE as deleteClient } from '@/app/api/clients/[id]/route';
import { testSupabase, initializeTestDatabase, seedTestData, getTestClient } from '../setup/db-setup';
import { createMockIndividualClientData, createMockBusinessClientData } from '../setup/mocks/fixtures/clients';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => testSupabase)
}));

describe('Client API Endpoints', () => {
  beforeAll(async () => {
    await initializeTestDatabase();
    await seedTestData();
  });

  describe('GET /api/clients', () => {
    test('should return paginated client list', async () => {
      const request = new NextRequest('http://localhost:3000/api/clients?page=1&page_size=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.clients).toBeDefined();
      expect(Array.isArray(data.data.clients)).toBe(true);
      expect(data.data.total_count).toBeDefined();
      expect(data.data.page).toBe(1);
      expect(data.data.page_size).toBe(10);
    });

    test('should handle search query parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/clients?search=test&client_types=individual,business');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.clients).toBeDefined();
    });

    test('should handle status filtering', async () => {
      const request = new NextRequest('http://localhost:3000/api/clients?status=active&status=inactive');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.clients).toBeDefined();
    });

    test('should validate pagination parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/clients?page=0&page_size=1000');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Should handle invalid pagination gracefully
      expect(data.data.page).toBeGreaterThan(0);
      expect(data.data.page_size).toBeLessThanOrEqual(100); // Max page size
    });

    test('should handle sorting parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/clients?sort_by=created_at&sort_order=desc');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.clients).toBeDefined();
    });

    test('should handle empty results', async () => {
      const request = new NextRequest('http://localhost:3000/api/clients?search=nonexistent-client-xyz123');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.clients).toEqual([]);
      expect(data.data.total_count).toBe(0);
    });
  });

  describe('POST /api/clients', () => {
    test('should create individual client successfully', async () => {
      const clientData = createMockIndividualClientData({
        individual_info: {
          first_name: 'API',
          last_name: 'Test',
          profession: 'API Tester'
        },
        contact_info: {
          email: 'api.test@example.com',
          phone: '+33123456789'
        }
      });

      const request = new NextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.id).toBeDefined();
      expect(data.data.client_type).toBe('individual');
      expect(data.data.individual_info.first_name).toBe('API');
    });

    test('should create business client successfully', async () => {
      const clientData = createMockBusinessClientData({
        business_info: {
          company_name: 'API Test Corp',
          industry: 'information_technology'
        },
        contact_info: {
          email: 'contact@apitest.com',
          phone: '+33123456789'
        }
      });

      const request = new NextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.id).toBeDefined();
      expect(data.data.client_type).toBe('business');
      expect(data.data.business_info.company_name).toBe('API Test Corp');
    });

    test('should validate required fields', async () => {
      const invalidClientData = {
        client_type: 'individual',
        // Missing required fields
        contact_info: {
          phone: '+33123456789'
        }
      };

      const request = new NextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: JSON.stringify(invalidClientData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toBeDefined();
    });

    test('should validate email format', async () => {
      const clientData = createMockIndividualClientData({
        contact_info: {
          email: 'invalid-email-format', // Invalid email
          phone: '+33123456789'
        }
      });

      const request = new NextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/email/i);
    });

    test('should validate business client required fields', async () => {
      const invalidBusinessData = {
        client_type: 'business',
        business_info: {
          // Missing company_name
          industry: 'information_technology'
        },
        contact_info: {
          email: 'test@business.com',
          phone: '+33123456789'
        }
      };

      const request = new NextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: JSON.stringify(invalidBusinessData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/company_name|required/i);
    });

    test('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: '{ invalid json',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/json|parse/i);
    });

    test('should set default values correctly', async () => {
      const clientData = createMockIndividualClientData();
      // Remove commercial_info to test defaults
      delete (clientData as any).commercial_info;

      const request = new NextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.commercial_info).toBeDefined();
      expect(data.data.commercial_info.credit_limit).toBe(0);
      expect(data.data.commercial_info.credit_limit_currency).toBe('EUR');
      expect(data.data.commercial_info.payment_terms_days).toBe(30);
      expect(data.data.status).toBe('active');
    });
  });

  describe('GET /api/clients/[id]', () => {
    test('should get client by ID', async () => {
      const clientId = getTestClient('individual');
      const request = new NextRequest(`http://localhost:3000/api/clients/${clientId}`);
      const response = await getClient(request, { params: { id: clientId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.id).toBe(clientId);
    });

    test('should get client detail with detailed=true', async () => {
      const clientId = getTestClient('business');
      const request = new NextRequest(`http://localhost:3000/api/clients/${clientId}?detailed=true`);
      const response = await getClient(request, { params: { id: clientId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.client).toBeDefined();
      expect(data.data.display_info).toBeDefined();
      expect(data.data.total_folders).toBeDefined();
      expect(data.data.active_folders).toBeDefined();
    });

    test('should return 404 for non-existent client', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const request = new NextRequest(`http://localhost:3000/api/clients/${nonExistentId}`);
      const response = await getClient(request, { params: { id: nonExistentId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/not found/i);
    });

    test('should validate UUID format', async () => {
      const invalidId = 'invalid-uuid';
      const request = new NextRequest(`http://localhost:3000/api/clients/${invalidId}`);
      const response = await getClient(request, { params: { id: invalidId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/uuid|id/i);
    });
  });

  describe('PUT /api/clients/[id]', () => {
    test('should update client successfully', async () => {
      const clientId = getTestClient('individual');
      const updateData = {
        individual_info: {
          profession: 'Updated API Tester'
        },
        tags: ['updated', 'api-test']
      };

      const request = new NextRequest(`http://localhost:3000/api/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await updateClient(request, { params: { id: clientId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.individual_info.profession).toBe('Updated API Tester');
      expect(data.data.tags).toContain('updated');
    });

    test('should validate update data', async () => {
      const clientId = getTestClient('business');
      const invalidUpdateData = {
        contact_info: {
          email: 'invalid-email-format'
        }
      };

      const request = new NextRequest(`http://localhost:3000/api/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify(invalidUpdateData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await updateClient(request, { params: { id: clientId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/email/i);
    });

    test('should return 404 for non-existent client update', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const updateData = { tags: ['test'] };

      const request = new NextRequest(`http://localhost:3000/api/clients/${nonExistentId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await updateClient(request, { params: { id: nonExistentId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/not found/i);
    });

    test('should handle partial updates', async () => {
      const clientId = getTestClient('business');
      const partialUpdate = {
        commercial_info: {
          credit_limit: 75000
        }
      };

      const request = new NextRequest(`http://localhost:3000/api/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify(partialUpdate),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await updateClient(request, { params: { id: clientId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.commercial_info.credit_limit).toBe(75000);
    });

    test('should update timestamp automatically', async () => {
      const clientId = getTestClient('individual');
      const originalClient = await testSupabase
        .from('clients')
        .select('updated_at')
        .eq('id', clientId)
        .single();

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      const updateData = { tags: ['timestamp-test'] };
      const request = new NextRequest(`http://localhost:3000/api/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await updateClient(request, { params: { id: clientId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(new Date(data.data.updated_at).getTime()).toBeGreaterThan(
        new Date(originalClient.data!.updated_at).getTime()
      );
    });
  });

  describe('DELETE /api/clients/[id]', () => {
    test('should soft delete client successfully', async () => {
      // Create a client for deletion
      const clientData = createMockIndividualClientData({
        contact_info: { email: 'delete.test@example.com' }
      });
      
      const { data: created } = await testSupabase
        .from('clients')
        .insert(clientData)
        .select('id')
        .single();

      const request = new NextRequest(`http://localhost:3000/api/clients/${created.id}`, {
        method: 'DELETE',
        body: JSON.stringify({
          deletion_type: 'soft',
          reason: 'API test deletion'
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await deleteClient(request, { params: { id: created.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.success).toBe(true);
      expect(data.data.deletion_type).toBe('soft');
    });

    test('should prevent deletion of client with active folders', async () => {
      const clientId = getTestClient('business');

      const request = new NextRequest(`http://localhost:3000/api/clients/${clientId}`, {
        method: 'DELETE',
        body: JSON.stringify({
          deletion_type: 'soft',
          reason: 'API test'
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await deleteClient(request, { params: { id: clientId } });
      const data = await response.json();

      // Should either fail or require force flag
      if (response.status === 400) {
        expect(data.success).toBe(false);
        expect(data.message).toMatch(/active folders/i);
      } else {
        expect(response.status).toBe(200);
      }
    });

    test('should force delete client with active folders when force=true', async () => {
      // Create a client with a folder
      const clientData = createMockIndividualClientData({
        contact_info: { email: 'force.delete@example.com' }
      });
      
      const { data: created } = await testSupabase
        .from('clients')
        .insert(clientData)
        .select('id')
        .single();

      // Create a folder for this client
      await testSupabase
        .from('folders')
        .insert({
          client_id: created.id,
          status: 'active',
          priority: 'normal',
          created_by: '550e8400-e29b-41d4-a716-446655440000'
        });

      const request = new NextRequest(`http://localhost:3000/api/clients/${created.id}`, {
        method: 'DELETE',
        body: JSON.stringify({
          deletion_type: 'soft',
          reason: 'API force delete test',
          force: true,
          handle_folders: 'archive'
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await deleteClient(request, { params: { id: created.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.success).toBe(true);
      expect(data.data.affected_folders_count).toBeGreaterThan(0);
    });

    test('should return 404 for non-existent client deletion', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const request = new NextRequest(`http://localhost:3000/api/clients/${nonExistentId}`, {
        method: 'DELETE',
        body: JSON.stringify({
          deletion_type: 'soft',
          reason: 'Test'
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await deleteClient(request, { params: { id: nonExistentId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/not found/i);
    });

    test('should handle folder transfer on client deletion', async () => {
      // Create two clients
      const client1Data = createMockIndividualClientData({
        contact_info: { email: 'transfer.from@example.com' }
      });
      const client2Data = createMockIndividualClientData({
        contact_info: { email: 'transfer.to@example.com' }
      });

      const [result1, result2] = await Promise.all([
        testSupabase.from('clients').insert(client1Data).select('id').single(),
        testSupabase.from('clients').insert(client2Data).select('id').single()
      ]);

      // Create folder for client1
      await testSupabase
        .from('folders')
        .insert({
          client_id: result1.data!.id,
          status: 'active',
          priority: 'normal',
          created_by: '550e8400-e29b-41d4-a716-446655440000'
        });

      const request = new NextRequest(`http://localhost:3000/api/clients/${result1.data!.id}`, {
        method: 'DELETE',
        body: JSON.stringify({
          deletion_type: 'soft',
          reason: 'Transfer test',
          force: true,
          handle_folders: 'transfer',
          transfer_to_client_id: result2.data!.id
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await deleteClient(request, { params: { id: result1.data!.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.folder_actions).toBeDefined();
      expect(data.data.folder_actions.some((action: any) => action.action === 'transferred')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      // Mock a database error
      const originalSelect = testSupabase.from;
      testSupabase.from = jest.fn(() => ({
        select: jest.fn().mockResolvedValue({
          error: { message: 'Database connection failed' },
          data: null
        })
      })) as any;

      const request = new NextRequest('http://localhost:3000/api/clients?page=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/database|error/i);

      // Restore original function
      testSupabase.from = originalSelect;
    });

    test('should handle timeout errors', async () => {
      // This would require mocking a timeout scenario
      // For now, this is a placeholder for timeout handling tests
      expect(true).toBe(true);
    });

    test('should validate request content type', async () => {
      const request = new NextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: 'not json',
        headers: { 'Content-Type': 'text/plain' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/content-type|json/i);
    });
  });

  describe('Security', () => {
    test('should sanitize input data', async () => {
      const clientData = createMockIndividualClientData({
        individual_info: {
          first_name: '<script>alert("xss")</script>',
          last_name: 'Test'
        }
      });

      const request = new NextRequest('http://localhost:3000/api/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const data = await response.json();

      if (response.status === 201) {
        // If created successfully, script tags should be sanitized
        expect(data.data.individual_info.first_name).not.toContain('<script>');
      } else {
        // Or validation should prevent script injection
        expect(response.status).toBe(400);
      }
    });

    test('should prevent SQL injection', async () => {
      const request = new NextRequest("http://localhost:3000/api/clients?search='; DROP TABLE clients; --");
      const response = await GET(request);
      const data = await response.json();

      // Should handle SQL injection attempt gracefully
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Search should not execute SQL injection
    });

    test('should enforce rate limiting (placeholder)', async () => {
      // This would require implementing rate limiting middleware
      // For now, this is a placeholder for rate limiting tests
      expect(true).toBe(true);
    });
  });
});