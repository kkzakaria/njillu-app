'use client'

import { useMemo } from 'react';
import { MainAppTwoColumnsLayout } from '@/components/layouts/main-app-two-columns-layout';
import { FoldersListPanel } from './components/folders-list-panel';
import { FolderDetailsPanel } from './components/folder-details-panel';
import { useFolderFiltersUrl } from '@/hooks/nuqs/use-folder-filters-url';
import { useFolder, useFolderMutations } from '@/hooks/use-folders';
import type { FolderStatus } from '@/types/folders';

// Type pour les mutations
type FolderMutations = ReturnType<typeof useFolderMutations>;

interface FoldersPageProps {
  statusFilter?: FolderStatus[];
  statusCategory?: string;
}

export function FoldersPage({ statusFilter, statusCategory }: FoldersPageProps) {
  const { selectedFolderId, setSelectedFolderId, clearSelectedFolder } = useFolderFiltersUrl();

  // Utiliser les vraies données avec le hook useFolder
  const { 
    data: selectedFolder, 
    isLoading: isLoadingSelectedFolder, 
    error: selectedFolderError 
  } = useFolder(selectedFolderId || '');

  // Hook pour les mutations
  const folderMutations = useFolderMutations();

  // Handle folder selection
  const handleFolderSelect = (folderId: string | null) => {
    if (folderId) {
      setSelectedFolderId(folderId);
    } else {
      clearSelectedFolder();
    }
  };

  return (
    <MainAppTwoColumnsLayout
      appTitle="Njillu App - Gestion des Dossiers"
      leftColumn={
        <FoldersListPanel 
          selectedFolderId={selectedFolderId}
          onFolderSelect={handleFolderSelect}
          statusFilter={statusFilter}
          statusCategory={statusCategory}
          folderMutations={folderMutations}
        />
      }
      rightColumn={
        <FolderDetailsPanel 
          selectedFolder={selectedFolder}
          isLoading={isLoadingSelectedFolder}
          error={selectedFolderError}
          folderMutations={folderMutations}
        />
      }
    />
  );
}