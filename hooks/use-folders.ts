/**
 * Hooks optimisés pour la gestion des dossiers
 * Integration TanStack Query + Zustand
 */

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import { useMemo } from 'react'
import { 
  folderApi, 
  FOLDER_KEYS,
  type FolderApiSearchParams,
  type FolderApiCounters,
  type FolderApiAttention
} from '@/lib/services/folder-api'
import { useFolderStore } from '@/lib/stores/folder-store'
import type { FolderSummary } from '@/types/folders'

// ============================================================================
// Types pour TanStack Query
// ============================================================================

interface FolderSearchResult {
  data: FolderSummary[]
  count: number
  hasNextPage: boolean
}

interface InfiniteSearchResult extends FolderSearchResult {
  nextPage?: number
}

interface InfiniteQueryData {
  pages: InfiniteSearchResult[]
  pageParams: number[]
}

interface QueryData {
  data: FolderSummary[]
  count: number
}

interface UpdateStatusVariables {
  ids: string[]
  status: string
  options?: { assigned_to?: string }
}

interface DeleteVariables {
  ids: string[]
  userId: string
}

interface OptimisticUpdateContext {
  previousData: Array<[import('@tanstack/react-query').QueryKey, unknown]>
}

// ============================================================================
// Type Guards
// ============================================================================

function isInfiniteQueryData(data: unknown): data is InfiniteQueryData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'pages' in data &&
    Array.isArray((data as InfiniteQueryData).pages)
  )
}

function isQueryData(data: unknown): data is QueryData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    Array.isArray((data as QueryData).data)
  )
}

// ============================================================================
// Hook principal pour la recherche et liste des dossiers
// ============================================================================

