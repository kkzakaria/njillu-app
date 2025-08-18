/**
 * Client statistics API route - GET client performance metrics
 * /api/clients/[id]/statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ClientService } from '@/lib/services/clients';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-responses';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
 * GET - Get client statistics
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

    // Check if client exists
    const client = await ClientService.getById(clientId);
    if (!client) {
      return NextResponse.json(
        createErrorResponse(404, 'Client not found'),
        { status: 404, headers: corsHeaders }
      );
    }

    // Get statistics
    const statistics = await ClientService.getStatistics(clientId);

    return NextResponse.json(
      createSuccessResponse(statistics, 'Client statistics retrieved successfully'),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    const { id: clientId } = await params;
    console.error(`GET /api/clients/${clientId}/statistics error:`, error);
    return NextResponse.json(
      createErrorResponse(500, error instanceof Error ? error.message : 'Unknown error occurred'),
      { status: 500, headers: corsHeaders }
    );
  }
}