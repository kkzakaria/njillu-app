// Index des exports pour la sidebar simplifiée

// Types et interfaces principales
export type {
  INavigationItem,
  SidebarConfig,
  Breakpoint,
  SidebarPosition
} from '@/types/sidebar.types'

// Configuration par défaut
export { DEFAULT_SIDEBAR_CONFIG } from '@/types/sidebar.types'

// Providers essentiels pour la sidebar simplifiée
export { 
  useResponsiveProvider,
  createResponsiveProvider 
} from '@/lib/sidebar/providers/responsive.provider'

// State management simplifié
export { 
  useSidebarState,
  createSidebarStateManager 
} from '@/lib/sidebar/state/sidebar-state.manager'

// Composants atomiques réutilisables
export { 
  NavigationItem,
  NavigationSeparator,
  NavigationGroup 
} from './navigation-item.component'

// Composants de composition
export { 
  NavigationList,
  createNavigationList 
} from './navigation-list.component'

export { 
  SidebarContainer,
  SidebarOverlay,
  SidebarSheet,
  useSidebarDimensions 
} from './sidebar-container.component'

// Composant principal simplifié
export { 
  AppSidebarSimple,
  AppSidebar // Alias pour compatibilité
} from './app-sidebar-simple'