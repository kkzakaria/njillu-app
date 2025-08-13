"use client"

import { AppSidebarSimple } from "@/components/sidebar/app-sidebar-simple"
import { AppBar } from "@/components/appbar"
import { INavigationItem } from '@/types/sidebar.types';

export interface MainAppLayoutProps {
  children: React.ReactNode
  /** Mode debug pour le développement */
  debugMode?: boolean
  /** Titre de l'application dans l'appbar */
  appTitle?: string
  /** Configuration simplifiée pour la sidebar */
  sidebarConfig?: {
    animationDuration?: number
    hoverDelay?: number
    autoCollapse?: boolean
  }
  /** Items de navigation personnalisés */
  navigationItems?: INavigationItem[]
  /** Callback pour les clics sur les éléments de navigation */
  onNavigationClick?: (item: INavigationItem) => void
  /** Classe CSS personnalisée pour le contenu principal */
  className?: string
}

/**
 * Layout principal de l'application avec sidebar simplifiée et appbar
 * Interface épurée mais avec toutes les fonctionnalités UX
 */
export function MainAppLayout({ 
  children, 
  debugMode = false,
  appTitle = "Njillu App",
  sidebarConfig = {
    animationDuration: 300,
    hoverDelay: 100,
    autoCollapse: true
  },
  navigationItems,
  onNavigationClick,
  className
}: MainAppLayoutProps) {
  const handleNavigationClick = (item: INavigationItem) => {
    if (debugMode) {
      console.log('🎯 Navigation vers:', item.labelKey, '→', item.href)
    }
    onNavigationClick?.(item)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* AppBar fixe en haut */}
      <AppBar />
      
      {/* Sidebar simplifiée positionnée sous l'AppBar */}
      <AppSidebarSimple
        navigationItems={navigationItems}
        config={sidebarConfig}
        onItemClick={handleNavigationClick}
      />
      
      {/* Zone de contenu principal avec marge pour la sidebar */}
      <main className={`lg:ml-16 pt-14 min-h-screen p-4 ${className || ''}`}>
        {children}
      </main>
        
      {/* Debug panel si activé */}
      {debugMode && (
        <div className="fixed bottom-4 right-4 z-50 bg-card p-4 rounded-lg shadow-lg border min-w-80">
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            🔧 Mode Debug - Sidebar Simplifiée
          </h3>
          <p className="text-sm text-muted-foreground">
            MainAppLayout avec AppSidebarSimple
            <br />
            <strong>App:</strong> {appTitle}
            {navigationItems && (
              <>
                <br />
                <strong>Navigation:</strong> {navigationItems.length} items
              </>
            )}
          </p>
        </div>
      )}
    </div>
  )
}