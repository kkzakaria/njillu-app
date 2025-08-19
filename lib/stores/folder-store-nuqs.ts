/**
 * Store Zustand adapté pour l'intégration nuqs
 * 
 * Cette version combine le meilleur de Zustand (état UI) et nuqs (état URL)
 * pour une gestion d'état harmonieuse et performante
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { FolderApiSearchParams } from '@/lib/services/folder-api'

// ============================================================================
// Types pour le store nuqs-aware
// ============================================================================

export type ViewMode = 'grid' | 'list' | 'table'

// État UI uniquement (ne va pas dans l'URL)
export interface FolderUIOnlyState {
  // Vue et affichage (local au composant)
  viewMode: ViewMode
  isCompactMode: boolean
  
  // Sélection (temporaire)
  selectedIds: Set<string>
  isAllSelected: boolean
  
  // État UI
  isLoading: boolean
  error: string | null
  
  // Sidebar et modales (temporaire)
  isSidebarOpen: boolean
  activeModal: string | null
}

// Actions pour l'état UI uniquement
export interface FolderUIOnlyActions {
  // Actions de vue
  setViewMode: (mode: ViewMode) => void
  toggleCompactMode: () => void
  
  // Actions de sélection
  toggleSelection: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
  setSelectedIds: (ids: Set<string>) => void
  
  // Actions d'état
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Actions UI
  toggleSidebar: () => void
  openModal: (modalId: string) => void
  closeModal: () => void
  
  // Actions utilitaires
  resetUIState: () => void
}

export type FolderStoreNuqs = FolderUIOnlyState & FolderUIOnlyActions

// ============================================================================
// État initial (uniquement UI)
// ============================================================================

const initialUIState: FolderUIOnlyState = {
  // Vue et affichage
  viewMode: 'grid',
  isCompactMode: false,
  
  // Sélection
  selectedIds: new Set(),
  isAllSelected: false,
  
  // État UI
  isLoading: false,
  error: null,
  
  // Sidebar et modales
  isSidebarOpen: false,
  activeModal: null,
}

// ============================================================================
// Store nuqs-aware
// ============================================================================

export const useFolderStoreNuqs = create<FolderStoreNuqs>()(
  devtools(
    immer((set, get) => ({
      ...initialUIState,
      
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
      }),
      
      // Actions d'état
      setLoading: (loading) => set((state) => {
        state.isLoading = loading
      }),
      
      setError: (error) => set((state) => {
        state.error = error
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
      
      // Reset uniquement l'état UI
      resetUIState: () => set(() => ({ ...initialUIState })),
    })),
    {
      name: 'folder-store-nuqs',
      partialize: (state) => {
        // Ne persiste que l'état UI pertinent (pas les selections temporaires)
        return {
          viewMode: state.viewMode,
          isCompactMode: state.isCompactMode,
        }
      }
    }
  )
)

// ============================================================================
// Hook composite combinant Zustand UI + nuqs URL state
// ============================================================================

import { useFolderFiltersUrl } from '@/hooks/nuqs/use-folder-filters-url'

/**
 * Hook principal qui combine l'état UI (Zustand) et l'état URL (nuqs)
 * 
 * @returns État combiné et actions pour la gestion des dossiers
 */
export function useFolderState() {
  // État UI uniquement (Zustand)
  const uiState = useFolderStoreNuqs()
  
  // État URL (nuqs)
  const urlState = useFolderFiltersUrl()
  
  // Fonction utilitaire pour convertir l'état nuqs vers FolderApiSearchParams
  const getSearchParams = (): FolderApiSearchParams => {
    return {
      // Recherche textuelle
      search: urlState.filters.client_search || '',
      
      // Filtres de base
      type: urlState.filters.type?.[0] || undefined,
      category: urlState.filters.category?.[0] || undefined,
      priority: urlState.filters.priority?.[0] || undefined,
      
      // Transport et transit
      transport_mode: urlState.filters.transport_mode?.[0] || undefined,
      transit_type: urlState.filters.transit_type?.[0] || undefined,
      
      // État de santé et étape
      health_status: urlState.filters.health_status?.[0] || undefined,
      processing_stage: urlState.filters.processing_stage?.[0] || undefined,
      
      // Pagination (en attendant la migration complète)
      page: 0,
      limit: 50,
      offset: 0,
      
      // Tri (valeurs par défaut)
      sort_field: 'created_at',
      sort_direction: 'desc',
      
      // Statut category
      status_category: urlState.statusCategory,
    }
  }
  
  // Actions combinées
  const actions = {
    // Actions UI (depuis Zustand)
    ...uiState,
    
    // Actions URL (depuis nuqs)
    updateFilters: urlState.updateFilters,
    clearAllFilters: urlState.clearAllFilters,
    setStatusCategory: urlState.setStatusCategory,
    
    // Action composite pour réinitialiser complètement l'état
    resetAll: () => {
      uiState.resetUIState()
      urlState.clearAllFilters()
    },
    
    // Utilitaire pour récupérer les paramètres API
    getSearchParams,
  }
  
  return {
    // État combiné
    ui: {
      viewMode: uiState.viewMode,
      isCompactMode: uiState.isCompactMode,
      selectedIds: uiState.selectedIds,
      isAllSelected: uiState.isAllSelected,
      isLoading: uiState.isLoading,
      error: uiState.error,
      isSidebarOpen: uiState.isSidebarOpen,
      activeModal: uiState.activeModal,
    },
    url: {
      filters: urlState.filters,
      statusCategory: urlState.statusCategory,
      activeFiltersCount: urlState.activeFiltersCount,
    },
    
    // Actions
    ...actions,
  }
}

// ============================================================================
// Types exportés pour les composants
// ============================================================================

export type FolderState = ReturnType<typeof useFolderState>
export type FolderUIState = FolderState['ui']
export type FolderURLState = FolderState['url']