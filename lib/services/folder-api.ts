/**
 * Service API pour les dossiers avec Supabase
 * Utilise les fonctions optimisées créées dans les migrations
 */

import { createClient } from '@/lib/supabase/client'
import type { FolderSummary, FolderSearchParams, FolderSearchResults } from '@/types/folders'

// ============================================================================
// Types pour l'API
// ============================================================================

export interface FolderApiSearchParams {
  search?: string
  transport_type?: 'M' | 'T' | 'A'
  status?: string
  priority?: string
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
      // Utiliser la fonction PostgreSQL optimisée
      const { data: searchData, error: searchError } = await this.supabase
        .rpc('search_folders_optimized', {
          search_term: search,
          transport_filter: transport_type || null,
          status_filter: status || null,
          priority_filter: priority || null,
          assigned_to_filter: assigned_to || null,
          limit_count: limit + 1, // +1 pour détecter hasNextPage
          offset_count: offset
        })

      if (searchError) {
        console.error('Erreur recherche dossiers:', searchError)
        throw new Error(`Erreur recherche: ${searchError.message}`)
      }

      // Récupérer le count total séparément
      const { data: countData, error: countError } = await this.supabase
        .rpc('count_folders_optimized', {
          search_term: search,
          transport_filter: transport_type || null,
          status_filter: status || null,
          priority_filter: priority || null,
          assigned_to_filter: assigned_to || null,
        })

      if (countError) {
        console.error('Erreur count dossiers:', countError)
        throw new Error(`Erreur count: ${countError.message}`)
      }

      const hasNextPage = searchData.length > limit
      const data = hasNextPage ? searchData.slice(0, -1) : searchData

      // Convertir les résultats au format FolderSummary
      const folders: FolderSummary[] = data.map(item => ({
        id: item.id,
        folder_number: item.folder_number,
        type: 'import', // TODO: ajouter dans la fonction search
        category: 'commercial', // TODO: ajouter dans la fonction search
        priority: item.priority as any,
        status: item.status as any,
        processing_stage: 'enregistrement', // TODO: ajouter dans la fonction search
        health_status: 'healthy', // TODO: ajouter dans la fonction search
        client_name: 'Client Name', // TODO: joindre avec les données client
        origin_name: 'Origin', // TODO: joindre avec les données location
        destination_name: 'Destination', // TODO: joindre avec les données location
        created_date: item.created_at,
        reference_number: undefined, // TODO: ajouter si nécessaire
        transport_type: item.transport_type as any,
        expected_completion_date: undefined, // TODO: ajouter si nécessaire
        sla_compliance: undefined, // TODO: calculer si nécessaire
      }))

      return {
        data: folders,
        count: countData || 0,
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
   * Récupérer un dossier par ID
   */
  async getFolderById(id: string): Promise<FolderSummary | null> {
    try {
      const { data, error } = await this.supabase
        .from('folders')
        .select(`
          *,
          assigned_user:users!assigned_to(email, full_name),
          creator:users!created_by(email, full_name)
        `)
        .eq('id', id)
        .eq('deleted_at', null)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Pas trouvé
        }
        console.error('Erreur récupération dossier:', error)
        throw new Error(`Erreur dossier: ${error.message}`)
      }

      // Convertir au format FolderSummary
      // TODO: Mapper correctement toutes les propriétés
      return {
        id: data.id,
        folder_number: data.folder_number,
        type: 'import', // TODO: mapper correctement
        category: 'commercial',
        priority: data.priority as any,
        status: data.status as any,
        processing_stage: 'enregistrement',
        health_status: 'healthy',
        client_name: 'Client Name',
        origin_name: 'Origin',
        destination_name: 'Destination',
        created_date: data.created_at,
        transport_type: data.transport_type as any,
      }
    } catch (error) {
      console.error('Erreur dans getFolderById:', error)
      throw error
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
      const updateData: any = { 
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