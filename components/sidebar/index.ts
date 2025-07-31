// Index des exports pour la sidebar refactorisée selon SOLID

// Types et interfaces principales
export type {
  INavigationItem,
  IUserDataProvider,
  ITranslationProvider,
  IResponsiveProvider,
  ISidebarStateManager,
  INavigationComponent,
  IUserComponent,
  SidebarConfig,
  SidebarProps,
  Breakpoint,
  SidebarVariant,
  NavigationItemType,
  SidebarPosition,
  SidebarTheme,
  SidebarEvents
} from '@/types/sidebar.types'

// Configuration par défaut
export { DEFAULT_SIDEBAR_CONFIG } from '@/types/sidebar.types'

// Providers (DIP)
export { 
  SupabaseUserDataProvider,
  createUserDataProvider 
} from '@/lib/sidebar/providers/user-data.provider'

export { 
  NextIntlTranslationProvider,
  createTranslationProvider 
} from '@/lib/sidebar/providers/translation.provider'

export { 
  MediaQueryResponsiveProvider,
  useResponsiveProvider,
  createResponsiveProvider 
} from '@/lib/sidebar/providers/responsive.provider'

// State management (SRP)
export { 
  SidebarStateManager,
  useSidebarState,
  createSidebarStateManager 
} from '@/lib/sidebar/state/sidebar-state.manager'

// Composants atomiques (SRP)
export { 
  NavigationItem,
  NavigationSeparator,
  NavigationGroup 
} from './navigation-item.component'

export { 
  UserInfo,
  UserAvatar 
} from './user-info.component'

export { 
  SidebarHeader,
  Logo 
} from './sidebar-header.component'

// Composants de composition (OCP)
export { 
  NavigationList,
  TemplatedNavigationList,
  createNavigationList 
} from './navigation-list.component'

export { 
  SidebarContainer,
  SidebarOverlay,
  SidebarSheet,
  useSidebarDimensions 
} from './sidebar-container.component'

// Composant principal (SOLID)
export { 
  AppSidebarSOLID,
  AppSidebar,
  createSidebarVariant 
} from './app-sidebar-solid'

// Composants de navigation dynamique
export { 
  DynamicSidebar,
  useDynamicNavigation,
  createDynamicSidebarVariant
} from './dynamic-sidebar.component'

// Démo et tests
export { DynamicSidebarDemo } from './dynamic-sidebar-demo'

// Services et providers pour navigation dynamique
export { 
  SupabaseDynamicNavigationProvider,
  createDynamicNavigationProvider 
} from '@/lib/sidebar/providers/dynamic-navigation.provider'

export { 
  PermissionService,
  permissionService,
  createPermissionService 
} from '@/lib/sidebar/services/permission.service'

// Aliases pour compatibilité descendante
export { AppSidebar as Sidebar } from './app-sidebar-solid'
export { AppSidebarSOLID as SidebarSOLID } from './app-sidebar-solid'
export { DynamicSidebar as AdaptiveSidebar } from './dynamic-sidebar.component'