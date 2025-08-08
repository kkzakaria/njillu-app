import { FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test teardown...');

  // Clean up test data from database
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('🗑️ Cleaning up test data...');

    // Clean up test data
    await supabase.from('bills_of_lading').delete().like('reference', 'TEST-%');
    await supabase.from('folders').delete().like('reference', 'TEST-%');
    await supabase.from('container_arrivals').delete().like('container_number', 'TEST%');

    console.log('✅ Test data cleanup completed');
  }

  // Clean up authentication state file
  const authStatePath = './e2e/auth-state.json';
  if (fs.existsSync(authStatePath)) {
    fs.unlinkSync(authStatePath);
    console.log('🔐 Authentication state cleaned up');
  }

  console.log('🎉 E2E test teardown completed successfully!');
}

export default globalTeardown;