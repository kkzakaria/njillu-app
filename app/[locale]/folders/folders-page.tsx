'use client'

import { useState } from 'react';
import { TwoColumnsLayout } from '@/components/layouts/two-columns-layout';
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
    <div className="h-screen">
      <TwoColumnsLayout
        left={
          <FoldersListPanel 
            selectedFolderId={selectedFolder?.id}
            onFolderSelect={setSelectedFolder}
            statusFilter={statusFilter}
            statusCategory={statusCategory}
          />
        }
        right={<FolderDetailsPanel selectedFolder={selectedFolder} />}
        className="h-full"
      />
    </div>
  );
}