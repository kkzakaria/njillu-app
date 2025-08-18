/**
 * Individual contact API route - PUT (update), DELETE (remove)
 * /api/clients/[id]/contacts/[contactId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ContactService } from '@/lib/services/clients';
import type { ContactPerson } from '@/types/clients/core';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-responses';

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
        createErrorResponse(401, 'Authentication required'),
        { status: 401, headers: corsHeaders }
      );
    }

    const { id: clientId, contactId } = await params;
    
    if (!clientId || !contactId) {
      return NextResponse.json(
        createErrorResponse(400, 'Client ID and Contact ID are required'),
        { status: 400, headers: corsHeaders }
      );
    }

    const contactIndex = parseInt(contactId);
    if (isNaN(contactIndex) || contactIndex < 0) {
      return NextResponse.json(
        createErrorResponse(400, 'Invalid contact ID. Must be a valid index number.'),
        { status: 400, headers: corsHeaders }
      );
    }

    // Parse request body
    let updates: Partial<ContactPerson>;
    try {
      updates = await request.json();
    } catch (_parseError) {
      return NextResponse.json(
        createErrorResponse(400, 'Invalid JSON in request body'),
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if contact exists first
    const existingContact = await ContactService.getContact(clientId, contactIndex);
    if (!existingContact) {
      return NextResponse.json(
        createErrorResponse(404, 'Contact not found'),
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
      createSuccessResponse({
        client: updatedClient,
        contact: updatedContact,
        contact_index: contactIndex
      }, 'Contact updated successfully'),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    const { id: clientId, contactId } = await params;
    console.error(`PUT /api/clients/${clientId}/contacts/${contactId} error:`, error);
    
    // Handle specific known errors
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          createErrorResponse(404, 'Client or contact not found'),
          { status: 404, headers: corsHeaders }
        );
      }
      
      if (error.message.includes('business clients')) {
        return NextResponse.json(
          createErrorResponse(400, 'Can only update contacts for business clients'),
          { status: 400, headers: corsHeaders }
        );
      }
      
      if (error.message.includes('Invalid contact index')) {
        return NextResponse.json(
          createErrorResponse(400, 'Invalid contact index'),
          { status: 400, headers: corsHeaders }
        );
      }
      
      if (error.message.includes('validation')) {
        return NextResponse.json(
          createErrorResponse(422, error.message),
          { status: 422, headers: corsHeaders }
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
        createErrorResponse(401, 'Authentication required'),
        { status: 401, headers: corsHeaders }
      );
    }

    const { id: clientId, contactId } = await params;
    
    if (!clientId || !contactId) {
      return NextResponse.json(
        createErrorResponse(400, 'Client ID and Contact ID are required'),
        { status: 400, headers: corsHeaders }
      );
    }

    const contactIndex = parseInt(contactId);
    if (isNaN(contactIndex) || contactIndex < 0) {
      return NextResponse.json(
        createErrorResponse(400, 'Invalid contact ID. Must be a valid index number.'),
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
        createErrorResponse(404, 'Contact not found'),
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
      createSuccessResponse({
        client: updatedClient,
        action: deactivateOnly ? 'deactivated' : 'removed',
        remaining_contacts: updatedClient.business_info.contacts.length
      }, `Contact ${deactivateOnly ? 'deactivated' : 'removed'} successfully`),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    const { id: clientId, contactId } = await params;
    console.error(`DELETE /api/clients/${clientId}/contacts/${contactId} error:`, error);
    
    // Handle specific known errors
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          createErrorResponse(404, 'Client or contact not found'),
          { status: 404, headers: corsHeaders }
        );
      }
      
      if (error.message.includes('business clients')) {
        return NextResponse.json(
          createErrorResponse(400, 'Can only remove contacts from business clients'),
          { status: 400, headers: corsHeaders }
        );
      }
      
      if (error.message.includes('last active contact')) {
        return NextResponse.json(
          createErrorResponse(409, 'Cannot remove last active contact. At least one active contact is required.'),
          { status: 409, headers: corsHeaders }
        );
      }
      
      if (error.message.includes('Invalid contact index')) {
        return NextResponse.json(
          createErrorResponse(400, 'Invalid contact index'),
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