/**
 * Client statistics API route - GET client performance metrics
 * /api/clients/[id]/statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ClientService } from '@/lib/services/clients';
import type { ApiResponse } from '@/types/shared';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface RouteParams {
  params: {
    id: string;
  };
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
        {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        } as ApiResponse<null>,
        { status: 401, headers: corsHeaders }
      );
    }

    const clientId = params.id;
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
    const client = await ClientService.getById(clientId);
    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Client not found'
        } as ApiResponse<null>,
        { status: 404, headers: corsHeaders }
      );
    }

    // Get statistics
    const statistics = await ClientService.getStatistics(clientId);

    return NextResponse.json(
      {
        success: true,
        data: statistics,
        message: 'Client statistics retrieved successfully'
      } as ApiResponse<typeof statistics>,
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error(`GET /api/clients/${params.id}/statistics error:`, error);
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