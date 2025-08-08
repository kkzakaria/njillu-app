'use client';

import { useState } from 'react';
import { FolderCard } from '@/components/folder-card';
import type { FolderSummary } from '@/types/folders';

// Sample data for testing
const sampleFolder: FolderSummary = {
  id: '1',
  folder_number: 'M241110-00001',
  type: 'import',
  category: 'commercial',
  status: 'open',
  priority: 'urgent',
  processing_stage: 'documentation',
  health_status: 'healthy',
  created_date: '2024-11-10T13:05:23',
  client_name: 'Import Export Co.',
  origin_name: 'Shanghai',
  destination_name: 'Los Angeles',
};

const sampleFolderWithBL: FolderSummary = {
  ...sampleFolder,
  id: '2',
  folder_number: 'M241110-00002',
  status: 'completed',
  priority: 'normal',
  processing_stage: 'closure',
};

const sampleFolderOnHold: FolderSummary = {
  ...sampleFolder,
  id: '3',
  folder_number: 'M241110-00003',
  status: 'on_hold',
  priority: 'critical',
  processing_stage: 'customs_clearance',
  health_status: 'warning',
  client_name: 'Global Logistics Inc.',
};

const sampleFolderCancelled: FolderSummary = {
  ...sampleFolder,
  id: '4',
  folder_number: 'M241110-00004',
  status: 'cancelled',
  priority: 'low',
  processing_stage: 'intake',
  health_status: 'healthy',
  client_name: 'Deleted Corp.',
};

const sampleFolderUrgent: FolderSummary = {
  ...sampleFolder,
  id: '5',
  folder_number: 'M241110-00005',
  status: 'processing',
  priority: 'urgent',
  processing_stage: 'customs_clearance',
  health_status: 'healthy',
  client_name: 'Urgent Logistics Inc.',
};

const sampleFolderCritical: FolderSummary = {
  ...sampleFolder,
  id: '6',
  folder_number: 'M241110-00006',
  status: 'open',
  priority: 'critical',
  processing_stage: 'documentation',
  health_status: 'warning',
  client_name: 'Critical Emergency Co.',
};

export default function FolderCardDemoPage() {
  const [lastAction, setLastAction] = useState<string>('');

  const handleCardClick = (folder: FolderSummary) => {
    setLastAction(`Clicked on folder: ${folder.folder_number}`);
  };

  const handleActionClick = (action: string, folder: FolderSummary) => {
    setLastAction(`Action "${action}" on folder: ${folder.folder_number}`);
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">FolderCard Component Demo</h1>
        <p className="text-muted-foreground mb-6">
          Testing the FolderCard component with unified Priority system (no more urgency duplication)
        </p>
        
        {lastAction && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-6">
            <p className="text-sm font-medium">Last Action: {lastAction}</p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">Default Card</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FolderCard
              folder={sampleFolder}
              primaryBLNumber="BL0000000000000001"
              onClick={handleCardClick}
              onActionClick={handleActionClick}
            />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Different Status Icons</h2>
          <p className="text-sm text-muted-foreground mb-4">
            🟡 Open (amber) • ✅ Completed (green) • 🗂️ On Hold (blue) • ❌ Cancelled (red)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FolderCard
              folder={sampleFolder}
              primaryBLNumber="BL0000000000000001"
              onClick={handleCardClick}
              onActionClick={handleActionClick}
              showClient
            />
            <FolderCard
              folder={sampleFolderWithBL}
              primaryBLNumber="BL0000000000000002"
              onClick={handleCardClick}
              onActionClick={handleActionClick}
              showPriority
            />
            <FolderCard
              folder={sampleFolderOnHold}
              onClick={handleCardClick}
              onActionClick={handleActionClick}
              showClient
              showPriority
            />
            <FolderCard
              folder={sampleFolderCancelled}
              primaryBLNumber="BL0000000000000004"
              onClick={handleCardClick}
              onActionClick={handleActionClick}
              showClient
            />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Compact Version</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FolderCard
              folder={sampleFolder}
              primaryBLNumber="BL0000000000000001"
              onClick={handleCardClick}
              onActionClick={handleActionClick}
              compact
            />
            <FolderCard
              folder={sampleFolderWithBL}
              primaryBLNumber="BL0000000000000002"
              onClick={handleCardClick}
              onActionClick={handleActionClick}
              compact
              showPriority
            />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Without Actions Menu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FolderCard
              folder={sampleFolder}
              primaryBLNumber="BL0000000000000001"
              onClick={handleCardClick}
              showActions={false}
            />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Priority Badges (Unified System)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            🔘 Low (outline) • 🔗 Normal (secondary) • ⚡ Urgent (red with zap icon) • 🚨 Critical (red with triangle + pulse)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FolderCard
              folder={{...sampleFolder, priority: 'low', folder_number: 'M241110-00007'}}
              primaryBLNumber="BL0000000000000007"
              onClick={handleCardClick}
              onActionClick={handleActionClick}
              showClient
              showPriority
            />
            <FolderCard
              folder={{...sampleFolder, priority: 'normal', folder_number: 'M241110-00008'}}
              primaryBLNumber="BL0000000000000008"
              onClick={handleCardClick}
              onActionClick={handleActionClick}
              showClient
              showPriority
            />
            <FolderCard
              folder={sampleFolderUrgent}
              primaryBLNumber="BL0000000000000005"
              onClick={handleCardClick}
              onActionClick={handleActionClick}
              showClient
              showPriority
            />
            <FolderCard
              folder={sampleFolderCritical}
              primaryBLNumber="BL0000000000000006"
              onClick={handleCardClick}
              onActionClick={handleActionClick}
              showClient
              showPriority
            />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Custom Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FolderCard
              folder={sampleFolder}
              primaryBLNumber="BL0000000000000001"
              onClick={handleCardClick}
              onActionClick={handleActionClick}
              actions={[
                { id: 'view', label: 'view' },
                { id: 'edit', label: 'edit' },
                { id: 'custom', label: 'duplicate' }
              ]}
            />
          </div>
        </section>
      </div>
    </div>
  );
}