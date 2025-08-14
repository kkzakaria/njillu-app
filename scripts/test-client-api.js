/**
 * Simple test script for Client API endpoints
 * Run with: node scripts/test-client-api.js
 */

const BASE_URL = 'http://localhost:3000/api/clients';

// Test data
const testIndividualClient = {
  client_type: 'individual',
  individual_info: {
    first_name: 'Jean',
    last_name: 'Dupont',
    date_of_birth: '1985-03-15',
    profession: 'Ingénieur'
  },
  contact_info: {
    email: 'jean.dupont@example.com',
    phone: '+33 1 23 45 67 89',
    address: {
      address_line1: '123 Rue de la Paix',
      city: 'Paris',
      postal_code: '75001',
      country: 'FR'
    }
  },
  commercial_info: {
    credit_limit: 5000,
    credit_limit_currency: 'EUR',
    payment_terms_days: 30,
    payment_terms: 'net_30',
    payment_methods: ['bank_transfer'],
    preferred_language: 'fr',
    priority: 'normal',
    risk_level: 'low'
  },
  tags: ['vip', 'engineer']
};

const testBusinessClient = {
  client_type: 'business',
  business_info: {
    company_name: 'Tech Solutions SARL',
    industry: 'information_technology',
    business_description: 'Solutions informatiques pour entreprises',
    employee_count: 50,
    contacts: [
      {
        first_name: 'Marie',
        last_name: 'Martin',
        title: 'Directrice Commerciale',
        contact_type: 'primary',
        is_primary: true,
        is_active: true,
        contact_info: {
          email: 'marie.martin@techsolutions.fr',
          phone: '+33 1 98 76 54 32'
        }
      }
    ],
    legal_info: {
      siret: '12345678901234',
      vat_number: 'FR12345678901'
    }
  },
  contact_info: {
    email: 'contact@techsolutions.fr',
    phone: '+33 1 23 45 67 89',
    website: 'https://techsolutions.fr',
    address: {
      address_line1: '456 Avenue des Champs',
      city: 'Lyon',
      postal_code: '69000',
      country: 'FR'
    }
  },
  commercial_info: {
    credit_limit: 50000,
    credit_limit_currency: 'EUR',
    payment_terms_days: 45,
    payment_terms: 'net_45',
    payment_methods: ['bank_transfer', 'check'],
    preferred_language: 'fr',
    priority: 'high',
    risk_level: 'medium'
  },
  tags: ['technology', 'corporate']
};

/**
 * Make HTTP request with error handling
 */
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    
    return {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      data
    };
  } catch (error) {
    console.error(`Request failed: ${error.message}`);
    return {
      status: 0,
      statusText: 'Network Error',
      ok: false,
      error: error.message
    };
  }
}

/**
 * Test suite runner
 */
