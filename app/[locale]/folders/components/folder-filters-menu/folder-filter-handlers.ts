import type { FolderFilters } from './folder-filter.types';

// ============================================================================
// Handlers et logique métier pour les filtres
// ============================================================================

/**
 * Crée une fonction pour mettre à jour les filtres
 * @param filters - Filtres actuels
 * @param onFiltersChange - Callback pour changer les filtres
 * @returns Fonction de mise à jour des filtres
 */
export function createUpdateFiltersHandler(
  filters: FolderFilters,
  onFiltersChange: (filters: FolderFilters) => void
) {
  return (updates: Partial<FolderFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };
}

/**
 * Crée une fonction pour basculer les filtres de type array
 * @param filters - Filtres actuels
 * @param updateFilters - Fonction de mise à jour des filtres
 * @returns Fonction de basculement des filtres array
 */
export function createToggleArrayFilterHandler(
  filters: FolderFilters,
  updateFilters: (updates: Partial<FolderFilters>) => void
) {
  return <T extends string>(
    key: keyof FolderFilters,
    value: T,
    currentArray: T[] = []
  ) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilters({ [key]: newArray.length > 0 ? newArray : undefined });
  };
}

/**
 * Crée une fonction pour effacer tous les filtres
 * @param onFiltersChange - Callback pour changer les filtres
 * @param setIsOpen - Callback pour fermer le menu (optionnel)
 * @returns Fonction pour effacer tous les filtres
 */
export function createClearAllFiltersHandler(
  onFiltersChange: (filters: FolderFilters) => void,
  setIsOpen?: (isOpen: boolean) => void
) {
  return () => {
    onFiltersChange({});
    setIsOpen?.(false);
  };
}

/**
 * Utilitaire pour créer tous les handlers nécessaires
 * @param filters - Filtres actuels
 * @param onFiltersChange - Callback pour changer les filtres
 * @param setIsOpen - Callback pour fermer le menu (optionnel)
 * @returns Objet contenant tous les handlers
 */
export function createFilterHandlers(
  filters: FolderFilters,
  onFiltersChange: (filters: FolderFilters) => void,
  setIsOpen?: (isOpen: boolean) => void
) {
  const updateFilters = createUpdateFiltersHandler(filters, onFiltersChange);
  const toggleArrayFilter = createToggleArrayFilterHandler(filters, updateFilters);
  const clearAllFilters = createClearAllFiltersHandler(onFiltersChange, setIsOpen);

  return {
    updateFilters,
    toggleArrayFilter,
    clearAllFilters
  };
}