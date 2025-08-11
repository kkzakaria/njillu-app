import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMessages } from 'next-intl/server';
import { DemoMasterDetail } from "@/components/demo-master-detail";

export default async function DemoPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const { locale } = await params;
  const messages = await getMessages({ locale });

  return <DemoMasterDetail messages={messages} locale={locale} />;
}