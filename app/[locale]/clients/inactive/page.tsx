import { ClientsPage } from '../clients-page';

export default function InactiveClientsPage() {
  return (
    <ClientsPage 
      statusFilter={['inactive']}
      statusCategory="inactive"
    />
  );
}