/**
 * Store Zustand pour l'état UI des dossiers
 * Gestion des filtres, sélections, vue, etc.
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { FolderApiSearchParams } from '@/lib/services/folder-api'

// ============================================================================
// Types pour le store
// ============================================================================

export interface FolderFilters {
  search: string
  transport_type?: 'M' | 'T' | 'A'
  status?: string
  priority?: string
  assigned_to?: string
  date_from?: string
  date_to?: string
}

export interface SortConfig {
  field: 'folder_number' | 'created_at' | 'priority' | 'status' | 'assigned_to'
  direction: 'asc' | 'desc'
}

export type ViewMode = 'grid' | 'list' | 'table'

export interface FolderUIState {
  // Vue et affichage
  viewMode: ViewMode
  isCompactMode: boolean
  
  // Sélection
  selectedIds: Set<string>
  isAllSelected: boolean
  
  // Filtres et recherche
  filters: FolderFilters
  sortConfig: SortConfig
  
  // État UI
  isLoading: boolean
  error: string | null
  
  // Sidebar et modales
  isSidebarOpen: boolean
  activeModal: string | null
  
  // Pagination
  currentPage: number
  pageSize: number
}

export interface FolderUIActions {
  // Actions de vue
  setViewMode: (mode: ViewMode) => void
  toggleCompactMode: () => void
  
  // Actions de sélection
  toggleSelection: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
  setSelectedIds: (ids: Set<string>) => void
  
  // Actions de filtrage
  updateFilters: (filters: Partial<FolderFilters>) => void
  clearFilters: () => void
  setSearchQuery: (query: string) => void
  setSortConfig: (config: SortConfig) => void
  
  // Actions d'état
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Actions UI
  toggleSidebar: () => void
  openModal: (modalId: string) => void
  closeModal: () => void
  
  // Actions de pagination
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  
  // Actions utilitaires
  reset: () => void
  getSearchParams: () => FolderApiSearchParams
}

export type FolderStore = FolderUIState & FolderUIActions

// ============================================================================
// État initial
// ============================================================================

const initialState: FolderUIState = {
  // Vue et affichage
  viewMode: 'grid',
  isCompactMode: false,
  
  // Sélection
  selectedIds: new Set(),
  isAllSelected: false,
  
  // Filtres et recherche
  filters: {
    search: '',
    transport_type: undefined,
    status: undefined,
    priority: undefined,
    assigned_to: undefined,
    date_from: undefined,
    date_to: undefined,
  },
  sortConfig: {
    field: 'created_at',
    direction: 'desc',
  },
  
  // État UI
  isLoading: false,
  error: null,
  
  // Sidebar et modales
  isSidebarOpen: false,
  activeModal: null,
  
  // Pagination
  currentPage: 0,
  pageSize: 50,
}

// ============================================================================
// Store principal
// ============================================================================

export const useFolderStore = create<FolderStore>()(
  devtools(
    immer((set, get) => ({
      ...initialState,
      
      // Actions de vue
      setViewMode: (mode) => set((state) => {
        state.viewMode = mode
      }),
      
      toggleCompactMode: () => set((state) => {
        state.isCompactMode = !state.isCompactMode
      }),
      
      // Actions de sélection
      toggleSelection: (id) => set((state) => {
        if (state.selectedIds.has(id)) {
          state.selectedIds.delete(id)
        } else {
          state.selectedIds.add(id)
        }
        state.isAllSelected = false
      }),
      
      selectAll: (ids) => set((state) => {
        state.selectedIds = new Set(ids)
        state.isAllSelected = true
      }),
      
      clearSelection: () => set((state) => {
        state.selectedIds.clear()
        state.isAllSelected = false
      }),
      
      setSelectedIds: (ids) => set((state) => {
        state.selectedIds = ids
        state.isAllSelected = false
      }),
      
      // Actions de filtrage
      updateFilters: (newFilters) => set((state) => {
        Object.assign(state.filters, newFilters)
        // Reset pagination quand on change les filtres
        state.currentPage = 0
      }),
      
      clearFilters: () => set((state) => {
        state.filters = { ...initialState.filters }
        state.currentPage = 0
      }),
      
      setSearchQuery: (query) => set((state) => {
        state.filters.search = query
        state.currentPage = 0
      }),
      
      setSortConfig: (config) => set((state) => {
        state.sortConfig = config
        state.currentPage = 0
      }),
      
      // Actions d'état
      setLoading: (loading) => set((state) => {
        state.isLoading = loading
        if (loading) {
          state.error = null
        }
      }),
      
      setError: (error) => set((state) => {
        state.error = error
        state.isLoading = false
      }),
      
      // Actions UI
      toggleSidebar: () => set((state) => {
        state.isSidebarOpen = !state.isSidebarOpen
      }),
      
      openModal: (modalId) => set((state) => {
        state.activeModal = modalId
      }),
      
      closeModal: () => set((state) => {
        state.activeModal = null
      }),
      
      // Actions de pagination
      setCurrentPage: (page) => set((state) => {
        state.currentPage = page
      }),
      
      setPageSize: (size) => set((state) => {
        state.pageSize = size
        state.currentPage = 0 // Reset à la première page
      }),
      
      // Actions utilitaires
      reset: () => set(() => ({ ...initialState })),
      
      getSearchParams: (): FolderApiSearchParams => {
        const state = get()
        return {
          search: state.filters.search || undefined,
          transport_type: state.filters.transport_type,
          status: state.filters.status,
          priority: state.filters.priority,
          assigned_to: state.filters.assigned_to,
          page: state.currentPage,
          limit: state.pageSize,
        }
      },
    })),
    {
      name: 'folder-store', // nom pour les devtools
      partialize: (state) => ({
        // Persister seulement certains états dans localStorage
        viewMode: state.viewMode,
        isCompactMode: state.isCompactMode,
        pageSize: state.pageSize,
        sortConfig: state.sortConfig,
      }),
    }
  )
)

// ============================================================================
// Sélecteurs optimisés
// ============================================================================

// Sélecteur pour éviter les re-renders inutiles
export const selectFolderFilters = (state: FolderStore) => state.filters
export const selectSelectedIds = (state: FolderStore) => state.selectedIds
export const selectViewConfig = (state: FolderStore) => ({
  viewMode: state.viewMode,
  isCompactMode: state.isCompactMode,
})

// ============================================================================
// Actions avancées (computed values)
// ============================================================================

// Hook pour récupérer les actions courantes basées sur les sélections
export const useFolderActions = () => {
  const selectedIds = useFolderStore(selectSelectedIds)
  const hasSelection = selectedIds.size > 0
  const isMultipleSelection = selectedIds.size > 1
  
  return {
    hasSelection,
    isMultipleSelection,
    selectedCount: selectedIds.size,
    canEdit: hasSelection && !isMultipleSelection,
    canDelete: hasSelection,
    canBulkUpdate: hasSelection,
  }
}

// Hook pour les métriques de performance du store
export const useFolderStoreMetrics = () => {
  const store = useFolderStore()
  
  return {
    hasActiveFilters: Object.values(store.filters).some(v => v !== undefined && v !== ''),
    isFiltered: store.filters.search !== '' || 
                store.filters.transport_type !== undefined ||
                store.filters.status !== undefined ||
                store.filters.priority !== undefined,
    currentQuery: store.getSearchParams(),
  }
}