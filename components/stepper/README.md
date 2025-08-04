# Stepper Components System

Collection complète de composants Stepper modernes basés sur Origin UI avec TypeScript, validation, et cas d'usage spécialisés.

## Vue d'ensemble

Le système Stepper Components propose une architecture modulaire avec 9 composants couvrant tous les cas d'usage : navigation séquentielle, assistants de formulaire, processus automatiques, et workflows d'intégration.

### ✨ Fonctionnalités clés

- **🎨 Styles multiples** : Horizontal, vertical, minimal, outlined, filled
- **🎮 Contrôles avancés** : Navigation, validation, états de chargement
- **🧩 Architecture modulaire** : Composants réutilisables et extensibles
- **♿ Accessibilité** : Support ARIA, navigation clavier, lecteurs d'écran
- **📱 Responsive** : Optimisé pour tous les écrans
- **🎯 Spécialisations** : Onboarding, checkout, formulaires, processus
- **⚡ Performance** : Optimisé avec React.memo et callbacks stabilisés
- **🔧 TypeScript** : Types complets et validation statique

## Architecture

```
components/stepper/
├── index.ts                    # Exports centralisés
├── types.ts                    # Interfaces TypeScript
├── variants.ts                 # Variants CVA pour styling
├── enhanced-stepper.tsx        # Composant de base avancé
├── controlled-stepper.tsx      # Stepper avec contrôles navigation
├── wizard-stepper.tsx          # Assistant avec validation
└── specialized-steppers.tsx    # 6 composants spécialisés
```

## Composants disponibles

### 1. EnhancedStepper
Composant de base avec options avancées.

```tsx
import { EnhancedStepper } from '@/components/stepper'

<EnhancedStepper
  steps={[
    { step: 1, title: "Profile", description: "Setup profile", icon: User },
    { step: 2, title: "Settings", description: "Configure", icon: Settings }
  ]}
  defaultValue={1}
  orientation="horizontal"
  showTitles
  showDescriptions
  size="md"
  variant="default"
  onValueChange={(step) => console.log(step)}
/>
```

### 2. ControlledStepper
Stepper avec boutons de navigation et états de chargement.

```tsx
import { ControlledStepper } from '@/components/stepper'

<ControlledStepper
  steps={steps}
  showControls
  controlsPosition="bottom"
  nextLabel="Suivant"
  prevLabel="Précédent"
  finishLabel="Terminer"
  loading={false}
  onComplete={() => alert("Completed!")}
/>
```

### 3. WizardStepper
Assistant avec validation des étapes et contenu personnalisé.

```tsx
import { WizardStepper } from '@/components/stepper'

<WizardStepper
  steps={steps}
  showStepContent
  contentPosition="below"
  onStepValidation={async (step) => {
    // Validation logic
    return step !== 2 || Math.random() > 0.5
  }}
  validateOnNext
  allowSkip={false}
  renderStepContent={(step, data) => (
    <div>Custom content for step {step}</div>
  )}
/>
```

### 4. OnboardingStepper
Processus d'intégration utilisateur avec types d'utilisateurs.

```tsx
import { OnboardingStepper } from '@/components/stepper'

<OnboardingStepper
  userType="business" // "individual" | "business" | "enterprise"
  defaultValue={1}
  onValueChange={(step) => console.log(step)}
/>
```

### 5. CheckoutStepper
Processus de commande e-commerce.

```tsx
import { CheckoutStepper } from '@/components/stepper'

<CheckoutStepper
  defaultValue={1}
  showControls
  onComplete={() => console.log("Order placed!")}
/>
```

### 6. FormWizardStepper
Assistant de formulaire multi-étapes avec types prédéfinis.

```tsx
import { FormWizardStepper } from '@/components/stepper'

<FormWizardStepper
  formType="application" // "survey" | "application" | "registration"
  showStepContent
  contentPosition="below"
  allowSkip={formType === "survey"}
  validateOnNext={formType === "application"}
/>
```

### 7. ProcessStepper
Processus automatique ou manuel avec progression.

