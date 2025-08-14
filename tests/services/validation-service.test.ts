/**
 * Client Validation Service tests
 * Tests client data validation, business rules, and constraint checks
 */

import { ValidationService } from '@/lib/services/clients/validation-service';
import { testSupabase, initializeTestDatabase, seedTestData, cleanTestDatabase } from '../setup/db-setup';
import { createMockIndividualClientData, createMockBusinessClientData } from '../setup/mocks/fixtures/clients';
import type { ClientValidationResult, ValidationError } from '@/types/clients/operations';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => testSupabase)
}));

describe('ValidationService', () => {
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
      .like('contact_info->email', '%validationtest%');
  });

  describe('validateClientData', () => {
    test('should validate valid individual client data', async () => {
      const clientData = createMockIndividualClientData({
        individual_info: {
          first_name: 'John',
          last_name: 'Doe',
          profession: 'Software Developer'
        },
        contact_info: {
          email: 'john.doe@validationtest.com',
          phone: '+33123456789'
        },
        commercial_info: {
          credit_limit: 10000,
          payment_terms_days: 30
        }
      });

      const result = await ValidationService.validateClientData(clientData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    test('should validate valid business client data', async () => {
      const clientData = createMockBusinessClientData({
        business_info: {
          company_name: 'Tech Corp Ltd',
          industry: 'information_technology'
        },
        contact_info: {
          email: 'contact@techcorp.validationtest.com',
          phone: '+33987654321'
        }
      });

      const result = await ValidationService.validateClientData(clientData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should reject missing required fields for individual client', async () => {
      const invalidData = createMockIndividualClientData({
        individual_info: {
          first_name: '',  // Required field missing
          last_name: 'Doe',
          profession: 'Developer'
        },
        contact_info: {
          email: '',  // Required field missing
          phone: '+33123456789'
        }
      });

      const result = await ValidationService.validateClientData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.field === 'individual_info.first_name')).toBe(true);
      expect(result.errors.some(e => e.field === 'contact_info.email')).toBe(true);
    });

    test('should reject missing required fields for business client', async () => {
      const invalidData = createMockBusinessClientData({
        business_info: {
          company_name: '',  // Required field missing
          industry: 'information_technology'
        },
        contact_info: {
          email: 'invalid-email',  // Invalid format
          phone: '+33987654321'
        }
      });

      const result = await ValidationService.validateClientData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.field === 'business_info.company_name')).toBe(true);
      expect(result.errors.some(e => e.field === 'contact_info.email')).toBe(true);
    });

    test('should validate email format', async () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@domain.com',
        'test.domain.com',
        'test@domain',
        ''
      ];

      for (const email of invalidEmails) {
        const clientData = createMockIndividualClientData({
          contact_info: { email }
        });

        const result = await ValidationService.validateClientData(clientData);

        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => 
          e.field === 'contact_info.email' && e.code === 'INVALID_FORMAT'
        )).toBe(true);
      }
    });

    test('should validate phone number format', async () => {
      const invalidPhones = [
        '123',
        '1234567890123456789', // Too long
        'abc123',
        '+invalid'
      ];

      for (const phone of invalidPhones) {
        const clientData = createMockIndividualClientData({
          contact_info: { 
            email: 'test@validationtest.com',
            phone 
          }
        });

        const result = await ValidationService.validateClientData(clientData);

        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => 
          e.field === 'contact_info.phone' && e.code === 'INVALID_FORMAT'
        )).toBe(true);
      }
    });

    test('should validate credit limit constraints', async () => {
      const clientData = createMockIndividualClientData({
        contact_info: { email: 'credit@validationtest.com' },
        commercial_info: {
          credit_limit: -1000  // Negative credit limit
        }
      });

      const result = await ValidationService.validateClientData(clientData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => 
        e.field === 'commercial_info.credit_limit' && 
        e.code === 'INVALID_VALUE'
      )).toBe(true);
    });

    test('should validate payment terms constraints', async () => {
      const clientData = createMockBusinessClientData({
        contact_info: { email: 'payment@validationtest.com' },
        commercial_info: {
          payment_terms_days: -5  // Negative payment terms
        }
      });

      const result = await ValidationService.validateClientData(clientData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => 
        e.field === 'commercial_info.payment_terms_days' && 
        e.code === 'INVALID_VALUE'
      )).toBe(true);
    });

    test('should validate postal code based on country', async () => {
      const testCases = [
        { country: 'FR', postalCode: '123', shouldFail: true },        // Invalid French postal code
        { country: 'FR', postalCode: '75001', shouldFail: false },     // Valid French postal code
        { country: 'US', postalCode: '123', shouldFail: true },        // Invalid US zip code
        { country: 'US', postalCode: '90210', shouldFail: false },     // Valid US zip code
        { country: 'GB', postalCode: 'SW1A 1AA', shouldFail: false },  // Valid UK postal code
      ];

      for (const testCase of testCases) {
        const clientData = createMockIndividualClientData({
          contact_info: { email: `postal${testCase.postalCode}@validationtest.com` },
          address_info: {
            postal_code: testCase.postalCode,
            country: testCase.country
          }
        });

        const result = await ValidationService.validateClientData(clientData);

        if (testCase.shouldFail) {
          expect(result.isValid).toBe(false);
          expect(result.errors.some(e => 
            e.field === 'address_info.postal_code'
          )).toBe(true);
        } else {
          expect(result.errors.some(e => 
            e.field === 'address_info.postal_code'
          )).toBe(false);
        }
      }
    });

    test('should validate business industry enum values', async () => {
      const validIndustries = [
        'information_technology',
        'manufacturing',
        'healthcare',
        'finance',
        'retail',
        'logistics',
        'other'
      ];

      const invalidIndustries = [
        'invalid_industry',
        'tech',
        'manufacturing_old'
      ];

      // Test valid industries
      for (const industry of validIndustries) {
        const clientData = createMockBusinessClientData({
          business_info: { 
            company_name: 'Test Corp',
            industry: industry as any 
          },
          contact_info: { email: `${industry}@validationtest.com` }
        });

        const result = await ValidationService.validateClientData(clientData);
        expect(result.errors.some(e => 
          e.field === 'business_info.industry'
        )).toBe(false);
      }

      // Test invalid industries
      for (const industry of invalidIndustries) {
        const clientData = createMockBusinessClientData({
          business_info: { 
            company_name: 'Test Corp',
            industry: industry as any 
          },
          contact_info: { email: `${industry}@validationtest.com` }
        });

        const result = await ValidationService.validateClientData(clientData);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => 
          e.field === 'business_info.industry' && 
          e.code === 'INVALID_ENUM_VALUE'
        )).toBe(true);
      }
    });

    test('should generate warnings for suspicious data', async () => {
      const clientData = createMockIndividualClientData({
        contact_info: { email: 'suspicious@validationtest.com' },
        commercial_info: {
          credit_limit: 1000000  // Very high credit limit should generate warning
        },
        tags: Array(51).fill('tag')  // Too many tags should generate warning
      });

      const result = await ValidationService.validateClientData(clientData);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.code === 'HIGH_CREDIT_LIMIT')).toBe(true);
      expect(result.warnings.some(w => w.code === 'TOO_MANY_TAGS')).toBe(true);
    });
  });

  describe('validateBusinessRules', () => {
    test('should validate credit limit against risk level', async () => {
      const clientData = createMockBusinessClientData({
        contact_info: { email: 'risk@validationtest.com' },
        commercial_info: {
          credit_limit: 100000,  // High credit limit
          risk_level: 'high'     // High risk - should generate warning
        }
      });

      const result = await ValidationService.validateBusinessRules(clientData);

      expect(result.warnings.some(w => 
        w.code === 'CREDIT_RISK_MISMATCH'
      )).toBe(true);
    });

    test('should validate payment terms consistency', async () => {
      const clientData = createMockIndividualClientData({
        contact_info: { email: 'terms@validationtest.com' },
        commercial_info: {
          payment_terms: 'net_30',
          payment_terms_days: 60  // Inconsistent with net_30
        }
      });

      const result = await ValidationService.validateBusinessRules(clientData);

      expect(result.warnings.some(w => 
        w.code === 'PAYMENT_TERMS_INCONSISTENCY'
      )).toBe(true);
    });

    test('should validate priority vs commercial history', async () => {
      const clientData = createMockBusinessClientData({
        contact_info: { email: 'priority@validationtest.com' },
        commercial_info: {
          priority: 'high'
        },
        commercial_history: {
          total_orders_amount: 100,  // Low order amount but high priority
          total_orders_count: 1,
          current_balance: 0,
          average_payment_delay_days: 0,
          last_payment_date: new Date().toISOString(),
          last_order_date: new Date().toISOString()
        }
      });

      const result = await ValidationService.validateBusinessRules(clientData);

      expect(result.warnings.some(w => 
        w.code === 'PRIORITY_HISTORY_MISMATCH'
      )).toBe(true);
    });
  });

  describe('checkUniqueConstraints', () => {
    test('should detect duplicate email addresses', async () => {
      // Create a client with a specific email
      const existingClientData = createMockIndividualClientData({
        contact_info: { email: 'unique@validationtest.com' }
      });

      await testSupabase.from('clients').insert(existingClientData);

      // Try to validate another client with the same email
      const duplicateClientData = createMockBusinessClientData({
        contact_info: { email: 'unique@validationtest.com' }
      });

      const result = await ValidationService.checkUniqueConstraints(duplicateClientData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => 
        e.field === 'contact_info.email' && 
        e.code === 'DUPLICATE_VALUE'
      )).toBe(true);
    });

    test('should allow same email for client update', async () => {
      // Create a client
      const clientData = createMockIndividualClientData({
        contact_info: { email: 'update@validationtest.com' }
      });

      const { data: client } = await testSupabase
        .from('clients')
        .insert(clientData)
        .select('*')
        .single();

      // Check uniqueness for the same client (update scenario)
      const result = await ValidationService.checkUniqueConstraints(
        clientData, 
        client.id
      );

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('should detect duplicate business registration numbers', async () => {
      const registrationNumber = 'REG123456789';

      // Create first business client
      const firstClientData = createMockBusinessClientData({
        business_info: {
          company_name: 'First Company',
          registration_number: registrationNumber
        },
        contact_info: { email: 'first@validationtest.com' }
      });

      await testSupabase.from('clients').insert(firstClientData);

      // Try to create second client with same registration number
      const secondClientData = createMockBusinessClientData({
        business_info: {
          company_name: 'Second Company',
          registration_number: registrationNumber
        },
        contact_info: { email: 'second@validationtest.com' }
      });

      const result = await ValidationService.checkUniqueConstraints(secondClientData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => 
        e.field === 'business_info.registration_number' && 
        e.code === 'DUPLICATE_VALUE'
      )).toBe(true);
    });
  });

  describe('validateUpdateConstraints', () => {
    test('should prevent status change from active to deleted', async () => {
      const updateData = {
        status: 'deleted' as const
      };

      const result = await ValidationService.validateUpdateConstraints(
        'active',
        updateData
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => 
        e.code === 'INVALID_STATUS_TRANSITION'
      )).toBe(true);
    });

    test('should allow valid status transitions', async () => {
      const validTransitions = [
        { from: 'active', to: 'inactive' },
        { from: 'inactive', to: 'active' },
        { from: 'pending', to: 'active' }
      ];

      for (const transition of validTransitions) {
        const updateData = {
          status: transition.to as any
        };

        const result = await ValidationService.validateUpdateConstraints(
          transition.from,
          updateData
        );

        expect(result.isValid).toBe(true);
        expect(result.errors.length).toBe(0);
      }
    });

    test('should prevent credit limit reduction below current balance', async () => {
      const currentData = {
        commercial_info: { credit_limit: 50000 },
        commercial_history: { current_balance: 30000 }
      };

      const updateData = {
        commercial_info: { credit_limit: 20000 }  // Below current balance
      };

      const result = await ValidationService.validateUpdateConstraints(
        'active',
        updateData,
        currentData as any
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => 
        e.code === 'CREDIT_LIMIT_BELOW_BALANCE'
      )).toBe(true);
    });
  });

  describe('error formatting', () => {
    test('should format validation errors with proper structure', async () => {
      const invalidData = createMockIndividualClientData({
        individual_info: { first_name: '', last_name: 'Doe' },
        contact_info: { email: 'invalid-email' }
      });

      const result = await ValidationService.validateClientData(invalidData);

      expect(result.errors.length).toBeGreaterThan(0);
      
      result.errors.forEach(error => {
        expect(error).toHaveProperty('field');
        expect(error).toHaveProperty('code');
        expect(error).toHaveProperty('message');
        expect(error).toHaveProperty('severity');
        expect(['error', 'warning']).toContain(error.severity);
      });
    });

    test('should provide localized error messages', async () => {
      const invalidData = createMockIndividualClientData({
        contact_info: { email: 'invalid-email' }
      });

      const result = await ValidationService.validateClientData(invalidData, {
        locale: 'fr'
      });

      expect(result.errors.some(e => 
        e.message.includes('adresse e-mail') || 
        e.message.includes('format')
      )).toBe(true);
    });
  });

  describe('performance', () => {
    test('should validate data efficiently', async () => {
      const clientData = createMockBusinessClientData({
        contact_info: { email: 'performance@validationtest.com' }
      });

      const startTime = Date.now();
      
      const result = await ValidationService.validateClientData(clientData);
      
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(result).toBeDefined();
    });

    test('should handle bulk validation efficiently', async () => {
      const clientDataList = [];
      for (let i = 0; i < 100; i++) {
        clientDataList.push(createMockIndividualClientData({
          contact_info: { email: `bulk${i}@validationtest.com` }
        }));
      }

      const startTime = Date.now();
      
      const results = await Promise.all(
        clientDataList.map(data => ValidationService.validateClientData(data))
      );
      
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(results.length).toBe(100);
      expect(results.every(r => r.isValid)).toBe(true);
    });
  });

  describe('edge cases', () => {
    test('should handle null and undefined values', async () => {
      const clientData = {
        client_type: 'individual',
        individual_info: null,
        contact_info: {
          email: 'null@validationtest.com'
        }
      } as any;

      const result = await ValidationService.validateClientData(clientData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'individual_info')).toBe(true);
    });

    test('should handle empty arrays and objects', async () => {
      const clientData = createMockIndividualClientData({
        contact_info: { email: 'empty@validationtest.com' },
        tags: [],
        commercial_info: {} as any
      });

      const result = await ValidationService.validateClientData(clientData);

      expect(result).toBeDefined();
      // Empty arrays should be valid, empty objects should use defaults
    });

    test('should handle very long text fields', async () => {
      const longText = 'a'.repeat(10000);

      const clientData = createMockBusinessClientData({
        business_info: {
          company_name: longText,
          industry: 'information_technology'
        },
        contact_info: { email: 'longtext@validationtest.com' }
      });

      const result = await ValidationService.validateClientData(clientData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => 
        e.field === 'business_info.company_name' && 
        e.code === 'TEXT_TOO_LONG'
      )).toBe(true);
    });
  });

  afterAll(async () => {
    await cleanTestDatabase();
  });
});