/**
 * Service API pour les dossiers avec Supabase
 * Utilise les fonctions optimisées créées dans les migrations
 */

import { createClient } from '@/lib/supabase/client'
import type { FolderSummary } from '@/types/folders'

// Re-export types for other modules
export type { FolderSummary } from '@/types/folders'

// ============================================================================
// Types pour les données Supabase (Raw Database Types)
// ============================================================================

interface SupabaseFolderSearchResult {
  id: string
  folder_number: string
  title?: string
  status: string
  priority: string
  transport_type: 'M' | 'T' | 'A'
  assigned_to?: string
  created_at: string
  search_rank?: number
}

interface SupabaseFolderDetail {
  id: string
  folder_number: string
  transport_type: 'M' | 'T' | 'A'
  status: string
  title?: string
  description?: string
  client_reference?: string
  folder_date: string
  expected_delivery_date?: string
  actual_delivery_date?: string
  priority: string
  estimated_value?: number
  estimated_value_currency?: string
  internal_notes?: string
  client_notes?: string
  created_at: string
  updated_at: string
  created_by?: string
  assigned_to?: string
  deleted_at?: string | null
  deleted_by?: string
  bl_id?: string
  client_id?: string
  // Relations
  assigned_user?: {
    id: string
    email: string
    first_name?: string
    last_name?: string
  }
  creator?: {
    id: string
    email: string
    first_name?: string
    last_name?: string
  }
  client?: {
    id: string
    client_type: 'individual' | 'business'
    email: string
    first_name?: string
    last_name?: string
    company_name?: string
    city?: string
    country?: string
  }
  bill_of_lading?: {
    id: string
    bl_number: string
    status: string
    port_of_loading?: string
    port_of_discharge?: string
    issue_date: string
    shipping_company?: {
      id: string
      name: string
      short_name?: string
    }
  }
}

interface FolderUpdateData {
  status: string
  updated_at: string
  assigned_to?: string
}

// ============================================================================
// Utilitaires de validation et mapping de types
// ============================================================================

function isSupabaseFolderSearchResult(item: unknown): item is SupabaseFolderSearchResult {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'folder_number' in item &&
    'priority' in item &&
    'status' in item &&
    'created_at' in item &&
    typeof (item as SupabaseFolderSearchResult).id === 'string' &&
    typeof (item as SupabaseFolderSearchResult).folder_number === 'string'
  )
}

function validateSupabaseFolderArray(data: unknown[]): SupabaseFolderSearchResult[] {
  return data.filter(isSupabaseFolderSearchResult)
}

// Mapping functions pour convertir les données DB vers les types FolderSummary
function mapPriority(priority: string): FolderSummary['priority'] {
  switch (priority) {
    case 'low': return 'low'
    case 'normal': return 'medium'
    case 'urgent': return 'urgent'
    case 'critical': return 'critical'
    default: return 'medium'
  }
}

function mapFolderStatus(status: string): FolderSummary['status'] {
  switch (status) {
    case 'draft': return 'open'
    case 'active': return 'processing'
    case 'shipped': return 'processing'
    case 'delivered': return 'processing'
    case 'completed': return 'completed'
    case 'cancelled': return 'cancelled'
    case 'archived': return 'on_hold'
    default: return 'open'
  }
}

function mapProcessingStage(stage?: string): FolderSummary['processing_stage'] {
  switch (stage) {
    case 'enregistrement': return 'enregistrement'
    case 'revision_facture_commerciale': return 'revision_facture_commerciale'
    case 'elaboration_fdi': return 'elaboration_fdi'
    case 'elaboration_rfcv': return 'elaboration_rfcv'
    case 'declaration_douaniere': return 'declaration_douaniere'
    case 'service_exploitation': return 'service_exploitation'
    case 'facturation_client': return 'facturation_client'
    case 'livraison': return 'livraison'
    default: return 'enregistrement'
  }
}

