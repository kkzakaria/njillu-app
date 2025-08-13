'use client'

import { useState } from 'react';
import { MainAppLayout } from '@/components/layouts/main-app-layout';
import { TwoColumnsLayout } from '@/components/layouts/two-columns-layout';
import { FoldersListPanel } from './components/folders-list-panel';
import { FolderDetailsPanel } from './components/folder-details-panel';
import { useFoldersNavigationItems } from './components/folders-sidebar-config';
import type { FolderSummary, FolderStatus } from '@/types/folders';

interface FoldersPageProps {
  statusFilter?: FolderStatus[];
  statusCategory?: string;
}

export function FoldersPage({ statusFilter, statusCategory }: FoldersPageProps) {
  const [selectedFolder, setSelectedFolder] = useState<FolderSummary | null>(null);
  const navigationItems = useFoldersNavigationItems();

  return (
    <MainAppLayout 
      navigationItems={navigationItems}
      sidebarConfig={{
        showHeader: true,
        showFooter: true,
        headerTitle: "Njillu App"
      }}
    >
      <div className="h-full">
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
    </MainAppLayout>
  );
}