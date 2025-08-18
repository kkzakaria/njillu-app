/**
 * Individual contact API route - PUT (update), DELETE (remove)
 * /api/clients/[id]/contacts/[contactId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ContactService } from '@/lib/services/clients';
import type { ContactPerson } from '@/types/clients/core';
import type { ApiResponse } from '@/types/shared';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface RouteParams {
  params: Promise<{
    id: string;
    contactId: string;
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
 * PUT - Update contact
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

    const { id: clientId, contactId } = await params;
    
    if (!clientId || !contactId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Client ID and Contact ID are required'
        } as ApiResponse<null>,
        { status: 400, headers: corsHeaders }
      );
    }

    const contactIndex = parseInt(contactId);
    if (isNaN(contactIndex) || contactIndex < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Invalid contact ID. Must be a valid index number.'
        } as ApiResponse<null>,
        { status: 400, headers: corsHeaders }
      );
    }

    // Parse request body
    let updates: Partial<ContactPerson>;
    try {
      updates = await request.json();
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

    // Check if contact exists first
    const existingContact = await ContactService.getContact(clientId, contactIndex);
    if (!existingContact) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Contact not found'
        } as ApiResponse<null>,
        { status: 404, headers: corsHeaders }
      );
    }

    // Update contact
    const updatedClient = await ContactService.updateContact({
      client_id: clientId,
      contact_index: contactIndex,
      updates
    });

    const updatedContact = updatedClient.business_info.contacts[contactIndex];

    return NextResponse.json(
      {
        success: true,
        data: {
          client: updatedClient,
          contact: updatedContact,
          contact_index: contactIndex
        },
        message: 'Contact updated successfully'
      } as ApiResponse<{
        client: typeof updatedClient;
        contact: ContactPerson;
        contact_index: number;
      }>,
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    const { id: clientId, contactId } = await params;
    console.error(`PUT /api/clients/${clientId}/contacts/${contactId} error:`, error);
    
    // Handle specific known errors
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'Client or contact not found'
          } as ApiResponse<null>,
          { status: 404, headers: corsHeaders }
        );
      }
      
      if (error.message.includes('business clients')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Bad Request',
            message: 'Can only update contacts for business clients'
          } as ApiResponse<null>,
          { status: 400, headers: corsHeaders }
        );
      }
      
      if (error.message.includes('Invalid contact index')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Bad Request',
            message: 'Invalid contact index'
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

/**
 * DELETE - Remove contact
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

    const { id: clientId, contactId } = await params;
    
    if (!clientId || !contactId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Client ID and Contact ID are required'
        } as ApiResponse<null>,
        { status: 400, headers: corsHeaders }
      );
    }

    const contactIndex = parseInt(contactId);
    if (isNaN(contactIndex) || contactIndex < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Invalid contact ID. Must be a valid index number.'
        } as ApiResponse<null>,
        { status: 400, headers: corsHeaders }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const deactivateOnly = searchParams.get('deactivate_only') === 'true';

    // Check if contact exists first
    const existingContact = await ContactService.getContact(clientId, contactIndex);
    if (!existingContact) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Contact not found'
        } as ApiResponse<null>,
        { status: 404, headers: corsHeaders }
      );
    }

    // Remove contact
    const updatedClient = await ContactService.removeContact({
      client_id: clientId,
      contact_index: contactIndex,
      deactivate_only: deactivateOnly
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          client: updatedClient,
          action: deactivateOnly ? 'deactivated' : 'removed',
          remaining_contacts: updatedClient.business_info.contacts.length
        },
        message: `Contact ${deactivateOnly ? 'deactivated' : 'removed'} successfully`
      } as ApiResponse<{
        client: typeof updatedClient;
        action: string;
        remaining_contacts: number;
      }>,
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    const { id: clientId, contactId } = await params;
    console.error(`DELETE /api/clients/${clientId}/contacts/${contactId} error:`, error);
    
    // Handle specific known errors
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'Client or contact not found'
          } as ApiResponse<null>,
          { status: 404, headers: corsHeaders }
        );
      }
      
      if (error.message.includes('business clients')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Bad Request',
            message: 'Can only remove contacts from business clients'
          } as ApiResponse<null>,
          { status: 400, headers: corsHeaders }
        );
      }
      
      if (error.message.includes('last active contact')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Conflict',
            message: 'Cannot remove last active contact. At least one active contact is required.'
          } as ApiResponse<null>,
          { status: 409, headers: corsHeaders }
        );
      }
      
      if (error.message.includes('Invalid contact index')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Bad Request',
            message: 'Invalid contact index'
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