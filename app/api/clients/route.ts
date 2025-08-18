/**
 * Main clients API route - GET (list/search) and POST (create)
 * /api/clients
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ClientService, ClientSearchService, ClientValidationService } from '@/lib/services/clients';
import type { CreateClientData, ClientSearchParams } from '@/types/clients/operations';
import type { ApiResponse } from '@/types/shared';
import type { 
  ClientType, 
  ClientStatus, 
  CountryCode, 
  Industry, 
  ClientPriority, 
  LanguageCode,
  ClientSortField 
} from '@/types/clients/enums';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

/**
 * GET - List/search clients
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getClaims();
    
    if (authError || !authData?.claims) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        } as ApiResponse<null>,
        { status: 401, headers: corsHeaders }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    
    const params: ClientSearchParams = {
      search_term: searchParams.get('search') || undefined,
      client_types: searchParams.get('client_types')?.split(',').filter(Boolean) as ClientType[] || undefined,
      statuses: searchParams.get('statuses')?.split(',').filter(Boolean) as ClientStatus[] || undefined,
      countries: searchParams.get('countries')?.split(',').filter(Boolean) as CountryCode[] || undefined,
      industries: searchParams.get('industries')?.split(',').filter(Boolean) as Industry[] || undefined,
      priorities: searchParams.get('priorities')?.split(',').filter(Boolean) as ClientPriority[] || undefined,
      languages: searchParams.get('languages')?.split(',').filter(Boolean) as LanguageCode[] || undefined,
      sort_field: (searchParams.get('sort_field') as ClientSortField) || 'created_at',
      sort_direction: (searchParams.get('sort_direction') as 'asc' | 'desc') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      page_size: Math.min(parseInt(searchParams.get('page_size') || '50'), 100),
      include_deleted: searchParams.get('include_deleted') === 'true'
    };

    // Use search service for advanced search, or simple list for basic queries
    let result;
    if (params.search_term || params.filters || 
        params.client_types?.length || params.statuses?.length ||
        params.countries?.length || params.industries?.length) {
      result = await ClientSearchService.search(params);
    } else {
      // Simple list for basic pagination
      const basicResult = await ClientService.list({
        page: params.page,
        pageSize: params.page_size,
        status: params.statuses,
        clientTypes: params.client_types
      });
      
      // Convert to search result format
      result = {
        clients: basicResult.clients,
        total_count: basicResult.total,
        current_page: basicResult.page,
        page_size: basicResult.pageSize,
        total_pages: basicResult.totalPages,
        has_next_page: basicResult.page < basicResult.totalPages,
        has_previous_page: basicResult.page > 1
      };
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: `Found ${result.total_count} clients`
      } as ApiResponse<typeof result>,
      { 
        status: 200,
        headers: {
          ...corsHeaders,
          'X-Total-Count': result.total_count.toString(),
          'X-Page': result.current_page.toString(),
          'X-Page-Size': result.page_size.toString(),
          'X-Total-Pages': result.total_pages.toString()
        }
      }
    );

  } catch (error) {
    console.error('GET /api/clients error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      } as ApiResponse<null>,
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST - Create new client
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getClaims();
    
    if (authError || !authData?.claims) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        } as ApiResponse<null>,
        { status: 401, headers: corsHeaders }
      );
    }

    const userId = authData.claims.sub as string;

    // Parse request body
    let createData: CreateClientData;
    try {
      createData = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Invalid JSON in request body'
        } as ApiResponse<null>,
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate input data
    const validation = await ClientValidationService.validateCreate(createData, {
      check_email_uniqueness: true,
      check_siret_uniqueness: true,
      check_formats: true,
      check_business_rules: true
    });

    if (!validation.is_valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Client data validation failed',
          details: {
            errors: validation.errors,
            warnings: validation.warnings
          }
        } as ApiResponse<null>,
        { status: 422, headers: corsHeaders }
      );
    }

    // Create client
    const client = await ClientService.create(createData, userId);

    return NextResponse.json(
      {
        success: true,
        data: client,
        message: 'Client created successfully'
      } as ApiResponse<typeof client>,
      { 
        status: 201,
        headers: {
          ...corsHeaders,
          'Location': `/api/clients/${client.id}`
        }
      }
    );

  } catch (error) {
    console.error('POST /api/clients error:', error);
    
    // Handle specific known errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Conflict',
            message: 'Client with this email or SIRET already exists'
          } as ApiResponse<null>,
          { status: 409, headers: corsHeaders }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      } as ApiResponse<null>,
      { status: 500, headers: corsHeaders }
    );
  }
}