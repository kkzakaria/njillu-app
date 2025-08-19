'use client'

import { FileText } from 'lucide-react';
import type { FolderSummary } from '@/types/folders';
import { FolderDetailsHeader } from './folder-details-header';
import { FolderDetailsTab } from './folder-details-tab';

interface FolderDetailsPanelProps {
  selectedFolder?: FolderSummary | null;
}

export function FolderDetailsPanel({ selectedFolder }: FolderDetailsPanelProps) {
  
  // Handlers for folder actions
  const handleEdit = () => {
    console.log('Edit folder:', selectedFolder?.id);
    // TODO: Implement edit functionality
  };

  const handleDelete = () => {
    console.log('Delete folder:', selectedFolder?.id);
    // TODO: Implement delete functionality
  };

  const handleShare = () => {
    console.log('Share folder:', selectedFolder?.id);
    // TODO: Implement share functionality
  };

  const handleExportPDF = () => {
    console.log('Export PDF:', selectedFolder?.id);
    // TODO: Implement PDF export functionality
  };

  const handleArchive = () => {
    console.log('Archive folder:', selectedFolder?.id);
    // TODO: Implement archive functionality
  };

  const handlePrint = () => {
    console.log('Print folder:', selectedFolder?.id);
    // TODO: Implement print functionality
  };

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
        onShare={handleShare}
        onExportPDF={handleExportPDF}
        onArchive={handleArchive}
        onPrint={handlePrint}
      />

      {/* Enhanced Tab System with all functionality - Remove double scroll */}
      <div className="flex-1 overflow-auto">
        <FolderDetailsTab selectedFolder={selectedFolder} />
      </div>
    </div>
  );
}