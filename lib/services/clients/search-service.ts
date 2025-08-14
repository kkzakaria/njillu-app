/**
 * Client search service - Advanced search and filtering
 * Handles complex search queries, filters, and faceted search
 */

import { createClient as createSupabaseClient } from '@/lib/supabase/server';
import type { ClientSearchParams, ClientSearchResults } from '@/types/clients/operations';
import type { ClientSummary, getClientDisplayName } from '@/types/clients/core';
import type { CountryCode, Industry, ClientType, ClientStatus } from '@/types/clients/enums';

export class ClientSearchService {
  /**
   * Advanced client search with filters and facets
   */
  static async search(params: ClientSearchParams): Promise<ClientSearchResults> {
    const supabase = await createSupabaseClient();
    
    const page = params.page || 1;
    const pageSize = Math.min(params.page_size || 50, 100);
    const offset = (page - 1) * pageSize;

    // Build base query
    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' });

    // Apply soft delete filter
    if (!params.include_deleted) {
      query = query.is('deleted_at', null);
    }

    // Apply basic filters
    if (params.client_types?.length) {
      query = query.in('client_type', params.client_types);
    }

    if (params.statuses?.length) {
      query = query.in('status', params.statuses);
    }

    if (params.countries?.length) {
      query = query.in('contact_info->address->country', params.countries);
    }

    if (params.priorities?.length) {
      query = query.in('commercial_info->priority', params.priorities);
    }

    if (params.languages?.length) {
      query = query.in('commercial_info->preferred_language', params.languages);
    }

    // Apply industry filter (for business clients only)
    if (params.industries?.length) {
      query = query
        .eq('client_type', 'business')
        .in('business_info->industry', params.industries);
    }

    // Apply text search
    if (params.search_term) {
      const searchTerm = `%${params.search_term.toLowerCase()}%`;
      query = query.or(
        `individual_info->first_name.ilike.${searchTerm},` +
        `individual_info->last_name.ilike.${searchTerm},` +
        `business_info->company_name.ilike.${searchTerm},` +
        `contact_info->email.ilike.${searchTerm},` +
        `internal_notes.ilike.${searchTerm},` +
        `tags.cs.{${params.search_term.toLowerCase()}}`
      );
    }

    // Apply advanced filters
    if (params.filters) {
      query = this.applyFilterGroup(query, params.filters);
    }

    // Apply sorting
    const sortField = params.sort_field || 'created_at';
    const sortDirection = params.sort_direction || 'desc';
    
    // Map sort fields to actual database columns
    const sortMapping: Record<string, string> = {
      'display_name': 'individual_info->last_name', // Default, will handle in application layer
      'email': 'contact_info->email',
      'client_type': 'client_type',
      'status': 'status',
      'country': 'contact_info->address->country',
      'city': 'contact_info->address->city',
      'credit_limit': 'commercial_info->credit_limit',
      'payment_terms_days': 'commercial_info->payment_terms_days',
      'created_at': 'created_at',
      'updated_at': 'updated_at'
    };

    const dbSortField = sortMapping[sortField] || 'created_at';
    query = query.order(dbSortField, { ascending: sortDirection === 'asc' });

    // Execute query with pagination
    const { data: clients, error, count } = await query
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(`Search failed: ${error.message}`);
    }

    // Convert to ClientSummary format
    const clientSummaries: ClientSummary[] = (clients || []).map(client => ({
      id: client.id,
      client_type: client.client_type,
      status: client.status,
      display_name: getClientDisplayName(client),
      email: client.contact_info.email,
      phone: client.contact_info.phone,
      city: client.contact_info.address?.city,
      country: client.contact_info.address?.country || 'FR',
      credit_limit: client.commercial_info.credit_limit,
      credit_limit_currency: client.commercial_info.credit_limit_currency,
      created_at: client.created_at,
      updated_at: client.updated_at
    }));

