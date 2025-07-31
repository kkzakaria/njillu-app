// Types et interfaces pour la sidebar refactorisée selon SOLID

import { ComponentType } from 'react'

// ========== INTERFACES (ISP - Interface Segregation Principle) ==========

/**
 * Interface pour un élément de navigation
 * ISP: Interface spécifique aux éléments de menu
 */
export interface INavigationItem {
  id: string
  icon: ComponentType<{ className?: string }>
  labelKey: string
  href: string
  badge?: string | number
  isActive?: boolean
}

/**
 * Interface pour les fournisseurs de données utilisateur
 * DIP: Abstraction pour l'injection de dépendance
 */
export interface IUserDataProvider {
  getUserName(): Promise<string | null>
  getUserEmail(): Promise<string | null>
  getUserAvatar(): Promise<string | null>
}

/**
 * Interface pour la gestion des traductions
 * DIP: Abstraction pour l'internationalisation
 */
export interface ITranslationProvider {
  translate(key: string): string
}

/**
 * Interface pour la détection responsive
 * DIP: Abstraction pour la gestion des breakpoints
 */
export interface IResponsiveProvider {
  isMobile(): boolean
  isTablet(): boolean
  isDesktop(): boolean
  onBreakpointChange(callback: (breakpoint: Breakpoint) => void): () => void
}

/**
 * Interface pour les gestionnaires d'état
 * ISP: Interface spécifique à la gestion d'état
 */
export interface ISidebarStateManager {
  isExpanded: boolean
  isSheetOpen: boolean
  setExpanded(expanded: boolean): void
  setSheetOpen(open: boolean): void
  toggleExpansion(): void
  toggleSheet(): void
}

/**
 * Interface pour les composants de navigation
 * LSP: Contrat commun pour tous les composants de navigation
 */
export interface INavigationComponent {
  items: INavigationItem[]
  isExpanded: boolean
  onItemClick?: (item: INavigationItem) => void
}

/**
 * Interface pour les composants utilisateur
 * ISP: Interface spécifique aux informations utilisateur
 */
export interface IUserComponent {
  isExpanded: boolean
  showAvatar?: boolean
  showName?: boolean
  showEmail?: boolean
}

// ========== TYPES ==========

export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

export type SidebarVariant = 'collapsed' | 'expanded' | 'sheet'

export type NavigationItemType = 'link' | 'button' | 'separator' | 'group'

export type SidebarPosition = 'left' | 'right'

export type SidebarTheme = 'light' | 'dark' | 'auto'

// ========== CONFIGURATIONS ==========

/**
 * Configuration pour la sidebar
 * OCP: Extensible sans modification du code existant
 */
export interface SidebarConfig {
  position: SidebarPosition
  theme: SidebarTheme
  collapsedWidth: number
  expandedWidth: number
  mobileBreakpoint: number
  tabletBreakpoint: number
  animationDuration: number
  hoverDelay: number
  autoCollapse: boolean
  showHeader: boolean
  showFooter: boolean
  headerTitle?: string
  headerClickable?: boolean
}

/**
 * Props pour le composant Sidebar principal
 * OCP: Configuration extensible
 */
export interface SidebarProps {
  config?: Partial<SidebarConfig>
  navigationItems?: INavigationItem[]
  userDataProvider?: IUserDataProvider
  translationProvider?: ITranslationProvider
  responsiveProvider?: IResponsiveProvider
  className?: string
  children?: React.ReactNode
  onItemClick?: (item: INavigationItem) => void
}

// ========== CONSTANTES ==========

export const DEFAULT_SIDEBAR_CONFIG: SidebarConfig = {
  position: 'left',
  theme: 'auto',
  collapsedWidth: 64, // 16 * 4 = w-16
  expandedWidth: 256, // 64 * 4 = w-64
  mobileBreakpoint: 1024, // lg
  tabletBreakpoint: 768, // md
  animationDuration: 300,
  hoverDelay: 100,
  autoCollapse: true,
  showHeader: true,
  showFooter: true,
  headerTitle: 'Mon App',
  headerClickable: true,
}

// ========== FACTORY TYPES ==========

/**
 * Type pour les factory methods
 * DIP: Inversion de dépendance pour la création d'objets
 */
export type NavigationItemFactory = (
  config: Partial<INavigationItem>
) => INavigationItem

export type SidebarComponentFactory = (
  props: SidebarProps
) => React.ComponentType<SidebarProps>

// ========== ÉVÉNEMENTS ==========

export interface SidebarEvents {
  onExpand?: () => void
  onCollapse?: () => void
  onSheetOpen?: () => void
  onSheetClose?: () => void
  onItemClick?: (item: INavigationItem) => void
  onUserClick?: () => void
}