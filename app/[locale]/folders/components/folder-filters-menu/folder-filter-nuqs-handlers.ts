/**
 * Handlers nuqs pour les filtres de dossiers
 * 
 * Cette version remplace folder-filter-handlers.ts en utilisant nuqs
 * pour la gestion d'état URL synchronisée
 */

import type { FolderFilters } from './folder-filter.types';
import { useFolderFiltersUrl } from '@/hooks/nuqs/use-folder-filters-url';

// ============================================================================
// Hook adapté pour les composants de filtres existants
// ============================================================================

/**
 * Hook qui adapte useFolderFiltersUrl pour l'interface existante des composants
 * 
 * @returns Objet avec l'interface attendue par les composants existants
 */
export function useFolderFilterHandlers() {
  const {
    filters,
    statusCategory,
    activeFiltersCount,
    updateFilters: updateFiltersUrl,
    clearAllFilters: clearAllFiltersUrl,
    setStatusCategory,
  } = useFolderFiltersUrl();

  // ============================================================================
  // Handlers compatibles avec l'interface existante
  // ============================================================================

  /**
   * Met à jour les filtres (compatible avec l'interface existante)
   */
  const updateFilters = (updates: Partial<FolderFilters>) => {
    updateFiltersUrl(updates);
  };

  /**
   * Bascule un élément dans un tableau de filtres
   */
  const toggleArrayFilter = <T extends string>(
    key: keyof FolderFilters,
    value: T,
    currentArray?: T[]
  ) => {
    // Récupérer le tableau actuel depuis les filtres URL ou utiliser currentArray en fallback
    const urlValue = filters[key] as T[] | undefined;
    const actualArray = urlValue || currentArray || [];
    
    const newArray = actualArray.includes(value)
      ? actualArray.filter(item => item !== value)
      : [...actualArray, value];
    
    updateFilters({ 
      [key]: newArray.length > 0 ? newArray : undefined 
    } as Partial<FolderFilters>);
  };

  /**
   * Efface tous les filtres
   */
  const clearAllFilters = () => {
    clearAllFiltersUrl();
  };

  /**
   * Interface compatible avec createFilterHandlers
   */
  const createFilterHandlers = (
    _filters: FolderFilters, // Non utilisé car on utilise l'état URL
    _onFiltersChange: (filters: FolderFilters) => void, // Non utilisé
    setIsOpen?: (isOpen: boolean) => void
  ) => {
    return {
      updateFilters,
      toggleArrayFilter,
      clearAllFilters: () => {
        clearAllFilters();
        setIsOpen?.(false);
      }
    };
  };

  // ============================================================================
  // Compatibilité avec l'interface props existante
  // ============================================================================

  /**
   * Simule l'interface onFiltersChange pour la compatibilité
   */
  const onFiltersChange = (newFilters: FolderFilters) => {
    updateFilters(newFilters);
  };

  return {
    // État
    filters,
    statusCategory,
    activeFiltersCount,
    
    // Actions (interface nuqs)
    updateFilters,
    toggleArrayFilter,
    clearAllFilters,
    setStatusCategory,
    
    // Compatibilité avec l'interface existante
    createFilterHandlers,
    onFiltersChange,
    
    // Props compatibles pour les composants existants
    folderFiltersMenuProps: {
      statusCategory,
      filters,
      onFiltersChange,
      activeFiltersCount,
    }
  };
}