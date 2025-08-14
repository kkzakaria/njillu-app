'use client'

import { useState } from 'react';
import { MainAppTwoColumnsLayout } from '@/components/layouts/main-app-two-columns-layout';
import { FoldersListPanel } from './components/folders-list-panel';
import { FolderDetailsPanel } from './components/folder-details-panel';
import type { FolderSummary, FolderStatus } from '@/types/folders';

interface FoldersPageProps {
  statusFilter?: FolderStatus[];
  statusCategory?: string;
}

export function FoldersPage({ statusFilter, statusCategory }: FoldersPageProps) {
  const [selectedFolder, setSelectedFolder] = useState<FolderSummary | null>(null);

  return (
    <MainAppTwoColumnsLayout
      appTitle="Njillu App - Gestion des Dossiers"
      leftColumn={
        <FoldersListPanel 
          selectedFolderId={selectedFolder?.id}
          onFolderSelect={setSelectedFolder}
          statusFilter={statusFilter}
          statusCategory={statusCategory}
        />
      }
      rightColumn={<FolderDetailsPanel selectedFolder={selectedFolder} />}
    />
  );
}