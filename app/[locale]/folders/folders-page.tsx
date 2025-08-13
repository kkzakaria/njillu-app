'use client'

import { useState } from 'react';
import { TwoColumnsLayout } from '@/components/layouts/two-columns-layout';
import { FoldersListPanel } from './components/folders-list-panel';
import { FolderDetailsPanel } from './components/folder-details-panel';
import type { FolderSummary } from '@/types/folders';

export function FoldersPage() {
  const [selectedFolder, setSelectedFolder] = useState<FolderSummary | null>(null);

  return (
    <div className="h-screen">
      <TwoColumnsLayout
        left={
          <FoldersListPanel 
            selectedFolderId={selectedFolder?.id}
            onFolderSelect={setSelectedFolder}
          />
        }
        right={<FolderDetailsPanel selectedFolder={selectedFolder} />}
        className="h-full"
      />
    </div>
  );
}