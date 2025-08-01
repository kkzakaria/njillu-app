# Radio Groups System

Collection complète de composants Radio Groups basés sur Origin UI avec TypeScript, styles personnalisables et architecture modulaire.

## 🎯 Vue d'ensemble

Le système Radio Groups offre 3 styles principaux avec 9 composants spécialisés pour couvrir tous les cas d'usage :

- **EnhancedRadioGroup** - Radio standard avec couleurs personnalisables
- **CardRadioGroup** - Style card/cartes avec layout flexible
- **ChipRadioGroup** - Style chip/badge compact
- **6 composants spécialisés** pour des cas d'usage spécifiques

## 📦 Installation et Import

```typescript
// Import des composants principaux
import {
  EnhancedRadioGroup,
  CardRadioGroup,
  ChipRadioGroup
} from '@/components/radio'

// Import des composants spécialisés
import {
  CPURadioGroup,
  ServerLocationRadioGroup,
  ColorSchemeRadioGroup,
  PlanRadioGroup,
  LanguageRadioGroup,
  NotificationRadioGroup
} from '@/components/radio'

// Import des types
import type {
  RadioOption,
  BaseRadioProps,
  ColoredRadioProps,
  CardRadioProps,
  ChipRadioProps
} from '@/components/radio'
```

## 🎨 Composants principaux

### EnhancedRadioGroup

Radio group standard avec couleurs personnalisables et support des descriptions.

```typescript
import { EnhancedRadioGroup } from '@/components/radio'

const options = [
  { value: "basic", label: "Plan Basic", description: "Perfect for small projects" },
  { value: "pro", label: "Plan Pro", description: "For professional use" },
  { value: "enterprise", label: "Enterprise", description: "Advanced features", disabled: true },
]

<EnhancedRadioGroup
  options={options}
  legend="Choose your plan"
  name="pricing"
  colorScheme="indigo"
  required
  defaultValue="basic"
  onValueChange={(value) => console.log(value)}
/>
```

**Props spécifiques :**
- `colorScheme`: `"default" | "primary" | "indigo" | "blue" | "green" | "red" | ...`
- `orientation`: `"horizontal" | "vertical"`
- `legend`: Titre du groupe (optionnel)
- `description`: Description sous le titre
- `error`: Message d'erreur à afficher

### CardRadioGroup

Style card avec layouts flexibles, idéal pour des options avec plus de contenu.

```typescript
import { CardRadioGroup } from '@/components/radio'

const serverOptions = [
  { 
    value: "2gb", 
    label: "2 GB RAM", 
    description: "Perfect for small apps",
    icon: Server 
  },
  { 
    value: "4gb", 
    label: "4 GB RAM", 
    description: "Good for medium apps" 
  },
]

<CardRadioGroup
  options={serverOptions}
  legend="Memory Configuration"
  layout="grid"
  columns={2}
  cardSize="md"
  showIcons
  defaultValue="2gb"
  onValueChange={(value) => console.log(value)}
/>
```

**Props spécifiques :**
- `layout`: `"grid" | "flex"`
- `columns`: `1 | 2 | 3 | 4 | 5 | 6` (pour layout grid)
- `cardSize`: `"sm" | "md" | "lg"`
- `showIcons`: Afficher les icônes dans les cards

### ChipRadioGroup

Style chip/badge compact pour des sélections dans un espace restreint.

```typescript
import { ChipRadioGroup } from '@/components/radio'

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

<ChipRadioGroup
  options={themeOptions}
  legend="Theme"
  size="md"
  variant="outline"
  defaultValue="system"
  onValueChange={(value) => console.log(value)}
/>
```

**Props spécifiques :**
- `size`: `"sm" | "md" | "lg"`
- `variant`: `"default" | "outline" | "filled"`

## 🎯 Composants spécialisés

### CPURadioGroup

Sélection de cores CPU avec limitation configurable.

```typescript
import { CPURadioGroup } from '@/components/radio'

<CPURadioGroup
  name="cpu"
  maxCores={16}
  defaultValue="4"
  onValueChange={(cores) => console.log(`Selected ${cores} cores`)}
/>
```

**Props spécifiques :**
- `maxCores`: `4 | 8 | 12 | 16 | 24 | 32` - Limite le nombre de cores disponibles

### ServerLocationRadioGroup

Choix de localisation serveur avec descriptions détaillées.

```typescript
import { ServerLocationRadioGroup } from '@/components/radio'

<ServerLocationRadioGroup
  name="location"
  defaultValue="france"
  onValueChange={(location) => console.log(`Server in ${location}`)}
/>
```

### ColorSchemeRadioGroup

Sélection de thème avec style chip.

```typescript
import { ColorSchemeRadioGroup } from '@/components/radio'

<ColorSchemeRadioGroup
  name="theme"
  size="sm"
  defaultValue="system"
  onValueChange={(theme) => setTheme(theme)}
/>
```

### PlanRadioGroup

Plans d'abonnement avec icônes et layout cards.

