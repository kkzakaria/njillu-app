// Sidebar refactorisée selon les principes SOLID
'use client'

import React, { useMemo } from 'react'
import { 
  Home, 
  User, 
  Settings, 
  FileText, 
  BarChart3, 
  Shield, 
  HelpCircle,
  LogOut,
  Menu
} from 'lucide-react'

// Types et interfaces
import { 
  SidebarProps, 
  INavigationItem, 
  DEFAULT_SIDEBAR_CONFIG,
  SidebarConfig 
} from '@/types/sidebar.types'

// Providers (DIP)
import { createUserDataProvider } from '@/lib/sidebar/providers/user-data.provider'
import { useResponsiveProvider } from '@/lib/sidebar/providers/responsive.provider'

// State management (SRP)
import { useSidebarState } from '@/lib/sidebar/state/sidebar-state.manager'

// Components (SRP)
import { SidebarContainer, SidebarSheet } from './sidebar-container.component'
import { SidebarHeader } from './sidebar-header.component'
import { NavigationList } from './navigation-list.component'
import { UserInfo } from './user-info.component'

// Hooks
import { useNavigation } from '@/hooks/useTranslation'

/**
 * Composant Sidebar principal refactorisé selon SOLID
 * SRP: Responsabilité unique - orchestration des composants
 * OCP: Ouvert à l'extension par injection de dépendances
 * LSP: Respecte les contrats d'interface
 * ISP: Utilise des interfaces séparées
 * DIP: Dépend d'abstractions via injection de dépendances
 */
export const AppSidebarSOLID: React.FC<SidebarProps> = ({
  config: configOverride,
  navigationItems: customNavigationItems,
  userDataProvider: customUserDataProvider,
  responsiveProvider: customResponsiveProvider,
  className = '',
  children,
  onItemClick
}) => {
  // Configuration finale (OCP)
  const config: SidebarConfig = { ...DEFAULT_SIDEBAR_CONFIG, ...configOverride }
  
  // Providers par injection de dépendance (DIP)
  const userDataProvider = useMemo(() => 
    customUserDataProvider || createUserDataProvider(),
    [customUserDataProvider]
  )
  const t = useNavigation() // Hook de traduction existant
  
  // Hook responsive doit être appelé inconditionnellement
  const defaultResponsiveProvider = useResponsiveProvider(
    config.mobileBreakpoint,
    config.tabletBreakpoint
  )
  const responsiveProvider = customResponsiveProvider || defaultResponsiveProvider
  
  // State management (SRP)
  const sidebarState = useSidebarState()
  
  // Navigation items par défaut (OCP - extensible)
  const defaultNavigationItems: INavigationItem[] = [
    { id: 'dashboard', icon: Home, labelKey: t('dashboard'), href: '/dashboard' },
    { id: 'profile', icon: User, labelKey: t('profile'), href: '/profile' },
    { id: 'documents', icon: FileText, labelKey: t('documents'), href: '/documents' },
    { id: 'analytics', icon: BarChart3, labelKey: t('analytics'), href: '/analytics' },
    { id: 'security', icon: Shield, labelKey: t('security'), href: '/security' },
    { id: 'settings', icon: Settings, labelKey: t('settings'), href: '/settings' },
    { id: 'help', icon: HelpCircle, labelKey: t('help'), href: '/help' },
    { id: 'logout', icon: LogOut, labelKey: t('logout'), href: '/logout' }
  ]
  
  const navigationItems = customNavigationItems || defaultNavigationItems
  
  // Déterminer le breakpoint actuel (SRP)
  const currentBreakpoint = responsiveProvider.isMobile() ? 'mobile' : 
                           responsiveProvider.isTablet() ? 'tablet' : 'desktop'
  
  // Logique responsive (SRP)
  const isMobileOrTablet = currentBreakpoint === 'mobile' || currentBreakpoint === 'tablet'
  const showDesktopSidebar = !isMobileOrTablet
  const showMobileButton = isMobileOrTablet
  
  // Handlers d'événements (SRP)
  const handleMouseEnter = () => {
    if (config.autoCollapse && currentBreakpoint === 'desktop') {
      sidebarState.setExpanded(true)
    }
  }
  
  const handleMouseLeave = () => {
    if (config.autoCollapse && currentBreakpoint === 'desktop') {
      sidebarState.setExpanded(false)
    }
  }
  
  const handleItemClick = (item: INavigationItem) => {
    if (onItemClick) {
      onItemClick(item)
    }
    
    // Fermer le sheet sur mobile après clic
    if (isMobileOrTablet) {
      sidebarState.setSheetOpen(false)
    }
  }

  // Rendu conditionnel selon le breakpoint (LSP)
  return (
    <>
      {/* Bouton menu mobile */}
      {showMobileButton && (
        <button
          onClick={() => sidebarState.setSheetOpen(true)}
          className="fixed top-4 left-4 z-30 p-2 bg-white dark:bg-gray-900 rounded-lg shadow-md lg:hidden border border-gray-200 dark:border-gray-700"
        >
          <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
      )}

      {/* Sidebar Desktop */}
      {showDesktopSidebar && (
        <SidebarContainer
          isExpanded={sidebarState.isExpanded}
          isVisible={true}
          config={config}
          currentBreakpoint={currentBreakpoint}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={className}
        >
          <SidebarContent
            isExpanded={sidebarState.isExpanded}
            navigationItems={navigationItems}
            userDataProvider={userDataProvider}
            onItemClick={handleItemClick}
          />
        </SidebarContainer>
      )}

      {/* Sheet Mobile/Tablet */}
      <SidebarSheet
        isOpen={sidebarState.isSheetOpen}
        onClose={() => sidebarState.setSheetOpen(false)}
        config={config}
        title="Menu"
      >
        <SidebarContent
          isExpanded={true} // Toujours étendu en mode sheet
          navigationItems={navigationItems}
          userDataProvider={userDataProvider}
          onItemClick={handleItemClick}
          isSheet={true}
        />
      </SidebarSheet>

      {/* Contenu additionnel (OCP) */}
      {children}
    </>
  )
}

