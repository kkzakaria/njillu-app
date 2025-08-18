/**
 * Business client contacts API route - POST (add contact)
 * /api/clients/[id]/contacts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ContactService } from '@/lib/services/clients';
import type { ContactPerson } from '@/types/clients/core';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-responses';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    // Parse request body
    let contactData: Omit<ContactPerson, 'is_active'> & { is_active?: boolean };
    try {
      contactData = await request.json();
    } catch (_parseError) {
      return NextResponse.json(
        createErrorResponse(400, 'Invalid JSON in request body'),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate required fields
    if (!contactData.first_name?.trim()) {
      return NextResponse.json(
        createErrorResponse(400, 'First name is required'),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!contactData.last_name?.trim()) {
      return NextResponse.json(
        createErrorResponse(400, 'Last name is required'),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!contactData.contact_type) {
      return NextResponse.json(
        createErrorResponse(400, 'Contact type is required'),
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
      createSuccessResponse({
        client: updatedClient,
        contact: newContact,
        contact_index: updatedClient.business_info.contacts.length - 1
      }, 'Contact added successfully'),
      { 
        status: 201,
        headers: {
          ...corsHeaders,
          'Location': `/api/clients/${clientId}/contacts/${updatedClient.business_info.contacts.length - 1}`
        }
      }
    );

  } catch (error) {
    const { id: clientId } = await params;
    console.error(`POST /api/clients/${clientId}/contacts error:`, error);
    
    // Handle specific known errors
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          createErrorResponse(404, 'Client not found'),
          { status: 404, headers: corsHeaders }
        );
      }
      
      if (error.message.includes('business clients')) {
        return NextResponse.json(
          createErrorResponse(400, 'Can only add contacts to business clients'),
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