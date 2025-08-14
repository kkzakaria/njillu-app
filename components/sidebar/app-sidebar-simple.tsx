'use client'

import React, { useMemo } from 'react'
import { 
  FolderOpen, 
  FolderCheck, 
  Archive, 
  Trash2,
  Menu,
  Users,
  UserCheck,
  UserX
} from 'lucide-react'

// Types et interfaces
import { 
  INavigationItem,
  DEFAULT_SIDEBAR_CONFIG 
} from '@/types/sidebar.types'

// Providers pour le responsive
import { useResponsiveProvider } from '@/lib/sidebar/providers/responsive.provider'

// State management
import { useSidebarState } from '@/lib/sidebar/state/sidebar-state.manager'

// Components
import { SidebarContainer, SidebarSheet } from './sidebar-container.component'
import { NavigationList } from './navigation-list.component'

// Hooks pour traductions
import { useFolders, useClients } from '@/hooks/useTranslation'

/**
 * Props pour la sidebar simplifiée
 */
interface AppSidebarSimpleProps {
  /** Items de navigation personnalisés (optionnel) */
  navigationItems?: INavigationItem[]
  /** Configuration de la sidebar */
  config?: {
    animationDuration?: number
    hoverDelay?: number
    autoCollapse?: boolean
  }
  /** Callback pour les clics sur les éléments de navigation */
  onItemClick?: (item: INavigationItem) => void
  /** Classe CSS personnalisée */
  className?: string
}

/**
 * Sidebar simplifiée de l'application
 * Conserve toutes les fonctionnalités UX (expand/collapse, responsive)
 * mais supprime la complexité (header/footer/menu dynamique)
 */
export const AppSidebarSimple: React.FC<AppSidebarSimpleProps> = ({
  navigationItems: customNavigationItems,
  config = {
    animationDuration: 300,
    hoverDelay: 100,
    autoCollapse: true
  },
  onItemClick,
  className = ''
}) => {
  const tFolders = useFolders()
  const tClients = useClients()
  
  // Hook responsive
  const responsiveProvider = useResponsiveProvider(768, 1024)
  
  // State management
  const sidebarState = useSidebarState()
  
  // Navigation par défaut avec dossiers et clients
  const defaultNavigationItems: INavigationItem[] = useMemo(() => [
    { 
      id: 'folders-active', 
      icon: FolderOpen, 
      labelKey: tFolders('statusCategories.active'), 
      href: '/folders/active'
    },
    { 
      id: 'folders-completed', 
      icon: FolderCheck, 
      labelKey: tFolders('statusCategories.completed'), 
      href: '/folders/completed' 
    },
    { 
      id: 'folders-archived', 
      icon: Archive, 
      labelKey: tFolders('statusCategories.archived'), 
      href: '/folders/archived' 
    },
    { 
      id: 'folders-deleted', 
      icon: Trash2, 
      labelKey: tFolders('statusCategories.deleted'), 
      href: '/folders/deleted' 
    },
    { 
      id: 'clients-active', 
      icon: UserCheck, 
      labelKey: tClients('navigation.active'), 
      href: '/clients/active'
    },
    { 
      id: 'clients-inactive', 
      icon: UserX, 
      labelKey: tClients('navigation.inactive'), 
      href: '/clients/inactive' 
    },
    { 
      id: 'clients-archived', 
      icon: Users, 
      labelKey: tClients('navigation.archived'), 
      href: '/clients/archived' 
    }
  ], [tFolders, tClients])
  
  const navigationItems = customNavigationItems || defaultNavigationItems
  
  // Déterminer le breakpoint actuel
  const currentBreakpoint = responsiveProvider.isMobile() ? 'mobile' : 
                           responsiveProvider.isTablet() ? 'tablet' : 'desktop'
  
  // Logique responsive
  const isMobileOrTablet = currentBreakpoint === 'mobile' || currentBreakpoint === 'tablet'
  const showDesktopSidebar = !isMobileOrTablet
  const showMobileButton = isMobileOrTablet
  
  // Handlers d'événements
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

  return (
    <>
      {/* Bouton menu mobile */}
      {showMobileButton && (
        <button
          onClick={() => sidebarState.setSheetOpen(true)}
          className="fixed top-2 left-4 z-50 p-2 bg-background border border-border rounded-lg shadow-md lg:hidden hover:bg-gray-200 dark:hover:bg-gray-800 hover:shadow-lg hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 group"
        >
          <Menu className="w-6 h-6 text-foreground/80 group-hover:text-foreground transition-colors duration-200" />
        </button>
      )}

      {/* Sidebar Desktop */}
      {showDesktopSidebar && (
        <SidebarContainer
          isExpanded={sidebarState.isExpanded}
          isVisible={true}
          config={{
            ...DEFAULT_SIDEBAR_CONFIG,
            position: 'left', // S'assurer que c'est à gauche
            animationDuration: config.animationDuration || 300,
            hoverDelay: config.hoverDelay || 100,
            showHeader: false, // Pas de header
            showFooter: false, // Pas de footer
            autoCollapse: config.autoCollapse !== undefined ? config.autoCollapse : true,
            headerTitle: '',
            headerClickable: false
          }}
          currentBreakpoint={currentBreakpoint}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={className}
        >
          <SidebarContent
            isExpanded={sidebarState.isExpanded}
            navigationItems={navigationItems}
            onItemClick={handleItemClick}
          />
        </SidebarContainer>
      )}

      {/* Sheet Mobile/Tablet */}
      <SidebarSheet
        isOpen={sidebarState.isSheetOpen}
        onClose={() => sidebarState.setSheetOpen(false)}
        config={{
          ...DEFAULT_SIDEBAR_CONFIG,
          position: 'left',
          animationDuration: config.animationDuration || 300,
          autoCollapse: true,
          showHeader: false,
          showFooter: false
        }}
        title="Navigation"
      >
        <SidebarContent
          isExpanded={true} // Toujours étendu en mode sheet
          navigationItems={navigationItems}
          onItemClick={handleItemClick}
        />
      </SidebarSheet>
    </>
  )
}

/**
 * Composant pour le contenu de la sidebar
 * Structure simplifiée sans header/footer
 */
interface SidebarContentProps {
  isExpanded: boolean
  navigationItems: INavigationItem[]
  onItemClick: (item: INavigationItem) => void
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  isExpanded,
  navigationItems,
  onItemClick
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Navigation principale - tout l'espace disponible */}
      <div className={`flex-1 ${isExpanded ? 'py-4 px-2' : 'py-4 px-1'}`}>
        <NavigationList
          items={navigationItems}
          isExpanded={isExpanded}
          onItemClick={onItemClick}
        />
      </div>
    </div>
  )
}

// Export pour compatibilité
export const AppSidebar = AppSidebarSimple