/**
 * Composant pour le contenu de la sidebar
 * SRP: Responsabilité unique - organisation du contenu
 * LSP: Utilisable dans différents contextes (desktop/sheet)
 */
interface SidebarContentProps {
  isExpanded: boolean
  navigationItems: INavigationItem[]
  userDataProvider: ReturnType<typeof createUserDataProvider>
  onItemClick: (item: INavigationItem) => void
  isSheet?: boolean
}

const SidebarContent: React.FC<SidebarContentProps> = function SidebarContent({
  isExpanded,
  navigationItems,
  userDataProvider,
  onItemClick,
  isSheet = false
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <SidebarHeader
        title="Mon App"
        isExpanded={isExpanded}
        onClick={() => {
          // Navigation vers l'accueil
          window.location.href = '/'
        }}
      />

      {/* Navigation */}
      <div className="flex-1 p-4">
        <NavigationList
          items={navigationItems}
          isExpanded={isExpanded}
          onItemClick={onItemClick}
        />
      </div>

      {/* Footer utilisateur */}
      <div className={`p-4 ${isSheet ? '' : 'absolute bottom-0 left-0 right-0'}`}>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg">
          <UserInfo
            isExpanded={isExpanded}
            userDataProvider={userDataProvider}
            onClick={() => {
              // Navigation vers le profil
              window.location.href = '/profile'
            }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Factory pour créer des variants de sidebar (OCP)
 * Extensible sans modification du composant principal
 */
export const createSidebarVariant = (
  defaultConfig: Partial<SidebarConfig>,
  defaultItems?: INavigationItem[]
) => {
  return function SidebarVariant(props: Partial<SidebarProps>) {
    return (
      <AppSidebarSOLID
        {...props}
        config={{ ...defaultConfig, ...props.config }}
        navigationItems={props.navigationItems || defaultItems || []}
      />
    )
  }
}

// Export du composant principal avec alias pour compatibilité
export const AppSidebar = AppSidebarSOLID