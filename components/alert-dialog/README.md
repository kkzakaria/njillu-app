# Alert Dialog System

Un système complet de dialogs d'alerte modulaire et extensible basé sur Radix UI, shadcn/ui et Origin UI, offrant une gamme complète de composants spécialisés pour différents cas d'usage.

## 🚀 Vue d'ensemble

Le système Alert Dialog propose une architecture modulaire avec :
- **11 composants spécialisés** pour différents cas d'usage
- **6 types d'alertes** avec icônes et styles appropriés
- **5 modes de défilement** incluant sticky header/footer
- **4 tailles** adaptables aux différents contenus
- **Sécurité renforcée** avec confirmation textuelle pour suppressions critiques
- **Support TypeScript complet** avec types stricts
- **Accessibilité** conforme WCAG avec DialogTitle/DialogDescription

## 📦 Installation et Import

```tsx
import {
  // Composant principal
  EnhancedAlertDialog,
  
  // Composants spécialisés
  ConfirmDialog,
  DeleteDialog,
  LogoutDialog,
  SaveDialog,
  InfoDialog,
  SuccessDialog,
  ErrorDialog,
  WarningDialog,
  
  // Suppressions avec confirmation
  ConfirmationDeleteDialog,
  CriticalDeleteDialog,
  
  // Types
  type BaseAlertDialogProps,
  type ConfirmationDeleteDialogProps,
} from "@/components/alert-dialog"
```

## 🎨 Types et Variantes

### Types d'Alerte
- `default` - Style neutre
- `info` - Information (bleu)
- `success` - Succès (vert)
- `warning` - Avertissement (orange)
- `error` - Erreur (rouge)
- `question` - Question (violet)

### Tailles Disponibles
- `sm` - Petite (max-w-sm)
- `md` - Moyenne (max-w-md) - *par défaut*
- `lg` - Grande (max-w-lg)
- `xl` - Extra-large (max-w-xl)

### Modes de Défilement
- `none` - Pas de défilement - *par défaut*
- `native` - Défilement natif du navigateur
- `stickyHeader` - En-tête fixe lors du défilement
- `stickyFooter` - Pied de page fixe
- `stickyBoth` - En-tête et pied fixe simultanément

## 📖 Guide d'Utilisation

### 1. Alert Dialog Basique

```tsx
import { EnhancedAlertDialog } from "@/components/alert-dialog"

function BasicExample() {
  return (
    <EnhancedAlertDialog
      title="Confirmer l'action"
      description="Êtes-vous sûr de vouloir effectuer cette action ?"
      trigger={<Button>Ouvrir Dialog</Button>}
      onAction={() => console.log("Action confirmée")}
    />
  )
}
```

### 2. Dialog avec Icône et Type

```tsx
function IconExample() {
  return (
    <EnhancedAlertDialog
      title="Action importante"
      description="Cette action nécessite votre attention."
      type="warning"
      showIcon
      trigger={<Button variant="outline">Action avec icône</Button>}
      onAction={async () => {
        // Action asynchrone
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log("Action terminée")
      }}
    />
  )
}
```

### 3. Dialog Défilable avec Contenu Long

```tsx
function ScrollableExample() {
  const longContent = (
    <div className="space-y-4">
      {/* Votre contenu long ici */}
    </div>
  )
  
  return (
    <EnhancedAlertDialog
      title="Foire Aux Questions"
      description={longContent}
      scrollable="stickyHeader"
      size="lg"
      isDialog
      trigger={<Button>FAQ</Button>}
      onAction={() => console.log("FAQ fermée")}
    />
  )
}
```

## 🎯 Composants Spécialisés

### 1. Confirmations Générales

#### ConfirmDialog
```tsx
import { ConfirmDialog } from "@/components/alert-dialog"

<ConfirmDialog
  title="Confirmer l'opération"
  description="Cette action modifiera les données existantes."
  trigger={<Button>Confirmer</Button>}
  onAction={() => handleConfirmation()}
/>
```

### 2. Suppressions Standard

#### DeleteDialog
```tsx
import { DeleteDialog } from "@/components/alert-dialog"

<DeleteDialog
  title="Supprimer l'élément"
  description="Cette action est irréversible."
  trigger={<Button variant="destructive">Supprimer</Button>}
  onAction={() => handleDelete()}
/>
```

### 3. Actions Système

