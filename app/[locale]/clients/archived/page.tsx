import { ClientsPage } from '../clients-page';

export default function ArchivedClientsPage() {
  return (
    <ClientsPage 
      statusFilter={['archived']}
      statusCategory="archived"
    />
  );
}