```tsx
import { ProcessStepper } from '@/components/stepper'

<ProcessStepper
  processType="installation" // "upload" | "download" | "installation" | "deployment"
  autoProgress={true}
  onValueChange={(step) => console.log(step)}
/>
```

### 8. ProgressStepper
Stepper avec barre de progression intégrée.

```tsx
import { ProgressStepper } from '@/components/stepper'

<ProgressStepper
  progress={75}
  showProgress
  onValueChange={(step) => console.log(step)}
/>
```

### 9. CustomElementStepper
Démonstration d'éléments personnalisés (avatars, icônes).

```tsx
import { CustomElementStepper } from '@/components/stepper'

<CustomElementStepper
  onValueChange={(step) => console.log(step)}
/>
```

## Props et API

### BaseStepperProps
```typescript
interface BaseStepperProps {
  steps?: StepDefinition[]
  defaultValue?: number
  value?: number
  onValueChange?: (value: number) => void
  orientation?: "horizontal" | "vertical"
  className?: string
  disabled?: boolean
}
```

### StepDefinition
```typescript
interface StepDefinition {
  step: number
  title?: string
  description?: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  image?: string
  content?: React.ReactNode
  disabled?: boolean
  loading?: boolean
  completed?: boolean
}
```

### EnhancedStepperProps
```typescript
interface EnhancedStepperProps extends BaseStepperProps {
  showTitles?: boolean
  showDescriptions?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "minimal" | "outlined" | "filled"
  interactive?: boolean
  loading?: boolean
}
```

### ControlledStepperProps
```typescript
interface ControlledStepperProps extends EnhancedStepperProps {
  showControls?: boolean
  controlsPosition?: "top" | "bottom" | "both"
  nextLabel?: string
  prevLabel?: string
  finishLabel?: string
  onComplete?: () => void | Promise<void>
  loading?: boolean
}
```

### FormStepperProps
```typescript
interface FormStepperProps extends BaseStepperProps {
  onStepValidation?: (step: number) => boolean | Promise<boolean>
  allowSkip?: boolean
  validateOnNext?: boolean
}
```

## Styles et variants

### Tailles
- `sm` : Compact, espacement réduit
- `md` : Taille standard (défaut)
- `lg` : Grande taille, plus d'espacement

### Variants
- `default` : Style standard
- `minimal` : Style épuré, espacement minimal
- `outlined` : Avec bordure et padding
- `filled` : Arrière-plan coloré

### Orientations
- `horizontal` : Navigation horizontale (défaut)
- `vertical` : Navigation verticale

## États des étapes

### États visuels
- **Inactive** : Étape pas encore atteinte (gris)
- **Active** : Étape courante (couleur primaire)
- **Completed** : Étape terminée (checkmark vert)
- **Loading** : Étape en cours (spinner animé)
- **Error** : Étape avec erreur (rouge, validation échouée)

### Gestion des états
```typescript
const steps = [
  { step: 1, completed: true },           // Terminée
  { step: 2, loading: true },             // En cours
  { step: 3, disabled: true },            // Désactivée
  { step: 4 }                             // Inactive
]
```

## Accessibilité

### Support ARIA
- `role="group"` pour le container stepper
- `aria-label` et `aria-describedby` pour les étapes
- `aria-current="step"` pour l'étape active
- `aria-live="polite"` pour les annonces de changement

### Navigation clavier
- `Tab` / `Shift+Tab` : Navigation entre les étapes interactives
- `Enter` / `Space` : Activation d'une étape
- `Arrow Keys` : Navigation directionnelle

### Lecteurs d'écran
- Annonces automatiques des changements d'étape
- Descriptions contextuelles pour chaque état
- Support des régions live pour les mises à jour

## Validation et gestion d'erreurs

### Validation synchrone
```typescript
const validateStep = (step: number): boolean => {
  switch (step) {
    case 1:
      return email.includes('@')
    case 2:
      return password.length >= 8
    default:
      return true
  }
}
```

### Validation asynchrone
```typescript
const validateStepAsync = async (step: number): Promise<boolean> => {
  try {
    const response = await api.validateStep(step, formData)
    return response.valid
  } catch (error) {
    throw new Error(`Validation failed: ${error.message}`)
  }
}
```

