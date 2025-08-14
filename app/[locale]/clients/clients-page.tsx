'use client'

import { useState } from 'react';
import { MainAppTwoColumnsLayout } from '@/components/layouts/main-app-two-columns-layout';
import { ClientsListPanel } from './components/clients-list-panel';
import { ClientDetailsPanel } from './components/client-details-panel';
import type { ClientSummary, ClientStatus } from '@/types/clients';

interface ClientsPageProps {
  statusFilter?: ClientStatus[];
  statusCategory?: string;
}

export function ClientsPage({ statusFilter, statusCategory }: ClientsPageProps) {
  const [selectedClient, setSelectedClient] = useState<ClientSummary | null>(null);

  return (
    <MainAppTwoColumnsLayout
      appTitle="Njillu App - Gestion des Clients"
      leftColumn={
        <ClientsListPanel 
          selectedClientId={selectedClient?.id}
          onClientSelect={setSelectedClient}
          statusFilter={statusFilter}
          statusCategory={statusCategory}
        />
      }
      rightColumn={<ClientDetailsPanel selectedClient={selectedClient} />}
    />
  );
}