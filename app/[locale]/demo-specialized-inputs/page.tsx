import { getTranslations } from 'next-intl/server'
import { SpecializedInputsDemo } from "@/components/specialized-inputs-demo"

export default async function DemoSpecializedInputsPage() {
  const t = await getTranslations('common')

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Inputs Spécialisés</h1>
        <p className="text-muted-foreground">
          Démonstration des composants d'inputs spécialisés basés sur Origin UI
        </p>
      </div>
      <SpecializedInputsDemo />
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: 'Inputs Spécialisés - Démonstration',
    description: 'Collection de composants d\'inputs spécialisés pour différents cas d\'usage',
  }
}