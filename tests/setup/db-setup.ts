/**
 * Database setup for tests
 * Handles test database initialization, migrations, and cleanup
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const testSupabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Initialize test database
 * Run migrations and seed test data
 */
export async function initializeTestDatabase() {
  console.log('🔧 Initializing test database...');

  try {
    // Check if database is accessible
    const { data, error } = await testSupabase
      .from('clients')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }

    console.log('✅ Test database connected successfully');
    console.log(`📊 Current clients count: ${data?.length || 0}`);

    return true;
  } catch (error) {
    console.error('❌ Failed to initialize test database:', error);
    throw error;
  }
}

/**
 * Clean test database
 * Remove all test data but keep schema
 */
export async function cleanTestDatabase() {
  console.log('🧹 Cleaning test database...');

  try {
    // Delete test data in correct order (respecting foreign keys)
    const tables = [
      'folders',
      'bills_of_lading', 
      'freight_charges',
      'clients',
    ];

    for (const table of tables) {
      const { error } = await testSupabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except system records

      if (error && !error.message.includes('does not exist')) {
        console.warn(`⚠️  Warning cleaning ${table}:`, error.message);
      }
    }

    console.log('✅ Test database cleaned successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to clean test database:', error);
    throw error;
  }
}

/**
 * Seed test data
 * Insert test clients, folders, and other test entities
 */
export async function seedTestData() {
  console.log('🌱 Seeding test data...');

  try {
    // Clean first
    await cleanTestDatabase();

    // Seed test clients
    const testClients = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        client_type: 'individual',
        individual_info: {
          first_name: 'Test',
          last_name: 'Individual',
          date_of_birth: '1990-01-01',
          profession: 'Software Developer'
        },
        contact_info: {
          email: 'test.individual@example.com',
          phone: '+33123456789',
          address: {
            address_line1: '123 Test Street',
            city: 'Paris',
            postal_code: '75001',
            country: 'FR'
          }
        },
        commercial_info: {
          credit_limit: 10000,
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
        tags: ['test', 'individual'],
        created_by: '550e8400-e29b-41d4-a716-446655440000',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        deleted_by: null,
        deletion_reason: null
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        client_type: 'business',
        business_info: {
          company_name: 'Test Business Corp',
          industry: 'information_technology',
          business_description: 'Test business for integration tests',
          employee_count: 100,
          contacts: [
            {
              first_name: 'John',
              last_name: 'Doe',
              title: 'CEO',
              contact_type: 'primary',
              is_primary: true,
              is_active: true,
              contact_info: {
                email: 'john.doe@testbusiness.com',
                phone: '+33987654321'
              }
            }
          ],
          legal_info: {
            siret: '12345678901234',
            vat_number: 'FR12345678901'
          }
        },
        contact_info: {
          email: 'contact@testbusiness.com',
          phone: '+33123456789',
          website: 'https://testbusiness.com',
          address: {
            address_line1: '456 Business Ave',
            city: 'Lyon',
            postal_code: '69000',
            country: 'FR'
          }
        },
        commercial_info: {
          credit_limit: 100000,
          credit_limit_currency: 'EUR',
          payment_terms_days: 45,
          payment_terms: 'net_45',
          payment_methods: ['bank_transfer', 'check'],
          preferred_language: 'fr',
          priority: 'high',
          risk_level: 'medium'
        },
        commercial_history: {
          total_orders_amount: 50000,
          total_orders_count: 10,
          current_balance: 5000,
          average_payment_delay_days: 5
        },
        status: 'active',
        tags: ['test', 'business', 'technology'],
        created_by: '550e8400-e29b-41d4-a716-446655440000',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        deleted_by: null,
        deletion_reason: null
      }
    ];

    const { error: clientsError } = await testSupabase
      .from('clients')
      .insert(testClients);

    if (clientsError) {
      throw clientsError;
    }

    console.log('✅ Test data seeded successfully');
    console.log(`📊 Seeded ${testClients.length} test clients`);

    return {
      clients: testClients,
    };
  } catch (error) {
    console.error('❌ Failed to seed test data:', error);
    throw error;
  }
}

/**
 * Get test client by type
 */
export function getTestClient(type: 'individual' | 'business') {
  const clients = {
    individual: '550e8400-e29b-41d4-a716-446655440001',
    business: '550e8400-e29b-41d4-a716-446655440002'
  };
  return clients[type];
}

// Run database setup if called directly
if (require.main === module) {
  (async () => {
    try {
      await initializeTestDatabase();
      await seedTestData();
      console.log('🚀 Test database setup completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('💥 Test database setup failed:', error);
      process.exit(1);
    }
  })();
}