### Gestion d'erreurs
```typescript
<WizardStepper
  onStepValidation={validateStepAsync}
  validateOnNext={true}
  allowSkip={false}
  // Les erreurs sont automatiquement affichées
/>
```

## Cas d'usage avancés

### Stepper de suivi de projet
```tsx
const projectSteps = [
  { 
    step: 1, 
    title: "Planning", 
    description: "Project planning phase", 
    icon: FileText, 
    completed: true 
  },
  { 
    step: 2, 
    title: "Development", 
    description: "Development in progress", 
    icon: Zap, 
    loading: true 
  },
  { 
    step: 3, 
    title: "Testing", 
    description: "Quality assurance", 
    icon: CheckCircle 
  },
  { 
    step: 4, 
    title: "Deployment", 
    description: "Production release", 
    icon: Package 
  }
]

<EnhancedStepper
  steps={projectSteps}
  value={2}
  showTitles
  showDescriptions
  interactive={false}
  orientation="vertical"
/>
```

### Stepper de livraison en temps réel
```tsx
const deliverySteps = [
  { 
    step: 1, 
    title: "Commandé", 
    description: "Commande confirmée", 
    icon: ShoppingCart, 
    completed: true 
  },
  { 
    step: 2, 
    title: "Préparation", 
    description: "En cours de préparation", 
    icon: Package, 
    completed: true 
  },
  { 
    step: 3, 
    title: "Expédié", 
    description: "En transit", 
    icon: Truck, 
    loading: true 
  },
  { 
    step: 4, 
    title: "Livré", 
    description: "Livraison effectuée", 
    icon: CheckCircle 
  }
]
```

### Wizard avec contenu personnalisé
```tsx
const renderStepContent = (step: number, stepData: any) => {
  switch (step) {
    case 1:
      return <PersonalInfoForm data={stepData} />
    case 2:
      return <DocumentUpload data={stepData} />
    case 3:
      return <ReviewStep data={stepData} />
    default:
      return <div>Default content</div>
  }
}

<WizardStepper
  steps={applicationSteps}
  showStepContent
  contentPosition="side"
  renderStepContent={renderStepContent}
  onStepValidation={validateApplicationStep}
/>
```

## Intégration avec des formulaires

### React Hook Form
```tsx
import { useForm } from 'react-hook-form'

const MultiStepForm = () => {
  const { register, handleSubmit, trigger, formState } = useForm()
  const [currentStep, setCurrentStep] = useState(1)

  const validateStep = async (step: number) => {
    const fields = getFieldsForStep(step)
    return await trigger(fields)
  }

  return (
    <WizardStepper
      value={currentStep}
      onValueChange={setCurrentStep}
      onStepValidation={validateStep}
      validateOnNext
      renderStepContent={(step) => (
        <FormSection step={step} register={register} errors={formState.errors} />
      )}
    />
  )
}
```

### Formik
```tsx
import { Formik, Form } from 'formik'

const FormikWizard = () => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchemas[currentStep]}
      onSubmit={handleSubmit}
    >
      {({ validateForm, setFieldTouched }) => (
        <WizardStepper
          onStepValidation={async () => {
            const errors = await validateForm()
            return Object.keys(errors).length === 0
          }}
          renderStepContent={(step) => (
            <Form>
              <StepFields step={step} />
            </Form>
          )}
        />
      )}
    </Formik>
  )
}
```

## Performance et optimisation

### Mémoïsation des composants
```tsx
const MemoizedStepper = React.memo(EnhancedStepper, (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.steps.length === nextProps.steps.length &&
    prevProps.orientation === nextProps.orientation
  )
})
```

### Callbacks stabilisés
```tsx
const handleStepChange = useCallback((step: number) => {
  // Logic here
}, [dependencies])

const validateStep = useCallback(async (step: number) => {
  // Validation logic
}, [formData])
```

### Lazy loading du contenu
```tsx
const LazyStepContent = React.lazy(() => import('./StepContent'))

const renderStepContent = (step: number) => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazyStepContent step={step} />
  </Suspense>
)
```

