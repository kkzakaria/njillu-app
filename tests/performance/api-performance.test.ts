/**
 * API Performance Tests
 * Tests API endpoint performance, response times, and load handling
 */

import { testSupabase, initializeTestDatabase, seedTestData, cleanTestDatabase } from '../setup/db-setup';
import { createMockIndividualClientData, createMockBusinessClientData } from '../setup/mocks/fixtures/clients';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => testSupabase)
}));

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  FAST: 100,      // Very fast operations
  NORMAL: 500,    // Normal operations
  SLOW: 1000,     // Acceptable for complex operations
  VERY_SLOW: 3000 // Maximum acceptable for heavy operations
};

describe('API Performance Tests', () => {
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
      .like('contact_info->email', '%perftest%');
  });

  describe('Client CRUD Performance', () => {
    test('should create individual client within performance threshold', async () => {
      const clientData = createMockIndividualClientData({
        contact_info: { email: 'create.individual@perftest.com' }
      });

      const startTime = performance.now();
      
      const { error } = await testSupabase
        .from('clients')
        .insert(clientData);

      const duration = performance.now() - startTime;

      expect(error).toBeNull();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.NORMAL);
    });

    test('should create business client within performance threshold', async () => {
      const clientData = createMockBusinessClientData({
        contact_info: { email: 'create.business@perftest.com' }
      });

      const startTime = performance.now();
      
      const { error } = await testSupabase
        .from('clients')
        .insert(clientData);

      const duration = performance.now() - startTime;

      expect(error).toBeNull();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.NORMAL);
    });

    test('should retrieve client by ID quickly', async () => {
      // Create test client
      const clientData = createMockIndividualClientData({
        contact_info: { email: 'retrieve@perftest.com' }
      });

      const { data: client } = await testSupabase
        .from('clients')
        .insert(clientData)
        .select('*')
        .single();

      // Measure retrieval performance
      const startTime = performance.now();
      
      const { data, error } = await testSupabase
        .from('clients')
        .select('*')
        .eq('id', client.id)
        .single();

      const duration = performance.now() - startTime;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.FAST);
    });

    test('should update client efficiently', async () => {
      // Create test client
      const clientData = createMockBusinessClientData({
        contact_info: { email: 'update@perftest.com' }
      });

      const { data: client } = await testSupabase
        .from('clients')
        .insert(clientData)
        .select('*')
        .single();

      // Measure update performance
      const startTime = performance.now();
      
      const { error } = await testSupabase
        .from('clients')
        .update({
          tags: ['performance-updated'],
          'commercial_info.priority': 'high'
        })
        .eq('id', client.id);

      const duration = performance.now() - startTime;

      expect(error).toBeNull();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.NORMAL);
    });

    test('should delete client quickly', async () => {
      // Create test client
      const clientData = createMockIndividualClientData({
        contact_info: { email: 'delete@perftest.com' }
      });

      const { data: client } = await testSupabase
        .from('clients')
        .insert(clientData)
        .select('*')
        .single();

      // Measure soft delete performance
      const startTime = performance.now();
      
      const { error } = await testSupabase
        .from('clients')
        .update({
          deleted_at: new Date().toISOString(),
          deletion_reason: 'Performance test'
        })
        .eq('id', client.id);

      const duration = performance.now() - startTime;

      expect(error).toBeNull();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.FAST);
    });
  });

  describe('Search and Filtering Performance', () => {
    beforeEach(async () => {
      // Create a dataset for search performance testing
      const clients = [];
      for (let i = 0; i < 50; i++) {
        if (i % 2 === 0) {
          clients.push(createMockIndividualClientData({
            individual_info: {
              first_name: `SearchTest${i}`,
              last_name: 'Individual'
            },
            contact_info: { email: `search${i}@perftest.com` },
            tags: ['performance', 'individual', `tag${i}`],
            commercial_info: { priority: i % 3 === 0 ? 'high' : 'normal' }
          }));
        } else {
          clients.push(createMockBusinessClientData({
            business_info: {
              company_name: `SearchCorp${i}`,
              industry: 'information_technology'
            },
            contact_info: { email: `corp${i}@perftest.com` },
            tags: ['performance', 'business', `corp${i}`],
            commercial_info: { priority: i % 4 === 0 ? 'high' : 'normal' }
          }));
        }
      }

      await testSupabase.from('clients').insert(clients);
    });

    test('should perform text search efficiently', async () => {
      const startTime = performance.now();
      
      const { data, error } = await testSupabase
        .from('clients')
        .select('*')
        .or('individual_info->>first_name.ilike.%SearchTest%,business_info->>company_name.ilike.%SearchCorp%')
        .limit(20);

      const duration = performance.now() - startTime;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.NORMAL);
    });

    test('should filter by status efficiently', async () => {
      const startTime = performance.now();
      
      const { data, error } = await testSupabase
        .from('clients')
        .select('*')
        .eq('status', 'active')
        .limit(20);

      const duration = performance.now() - startTime;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.FAST);
    });

    test('should filter by client type efficiently', async () => {
      const startTime = performance.now();
      
      const { data, error } = await testSupabase
        .from('clients')
        .select('*')
        .eq('client_type', 'business')
        .limit(20);

      const duration = performance.now() - startTime;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.FAST);
    });

    test('should filter by tags efficiently', async () => {
      const startTime = performance.now();
      
      const { data, error } = await testSupabase
        .from('clients')
        .select('*')
        .contains('tags', ['performance'])
        .limit(20);

      const duration = performance.now() - startTime;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.NORMAL);
    });

    test('should handle complex multi-filter queries efficiently', async () => {
      const startTime = performance.now();
      
      const { data, error } = await testSupabase
        .from('clients')
        .select('*')
        .eq('status', 'active')
        .eq('client_type', 'business')
        .contains('tags', ['performance'])
        .eq('commercial_info->>priority', 'high')
        .limit(10);

      const duration = performance.now() - startTime;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.SLOW);
    });

    test('should paginate large result sets efficiently', async () => {
      const startTime = performance.now();
      
      const { data, error, count } = await testSupabase
        .from('clients')
        .select('*', { count: 'exact' })
        .contains('tags', ['performance'])
        .range(0, 9); // First 10 items

      const duration = performance.now() - startTime;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeLessThanOrEqual(10);
      expect(count).toBeGreaterThan(0);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.NORMAL);
    });

    test('should sort results efficiently', async () => {
      const startTime = performance.now();
      
      const { data, error } = await testSupabase
        .from('clients')
        .select('*')
        .contains('tags', ['performance'])
        .order('created_at', { ascending: false })
        .limit(20);

      const duration = performance.now() - startTime;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.NORMAL);

      // Verify sort order
      for (let i = 1; i < data!.length; i++) {
        const prev = new Date(data![i - 1].created_at).getTime();
        const curr = new Date(data![i].created_at).getTime();
        expect(prev).toBeGreaterThanOrEqual(curr);
      }
    });
  });

  describe('Batch Operations Performance', () => {
    test('should handle batch insert efficiently', async () => {
      const batchSize = 25;
      const clients = [];
      
      for (let i = 0; i < batchSize; i++) {
        clients.push(createMockIndividualClientData({
          contact_info: { email: `batch${i}@perftest.com` }
        }));
      }

      const startTime = performance.now();
      
      const { error } = await testSupabase
        .from('clients')
        .insert(clients);

      const duration = performance.now() - startTime;

      expect(error).toBeNull();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.SLOW);
      
      // Calculate per-item performance
      const perItemDuration = duration / batchSize;
      expect(perItemDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.FAST);
    });

    test('should handle batch update efficiently', async () => {
      // Create test clients first
      const clients = [];
      for (let i = 0; i < 20; i++) {
        clients.push(createMockBusinessClientData({
          contact_info: { email: `batchupdate${i}@perftest.com` }
        }));
      }

      const { data: createdClients } = await testSupabase
        .from('clients')
        .insert(clients)
        .select('id');

      const clientIds = createdClients!.map(c => c.id);

      // Measure batch update performance
      const startTime = performance.now();
      
      const updatePromises = clientIds.map(id =>
        testSupabase
          .from('clients')
          .update({ tags: ['batch-updated'] })
          .eq('id', id)
      );

      await Promise.all(updatePromises);

      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.VERY_SLOW);
      
      // Calculate per-item performance
      const perItemDuration = duration / clientIds.length;
      expect(perItemDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.NORMAL);
    });

    test('should handle batch delete efficiently', async () => {
      // Create test clients
      const clients = [];
      for (let i = 0; i < 15; i++) {
        clients.push(createMockIndividualClientData({
          contact_info: { email: `batchdelete${i}@perftest.com` }
        }));
      }

      const { data: createdClients } = await testSupabase
        .from('clients')
        .insert(clients)
        .select('id');

      const clientIds = createdClients!.map(c => c.id);

      // Measure batch delete performance
      const startTime = performance.now();
      
      const { error } = await testSupabase
        .from('clients')
        .update({
          deleted_at: new Date().toISOString(),
          deletion_reason: 'Batch performance test'
        })
        .in('id', clientIds);

      const duration = performance.now() - startTime;

      expect(error).toBeNull();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.SLOW);
    });
  });

  describe('Database Statistics and Analytics', () => {
    beforeEach(async () => {
      // Create test data for analytics
      const clients = [];
      for (let i = 0; i < 30; i++) {
        clients.push(createMockBusinessClientData({
          contact_info: { email: `analytics${i}@perftest.com` },
          commercial_info: {
            priority: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'normal' : 'low',
            credit_limit: (i + 1) * 1000
          },
          commercial_history: {
            total_orders_amount: (i + 1) * 5000,
            total_orders_count: i + 1,
            current_balance: i * 100,
            average_payment_delay_days: i % 10,
            last_payment_date: new Date().toISOString(),
            last_order_date: new Date().toISOString()
          }
        }));
      }

      await testSupabase.from('clients').insert(clients);
    });

    test('should calculate client statistics efficiently', async () => {
      const startTime = performance.now();
      
      const { data, error } = await testSupabase
        .from('clients')
        .select('status, client_type, commercial_info, commercial_history')
        .contains('tags', []); // Get all analytics clients

      const duration = performance.now() - startTime;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.NORMAL);

      // Calculate statistics in JavaScript (simulating service layer)
      const stats = data!.reduce((acc, client) => {
        acc.totalClients++;
        acc.totalRevenue += client.commercial_history?.total_orders_amount || 0;
        acc.averageBalance += client.commercial_history?.current_balance || 0;
        return acc;
      }, { totalClients: 0, totalRevenue: 0, averageBalance: 0 });

      stats.averageBalance = stats.averageBalance / stats.totalClients;

      expect(stats.totalClients).toBeGreaterThan(0);
      expect(stats.totalRevenue).toBeGreaterThan(0);
    });

    test('should aggregate data by status efficiently', async () => {
      const startTime = performance.now();
      
      // Simulate aggregation query (in real app, this would be done in service layer)
      const { data: activeClients } = await testSupabase
        .from('clients')
        .select('id')
        .eq('status', 'active');

      const { data: inactiveClients } = await testSupabase
        .from('clients')
        .select('id')
        .eq('status', 'inactive');

      const duration = performance.now() - startTime;

      expect(activeClients).toBeDefined();
      expect(inactiveClients).toBeDefined();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.NORMAL);
    });

    test('should generate reports efficiently', async () => {
      const startTime = performance.now();
      
      // Simulate complex reporting query
      const { data, error } = await testSupabase
        .from('clients')
        .select('client_type, commercial_info, commercial_history, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      const duration = performance.now() - startTime;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.SLOW);
    });
  });

  describe('Concurrent Operations Performance', () => {
    test('should handle concurrent reads efficiently', async () => {
      // Create test data
      const clients = [];
      for (let i = 0; i < 20; i++) {
        clients.push(createMockIndividualClientData({
          contact_info: { email: `concurrent${i}@perftest.com` }
        }));
      }

      await testSupabase.from('clients').insert(clients);

      const startTime = performance.now();
      
      // Perform concurrent read operations
      const readPromises = [];
      for (let i = 0; i < 10; i++) {
        readPromises.push(
          testSupabase
            .from('clients')
            .select('*')
            .like('contact_info->email', '%concurrent%')
            .limit(5)
        );
      }

      const results = await Promise.all(readPromises);

      const duration = performance.now() - startTime;

      // All queries should succeed
      results.forEach(result => {
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
      });

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.VERY_SLOW);

      // Calculate average per-query performance
      const avgPerQuery = duration / readPromises.length;
      expect(avgPerQuery).toBeLessThan(PERFORMANCE_THRESHOLDS.NORMAL);
    });

    test('should handle concurrent writes efficiently', async () => {
      const startTime = performance.now();
      
      // Perform concurrent write operations
      const writePromises = [];
      for (let i = 0; i < 5; i++) {
        writePromises.push(
          testSupabase
            .from('clients')
            .insert(createMockBusinessClientData({
              contact_info: { email: `concurrentwrite${i}@perftest.com` }
            }))
        );
      }

      const results = await Promise.all(writePromises);

      const duration = performance.now() - startTime;

      // All writes should succeed
      results.forEach(result => {
        expect(result.error).toBeNull();
      });

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.SLOW);
    });

    test('should handle mixed read/write operations efficiently', async () => {
      // Create initial data
      const initialClient = createMockIndividualClientData({
        contact_info: { email: 'mixed@perftest.com' }
      });

      const { data: client } = await testSupabase
        .from('clients')
        .insert(initialClient)
        .select('*')
        .single();

      const startTime = performance.now();
      
      // Mix of read and write operations
      const operations = [
        // Reads
        testSupabase.from('clients').select('*').eq('id', client.id),
        testSupabase.from('clients').select('*').eq('status', 'active').limit(5),
        // Writes
        testSupabase.from('clients').insert(createMockBusinessClientData({
          contact_info: { email: 'mixed1@perftest.com' }
        })),
        testSupabase.from('clients').update({ tags: ['mixed'] }).eq('id', client.id),
        // More reads
        testSupabase.from('clients').select('count').eq('status', 'active')
      ];

      const results = await Promise.all(operations);

      const duration = performance.now() - startTime;

      // All operations should succeed
      results.forEach(result => {
        expect(result.error).toBeNull();
      });

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.VERY_SLOW);
    });
  });

  describe('Memory and Resource Usage', () => {
    test('should handle large result sets without memory issues', async () => {
      // Create a larger dataset
      const largeDataset = [];
      for (let i = 0; i < 100; i++) {
        largeDataset.push(createMockBusinessClientData({
          contact_info: { email: `large${i}@perftest.com` },
          tags: Array.from({ length: 10 }, (_, j) => `tag${i}_${j}`)
        }));
      }

      await testSupabase.from('clients').insert(largeDataset);

      const initialMemory = process.memoryUsage().heapUsed;
      const startTime = performance.now();
      
      const { data, error } = await testSupabase
        .from('clients')
        .select('*')
        .like('contact_info->email', '%large%');

      const duration = performance.now() - startTime;
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBe(100);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.VERY_SLOW);
      
      // Memory increase should be reasonable (less than 50MB for this dataset)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    test('should efficiently stream large datasets', async () => {
      // Create dataset
      const streamData = [];
      for (let i = 0; i < 200; i++) {
        streamData.push(createMockIndividualClientData({
          contact_info: { email: `stream${i}@perftest.com` }
        }));
      }

      await testSupabase.from('clients').insert(streamData);

      const startTime = performance.now();
      let processedCount = 0;
      
      // Simulate streaming by processing in chunks
      const chunkSize = 20;
      for (let offset = 0; offset < 200; offset += chunkSize) {
        const { data } = await testSupabase
          .from('clients')
          .select('id, contact_info->email')
          .like('contact_info->email', '%stream%')
          .range(offset, offset + chunkSize - 1);

        processedCount += data?.length || 0;
      }

      const duration = performance.now() - startTime;

      expect(processedCount).toBe(200);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.VERY_SLOW);
    });
  });

  describe('Performance Regression Detection', () => {
    const performanceLog: { [key: string]: number } = {};

    test('should track query performance for regression detection', async () => {
      const queries = [
        {
          name: 'simple_select',
          query: () => testSupabase.from('clients').select('*').limit(10)
        },
        {
          name: 'filtered_search',
          query: () => testSupabase.from('clients').select('*').eq('status', 'active').limit(10)
        },
        {
          name: 'text_search',
          query: () => testSupabase.from('clients').select('*').like('contact_info->email', '%@perftest.com').limit(10)
        }
      ];

      for (const { name, query } of queries) {
        const startTime = performance.now();
        const { error } = await query();
        const duration = performance.now() - startTime;

        expect(error).toBeNull();
        
        performanceLog[name] = duration;
        console.log(`${name}: ${duration.toFixed(2)}ms`);

        // Basic threshold check
        expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.SLOW);
      }
    });

    test('should detect performance improvements or regressions', () => {
      // This would compare against baseline performance metrics
      // In a real implementation, you'd load baseline metrics from a file or database
      
      const baselineMetrics = {
        simple_select: 100,
        filtered_search: 150,
        text_search: 300
      };

      Object.entries(performanceLog).forEach(([queryName, currentTime]) => {
        const baseline = baselineMetrics[queryName as keyof typeof baselineMetrics];
        if (baseline) {
          const change = ((currentTime - baseline) / baseline) * 100;
          
          console.log(`${queryName}: ${change > 0 ? '+' : ''}${change.toFixed(1)}% change from baseline`);
          
          // Warn if performance degraded by more than 50%
          if (change > 50) {
            console.warn(`Performance regression detected for ${queryName}: ${change.toFixed(1)}% slower`);
          }
          
          // Note if performance improved by more than 20%
          if (change < -20) {
            console.log(`Performance improvement detected for ${queryName}: ${Math.abs(change).toFixed(1)}% faster`);
          }
        }
      });
    });
  });

  afterAll(async () => {
    await cleanTestDatabase();
  });
});