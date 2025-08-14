import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ClientCreatePage } from '../components/client-create-page';

export default async function CreateClientPage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect('/auth/login');
  }

  return <ClientCreatePage />;
}