import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <h1 className="text-2xl font-bold">Page Protégée</h1>
        <p className="text-muted-foreground">
          Cette page est accessible uniquement aux utilisateurs authentifiés.
        </p>
      </div>
      
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-xl mb-4">Vos informations utilisateur</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto bg-muted">
          {JSON.stringify(data.claims, null, 2)}
        </pre>
      </div>
    </div>
  );
}