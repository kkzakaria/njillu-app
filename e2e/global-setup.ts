import { chromium, FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test setup...');

  // Set up test database if using Supabase
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('📊 Setting up test data...');
    
    // Clean up any existing test data
    await supabase.from('bills_of_lading').delete().like('reference', 'TEST-%');
    await supabase.from('folders').delete().like('reference', 'TEST-%');
    await supabase.from('container_arrivals').delete().like('container_number', 'TEST%');

    // Insert test data for Bills of Lading
    const { error: blError } = await supabase.from('bills_of_lading').insert([
      {
        reference: 'TEST-BL-001',
        vessel_name: 'TEST VESSEL ONE',
        voyage_number: 'TV001E',
        shipper_name: 'Test Shipper Ltd',
        consignee_name: 'Test Consignee Corp',
        port_of_loading: 'Test Port A',
        port_of_discharge: 'Test Port B',
        etd: new Date('2025-01-15').toISOString(),
        eta: new Date('2025-02-15').toISOString(),
        status: 'in_transit',
        priority: 'high',
      },
      {
        reference: 'TEST-BL-002',
        vessel_name: 'TEST VESSEL TWO',
        voyage_number: 'TV002E',
        shipper_name: 'Another Test Shipper',
        consignee_name: 'Another Test Consignee',
        port_of_loading: 'Test Port C',
        port_of_discharge: 'Test Port D',
        etd: new Date('2025-01-20').toISOString(),
        eta: new Date('2025-02-20').toISOString(),
        status: 'loaded',
        priority: 'medium',
      },
    ]);

    if (blError) {
      console.warn('⚠️ Could not insert test BL data:', blError.message);
    }

    // Insert test data for Folders
    const { error: folderError } = await supabase.from('folders').insert([
      {
        reference: 'TEST-FOL-001',
        title: 'Test Import Declaration 001',
        client_name: 'Test Client One',
        client_code: 'TC001',
        status: 'in_progress',
        priority: 'high',
        processing_stage: 'customs_clearance',
      },
      {
        reference: 'TEST-FOL-002', 
        title: 'Test Import Declaration 002',
        client_name: 'Test Client Two',
        client_code: 'TC002',
        status: 'pending',
        priority: 'medium',
        processing_stage: 'document_review',
      },
    ]);

    if (folderError) {
      console.warn('⚠️ Could not insert test folder data:', folderError.message);
    }

    // Insert test data for Container Arrivals
    const { error: containerError } = await supabase.from('container_arrivals').insert([
      {
        container_number: 'TEST1234567',
        vessel_name: 'TEST VESSEL ONE',
        voyage_number: 'TV001E',
        arrival_date: new Date().toISOString(),
        demurrage_start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        port: 'Test Port',
        terminal: 'Test Terminal A',
        status: 'arrived',
        urgency_level: 'high',
      },
      {
        container_number: 'TEST2345678',
        vessel_name: 'TEST VESSEL TWO', 
        voyage_number: 'TV002E',
        arrival_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        demurrage_start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        port: 'Test Port',
        terminal: 'Test Terminal B',
        status: 'discharged',
        urgency_level: 'medium',
      },
    ]);

    if (containerError) {
      console.warn('⚠️ Could not insert test container data:', containerError.message);
    }

    console.log('✅ Test data setup completed');
  }

  // Launch browser for authentication setup if needed
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Set up authentication state if needed
  if (process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD) {
    console.log('🔐 Setting up authentication state...');
    
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', process.env.TEST_USER_EMAIL);
    await page.fill('[data-testid="password-input"]', process.env.TEST_USER_PASSWORD);
    await page.click('[data-testid="login-button"]');
    
    // Wait for successful login
    await page.waitForURL('/protected', { timeout: 10000 });
    
    // Save authentication state
    await context.storageState({ path: './e2e/auth-state.json' });
    console.log('✅ Authentication state saved');
  }

  await browser.close();
  console.log('🎉 E2E test setup completed successfully!');
}

export default globalSetup;