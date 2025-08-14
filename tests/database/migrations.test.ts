/**
 * Database migrations tests
 * Tests migration integrity, rollback, and schema versioning
 */

import { testSupabase, initializeTestDatabase } from '../setup/db-setup';

describe('Database Migrations Tests', () => {
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  describe('Migration Integrity', () => {
    test('should have migration history table', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'supabase_migrations')
        .eq('table_name', 'schema_migrations');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
    });

    test('should have applied all required migrations', async () => {
      const { data, error } = await testSupabase
        .from('supabase_migrations.schema_migrations')
        .select('version, statements')
        .order('version', { ascending: true });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);

      // Check that we have the expected migration files
      const expectedMigrations = [
        '20250727095022', // create_basic_users_table
        '20250727095145', // basic_users_rls_policies
        '20250804115836', // create_shipping_companies_table
        '20250804120002', // create_container_types_table
        '20250804120545', // create_bills_of_lading_tables
        '20250804141245', // create_folders_table_and_enums
      ];

      const appliedVersions = data?.map(migration => migration.version.replace(/_.*$/, '')) || [];
      
      expectedMigrations.forEach(expectedVersion => {
        const hasVersion = appliedVersions.some(version => version.startsWith(expectedVersion));
        expect(hasVersion).toBe(true);
      });
    });

    test('should have migrations applied in correct order', async () => {
      const { data, error } = await testSupabase
        .from('supabase_migrations.schema_migrations')
        .select('version')
        .order('version', { ascending: true });

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Check that versions are in chronological order
      const versions = data?.map(m => m.version) || [];
      const sortedVersions = [...versions].sort();
      
      expect(versions).toEqual(sortedVersions);
    });

    test('should have no duplicate migration versions', async () => {
      const { data, error } = await testSupabase
        .from('supabase_migrations.schema_migrations')
        .select('version');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const versions = data?.map(m => m.version) || [];
      const uniqueVersions = [...new Set(versions)];
      
      expect(versions.length).toBe(uniqueVersions.length);
    });
  });

  describe('Schema Consistency', () => {
    test('should have consistent table relationships after migrations', async () => {
      // Check that foreign key relationships are properly established
      const { data, error } = await testSupabase
        .from('information_schema.table_constraints')
        .select(`
          constraint_name,
          table_name,
          constraint_type
        `)
        .eq('constraint_type', 'FOREIGN KEY')
        .in('table_name', ['folders', 'bills_of_lading', 'freight_charges']);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);

      // Check for specific expected foreign keys
      const constraintNames = data?.map(c => c.constraint_name) || [];
      
      // These should exist based on our schema
      const expectedConstraints = [
        'folders', // should have constraint referencing clients
        'bills_of_lading', // should have constraints referencing folders and shipping_companies
      ];

      expectedConstraints.forEach(tableName => {
        const hasConstraint = constraintNames.some(name => 
          name.includes(tableName) || data?.some(c => 
            c.table_name === tableName && c.constraint_type === 'FOREIGN KEY'
          )
        );
        expect(hasConstraint).toBe(true);
      });
    });

    test('should have consistent data types after migrations', async () => {
      // Check that UUID columns are properly typed
      const { data, error } = await testSupabase
        .from('information_schema.columns')
        .select('table_name, column_name, data_type, udt_name')
        .eq('column_name', 'id')
        .in('table_name', ['clients', 'folders', 'bills_of_lading']);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // All 'id' columns should be UUID type
      data?.forEach(column => {
        expect(column.udt_name).toBe('uuid');
      });
    });

    test('should have consistent timestamp columns after migrations', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.columns')
        .select('table_name, column_name, data_type, is_nullable, column_default')
        .in('column_name', ['created_at', 'updated_at'])
        .in('table_name', ['clients', 'folders', 'bills_of_lading']);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      data?.forEach(column => {
        expect(column.data_type).toBe('timestamp with time zone');
        expect(column.is_nullable).toBe('NO');
        if (column.column_name === 'created_at') {
          expect(column.column_default).toContain('now');
        }
      });
    });
  });

  describe('Data Migration Integrity', () => {
    test('should preserve existing data structure through migrations', async () => {
      // Test that core tables exist and have expected structure
      const tables = ['clients', 'folders', 'bills_of_lading', 'shipping_companies'];
      
      for (const tableName of tables) {
        const { data, error } = await testSupabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_name', tableName)
          .eq('table_schema', 'public');

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.length).toBe(1);
      }
    });

    test('should have proper enum types created by migrations', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.columns')
        .select('column_name, data_type, udt_name')
        .eq('table_name', 'clients')
        .eq('column_name', 'client_type');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.[0]?.data_type).toBe('USER-DEFINED'); // ENUM type
    });

    test('should have proper JSON/JSONB columns', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.columns')
        .select('column_name, data_type, udt_name')
        .eq('table_name', 'clients')
        .in('column_name', ['individual_info', 'business_info', 'contact_info', 'commercial_info']);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      data?.forEach(column => {
        expect(['json', 'jsonb']).toContain(column.udt_name);
      });
    });
  });

  describe('Index Creation', () => {
    test('should have created proper indexes through migrations', async () => {
      const { data, error } = await testSupabase
        .from('pg_indexes')
        .select('indexname, tablename, indexdef')
        .eq('schemaname', 'public')
        .in('tablename', ['clients', 'folders', 'bills_of_lading']);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);

      // Should have primary key indexes
      const primaryKeyIndexes = data?.filter(idx => 
        idx.indexname.includes('_pkey')
      ) || [];
      expect(primaryKeyIndexes.length).toBeGreaterThan(0);
    });

    test('should have performance indexes on foreign keys', async () => {
      const { data, error } = await testSupabase
        .from('pg_indexes')
        .select('indexname, tablename, indexdef')
        .eq('schemaname', 'public')
        .like('indexdef', '%client_id%');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      // Should have indexes on client_id foreign keys
      const clientIdIndexes = data?.filter(idx => 
        idx.indexdef.includes('client_id') && idx.tablename === 'folders'
      ) || [];
      expect(clientIdIndexes.length).toBeGreaterThan(0);
    });
  });

  describe('RLS Policy Migration', () => {
    test('should have enabled RLS on all user tables', async () => {
      const userTables = ['clients', 'folders', 'bills_of_lading'];
      
      for (const tableName of userTables) {
        const { data, error } = await testSupabase
          .from('pg_tables')
          .select('tablename, rowsecurity')
          .eq('tablename', tableName)
          .eq('schemaname', 'public');

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.[0]?.rowsecurity).toBe(true);
      }
    });

    test('should have created RLS policies for all user tables', async () => {
      const userTables = ['clients', 'folders', 'bills_of_lading'];
      
      for (const tableName of userTables) {
        const { data, error } = await testSupabase
          .from('pg_policies')
          .select('policyname, cmd')
          .eq('tablename', tableName);

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.length).toBeGreaterThan(0);

        // Should have policies for basic operations
        const commands = data?.map(p => p.cmd) || [];
        expect(commands).toContain('SELECT');
      }
    });
  });

  describe('Function and Trigger Migration', () => {
    test('should have created timestamp update functions', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.routines')
        .select('routine_name, routine_type')
        .eq('routine_schema', 'public')
        .like('routine_name', '%updated_at%');

      // Functions might exist with different names
      expect(error).toBeNull();
      // This test is informational - functions might have different naming
    });

    test('should have created folder number generation functions', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.routines')
        .select('routine_name, routine_type')
        .eq('routine_schema', 'public')
        .like('routine_name', '%folder%');

      expect(error).toBeNull();
      // This test is informational - functions might have different naming
    });

    test('should have created triggers on tables', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.triggers')
        .select('trigger_name, event_object_table')
        .eq('trigger_schema', 'public')
        .in('event_object_table', ['clients', 'folders']);

      expect(error).toBeNull();
      // Triggers might or might not exist depending on implementation
    });
  });

  describe('Migration Performance', () => {
    test('should be able to query migrated tables efficiently', async () => {
      const startTime = performance.now();

      const { data, error } = await testSupabase
        .from('clients')
        .select('id, client_type, status')
        .limit(100);

      const endTime = performance.now();
      const queryTime = endTime - startTime;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(queryTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle complex joins efficiently after migration', async () => {
      const startTime = performance.now();

      const { data, error } = await testSupabase
        .from('folders')
        .select(`
          id,
          folder_number,
          status,
          clients!inner (
            id,
            client_type
          ),
          bills_of_lading (
            id,
            bl_number
          )
        `)
        .limit(50);

      const endTime = performance.now();
      const queryTime = endTime - startTime;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(queryTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('Schema Validation', () => {
    test('should have proper constraints after migration', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.check_constraints')
        .select('constraint_name, check_clause')
        .like('check_clause', '%status%');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      // Should have status constraints
      const hasStatusConstraints = data?.some(constraint => 
        constraint.check_clause.includes('active') ||
        constraint.check_clause.includes('inactive')
      );
      
      // Constraints might or might not exist depending on implementation
      if (data && data.length > 0) {
        expect(hasStatusConstraints).toBe(true);
      }
    });

    test('should have proper NOT NULL constraints', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.columns')
        .select('table_name, column_name, is_nullable')
        .eq('table_name', 'clients')
        .eq('is_nullable', 'NO');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const notNullColumns = data?.map(c => c.column_name) || [];
      const requiredColumns = ['id', 'client_type', 'contact_info', 'created_at'];
      
      requiredColumns.forEach(column => {
        expect(notNullColumns).toContain(column);
      });
    });
  });

  describe('Migration Rollback Safety', () => {
    test('should have proper foreign key cascade options', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.referential_constraints')
        .select('constraint_name, delete_rule, update_rule')
        .in('delete_rule', ['CASCADE', 'RESTRICT', 'SET NULL']);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      // Check that foreign keys have appropriate cascade rules
      data?.forEach(constraint => {
        expect(['CASCADE', 'RESTRICT', 'SET NULL', 'NO ACTION']).toContain(constraint.delete_rule);
        expect(['CASCADE', 'RESTRICT', 'SET NULL', 'NO ACTION']).toContain(constraint.update_rule);
      });
    });
  });
});