    // Sort by display name if requested (since we can't do this in SQL easily)
    if (sortField === 'display_name') {
      clientSummaries.sort((a, b) => {
        const comparison = a.display_name.localeCompare(b.display_name);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    // Generate facets if requested
    let facets;
    if (params.search_term || params.filters) {
      facets = await this.generateFacets(params);
    }

    return {
      clients: clientSummaries,
      total_count: total,
      current_page: page,
      page_size: pageSize,
      total_pages: totalPages,
      has_next_page: page < totalPages,
      has_previous_page: page > 1,
      facets
    };
  }

  /**
   * Apply filter group to query
   */
  private static applyFilterGroup(query: any, filterGroup: any): any {
    // This is a simplified implementation
    // In a real application, you'd want more sophisticated filter application
    for (const filter of filterGroup.filters || []) {
      const { field, operator, value } = filter;
      
      switch (operator) {
        case 'equals':
          query = query.eq(field, value);
          break;
        case 'not_equals':
          query = query.neq(field, value);
          break;
        case 'contains':
          query = query.ilike(field, `%${value}%`);
          break;
        case 'starts_with':
          query = query.ilike(field, `${value}%`);
          break;
        case 'in':
          query = query.in(field, Array.isArray(value) ? value : [value]);
          break;
        case 'greater_than':
          query = query.gt(field, value);
          break;
        case 'less_than':
          query = query.lt(field, value);
          break;
        case 'is_null':
          query = query.is(field, null);
          break;
        case 'is_not_null':
          query = query.not(field, 'is', null);
          break;
      }
    }

    return query;
  }

  /**
   * Generate search facets
   */
  private static async generateFacets(params: ClientSearchParams): Promise<{
    client_types: Record<ClientType, number>;
    statuses: Record<ClientStatus, number>;
    countries: Record<CountryCode, number>;
    industries: Record<Industry, number>;
  }> {
    const supabase = await createSupabaseClient();

    // Get all clients matching the search criteria (without pagination)
    let query = supabase
      .from('clients')
      .select('client_type, status, contact_info, business_info');

    if (!params.include_deleted) {
      query = query.is('deleted_at', null);
    }

    if (params.search_term) {
      const searchTerm = `%${params.search_term.toLowerCase()}%`;
      query = query.or(
        `individual_info->first_name.ilike.${searchTerm},` +
        `individual_info->last_name.ilike.${searchTerm},` +
        `business_info->company_name.ilike.${searchTerm},` +
        `contact_info->email.ilike.${searchTerm}`
      );
    }

    const { data: clients } = await query;

    // Count facets
    const clientTypes: Record<string, number> = {};
    const statuses: Record<string, number> = {};
    const countries: Record<string, number> = {};
    const industries: Record<string, number> = {};

    clients?.forEach(client => {
      // Client types
      clientTypes[client.client_type] = (clientTypes[client.client_type] || 0) + 1;
      
      // Statuses
      statuses[client.status] = (statuses[client.status] || 0) + 1;
      
      // Countries
      const country = client.contact_info?.address?.country || 'OTHER';
      countries[country] = (countries[country] || 0) + 1;
      
      // Industries (for business clients)
      if (client.client_type === 'business' && client.business_info?.industry) {
        const industry = client.business_info.industry;
        industries[industry] = (industries[industry] || 0) + 1;
      }
    });

    return {
      client_types: clientTypes as Record<ClientType, number>,
      statuses: statuses as Record<ClientStatus, number>,
      countries: countries as Record<CountryCode, number>,
      industries: industries as Record<Industry, number>
    };
  }

  /**
   * Get search suggestions for autocomplete
   */
  static async getSuggestions(term: string, limit: number = 10): Promise<string[]> {
    const supabase = await createSupabaseClient();
    
    const searchTerm = `${term.toLowerCase()}%`;
    
    const { data: suggestions } = await supabase
      .from('clients')
      .select('individual_info, business_info, contact_info')
      .is('deleted_at', null)
      .or(
        `individual_info->first_name.ilike.${searchTerm},` +
        `individual_info->last_name.ilike.${searchTerm},` +
        `business_info->company_name.ilike.${searchTerm},` +
        `contact_info->email.ilike.${searchTerm}`
      )
      .limit(limit);

    const results: Set<string> = new Set();

    suggestions?.forEach(client => {
      if (client.individual_info) {
        const firstName = client.individual_info.first_name;
        const lastName = client.individual_info.last_name;
        if (firstName?.toLowerCase().startsWith(term.toLowerCase())) {
          results.add(firstName);
        }
        if (lastName?.toLowerCase().startsWith(term.toLowerCase())) {
          results.add(lastName);
        }
        results.add(`${firstName} ${lastName}`.trim());
      }
      
      if (client.business_info?.company_name?.toLowerCase().startsWith(term.toLowerCase())) {
        results.add(client.business_info.company_name);
      }
      
      if (client.contact_info?.email?.toLowerCase().startsWith(term.toLowerCase())) {
        results.add(client.contact_info.email);
      }
    });

    return Array.from(results).slice(0, limit);
  }
}