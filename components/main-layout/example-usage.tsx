/**
 * Exemple d'utilisation du MainLayout
 * Ce fichier sert de référence pour l'intégration
 */

import { MainLayout } from '@/components/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function MainLayoutExample() {
  return (
    <MainLayout
      debugMode={false}
      appTitle="Mon Application"
      onNavigationClick={(item) => {
        console.log('Navigation vers:', item.href)
      }}
      onUserContextChange={(context) => {
        console.log('Contexte utilisateur:', context)
      }}
    >
      <div className="container mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Page avec MainLayout</h1>
          <p className="text-muted-foreground mt-2">
            Cette page utilise le nouveau MainLayout avec AppBar et Sidebar
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fonctionnalités MainLayout</CardTitle>
            <CardDescription>
              Layout optimisé pour les pages principales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">✅ Inclus</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• AppBar sticky avec navigation</li>
                  <li>• Sidebar responsive</li>
                  <li>• Zone de contenu flexible</li>
                  <li>• Mode debug optionnel</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium">❌ Exclu</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Header de page</li>
                  <li>• Footer global</li>
                  <li>• Éléments de démonstration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}