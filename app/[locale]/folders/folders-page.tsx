'use client'

import { TwoColumnsLayout } from '@/components/layouts/two-columns-layout';
import { FoldersListPanel } from './components/folders-list-panel';
import { FolderDetailsPanel } from './components/folder-details-panel';

export function FoldersPage() {
  return (
    <div className="h-screen">
      <TwoColumnsLayout
        left={<FoldersListPanel />}
        right={<FolderDetailsPanel />}
        className="h-full"
      />
    </div>
  );
}