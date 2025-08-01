import { RadioGroupsDemo } from '@/components/radio-groups-demo'

export default async function DemoRadioGroupsPage() {

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Radio Groups Améliorés</h1>
        <p className="text-muted-foreground">
          Démonstration des composants Radio Groups spécialisés basés sur Origin UI
        </p>
      </div>
      <RadioGroupsDemo />
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: 'Radio Groups Améliorés - Démonstration',
    description: 'Collection de composants Radio Groups avec styles Card, Chip, couleurs personnalisables et cas d\'usage spécialisés',
  }
}