/**
 * API mocking utilities for E2E tests
 */

import { Page, Route } from '@playwright/test';

export interface MockApiData {
  billsOfLading?: any[];
  folders?: any[];
  containerArrivals?: any[];
  users?: any[];
  settings?: any;
}

/**
 * Mock all API responses with test data
 */
export async function mockApiResponses(page: Page, data: MockApiData) {
  // Mock Bills of Lading API
  if (data.billsOfLading) {
    await mockBillsOfLadingApi(page, data.billsOfLading);
  }
  
  // Mock Folders API
  if (data.folders) {
    await mockFoldersApi(page, data.folders);
  }
  
  // Mock Container Arrivals API
  if (data.containerArrivals) {
    await mockContainerArrivalsApi(page, data.containerArrivals);
  }
  
  // Mock authentication API
  await mockAuthApi(page);
  
  // Mock common API endpoints
  await mockCommonApi(page);
}

/**
 * Mock Bills of Lading API endpoints
 */
export async function mockBillsOfLadingApi(page: Page, bills: any[]) {
  // List endpoint
  await page.route('**/api/v1/bills_of_lading**', async (route) => {
    const url = new URL(route.request().url());
    const query = url.searchParams.get('query') || '';
    const page_num = parseInt(url.searchParams.get('page') || '1');
    const per_page = parseInt(url.searchParams.get('per_page') || '20');
    const status = url.searchParams.get('filters[status]');
    const priority = url.searchParams.get('filters[priority]');
    
    // Filter bills based on query parameters
    let filteredBills = bills;
    
    if (query) {
      filteredBills = bills.filter(bill => 
        bill.reference.toLowerCase().includes(query.toLowerCase()) ||
        bill.vessel.toLowerCase().includes(query.toLowerCase()) ||
        bill.route.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (status) {
      filteredBills = filteredBills.filter(bill => bill.status === status);
    }
    
    if (priority) {
      filteredBills = filteredBills.filter(bill => bill.priority === priority);
    }
    
    // Paginate results
    const start = (page_num - 1) * per_page;
    const end = start + per_page;
    const paginatedBills = filteredBills.slice(start, end);
    
    const response = {
      data: paginatedBills,
      total: filteredBills.length,
      page: page_num,
      per_page,
      total_pages: Math.ceil(filteredBills.length / per_page),
      has_next: end < filteredBills.length,
      has_previous: page_num > 1,
    };
    
    await route.fulfill({
      status: 200,
      json: response,
    });
  });
  
  // Detail endpoint
  await page.route('**/api/v1/bills_of_lading/*', async (route) => {
    const url = route.request().url();
    const id = url.split('/').pop();
    const bill = bills.find(b => b.id === id);
    
    if (bill) {
      // Add detailed information for detail view
      const detailBill = {
        ...bill,
        containers: [
          {
            id: `${id}-CONT-1`,
            number: 'TEMU1234567',
            type: '20GP',
            seal: 'ABC123',
            weight: 18500,
            description: 'General Cargo',
          }
        ],
        parties: {
          shipper: {
            name: bill.shipper || 'Test Shipper Co.',
            address: '123 Shipper Street, Shanghai, China',
            contact: 'shipper@test.com',
          },
          consignee: {
            name: bill.consignee || 'Test Consignee Ltd.',
            address: '456 Consignee Ave, Le Havre, France',
            contact: 'consignee@test.com',
          },
        },
        activities: [
          {
            id: '1',
            type: 'status_change',
            description: `Status changed to ${bill.status}`,
            timestamp: new Date().toISOString(),
            user: 'System',
          },
          {
            id: '2',
            type: 'document_upload',
            description: 'Bill of Lading document uploaded',
            timestamp: new Date(Date.now() - 60000).toISOString(),
            user: 'Test User',
          },
        ],
      };
      
      await route.fulfill({
        status: 200,
        json: detailBill,
      });
    } else {
      await route.fulfill({
        status: 404,
        json: { error: 'Bill of Lading not found' },
      });
    }
  });
}

/**
 * Mock Folders API endpoints
 */
export async function mockFoldersApi(page: Page, folders: any[]) {
  // List endpoint
  await page.route('**/api/v1/folders**', async (route) => {
    const url = new URL(route.request().url());
    const query = url.searchParams.get('query') || '';
    const page_num = parseInt(url.searchParams.get('page') || '1');
    const per_page = parseInt(url.searchParams.get('per_page') || '20');
    const status = url.searchParams.get('filters[status]');
    
    let filteredFolders = folders;
    
    if (query) {
      filteredFolders = folders.filter(folder => 
        folder.reference.toLowerCase().includes(query.toLowerCase()) ||
        folder.title.toLowerCase().includes(query.toLowerCase()) ||
        folder.client.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (status) {
      filteredFolders = filteredFolders.filter(folder => folder.status === status);
    }
    
    const start = (page_num - 1) * per_page;
    const end = start + per_page;
    const paginatedFolders = filteredFolders.slice(start, end);
    
    await route.fulfill({
      status: 200,
      json: {
        data: paginatedFolders,
        total: filteredFolders.length,
        page: page_num,
        per_page,
        total_pages: Math.ceil(filteredFolders.length / per_page),
        has_next: end < filteredFolders.length,
        has_previous: page_num > 1,
      },
    });
  });
  
  // Detail endpoint
  await page.route('**/api/v1/folders/*', async (route) => {
    const url = route.request().url();
    const id = url.split('/').pop();
    const folder = folders.find(f => f.id === id);
    
    if (folder) {
      const detailFolder = {
        ...folder,
        documents: [
          {
            id: '1',
            name: 'Import Declaration.pdf',
            type: 'application/pdf',
            size: 2048576,
            uploaded_at: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Invoice.pdf',
            type: 'application/pdf',
            size: 1024768,
            uploaded_at: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
        alerts: [
          {
            id: '1',
            type: 'delay_risk',
            severity: 'medium',
            message: 'Potential customs delay detected',
            created_at: new Date().toISOString(),
          },
        ],
        activities: [
          {
            id: '1',
            type: 'stage_change',
            description: `Processing stage changed to ${folder.processing_stage}`,
            timestamp: new Date().toISOString(),
            user: 'System',
          },
        ],
      };
      
      await route.fulfill({
        status: 200,
        json: detailFolder,
      });
    } else {
      await route.fulfill({
        status: 404,
        json: { error: 'Folder not found' },
      });
    }
  });
}

/**
 * Mock Container Arrivals API endpoints
 */
export async function mockContainerArrivalsApi(page: Page, arrivals: any[]) {
  // List endpoint
  await page.route('**/api/v1/container_arrivals**', async (route) => {
    const url = new URL(route.request().url());
    const query = url.searchParams.get('query') || '';
    const page_num = parseInt(url.searchParams.get('page') || '1');
    const per_page = parseInt(url.searchParams.get('per_page') || '20');
    const urgency = url.searchParams.get('filters[urgency_level]');
    
    let filteredArrivals = arrivals;
    
    if (query) {
      filteredArrivals = arrivals.filter(arrival => 
        arrival.container_number.toLowerCase().includes(query.toLowerCase()) ||
        arrival.vessel.toLowerCase().includes(query.toLowerCase()) ||
        arrival.port.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (urgency) {
      filteredArrivals = filteredArrivals.filter(arrival => arrival.urgency_level === urgency);
    }
    
    const start = (page_num - 1) * per_page;
    const end = start + per_page;
    const paginatedArrivals = filteredArrivals.slice(start, end);
    
    await route.fulfill({
      status: 200,
      json: {
        data: paginatedArrivals,
        total: filteredArrivals.length,
        page: page_num,
        per_page,
        total_pages: Math.ceil(filteredArrivals.length / per_page),
        has_next: end < filteredArrivals.length,
        has_previous: page_num > 1,
      },
    });
  });
  
  // Detail endpoint
  await page.route('**/api/v1/container_arrivals/*', async (route) => {
    const url = route.request().url();
    const id = url.split('/').pop();
    const arrival = arrivals.find(a => a.id === id);
    
    if (arrival) {
      const detailArrival = {
        ...arrival,
        tracking_history: [
          {
            id: '1',
            status: 'discharged',
            location: arrival.port,
            timestamp: new Date().toISOString(),
            description: 'Container discharged from vessel',
          },
          {
            id: '2',
            status: 'arrived',
            location: arrival.port,
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            description: 'Vessel arrived at port',
          },
        ],
        charges: [
          {
            id: '1',
            type: 'demurrage',
            amount: 150.00,
            currency: 'EUR',
            daily_rate: 50.00,
            days_accrued: 3,
          },
        ],
      };
      
      await route.fulfill({
        status: 200,
        json: detailArrival,
      });
    } else {
      await route.fulfill({
        status: 404,
        json: { error: 'Container arrival not found' },
      });
    }
  });
}

/**
 * Mock authentication API endpoints
 */
export async function mockAuthApi(page: Page) {
  await page.route('**/auth/user', async (route) => {
    await route.fulfill({
      status: 200,
      json: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          permissions: ['read', 'write'],
        },
      },
    });
  });
  
  await page.route('**/auth/login', async (route) => {
    const body = route.request().postDataJSON();
    
    if (body.email === 'test@example.com' && body.password === 'correct') {
      await route.fulfill({
        status: 200,
        json: {
          token: 'mock-jwt-token',
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            role: 'user',
          },
        },
      });
    } else {
      await route.fulfill({
        status: 401,
        json: { error: 'Invalid credentials' },
      });
    }
  });
}

/**
 * Mock common API endpoints
 */
export async function mockCommonApi(page: Page) {
  // Mock configuration endpoints
  await page.route('**/api/config/**', async (route) => {
    await route.fulfill({
      status: 200,
      json: {
        app_name: 'NJILLU Test',
        version: '1.0.0',
        features: {
          list_detail: true,
          real_time_updates: true,
          bulk_operations: true,
        },
      },
    });
  });
  
  // Mock health check
  await page.route('**/api/health', async (route) => {
    await route.fulfill({
      status: 200,
      json: { status: 'ok', timestamp: new Date().toISOString() },
    });
  });
}

/**
 * Mock error responses for testing error handling
 */
export async function mockApiErrors(page: Page, errorType: 'network' | 'server' | 'timeout' = 'server') {
  const handler = async (route: Route) => {
    switch (errorType) {
      case 'network':
        await route.abort('connectionrefused');
        break;
      case 'server':
        await route.fulfill({
          status: 500,
          json: { error: 'Internal server error' },
        });
        break;
      case 'timeout':
        // Delay response indefinitely to simulate timeout
        await new Promise(() => {}); // Never resolves
        break;
    }
  };
  
  await page.route('**/api/v1/**', handler);
}

/**
 * Mock slow API responses for testing loading states
 */
export async function mockSlowApi(page: Page, delay: number = 2000) {
  await page.route('**/api/v1/**', async (route) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    await route.continue();
  });
}

/**
 * Create realistic test data
 */
export const testDataFactory = {
  billOfLading: (id: string, overrides: any = {}) => ({
    id,
    reference: `BL-${id}`,
    vessel: `Test Vessel ${id}`,
    voyage: `TV${id}E`,
    route: 'Test Port A to Test Port B',
    shipper: 'Test Shipper Co.',
    consignee: 'Test Consignee Ltd.',
    port_of_loading: 'Test Port A',
    port_of_discharge: 'Test Port B',
    etd: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    eta: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: ['draft', 'active', 'completed', 'cancelled'][Math.floor(Math.random() * 4)],
    priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),
  
  folder: (id: string, overrides: any = {}) => ({
    id,
    reference: `FOL-${id}`,
    title: `Import Declaration ${id}`,
    client: `Test Client ${id}`,
    status: ['pending', 'in_progress', 'completed', 'archived'][Math.floor(Math.random() * 4)],
    priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    processing_stage: ['document_review', 'customs_clearance', 'final_approval'][Math.floor(Math.random() * 3)],
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),
  
  containerArrival: (id: string, overrides: any = {}) => ({
    id,
    container_number: `TEST${id.padStart(7, '0')}`,
    vessel: `Test Vessel ${id}`,
    voyage: `TV${id}E`,
    port: 'Test Port',
    terminal: `Terminal ${String.fromCharCode(65 + parseInt(id) % 26)}`,
    arrival_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    demurrage_start: new Date(Date.now() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: ['arrived', 'discharged', 'cleared', 'picked_up'][Math.floor(Math.random() * 4)],
    urgency_level: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
    days_remaining: Math.floor(Math.random() * 14),
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),
  
  generateBatch: (type: 'billOfLading' | 'folder' | 'containerArrival', count: number) => {
    return Array.from({ length: count }, (_, i) => {
      const id = String(i + 1).padStart(3, '0');
      return testDataFactory[type](id);
    });
  },
};