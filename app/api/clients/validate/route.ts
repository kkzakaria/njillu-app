/**
 * Client validation API route - POST
 * /api/clients/validate
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ClientValidationService } from '@/lib/services/clients';
import type { CreateClientData, UpdateClientData, ClientValidationOptions } from '@/types/clients/operations';
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
 * POST - Validate client data
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

    // Parse request body
    let requestData: {
      data: CreateClientData | UpdateClientData;
      options?: ClientValidationOptions;
      operation_type: 'create' | 'update';
      client_id?: string;
    };
    
    try {
      requestData = await request.json();
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

    // Validate request structure
    if (!requestData.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Client data is required'
        } as ApiResponse<null>,
        { status: 400, headers: corsHeaders }
      );
    }

    if (!requestData.operation_type || !['create', 'update'].includes(requestData.operation_type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'operation_type must be either "create" or "update"'
        } as ApiResponse<null>,
        { status: 400, headers: corsHeaders }
      );
    }

    if (requestData.operation_type === 'update' && !requestData.client_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'client_id is required for update validation'
        } as ApiResponse<null>,
        { status: 400, headers: corsHeaders }
      );
    }

    // Set default validation options
    const validationOptions: ClientValidationOptions = {
      check_email_uniqueness: true,
      check_siret_uniqueness: true,
      check_formats: true,
      check_business_rules: true,
      ...requestData.options
    };

    // For update operations, exclude the current client from uniqueness checks
    if (requestData.operation_type === 'update' && requestData.client_id) {
      validationOptions.exclude_client_id = requestData.client_id;
    }

    // Perform validation
    let validationResult;
    if (requestData.operation_type === 'create') {
      validationResult = await ClientValidationService.validateCreate(
        requestData.data as CreateClientData,
        validationOptions
      );
    } else {
      validationResult = await ClientValidationService.validateUpdate(
        requestData.client_id!,
        requestData.data as UpdateClientData,
        validationOptions
      );
    }

    // Return validation result with appropriate status
    const status = validationResult.is_valid ? 200 : 422;

    return NextResponse.json(
      {
        success: validationResult.is_valid,
        data: validationResult,
        message: validationResult.is_valid 
          ? 'Validation passed successfully' 
          : `Validation failed with ${validationResult.errors.length} error(s) and ${validationResult.warnings.length} warning(s)`
      } as ApiResponse<typeof validationResult>,
      { 
        status,
        headers: {
          ...corsHeaders,
          'X-Validation-Status': validationResult.is_valid ? 'valid' : 'invalid',
          'X-Error-Count': validationResult.errors.length.toString(),
          'X-Warning-Count': validationResult.warnings.length.toString()
        }
      }
    );

  } catch (error) {
    console.error('POST /api/clients/validate error:', error);
    
    // Handle specific known errors
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'Client not found for update validation'
          } as ApiResponse<null>,
          { status: 404, headers: corsHeaders }
        );
      }
      
      if (error.message.includes('uniqueness check failed')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Service Unavailable',
            message: 'Validation service temporarily unavailable'
          } as ApiResponse<null>,
          { status: 503, headers: corsHeaders }
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