export function useFolders(customParams?: Partial<FolderApiSearchParams>) {
  const getSearchParams = useFolderStore(state => state.getSearchParams)
  const setError = useFolderStore(state => state.setError)
  
  // Combiner les paramètres du store avec les paramètres custom
  const searchParams = useMemo(() => {
    const storeParams = getSearchParams()
    return { ...storeParams, ...customParams }
  }, [getSearchParams, customParams])
  
  // Debounce la recherche textuelle pour éviter trop de requêtes
  const [debouncedParams] = useDebounce(searchParams, 300)
  
  return useInfiniteQuery({
    queryKey: FOLDER_KEYS.list(debouncedParams),
    queryFn: async ({ pageParam = 0 }) => {
      try {
        setError(null)
        const result = await folderApi.searchFolders({
          ...debouncedParams,
          page: pageParam
        })
        return {
          ...result,
          nextPage: result.hasNextPage ? pageParam + 1 : undefined
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue'
        setError(message)
        throw error
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    enabled: true, // Always enabled pour avoir les données de base
  })
}

// ============================================================================
// Hook pour recherche simple (sans pagination infinie)
// ============================================================================

export function useFoldersSimple(params?: FolderApiSearchParams) {
  const setError = useFolderStore(state => state.setError)
  
  // Debounce pour la recherche
  const [debouncedParams] = useDebounce(params || {}, 300)
  
  return useQuery({
    queryKey: FOLDER_KEYS.list(debouncedParams),
    queryFn: async () => {
      try {
        setError(null)
        return await folderApi.searchFolders(debouncedParams)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue'
        setError(message)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    enabled: true,
  })
}

// ============================================================================
// Hook pour un dossier spécifique
// ============================================================================

export function useFolder(id: string) {
  const setError = useFolderStore(state => state.setError)
  
  return useQuery({
    queryKey: FOLDER_KEYS.detail(id),
    queryFn: async () => {
      try {
        setError(null)
        const folder = await folderApi.getFolderById(id)
        if (!folder) {
          throw new Error('Dossier non trouvé')
        }
        return folder
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue'
        setError(message)
        throw error
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (plus court car données spécifiques)
    enabled: !!id,
  })
}

// ============================================================================
// Hook pour les compteurs (dashboard)
// ============================================================================

export function useFolderCounters(params?: { transport_type?: string; status?: string }) {
  return useQuery<FolderApiCounters[], Error>({
    queryKey: [...FOLDER_KEYS.counters(), params],
    queryFn: () => folderApi.getFolderCounters(params),
    staleTime: 10 * 60 * 1000, // 10 minutes (données moins critiques)
    gcTime: 30 * 60 * 1000,    // 30 minutes
    refetchOnWindowFocus: false, // Pas besoin de refetch au focus pour les compteurs
  })
}

// ============================================================================
// Hook pour les dossiers nécessitant attention
// ============================================================================

export function useFoldersAttention(params?: { assigned_to?: string; limit?: number }) {
  return useQuery<FolderApiAttention[], Error>({
    queryKey: [...FOLDER_KEYS.attention(), params],
    queryFn: () => folderApi.getFoldersRequiringAttention(params),
    staleTime: 2 * 60 * 1000,  // 2 minutes (données critiques)
    refetchInterval: 5 * 60 * 1000, // Refetch auto toutes les 5 minutes
  })
}

// ============================================================================
// Mutations pour les actions sur les dossiers
// ============================================================================

export function useFolderMutations() {
  const queryClient = useQueryClient()
  const clearSelection = useFolderStore(state => state.clearSelection)
  const setError = useFolderStore(state => state.setError)
  
  // Mutation pour mise à jour du statut
  const updateStatusMutation = useMutation<void, Error, UpdateStatusVariables, OptimisticUpdateContext>({
    mutationFn: ({ ids, status, options }) => folderApi.updateFoldersStatus(ids, status, options),
    
    onMutate: async ({ ids, status }): Promise<OptimisticUpdateContext> => {
      // Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: FOLDER_KEYS.lists() })
      
      // Snapshot de l'état actuel pour rollback
      const previousData = queryClient.getQueriesData({ queryKey: FOLDER_KEYS.lists() })
      
      // Optimistic update : mettre à jour les caches immédiatement
      queryClient.setQueriesData(
        { queryKey: FOLDER_KEYS.lists() },
        (oldData: unknown): InfiniteQueryData | QueryData | unknown => {
          if (!oldData) return oldData
          
          // Update pour pagination infinie
          if (isInfiniteQueryData(oldData)) {
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                data: page.data.map((folder) =>
                  ids.includes(folder.id) ? { ...folder, status: status as FolderSummary['status'] } : folder
                )
              }))
            }
          }
          
          // Update pour pagination simple
          if (isQueryData(oldData)) {
            return {
              ...oldData,
              data: oldData.data.map((folder) =>
                ids.includes(folder.id) ? { ...folder, status: status as FolderSummary['status'] } : folder
              )
            }
          }
          
          return oldData
        }
      )
      
      return { previousData }
    },
    
    onError: (error, variables, context) => {
      // Rollback en cas d'erreur
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      
      const message = error instanceof Error ? error.message : 'Erreur mise à jour'
      setError(`Erreur mise à jour du statut: ${message}`)
    },
    
    onSettled: () => {
      // Invalidate et refetch pour être sûr d'avoir les dernières données
      queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.counters() })
      queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.attention() })
      
      // Clear selection after action
      clearSelection()
    },
    
    onSuccess: () => {
      setError(null)
    }
  })
  
  // Mutation pour suppression
  const deleteMutation = useMutation<void, Error, DeleteVariables, OptimisticUpdateContext>({
    mutationFn: ({ ids, userId }) => folderApi.deleteFolders(ids, userId),
    
    onMutate: async ({ ids }): Promise<OptimisticUpdateContext> => {
      await queryClient.cancelQueries({ queryKey: FOLDER_KEYS.lists() })
      
      const previousData = queryClient.getQueriesData({ queryKey: FOLDER_KEYS.lists() })
      
      // Optimistic update : retirer les dossiers supprimés
      queryClient.setQueriesData(
        { queryKey: FOLDER_KEYS.lists() },
        (oldData: unknown): InfiniteQueryData | QueryData | unknown => {
          if (!oldData) return oldData
          
          if (isInfiniteQueryData(oldData)) {
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                data: page.data.filter((folder) => !ids.includes(folder.id)),
                count: page.count - ids.filter(id => page.data.some(f => f.id === id)).length
              }))
            }
          }
          
          if (isQueryData(oldData)) {
            return {
              ...oldData,
              data: oldData.data.filter((folder) => !ids.includes(folder.id)),
              count: oldData.count - ids.filter(id => oldData.data.some(f => f.id === id)).length
            }
          }
          
          return oldData
        }
      )
      
      return { previousData }
    },
    
    onError: (error, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      
      const message = error instanceof Error ? error.message : 'Erreur suppression'
      setError(`Erreur suppression: ${message}`)
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.counters() })
      clearSelection()
    },
    
    onSuccess: () => {
      setError(null)
    }
  })
  
  // Mutation pour rafraîchir les vues matérialisées
  const refreshViewsMutation = useMutation<void, Error, void>({
    mutationFn: () => folderApi.refreshMaterializedViews(),
    onSuccess: () => {
      // Invalidate tous les caches après refresh
      queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.counters() })
      queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.attention() })
      queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.lists() })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erreur rafraîchissement'
      setError(`Erreur rafraîchissement: ${message}`)
    }
  })
  
  return {
    updateStatus: updateStatusMutation.mutate,
    updateStatusAsync: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    
    deleteFolder: deleteMutation.mutate,
    deleteFolderAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    
    refreshViews: refreshViewsMutation.mutate,
    isRefreshing: refreshViewsMutation.isPending,
  }
}

// ============================================================================
// Hook combiné pour les actions de recherche
// ============================================================================

export function useFolderSearch() {
  const filters = useFolderStore(state => state.filters)
  const updateFilters = useFolderStore(state => state.updateFilters)
  const clearFilters = useFolderStore(state => state.clearFilters)
  const setSearchQuery = useFolderStore(state => state.setSearchQuery)
  
  const foldersQuery = useFolders()
  
  return {
    // État de recherche
    filters,
    isLoading: foldersQuery.isLoading,
    error: foldersQuery.error,
    
    // Données
    folders: foldersQuery.data?.pages.flatMap(page => page.data) || [],
    totalCount: foldersQuery.data?.pages[0]?.count || 0,
    hasNextPage: foldersQuery.hasNextPage,
    
    // Actions
    updateFilters,
    clearFilters,
    setSearchQuery,
    loadMore: foldersQuery.fetchNextPage,
    refetch: foldersQuery.refetch,
    
    // État pagination
    isLoadingMore: foldersQuery.isFetchingNextPage,
    canLoadMore: foldersQuery.hasNextPage && !foldersQuery.isFetchingNextPage,
  }
}