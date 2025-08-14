/**
 * Test Cleanup Utilities
 * Provides comprehensive cleanup functions for test data and resources
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { DatabaseTestUtils } from './test-utilities';

/**
 * Cleanup configuration options
 */
interface CleanupOptions {
  deleteTestData?: boolean;
  resetSequences?: boolean;
  clearCache?: boolean;
  forceGC?: boolean;
  preserveTables?: string[];
  batchSize?: number;
}

/**
 * Table cleanup priorities (higher number = cleaned first)
 */
const CLEANUP_PRIORITIES: { [tableName: string]: number } = {
  // Dependent tables first
  'folder_alerts': 100,
  'bl_containers': 100,
  'freight_charges': 100,
  'container_arrivals': 100,
  
  // Main entity tables
  'folders': 50,
  'bills_of_lading': 50,
  'clients': 50,
  'shipping_companies': 50,
  
  // Reference tables last
  'users': 10,
  'audit_logs': 10
};

/**
 * Main cleanup class
 */
export class TestCleanup {
  private dbUtils: DatabaseTestUtils;
  
  constructor(private supabase: SupabaseClient) {
    this.dbUtils = new DatabaseTestUtils(supabase);
  }

  /**
   * Performs comprehensive cleanup of all test data
   */
  async cleanupAll(options: CleanupOptions = {}): Promise<void> {
    const {
      deleteTestData = true,
      resetSequences = true,
      clearCache = true,
      forceGC = true,
      preserveTables = [],
      batchSize = 1000
    } = options;

    console.log('Starting comprehensive test cleanup...');

    try {
      if (deleteTestData) {
        await this.cleanupTestData(preserveTables, batchSize);
      }

      if (resetSequences) {
        await this.resetDatabaseSequences();
      }

      if (clearCache) {
        await this.clearApplicationCache();
      }

      if (forceGC) {
        this.forceGarbageCollection();
      }

      console.log('Test cleanup completed successfully');
    } catch (error) {
      console.error('Test cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Cleans up test data from database tables
   */
  async cleanupTestData(preserveTables: string[] = [], batchSize: number = 1000): Promise<void> {
    console.log('Cleaning up test data from database...');

    // Get all tables that might contain test data
    const testDataTables = await this.getTestDataTables();
    
    // Filter out preserved tables
    const tablesToClean = testDataTables.filter(table => !preserveTables.includes(table));
    
    // Sort by cleanup priority
    tablesToClean.sort((a, b) => {
      const priorityA = CLEANUP_PRIORITIES[a] || 25;
      const priorityB = CLEANUP_PRIORITIES[b] || 25;
      return priorityB - priorityA; // Descending order
    });

    // Clean each table
    for (const table of tablesToClean) {
      await this.cleanupTable(table, batchSize);
    }
  }

  /**
   * Cleans up a specific table
   */
  async cleanupTable(tableName: string, batchSize: number = 1000): Promise<void> {
    console.log(`Cleaning table: ${tableName}`);

    try {
      // First try to delete test data by common test identifiers
      await this.cleanupTestDataByIdentifiers(tableName);
      
      // Then clean up any remaining test data in batches
      await this.cleanupTableInBatches(tableName, batchSize);
      
      console.log(`✓ Cleaned table: ${tableName}`);
    } catch (error) {
      console.warn(`Warning: Could not clean table ${tableName}:`, error);
      // Continue with other tables even if one fails
    }
  }

  /**
   * Cleans test data by common test identifiers
   */
  private async cleanupTestDataByIdentifiers(tableName: string): Promise<void> {
    const testIdentifiers = [
      // Email patterns
      { column: 'contact_info->email', pattern: '%test%' },
      { column: 'email', pattern: '%test%' },
      { column: 'contact_info->email', pattern: '%@test.com' },
      { column: 'email', pattern: '%@test.com' },
      
      // Common test patterns in different fields
      { column: 'description', pattern: '%test%' },
      { column: 'notes', pattern: '%test%' },
      { column: 'processing_notes', pattern: '%test%' },
      { column: 'cargo_description', pattern: '%test%' },
      
      // Test tags
      { column: 'tags', contains: ['test'] },
      { column: 'tags', contains: ['automated'] },
      { column: 'tags', contains: ['performance'] },
      
      // Test metadata
      { column: 'metadata->test_data', value: true },
      { column: 'metadata->test_bl', value: true },
      { column: 'metadata->test_container', value: true },
      { column: 'metadata->test_company', value: true },
      
      // Specific test patterns
      { column: 'bl_number', pattern: 'TST%' },
      { column: 'bl_number', pattern: 'DFT%' },
      { column: 'bl_number', pattern: 'PERF%' },
      { column: 'folder_number', pattern: 'FOL-%' },
      { column: 'container_number', pattern: 'TSTU%' },
      
      // Test company codes
      { column: 'code', pattern: 'TSL%' },
      { column: 'scac_code', pattern: 'TSLU%' },
    ];

    for (const identifier of testIdentifiers) {
      try {
        if (await this.dbUtils.columnExists(tableName, identifier.column.split('->')[0])) {
          let query = this.supabase.from(tableName);

          if (identifier.pattern) {
            query = query.delete().ilike(identifier.column, identifier.pattern);
          } else if (identifier.contains) {
            query = query.delete().contains(identifier.column, identifier.contains);
          } else if (identifier.value !== undefined) {
            query = query.delete().eq(identifier.column, identifier.value);
          } else {
            continue;
          }

          const { error } = await query;
          if (error && !error.message.includes('column') && !error.message.includes('does not exist')) {
            throw error;
          }
        }
      } catch (error) {
        // Continue with other identifiers if one fails
        console.debug(`Could not clean ${tableName} by ${identifier.column}:`, error);
      }
    }
  }

  /**
   * Cleans up table data in batches
   */
  private async cleanupTableInBatches(tableName: string, batchSize: number): Promise<void> {
    let hasMoreData = true;
    let cleanedCount = 0;

    while (hasMoreData) {
      try {
        // Get a batch of potentially test data
        const { data, error } = await this.supabase
          .from(tableName)
          .select('id')
          .limit(batchSize);

        if (error) {
          console.debug(`No more data to clean in ${tableName}:`, error.message);
          break;
        }

        if (!data || data.length === 0) {
          hasMoreData = false;
          break;
        }

        // For safety, only delete data that looks like test data
        const testDataIds = data
          .filter(row => this.isLikelyTestData(row))
          .map(row => row.id);

        if (testDataIds.length > 0) {
          const { error: deleteError } = await this.supabase
            .from(tableName)
            .delete()
            .in('id', testDataIds);

          if (deleteError) {
            console.debug(`Could not batch delete from ${tableName}:`, deleteError.message);
            hasMoreData = false;
          } else {
            cleanedCount += testDataIds.length;
          }
        }

        // If we got less than batchSize, we're done
        if (data.length < batchSize) {
          hasMoreData = false;
        }

      } catch (error) {
        console.debug(`Batch cleanup error for ${tableName}:`, error);
        hasMoreData = false;
      }
    }

    if (cleanedCount > 0) {
      console.log(`  Cleaned ${cleanedCount} records from ${tableName}`);
    }
  }

  /**
   * Determines if a row is likely test data based on common patterns
   */
  private isLikelyTestData(row: any): boolean {
    const rowString = JSON.stringify(row).toLowerCase();
    
    const testPatterns = [
      'test',
      'perftest',
      'unittest',
      'integration',
      'automated',
      'mock',
      'fixture',
      'dummy',
      '@test.com',
      'tst',
      'perf',
      'batch'
    ];

    return testPatterns.some(pattern => rowString.includes(pattern));
  }

  /**
   * Gets list of tables that might contain test data
   */
  private async getTestDataTables(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .neq('table_name', 'schema_migrations');

    if (error) {
      console.warn('Could not get table list:', error);
      return Object.keys(CLEANUP_PRIORITIES);
    }

    return data?.map(table => table.table_name) || [];
  }

  /**
   * Resets database sequences to avoid ID conflicts
   */
  async resetDatabaseSequences(): Promise<void> {
    console.log('Resetting database sequences...');

    try {
      // Get all sequences in the public schema
      const { data: sequences, error } = await this.supabase
        .from('information_schema.sequences')
        .select('sequence_name')
        .eq('sequence_schema', 'public');

      if (error) {
        console.warn('Could not get sequences list:', error);
        return;
      }

      // Reset each sequence
      for (const seq of sequences || []) {
        try {
          await this.dbUtils.executeRawSQL(`ALTER SEQUENCE ${seq.sequence_name} RESTART WITH 1;`);
        } catch (error) {
          console.debug(`Could not reset sequence ${seq.sequence_name}:`, error);
        }
      }

      console.log('✓ Database sequences reset');
    } catch (error) {
      console.warn('Could not reset sequences:', error);
    }
  }

  /**
   * Clears application cache and temporary data
   */
  async clearApplicationCache(): Promise<void> {
    console.log('Clearing application cache...');

    try {
      // Clear any in-memory caches (implementation specific)
      if (global.testCache) {
        global.testCache.clear();
      }

      // Clear temporary files
      await this.clearTemporaryFiles();

      // Clear environment variables that might affect tests
      this.clearTestEnvironmentVariables();

      console.log('✓ Application cache cleared');
    } catch (error) {
      console.warn('Could not clear application cache:', error);
    }
  }

  /**
   * Clears temporary files created during testing
   */
  private async clearTemporaryFiles(): Promise<void> {
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');

    try {
      const tempDirs = [
        './tmp',
        './temp',
        './test-output',
        './coverage/.nyc_output',
        './playwright-report'
      ];

      for (const tempDir of tempDirs) {
        try {
          await fs.access(tempDir);
          await fs.rmdir(tempDir, { recursive: true });
          console.log(`  Cleared temporary directory: ${tempDir}`);
        } catch {
          // Directory doesn't exist or can't be removed
        }
      }
    } catch (error) {
      console.debug('Could not clear temporary files:', error);
    }
  }

  /**
   * Clears test-specific environment variables
   */
  private clearTestEnvironmentVariables(): void {
    const testEnvVars = [
      'TEST_MODE',
      'RUNNING_TESTS',
      'JEST_WORKER_ID',
      'NODE_ENV'
    ];

    testEnvVars.forEach(envVar => {
      if (process.env[envVar] && process.env[envVar]?.includes('test')) {
        delete process.env[envVar];
      }
    });
  }

  /**
   * Forces garbage collection to free memory
   */
  forceGarbageCollection(): void {
    console.log('Forcing garbage collection...');

    try {
      if (global.gc) {
        // Run GC multiple times to ensure thorough cleanup
        global.gc();
        global.gc();
        console.log('✓ Garbage collection completed');
      } else {
        console.log('ℹ Garbage collection not available (run with --expose-gc for manual GC)');
      }
    } catch (error) {
      console.warn('Could not force garbage collection:', error);
    }
  }

  /**
   * Cleans up specific client test data
   */
  async cleanupClientTestData(): Promise<void> {
    console.log('Cleaning up client test data...');

    const clientTestPatterns = [
      '%@test.com',
      '%@example.com',
      '%@perftest.com',
      '%@validationtest.com',
      '%@searchtest.com',
      '%@batchtest.com',
      '%@servicetest.com',
      '%@integrationtest.com'
    ];

    for (const pattern of clientTestPatterns) {
      try {
        const { error } = await this.supabase
          .from('clients')
          .delete()
          .ilike('contact_info->email', pattern);

        if (error && !error.message.includes('No rows')) {
          console.debug(`Could not clean client pattern ${pattern}:`, error);
        }
      } catch (error) {
        console.debug(`Error cleaning client pattern ${pattern}:`, error);
      }
    }
  }

  /**
   * Cleans up specific folder test data
   */
  async cleanupFolderTestData(): Promise<void> {
    console.log('Cleaning up folder test data...');

    const folderTestPatterns = [
      'FOL-%',
      'TEST-%',
      'PERF-%',
      'BATCH-%'
    ];

    for (const pattern of folderTestPatterns) {
      try {
        const { error } = await this.supabase
          .from('folders')
          .delete()
          .ilike('folder_number', pattern);

        if (error && !error.message.includes('No rows')) {
          console.debug(`Could not clean folder pattern ${pattern}:`, error);
        }
      } catch (error) {
        console.debug(`Error cleaning folder pattern ${pattern}:`, error);
      }
    }
  }

  /**
   * Cleans up specific BL test data
   */
  async cleanupBillOfLadingTestData(): Promise<void> {
    console.log('Cleaning up Bill of Lading test data...');

    const blTestPatterns = [
      'TST%',
      'DFT%',
      'PERF%',
      'BATCH%',
      'CMP%',
      'CSS%'
    ];

    for (const pattern of blTestPatterns) {
      try {
        const { error } = await this.supabase
          .from('bills_of_lading')
          .delete()
          .ilike('bl_number', pattern);

        if (error && !error.message.includes('No rows')) {
          console.debug(`Could not clean BL pattern ${pattern}:`, error);
        }
      } catch (error) {
        console.debug(`Error cleaning BL pattern ${pattern}:`, error);
      }
    }
  }

  /**
   * Emergency cleanup - removes ALL test data aggressively
   */
  async emergencyCleanup(): Promise<void> {
    console.log('🚨 Performing emergency cleanup - removing ALL potential test data...');

    try {
      // Clean up all tables in order
      const tables = [
        'folder_alerts',
        'bl_containers',
        'freight_charges',
        'container_arrivals',
        'folders',
        'bills_of_lading',
        'clients',
        'shipping_companies'
      ];

      for (const table of tables) {
        try {
          // Delete anything that looks remotely like test data
          const { error } = await this.supabase
            .from(table)
            .delete()
            .or('metadata->>test_data.eq.true,metadata->>test_bl.eq.true,metadata->>test_container.eq.true,metadata->>test_company.eq.true');

          if (error && !error.message.includes('No rows')) {
            console.debug(`Emergency cleanup error for ${table}:`, error);
          }
        } catch (error) {
          console.debug(`Emergency cleanup failed for ${table}:`, error);
        }
      }

      // Force reset sequences
      await this.resetDatabaseSequences();

      // Force garbage collection
      this.forceGarbageCollection();

      console.log('✓ Emergency cleanup completed');
    } catch (error) {
      console.error('Emergency cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Verifies cleanup was successful
   */
  async verifyCleanup(): Promise<boolean> {
    console.log('Verifying cleanup...');

    try {
      const tables = ['clients', 'folders', 'bills_of_lading', 'shipping_companies'];
      let hasTestData = false;

      for (const table of tables) {
        const testDataCount = await this.dbUtils.getTableCount(table, {
          'metadata->>test_data': 'true'
        });

        if (testDataCount > 0) {
          console.warn(`Warning: ${testDataCount} test records still exist in ${table}`);
          hasTestData = true;
        }
      }

      if (!hasTestData) {
        console.log('✓ Cleanup verification passed');
        return true;
      } else {
        console.warn('⚠ Cleanup verification failed - test data still exists');
        return false;
      }
    } catch (error) {
      console.error('Cleanup verification error:', error);
      return false;
    }
  }
}

/**
 * Global cleanup utilities
 */
export const GlobalCleanup = {
  /**
   * Cleans up after all tests
   */
  async afterAllTests(supabase: SupabaseClient, options: CleanupOptions = {}): Promise<void> {
    const cleanup = new TestCleanup(supabase);
    await cleanup.cleanupAll(options);
  },

  /**
   * Quick cleanup between tests
   */
  async betweenTests(supabase: SupabaseClient): Promise<void> {
    const cleanup = new TestCleanup(supabase);
    await cleanup.cleanupClientTestData();
    await cleanup.cleanupFolderTestData();
    await cleanup.cleanupBillOfLadingTestData();
  },

  /**
   * Emergency cleanup when tests fail
   */
  async emergency(supabase: SupabaseClient): Promise<void> {
    const cleanup = new TestCleanup(supabase);
    await cleanup.emergencyCleanup();
  }
};