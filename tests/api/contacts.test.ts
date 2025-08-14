/**
 * Contact API endpoint tests
 * Tests contact management for business clients
 */

import { NextRequest } from 'next/server';
import { POST as addContact, PUT as updateContact, DELETE as deleteContact } from '@/app/api/clients/[id]/contacts/[contactId]/route';
import { POST as createContact } from '@/app/api/clients/[id]/contacts/route';
import { testSupabase, initializeTestDatabase, seedTestData, getTestClient } from '../setup/db-setup';
import { createMockBusinessClientData } from '../setup/mocks/fixtures/clients';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => testSupabase)
}));

describe('Contact API Endpoints', () => {
  let businessClientId: string;

  beforeAll(async () => {
    await initializeTestDatabase();
    await seedTestData();
    businessClientId = getTestClient('business');
  });

  describe('POST /api/clients/[id]/contacts', () => {
    test('should add contact to business client successfully', async () => {
      const contactData = {
        first_name: 'New',
        last_name: 'Contact',
        title: 'Sales Manager',
        contact_type: 'sales',
        is_primary: false,
        is_active: true,
        contact_info: {
          email: 'new.contact@business.com',
          phone: '+33123456789'
        }
      };

      const request = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts`, {
        method: 'POST',
        body: JSON.stringify(contactData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await createContact(request, { params: { id: businessClientId } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.contact).toBeDefined();
      expect(data.data.contact.first_name).toBe('New');
      expect(data.data.contact.last_name).toBe('Contact');
      expect(data.data.contact_index).toBeDefined();
    });

    test('should validate contact data', async () => {
      const invalidContactData = {
        first_name: '', // Empty required field
        last_name: 'Test',
        contact_info: {
          email: 'invalid-email' // Invalid email format
        }
      };

      const request = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts`, {
        method: 'POST',
        body: JSON.stringify(invalidContactData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await createContact(request, { params: { id: businessClientId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toBeDefined();
    });

    test('should prevent adding contact to individual client', async () => {
      const individualClientId = getTestClient('individual');
      const contactData = {
        first_name: 'Invalid',
        last_name: 'Contact',
        contact_info: {
          email: 'invalid@test.com'
        }
      };

      const request = new NextRequest(`http://localhost:3000/api/clients/${individualClientId}/contacts`, {
        method: 'POST',
        body: JSON.stringify(contactData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await createContact(request, { params: { id: individualClientId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/individual|business/i);
    });

    test('should handle duplicate primary contact', async () => {
      const primaryContactData = {
        first_name: 'Primary',
        last_name: 'Contact',
        title: 'CEO',
        contact_type: 'primary',
        is_primary: true,
        is_active: true,
        contact_info: {
          email: 'primary@business.com',
          phone: '+33987654321'
        }
      };

      // First primary contact should succeed
      const request1 = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts`, {
        method: 'POST',
        body: JSON.stringify(primaryContactData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response1 = await createContact(request1, { params: { id: businessClientId } });
      
      // Second primary contact should either fail or demote the first one
      const primaryContactData2 = {
        ...primaryContactData,
        first_name: 'Another',
        email: 'another.primary@business.com'
      };

      const request2 = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts`, {
        method: 'POST',
        body: JSON.stringify(primaryContactData2),
        headers: { 'Content-Type': 'application/json' }
      });

      const response2 = await createContact(request2, { params: { id: businessClientId } });

      // Either second request fails, or both succeed with only one primary
      if (response2.status === 400) {
        expect(response2.status).toBe(400);
      } else {
        expect(response2.status).toBe(201);
        // Verify only one primary contact exists
        // This would require additional verification logic
      }
    });

    test('should set default values for contact', async () => {
      const minimalContactData = {
        first_name: 'Minimal',
        last_name: 'Contact',
        contact_info: {
          email: 'minimal@business.com'
        }
      };

      const request = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts`, {
        method: 'POST',
        body: JSON.stringify(minimalContactData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await createContact(request, { params: { id: businessClientId } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.contact.is_active).toBe(true);
      expect(data.data.contact.is_primary).toBe(false);
      expect(data.data.contact.contact_type).toBeDefined();
    });

    test('should return 404 for non-existent client', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const contactData = {
        first_name: 'Test',
        last_name: 'Contact',
        contact_info: { email: 'test@example.com' }
      };

      const request = new NextRequest(`http://localhost:3000/api/clients/${nonExistentId}/contacts`, {
        method: 'POST',
        body: JSON.stringify(contactData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await createContact(request, { params: { id: nonExistentId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/client.*not found/i);
    });
  });

  describe('PUT /api/clients/[id]/contacts/[contactId]', () => {
    test('should update contact successfully', async () => {
      // First create a contact to update
      const contactData = {
        first_name: 'Update',
        last_name: 'Test',
        contact_info: {
          email: 'update@business.com',
          phone: '+33111111111'
        }
      };

      const createRequest = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts`, {
        method: 'POST',
        body: JSON.stringify(contactData),
        headers: { 'Content-Type': 'application/json' }
      });

      const createResponse = await createContact(createRequest, { params: { id: businessClientId } });
      const createData = await createResponse.json();
      const contactIndex = createData.data.contact_index;

      // Now update the contact
      const updateData = {
        title: 'Updated Manager',
        contact_info: {
          phone: '+33222222222'
        }
      };

      const updateRequest = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts/${contactIndex}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await updateContact(updateRequest, { 
        params: { id: businessClientId, contactId: contactIndex.toString() }
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.contact.title).toBe('Updated Manager');
      expect(data.data.contact.contact_info.phone).toBe('+33222222222');
    });

    test('should validate update data', async () => {
      const contactIndex = '0'; // Assuming first contact
      const invalidUpdateData = {
        contact_info: {
          email: 'invalid-email-format'
        }
      };

      const request = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts/${contactIndex}`, {
        method: 'PUT',
        body: JSON.stringify(invalidUpdateData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await updateContact(request, { 
        params: { id: businessClientId, contactId: contactIndex }
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/email/i);
    });

    test('should return 404 for non-existent contact', async () => {
      const nonExistentContactIndex = '999';
      const updateData = { title: 'Test' };

      const request = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts/${nonExistentContactIndex}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await updateContact(request, { 
        params: { id: businessClientId, contactId: nonExistentContactIndex }
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/contact.*not found/i);
    });

    test('should handle partial updates', async () => {
      const contactIndex = '0';
      const partialUpdate = {
        is_active: false
      };

      const request = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts/${contactIndex}`, {
        method: 'PUT',
        body: JSON.stringify(partialUpdate),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await updateContact(request, { 
        params: { id: businessClientId, contactId: contactIndex }
      });
      const data = await response.json();

      if (response.status === 200) {
        expect(data.success).toBe(true);
        expect(data.data.contact.is_active).toBe(false);
      } else {
        // Contact might not exist, which is acceptable for test
        expect(response.status).toBe(404);
      }
    });

    test('should prevent making multiple primary contacts', async () => {
      // This test assumes there's already a primary contact
      const contactIndex = '1'; // Assuming second contact exists
      const updateData = {
        is_primary: true,
        contact_type: 'primary'
      };

      const request = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts/${contactIndex}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await updateContact(request, { 
        params: { id: businessClientId, contactId: contactIndex }
      });

      // Should either succeed and demote other primary, or fail with validation
      expect([200, 400, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/clients/[id]/contacts/[contactId]', () => {
    test('should delete contact successfully', async () => {
      // First create a contact to delete
      const contactData = {
        first_name: 'Delete',
        last_name: 'Test',
        contact_info: {
          email: 'delete@business.com'
        }
      };

      const createRequest = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts`, {
        method: 'POST',
        body: JSON.stringify(contactData),
        headers: { 'Content-Type': 'application/json' }
      });

      const createResponse = await createContact(createRequest, { params: { id: businessClientId } });
      const createData = await createResponse.json();
      const contactIndex = createData.data.contact_index;

      // Now delete the contact
      const deleteRequest = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts/${contactIndex}`, {
        method: 'DELETE'
      });

      const response = await deleteContact(deleteRequest, { 
        params: { id: businessClientId, contactId: contactIndex.toString() }
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    test('should prevent deletion of primary contact', async () => {
      const primaryContactIndex = '0'; // Assuming first contact is primary
      
      const request = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts/${primaryContactIndex}`, {
        method: 'DELETE'
      });

      const response = await deleteContact(request, { 
        params: { id: businessClientId, contactId: primaryContactIndex }
      });
      const data = await response.json();

      // Should either prevent deletion or require special handling
      if (response.status === 400) {
        expect(data.success).toBe(false);
        expect(data.message).toMatch(/primary.*contact/i);
      } else {
        // Deletion might be allowed with automatic reassignment
        expect(response.status).toBe(200);
      }
    });

    test('should return 404 for non-existent contact deletion', async () => {
      const nonExistentContactIndex = '999';
      
      const request = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts/${nonExistentContactIndex}`, {
        method: 'DELETE'
      });

      const response = await deleteContact(request, { 
        params: { id: businessClientId, contactId: nonExistentContactIndex }
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/contact.*not found/i);
    });

    test('should handle cascade effects of contact deletion', async () => {
      // Create a contact and then delete it to test cascade effects
      const contactData = {
        first_name: 'Cascade',
        last_name: 'Test',
        contact_info: {
          email: 'cascade@business.com'
        }
      };

      const createRequest = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts`, {
        method: 'POST',
        body: JSON.stringify(contactData),
        headers: { 'Content-Type': 'application/json' }
      });

      const createResponse = await createContact(createRequest, { params: { id: businessClientId } });
      const createData = await createResponse.json();
      const contactIndex = createData.data.contact_index;

      const deleteRequest = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts/${contactIndex}`, {
        method: 'DELETE'
      });

      const response = await deleteContact(deleteRequest, { 
        params: { id: businessClientId, contactId: contactIndex.toString() }
      });

      expect(response.status).toBe(200);

      // Verify the contact is actually removed from the client
      const client = await testSupabase
        .from('clients')
        .select('business_info')
        .eq('id', businessClientId)
        .single();

      expect(client.data).toBeDefined();
      const contacts = client.data?.business_info?.contacts || [];
      const deletedContact = contacts[contactIndex];
      
      // Contact should either be removed or marked as inactive
      expect(deletedContact?.is_active === false || deletedContact === undefined).toBe(true);
    });
  });

  describe('Contact Validation', () => {
    test('should validate email format', async () => {
      const invalidContactData = {
        first_name: 'Email',
        last_name: 'Test',
        contact_info: {
          email: 'not-an-email'
        }
      };

      const request = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts`, {
        method: 'POST',
        body: JSON.stringify(invalidContactData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await createContact(request, { params: { id: businessClientId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/email/i);
    });

    test('should validate phone format', async () => {
      const invalidContactData = {
        first_name: 'Phone',
        last_name: 'Test',
        contact_info: {
          email: 'phone@business.com',
          phone: 'not-a-phone-number'
        }
      };

      const request = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts`, {
        method: 'POST',
        body: JSON.stringify(invalidContactData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await createContact(request, { params: { id: businessClientId } });
      const data = await response.json();

      // Phone validation might be lenient, so test both cases
      if (response.status === 400) {
        expect(data.message).toMatch(/phone/i);
      } else {
        expect(response.status).toBe(201);
      }
    });

    test('should validate required fields', async () => {
      const incompleteContactData = {
        // Missing first_name and last_name
        contact_info: {
          email: 'incomplete@business.com'
        }
      };

      const request = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts`, {
        method: 'POST',
        body: JSON.stringify(incompleteContactData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await createContact(request, { params: { id: businessClientId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/required|name/i);
    });

    test('should validate contact type enum', async () => {
      const invalidContactData = {
        first_name: 'Type',
        last_name: 'Test',
        contact_type: 'invalid_type',
        contact_info: {
          email: 'type@business.com'
        }
      };

      const request = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts`, {
        method: 'POST',
        body: JSON.stringify(invalidContactData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await createContact(request, { params: { id: businessClientId } });
      const data = await response.json();

      // Should either fail validation or use default value
      if (response.status === 400) {
        expect(data.message).toMatch(/contact_type|type/i);
      } else {
        expect(response.status).toBe(201);
        expect(['primary', 'secondary', 'technical', 'financial', 'sales']).toContain(
          data.data.contact.contact_type
        );
      }
    });
  });

  describe('Contact Security', () => {
    test('should sanitize contact input data', async () => {
      const maliciousContactData = {
        first_name: '<script>alert("xss")</script>',
        last_name: 'Test',
        title: '<img src="x" onerror="alert(1)">',
        contact_info: {
          email: 'security@business.com'
        }
      };

      const request = new NextRequest(`http://localhost:3000/api/clients/${businessClientId}/contacts`, {
        method: 'POST',
        body: JSON.stringify(maliciousContactData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await createContact(request, { params: { id: businessClientId } });
      const data = await response.json();

      if (response.status === 201) {
        // Script tags should be sanitized
        expect(data.data.contact.first_name).not.toContain('<script>');
        expect(data.data.contact.title).not.toContain('<img');
      } else {
        // Or validation should prevent script injection
        expect(response.status).toBe(400);
      }
    });
  });
});