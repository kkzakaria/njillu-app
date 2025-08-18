import { ClientsPage } from '../clients-page';

const ACTIVE_STATUS_FILTER = ['active'];

export default function ActiveClientsPage() {
  return (
    <ClientsPage 
      statusFilter={ACTIVE_STATUS_FILTER}
      statusCategory="active"
    />
  );
}