async function runTests() {
  console.log('🧪 Testing Client API Endpoints');
  console.log('================================\n');

  let createdIndividualId = null;
  let createdBusinessId = null;

  // Test 1: Create Individual Client
  console.log('📝 Test 1: Create Individual Client');
  const createIndividualResult = await makeRequest(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(testIndividualClient)
  });
  
  if (createIndividualResult.ok) {
    createdIndividualId = createIndividualResult.data.data?.id;
    console.log('✅ Individual client created successfully');
    console.log(`   ID: ${createdIndividualId}`);
  } else {
    console.log('❌ Failed to create individual client');
    console.log(`   Status: ${createIndividualResult.status}`);
    console.log(`   Error: ${createIndividualResult.data?.message || createIndividualResult.error}`);
  }
  console.log('');

  // Test 2: Create Business Client  
  console.log('📝 Test 2: Create Business Client');
  const createBusinessResult = await makeRequest(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(testBusinessClient)
  });
  
  if (createBusinessResult.ok) {
    createdBusinessId = createBusinessResult.data.data?.id;
    console.log('✅ Business client created successfully');
    console.log(`   ID: ${createdBusinessId}`);
  } else {
    console.log('❌ Failed to create business client');
    console.log(`   Status: ${createBusinessResult.status}`);
    console.log(`   Error: ${createBusinessResult.data?.message || createBusinessResult.error}`);
  }
  console.log('');

  // Test 3: Get Client List
  console.log('📝 Test 3: Get Client List');
  const listResult = await makeRequest(`${BASE_URL}?page=1&page_size=10`);
  
  if (listResult.ok) {
    const clientCount = listResult.data.data?.total_count || 0;
    console.log('✅ Client list retrieved successfully');
    console.log(`   Total clients: ${clientCount}`);
  } else {
    console.log('❌ Failed to get client list');
    console.log(`   Status: ${listResult.status}`);
    console.log(`   Error: ${listResult.data?.message || listResult.error}`);
  }
  console.log('');

  // Test 4: Get Individual Client by ID
  if (createdIndividualId) {
    console.log('📝 Test 4: Get Individual Client by ID');
    const getIndividualResult = await makeRequest(`${BASE_URL}/${createdIndividualId}`);
    
    if (getIndividualResult.ok) {
      console.log('✅ Individual client retrieved successfully');
      const client = getIndividualResult.data.data;
      console.log(`   Name: ${client.individual_info?.first_name} ${client.individual_info?.last_name}`);
      console.log(`   Email: ${client.contact_info?.email}`);
    } else {
      console.log('❌ Failed to get individual client');
      console.log(`   Status: ${getIndividualResult.status}`);
      console.log(`   Error: ${getIndividualResult.data?.message || getIndividualResult.error}`);
    }
    console.log('');
  }

  // Test 5: Get Business Client Detail
  if (createdBusinessId) {
    console.log('📝 Test 5: Get Business Client Detail');
    const getBusinessResult = await makeRequest(`${BASE_URL}/${createdBusinessId}?detailed=true`);
    
    if (getBusinessResult.ok) {
      console.log('✅ Business client detail retrieved successfully');
      const detail = getBusinessResult.data.data;
      console.log(`   Company: ${detail.client?.business_info?.company_name}`);
      console.log(`   Display Name: ${detail.display_info?.display_name}`);
      console.log(`   Total Folders: ${detail.total_folders}`);
    } else {
      console.log('❌ Failed to get business client detail');
      console.log(`   Status: ${getBusinessResult.status}`);
      console.log(`   Error: ${getBusinessResult.data?.message || getBusinessResult.error}`);
    }
    console.log('');
  }

  // Test 6: Update Individual Client
  if (createdIndividualId) {
    console.log('📝 Test 6: Update Individual Client');
    const updateData = {
      individual_info: {
        profession: 'Senior Software Engineer'
      },
      tags: ['vip', 'engineer', 'senior']
    };
    
    const updateResult = await makeRequest(`${BASE_URL}/${createdIndividualId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    
    if (updateResult.ok) {
      console.log('✅ Individual client updated successfully');
      const client = updateResult.data.data;
      console.log(`   New profession: ${client.individual_info?.profession}`);
      console.log(`   Tags: ${client.tags?.join(', ')}`);
    } else {
      console.log('❌ Failed to update individual client');
      console.log(`   Status: ${updateResult.status}`);
      console.log(`   Error: ${updateResult.data?.message || updateResult.error}`);
    }
    console.log('');
  }

  // Test 7: Add Contact to Business Client
  if (createdBusinessId) {
    console.log('📝 Test 7: Add Contact to Business Client');
    const newContact = {
      first_name: 'Pierre',
      last_name: 'Durand',
      title: 'Directeur Technique',
      contact_type: 'technical',
      is_primary: false,
      is_active: true,
      contact_info: {
        email: 'pierre.durand@techsolutions.fr',
        phone: '+33 1 11 22 33 44'
      }
    };
    
    const addContactResult = await makeRequest(`${BASE_URL}/${createdBusinessId}/contacts`, {
      method: 'POST',
      body: JSON.stringify(newContact)
    });
    
    if (addContactResult.ok) {
      console.log('✅ Contact added successfully');
      const result = addContactResult.data.data;
      console.log(`   Contact: ${result.contact.first_name} ${result.contact.last_name}`);
      console.log(`   Index: ${result.contact_index}`);
    } else {
      console.log('❌ Failed to add contact');
      console.log(`   Status: ${addContactResult.status}`);
      console.log(`   Error: ${addContactResult.data?.message || addContactResult.error}`);
    }
    console.log('');
  }

  // Test 8: Validate Client Data
  console.log('📝 Test 8: Validate Client Data');
  const invalidClientData = {
    client_type: 'individual',
    individual_info: {
      first_name: '', // Invalid: empty name
      last_name: 'Test'
    },
    contact_info: {
      email: 'invalid-email' // Invalid: bad email format
    }
  };
  
  const validateResult = await makeRequest(`${BASE_URL}/validate`, {
    method: 'POST',
    body: JSON.stringify({
      data: invalidClientData,
      operation_type: 'create'
    })
  });
  
  if (validateResult.status === 422) {
    console.log('✅ Validation correctly identified errors');
    const validation = validateResult.data.data;
    console.log(`   Errors found: ${validation.errors?.length || 0}`);
    validation.errors?.forEach(error => {
      console.log(`   - ${error.field}: ${error.message}`);
    });
  } else {
    console.log('❌ Validation test failed');
    console.log(`   Status: ${validateResult.status}`);
    console.log(`   Expected: 422 with validation errors`);
  }
  console.log('');

  // Test 9: Search Clients
  console.log('📝 Test 9: Search Clients');
  const searchResult = await makeRequest(`${BASE_URL}?search=jean&client_types=individual`);
  
  if (searchResult.ok) {
    console.log('✅ Client search successful');
    const results = searchResult.data.data;
    console.log(`   Found: ${results.total_count} clients`);
    if (results.clients?.length > 0) {
      console.log(`   First result: ${results.clients[0].display_name}`);
    }
  } else {
    console.log('❌ Failed to search clients');
    console.log(`   Status: ${searchResult.status}`);
    console.log(`   Error: ${searchResult.data?.message || searchResult.error}`);
  }
  console.log('');

  // Test 10: Get Client Statistics
  if (createdBusinessId) {
    console.log('📝 Test 10: Get Client Statistics');
    const statsResult = await makeRequest(`${BASE_URL}/${createdBusinessId}/statistics`);
    
    if (statsResult.ok) {
      console.log('✅ Client statistics retrieved successfully');
      const stats = statsResult.data.data;
      console.log(`   Total folders: ${stats.total_folders}`);
      console.log(`   Total revenue: ${stats.total_revenue} ${stats.revenue_currency}`);
    } else {
      console.log('❌ Failed to get client statistics');
      console.log(`   Status: ${statsResult.status}`);
      console.log(`   Error: ${statsResult.data?.message || statsResult.error}`);
    }
    console.log('');
  }

  console.log('🏁 Test suite completed!');
  console.log('================================');

  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`   Individual Client ID: ${createdIndividualId || 'Not created'}`);
  console.log(`   Business Client ID: ${createdBusinessId || 'Not created'}`);
  
  if (createdIndividualId || createdBusinessId) {
    console.log('\n⚠️  Note: Test clients were created in the database.');
    console.log('   You may want to clean them up manually if needed.');
  }
}

// Run the tests
runTests().catch(console.error);