## Personnalisation et theming

### CSS Variables personnalisées
```css
.stepper-custom {
  --stepper-indicator-size: 32px;
  --stepper-separator-width: 2px;
  --stepper-spacing: 16px;
  --stepper-active-color: theme(colors.blue.500);
  --stepper-completed-color: theme(colors.green.500);
  --stepper-inactive-color: theme(colors.gray.300);
}
```

### Classes Tailwind personnalisées
```tsx
<EnhancedStepper
  className="stepper-custom"
  steps={steps}
  // Autres props
/>
```

### Variants CVA étendus
```typescript
// Dans variants.ts
export const customStepperVariants = cva(
  "group/stepper inline-flex",
  {
    variants: {
      theme: {
        corporate: "text-blue-600 bg-blue-50",
        creative: "text-purple-600 bg-purple-50",
        minimal: "text-gray-600 bg-gray-50"
      }
    }
  }
)
```

## Tests et debugging

### Tests unitaires avec Jest
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { EnhancedStepper } from '../enhanced-stepper'

describe('EnhancedStepper', () => {
  const mockSteps = [
    { step: 1, title: 'Step 1' },
    { step: 2, title: 'Step 2' }
  ]

  it('renders all steps', () => {
    render(<EnhancedStepper steps={mockSteps} />)
    
    expect(screen.getByText('Step 1')).toBeInTheDocument()
    expect(screen.getByText('Step 2')).toBeInTheDocument()
  })

  it('calls onValueChange when step is clicked', () => {
    const handleChange = jest.fn()
    render(
      <EnhancedStepper 
        steps={mockSteps} 
        onValueChange={handleChange}
        interactive 
      />
    )
    
    fireEvent.click(screen.getByText('Step 2'))
    expect(handleChange).toHaveBeenCalledWith(2)
  })
})
```

### Tests d'accessibilité
```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('should not have accessibility violations', async () => {
  const { container } = render(<EnhancedStepper steps={mockSteps} />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## Dépannage

### Problèmes courants

#### Les étapes ne s'affichent pas
- Vérifiez que `steps` est un array valide
- Assurez-vous que chaque step a un `step` number unique
- Vérifiez les imports des icônes

#### La validation ne fonctionne pas
- Vérifiez que `onStepValidation` retourne bien un boolean ou Promise<boolean>
- Assurez-vous que `validateOnNext` est à `true`
- Vérifiez la gestion des erreurs async/await

#### Problèmes de styling
- Vérifiez que Tailwind CSS est configuré correctement
- Assurez-vous que les variants CVA sont importés
- Vérifiez les conflits de classes CSS

### Debug mode
```tsx
const DEBUG = process.env.NODE_ENV === 'development'

<EnhancedStepper
  steps={steps}
  onValueChange={(step) => {
    if (DEBUG) console.log('Step changed:', step)
    handleStepChange(step)
  }}
/>
```

## Changelog et versions

### v1.0.0 - Version initiale
- 9 composants stepper complets
- Support TypeScript complet
- Accessibilité WCAG 2.1 AA
- Documentation complète
- Tests unitaires et d'intégration

### Roadmap
- [ ] Support animations avec Framer Motion
- [ ] Thèmes prédéfinis supplémentaires
- [ ] Stepper circulaire/radial
- [ ] Intégration React Router
- [ ] Mode multi-sélection
- [ ] Stepper avec timeline
- [ ] Support SSR optimisé

## Contributing

Les contributions sont les bienvenues ! Veuillez suivre les guidelines :

1. Fork le projet
2. Créer une feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branch (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de code
- TypeScript strict mode
- ESLint + Prettier
- Tests unitaires obligatoires
- Documentation mise à jour
- Accessibilité WCAG 2.1 AA

## Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Support

- 📧 Email: support@example.com
- 💬 Discord: [Server Invite](https://discord.gg/example)
- 📚 Documentation: [Docs Site](https://docs.example.com)
- 🐛 Issues: [GitHub Issues](https://github.com/example/repo/issues)