import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ClientDetailPage } from '../components/client-detail-page';

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function ClientPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  // Check authentication
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect('/auth/login');
  }

  return <ClientDetailPage clientId={id} />;
}