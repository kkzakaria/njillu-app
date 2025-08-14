/**
 * Client batch operations API route - POST
 * /api/clients/batch
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ClientBatchService } from '@/lib/services/clients';
import type { ClientBatchOperation } from '@/types/clients/operations';
import type { ApiResponse } from '@/types/shared';

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
    let batchOperation: ClientBatchOperation;
    try {
      batchOperation = await request.json();
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

    // Validate batch operation
    if (!batchOperation.operation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Operation type is required'
        } as ApiResponse<null>,
        { status: 400, headers: corsHeaders }
      );
    }

    if (!batchOperation.client_ids || !Array.isArray(batchOperation.client_ids)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Client IDs array is required'
        } as ApiResponse<null>,
        { status: 400, headers: corsHeaders }
      );
    }

    if (batchOperation.client_ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'At least one client ID is required'
        } as ApiResponse<null>,
        { status: 400, headers: corsHeaders }
      );
    }

    if (batchOperation.client_ids.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Batch operation limited to 1000 clients'
        } as ApiResponse<null>,
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate operation-specific requirements
    if (batchOperation.operation === 'change_status' && !batchOperation.data?.new_status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'new_status is required for change_status operation'
        } as ApiResponse<null>,
        { status: 400, headers: corsHeaders }
      );
    }

    if ((batchOperation.operation === 'add_tags' || batchOperation.operation === 'remove_tags') && 
        (!batchOperation.data?.tags || !Array.isArray(batchOperation.data.tags) || batchOperation.data.tags.length === 0)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'tags array is required for tag operations'
        } as ApiResponse<null>,
        { status: 400, headers: corsHeaders }
      );
    }

    if (batchOperation.operation === 'update' && !batchOperation.data?.updates) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'updates object is required for update operation'
        } as ApiResponse<null>,
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
      {
        success: result.success_count > 0,
        data: result,
        message: `Batch operation completed. ${result.success_count} successful, ${result.error_count} failed, ${result.warning_count} warnings`
      } as ApiResponse<typeof result>,
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
          {
            success: false,
            error: 'Bad Request',
            message: error.message
          } as ApiResponse<null>,
          { status: 400, headers: corsHeaders }
        );
      }
      
      if (error.message.includes('Unsupported batch operation')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Bad Request',
            message: error.message
          } as ApiResponse<null>,
          { status: 400, headers: corsHeaders }
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