```typescript
import { PlanRadioGroup } from '@/components/radio'

<PlanRadioGroup
  name="pricing"
  defaultValue="pro"
  onValueChange={(plan) => console.log(`Selected ${plan} plan`)}
/>
```

### LanguageRadioGroup

Sélection de langue avec chips colorés.

```typescript
import { LanguageRadioGroup } from '@/components/radio'

<LanguageRadioGroup
  name="language"
  size="sm"
  variant="filled"
  defaultValue="fr"
  onValueChange={(lang) => changeLanguage(lang)}
/>
```

### NotificationRadioGroup

Préférences de notifications avec couleur indigo.

```typescript
import { NotificationRadioGroup } from '@/components/radio'

<NotificationRadioGroup
  name="notifications"
  defaultValue="important"
  onValueChange={(pref) => updateNotificationSettings(pref)}
/>
```

## 📋 Interface RadioOption

```typescript
interface RadioOption {
  value: string                    // Valeur unique de l'option
  label: string                    // Texte affiché
  description?: string             // Description optionnelle
  disabled?: boolean               // Option désactivée
  icon?: React.ComponentType<{     // Icône optionnelle (Lucide React)
    size?: number
    className?: string
  }>
}
```

## 🎛️ Props communes

Toutes les props communes héritées de `BaseRadioProps` :

```typescript
interface BaseRadioProps {
  options: RadioOption[]           // Options du radio group
  name?: string                   // Nom du group (pour les formulaires)
  defaultValue?: string           // Valeur par défaut
  value?: string                  // Valeur contrôlée
  onValueChange?: (value: string) => void  // Callback de changement
  orientation?: "horizontal" | "vertical"  // Orientation du layout
  className?: string              // Classes CSS additionnelles
  disabled?: boolean              // Groupe entièrement désactivé
  required?: boolean              // Champ requis
  "aria-label"?: string          // Label ARIA
  "aria-describedby"?: string    // Description ARIA
}
```

## 🎨 Styles et variantes

### Couleurs disponibles (EnhancedRadioGroup)

```typescript
type RadioColorScheme = 
  | "default"     // Couleur par défaut du thème
  | "primary"     // Couleur primaire
  | "secondary"   // Couleur secondaire
  | "success"     // Vert
  | "warning"     // Orange
  | "error"       // Rouge
  | "indigo"      // Indigo
  | "blue"        // Bleu
  | "green"       // Vert
  | "red"         // Rouge
```

### Tailles disponibles

```typescript
type RadioSize = "sm" | "md" | "lg"
```

### Variantes de style

```typescript
// Pour ChipRadioGroup
type ChipVariant = "default" | "outline" | "filled"

// Pour CardRadioGroup  
type CardVariant = "default" | "outline" | "filled"
```

## 🔧 Exemples d'usage avancés

### Radio avec validation et gestion d'erreurs

```typescript
import { useState } from 'react'
import { EnhancedRadioGroup } from '@/components/radio'

function MyForm() {
  const [selectedPlan, setSelectedPlan] = useState("")
  const [error, setError] = useState("")

  const plans = [
    { value: "free", label: "Free", description: "Limited features" },
    { value: "pro", label: "Pro", description: "Full features" },
  ]

  const handleSubmit = () => {
    if (!selectedPlan) {
      setError("Please select a plan")
      return
    }
    setError("")
    // Submit logic
  }

  return (
    <EnhancedRadioGroup
      options={plans}
      legend="Choose your plan"
      name="plan"
      value={selectedPlan}
      onValueChange={setSelectedPlan}
      required
      error={error}
      colorScheme="primary"
    />
  )
}
```

### Radio cards avec icônes et layout personnalisé

```typescript
import { Cpu, HardDrive, Wifi } from 'lucide-react'
import { CardRadioGroup } from '@/components/radio'

const serverSpecs = [
  {
    value: "basic",
    label: "Basic Server",
    description: "2 CPU, 4GB RAM, 50GB SSD",
    icon: Cpu
  },
  {
    value: "pro", 
    label: "Pro Server",
    description: "4 CPU, 8GB RAM, 100GB SSD",
    icon: HardDrive
  },
  {
    value: "enterprise",
    label: "Enterprise Server", 
    description: "8 CPU, 16GB RAM, 200GB SSD",
    icon: Wifi
  }
]

<CardRadioGroup
  options={serverSpecs}
  legend="Server Configuration"
  layout="grid"
  columns={3}
  cardSize="lg"
  showIcons
  name="server"
  onValueChange={(spec) => updateServerConfig(spec)}
/>
```

### Radio chips avec gestion d'état

```typescript
import { useState } from 'react'
import { ChipRadioGroup } from '@/components/radio'

function LanguageSelector() {
  const [language, setLanguage] = useState("en")
  
  const languages = [
    { value: "en", label: "English" },
    { value: "fr", label: "Français" },
    { value: "es", label: "Español" },
    { value: "de", label: "Deutsch" }
  ]

  return (
    <ChipRadioGroup
      options={languages}
      legend="Select Language"
      value={language}
      onValueChange={setLanguage}
      size="sm"
      variant="filled"
      name="language"
    />
  )
}
```

