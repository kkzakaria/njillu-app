import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ClientEditPage } from '../../components/client-edit-page';

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function EditClientPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  // Check authentication
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect('/auth/login');
  }

  return <ClientEditPage clientId={id} />;
}