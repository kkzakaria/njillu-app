/**
 * Individual client API route - GET, PUT, DELETE
 * /api/clients/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ClientService, ClientValidationService } from '@/lib/services/clients';
import type { UpdateClientData, DeleteClientParams } from '@/types/clients/operations';
import { 
  createErrorResponse, 
  createSuccessResponse, 
  createValidationErrorResponse 
} from '@/lib/utils/api-responses';

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
        createErrorResponse(401, 'Authentication required'),
        { status: 401, headers: corsHeaders }
      );
    }

    const { id: clientId } = await params;
    if (!clientId) {
      return NextResponse.json(
        createErrorResponse(400, 'Client ID is required'),
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
        createErrorResponse(404, 'Client not found'),
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      createSuccessResponse(result, 'Client retrieved successfully'),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    const { id: clientId } = await params;
    console.error(`GET /api/clients/${clientId} error:`, error);
    return NextResponse.json(
      createErrorResponse(500, error instanceof Error ? error.message : 'Unknown error occurred'),
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
        createErrorResponse(401, 'Authentication required'),
        { status: 401, headers: corsHeaders }
      );
    }

    const { id: clientId } = await params;
    if (!clientId) {
      return NextResponse.json(
        createErrorResponse(400, 'Client ID is required'),
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if client exists
    const existingClient = await ClientService.getById(clientId);
    if (!existingClient) {
      return NextResponse.json(
        createErrorResponse(404, 'Client not found'),
        { status: 404, headers: corsHeaders }
      );
    }

    // Parse request body
    let updateData: UpdateClientData;
    try {
      updateData = await request.json();
    } catch {
      return NextResponse.json(
        createErrorResponse(400, 'Invalid JSON in request body'),
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
        createValidationErrorResponse(
          validation.errors,
          validation.warnings
        ),
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
      createSuccessResponse(updatedClient, 'Client updated successfully'),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    const { id: clientId } = await params;
    console.error(`PUT /api/clients/${clientId} error:`, error);
    
    // Handle specific known errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
        return NextResponse.json(
          createErrorResponse(409, 'Client with this email or SIRET already exists'),
          { status: 409, headers: corsHeaders }
        );
      }
      
      if (error.message.includes('version')) {
        return NextResponse.json(
          createErrorResponse(409, 'Client has been modified by another user. Please refresh and try again.'),
          { status: 409, headers: corsHeaders }
        );
      }
    }

    return NextResponse.json(
      createErrorResponse(500, error instanceof Error ? error.message : 'Unknown error occurred'),
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
        createErrorResponse(401, 'Authentication required'),
        { status: 401, headers: corsHeaders }
      );
    }

    const { id: clientId } = await params;
    if (!clientId) {
      return NextResponse.json(
        createErrorResponse(400, 'Client ID is required'),
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if client exists
    const existingClient = await ClientService.getById(clientId);
    if (!existingClient) {
      return NextResponse.json(
        createErrorResponse(404, 'Client not found'),
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
      handle_folders: (searchParams.get('handle_folders') as 'keep' | 'transfer' | 'archive') || 'keep',
      transfer_to_client_id: searchParams.get('transfer_to') || undefined
    };

    // Validate deletion parameters
    if (deleteParams.handle_folders === 'transfer' && !deleteParams.transfer_to_client_id) {
      return NextResponse.json(
        createErrorResponse(400, 'transfer_to_client_id is required when handle_folders=transfer'),
        { status: 400, headers: corsHeaders }
      );
    }

    // Perform deletion
    const result = await ClientService.delete(deleteParams);

    return NextResponse.json(
      createSuccessResponse(result, `Client ${deleteParams.deletion_type === 'soft' ? 'deleted' : 'permanently removed'} successfully`),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    const { id: clientId } = await params;
    console.error(`DELETE /api/clients/${clientId} error:`, error);
    
    // Handle specific known errors
    if (error instanceof Error) {
      if (error.message.includes('active folders')) {
        return NextResponse.json(
          createErrorResponse(409, 'Cannot delete client with active folders. Use force=true to override.'),
          { status: 409, headers: corsHeaders }
        );
      }
    }

    return NextResponse.json(
      createErrorResponse(500, error instanceof Error ? error.message : 'Unknown error occurred'),
      { status: 500, headers: corsHeaders }
    );
  }
}