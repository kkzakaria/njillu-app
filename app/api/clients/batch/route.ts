/**
 * Client batch operations API route - POST
 * /api/clients/batch
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ClientBatchService } from '@/lib/services/clients';
import type { ClientBatchOperation } from '@/types/clients/operations';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-responses';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
 * POST - Execute batch operation on clients
 */
export async function POST(request: NextRequest) {
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

    const userId = authData.claims.sub as string;

    // Parse request body
    let batchOperation: ClientBatchOperation;
    try {
      batchOperation = await request.json();
    } catch {
      return NextResponse.json(
        createErrorResponse(400, 'Invalid JSON in request body'),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate batch operation
    if (!batchOperation.operation) {
      return NextResponse.json(
        createErrorResponse(400, 'Operation type is required'),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!batchOperation.client_ids || !Array.isArray(batchOperation.client_ids)) {
      return NextResponse.json(
        createErrorResponse(400, 'Client IDs array is required'),
        { status: 400, headers: corsHeaders }
      );
    }

    if (batchOperation.client_ids.length === 0) {
      return NextResponse.json(
        createErrorResponse(400, 'At least one client ID is required'),
        { status: 400, headers: corsHeaders }
      );
    }

    if (batchOperation.client_ids.length > 1000) {
      return NextResponse.json(
        createErrorResponse(400, 'Batch operation limited to 1000 clients'),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate operation-specific requirements
    if (batchOperation.operation === 'change_status' && !batchOperation.data?.new_status) {
      return NextResponse.json(
        createErrorResponse(400, 'new_status is required for change_status operation'),
        { status: 400, headers: corsHeaders }
      );
    }

    if ((batchOperation.operation === 'add_tags' || batchOperation.operation === 'remove_tags') && 
        (!batchOperation.data?.tags || !Array.isArray(batchOperation.data.tags) || batchOperation.data.tags.length === 0)) {
      return NextResponse.json(
        createErrorResponse(400, 'tags array is required for tag operations'),
        { status: 400, headers: corsHeaders }
      );
    }

    if (batchOperation.operation === 'update' && !batchOperation.data?.updates) {
      return NextResponse.json(
        createErrorResponse(400, 'updates object is required for update operation'),
        { status: 400, headers: corsHeaders }
      );
    }

    // Execute batch operation
    const result = await ClientBatchService.executeBatch(batchOperation, userId);

    // Determine response status based on result
    let status = 200;
    if (result.error_count > 0 && result.success_count === 0) {
      status = 400; // All operations failed
    } else if (result.error_count > 0) {
      status = 207; // Partial success (Multi-Status)
    }

    return NextResponse.json(
      createSuccessResponse(result, `Batch operation completed. ${result.success_count} successful, ${result.error_count} failed, ${result.warning_count} warnings`),
      { 
        status,
        headers: {
          ...corsHeaders,
          'X-Success-Count': result.success_count.toString(),
          'X-Error-Count': result.error_count.toString(),
          'X-Warning-Count': result.warning_count.toString(),
          'X-Execution-Time': result.execution_time_ms.toString()
        }
      }
    );

  } catch (error) {
    console.error('POST /api/clients/batch error:', error);
    
    // Handle specific known errors
    if (error instanceof Error) {
      if (error.message.includes('limited to')) {
        return NextResponse.json(
          createErrorResponse(400, error.message),
          { status: 400, headers: corsHeaders }
        );
      }
      
      if (error.message.includes('Unsupported batch operation')) {
        return NextResponse.json(
          createErrorResponse(400, error.message),
          { status: 400, headers: corsHeaders }
        );
      }
    }

    return NextResponse.json(
      createErrorResponse(500, error instanceof Error ? error.message : 'Unknown error occurred'),
      { status: 500, headers: corsHeaders }
    );
  }
}