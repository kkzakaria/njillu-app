import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/app-layout";
import { LogoutButton } from "./components/logout-button";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const claims = data.claims;

  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl space-y-6">
      {/* Header avec bouton de déconnexion */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Page Protégée</h1>
          <p className="text-muted-foreground mt-2">
            Bienvenue dans votre espace sécurisé !
          </p>
        </div>
        <LogoutButton />
      </div>

      {/* Informations utilisateur */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Informations de session
            <Badge variant="outline" className="text-xs">
              {claims.aud === 'authenticated' ? 'Connecté' : 'Non authentifié'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Détails de votre session JWT avec getClaims()
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{claims.email || 'Non disponible'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">ID Utilisateur</label>
              <p className="text-sm font-mono">{claims.sub}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Rôle</label>
              <p className="text-sm">{claims.role}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Expiration</label>
              <p className="text-sm">
                {new Date(claims.exp * 1000).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims JWT complets */}
      <Card>
        <CardHeader>
          <CardTitle>Claims JWT Complets</CardTitle>
          <CardDescription>
            Toutes les informations disponibles dans votre token JWT
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs font-mono p-4 rounded-lg bg-muted overflow-auto max-h-96 border">
            {JSON.stringify(claims, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Test de navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Test du système d&apos;authentification</CardTitle>
          <CardDescription>
            Testez le flux complet d&apos;authentification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>✅ Étape 1 :</strong> Vous êtes connecté et sur la page protégée</p>
            <p><strong>🔄 Étape 2 :</strong> Essayez d&apos;aller sur <code className="bg-muted px-1 rounded">/auth/login</code> → Vous serez redirigé ici</p>
            <p><strong>🚪 Étape 3 :</strong> Cliquez sur &ldquo;Se déconnecter&rdquo; → Vous irez sur la page de connexion</p>
            <p><strong>🔒 Étape 4 :</strong> Sans vous reconnecter, essayez de revenir ici → Vous serez redirigé vers login</p>
          </div>
        </CardContent>
      </Card>
      </div>
    </AppLayout>
  );
}