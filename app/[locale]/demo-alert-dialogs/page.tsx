import { AlertDialogsDemo } from "@/components/alert-dialogs-demo"

export default async function DemoAlertDialogsPage() {

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Alert Dialogs Améliorés</h1>
        <p className="text-muted-foreground">
          Démonstration des composants Alert Dialog spécialisés basés sur Origin UI
        </p>
      </div>
      <AlertDialogsDemo />
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: 'Alert Dialogs Améliorés - Démonstration',
    description: 'Collection de composants Alert Dialog spécialisés avec types, icônes, et modes de défilement',
  }
}