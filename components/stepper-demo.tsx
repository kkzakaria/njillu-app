"use client"

import { useState } from "react"
import { 
  Settings,
  User,
  CheckCircle,
  FileText,
  Upload,
  Package,
  Zap,
  ShoppingCart,
  Truck,
  MapPin,
  Target
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
  EnhancedStepper,
  ControlledStepper,
  WizardStepper,
  OnboardingStepper,
  CheckoutStepper,
  FormWizardStepper,
  ProcessStepper,
  ProgressStepper,
  CustomElementStepper,
} from "@/components/stepper"

export function StepperDemo() {
  const [selectedValues, setSelectedValues] = useState<Record<string, number>>({})
  const [progress, setProgress] = useState([25])
  const [autoProgress, setAutoProgress] = useState(false)

  const handleValueChange = (name: string) => (value: number) => {
    setSelectedValues(prev => ({ ...prev, [name]: value }))
  }

  const basicSteps = [
    { step: 1, title: "First Step", description: "Getting started" },
    { step: 2, title: "Second Step", description: "In progress" },
    { step: 3, title: "Third Step", description: "Almost done" },
    { step: 4, title: "Final Step", description: "Complete" },
  ]

  const iconSteps = [
    { step: 1, title: "Account", description: "Create your account", icon: User },
    { step: 2, title: "Profile", description: "Complete your profile", icon: FileText },
    { step: 3, title: "Settings", description: "Configure settings", icon: Settings },
    { step: 4, title: "Done", description: "All set!", icon: CheckCircle },
  ]

  const validationExample = async (step: number) => {
    // Simuler une validation
    await new Promise(resolve => setTimeout(resolve, 500))
    // Échouer sur l'étape 2 pour la démonstration
    if (step === 2) {
      return Math.random() > 0.5 // 50% de chance d'échouer
    }
    return true
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Stepper Components - Démonstration</h2>
        <p className="text-muted-foreground">
          Collection de composants Stepper avec différents styles et cas d&apos;usage pratiques
        </p>
        
        {Object.keys(selectedValues).length > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Étapes actives :</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {Object.entries(selectedValues).map(([name, value]) => (
                <div key={name} className="flex justify-between">
                  <span className="font-medium">{name}:</span>
                  <span className="text-muted-foreground">Step {value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Types de base */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">🎨 Types de base</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stepper horizontal simple</CardTitle>
              <CardDescription>Stepper de base avec numéros</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <EnhancedStepper
                defaultValue={2}
                orientation="horizontal"
                onValueChange={handleValueChange("horizontal-basic")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stepper avec titres</CardTitle>
              <CardDescription>Incluant titres et descriptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <EnhancedStepper
                steps={basicSteps}
                defaultValue={2}
                showTitles
                showDescriptions
                orientation="horizontal"
                onValueChange={handleValueChange("horizontal-titles")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stepper vertical</CardTitle>
              <CardDescription>Orientation verticale avec checkmarks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <EnhancedStepper
                defaultValue={2}
                orientation="vertical"
                onValueChange={handleValueChange("vertical-basic")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stepper vertical avec contenu</CardTitle>
              <CardDescription>Vertical avec titres et descriptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <EnhancedStepper
                steps={basicSteps}
                defaultValue={3}
                showTitles
                showDescriptions
                orientation="vertical"
                onValueChange={handleValueChange("vertical-content")}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Composants avec contrôles */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">🎮 Composants contrôlés</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings size={16} />
                Stepper contrôlé
              </CardTitle>
              <CardDescription>Avec boutons et états de chargement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ControlledStepper
                steps={iconSteps}
                defaultValue={1}
                showControls
                controlsPosition="bottom"
                onValueChange={handleValueChange("controlled")}
                onComplete={() => alert("Completed!")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Wizard avec validation</CardTitle>
              <CardDescription>Formulaire avec validation des étapes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <WizardStepper
                steps={basicSteps}
                defaultValue={1}
                showStepContent
                onStepValidation={validationExample}
                validateOnNext
                allowSkip={false}
                onValueChange={handleValueChange("wizard")}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Composants spécialisés */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">🎯 Composants spécialisés</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User size={16} />
                Onboarding
              </CardTitle>
              <CardDescription>Processus d&apos;intégration utilisateur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <OnboardingStepper
                userType="business"
                defaultValue={2}
                onValueChange={handleValueChange("onboarding")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart size={16} />
                Checkout
              </CardTitle>
              <CardDescription>Processus de commande e-commerce</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CheckoutStepper
                defaultValue={2}
                showControls
                onValueChange={handleValueChange("checkout")}
                onComplete={() => alert("Order placed!")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText size={16} />
                Formulaire Wizard
              </CardTitle>
              <CardDescription>Assistant de formulaire multi-étapes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormWizardStepper
                formType="application"
                defaultValue={1}
                showStepContent
                contentPosition="below"
                onValueChange={handleValueChange("form-wizard")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload size={16} />
                Processus automatique
              </CardTitle>
              <CardDescription>
                Progression automatique ou manuelle
                <div className="mt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setAutoProgress(!autoProgress)}
                  >
                    {autoProgress ? "Stop Auto" : "Start Auto"}
                  </Button>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProcessStepper
                processType="installation"
                autoProgress={autoProgress}
                onValueChange={handleValueChange("process")}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Variations et styles */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">🎨 Variations et styles</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stepper avec éléments mixtes</CardTitle>
              <CardDescription>Icônes, avatars et états de chargement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CustomElementStepper
                onValueChange={handleValueChange("custom-elements")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stepper de progression</CardTitle>
              <CardDescription>
                Avec barre de progression dynamique
                <div className="mt-2">
                  <Slider
                    value={progress}
                    onValueChange={setProgress}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProgressStepper
                progress={progress[0]}
                showProgress
                onValueChange={handleValueChange("progress")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tailles différentes</CardTitle>
              <CardDescription>Comparaison des tailles sm, md, lg</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-medium">Petite (sm)</p>
                <EnhancedStepper
                  defaultValue={2}
                  size="sm"
                  onValueChange={handleValueChange("size-sm")}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Moyenne (md)</p>
                <EnhancedStepper
                  defaultValue={2}
                  size="md"
                  onValueChange={handleValueChange("size-md")}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Grande (lg)</p>
                <EnhancedStepper
                  defaultValue={2}
                  size="lg"
                  onValueChange={handleValueChange("size-lg")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Variants de style</CardTitle>
              <CardDescription>Styles default, minimal, outlined, filled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-medium">Default</p>
                <EnhancedStepper
                  defaultValue={2}
                  variant="default"
                  onValueChange={handleValueChange("variant-default")}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Minimal</p>
                <EnhancedStepper
                  defaultValue={2}
                  variant="minimal"
                  onValueChange={handleValueChange("variant-minimal")}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Outlined</p>
                <EnhancedStepper
                  defaultValue={2}
                  variant="outlined"
                  onValueChange={handleValueChange("variant-outlined")}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Filled</p>
                <EnhancedStepper
                  defaultValue={2}
                  variant="filled"
                  onValueChange={handleValueChange("variant-filled")}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cas d'usage avancés */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">💼 Cas d&apos;usage avancés</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target size={16} />
                Suivi de projet
              </CardTitle>
              <CardDescription>Étapes de développement avec statuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <EnhancedStepper
                steps={[
                  { step: 1, title: "Planning", description: "Project planning phase", icon: FileText, completed: true },
                  { step: 2, title: "Development", description: "Development in progress", icon: Zap, loading: true },
                  { step: 3, title: "Testing", description: "Quality assurance", icon: CheckCircle },
                  { step: 4, title: "Deployment", description: "Production release", icon: Package },
                ]}
                value={2}
                showTitles
                showDescriptions
                interactive={false}
                orientation="vertical"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin size={16} />
                Suivi de livraison
              </CardTitle>
              <CardDescription>États de livraison en temps réel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <EnhancedStepper
                steps={[
                  { step: 1, title: "Commandé", description: "Commande confirmée", icon: ShoppingCart, completed: true },
                  { step: 2, title: "Préparation", description: "En cours de préparation", icon: Package, completed: true },
                  { step: 3, title: "Expédié", description: "En transit", icon: Truck, loading: true },
                  { step: 4, title: "Livré", description: "Livraison effectuée", icon: CheckCircle },
                ]}
                value={3}
                showTitles
                showDescriptions
                interactive={false}
                orientation="vertical"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📖 Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Composants disponibles :</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><code>EnhancedStepper</code> - Stepper de base avec options avancées</li>
                <li><code>ControlledStepper</code> - Stepper avec contrôles et états</li>
                <li><code>WizardStepper</code> - Assistant avec validation et contenu</li>
                <li><code>OnboardingStepper</code> - Processus d&apos;intégration</li>
                <li><code>CheckoutStepper</code> - Processus de commande</li>
                <li><code>FormWizardStepper</code> - Assistant de formulaire</li>
                <li><code>ProcessStepper</code> - Processus automatique</li>
                <li><code>ProgressStepper</code> - Avec barre de progression</li>
                <li><code>CustomElementStepper</code> - Éléments personnalisés</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Props principales :</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><code>steps</code> - Array d&apos;étapes avec titre, description, icône</li>
                <li><code>orientation</code> - &quot;horizontal&quot; | &quot;vertical&quot;</li>
                <li><code>defaultValue / value</code> - Étape courante</li>
                <li><code>onValueChange</code> - Callback de changement</li>
                <li><code>showTitles</code> - Afficher les titres</li>
                <li><code>showDescriptions</code> - Afficher les descriptions</li>
                <li><code>showControls</code> - Boutons de navigation</li>
                <li><code>size</code> - &quot;sm&quot; | &quot;md&quot; | &quot;lg&quot;</li>
                <li><code>variant</code> - &quot;default&quot; | &quot;minimal&quot; | &quot;outlined&quot; | &quot;filled&quot;</li>
                <li><code>interactive</code> - Permettre la navigation manuelle</li>
                <li><code>loading</code> - État de chargement global</li>
                <li><code>disabled</code> - Désactiver l&apos;interaction</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Fonctionnalités clés :</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>États des étapes :</strong>
                <ul className="mt-1 space-y-1">
                  <li>• <span className="text-muted-foreground">Inactive</span> - Pas encore atteinte</li>
                  <li>• <span className="text-primary">Active</span> - Étape courante</li>
                  <li>• <span className="text-primary">Completed</span> - Terminée avec checkmark</li>
                  <li>• <span className="text-muted-foreground">Loading</span> - En cours avec spinner</li>
                </ul>
              </div>
              <div>
                <strong>Accessibilité :</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Navigation clavier complète</li>
                  <li>• Attributs ARIA appropriés</li>
                  <li>• Régions live pour les changements</li>
                  <li>• Support des lecteurs d&apos;écran</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}