import { ClientsPage } from '../clients-page';

export default function ActiveClientsPage() {
  return (
    <ClientsPage 
      statusFilter={['active']}
      statusCategory="active"
    />
  );
}