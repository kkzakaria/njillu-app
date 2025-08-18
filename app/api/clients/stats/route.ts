/**
 * Clients statistics API route - GET global client statistics
 * /api/clients/stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types/shared';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-responses';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
 * GET - Get global client statistics
 */
export async function GET(request: NextRequest) {
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

    // Get client statistics from database
    const { data: stats, error } = await supabase
      .from('clients')
      .select('status, client_type')
      .eq('deleted_at', null); // Only count non-deleted clients

    if (error) {
      throw error;
    }

    // Calculate statistics
    const total = stats?.length || 0;
    const active = stats?.filter(c => c.status === 'active').length || 0;
    const inactive = stats?.filter(c => c.status === 'inactive').length || 0;
    const archived = stats?.filter(c => c.status === 'archived').length || 0;
    const individuals = stats?.filter(c => c.client_type === 'individual').length || 0;
    const businesses = stats?.filter(c => c.client_type === 'business').length || 0;

    const statistics = {
      total,
      active,
      inactive,
      archived,
      individuals,
      businesses
    };

    return NextResponse.json(
      createSuccessResponse(statistics, 'Client statistics retrieved successfully'),
      { 
        status: 200,
        headers: corsHeaders
      }
    );

  } catch (error) {
    console.error('GET /api/clients/stats error:', error);
    return NextResponse.json(
      createErrorResponse(500, error instanceof Error ? error.message : 'Unknown error occurred'),
      { status: 500, headers: corsHeaders }
    );
  }
}