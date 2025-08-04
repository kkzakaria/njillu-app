import Link from 'next/link'
import { 
  Radio, 
  MessageSquare, 
  CheckSquare, 
  Calendar, 
  Type, 
  ChevronDown,
  AlertTriangle,
  Palette,
  ExternalLink,
  Navigation
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DemosPage() {
  const demos = [
    {
      title: 'Radio Groups Améliorés',
      description: 'Composants Radio Groups avec styles Card, Chip, couleurs personnalisables et cas d\'usage spécialisés',
      href: '/demo-radio-groups',
      icon: Radio,
      status: 'Nouveau',
      color: 'bg-blue-500'
    },
    {
      title: 'Alert Dialogs Améliorés', 
      description: 'Collection de composants Alert Dialog spécialisés avec types, icônes, et modes de défilement',
      href: '/demo-alert-dialogs',
      icon: MessageSquare,
      status: 'Stable',
      color: 'bg-green-500'
    },
    {
      title: 'Inputs Spécialisés',
      description: 'Inputs avancés : numérique, téléphone, masqué avec validation et formatage automatique',
      href: '/demo-specialized-inputs',
      icon: Type,
      status: 'Stable',
      color: 'bg-purple-500'
    },
    {
      title: 'Checkboxes Améliorées',
      description: 'Checkboxes avec positions d\'étiquettes flexibles et états personnalisés',
      href: '/demo-checkbox',
      icon: CheckSquare,
      status: 'Stable',
      color: 'bg-orange-500'
    },
    {
      title: 'DatePicker Natif',
      description: 'DatePicker compatible React 19 avec validation et formatage',
      href: '/demo-datepicker',
      icon: Calendar,
      status: 'Stable',
      color: 'bg-teal-500'
    },
    {
      title: 'Select Avancé',
      description: 'Composants Select avec recherche, multi-sélection et options avancées',
      href: '/demo-select',
      icon: ChevronDown,
      status: 'Stable',
      color: 'bg-indigo-500'
    },
    {
      title: 'Select Alternative',
      description: 'Alternative de Select avec interface personnalisée',
      href: '/demo-select-alternative',
      icon: ChevronDown,
      status: 'Beta',
      color: 'bg-yellow-500'
    },
    {
      title: 'Système d\'Alertes',
      description: 'Système de notifications toast avec positions et animations',
      href: '/demo-alert',
      icon: AlertTriangle,
      status: 'Stable',
      color: 'bg-red-500'
    },
    {
      title: 'Stepper Améliorés',
      description: 'Composants Stepper avec contrôles, validation et cas d\'usage spécialisés',
      href: '/demo-steppers',
      icon: Navigation,
      status: 'Nouveau',
      color: 'bg-cyan-500'
    }
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Démonstrations des Composants</h1>
        <p className="text-xl text-muted-foreground">
          Explorez notre collection complète de composants UI améliorés basés sur Origin UI et shadcn/ui
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demos.map((demo) => (
          <Card key={demo.href} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${demo.color} text-white`}>
                    <demo.icon size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {demo.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        demo.status === 'Nouveau' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        demo.status === 'Beta' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {demo.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm mb-4 line-clamp-3">
                {demo.description}
              </CardDescription>
              <Button asChild className="w-full group-hover:shadow-md transition-shadow">
                <Link href={demo.href} className="flex items-center justify-center gap-2">
                  Voir la démo
                  <ExternalLink size={16} />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-6 bg-muted/50 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Palette size={24} />
          À propos de cette collection
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Technologies utilisées :</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Origin UI</strong> - Composants de base modernes</li>
              <li>• <strong>shadcn/ui</strong> - Système de design</li>
              <li>• <strong>Radix UI</strong> - Primitives accessibles</li>
              <li>• <strong>Tailwind CSS</strong> - Styles utilitaires</li>
              <li>• <strong>Class Variance Authority</strong> - Variants typés</li>
              <li>• <strong>TypeScript</strong> - Type safety</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Fonctionnalités clés :</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Modulaire</strong> - Architecture en composants réutilisables</li>
              <li>• <strong>Accessible</strong> - Support ARIA et navigation clavier</li>
              <li>• <strong>Responsive</strong> - Optimisé pour tous les écrans</li>
              <li>• <strong>Thème</strong> - Support mode sombre/clair</li>
              <li>• <strong>Validation</strong> - États d&apos;erreur et validation</li>
              <li>• <strong>Performance</strong> - Optimisé pour la production</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: 'Démonstrations des Composants UI',
    description: 'Collection complète de composants UI améliorés basés sur Origin UI et shadcn/ui avec TypeScript',
  }
}