'use client'

import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useCallback } from 'react';
import { Archive } from 'lucide-react';
import { FolderCard } from './folder-card';
import { InfoBanner } from './info-banner';
import { FolderSearchBar } from './folder-search-bar';
import { useFolders as useFoldersTranslation } from '@/hooks/useTranslation';
import { useFolderFilters } from '@/hooks/useFolderFilters';
import { useFoldersSimple, useFolderMutations } from '@/hooks/use-folders';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { FolderSummary, FolderStatus } from '@/types/folders';

// Type pour les mutations
type FolderMutations = ReturnType<typeof useFolderMutations>;

interface FoldersListPanelProps {
  selectedFolderId?: string;
  onFolderSelect?: (folderId: string | null) => void;
  statusFilter?: FolderStatus[];
  statusCategory?: string;
  folderMutations?: FolderMutations;
}

export function FoldersListPanel({ selectedFolderId, onFolderSelect, statusFilter, statusCategory, folderMutations }: FoldersListPanelProps) {
  const t = useFoldersTranslation();
  const { userId } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState('');

  // Déduction de la statusCategory pour le hook de filtres
  const getStatusCategory = (category?: string): 'active' | 'completed' | 'archived' | 'deleted' => {
    switch (category) {
      case 'active':
        return 'active';
      case 'completed':
        return 'completed';
      case 'archived':
        return 'archived';
      case 'deleted':
        return 'deleted';
      default:
        return 'active';
    }
  };

  // Mapper les FolderStatus vers les statuts de la DB (memoized)
  const mapStatusFilter = useCallback((statusFilter?: FolderStatus[]) => {
    if (!statusFilter) return undefined;
    
    return statusFilter.map(status => {
      switch (status) {
        case 'open': return 'draft'
        case 'processing': return 'active'
        case 'completed': return 'completed'
        case 'cancelled': return 'cancelled'
        case 'on_hold': return 'archived'
        default: return status
      }
    }).join(',') // Pour multiple statuts
  }, []);

  // Utiliser les vraies données API avec recherche
  const { 
    data: foldersData, 
    isLoading, 
    error 
  } = useFoldersSimple({
    status: statusFilter?.[0] ? mapStatusFilter(statusFilter) as string : undefined,
    search: searchQuery.trim() || undefined,
    limit: 50 // Pagination optimisée
  });

  const allFolders = foldersData?.data || [];

  // Hook de filtrage avec état de recherche  
  const {
    filters,
    setFilters,
    activeFiltersCount,
    filteredFolders,
    clearAllFilters
  } = useFolderFilters({
    folders: allFolders,
    statusCategory: getStatusCategory(statusCategory),
    searchQuery: searchQuery
  });

  // Handlers pour la barre de recherche (memoized)
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, [setFilters]);

  const handleAdd = useCallback(() => {
    // TODO: Implémenter la logique d'ajout
    console.log('Add clicked');
  }, []);

  // Handler pour les actions sur les dossiers (memoized)
  const handleFolderAction = useCallback((actionId: string, folder: FolderSummary) => {
    if (!folderMutations) return;
    
    switch (actionId) {
      case 'view':
        onFolderSelect?.(folder.id);
        break;
      
      case 'edit':
        console.log('Edit folder:', folder.id);
        // TODO: Ouvrir le modal d'édition
        break;
      
      case 'archive':
        folderMutations.updateStatus([folder.id], 'archived');
        break;
      
      case 'restore':
        folderMutations.updateStatus([folder.id], 'active');
        break;
      
      case 'delete':
        const confirmDelete = window.confirm(
          `Êtes-vous sûr de vouloir supprimer le dossier ${folder.folder_number} ?`
        );
        if (confirmDelete && userId) {
          folderMutations.deleteFolder([folder.id], userId);
        }
        break;
      
      case 'duplicate':
        console.log('Duplicate folder:', folder.id);
        // TODO: Implémenter la duplication
        break;
      
      case 'export':
        console.log('Export folder:', folder.id);
        // TODO: Implémenter l'export
        break;
      
      default:
        console.log(`Action not implemented: ${actionId}`, folder.id);
    }
  }, [folderMutations, userId, onFolderSelect]);

  // Handler pour la sélection de dossier (memoized)
  const handleFolderSelect = useCallback((folder: FolderSummary) => {
    onFolderSelect?.(folder.id);
  }, [onFolderSelect]);

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header avec barre de recherche */}
      <FolderSearchBar
        placeholder="Rechercher un dossier..."
        statusCategory={getStatusCategory(statusCategory)}
        filters={filters}
        onSearch={handleSearch}
        onFiltersChange={handleFiltersChange}
        onAdd={handleAdd}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Info banner for completed folders */}
      {statusCategory === 'completed' && (
        <div className="mb-3">
          <InfoBanner
            message={t('banners.autoArchiveNotice')}
            icon={Archive}
            variant="info"
          />
        </div>
      )}

      {/* Affichage des filtres actifs */}
      {activeFiltersCount > 0 && (
        <div className="mb-3 text-xs text-muted-foreground">
          <span className="font-medium">{activeFiltersCount}</span> filtre(s) appliqué(s) • 
          <span className="font-medium"> {filteredFolders.length}</span> résultat(s)
          <button 
            onClick={clearAllFilters}
            className="ml-2 text-primary hover:underline"
          >
            Effacer
          </button>
        </div>
      )}

      {/* Folders list */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm">Chargement des dossiers...</p>
            {searchQuery && (
              <p className="text-xs mt-1">Recherche en cours : &quot;{searchQuery}&quot;</p>
            )}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            <p className="text-sm">Erreur lors du chargement des dossiers</p>
            <p className="text-xs mt-1">{error.message}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFolders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              primaryBLNumber={folder.reference_number}
              compact={true}
              showClient={true}
              showActions={true}
              statusCategory={statusCategory}
              className={selectedFolderId === folder.id ? 'border-l-2 border-primary bg-primary/5' : ''}
              onClick={handleFolderSelect}
              onActionClick={handleFolderAction}
            />
          ))}
          
            {/* Message si aucun résultat */}
            {filteredFolders.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Aucun dossier ne correspond aux critères</p>
                {activeFiltersCount > 0 && (
                  <button 
                    onClick={clearAllFilters}
                    className="mt-2 text-primary hover:underline text-xs"
                  >
                    Effacer les filtres
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </ScrollArea>
      
      {/* Load more / Footer stats */}
      <div className="mt-4 pt-4 border-t space-y-2">
        {/* Afficher un bouton "Charger plus" si on a atteint la limite */}
        {foldersData && foldersData.count > allFolders.length && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">
              {allFolders.length} dossiers affichés sur {foldersData.count} au total
            </p>
            <button
              className="text-xs text-primary hover:underline"
              onClick={() => console.log('TODO: Implement load more')}
            >
              Afficher plus de résultats
            </button>
          </div>
        )}
        
        {/* Stats finales */}
        <div className="text-xs text-gray-500 text-center">
          {filteredFolders.length} sur {allFolders.length} dossier(s) affichés
          {foldersData?.count && foldersData.count > allFolders.length && (
            <span className="ml-1 text-muted-foreground">
              (sur {foldersData.count} au total)
            </span>
          )}
          {activeFiltersCount > 0 && (
            <span className="ml-2 text-primary">
              ({activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}