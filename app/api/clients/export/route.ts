/**
 * Client export API route - POST
 * /api/clients/export
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ClientSearchService } from '@/lib/services/clients';
import type { 
  ClientExportConfig, 
  ClientExportResult, 
  ClientSearchParams 
} from '@/types/clients/operations';
import type { ClientSummary } from '@/types/clients/core';
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
 * POST - Export clients to various formats
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

    // Parse request body
    let exportConfig: ClientExportConfig;
    try {
      exportConfig = await request.json();
    } catch {
      return NextResponse.json(
        createErrorResponse(400, 'Invalid JSON in request body'),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate export configuration
    if (!exportConfig.format || !['csv', 'excel', 'json'].includes(exportConfig.format)) {
      return NextResponse.json(
        createErrorResponse(400, 'Export format must be one of: csv, excel, json'),
        { status: 400, headers: corsHeaders }
      );
    }

    // Set default language if not provided
    const language = exportConfig.language || 'fr';

    let clients: ClientSummary[] = [];
    let totalCount = 0;

    // Get clients data
    if (exportConfig.client_ids && exportConfig.client_ids.length > 0) {
      // Export specific clients by IDs
      if (exportConfig.client_ids.length > 10000) {
        return NextResponse.json(
          createErrorResponse(400, 'Cannot export more than 10,000 clients at once'),
          { status: 400, headers: corsHeaders }
        );
      }

      // Fetch specific clients
      const searchParams: ClientSearchParams = {
        page_size: 10000,
        include_deleted: false
      };

      const searchResult = await ClientSearchService.search(searchParams);
      clients = searchResult.clients.filter(c => exportConfig.client_ids!.includes(c.id));
      totalCount = clients.length;

    } else if (exportConfig.search_params) {
      // Export based on search criteria
      const searchParams: ClientSearchParams = {
        ...exportConfig.search_params,
        page_size: 10000, // Max export size
        page: 1
      };

      const searchResult = await ClientSearchService.search(searchParams);
      clients = searchResult.clients;
      totalCount = searchResult.total_count;

      if (totalCount > 10000) {
        return NextResponse.json(
          createErrorResponse(400, 'Export would exceed 10,000 clients. Please refine your search criteria.'),
          { status: 400, headers: corsHeaders }
        );
      }

    } else {
      return NextResponse.json(
        createErrorResponse(400, 'Either client_ids or search_params must be provided'),
        { status: 400, headers: corsHeaders }
      );
    }

    // Filter fields if specified
    let fieldsToInclude = exportConfig.fields;
    if (!fieldsToInclude) {
      // Default fields for export
      fieldsToInclude = [
        'display_name',
        'email',
        'phone',
        'client_type',
        'status',
        'city',
        'country',
        'created_at'
      ];

      if (exportConfig.include_sensitive_data) {
        fieldsToInclude.push('credit_limit', 'credit_limit_currency');
      }
    }

    // Generate export data
    const exportData = await generateExportData(
      clients,
      fieldsToInclude,
      language,
      exportConfig.format
    );

    // Create mock download URL (in real implementation, you'd store this temporarily)
    const downloadUrl = `/api/exports/download/${Date.now()}-clients.${exportConfig.format}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    const result: ClientExportResult = {
      success: true,
      download_url: downloadUrl,
      exported_count: clients.length,
      file_size_bytes: Buffer.byteLength(exportData, 'utf8'),
      expires_at: expiresAt
    };

    // In a real implementation, you would:
    // 1. Store the exported data temporarily (e.g., in object storage)
    // 2. Generate a secure download URL
    // 3. Set up cleanup for expired files

    return NextResponse.json(
      createSuccessResponse(result, `Export completed successfully. ${clients.length} clients exported.`),
      { 
        status: 200,
        headers: {
          ...corsHeaders,
          'X-Export-Count': clients.length.toString(),
          'X-Export-Format': exportConfig.format,
          'X-File-Size': result.file_size_bytes.toString()
        }
      }
    );

  } catch (error) {
    console.error('POST /api/clients/export error:', error);
    
    return NextResponse.json(
      createErrorResponse(500, error instanceof Error ? error.message : 'Unknown error occurred'),
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Generate export data in the specified format
 */
async function generateExportData(
  clients: ClientSummary[],
  fields: string[],
  language: string,
  format: 'csv' | 'excel' | 'json'
): Promise<string> {
  // Field labels in different languages
  const fieldLabels: Record<string, Record<string, string>> = {
    display_name: { fr: 'Nom', en: 'Name', es: 'Nombre' },
    email: { fr: 'Email', en: 'Email', es: 'Email' },
    phone: { fr: 'Téléphone', en: 'Phone', es: 'Teléfono' },
    client_type: { fr: 'Type', en: 'Type', es: 'Tipo' },
    status: { fr: 'Statut', en: 'Status', es: 'Estado' },
    city: { fr: 'Ville', en: 'City', es: 'Ciudad' },
    country: { fr: 'Pays', en: 'Country', es: 'País' },
    credit_limit: { fr: 'Limite de crédit', en: 'Credit Limit', es: 'Límite de crédito' },
    credit_limit_currency: { fr: 'Devise', en: 'Currency', es: 'Moneda' },
    created_at: { fr: 'Date de création', en: 'Created At', es: 'Fecha de creación' },
    updated_at: { fr: 'Dernière mise à jour', en: 'Updated At', es: 'Última actualización' }
  };

  // Type labels
  const typeLabels: Record<string, Record<string, string>> = {
    individual: { fr: 'Particulier', en: 'Individual', es: 'Particular' },
    business: { fr: 'Entreprise', en: 'Business', es: 'Empresa' }
  };

  // Status labels
  const statusLabels: Record<string, Record<string, string>> = {
    active: { fr: 'Actif', en: 'Active', es: 'Activo' },
    inactive: { fr: 'Inactif', en: 'Inactive', es: 'Inactivo' },
    suspended: { fr: 'Suspendu', en: 'Suspended', es: 'Suspendido' },
    archived: { fr: 'Archivé', en: 'Archived', es: 'Archivado' }
  };

  const rows = clients.map(client => {
    const row: Record<string, string | number> = {};
    
    fields.forEach(field => {
      switch (field) {
        case 'client_type':
          row[field] = typeLabels[client.client_type]?.[language] || client.client_type;
          break;
        case 'status':
          row[field] = statusLabels[client.status]?.[language] || client.status;
          break;
        case 'created_at':
        case 'updated_at':
          row[field] = new Date(client[field]).toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US');
          break;
        default:
          // Use keyof to ensure type safety
          row[field] = (client as Record<string, string | number | undefined>)[field] || '';
      }
    });
    
    return row;
  });

  switch (format) {
    case 'json':
      return JSON.stringify({
        exported_at: new Date().toISOString(),
        total_count: clients.length,
        language,
        clients: rows
      }, null, 2);

    case 'csv':
      const headers = fields.map(field => fieldLabels[field]?.[language] || field);
      const csvRows = [
        headers.join(','),
        ...rows.map(row => 
          fields.map(field => {
            const value = row[field] || '';
            // Escape CSV values that contain commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ];
      return csvRows.join('\n');

    case 'excel':
      // For Excel, we'd typically use a library like xlsx
      // For now, return CSV format which Excel can open
      const excelHeaders = fields.map(field => fieldLabels[field]?.[language] || field);
      const excelRows = [
        excelHeaders.join('\t'),
        ...rows.map(row => 
          fields.map(field => row[field] || '').join('\t')
        )
      ];
      return excelRows.join('\n');

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}