#### LogoutDialog
```tsx
import { LogoutDialog } from "@/components/alert-dialog"

<LogoutDialog
  trigger={<Button variant="ghost">Se déconnecter</Button>}
  onAction={() => handleLogout()}
/>
```

#### SaveDialog
```tsx
import { SaveDialog } from "@/components/alert-dialog"

<SaveDialog
  title="Sauvegarder les modifications"
  trigger={<Button>Sauvegarder</Button>}
  onAction={async () => await saveChanges()}
/>
```

### 4. Messages d'Information

#### InfoDialog
```tsx
import { InfoDialog } from "@/components/alert-dialog"

<InfoDialog
  title="Information importante"
  description="Voici une information que vous devez connaître."
  trigger={<Button variant="outline">Info</Button>}
  onAction={() => console.log("Information lue")}
/>
```

#### SuccessDialog
```tsx
import { SuccessDialog } from "@/components/alert-dialog"

<SuccessDialog
  title="Opération réussie"
  description="L'action a été effectuée avec succès !"
  trigger={<Button>Succès</Button>}
  onAction={() => console.log("Succès confirmé")}
/>
```

#### ErrorDialog
```tsx
import { ErrorDialog } from "@/components/alert-dialog"

<ErrorDialog
  title="Erreur détectée"
  description="Une erreur s'est produite lors du traitement."
  trigger={<Button variant="destructive">Erreur</Button>}
  onAction={() => console.log("Erreur acknowleged")}
/>
```

#### WarningDialog
```tsx
import { WarningDialog } from "@/components/alert-dialog"

<WarningDialog
  title="Attention requise"
  description="Cette action peut avoir des conséquences importantes."
  trigger={<Button variant="outline">Avertissement</Button>}
  onAction={() => handleWarningAction()}
/>
```

## 🔒 Suppressions avec Confirmation

### ConfirmationDeleteDialog

Pour les suppressions nécessitant une confirmation par saisie de texte :

```tsx
import { ConfirmationDeleteDialog } from "@/components/alert-dialog"

<ConfirmationDeleteDialog
  title="Supprimer le projet"
  description="Cette action supprimera définitivement le projet et toutes ses données."
  confirmationText="MonProjet"
  confirmationLabel="Nom du projet"
  confirmationPlaceholder="Tapez MonProjet pour confirmer"
  trigger={<Button variant="destructive">Supprimer Projet</Button>}
  onAction={async () => await deleteProject()}
/>
```

### CriticalDeleteDialog

Variante spécialisée pour les suppressions critiques :

```tsx
import { CriticalDeleteDialog } from "@/components/alert-dialog"

<CriticalDeleteDialog
  confirmationText="SUPPRIMER"
  confirmationLabel="Tapez SUPPRIMER pour confirmer"
  trigger={<Button variant="destructive">Suppression Critique</Button>}
  onAction={async () => await criticalDelete()}
/>

// Ou avec description personnalisée
<CriticalDeleteDialog
  title="Supprimer l'utilisateur"
  confirmationText="john.doe@example.com"
  confirmationLabel="Email de l'utilisateur"
  description={
    <>
      Cette action supprimera définitivement le compte utilisateur{" "}
      <strong>john.doe@example.com</strong> et toutes ses données associées.
    </>
  }
  trigger={<Button variant="destructive">Supprimer Utilisateur</Button>}
  onAction={async () => await deleteUser()}
/>
```

## ⚙️ API des Props

### BaseAlertDialogProps

```tsx
interface BaseAlertDialogProps {
  title: string                    // Titre du dialog
  description: string | ReactNode  // Description ou contenu
  children?: ReactNode             // Contenu supplémentaire
  trigger?: ReactNode              // Élément déclencheur
  cancelText?: string              // Texte bouton annuler (défaut: "Annuler")
  actionText?: string              // Texte bouton action (défaut: "Confirmer")
  onAction?: () => void | Promise<void>  // Callback d'action
  onCancel?: () => void            // Callback d'annulation
  showIcon?: boolean               // Afficher l'icône du type
  icon?: ComponentType             // Icône personnalisée
  className?: string               // Classes CSS supplémentaires
  
  // Props de variantes
  type?: AlertDialogType           // Type d'alerte
  size?: "sm" | "md" | "lg" | "xl" // Taille du dialog
  scrollable?: ScrollableMode      // Mode de défilement
  
  // Props d'état
  actionVariant?: ButtonVariant    // Variante du bouton d'action
  actionLoading?: boolean          // État de chargement action
  hideCancel?: boolean             // Masquer bouton annuler
  disabled?: boolean               // Désactiver l'action
  isDialog?: boolean               // Forcer mode Dialog au lieu d'AlertDialog
}
```

