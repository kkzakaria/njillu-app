'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, Filter, Archive } from 'lucide-react';
import { FolderCard } from './folder-card';
import { InfoBanner } from './info-banner';
import { useFolders } from '@/hooks/useTranslation';
import type { FolderSummary, FolderStatus } from '@/types/folders';

interface FoldersListPanelProps {
  selectedFolderId?: string;
  onFolderSelect?: (folder: FolderSummary) => void;
  statusFilter?: FolderStatus[];
  statusCategory?: string;
}

export function FoldersListPanel({ selectedFolderId, onFolderSelect, statusFilter, statusCategory }: FoldersListPanelProps) {
  const t = useFolders();
  // Mock data étendue pour tous les statuts
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
      origin_name: 'Shanghai, China',
      destination_name: 'Le Havre, France',
      created_date: '2024-01-15T10:30:00Z',
      expected_completion_date: '2024-01-25T18:00:00Z',
      sla_compliance: 95,
    },
    {
      id: '2',
      folder_number: 'M250113-000002',
      reference_number: 'BETA-2024-002',
      type: 'export',
      category: 'urgent',
      priority: 'normal',
      status: 'open',
      processing_stage: 'enregistrement',
      health_status: 'healthy',
      client_name: 'Beta Industries',
      origin_name: 'Lyon, France',
      destination_name: 'New York, USA',
      created_date: '2024-01-16T08:00:00Z',
      expected_completion_date: '2024-01-28T17:00:00Z',
      sla_compliance: 88,
    },
    // Completed folders (completed, closed)
    {
      id: '3',
      folder_number: 'M250113-000003',
      reference_number: 'GAMMA-2024-003',
      type: 'import',
      category: 'commercial',
      priority: 'low',
      status: 'completed',
      processing_stage: 'livraison',
      health_status: 'healthy',
      client_name: 'Gamma Solutions',
      origin_name: 'Barcelona, Spain',
      destination_name: 'Marseille, France',
      created_date: '2024-01-13T09:45:00Z',
      expected_completion_date: '2024-01-18T16:00:00Z',
      completion_date: '2024-01-18T14:30:00Z',
      sla_compliance: 100,
    },
    {
      id: '4',
      folder_number: 'M250113-000004',
      reference_number: 'DELTA-2024-004',
      type: 'export',
      category: 'commercial',
      priority: 'normal',
      status: 'closed',
      processing_stage: 'livraison',
      health_status: 'healthy',
      client_name: 'Delta Corp',
      origin_name: 'Paris, France',
      destination_name: 'Tokyo, Japan',
      created_date: '2024-01-10T15:20:00Z',
      expected_completion_date: '2024-01-15T12:00:00Z',
      completion_date: '2024-01-15T11:45:00Z',
      sla_compliance: 98,
    },
    // Archived folders (on_hold)
    {
      id: '5',
      folder_number: 'M250113-000005',
      reference_number: 'ECHO-2024-005',
      type: 'import',
      category: 'urgent',
      priority: 'urgent',
      status: 'on_hold',
      processing_stage: 'revision_facture_commerciale',
      health_status: 'warning',
      client_name: 'Echo Enterprises',
      origin_name: 'Hamburg, Germany',
      destination_name: 'Bordeaux, France',
      created_date: '2024-01-12T11:30:00Z',
      expected_completion_date: '2024-01-22T14:00:00Z',
      archived_date: '2024-01-14T16:45:00Z',
      sla_compliance: 65,
    },
    // Deleted folders (cancelled)
    {
      id: '6',
      folder_number: 'M250113-000006',
      reference_number: 'FOXTROT-2024-006',
      type: 'export',
      category: 'commercial',
      priority: 'low',
      status: 'cancelled',
      processing_stage: 'enregistrement',
      health_status: 'critical',
      client_name: 'Foxtrot Ltd',
      origin_name: 'Marseille, France',
      destination_name: 'Naples, Italy',
      created_date: '2024-01-08T14:15:00Z',
      expected_completion_date: '2024-01-20T10:00:00Z',
      deleted_date: '2024-01-09T10:20:00Z',
      sla_compliance: 0,
    },
  ];

  // Filter folders based on status filter
  const folders = statusFilter 
    ? allFolders.filter(folder => statusFilter.includes(folder.status))
    : allFolders;

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="mb-4">
        {/* Search and action buttons */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher un dossier..."
              className="pl-9"
            />
          </div>
          <Button size="sm" variant="outline">
            <Filter className="w-4 h-4" />
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

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

      {/* Folders list */}
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              primaryBLNumber={folder.reference_number}
              compact={true}
              showClient={true}
              showActions={false}
              statusCategory={statusCategory}
              className={selectedFolderId === folder.id ? 'border-l-2 border-primary bg-primary/5' : ''}
              onClick={(folder) => {
                onFolderSelect?.(folder);
              }}
            />
          ))}
        </div>
      </ScrollArea>
      
      {/* Footer stats */}
      <div className="mt-4 pt-4 border-t">
        <div className="text-xs text-gray-500 text-center">
          {folders.length} dossier(s) au total
        </div>
      </div>
    </div>
  );
}