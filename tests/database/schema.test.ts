/**
 * Database schema validation tests
 * Tests table structure, constraints, indexes, and relationships
 */

import { testSupabase, initializeTestDatabase } from '../setup/db-setup';

describe('Database Schema Tests', () => {
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  describe('Tables Structure', () => {
    test('should have clients table with correct columns', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'clients')
        .eq('table_schema', 'public');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const columns = data?.map(col => col.column_name) || [];
      const requiredColumns = [
        'id', 'client_type', 'individual_info', 'business_info',
        'contact_info', 'commercial_info', 'commercial_history',
        'status', 'tags', 'created_by', 'created_at', 'updated_at',
        'deleted_at', 'deleted_by', 'deletion_reason'
      ];

      requiredColumns.forEach(column => {
        expect(columns).toContain(column);
      });
    });

    test('should have folders table with correct columns', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'folders')
        .eq('table_schema', 'public');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const columns = data?.map(col => col.column_name) || [];
      const requiredColumns = [
        'id', 'folder_number', 'client_id', 'status', 
        'priority', 'created_by', 'created_at', 'updated_at'
      ];

      requiredColumns.forEach(column => {
        expect(columns).toContain(column);
      });
    });

    test('should have bills_of_lading table with correct columns', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'bills_of_lading')
        .eq('table_schema', 'public');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const columns = data?.map(col => col.column_name) || [];
      const requiredColumns = [
        'id', 'bl_number', 'shipping_company_id', 'folder_id',
        'status', 'created_at', 'updated_at'
      ];

      requiredColumns.forEach(column => {
        expect(columns).toContain(column);
      });
    });

    test('should have shipping_companies table with correct columns', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'shipping_companies')
        .eq('table_schema', 'public');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const columns = data?.map(col => col.column_name) || [];
      const requiredColumns = [
        'id', 'company_name', 'company_code', 'country',
        'is_active', 'created_at', 'updated_at'
      ];

      requiredColumns.forEach(column => {
        expect(columns).toContain(column);
      });
    });

    test('should have container_types table with correct columns', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'container_types')
        .eq('table_schema', 'public');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const columns = data?.map(col => col.column_name) || [];
      const requiredColumns = [
        'id', 'type_code', 'type_name', 'size_feet',
        'height_feet', 'is_active', 'created_at', 'updated_at'
      ];

      requiredColumns.forEach(column => {
        expect(columns).toContain(column);
      });
    });
  });

  describe('Primary Keys', () => {
    test('should have primary key on clients table', async () => {
      const { data, error } = await testSupabase
        .rpc('check_primary_key_constraint', { 
          table_name_param: 'clients' 
        });

      expect(error).toBeNull();
      expect(data).toBe(true);
    });

    test('should have primary key on folders table', async () => {
      const { data, error } = await testSupabase
        .rpc('check_primary_key_constraint', { 
          table_name_param: 'folders' 
        });

      expect(error).toBeNull();
      expect(data).toBe(true);
    });

    test('should have primary key on bills_of_lading table', async () => {
      const { data, error } = await testSupabase
        .rpc('check_primary_key_constraint', { 
          table_name_param: 'bills_of_lading' 
        });

      expect(error).toBeNull();
      expect(data).toBe(true);
    });
  });

  describe('Foreign Key Constraints', () => {
    test('folders should have foreign key to clients', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.table_constraints')
        .select('constraint_name, constraint_type')
        .eq('table_name', 'folders')
        .eq('constraint_type', 'FOREIGN KEY');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);

      const hasClientFk = data?.some(constraint => 
        constraint.constraint_name.includes('client')
      );
      expect(hasClientFk).toBe(true);
    });

    test('bills_of_lading should have foreign key to folders', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.table_constraints')
        .select('constraint_name, constraint_type')
        .eq('table_name', 'bills_of_lading')
        .eq('constraint_type', 'FOREIGN KEY');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);

      const hasFolderFk = data?.some(constraint => 
        constraint.constraint_name.includes('folder')
      );
      expect(hasFolderFk).toBe(true);
    });

    test('bills_of_lading should have foreign key to shipping_companies', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.table_constraints')
        .select('constraint_name, constraint_type')
        .eq('table_name', 'bills_of_lading')
        .eq('constraint_type', 'FOREIGN KEY');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      const hasShippingCompanyFk = data?.some(constraint => 
        constraint.constraint_name.includes('shipping_company')
      );
      expect(hasShippingCompanyFk).toBe(true);
    });
  });

  describe('Indexes', () => {
    test('should have indexes on frequently queried columns', async () => {
      const { data, error } = await testSupabase
        .from('pg_indexes')
        .select('indexname, tablename')
        .eq('schemaname', 'public');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const indexes = data?.map(idx => `${idx.tablename}.${idx.indexname}`) || [];
      
      // Check for important indexes
      const expectedIndexes = [
        'clients', // should have some indexes on clients table
        'folders', // should have some indexes on folders table
        'bills_of_lading' // should have some indexes on bills_of_lading table
      ];

      expectedIndexes.forEach(table => {
        const hasIndex = indexes.some(idx => idx.includes(table));
        expect(hasIndex).toBe(true);
      });
    });

    test('should have index on client_id in folders table', async () => {
      const { data, error } = await testSupabase
        .from('pg_indexes')
        .select('indexname')
        .eq('tablename', 'folders')
        .like('indexname', '%client_id%');

      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThan(0);
    });

    test('should have index on folder_id in bills_of_lading table', async () => {
      const { data, error } = await testSupabase
        .from('pg_indexes')
        .select('indexname')
        .eq('tablename', 'bills_of_lading')
        .like('indexname', '%folder_id%');

      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThan(0);
    });
  });

  describe('Check Constraints', () => {
    test('should have valid client_type values constraint', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.check_constraints')
        .select('constraint_name, check_clause')
        .like('check_clause', '%client_type%');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      const hasClientTypeConstraint = data?.some(constraint => 
        constraint.check_clause.includes('individual') &&
        constraint.check_clause.includes('business')
      );
      expect(hasClientTypeConstraint).toBe(true);
    });

    test('should have valid status values constraint', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.check_constraints')
        .select('constraint_name, check_clause')
        .like('check_clause', '%status%');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
    });
  });

  describe('Data Types', () => {
    test('should have correct data types for clients table', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.columns')
        .select('column_name, data_type, udt_name')
        .eq('table_name', 'clients')
        .eq('table_schema', 'public');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const columnTypes = data?.reduce((acc, col) => {
        acc[col.column_name] = col.data_type || col.udt_name;
        return acc;
      }, {} as Record<string, string>) || {};

      // Check specific column types
      expect(columnTypes.id).toBe('uuid');
      expect(columnTypes.client_type).toBe('USER-DEFINED'); // ENUM
      expect(['jsonb', 'json']).toContain(columnTypes.individual_info);
      expect(['jsonb', 'json']).toContain(columnTypes.business_info);
      expect(['jsonb', 'json']).toContain(columnTypes.contact_info);
      expect(columnTypes.created_at).toBe('timestamp with time zone');
      expect(columnTypes.updated_at).toBe('timestamp with time zone');
    });

    test('should have correct data types for folders table', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.columns')
        .select('column_name, data_type, udt_name')
        .eq('table_name', 'folders')
        .eq('table_schema', 'public');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const columnTypes = data?.reduce((acc, col) => {
        acc[col.column_name] = col.data_type || col.udt_name;
        return acc;
      }, {} as Record<string, string>) || {};

      expect(columnTypes.id).toBe('uuid');
      expect(columnTypes.client_id).toBe('uuid');
      expect(columnTypes.folder_number).toBe('character varying');
      expect(columnTypes.created_at).toBe('timestamp with time zone');
    });
  });

  describe('NOT NULL Constraints', () => {
    test('should have NOT NULL constraints on required columns', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.columns')
        .select('column_name, is_nullable')
        .eq('table_name', 'clients')
        .eq('table_schema', 'public')
        .eq('is_nullable', 'NO');

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const notNullColumns = data?.map(col => col.column_name) || [];
      const requiredNotNullColumns = [
        'id', 'client_type', 'contact_info', 'commercial_info',
        'status', 'created_by', 'created_at', 'updated_at'
      ];

      requiredNotNullColumns.forEach(column => {
        expect(notNullColumns).toContain(column);
      });
    });
  });

  describe('Default Values', () => {
    test('should have UUID default for id columns', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.columns')
        .select('column_name, column_default')
        .eq('table_name', 'clients')
        .eq('column_name', 'id');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.[0]?.column_default).toContain('gen_random_uuid');
    });

    test('should have current timestamp default for created_at', async () => {
      const { data, error } = await testSupabase
        .from('information_schema.columns')
        .select('column_name, column_default')
        .eq('table_name', 'clients')
        .eq('column_name', 'created_at');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.[0]?.column_default).toContain('now');
    });
  });
});