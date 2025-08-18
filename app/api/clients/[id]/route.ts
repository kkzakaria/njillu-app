/**
 * Individual client API route - GET, PUT, DELETE
 * /api/clients/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ClientService, ClientValidationService } from '@/lib/services/clients';
import type { UpdateClientData, DeleteClientParams } from '@/types/clients/operations';
import type { ApiResponse } from '@/types/shared';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

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
 * GET - Get client details
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
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

    const { id: clientId } = await params;
    if (!clientId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Client ID is required'
        } as ApiResponse<null>,
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if detailed view is requested
    const searchParams = request.nextUrl.searchParams;
    const detailed = searchParams.get('detailed') === 'true';

    let result;
    if (detailed) {
      result = await ClientService.getDetail(clientId);
    } else {
      result = await ClientService.getById(clientId);
    }

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Client not found'
        } as ApiResponse<null>,
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: 'Client retrieved successfully'
      } as ApiResponse<typeof result>,
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error(`GET /api/clients/${clientId} error:`, error);
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
 * PUT - Update client
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
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

    const { id: clientId } = await params;
    if (!clientId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Client ID is required'
        } as ApiResponse<null>,
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if client exists
    const existingClient = await ClientService.getById(clientId);
    if (!existingClient) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Client not found'
        } as ApiResponse<null>,
        { status: 404, headers: corsHeaders }
      );
    }

    // Parse request body
    let updateData: UpdateClientData;
    try {
      updateData = await request.json();
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

    // Validate update data
    const validation = await ClientValidationService.validateUpdate(
      clientId,
      updateData,
      {
        check_email_uniqueness: true,
        check_siret_uniqueness: true,
        check_formats: true,
        check_business_rules: true
      }
    );

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

    // Get version for optimistic concurrency control
    const version = parseInt(request.headers.get('If-Match') || '0');

    // Update client
    const updatedClient = await ClientService.update({
      client_id: clientId,
      data: updateData,
      version: version || undefined
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedClient,
        message: 'Client updated successfully'
      } as ApiResponse<typeof updatedClient>,
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error(`PUT /api/clients/${clientId} error:`, error);
    
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
      
      if (error.message.includes('version')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Conflict',
            message: 'Client has been modified by another user. Please refresh and try again.'
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

/**
 * DELETE - Soft delete client
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
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

    const { id: clientId } = await params;
    if (!clientId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Client ID is required'
        } as ApiResponse<null>,
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if client exists
    const existingClient = await ClientService.getById(clientId);
    if (!existingClient) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Client not found'
        } as ApiResponse<null>,
        { status: 404, headers: corsHeaders }
      );
    }

    // Parse query parameters for deletion options
    const searchParams = request.nextUrl.searchParams;
    const deleteParams: DeleteClientParams = {
      client_id: clientId,
      deletion_type: (searchParams.get('type') as 'soft' | 'hard') || 'soft',
      reason: searchParams.get('reason') || undefined,
      force: searchParams.get('force') === 'true',
      handle_folders: (searchParams.get('handle_folders') as any) || 'keep',
      transfer_to_client_id: searchParams.get('transfer_to') || undefined
    };

    // Validate deletion parameters
    if (deleteParams.handle_folders === 'transfer' && !deleteParams.transfer_to_client_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'transfer_to_client_id is required when handle_folders=transfer'
        } as ApiResponse<null>,
        { status: 400, headers: corsHeaders }
      );
    }

    // Perform deletion
    const result = await ClientService.delete(deleteParams);

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: `Client ${deleteParams.deletion_type === 'soft' ? 'deleted' : 'permanently removed'} successfully`
      } as ApiResponse<typeof result>,
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error(`DELETE /api/clients/${clientId} error:`, error);
    
    // Handle specific known errors
    if (error instanceof Error) {
      if (error.message.includes('active folders')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Conflict',
            message: 'Cannot delete client with active folders. Use force=true to override.'
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