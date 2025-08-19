'use client'

import { useMemo } from 'react';
import { MainAppTwoColumnsLayout } from '@/components/layouts/main-app-two-columns-layout';
import { FoldersListPanel } from './components/folders-list-panel';
import { FolderDetailsPanel } from './components/folder-details-panel';
import { useFolderFiltersUrl } from '@/hooks/nuqs/use-folder-filters-url';
import type { FolderSummary, FolderStatus } from '@/types/folders';

interface FoldersPageProps {
  statusFilter?: FolderStatus[];
  statusCategory?: string;
}

export function FoldersPage({ statusFilter, statusCategory }: FoldersPageProps) {
  const { selectedFolderId, setSelectedFolderId, clearSelectedFolder } = useFolderFiltersUrl();

  // Mock data (same as in FoldersListPanel - should be moved to a shared hook later)
  const allFolders: FolderSummary[] = [
    // Active folders (open, processing)
    {
      id: '1',
      folder_number: 'M250113-000001',
      reference_number: 'ACME-2024-001',
      type: 'import',
      category: 'commercial',
      priority: 'urgent',
      status: 'processing',
      processing_stage: 'declaration_douaniere',
      health_status: 'healthy',
      client_name: 'ACME Corporation',
      created_date: '2025-01-13T10:00:00Z',
      expected_completion_date: '2025-01-20T18:00:00Z',
    },
    {
      id: '2',
      folder_number: 'M250113-000002',
      reference_number: 'BETA-2024-002',
      type: 'export',
      category: 'express',
      priority: 'high',
      status: 'open',
      processing_stage: 'preparation_documents',
      health_status: 'at_risk',
      client_name: 'Beta Industries',
      created_date: '2025-01-13T11:00:00Z',
      expected_completion_date: '2025-01-22T17:00:00Z',
    },
    // Completed folders
    {
      id: '3',
      folder_number: 'M250110-000003',
      reference_number: 'GAMMA-2024-003',
      type: 'import',
      category: 'standard',
      priority: 'medium',
      status: 'completed',
      processing_stage: 'livre',
      health_status: 'healthy',
      client_name: 'Gamma Corp',
      created_date: '2025-01-10T09:00:00Z',
      expected_completion_date: '2025-01-15T16:00:00Z',
      completion_date: '2025-01-15T14:30:00Z',
    },
    // Archived folders
    {
      id: '4',
      folder_number: 'M241215-000004',
      reference_number: 'DELTA-2024-004',
      type: 'export',
      category: 'commercial',
      priority: 'low',
      status: 'on_hold',
      processing_stage: 'attente_documents',
      health_status: 'delayed',
      client_name: 'Delta Ltd',
      created_date: '2024-12-15T08:00:00Z',
      expected_completion_date: '2024-12-22T18:00:00Z',
      archived_date: '2024-12-16T10:00:00Z',
    },
    // Deleted folders
    {
      id: '5',
      folder_number: 'M241201-000005',
      reference_number: 'EPSILON-2024-005',
      type: 'import',
      category: 'express',
      priority: 'critical',
      status: 'cancelled',
      processing_stage: 'annule',
      health_status: 'critical',
      client_name: 'Epsilon Group',
      created_date: '2024-12-01T10:00:00Z',
      expected_completion_date: '2024-12-08T15:00:00Z',
      deleted_date: '2024-12-02T09:30:00Z',
    },
  ];

  // Find selected folder by ID
  const selectedFolder = useMemo(() => {
    if (!selectedFolderId) return null;
    return allFolders.find(folder => folder.id === selectedFolderId) || null;
  }, [selectedFolderId, allFolders]);

  // Handle folder selection
  const handleFolderSelect = (folder: FolderSummary | null) => {
    if (folder) {
      setSelectedFolderId(folder.id);
    } else {
      clearSelectedFolder();
    }
  };

  return (
    <MainAppTwoColumnsLayout
      appTitle="Njillu App - Gestion des Dossiers"
      leftColumn={
        <FoldersListPanel 
          selectedFolderId={selectedFolder?.id}
          onFolderSelect={handleFolderSelect}
          statusFilter={statusFilter}
          statusCategory={statusCategory}
        />
      }
      rightColumn={<FolderDetailsPanel selectedFolder={selectedFolder} />}
    />
  );
}