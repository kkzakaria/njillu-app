/**
 * Client import API route - POST
 * /api/clients/import
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ClientService, ClientValidationService } from '@/lib/services/clients';
import type { 
  ClientImportConfig, 
  ClientImportResult
} from '@/types/clients/operations';
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
 * POST - Import clients from data array
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
    let importConfig: ClientImportConfig;
    try {
      importConfig = await request.json();
    } catch (_parseError) {
      return NextResponse.json(
        createErrorResponse(400, 'Invalid JSON in request body'),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate import configuration
    if (!importConfig.data || !Array.isArray(importConfig.data)) {
      return NextResponse.json(
        createErrorResponse(400, 'Data array is required'),
        { status: 400, headers: corsHeaders }
      );
    }

    if (importConfig.data.length === 0) {
      return NextResponse.json(
        createErrorResponse(400, 'Data array cannot be empty'),
        { status: 400, headers: corsHeaders }
      );
    }

    if (importConfig.data.length > 1000) {
      return NextResponse.json(
        createErrorResponse(400, 'Cannot import more than 1000 clients at once'),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!importConfig.duplicate_strategy || !['skip', 'update', 'error'].includes(importConfig.duplicate_strategy)) {
      return NextResponse.json(
        createErrorResponse(400, 'duplicate_strategy must be one of: skip, update, error'),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!importConfig.mode || !['test', 'import'].includes(importConfig.mode)) {
      return NextResponse.json(
        createErrorResponse(400, 'mode must be either "test" or "import"'),
        { status: 400, headers: corsHeaders }
      );
    }

    // Initialize result
    const result: ClientImportResult = {
      success: false,
      created_count: 0,
      updated_count: 0,
      skipped_count: 0,
      error_count: 0,
      errors: [],
      created_ids: [],
      updated_ids: []
    };

    // Validate each client data before processing
    if (importConfig.validate_before_import !== false) {
      for (let i = 0; i < importConfig.data.length; i++) {
        const clientData = importConfig.data[i];
        try {
          const validation = await ClientValidationService.validateCreate(
            clientData,
            {
              check_email_uniqueness: false, // Will check during processing
              check_siret_uniqueness: false, // Will check during processing
              check_formats: true,
              check_business_rules: true
            }
          );

          if (!validation.is_valid) {
            result.errors.push({
              row_index: i,
              client_data: clientData,
              error: validation.errors.map(e => e.message).join(', '),
              error_code: 'VALIDATION_ERROR'
            });
            result.error_count++;
          }
        } catch (validationError) {
          result.errors.push({
            row_index: i,
            client_data: clientData,
            error: validationError instanceof Error ? validationError.message : 'Validation failed',
            error_code: 'VALIDATION_EXCEPTION'
          });
          result.error_count++;
        }
      }

      // If test mode, return validation results without importing
      if (importConfig.mode === 'test') {
        result.success = result.error_count === 0;
        return NextResponse.json(
          result.success 
            ? createSuccessResponse(result, `Test passed: All ${importConfig.data.length} clients are valid for import`)
            : createErrorResponse(422, `Test failed: ${result.error_count} validation errors found`, result),
          { 
            status: result.success ? 200 : 422,
            headers: {
              ...corsHeaders,
              'X-Import-Mode': 'test',
              'X-Total-Count': importConfig.data.length.toString(),
              'X-Error-Count': result.error_count.toString()
            }
          }
        );
      }

      // If there are validation errors and we're not in test mode, stop here
      if (result.error_count > 0) {
        result.success = false;
        return NextResponse.json(
          createErrorResponse(422, `Import failed: ${result.error_count} validation errors found`, result),
          { 
            status: 422,
            headers: {
              ...corsHeaders,
              'X-Import-Mode': 'import',
              'X-Error-Count': result.error_count.toString()
            }
          }
        );
      }
    }

    // Process each client for import
    for (let i = 0; i < importConfig.data.length; i++) {
      const clientData = importConfig.data[i];
      
      try {
        // Check for duplicates by email
        const existingClientByEmail = await findClientByEmail(clientData.contact_info.email);
        
        // Check for duplicates by SIRET (for business clients)
        let existingClientBySiret = null;
        if (clientData.client_type === 'business' && 
            clientData.business_info?.legal_info?.siret) {
          existingClientBySiret = await findClientBySiret(clientData.business_info.legal_info.siret);
        }

        const isDuplicate = existingClientByEmail || existingClientBySiret;

        if (isDuplicate) {
          switch (importConfig.duplicate_strategy) {
            case 'skip':
              result.skipped_count++;
              continue;

            case 'error':
              result.errors.push({
                row_index: i,
                client_data: clientData,
                error: `Duplicate client found (email: ${clientData.contact_info.email})`,
                error_code: 'DUPLICATE_CLIENT'
              });
              result.error_count++;
              continue;

            case 'update':
              // Update existing client
              try {
                const existingClient = existingClientByEmail || existingClientBySiret;
                await ClientService.update({
                  client_id: existingClient!.id,
                  data: {
                    ...clientData,
                    // Preserve original creation info
                    created_at: undefined,
                    created_by: undefined
                  }
                });
                result.updated_ids.push(existingClient!.id);
                result.updated_count++;
              } catch (updateError) {
                result.errors.push({
                  row_index: i,
                  client_data: clientData,
                  error: updateError instanceof Error ? updateError.message : 'Update failed',
                  error_code: 'UPDATE_ERROR'
                });
                result.error_count++;
              }
              continue;
          }
        }

        // Create new client
        const newClient = await ClientService.create(clientData, userId);
        result.created_ids.push(newClient.id);
        result.created_count++;

      } catch (error) {
        result.errors.push({
          row_index: i,
          client_data: clientData,
          error: error instanceof Error ? error.message : 'Unknown error',
          error_code: 'CREATE_ERROR'
        });
        result.error_count++;
      }
    }

    // Determine overall success
    result.success = result.error_count === 0 || (result.created_count + result.updated_count) > 0;

    const status = result.success ? 200 : (result.error_count === importConfig.data.length ? 400 : 207);

    return NextResponse.json(
      result.success 
        ? createSuccessResponse(result, `Import completed. Created: ${result.created_count}, Updated: ${result.updated_count}, Skipped: ${result.skipped_count}, Errors: ${result.error_count}`)
        : createErrorResponse(status, `Import completed with errors. Created: ${result.created_count}, Updated: ${result.updated_count}, Skipped: ${result.skipped_count}, Errors: ${result.error_count}`, result),
      { 
        status,
        headers: {
          ...corsHeaders,
          'X-Import-Mode': 'import',
          'X-Created-Count': result.created_count.toString(),
          'X-Updated-Count': result.updated_count.toString(),
          'X-Skipped-Count': result.skipped_count.toString(),
          'X-Error-Count': result.error_count.toString()
        }
      }
    );

  } catch (error) {
    console.error('POST /api/clients/import error:', error);
    
    return NextResponse.json(
      createErrorResponse(500, error instanceof Error ? error.message : 'Unknown error occurred'),
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Find client by email
 */
async function findClientByEmail(email: string): Promise<{ id: string } | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('clients')
    .select('id')
    .eq('contact_info->email', email)
    .is('deleted_at', null)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // Not found is OK
    throw new Error(`Email lookup failed: ${error.message}`);
  }

  return data;
}

/**
 * Find client by SIRET
 */
async function findClientBySiret(siret: string): Promise<{ id: string } | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('clients')
    .select('id')
    .eq('business_info->legal_info->siret', siret)
    .is('deleted_at', null)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // Not found is OK
    throw new Error(`SIRET lookup failed: ${error.message}`);
  }

  return data;
}