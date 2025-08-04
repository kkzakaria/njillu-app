import { StepperDemo } from '@/components/stepper-demo'

export default async function DemoSteppersPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Stepper Components Améliorés</h1>
        <p className="text-muted-foreground">
          Démonstration des composants Stepper spécialisés basés sur Origin UI
        </p>
      </div>
      <StepperDemo />
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: 'Stepper Components Améliorés - Démonstration',
    description: 'Collection de composants Stepper avec orientations, contrôles, validation et cas d\'usage spécialisés',
  }
}