### ConfirmationDeleteDialogProps

```tsx
interface ConfirmationDeleteDialogProps {
  title?: string                   // Titre (défaut: "Confirmation finale")
  description?: string | ReactNode // Description personnalisée
  trigger?: ReactNode              // Élément déclencheur
  cancelText?: string              // Texte bouton annuler
  actionText?: string              // Texte bouton action
  onAction?: () => void | Promise<void>  // Callback d'action
  onCancel?: () => void            // Callback d'annulation
  
  // Confirmation spécifique
  confirmationText: string         // Texte à saisir pour confirmer
  confirmationLabel?: string       // Label du champ de saisie
  confirmationPlaceholder?: string // Placeholder du champ
  
  // Props d'état
  className?: string               // Classes CSS supplémentaires
  actionLoading?: boolean          // État de chargement
  disabled?: boolean               // Désactiver l'action
}
```

## 🎭 Exemples Avancés

### Dialog avec Action Asynchrone et Gestion d'Erreur

```tsx
function AsyncActionDialog() {
  const [error, setError] = useState<string>("")
  
  const handleAsyncAction = async () => {
    try {
      setError("")
      await apiCall()
      // Succès
    } catch (err) {
      setError("Une erreur s'est produite")
      throw err // Relancer pour que le dialog reste ouvert
    }
  }
  
  return (
    <EnhancedAlertDialog
      title="Action asynchrone"
      description={
        <div>
          <p>Cette action prendra quelques secondes.</p>
          {error && (
            <p className="mt-2 text-red-600 text-sm">{error}</p>
          )}
        </div>
      }
      type="info"
      showIcon
      trigger={<Button>Démarrer</Button>}
      onAction={handleAsyncAction}
    />
  )
}
```

### Dialog avec Contenu Dynamique

```tsx
function DynamicContentDialog() {
  const [items, setItems] = useState<string[]>([])
  
  useEffect(() => {
    // Charger les données
    loadItems().then(setItems)
  }, [])
  
  return (
    <EnhancedAlertDialog
      title="Éléments à traiter"
      description={
        <div className="space-y-2">
          <p>Les éléments suivants seront traités :</p>
          <ul className="list-disc list-inside">
            {items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      }
      scrollable={items.length > 5 ? "native" : "none"}
      size="lg"
      trigger={<Button>Voir Éléments</Button>}
      onAction={() => processItems(items)}
    />
  )
}
```

### Confirmation de Suppression Complexe

```tsx
function ComplexDeletionDialog() {
  return (
    <CriticalDeleteDialog
      title="Supprimer l'organisation"
      confirmationText="MonEntreprise Corp"
      confirmationLabel="Nom de l'organisation (sensible à la casse)"
      description={
        <div className="space-y-3">
          <p>
            Cette action supprimera définitivement l'organisation{" "}
            <strong>MonEntreprise Corp</strong> et aura les conséquences suivantes :
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Suppression de tous les projets (15 projets)</li>
            <li>Suppression de tous les utilisateurs (42 utilisateurs)</li>
            <li>Suppression de toutes les données (2.3 Go)</li>
            <li>Annulation de l'abonnement actuel</li>
          </ul>
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-800 dark:text-red-200 text-sm font-medium">
              ⚠️ Cette action est irréversible et ne peut pas être annulée.
            </p>
          </div>
        </div>
      }
      actionText="Supprimer l'organisation"
      trigger={
        <Button variant="destructive" size="sm">
          <Trash2Icon size={14} className="mr-2" />
          Supprimer Organisation
        </Button>
      }
      onAction={async () => {
        await deleteOrganization("MonEntreprise Corp")
        // Redirection après suppression
        router.push("/organizations")
      }}
    />
  )
}
```

## 🎨 Personnalisation et Styling

### Classes CSS Personnalisées

```tsx
<EnhancedAlertDialog
  title="Dialog personnalisée"
  description="Avec styles personnalisés"
  className="custom-dialog-class"
  trigger={<Button>Ouvrir</Button>}
  onAction={() => {}}
/>
```

### Icônes Personnalisées