## ♿ Accessibilité

Tous les composants suivent les bonnes pratiques d'accessibilité :

- **ARIA Labels** : Support complet des attributs ARIA
- **Navigation clavier** : Navigation avec Tab et flèches
- **Screen readers** : Labels et descriptions appropriés
- **Focus management** : Gestion correcte du focus
- **États visuels** : Indicateurs visuels pour tous les états

### Exemple avec support ARIA complet

```typescript
<EnhancedRadioGroup
  options={options}
  legend="Payment Method"
  name="payment"
  aria-label="Select your preferred payment method"
  aria-describedby="payment-help"
  required
  onValueChange={handlePaymentChange}
/>
<p id="payment-help" className="text-sm text-muted-foreground">
  Choose how you want to pay for your subscription
</p>
```

## 🏗️ Architecture technique

### Structure des fichiers

```
components/radio/
├── types.ts                 # Interfaces TypeScript
├── variants.ts              # Class Variance Authority variants
├── enhanced-radio.tsx       # Radio standard avec couleurs
├── card-radio.tsx          # Style card/cartes
├── chip-radio.tsx          # Style chip/badge
├── specialized-radios.tsx  # Composants prédéfinis
├── index.ts               # Exports centralisés
└── README.md              # Cette documentation
```

### Dépendances

- **Radix UI** - Primitives accessibles
- **Class Variance Authority** - Gestion des variantes
- **Tailwind CSS** - Styles utilitaires
- **Lucide React** - Icônes
- **React** - Hooks et forwardRef

### Extensibilité

Le système est conçu pour être facilement extensible :

1. **Nouveaux styles** : Ajoutez des variantes dans `variants.ts`
2. **Nouveaux composants** : Créez des composants spécialisés dans `specialized-radios.tsx`
3. **Nouvelles couleurs** : Étendez `colorSchemeVariants`
4. **Props personnalisées** : Étendez les interfaces dans `types.ts`

## 📱 Responsive Design

Tous les composants sont responsive par défaut :

```typescript
// Layout adaptatif pour les cards
<CardRadioGroup
  layout="grid"
  columns={3}  // 3 colonnes sur desktop
  className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"  // Responsive
/>

// Chips qui s'adaptent à la largeur
<ChipRadioGroup
  className="flex-wrap"  // Retour à la ligne automatique
/>
```

## 🎯 Bonnes pratiques

### 1. Nommage des options

```typescript
// ✅ Bon : Valeurs claires et consistantes
const plans = [
  { value: "free", label: "Free Plan" },
  { value: "pro", label: "Pro Plan" },
  { value: "enterprise", label: "Enterprise Plan" }
]

// ❌ Éviter : Valeurs numériques ou ambiguës
const plans = [
  { value: "1", label: "Plan 1" },
  { value: "2", label: "Plan 2" }
]
```

### 2. Gestion des états

```typescript
// ✅ Bon : État contrôlé avec validation
const [selected, setSelected] = useState("")
const [error, setError] = useState("")

const handleChange = (value: string) => {
  setSelected(value)
  if (error) setError("") // Efface l'erreur quand l'utilisateur sélectionne
}

// ✅ Bon : Valeur par défaut appropriée
<EnhancedRadioGroup
  defaultValue="recommended" // Option recommandée pré-sélectionnée
/>
```

### 3. Descriptions utiles

```typescript
// ✅ Bon : Descriptions qui aident à la décision
const options = [
  { 
    value: "monthly", 
    label: "Monthly", 
    description: "Cancel anytime, $10/month" 
  },
  { 
    value: "yearly", 
    label: "Yearly", 
    description: "Save 20%, $96/year" 
  }
]
```

### 4. Accessibilité

```typescript
// ✅ Bon : Labels et descriptions ARIA appropriés
<EnhancedRadioGroup
  legend="Billing Cycle"
  aria-describedby="billing-help"
  required
/>
<p id="billing-help">Choose how often you want to be billed</p>
```

## 🐛 Dépannage

### Les radio buttons ne se sélectionnent pas

- Vérifiez que chaque option a une `value` unique
- Assurez-vous que `name` est défini pour les groupes
- Pour un composant contrôlé, vérifiez `value` et `onValueChange`

### Les styles ne s'appliquent pas

- Vérifiez que Tailwind CSS est configuré
- Les classes CSS personnalisées peuvent être surchargées
- Utilisez `className` pour les styles additionnels

### Les icônes ne s'affichent pas

- Vérifiez l'import des icônes Lucide React
- Pour les cards, assurez-vous que `showIcons={true}`
- Vérifiez que `icon` est bien une référence de composant (pas une instance)

### Problèmes d'accessibilité

- Utilisez toujours `legend` pour décrire le groupe
- Ajoutez `aria-describedby` pour les descriptions supplémentaires
- Testez avec un lecteur d'écran

## 📄 Licence

Ce composant fait partie du système de composants basé sur shadcn/ui et Origin UI. Consultez la licence du projet pour plus d'informations.