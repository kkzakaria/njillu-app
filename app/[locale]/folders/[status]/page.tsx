import { notFound } from 'next/navigation';
import { FoldersPage } from '../folders-page';
import type { FolderStatus } from '@/types/folders';

interface PageProps {
  params: Promise<{
    locale: string;
    status: string;
  }>;
}

// Valid folder statuses that can be accessed via URL
// const VALID_STATUSES: FolderStatus[] = [
//   'open',        // active folders - en cours
//   'processing',  // active folders - en cours  
//   'completed',   // completed folders - terminés
//   'closed',      // completed folders - terminés
//   'on_hold',     // archived folders - archivés
//   'cancelled'    // deleted folders - supprimés
// ];

// Map URL status to folder statuses for filtering
const STATUS_MAPPING: Record<string, FolderStatus[]> = {
  'active': ['open', 'processing'],
  'completed': ['completed', 'closed'],
  'archived': ['on_hold'],
  'deleted': ['cancelled']
};

export default async function Page({ params }: PageProps) {
  const { status } = await params;
  
  // Validate status parameter
  if (!STATUS_MAPPING[status]) {
    notFound();
  }

  const allowedStatuses = STATUS_MAPPING[status];

  return (
    <FoldersPage 
      statusFilter={allowedStatuses}
      statusCategory={status as keyof typeof STATUS_MAPPING}
    />
  );
}

// Generate static params for known statuses (optional for performance)
export async function generateStaticParams() {
  return [
    { status: 'active' },
    { status: 'completed' },
    { status: 'archived' },
    { status: 'deleted' }
  ];
}