# Documentation de la Sidebar - Système de Navigation Dynamique

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture SOLID](#architecture-solid)
3. [Système de Rôles et Permissions](#système-de-rôles-et-permissions)
4. [Composants Principaux](#composants-principaux)
5. [Configuration](#configuration)
6. [Guide d'utilisation](#guide-dutilisation)
7. [Navigation Dynamique](#navigation-dynamique)
8. [Exemples d'implémentation](#exemples-dimplémentation)
9. [API de développement](#api-de-développement)
10. [Dépannage](#dépannage)

---

## Vue d'ensemble

La sidebar de l'application Njillu est un système de navigation intelligent et adaptatif basé sur les principes SOLID. Elle s'adapte automatiquement aux rôles et permissions des utilisateurs connectés via Supabase.

### 🎯 Fonctionnalités Clés

- **Navigation Dynamique** : Menus qui s'adaptent selon les rôles utilisateur
- **Système RBAC** : Contrôle d'accès basé sur les rôles avec 6 niveaux
- **Design Responsive** : Sidebar collapsible avec mode mobile/tablette
- **Performance Optimisée** : Cache intelligent avec TTL 5 minutes
- **Architecture SOLID** : Code maintenable et extensible
- **Type Safety** : TypeScript complet avec validation

### 🏗️ Architecture Modulaire

```text
sidebar/
├── app-sidebar-solid.tsx          # Composant principal orchestrateur
├── dynamic-sidebar.component.tsx  # Sidebar avec navigation dynamique
├── dynamic-sidebar-demo.tsx       # Demo interactif pour tests
├── navigation-*.component.tsx     # Composants de navigation
├── sidebar-*.component.tsx       # Composants de structure
├── user-info.component.tsx       # Informations utilisateur
└── index.ts                      # Exports unifiés
```

---

## Architecture SOLID

### Principes Appliqués

#### **SRP (Single Responsibility Principle)**

Chaque composant a une responsabilité unique :

- `NavigationItem` : Affichage d'un élément de menu
- `UserInfo` : Informations utilisateur
- `SidebarHeader` : En-tête de la sidebar
- `PermissionService` : Gestion des permissions

#### **OCP (Open/Closed Principle)**

Extension sans modification du code existant :

```typescript
// Ajout d'un nouveau provider sans modifier l'existant
const customProvider = createDynamicNavigationProvider()

// Extension via configuration
const sidebarConfig = {
  showHeader: false,
  showFooter: true,
  headerTitle: "Mon App Custom"
}
```

#### **LSP (Liskov Substitution Principle)**

Les composants respectent leurs contrats d'interface :

```typescript
// Tous les providers implémentent IDynamicNavigationProvider
const provider: IDynamicNavigationProvider = new SupabaseDynamicNavigationProvider()
const provider2: IDynamicNavigationProvider = new CustomNavigationProvider()
```

#### **ISP (Interface Segregation Principle)**

Interfaces spécialisées pour chaque usage :

```typescript
interface INavigationComponent { /* Navigation spécifique */ }
interface IUserComponent { /* Utilisateur spécifique */ }
interface IResponsiveProvider { /* Responsive spécifique */ }
```

#### **DIP (Dependency Inversion Principle)**

Dépendance vers des abstractions :

```typescript
// Injection de dépendances
export const AppSidebarSOLID: React.FC<SidebarProps> = ({
  userDataProvider,      // Interface abstraite
  translationProvider,   // Interface abstraite
  responsiveProvider     // Interface abstraite
}) => {
  // Utilisation des abstractions
}
```

---

## Système de Rôles et Permissions

### 🎭 Rôles Disponibles

| Rôle | Priorité | Description | Permissions |
|------|----------|-------------|-------------|
| `super_admin` | 1 | Administrateur système | Toutes permissions |
| `admin` | 2 | Administrateur | Gestion équipe, rapports |
| `manager` | 3 | Chef de projet | Gestion équipe limitée |
| `user` | 4 | Utilisateur standard | Lecture/écriture |
| `viewer` | 5 | Consultation seule | Lecture seule |
| `guest` | 6 | Invité | Accès minimal |

### 🔐 Permissions par Ressource

```typescript
type Permission = 
  | 'admin' | 'read' | 'write' | 'delete'
  | 'manage_users' | 'view_users' | 'edit_users'
  | 'view_reports' | 'create_reports' | 'manage_reports'
  | 'view_analytics' | 'advanced_analytics'
  | 'system_config' | 'security_audit'

type ResourceType = 
  | 'users' | 'documents' | 'analytics' 
  | 'reports' | 'system' | 'security'
```

### 📊 Matrice Permissions/Rôles

| Permission | super_admin | admin | manager | user | viewer | guest |
|------------|-------------|-------|---------|------|--------|-------|
| admin | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| manage_users | ✅ | ✅ | ✅* | ❌ | ❌ | ❌ |
| view_reports | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| read | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| write | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

*\* Limité à son équipe*

---

## Composants Principaux

### 1. AppSidebarSOLID

**Composant orchestrateur principal** qui gère la logique responsive et l'injection de dépendances.

```typescript
interface SidebarProps {
  config?: Partial<SidebarConfig>
  navigationItems?: INavigationItem[]
  userDataProvider?: IUserDataProvider
  translationProvider?: ITranslationProvider
  responsiveProvider?: IResponsiveProvider
  className?: string
  children?: React.ReactNode
  onItemClick?: (item: INavigationItem) => void
}
```

**Responsabilités** :

- Détection responsive (mobile/tablette/desktop)
- Gestion des états (étendu/collapsé, sheet ouvert/fermé)
- Orchestration des composants enfants
- Injection des providers

### 2. DynamicSidebar

**Sidebar intelligente** qui s'adapte aux rôles utilisateur.

```typescript
interface DynamicSidebarProps extends Omit<SidebarProps, 'navigationItems'> {
  dynamicNavigationProvider?: IDynamicNavigationProvider
  fallbackNavigationItems?: INavigationItem[]
  onUserContextChange?: (context: UserContext | null) => void
  onNavigationItemsChange?: (items: INavigationItem[]) => void
  debugMode?: boolean
}
```

**Fonctionnalités** :

- Chargement automatique du contexte utilisateur
- Adaptation des menus selon les rôles
- Cache intelligent avec gestion d'erreurs
- Mode debug pour le développement

### 3. DynamicSidebarDemo

**Composant de démonstration** pour tester les différents rôles.

**Fonctionnalités** :

- 5 utilisateurs de démonstration pré-configurés
- Changement de rôle en temps réel
- Visualisation des permissions actives
- Interface de debug intégrée

### 4. Navigation Dynamique

#### SupabaseDynamicNavigationProvider

**Provider principal** pour l'intégration Supabase.

```typescript
class SupabaseDynamicNavigationProvider implements IDynamicNavigationProvider {
  async getUserContext(): Promise<UserContext | null>
  async getMenuForUser(context: UserContext): Promise<ConditionalNavigationItem[]>
  async getMenuConfigurations(): Promise<MenuConfiguration[]>
  canUserAccess(item: ConditionalNavigationItem, context: UserContext): boolean
  async refreshCache(): Promise<void>
}
```

**Fonctionnalités** :

- Récupération automatique des rôles depuis Supabase
- Cache avec TTL 5 minutes
- Filtrage automatique des éléments selon les permissions
- Gestion d'erreur robuste avec fallbacks

#### PermissionService

**Service de validation des permissions**.

```typescript
class PermissionService implements IPermissionService {
  hasPermission(context: UserContext, permission: Permission, resource?: ResourceType): boolean
  hasAllPermissions(context: UserContext, permissions: Permission[]): boolean
  hasAnyPermission(context: UserContext, permissions: Permission[]): boolean
  getUserPermissions(context: UserContext): Permission[]
  createUserContext(userId: string, email: string, roles: string[]): UserContext
}
```

---

## Configuration

### SidebarConfig

```typescript
interface SidebarConfig {
  position: 'left' | 'right'
  theme: 'light' | 'dark' | 'auto'
  collapsedWidth: number      // Largeur en mode collapsé (défaut: 64px)
  expandedWidth: number       // Largeur en mode étendu (défaut: 256px)
  mobileBreakpoint: number    // Point de rupture mobile (défaut: 1024px)
  tabletBreakpoint: number    // Point de rupture tablette (défaut: 768px)
  animationDuration: number   // Durée des animations (défaut: 300ms)
  hoverDelay: number         // Délai hover (défaut: 100ms)
  autoCollapse: boolean      // Collapse automatique (défaut: true)
  showHeader: boolean        // Afficher le header (défaut: true)
  showFooter: boolean        // Afficher le footer (défaut: true)
  headerTitle?: string       // Titre personnalisé
  headerClickable?: boolean  // Header cliquable (défaut: true)
}
```

### Configuration par Défaut

```typescript
const DEFAULT_SIDEBAR_CONFIG: SidebarConfig = {
  position: 'left',
  theme: 'auto',
  collapsedWidth: 64,
  expandedWidth: 256,
  mobileBreakpoint: 1024,
  tabletBreakpoint: 768,
  animationDuration: 300,
  hoverDelay: 100,
  autoCollapse: true,
  showHeader: true,
  showFooter: true,
  headerTitle: 'Mon App',
  headerClickable: true,
}
```

---

## Guide d'utilisation

### 1. Utilisation Basique avec MainLayout

```typescript
// app/[locale]/protected/layout.tsx
import { MainLayout } from "@/components/main-layout"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout 
      debugMode={false}
      appTitle="Mon Application"
    >
      {children}
    </MainLayout>
  )
}
```

### 2. Utilisation Directe de la Sidebar

```typescript
import { DynamicSidebar } from "@/components/sidebar"

export function MyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DynamicSidebar
        debugMode={true}
        config={{
          showHeader: true,
          showFooter: true,
          headerTitle: "Mon App",
          animationDuration: 300
        }}
        onUserContextChange={(context) => {
          console.log('Utilisateur changé:', context)
        }}
        onNavigationItemsChange={(items) => {
          console.log('Menu mis à jour:', items.length, 'éléments')
        }}
      />
      
      <div className="lg:ml-16 min-h-screen">
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### 3. Sidebar Sans Header/Footer

```typescript
<DynamicSidebar
  config={{
    showHeader: false,
    showFooter: false
  }}
/>
```

### 4. Configuration Avancée

```typescript
<DynamicSidebar
  config={{
    position: 'right',
    theme: 'dark',
    collapsedWidth: 80,
    expandedWidth: 300,
    autoCollapse: false,
    headerTitle: "Dashboard Admin"
  }}
  fallbackNavigationItems={[
    { id: 'home', icon: Home, labelKey: 'Accueil', href: '/' }
  ]}
  onItemClick={(item) => {
    // Logique de navigation personnalisée
    router.push(item.href)
  }}
/>
```

---

## Navigation Dynamique

### 1. Structure des Menus

Les menus sont définis par des `MenuConfiguration` qui s'appliquent selon les rôles :

```typescript
interface MenuConfiguration {
  id: string
  name: string
  description: string
  priority: number                    // Plus élevé = plus prioritaire
  applies: MenuCondition             // Conditions d'application
  items: ConditionalNavigationItem[] // Éléments du menu
}
```

### 2. Éléments de Navigation Conditionnels

```typescript
interface ConditionalNavigationItem {
  id: string
  icon: React.ComponentType<{ className?: string }>
  labelKey: string
  href: string
  order?: number
  badge?: string
  isActive?: boolean
  condition?: MenuCondition          // Conditions d'accès
  children?: ConditionalNavigationItem[]
}
```

### 3. Conditions d'Accès

```typescript
interface MenuCondition {
  allowedRoles?: UserRole[]          // Rôles autorisés
  requiredPermissions?: Permission[] // Permissions requises
  requiredResources?: ResourceType[] // Ressources requises
  department?: string[]              // Départements autorisés
  organization?: string[]            // Organisations autorisées
  customCheck?: (context: UserContext) => boolean // Validation personnalisée
}
```

### 4. Exemple de Configuration Menu

```typescript
const adminMenuConfig: MenuConfiguration = {
  id: 'admin_menu',
  name: 'Menu Administrateur',
  description: 'Menu pour les administrateurs',
  priority: 80,
  applies: {
    allowedRoles: ['admin']
  },
  items: [
    {
      id: 'dashboard',
      icon: Home,
      labelKey: 'Dashboard',
      href: '/dashboard',
      order: 1
    },
    {
      id: 'users',
      icon: Users,
      labelKey: 'Gestion Utilisateurs',
      href: '/admin/users',
      order: 2,
      condition: {
        requiredPermissions: ['manage_users']
      }
    },
    {
      id: 'analytics',
      icon: BarChart3,
      labelKey: 'Analytics',
      href: '/analytics',
      order: 3,
      condition: {
        requiredPermissions: ['view_reports'],
        department: ['IT', 'Management']
      }
    }
  ]
}
```

---

## Exemples d'implémentation

### 1. Provider Personnalisé

```typescript
class CustomNavigationProvider implements IDynamicNavigationProvider {
  async getUserContext(): Promise<UserContext | null> {
    // Logique personnalisée pour récupérer l'utilisateur
    const user = await myCustomAuth.getUser()
    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      permissions: this.getRolePermissions(user.roles)
    }
  }

  async getMenuForUser(context: UserContext): Promise<ConditionalNavigationItem[]> {
    // Logique personnalisée pour générer le menu
    if (context.roles.includes('admin')) {
      return this.getAdminMenu()
    }
    return this.getDefaultMenu()
  }

  // ... autres méthodes
}

// Utilisation
<DynamicSidebar
  dynamicNavigationProvider={new CustomNavigationProvider()}
/>
```

### 2. Menu Personnalisé avec Validation

```typescript
const customMenuItems: ConditionalNavigationItem[] = [
  {
    id: 'custom-dashboard',
    icon: Home,
    labelKey: 'Mon Dashboard',
    href: '/custom-dashboard',
    condition: {
      customCheck: (context) => {
        // Logique personnalisée complexe
        return context.roles.includes('admin') && 
               context.department === 'IT' &&
               context.metadata?.hasAdvancedAccess === true
      }
    }
  }
]
```

### 3. Intégration avec Router

```typescript
import { useRouter } from 'next/navigation'

function MyApp() {
  const router = useRouter()

  return (
    <DynamicSidebar
      onItemClick={(item) => {
        // Analytics tracking
        analytics.track('sidebar_navigation', {
          item: item.id,
          href: item.href
        })
        
        // Navigation
        router.push(item.href)
      }}
      onUserContextChange={(context) => {
        // Mise à jour du contexte global
        setGlobalUserContext(context)
      }}
    />
  )
}
```

### 4. Mode Démo/Test

```typescript
// Utilisation du composant de démo
import { DynamicSidebarDemo } from "@/components/sidebar"

// Dans votre page de test
export default function SidebarTestPage() {
  return <DynamicSidebarDemo />
}

// Ou avec children personnalisés
export default function MyLayout({ children }) {
  return (
    <DynamicSidebarDemo>
      {children}
    </DynamicSidebarDemo>
  )
}
```

---

## API de développement

### Hooks Disponibles

```typescript
// Hook pour utiliser la navigation dynamique
const useDynamicNavigation = (debugMode = false) => {
  return {
    userContext: UserContext | null,
    navigationItems: INavigationItem[],
    refreshNavigation: () => Promise<void>,
    dynamicProvider: IDynamicNavigationProvider
  }
}

// Hook pour l'état de la sidebar
const useSidebarState = () => {
  return {
    isExpanded: boolean,
    setExpanded: (expanded: boolean) => void,
    isSheetOpen: boolean,
    setSheetOpen: (open: boolean) => void,
    toggle: () => void
  }
}
```

### Factory Functions

```typescript
// Création de variants de sidebar
const createSidebarVariant = (defaultProps: Partial<SidebarProps>) => {
  return (props: Partial<SidebarProps>) => (
    <AppSidebarSOLID {...defaultProps} {...props} />
  )
}

// Création de providers personnalisés
const createDynamicNavigationProvider = (): IDynamicNavigationProvider => {
  return new SupabaseDynamicNavigationProvider()
}

// Création de services de permissions
const createPermissionService = (): IPermissionService => {
  return new PermissionService()
}
```

### Services Utilitaires

```typescript
// Service de permissions (singleton)
import { permissionService } from '@/lib/sidebar/services/permission.service'

// Validation des permissions
const hasAccess = permissionService.hasPermission(
  userContext, 
  'manage_users', 
  'users'
)

// Création de contexte utilisateur
const userContext = permissionService.createUserContext(
  'user-id',
  'user@example.com',
  ['admin', 'manager'],
  { department: 'IT' }
)
```

---

## Dépannage

### 🐛 Problèmes Courants

#### 1. Menu Vide ou Erreur de Chargement

**Symptômes** : La sidebar affiche un menu vide ou des erreurs de chargement.

**Causes possibles** :

- Utilisateur non authentifié
- Rôles mal configurés dans Supabase
- Erreur de réseau

**Solutions** :

```typescript
// Activer le mode debug
<DynamicSidebar debugMode={true} />

// Vérifier les logs de la console
// Fournir un menu de fallback
<DynamicSidebar
  fallbackNavigationItems={[
    { id: 'home', icon: Home, labelKey: 'Accueil', href: '/' }
  ]}
/>
```

#### 2. Menu qui Clignote/Change Constamment

**Symptômes** : Le menu apparaît et disparaît en boucle.

**Cause** : Boucle infinie dans useEffect (déjà corrigée).

**Solution** : Mise à jour vers la dernière version avec les corrections.

#### 3. Permissions Non Appliquées

**Symptômes** : L'utilisateur voit des éléments qu'il ne devrait pas voir.

**Vérifications** :

```typescript
// Vérifier les rôles utilisateur
console.log('User roles:', userContext?.roles)
console.log('User permissions:', userContext?.permissions)

// Vérifier la logique de permissions
const hasAccess = permissionService.hasPermission(userContext, 'admin')
console.log('Has admin access:', hasAccess)
```

#### 4. Sidebar Ne Répond Pas (Mobile)

**Symptômes** : La sidebar ne s'ouvre pas sur mobile/tablette.

**Vérifications** :

- Vérifier que le bouton menu est présent
- Vérifier les breakpoints de configuration
- Tester la détection responsive

```typescript
// Ajuster les breakpoints
<DynamicSidebar
  config={{
    mobileBreakpoint: 768,  // Plus petit pour tablettes
    tabletBreakpoint: 480   // Plus petit pour mobiles
  }}
/>
```

### 🔧 Outils de Debug

#### Mode Debug Activé

```typescript
<DynamicSidebar debugMode={true} />
```

**Informations affichées** :

- Contexte utilisateur actuel
- Nombre d'éléments de navigation
- Rôles et permissions actives
- Erreurs de chargement

#### Console Logging

Les logs suivants sont disponibles en mode debug :

```text
🔍 [DynamicSidebar] User context: { id: "...", roles: [...], permissions: [...] }
🔍 [DynamicSidebar] Navigation items: [...]
🎯 Navigation vers: labelKey → href
👤 Contexte utilisateur changé: {...}
📋 Éléments de navigation mis à jour: X éléments
```

#### Validation des Permissions

```typescript
// Test manuel des permissions
import { permissionService } from '@/lib/sidebar/services/permission.service'

const context = {
  id: 'test',
  email: 'test@example.com',
  roles: ['admin'],
  permissions: ['manage_users', 'view_reports']
}

console.log('Can manage users:', permissionService.hasPermission(context, 'manage_users'))
console.log('Can view analytics:', permissionService.hasPermission(context, 'view_analytics'))
```

### 📞 Support

Pour plus d'aide :

1. **Vérifier les logs** de la console avec `debugMode={true}`
2. **Tester avec le composant demo** `<DynamicSidebarDemo />`
3. **Valider la configuration** Supabase (rôles utilisateur)
4. **Consulter les types** TypeScript pour la validation des props

---

## 🔄 Changelog

### Version Actuelle (Juillet 2025)

**✨ Nouvelles fonctionnalités :**

- Système RBAC complet avec 6 rôles
- Navigation dynamique basée sur les permissions
- Provider Supabase avec cache intelligent
- Mode démo interactif
- Header/footer optionnels
- Configuration flexible

**🎨 Améliorations UX :**

- Footer avec disposition legacy
- Espacement parfait en mode restreint
- Transitions fluides et hover effects
- Support mobile/tablette optimisé

**🏗️ Architecture :**

- Implémentation SOLID complète
- Type safety avec TypeScript
- Injection de dépendances
- Séparation des responsabilités

**🔧 Corrections :**

- Suppression des boucles infinies useEffect
- Imports ES6 propres
- Gestion d'erreur robuste
- Performance optimisée

---

*Documentation générée automatiquement - Dernière mise à jour : Juillet 2025*
