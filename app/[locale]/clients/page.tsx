import { redirect } from 'next/navigation';

export default function Page() {
  // Redirect to active clients by default
  redirect('/clients/active');
}