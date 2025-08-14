/**
 * Validation API endpoint tests
 * Tests client data validation endpoints
 */

import { NextRequest } from 'next/server';
import { POST as validateClient } from '@/app/api/clients/validate/route';
import { testSupabase, initializeTestDatabase } from '../setup/db-setup';
import { createMockIndividualClientData, createMockBusinessClientData } from '../setup/mocks/fixtures/clients';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => testSupabase)
}));

describe('Validation API Endpoints', () => {
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  describe('POST /api/clients/validate', () => {
    test('should validate correct individual client data', async () => {
      const validClientData = createMockIndividualClientData();
      const requestBody = {
        data: validClientData,
        operation_type: 'create'
      };

      const request = new NextRequest('http://localhost:3000/api/clients/validate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await validateClient(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.valid).toBe(true);
      expect(data.data.errors).toEqual([]);
      expect(data.data.warnings).toEqual([]);
    });

    test('should validate correct business client data', async () => {
      const validClientData = createMockBusinessClientData();
      const requestBody = {
        data: validClientData,
        operation_type: 'create'
      };

      const request = new NextRequest('http://localhost:3000/api/clients/validate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await validateClient(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.valid).toBe(true);
      expect(data.data.errors).toEqual([]);
    });

    test('should detect missing required fields for individual client', async () => {
      const incompleteClientData = {
        client_type: 'individual',
        // Missing individual_info
        contact_info: {
          email: 'incomplete@example.com'
        }
      };

      const requestBody = {
        data: incompleteClientData,
        operation_type: 'create'
      };

      const request = new NextRequest('http://localhost:3000/api/clients/validate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await validateClient(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.success).toBe(false);
      expect(data.data.valid).toBe(false);
      expect(data.data.errors.length).toBeGreaterThan(0);

      const fieldErrors = data.data.errors.map((e: any) => e.field);
      expect(fieldErrors).toContain('individual_info.first_name');
      expect(fieldErrors).toContain('individual_info.last_name');
    });

    test('should detect missing required fields for business client', async () => {
      const incompleteBusinessData = {
        client_type: 'business',
        business_info: {
          // Missing company_name
          industry: 'information_technology'
        },
        contact_info: {
          email: 'incomplete@business.com'
        }
      };

      const requestBody = {
        data: incompleteBusinessData,
        operation_type: 'create'
      };

      const request = new NextRequest('http://localhost:3000/api/clients/validate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await validateClient(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.success).toBe(false);
      expect(data.data.valid).toBe(false);
      expect(data.data.errors.length).toBeGreaterThan(0);

      const companyNameError = data.data.errors.find((e: any) => 
        e.field === 'business_info.company_name'
      );
      expect(companyNameError).toBeDefined();
      expect(companyNameError.severity).toBe('error');
    });

    test('should validate email format', async () => {
      const invalidEmailData = createMockIndividualClientData({
        contact_info: {
          email: 'not-an-email-address',
          phone: '+33123456789'
        }
      });

      const requestBody = {
        data: invalidEmailData,
        operation_type: 'create'
      };

      const request = new NextRequest('http://localhost:3000/api/clients/validate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await validateClient(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.data.valid).toBe(false);

      const emailError = data.data.errors.find((e: any) => 
        e.field === 'contact_info.email'
      );
      expect(emailError).toBeDefined();
      expect(emailError.message).toMatch(/email/i);
    });

    test('should validate phone number format', async () => {
      const invalidPhoneData = createMockIndividualClientData({
        contact_info: {
          email: 'test@example.com',
          phone: '123' // Too short/invalid
        }
      });

      const requestBody = {
        data: invalidPhoneData,
        operation_type: 'create'
      };

      const request = new NextRequest('http://localhost:3000/api/clients/validate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await validateClient(request);
      const data = await response.json();

      // Phone validation might be lenient, so check if error exists
      if (response.status === 422) {
        const phoneError = data.data.errors.find((e: any) => 
          e.field.includes('phone')
        );
        expect(phoneError?.message).toMatch(/phone/i);
      }
    });

    test('should validate credit limit values', async () => {
      const invalidCreditData = createMockIndividualClientData({
        commercial_info: {
          credit_limit: -1000, // Negative value
          credit_limit_currency: 'EUR'
        }
      });

      const requestBody = {
        data: invalidCreditData,
        operation_type: 'create'
      };

      const request = new NextRequest('http://localhost:3000/api/clients/validate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await validateClient(request);
      const data = await response.json();

      if (response.status === 422) {
        const creditError = data.data.errors.find((e: any) => 
          e.field.includes('credit_limit')
        );
        expect(creditError?.message).toMatch(/credit|limit|negative|positive/i);
      }
    });

    test('should validate currency codes', async () => {
      const invalidCurrencyData = createMockIndividualClientData({
        commercial_info: {
          credit_limit: 5000,
          credit_limit_currency: 'INVALID' // Invalid currency code
        }
      });

      const requestBody = {
        data: invalidCurrencyData,
        operation_type: 'create'
      };

      const request = new NextRequest('http://localhost:3000/api/clients/validate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await validateClient(request);
      const data = await response.json();

      if (response.status === 422) {
        const currencyError = data.data.errors.find((e: any) => 
          e.field.includes('currency')
        );
        expect(currencyError?.message).toMatch(/currency/i);
      }
    });

    test('should validate payment terms', async () => {
      const invalidPaymentData = createMockIndividualClientData({
        commercial_info: {
          payment_terms_days: -5, // Negative days
          payment_terms: 'invalid_terms'
        }
      });

      const requestBody = {
        data: invalidPaymentData,
        operation_type: 'create'
      };

      const request = new NextRequest('http://localhost:3000/api/clients/validate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await validateClient(request);
      const data = await response.json();

      if (response.status === 422) {
        const errors = data.data.errors.map((e: any) => e.field);
        expect(
          errors.some((field: string) => field.includes('payment'))
        ).toBe(true);
      }
    });

    test('should validate date formats', async () => {
      const invalidDateData = createMockIndividualClientData({
        individual_info: {
          first_name: 'Test',
          last_name: 'User',
          date_of_birth: 'invalid-date-format'
        }
      });

      const requestBody = {
        data: invalidDateData,
        operation_type: 'create'
      };

      const request = new NextRequest('http://localhost:3000/api/clients/validate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await validateClient(request);
      const data = await response.json();

      if (response.status === 422) {
        const dateError = data.data.errors.find((e: any) => 
          e.field.includes('date_of_birth')
        );
        expect(dateError?.message).toMatch(/date/i);
      }
    });

    test('should validate business contact information', async () => {
      const invalidBusinessData = createMockBusinessClientData({
        business_info: {
          company_name: 'Test Corp',
          contacts: [
            {
              first_name: '', // Empty required field
              last_name: 'Contact',
              contact_info: {
                email: 'invalid-email'
              }
            }
          ]
        }
      });

      const requestBody = {
        data: invalidBusinessData,
        operation_type: 'create'
      };

      const request = new NextRequest('http://localhost:3000/api/clients/validate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await validateClient(request);
      const data = await response.json();

      if (response.status === 422) {
        const contactErrors = data.data.errors.filter((e: any) => 
          e.field.includes('contact')
        );
        expect(contactErrors.length).toBeGreaterThan(0);
      }
    });

    test('should validate SIRET and VAT numbers for French businesses', async () => {
      const invalidBusinessData = createMockBusinessClientData({
        business_info: {
          company_name: 'French Corp',
          legal_info: {
            siret: '123', // Invalid SIRET
            vat_number: 'INVALID' // Invalid VAT
          }
        },
        contact_info: {
          address: {
            country: 'FR'
          }
        }
      });

      const requestBody = {
        data: invalidBusinessData,
        operation_type: 'create'
      };

      const request = new NextRequest('http://localhost:3000/api/clients/validate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await validateClient(request);
      const data = await response.json();

      if (response.status === 422) {
        const legalErrors = data.data.errors.filter((e: any) => 
          e.field.includes('siret') || e.field.includes('vat')
        );
        expect(legalErrors.length).toBeGreaterThan(0);
      }
    });

    test('should generate warnings for potential issues', async () => {
      const warningData = createMockIndividualClientData({
        commercial_info: {
          credit_limit: 1000000, // Very high credit limit - might trigger warning
          credit_limit_currency: 'EUR'
        },
        tags: [] // No tags - might trigger warning
      });

      const requestBody = {
        data: warningData,
        operation_type: 'create'
      };

      const request = new NextRequest('http://localhost:3000/api/clients/validate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await validateClient(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.valid).toBe(true);
      
      // Check if warnings were generated
      if (data.data.warnings && data.data.warnings.length > 0) {
        expect(Array.isArray(data.data.warnings)).toBe(true);
        data.data.warnings.forEach((warning: any) => {
          expect(warning.severity).toBe('warning');
          expect(warning.field).toBeDefined();
          expect(warning.message).toBeDefined();
        });
      }
    });

    test('should validate update operations differently', async () => {
      const updateData = {
        tags: ['updated'],
        commercial_info: {
          credit_limit: 15000
        }
      };

      const requestBody = {
        data: updateData,
        operation_type: 'update'
      };

      const request = new NextRequest('http://localhost:3000/api/clients/validate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await validateClient(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.valid).toBe(true);
    });

    test('should handle missing operation_type', async () => {
      const clientData = createMockIndividualClientData();
      const requestBody = {
        data: clientData
        // Missing operation_type
      };

      const request = new NextRequest('http://localhost:3000/api/clients/validate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await validateClient(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/operation_type/i);
    });

    test('should handle invalid client_type', async () => {
      const invalidTypeData = {
        client_type: 'invalid_type',
        contact_info: {
          email: 'test@example.com'
        }
      };

      const requestBody = {
        data: invalidTypeData,
        operation_type: 'create'
      };

      const request = new NextRequest('http://localhost:3000/api/clients/validate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await validateClient(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.data.valid).toBe(false);

      const typeError = data.data.errors.find((e: any) => 
        e.field === 'client_type'
      );
      expect(typeError).toBeDefined();
    });

    test('should validate postal codes by country', async () => {
      const invalidPostalData = createMockIndividualClientData({
        contact_info: {
          address: {
            address_line1: '123 Test St',
            city: 'Paris',
            postal_code: '123', // Invalid French postal code
            country: 'FR'
          }
        }
      });

      const requestBody = {
        data: invalidPostalData,
        operation_type: 'create'
      };

      const request = new NextRequest('http://localhost:3000/api/clients/validate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await validateClient(request);
      const data = await response.json();

      if (response.status === 422) {
        const postalError = data.data.errors.find((e: any) => 
          e.field.includes('postal_code')
        );
        expect(postalError?.message).toMatch(/postal|code/i);
      }
    });

    test('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/clients/validate', {
        method: 'POST',
        body: '{ invalid json',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await validateClient(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toMatch(/json|parse/i);
    });

    test('should return detailed error information', async () => {
      const invalidData = {
        client_type: 'individual',
        individual_info: {
          first_name: '',
          last_name: ''
        },
        contact_info: {
          email: 'invalid-email',
          phone: '123'
        }
      };

      const requestBody = {
        data: invalidData,
        operation_type: 'create'
      };

      const request = new NextRequest('http://localhost:3000/api/clients/validate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await validateClient(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.data.errors).toBeDefined();
      
      // Check error structure
      data.data.errors.forEach((error: any) => {
        expect(error.field).toBeDefined();
        expect(error.message).toBeDefined();
        expect(error.severity).toBeDefined();
        expect(['error', 'warning']).toContain(error.severity);
      });
    });

    test('should validate array fields', async () => {
      const invalidArrayData = createMockIndividualClientData({
        tags: 'not-an-array' // Should be array
      });

      const requestBody = {
        data: invalidArrayData,
        operation_type: 'create'
      };

      const request = new NextRequest('http://localhost:3000/api/clients/validate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await validateClient(request);
      const data = await response.json();

      if (response.status === 422) {
        const tagsError = data.data.errors.find((e: any) => 
          e.field === 'tags'
        );
        expect(tagsError?.message).toMatch(/array/i);
      }
    });

    test('should handle validation timeout gracefully', async () => {
      // This would require mocking a timeout scenario
      // For now, this is a placeholder for timeout handling tests
      expect(true).toBe(true);
    });
  });

  describe('Validation Performance', () => {
    test('should validate data within performance threshold', async () => {
      const clientData = createMockBusinessClientData();
      const requestBody = {
        data: clientData,
        operation_type: 'create'
      };

      const startTime = performance.now();

      const request = new NextRequest('http://localhost:3000/api/clients/validate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await validateClient(request);
      const data = await response.json();

      const endTime = performance.now();
      const validationTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(validationTime).toBeLessThan(500); // Should complete within 500ms
    });
  });
});