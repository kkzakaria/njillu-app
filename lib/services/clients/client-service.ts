/**
 * Core client service - CRUD operations
 * Handles client creation, reading, updating, and deletion
 */

import { createClient as createSupabaseClient } from '@/lib/supabase/server';
import type {
  Client,
  IndividualClient,
  BusinessClient,
  ClientSummary,
  ClientDetail,
  ClientStatistics,
  getClientDisplayName,
  getClientContactName,
  isIndividualClient,
  isBusinessClient
} from '@/types/clients/core';
import type {
  CreateClientData,
  UpdateClientData,
  UpdateClientParams,
  DeleteClientParams,
  DeleteClientResult,
  isCreateIndividualData,
  isCreateBusinessData
} from '@/types/clients/operations';
import type { EntityId } from '@/types/shared';

export class ClientService {
  /**
   * Create a new client (individual or business)
   */
  static async create(data: CreateClientData, createdBy: EntityId): Promise<Client> {
    const supabase = await createSupabaseClient();
    
    // Set default commercial info values
    const defaultCommercialInfo = {
      credit_limit: 0,
      credit_limit_currency: 'EUR' as const,
      payment_terms_days: 30,
      payment_terms: 'net_30' as const,
      payment_methods: ['bank_transfer'] as const,
      preferred_language: 'fr' as const,
      priority: 'normal' as const,
      risk_level: 'low' as const,
      ...data.commercial_info
    };

    const clientData = {
      ...data,
      commercial_info: defaultCommercialInfo,
      commercial_history: {
        total_orders_amount: 0,
        total_orders_count: 0,
        current_balance: 0,
        average_payment_delay_days: 0
      },
      status: 'active' as const,
      created_by: createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      deleted_by: null,
      deletion_reason: null
    };

    const { data: client, error } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create client: ${error.message}`);
    }

    return client as Client;
  }

  /**
   * Get client by ID
   */
  static async getById(id: EntityId): Promise<Client | null> {
    const supabase = await createSupabaseClient();
    
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw new Error(`Failed to get client: ${error.message}`);
    }

    return client as Client;
  }

  /**
   * Get client detail with computed information
   */
  static async getDetail(id: EntityId): Promise<ClientDetail | null> {
    const client = await this.getById(id);
    if (!client) return null;

    const supabase = await createSupabaseClient();

    // Get folder counts
    const { data: folderStats } = await supabase
      .from('folders')
      .select('status')
      .eq('client_id', id)
      .is('deleted_at', null);

    const totalFolders = folderStats?.length || 0;
    const activeFolders = folderStats?.filter(f => f.status === 'active').length || 0;

    // Get last activity (from folder updates)
    const { data: lastActivity } = await supabase
      .from('folders')
      .select('updated_at')
      .eq('client_id', id)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    return {
      client,
      display_info: {
        display_name: getClientDisplayName(client),
        contact_name: getClientContactName(client),
        type_label_fr: isIndividualClient(client) ? 'Particulier' : 'Entreprise',
        type_label_en: isIndividualClient(client) ? 'Individual' : 'Business',
        type_label_es: isIndividualClient(client) ? 'Particular' : 'Empresa'
      },
      total_folders: totalFolders,
      active_folders: activeFolders,
      last_activity_date: lastActivity?.updated_at || client.updated_at,
      can_modify: true, // TODO: Implement permission check
      can_delete: activeFolders === 0 && client.status === 'inactive'
    };
  }

  /**
   * Update client
   */
  static async update(params: UpdateClientParams): Promise<Client> {
    const supabase = await createSupabaseClient();
    
    const updateData = {
      ...params.data,
      updated_at: new Date().toISOString()
    };

    const { data: client, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', params.client_id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update client: ${error.message}`);
    }

    return client as Client;
  }

  /**
   * Soft delete client
   */
  static async delete(params: DeleteClientParams): Promise<DeleteClientResult> {
    const supabase = await createSupabaseClient();
    
    // Check if client has active folders
    const { data: activeFolders } = await supabase
      .from('folders')
      .select('id, status')
      .eq('client_id', params.client_id)
      .is('deleted_at', null);

    const hasActiveFolders = activeFolders?.some(f => f.status === 'active') || false;
    
    if (hasActiveFolders && !params.force) {
      throw new Error('Client has active folders. Use force=true to delete anyway.');
    }

    const deletedAt = new Date().toISOString();

    if (params.deletion_type === 'soft') {
      const { error } = await supabase
        .from('clients')
        .update({
          deleted_at: deletedAt,
          deletion_reason: params.reason || 'Manual deletion'
        })
        .eq('id', params.client_id);

      if (error) {
        throw new Error(`Failed to delete client: ${error.message}`);
      }
    } else {
      // Hard delete - remove from database
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', params.client_id);

      if (error) {
        throw new Error(`Failed to delete client: ${error.message}`);
      }
    }

    // Handle associated folders
    let folderActions: Array<{
      folder_id: EntityId;
      action: 'kept' | 'transferred' | 'archived';
      target_client_id?: EntityId;
    }> = [];

    if (activeFolders && activeFolders.length > 0) {
      if (params.handle_folders === 'archive') {
        await supabase
          .from('folders')
          .update({ status: 'archived' })
          .eq('client_id', params.client_id);
        
        folderActions = activeFolders.map(f => ({
          folder_id: f.id,
          action: 'archived' as const
        }));
      } else if (params.handle_folders === 'transfer' && params.transfer_to_client_id) {
        await supabase
          .from('folders')
          .update({ client_id: params.transfer_to_client_id })
          .eq('client_id', params.client_id);
        
        folderActions = activeFolders.map(f => ({
          folder_id: f.id,
          action: 'transferred' as const,
          target_client_id: params.transfer_to_client_id
        }));
      } else {
        folderActions = activeFolders.map(f => ({
          folder_id: f.id,
          action: 'kept' as const
        }));
      }
    }

    return {
      success: true,
      deletion_type: params.deletion_type,
      affected_folders_count: activeFolders?.length || 0,
      folder_actions: folderActions,
      deleted_at: deletedAt
    };
  }

  /**
   * Get client statistics
   */
  static async getStatistics(clientId: EntityId): Promise<ClientStatistics> {
    const supabase = await createSupabaseClient();
    
    // Get folder statistics
    const { data: folders } = await supabase
      .from('folders')
      .select('status')
      .eq('client_id', clientId)
      .is('deleted_at', null);

    const foldersByStatus: Record<string, number> = {};
    folders?.forEach(folder => {
      foldersByStatus[folder.status] = (foldersByStatus[folder.status] || 0) + 1;
    });

    const client = await this.getById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    const now = new Date().toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    return {
      client_id: clientId,
      total_folders: folders?.length || 0,
      folders_by_status: foldersByStatus,
      total_revenue: client.commercial_history?.total_orders_amount || 0,
      revenue_currency: client.commercial_info.credit_limit_currency,
      average_payment_delay: client.commercial_history?.average_payment_delay_days || 0,
      calculated_at: now,
      period_start: thirtyDaysAgo,
      period_end: now
    };
  }

  /**
   * List clients with basic filtering
   */
  static async list(params: {
    page?: number;
    pageSize?: number;
    status?: string[];
    clientTypes?: string[];
  } = {}): Promise<{
    clients: ClientSummary[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const supabase = await createSupabaseClient();
    
    const page = params.page || 1;
    const pageSize = Math.min(params.pageSize || 50, 100);
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (params.status?.length) {
      query = query.in('status', params.status);
    }

    if (params.clientTypes?.length) {
      query = query.in('client_type', params.clientTypes);
    }

    const { data: clients, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(`Failed to list clients: ${error.message}`);
    }

    const clientSummaries: ClientSummary[] = (clients || []).map(client => ({
      id: client.id,
      client_type: client.client_type,
      status: client.status,
      display_name: getClientDisplayName(client),
      email: client.contact_info.email,
      phone: client.contact_info.phone,
      city: client.contact_info.address?.city,
      country: client.contact_info.address?.country || 'FR',
      credit_limit: client.commercial_info.credit_limit,
      credit_limit_currency: client.commercial_info.credit_limit_currency,
      created_at: client.created_at,
      updated_at: client.updated_at
    }));

    return {
      clients: clientSummaries,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  }
}