/**
 * Hooks nuqs personnalisés pour la gestion d'état URL type-safe
 * 
 * Ce module fournit des hooks nuqs configurés pour :
 * - Les filtres de dossiers avec types stricts
 * - Les paramètres de recherche client
 * - La pagination et tri
 * - L'intégration avec l'internationalisation
 */

export { useFolderFiltersUrl } from './use-folder-filters-url';
export { useClientSearchUrl } from './use-client-search-url';
export { usePaginationUrl } from './use-pagination-url';
export { useSearchUrl } from './use-search-url';

// Types partagés
export type {
  FolderFiltersState,
  ClientSearchState,
  PaginationState,
  SearchState
} from './types';