```tsx
import { CustomIcon } from "lucide-react"

<EnhancedAlertDialog
  title="Avec icône personnalisée"
  description="Utilise une icône spécifique"
  showIcon
  icon={CustomIcon}
  trigger={<Button>Icône Custom</Button>}
  onAction={() => {}}
/>
```

## 🧪 Tests et Validation

### Tests d'Intégration

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { EnhancedAlertDialog } from "@/components/alert-dialog"

describe("EnhancedAlertDialog", () => {
  it("should call onAction when confirmed", async () => {
    const mockAction = jest.fn()
    
    render(
      <EnhancedAlertDialog
        title="Test Dialog"
        description="Description de test"
        trigger={<button>Trigger</button>}
        onAction={mockAction}
      />
    )
    
    fireEvent.click(screen.getByText("Trigger"))
    fireEvent.click(screen.getByText("Confirmer"))
    
    await waitFor(() => {
      expect(mockAction).toHaveBeenCalledTimes(1)
    })
  })
})
```

### Tests de Confirmation

```tsx
describe("ConfirmationDeleteDialog", () => {
  it("should enable action button only when confirmation text matches", () => {
    render(
      <ConfirmationDeleteDialog
        confirmationText="DELETE"
        trigger={<button>Delete</button>}
        onAction={() => {}}
      />
    )
    
    fireEvent.click(screen.getByText("Delete"))
    
    const actionButton = screen.getByRole("button", { name: /supprimer/i })
    expect(actionButton).toBeDisabled()
    
    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "DELETE" } })
    
    expect(actionButton).toBeEnabled()
  })
})
```

## 🚀 Performance et Bonnes Pratiques

### Optimisation des Re-rendus

```tsx
// ✅ Bon : Callback mémorisé
const handleAction = useCallback(async () => {
  await performAction()
}, [dependency])

// ✅ Bon : Description mémorisée pour contenu complexe
const description = useMemo(() => (
  <ComplexDescription data={data} />
), [data])

<EnhancedAlertDialog
  title="Action optimisée"
  description={description}
  onAction={handleAction}
  trigger={<Button>Action</Button>}
/>
```

### Gestion des États de Chargement

```tsx
function OptimizedDialog() {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleAction = async () => {
    setIsLoading(true)
    try {
      await apiCall()
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <EnhancedAlertDialog
      title="Action avec état"
      description="Gestion propre du chargement"
      trigger={<Button disabled={isLoading}>Action</Button>}
      onAction={handleAction}
      actionLoading={isLoading}
    />
  )
}
```

## 🔧 Dépannage

### Problèmes Courants

1. **Dialog ne s'ouvre pas**
   - Vérifiez que le `trigger` est correctement défini
   - Assurez-vous que les dépendances sont installées

2. **Action ne se déclenche pas**
   - Vérifiez que `onAction` est bien défini
   - Contrôlez que le composant n'est pas `disabled`

3. **Problèmes de styling**
   - Vérifiez l'ordre des imports CSS
   - Assurez-vous que Tailwind CSS est configuré

4. **Types TypeScript**
   - Importez les types depuis `@/components/alert-dialog`
   - Vérifiez la compatibilité des props

### Debug et Logs

```tsx
<EnhancedAlertDialog
  title="Debug Dialog"
  description="Dialog avec logs"
  trigger={<Button>Debug</Button>}
  onAction={() => {
    console.log("Action déclenchée")
    console.log("État actuel:", { loading, disabled })
  }}
  onCancel={() => console.log("Dialog annulée")}
/>
```

## 📝 Changelog

### v2.1.0 (Août 2025)
- ✨ Ajout de `ConfirmationDeleteDialog` et `CriticalDeleteDialog`
- ✨ Support du mode `stickyBoth` pour défilement
- 🔧 Amélioration de l'accessibilité avec DialogTitle/DialogDescription
- 📚 Documentation complète

### v2.0.0 (Juillet 2025)
- 🔄 Refactorisation en architecture modulaire
- ✨ 8 composants spécialisés
- ✨ 4 modes de défilement avec sticky header/footer
- 🎨 6 types d'alertes avec icônes
- 📱 Support responsive complet

---

## 📚 Ressources Supplémentaires

- [Page de démonstration interactive](/demo-alert-dialogs)
- [Composants shadcn/ui](https://ui.shadcn.com/)
- [Radix UI Dialog](https://www.radix-ui.com/docs/primitives/components/dialog)
- [Origin UI Components](https://originui.com/)

---

**Développé avec ❤️ par l'équipe de développement**