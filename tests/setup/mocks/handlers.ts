/**
 * Mock Service Worker (MSW) handlers
 * Mocks API endpoints for testing
 */

import { http, HttpResponse } from 'msw';
import type { Client, ClientSummary, ClientDetail } from '@/types/clients/core';
import { mockClients, mockClientDetail } from './fixtures/clients';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export const handlers = [
  // Client API handlers
  http.get(`${API_BASE}/clients`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '50');
    const search = url.searchParams.get('search') || '';
    const clientTypes = url.searchParams.getAll('client_types');
    
    let filteredClients = mockClients;
    
    // Apply search filter
    if (search) {
      filteredClients = filteredClients.filter(client => 
        client.display_name.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply client type filter
    if (clientTypes.length > 0) {
      filteredClients = filteredClients.filter(client => 
        clientTypes.includes(client.client_type)
      );
    }
    
    // Pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedClients = filteredClients.slice(start, end);
    
    return HttpResponse.json({
      success: true,
      data: {
        clients: paginatedClients,
        total_count: filteredClients.length,
        page,
        page_size: pageSize,
        total_pages: Math.ceil(filteredClients.length / pageSize)
      }
    });
  }),

  http.get(`${API_BASE}/clients/:id`, ({ params }) => {
    const { id } = params;
    const detailed = new URL(location.href).searchParams.get('detailed') === 'true';
    
    if (detailed) {
      const detail = mockClientDetail.find(d => d.client.id === id);
      if (!detail) {
        return HttpResponse.json(
          { success: false, message: 'Client not found' },
          { status: 404 }
        );
      }
      return HttpResponse.json({ success: true, data: detail });
    }
    
    const client = mockClients.find(c => c.id === id);
    if (!client) {
      return HttpResponse.json(
        { success: false, message: 'Client not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({ success: true, data: client });
  }),

  http.post(`${API_BASE}/clients`, async ({ request }) => {
    const data = await request.json() as any;
    
    // Mock client creation
    const newClient: ClientSummary = {
      id: `mock-${Date.now()}`,
      client_type: data.client_type,
      status: 'active',
      display_name: data.client_type === 'individual' 
        ? `${data.individual_info?.first_name} ${data.individual_info?.last_name}`
        : data.business_info?.company_name,
      email: data.contact_info?.email,
      phone: data.contact_info?.phone,
      city: data.contact_info?.address?.city,
      country: data.contact_info?.address?.country || 'FR',
      credit_limit: data.commercial_info?.credit_limit || 0,
      credit_limit_currency: data.commercial_info?.credit_limit_currency || 'EUR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return HttpResponse.json(
      { success: true, data: newClient },
      { status: 201 }
    );
  }),

  http.put(`${API_BASE}/clients/:id`, async ({ params, request }) => {
    const { id } = params;
    const data = await request.json() as any;
    
    const client = mockClients.find(c => c.id === id);
    if (!client) {
      return HttpResponse.json(
        { success: false, message: 'Client not found' },
        { status: 404 }
      );
    }
    
    // Mock update
    const updatedClient = {
      ...client,
      ...data,
      updated_at: new Date().toISOString()
    };
    
    return HttpResponse.json({ success: true, data: updatedClient });
  }),

  http.delete(`${API_BASE}/clients/:id`, ({ params }) => {
    const { id } = params;
    
    const client = mockClients.find(c => c.id === id);
    if (!client) {
      return HttpResponse.json(
        { success: false, message: 'Client not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: {
        success: true,
        deletion_type: 'soft',
        affected_folders_count: 0,
        folder_actions: [],
        deleted_at: new Date().toISOString()
      }
    });
  }),

  // Client contacts endpoints
  http.post(`${API_BASE}/clients/:id/contacts`, async ({ params, request }) => {
    const { id } = params;
    const contactData = await request.json() as any;
    
    return HttpResponse.json({
      success: true,
      data: {
        contact: {
          ...contactData,
          id: `contact-${Date.now()}`,
        },
        contact_index: 1
      }
    }, { status: 201 });
  }),

  http.put(`${API_BASE}/clients/:id/contacts/:contactId`, async ({ params, request }) => {
    const { id, contactId } = params;
    const contactData = await request.json() as any;
    
    return HttpResponse.json({
      success: true,
      data: {
        contact: {
          ...contactData,
          id: contactId,
        }
      }
    });
  }),

  http.delete(`${API_BASE}/clients/:id/contacts/:contactId`, ({ params }) => {
    const { id, contactId } = params;
    
    return HttpResponse.json({
      success: true,
      data: { success: true }
    });
  }),

  // Client statistics
  http.get(`${API_BASE}/clients/:id/statistics`, ({ params }) => {
    const { id } = params;
    
    return HttpResponse.json({
      success: true,
      data: {
        client_id: id,
        total_folders: 5,
        folders_by_status: {
          active: 3,
          completed: 2
        },
        total_revenue: 25000,
        revenue_currency: 'EUR',
        average_payment_delay: 3,
        calculated_at: new Date().toISOString(),
        period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: new Date().toISOString()
      }
    });
  }),

  // Client validation
  http.post(`${API_BASE}/clients/validate`, async ({ request }) => {
    const { data, operation_type } = await request.json() as any;
    
    const errors = [];
    
    // Mock validation logic
    if (!data.contact_info?.email || !data.contact_info.email.includes('@')) {
      errors.push({
        field: 'contact_info.email',
        message: 'Email is required and must be valid',
        severity: 'error'
      });
    }
    
    if (data.client_type === 'individual' && !data.individual_info?.first_name) {
      errors.push({
        field: 'individual_info.first_name',
        message: 'First name is required for individual clients',
        severity: 'error'
      });
    }
    
    if (errors.length > 0) {
      return HttpResponse.json({
        success: false,
        data: {
          valid: false,
          errors,
          warnings: []
        }
      }, { status: 422 });
    }
    
    return HttpResponse.json({
      success: true,
      data: {
        valid: true,
        errors: [],
        warnings: []
      }
    });
  }),

  // Batch operations
  http.post(`${API_BASE}/clients/batch`, async ({ request }) => {
    const { operation, client_ids, data } = await request.json() as any;
    
    return HttpResponse.json({
      success: true,
      data: {
        processed_count: client_ids?.length || 0,
        success_count: client_ids?.length || 0,
        error_count: 0,
        results: client_ids?.map((id: string) => ({ id, success: true })) || []
      }
    });
  }),

  // Export endpoint
  http.get(`${API_BASE}/clients/export`, ({ request }) => {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'csv';
    
    const csvData = `ID,Type,Name,Email,Status
mock-1,individual,John Doe,john@example.com,active
mock-2,business,Test Corp,contact@testcorp.com,active`;
    
    return new Response(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="clients.csv"'
      }
    });
  }),

  // Import endpoint
  http.post(`${API_BASE}/clients/import`, async ({ request }) => {
    // Mock successful import
    return HttpResponse.json({
      success: true,
      data: {
        imported_count: 2,
        skipped_count: 0,
        error_count: 0,
        errors: []
      }
    });
  }),
];