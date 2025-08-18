/**
 * Business client contacts API route - POST (add contact)
 * /api/clients/[id]/contacts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ContactService } from '@/lib/services/clients';
import type { ContactPerson } from '@/types/clients/core';
import type { ApiResponse } from '@/types/shared';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
 * POST - Add new contact to business client
 */
export async function POST(
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

    // Parse request body
    let contactData: Omit<ContactPerson, 'is_active'> & { is_active?: boolean };
    try {
      contactData = await request.json();
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

    // Validate required fields
    if (!contactData.first_name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'First name is required'
        } as ApiResponse<null>,
        { status: 400, headers: corsHeaders }
      );
    }

    if (!contactData.last_name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Last name is required'
        } as ApiResponse<null>,
        { status: 400, headers: corsHeaders }
      );
    }

    if (!contactData.contact_type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Contact type is required'
        } as ApiResponse<null>,
        { status: 400, headers: corsHeaders }
      );
    }

    // Add contact
    const updatedClient = await ContactService.addContact({
      client_id: clientId,
      contact: contactData
    });

    // Get the newly added contact (it will be the last one)
    const newContact = updatedClient.business_info.contacts[updatedClient.business_info.contacts.length - 1];

    return NextResponse.json(
      {
        success: true,
        data: {
          client: updatedClient,
          contact: newContact,
          contact_index: updatedClient.business_info.contacts.length - 1
        },
        message: 'Contact added successfully'
      } as ApiResponse<{
        client: typeof updatedClient;
        contact: ContactPerson;
        contact_index: number;
      }>,
      { 
        status: 201,
        headers: {
          ...corsHeaders,
          'Location': `/api/clients/${clientId}/contacts/${updatedClient.business_info.contacts.length - 1}`
        }
      }
    );

  } catch (error) {
    console.error(`POST /api/clients/${params.id}/contacts error:`, error);
    
    // Handle specific known errors
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'Client not found'
          } as ApiResponse<null>,
          { status: 404, headers: corsHeaders }
        );
      }
      
      if (error.message.includes('business clients')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Bad Request',
            message: 'Can only add contacts to business clients'
          } as ApiResponse<null>,
          { status: 400, headers: corsHeaders }
        );
      }
      
      if (error.message.includes('validation')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation Error',
            message: error.message
          } as ApiResponse<null>,
          { status: 422, headers: corsHeaders }
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