function getDisplayName(client?: SupabaseFolderDetail['client']): string {
  if (!client) return 'Client non assigné'
  
  if (client.client_type === 'business') {
    return client.company_name || 'Entreprise'
  } else {
    return `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Particulier'
  }
}

// ============================================================================
// Types pour l'API
// ============================================================================

export interface FolderApiSearchParams {
  search?: string
  transport_type?: 'M' | 'T' | 'A'
  status?: 'draft' | 'active' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'archived'
  priority?: 'low' | 'normal' | 'urgent' | 'critical'
  assigned_to?: string
  page?: number
  limit?: number
}

export interface FolderApiCounters {
  transport_type: string
  status: string
  priority: string
  count: number
  total_estimated_value: number
  folders_with_bl: number
  folders_without_bl: number
  assigned_folders: number
  unassigned_folders: number
}

export interface FolderApiAttention {
  id: string
  folder_number: string
  transport_type: string
  status: string
  priority: string
  assigned_to?: string
  assigned_user_email?: string
  created_at: string
  expected_delivery_date?: string
  estimated_value?: number
  missing_bl: boolean
  overdue: boolean
  high_priority: boolean
  unassigned: boolean
  due_soon: boolean
  attention_score: number
}

// ============================================================================
// Query Keys pour le cache
// ============================================================================

export const FOLDER_KEYS = {
  all: ['folders'] as const,
  lists: () => [...FOLDER_KEYS.all, 'list'] as const,
  list: (params: FolderApiSearchParams) => 
    [...FOLDER_KEYS.lists(), params] as const,
  details: () => [...FOLDER_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...FOLDER_KEYS.details(), id] as const,
  counters: () => [...FOLDER_KEYS.all, 'counters'] as const,
  attention: () => [...FOLDER_KEYS.all, 'attention'] as const,
  search: (term: string) => [...FOLDER_KEYS.all, 'search', term] as const,
}

// ============================================================================
// Service API principal
// ============================================================================

class FolderApiService {
  private supabase = createClient()

  /**
   * Recherche optimisée de dossiers avec la fonction PostgreSQL
   */
  async searchFolders(params: FolderApiSearchParams): Promise<{
    data: FolderSummary[]
    count: number
    hasNextPage: boolean
  }> {
    const {
      search = '',
      transport_type,
      status,
      priority,
      assigned_to,
      page = 0,
      limit = 50
    } = params

    const offset = page * limit

    try {
      // Utiliser une requête manuelle plus complète au lieu de la fonction RPC
      // pour récupérer aussi les relations
      let query = this.supabase
        .from('folders')
        .select(`
          id, folder_number, title, status, priority, transport_type,
          assigned_to, created_at, client_reference, expected_delivery_date,
          client:clients(id, client_type, first_name, last_name, company_name),
          bill_of_lading:bills_of_lading(
            id, bl_number, port_of_loading, port_of_discharge
          )
        `, { count: 'exact' })
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Appliquer les filtres
      if (search) {
        query = query.or(`title.ilike.%${search}%,client_reference.ilike.%${search}%,folder_number.ilike.%${search}%`)
      }
      if (transport_type) {
        query = query.eq('transport_type', transport_type)
      }
      if (status) {
        query = query.eq('status', status)
      }
      if (priority) {
        query = query.eq('priority', priority)
      }
      if (assigned_to) {
        query = query.eq('assigned_to', assigned_to)
      }

      const { data: searchData, error: searchError, count } = await query

      if (searchError) {
        console.error('Erreur recherche dossiers:', searchError)
        throw new Error(`Erreur recherche: ${searchError.message}`)
      }

      const hasNextPage = (count || 0) > offset + limit

      // Convertir les résultats au format FolderSummary avec plus de données
      const folders: FolderSummary[] = (searchData || []).map((item: any) => ({
        id: item.id,
        folder_number: item.folder_number,
        reference_number: item.client_reference || undefined,
        type: item.transport_type === 'M' ? 'import' : 'export',
        category: 'commercial', // Valeur par défaut
        priority: mapPriority(item.priority),
        status: mapFolderStatus(item.status),
        processing_stage: 'enregistrement', // Sera amélioré avec les étapes
        health_status: 'healthy', // Sera calculé avec des métriques
        client_name: getDisplayName(item.client),
        origin_name: item.bill_of_lading?.port_of_loading || undefined,
        destination_name: item.bill_of_lading?.port_of_discharge || undefined,
        created_date: item.created_at,
        expected_completion_date: item.expected_delivery_date || undefined,
        sla_compliance: undefined, // Sera calculé avec des métriques
      }))

      return {
        data: folders,
        count: count || 0,
        hasNextPage
      }
    } catch (error) {
      console.error('Erreur dans searchFolders:', error)
      throw error
    }
  }

  /**
   * Récupérer les compteurs de dossiers depuis les vues matérialisées
   */
  async getFolderCounters(params?: {
    transport_type?: string
    status?: string
  }): Promise<FolderApiCounters[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_folder_counters', {
          transport_filter: params?.transport_type || null,
          status_filter: params?.status || null,
        })

      if (error) {
        console.error('Erreur compteurs:', error)
        throw new Error(`Erreur compteurs: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Erreur dans getFolderCounters:', error)
      throw error
    }
  }

  /**
   * Récupérer les dossiers nécessitant attention
   */
  async getFoldersRequiringAttention(params?: {
    assigned_to?: string
    limit?: number
  }): Promise<FolderApiAttention[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_folders_requiring_attention', {
          assigned_to_filter: params?.assigned_to || null,
          limit_count: params?.limit || 20,
        })

      if (error) {
        console.error('Erreur dossiers attention:', error)
        throw new Error(`Erreur attention: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Erreur dans getFoldersRequiringAttention:', error)
      throw error
    }
  }

  /**
   * Récupérer un dossier par ID avec toutes ses relations
   */
  async getFolderById(id: string): Promise<FolderSummary | null> {
    try {
      const { data, error } = await this.supabase
        .from('folders')
        .select(`
          *,
          assigned_user:users!assigned_to(id, email, first_name, last_name),
          creator:users!created_by(id, email, first_name, last_name),
          client:clients(
            id, client_type, email, first_name, last_name, 
            company_name, city, country
          ),
          bill_of_lading:bills_of_lading(
            id, bl_number, status, port_of_loading, port_of_discharge, 
            issue_date,
            shipping_company:shipping_companies(id, name, short_name)
          )
        `)
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Pas trouvé
        }
        console.error('Erreur récupération dossier:', error)
        throw new Error(`Erreur dossier: ${error.message}`)
      }

      // Type assertion sécurisée avec vérification
      const folderData = data as SupabaseFolderDetail

      // Obtenir l'étape actuelle depuis les étapes de traitement
      const currentStage = await this.getCurrentProcessingStage(id)

      // Convertir au format FolderSummary avec données complètes
      return {
        id: folderData.id,
        folder_number: folderData.folder_number,
        reference_number: folderData.client_reference || undefined,
        type: folderData.transport_type === 'M' ? 'import' : 'export',
        category: 'commercial', // Peut être étendu selon les besoins
        priority: mapPriority(folderData.priority),
        status: mapFolderStatus(folderData.status),
        processing_stage: mapProcessingStage(currentStage),
        health_status: 'healthy', // Sera calculé avec des métriques
        client_name: getDisplayName(folderData.client),
        origin_name: folderData.bill_of_lading?.port_of_loading || undefined,
        destination_name: folderData.bill_of_lading?.port_of_discharge || undefined,
        created_date: folderData.created_at,
        expected_completion_date: folderData.expected_delivery_date || undefined,
        completion_date: folderData.actual_delivery_date || undefined,
        sla_compliance: undefined, // Sera calculé avec des métriques
      }
    } catch (error) {
      console.error('Erreur dans getFolderById:', error)
      throw error
    }
  }

  /**
   * Récupérer l'étape de traitement actuelle d'un dossier
   */
  private async getCurrentProcessingStage(folderId: string): Promise<string | undefined> {
    try {
      const { data, error } = await this.supabase
        .from('folder_processing_stages')
        .select('stage')
        .eq('folder_id', folderId)
        .eq('status', 'in_progress')
        .order('sequence_order', { ascending: true })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.warn('Erreur récupération étape courante:', error)
      }

      return data?.stage || 'enregistrement'
    } catch (error) {
      console.warn('Erreur dans getCurrentProcessingStage:', error)
      return 'enregistrement'
    }
  }

  /**
   * Mettre à jour le statut d'un ou plusieurs dossiers
   */
  async updateFoldersStatus(
    ids: string[],
    status: string,
    options?: { assigned_to?: string }
  ): Promise<void> {
    try {
      const updateData: FolderUpdateData = { 
        status,
        updated_at: new Date().toISOString()
      }

      if (options?.assigned_to) {
        updateData.assigned_to = options.assigned_to
      }

      const { error } = await this.supabase
        .from('folders')
        .update(updateData)
        .in('id', ids)
        .eq('deleted_at', null)

      if (error) {
        console.error('Erreur mise à jour statut:', error)
        throw new Error(`Erreur update: ${error.message}`)
      }
    } catch (error) {
      console.error('Erreur dans updateFoldersStatus:', error)
      throw error
    }
  }

  /**
   * Supprimer des dossiers (soft delete)
   */
  async deleteFolders(ids: string[], userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('folders')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: userId,
          updated_at: new Date().toISOString()
        })
        .in('id', ids)
        .eq('deleted_at', null)

      if (error) {
        console.error('Erreur suppression dossiers:', error)
        throw new Error(`Erreur delete: ${error.message}`)
      }
    } catch (error) {
      console.error('Erreur dans deleteFolders:', error)
      throw error
    }
  }

  /**
   * Rafraîchir les vues matérialisées manuellement
   */
  async refreshMaterializedViews(): Promise<void> {
    try {
      const { error } = await this.supabase
        .rpc('refresh_folder_views_if_needed')

      if (error) {
        console.error('Erreur rafraîchissement vues:', error)
        throw new Error(`Erreur refresh: ${error.message}`)
      }
    } catch (error) {
      console.error('Erreur dans refreshMaterializedViews:', error)
      throw error
    }
  }
}

// Export instance unique
export const folderApi = new FolderApiService()

// Export des fonctions individuelles pour les hooks
export const {
  searchFolders,
  getFolderCounters,
  getFoldersRequiringAttention,
  getFolderById,
  updateFoldersStatus,
  deleteFolders,
  refreshMaterializedViews
} = folderApi