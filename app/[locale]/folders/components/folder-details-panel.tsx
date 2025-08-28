'use client'

import { FileText } from 'lucide-react';
import type { FolderSummary } from '@/types/folders';
import { FolderDetailsHeader } from './folder-details-header';
import { FolderDetailsTab } from './folder-details-tab';
import { useFolderMutations } from '@/hooks/use-folders';
import { useCurrentUser } from '@/hooks/use-current-user';

// Type pour les mutations
type FolderMutations = ReturnType<typeof useFolderMutations>;

interface FolderDetailsPanelProps {
  selectedFolder?: FolderSummary | null;
  isLoading?: boolean;
  error?: Error | null;
  folderMutations?: FolderMutations;
}

export function FolderDetailsPanel({ selectedFolder, isLoading, error, folderMutations }: FolderDetailsPanelProps) {
  const { userId } = useCurrentUser();
  
  // Handlers for folder actions
  const handleEdit = () => {
    console.log('Edit folder:', selectedFolder?.id);
    // TODO: Implement edit functionality
  };

  const handleDelete = () => {
    if (!selectedFolder || !folderMutations) return;
    
    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le dossier ${selectedFolder.folder_number} ?`
    );
    
    if (confirmDelete && userId) {
      folderMutations.deleteFolder([selectedFolder.id], userId);
    }
  };

  const handleArchive = () => {
    if (!selectedFolder || !folderMutations) return;
    
    folderMutations.updateStatus([selectedFolder.id], 'archived');
  };

  const handleActivate = () => {
    if (!selectedFolder || !folderMutations) return;
    
    folderMutations.updateStatus([selectedFolder.id], 'active');
  };

  const handleShare = () => {
    console.log('Share folder:', selectedFolder?.id);
    // TODO: Implement share functionality
  };

  const handlePrint = () => {
    console.log('Print folder:', selectedFolder?.id);
    // TODO: Implement print functionality
  };

  // Gestion des états de chargement et d'erreur
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-destructive">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-destructive/50" />
          <p className="mb-2">Erreur lors du chargement</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!selectedFolder) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Sélectionnez un dossier pour voir les détails</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Header with actions and metrics */}
      <FolderDetailsHeader 
        selectedFolder={selectedFolder}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onArchive={handleArchive}
        onActivate={handleActivate}
        onShare={handleShare}
        onPrint={handlePrint}
      />

      {/* Enhanced Tab System with all functionality - Remove double scroll */}
      <div className="flex-1 overflow-auto">
        <FolderDetailsTab selectedFolder={selectedFolder} />
      </div>
    </div>
  );
}