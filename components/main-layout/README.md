# MainLayout Component

Composant de layout principal avec AppBar et Sidebar, sans header ni footer.

## Utilisation

```tsx
import { MainLayout } from '@/components/main-layout'

export default function Page() {
  return (
    <MainLayout>
      <div>Contenu de votre page</div>
    </MainLayout>
  )
}
```

## Props

- `children`: Contenu à afficher dans la zone principale
- `debugMode`: Active le mode debug avec console et panel (défaut: false)
- `appTitle`: Titre affiché dans l'AppBar (défaut: "Njillu App")
- `sidebarConfig`: Configuration personnalisée pour la sidebar
- `onNavigationClick`: Callback pour les clics de navigation
- `onUserContextChange`: Callback pour les changements de contexte utilisateur

## Différences avec AppLayout

- Pas de header/footer configurables
- Focus sur AppBar + Sidebar uniquement
- Interface simplifiée
- Optimisé pour les pages principales de l'application