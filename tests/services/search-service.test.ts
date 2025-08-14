/**
 * Client Search Service tests
 * Tests search functionality for clients with various filters and sorting
 */

import { SearchService } from '@/lib/services/clients/search-service';
import { testSupabase, initializeTestDatabase, seedTestData, cleanTestDatabase } from '../setup/db-setup';
import { createMockIndividualClientData, createMockBusinessClientData } from '../setup/mocks/fixtures/clients';
import type { ClientSearchFilters, ClientSearchSortOptions } from '@/types/clients/views';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => testSupabase)
}));

describe('SearchService', () => {
  const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

  beforeAll(async () => {
    await initializeTestDatabase();
    await seedTestData();
  });

  beforeEach(async () => {
    // Clean up test clients created during tests
    await testSupabase
      .from('clients')
      .delete()
      .like('contact_info->email', '%searchtest%');
  });

  describe('searchClients', () => {
    test('should search by text query in names and email', async () => {
      // Create test clients with distinctive names
      const individualData = createMockIndividualClientData({
        individual_info: {
          first_name: 'SearchTest',
          last_name: 'Individual',
          profession: 'Developer'
        },
        contact_info: {
          email: 'searchtest.individual@searchtest.com'
        }
      });

      const businessData = createMockBusinessClientData({
        business_info: {
          company_name: 'SearchTest Corporation',
          industry: 'information_technology'
        },
        contact_info: {
          email: 'contact@searchtestcorp.com'
        }
      });

      // Create clients
      await Promise.all([
        testSupabase.from('clients').insert(individualData),
        testSupabase.from('clients').insert(businessData)
      ]);

      const result = await SearchService.searchClients({
        query: 'SearchTest'
      });

      expect(result.clients.length).toBeGreaterThanOrEqual(2);
      expect(result.clients.some(c => 
        c.individual_info?.first_name === 'SearchTest' || 
        c.business_info?.company_name === 'SearchTest Corporation'
      )).toBe(true);
      expect(result.total).toBeGreaterThanOrEqual(2);
    });

    test('should search by email query', async () => {
      const clientData = createMockIndividualClientData({
        contact_info: {
          email: 'unique.email@searchtest.com'
        }
      });

      await testSupabase.from('clients').insert(clientData);

      const result = await SearchService.searchClients({
        query: 'unique.email@searchtest.com'
      });

      expect(result.clients.length).toBeGreaterThanOrEqual(1);
      expect(result.clients[0].contact_info.email).toBe('unique.email@searchtest.com');
    });

    test('should handle empty query gracefully', async () => {
      const result = await SearchService.searchClients({
        query: ''
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.clients)).toBe(true);
      expect(typeof result.total).toBe('number');
      expect(typeof result.page).toBe('number');
      expect(typeof result.pageSize).toBe('number');
    });

    test('should handle query with no results', async () => {
      const result = await SearchService.searchClients({
        query: 'nonexistent-query-12345'
      });

      expect(result.clients).toEqual([]);
      expect(result.total).toBe(0);
    });

    test('should respect case insensitive search', async () => {
      const clientData = createMockBusinessClientData({
        business_info: {
          company_name: 'CaSeSeNsItIvE Test Corp'
        },
        contact_info: {
          email: 'case@searchtest.com'
        }
      });

      await testSupabase.from('clients').insert(clientData);

      const result = await SearchService.searchClients({
        query: 'casesensitive'
      });

      expect(result.clients.length).toBeGreaterThanOrEqual(1);
      expect(result.clients[0].business_info.company_name).toBe('CaSeSeNsItIvE Test Corp');
    });
  });

  describe('searchWithFilters', () => {
    test('should filter by client types', async () => {
      // Create individual client
      const individualData = createMockIndividualClientData({
        contact_info: { email: 'filter.individual@searchtest.com' }
      });

      // Create business client
      const businessData = createMockBusinessClientData({
        contact_info: { email: 'filter.business@searchtest.com' }
      });

      await Promise.all([
        testSupabase.from('clients').insert(individualData),
        testSupabase.from('clients').insert(businessData)
      ]);

      const filters: ClientSearchFilters = {
        clientTypes: ['individual']
      };

      const result = await SearchService.searchWithFilters({
        filters
      });

      expect(result.clients.every(c => c.client_type === 'individual')).toBe(true);
    });

    test('should filter by status', async () => {
      const activeClientData = createMockIndividualClientData({
        contact_info: { email: 'active@searchtest.com' },
        status: 'active'
      });

      const inactiveClientData = createMockIndividualClientData({
        contact_info: { email: 'inactive@searchtest.com' },
        status: 'inactive'
      });

      await Promise.all([
        testSupabase.from('clients').insert(activeClientData),
        testSupabase.from('clients').insert(inactiveClientData)
      ]);

      const filters: ClientSearchFilters = {
        status: ['active']
      };

      const result = await SearchService.searchWithFilters({
        filters
      });

      expect(result.clients.every(c => c.status === 'active')).toBe(true);
    });

    test('should filter by priority levels', async () => {
      const highPriorityData = createMockBusinessClientData({
        contact_info: { email: 'high@searchtest.com' },
        commercial_info: { priority: 'high' }
      });

      const normalPriorityData = createMockBusinessClientData({
        contact_info: { email: 'normal@searchtest.com' },
        commercial_info: { priority: 'normal' }
      });

      await Promise.all([
        testSupabase.from('clients').insert(highPriorityData),
        testSupabase.from('clients').insert(normalPriorityData)
      ]);

      const filters: ClientSearchFilters = {
        priorities: ['high']
      };

      const result = await SearchService.searchWithFilters({
        filters
      });

      expect(result.clients.every(c => c.commercial_info.priority === 'high')).toBe(true);
    });

    test('should filter by risk levels', async () => {
      const highRiskData = createMockBusinessClientData({
        contact_info: { email: 'highrisk@searchtest.com' },
        commercial_info: { risk_level: 'high' }
      });

      const lowRiskData = createMockBusinessClientData({
        contact_info: { email: 'lowrisk@searchtest.com' },
        commercial_info: { risk_level: 'low' }
      });

      await Promise.all([
        testSupabase.from('clients').insert(highRiskData),
        testSupabase.from('clients').insert(lowRiskData)
      ]);

      const filters: ClientSearchFilters = {
        riskLevels: ['high']
      };

      const result = await SearchService.searchWithFilters({
        filters
      });

      expect(result.clients.every(c => c.commercial_info.risk_level === 'high')).toBe(true);
    });

    test('should filter by tags', async () => {
      const taggedClientData = createMockIndividualClientData({
        contact_info: { email: 'tagged@searchtest.com' },
        tags: ['vip', 'premium', 'corporate']
      });

      const untaggedClientData = createMockIndividualClientData({
        contact_info: { email: 'untagged@searchtest.com' },
        tags: ['regular']
      });

      await Promise.all([
        testSupabase.from('clients').insert(taggedClientData),
        testSupabase.from('clients').insert(untaggedClientData)
      ]);

      const filters: ClientSearchFilters = {
        tags: ['vip', 'premium']
      };

      const result = await SearchService.searchWithFilters({
        filters
      });

      expect(result.clients.every(c => 
        c.tags && (c.tags.includes('vip') || c.tags.includes('premium'))
      )).toBe(true);
    });

    test('should filter by credit limit range', async () => {
      const highCreditData = createMockBusinessClientData({
        contact_info: { email: 'highcredit@searchtest.com' },
        commercial_info: { credit_limit: 50000 }
      });

      const lowCreditData = createMockBusinessClientData({
        contact_info: { email: 'lowcredit@searchtest.com' },
        commercial_info: { credit_limit: 5000 }
      });

      await Promise.all([
        testSupabase.from('clients').insert(highCreditData),
        testSupabase.from('clients').insert(lowCreditData)
      ]);

      const filters: ClientSearchFilters = {
        creditLimitMin: 10000,
        creditLimitMax: 100000
      };

      const result = await SearchService.searchWithFilters({
        filters
      });

      expect(result.clients.every(c => 
        c.commercial_info.credit_limit >= 10000 && 
        c.commercial_info.credit_limit <= 100000
      )).toBe(true);
    });

    test('should filter by date ranges', async () => {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const recentClientData = createMockIndividualClientData({
        contact_info: { email: 'recent@searchtest.com' }
      });

      await testSupabase.from('clients').insert(recentClientData);

      const filters: ClientSearchFilters = {
        createdAfter: oneWeekAgo,
        createdBefore: now
      };

      const result = await SearchService.searchWithFilters({
        filters
      });

      expect(result.clients.every(c => {
        const createdAt = new Date(c.created_at);
        return createdAt >= oneWeekAgo && createdAt <= now;
      })).toBe(true);
    });

    test('should combine multiple filters', async () => {
      const complexClientData = createMockBusinessClientData({
        business_info: {
          company_name: 'Complex Filter Corp',
          industry: 'information_technology'
        },
        contact_info: { email: 'complex@searchtest.com' },
        status: 'active',
        commercial_info: {
          priority: 'high',
          risk_level: 'medium',
          credit_limit: 25000
        },
        tags: ['enterprise', 'tech']
      });

      await testSupabase.from('clients').insert(complexClientData);

      const filters: ClientSearchFilters = {
        clientTypes: ['business'],
        status: ['active'],
        priorities: ['high'],
        riskLevels: ['medium'],
        tags: ['enterprise'],
        creditLimitMin: 20000,
        creditLimitMax: 50000
      };

      const result = await SearchService.searchWithFilters({
        filters
      });

      expect(result.clients.length).toBeGreaterThanOrEqual(1);
      const client = result.clients.find(c => c.contact_info.email === 'complex@searchtest.com');
      expect(client).toBeDefined();
    });
  });

  describe('sorting', () => {
    test('should sort by name ascending', async () => {
      const client1Data = createMockIndividualClientData({
        individual_info: { first_name: 'Alice', last_name: 'Anderson' },
        contact_info: { email: 'alice@searchtest.com' }
      });

      const client2Data = createMockIndividualClientData({
        individual_info: { first_name: 'Bob', last_name: 'Brown' },
        contact_info: { email: 'bob@searchtest.com' }
      });

      await Promise.all([
        testSupabase.from('clients').insert(client1Data),
        testSupabase.from('clients').insert(client2Data)
      ]);

      const sortOptions: ClientSearchSortOptions = {
        field: 'name',
        direction: 'asc'
      };

      const result = await SearchService.searchWithFilters({
        query: 'searchtest',
        sortOptions
      });

      expect(result.clients.length).toBeGreaterThanOrEqual(2);
      
      // Find our test clients in results
      const aliceIndex = result.clients.findIndex(c => c.contact_info.email === 'alice@searchtest.com');
      const bobIndex = result.clients.findIndex(c => c.contact_info.email === 'bob@searchtest.com');

      if (aliceIndex !== -1 && bobIndex !== -1) {
        expect(aliceIndex).toBeLessThan(bobIndex);
      }
    });

    test('should sort by creation date descending', async () => {
      const client1Data = createMockIndividualClientData({
        contact_info: { email: 'first@searchtest.com' }
      });

      const firstClient = await testSupabase
        .from('clients')
        .insert(client1Data)
        .select('*')
        .single();

      // Wait to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));

      const client2Data = createMockIndividualClientData({
        contact_info: { email: 'second@searchtest.com' }
      });

      await testSupabase.from('clients').insert(client2Data);

      const sortOptions: ClientSearchSortOptions = {
        field: 'created_at',
        direction: 'desc'
      };

      const result = await SearchService.searchWithFilters({
        query: 'searchtest',
        sortOptions
      });

      expect(result.clients.length).toBeGreaterThanOrEqual(2);

      // Find our test clients
      const firstIndex = result.clients.findIndex(c => c.contact_info.email === 'first@searchtest.com');
      const secondIndex = result.clients.findIndex(c => c.contact_info.email === 'second@searchtest.com');

      if (firstIndex !== -1 && secondIndex !== -1) {
        expect(secondIndex).toBeLessThan(firstIndex); // More recent should come first
      }
    });

    test('should sort by credit limit descending', async () => {
      const highCreditData = createMockBusinessClientData({
        contact_info: { email: 'highcredit.sort@searchtest.com' },
        commercial_info: { credit_limit: 100000 }
      });

      const lowCreditData = createMockBusinessClientData({
        contact_info: { email: 'lowcredit.sort@searchtest.com' },
        commercial_info: { credit_limit: 10000 }
      });

      await Promise.all([
        testSupabase.from('clients').insert(highCreditData),
        testSupabase.from('clients').insert(lowCreditData)
      ]);

      const sortOptions: ClientSearchSortOptions = {
        field: 'credit_limit',
        direction: 'desc'
      };

      const result = await SearchService.searchWithFilters({
        query: 'credit.sort@searchtest',
        sortOptions
      });

      expect(result.clients.length).toBeGreaterThanOrEqual(2);

      const highIndex = result.clients.findIndex(c => c.contact_info.email === 'highcredit.sort@searchtest.com');
      const lowIndex = result.clients.findIndex(c => c.contact_info.email === 'lowcredit.sort@searchtest.com');

      if (highIndex !== -1 && lowIndex !== -1) {
        expect(highIndex).toBeLessThan(lowIndex);
      }
    });
  });

  describe('pagination', () => {
    test('should respect page size limits', async () => {
      const result = await SearchService.searchWithFilters({
        pageSize: 5
      });

      expect(result.clients.length).toBeLessThanOrEqual(5);
      expect(result.pageSize).toBe(5);
    });

    test('should handle page navigation', async () => {
      // Create multiple test clients to ensure we have enough data
      const clientPromises = [];
      for (let i = 0; i < 10; i++) {
        const clientData = createMockIndividualClientData({
          contact_info: { email: `pagination${i}@searchtest.com` }
        });
        clientPromises.push(testSupabase.from('clients').insert(clientData));
      }

      await Promise.all(clientPromises);

      const page1 = await SearchService.searchWithFilters({
        query: 'pagination',
        page: 1,
        pageSize: 5
      });

      const page2 = await SearchService.searchWithFilters({
        query: 'pagination',
        page: 2,
        pageSize: 5
      });

      expect(page1.clients.length).toBeLessThanOrEqual(5);
      expect(page2.clients.length).toBeLessThanOrEqual(5);
      expect(page1.page).toBe(1);
      expect(page2.page).toBe(2);

      // Ensure different clients on different pages (if we have enough data)
      if (page1.clients.length > 0 && page2.clients.length > 0) {
        const page1Ids = page1.clients.map(c => c.id);
        const page2Ids = page2.clients.map(c => c.id);
        const overlap = page1Ids.some(id => page2Ids.includes(id));
        expect(overlap).toBe(false);
      }
    });

    test('should enforce maximum page size', async () => {
      const result = await SearchService.searchWithFilters({
        pageSize: 1000 // Should be capped
      });

      expect(result.pageSize).toBeLessThanOrEqual(100);
    });
  });

  describe('advanced search', () => {
    test('should perform fuzzy search', async () => {
      const clientData = createMockIndividualClientData({
        individual_info: {
          first_name: 'Johnathan',
          last_name: 'Smith'
        },
        contact_info: { email: 'fuzzy@searchtest.com' }
      });

      await testSupabase.from('clients').insert(clientData);

      // Search with slight misspelling
      const result = await SearchService.searchClients({
        query: 'Johnatan Smyth'
      });

      expect(result.clients.length).toBeGreaterThanOrEqual(1);
    });

    test('should search within nested JSON fields', async () => {
      const clientData = createMockBusinessClientData({
        business_info: {
          company_name: 'Tech Innovations Inc',
          industry: 'information_technology'
        },
        contact_info: { 
          email: 'nested@searchtest.com',
          phone: '+33123456789'
        }
      });

      await testSupabase.from('clients').insert(clientData);

      const result = await SearchService.searchClients({
        query: '+33123456789'
      });

      expect(result.clients.length).toBeGreaterThanOrEqual(1);
      expect(result.clients[0].contact_info.phone).toBe('+33123456789');
    });
  });

  describe('performance', () => {
    test('should handle large result sets efficiently', async () => {
      const startTime = Date.now();
      
      const result = await SearchService.searchWithFilters({
        pageSize: 100
      });

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.clients.length).toBeLessThanOrEqual(100);
    });

    test('should handle complex filter combinations efficiently', async () => {
      const complexFilters: ClientSearchFilters = {
        clientTypes: ['business', 'individual'],
        status: ['active', 'inactive'],
        priorities: ['high', 'normal', 'low'],
        riskLevels: ['low', 'medium'],
        creditLimitMin: 1000,
        creditLimitMax: 100000,
        tags: ['enterprise', 'vip']
      };

      const startTime = Date.now();
      
      const result = await SearchService.searchWithFilters({
        filters: complexFilters,
        pageSize: 50
      });

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
      expect(result).toBeDefined();
    });
  });

  describe('error handling', () => {
    test('should handle database errors gracefully', async () => {
      // Mock database error
      const originalFrom = testSupabase.from;
      testSupabase.from = jest.fn(() => {
        throw new Error('Database connection failed');
      }) as any;

      await expect(SearchService.searchClients({
        query: 'test'
      })).rejects.toThrow('Database connection failed');

      // Restore original function
      testSupabase.from = originalFrom;
    });

    test('should handle invalid filter values', async () => {
      const invalidFilters: ClientSearchFilters = {
        creditLimitMin: -1000,
        creditLimitMax: -500,
        createdAfter: new Date('invalid-date'),
        createdBefore: new Date('invalid-date')
      };

      const result = await SearchService.searchWithFilters({
        filters: invalidFilters
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.clients)).toBe(true);
    });

    test('should handle malformed query strings', async () => {
      const malformedQueries = [
        '%%%',
        '___',
        'SELECT * FROM clients',
        '<script>alert("xss")</script>',
        null as any,
        undefined as any
      ];

      for (const query of malformedQueries) {
        const result = await SearchService.searchClients({
          query
        });
        
        expect(result).toBeDefined();
        expect(Array.isArray(result.clients)).toBe(true);
      }
    });
  });

  afterAll(async () => {
    await cleanTestDatabase();
  });
});