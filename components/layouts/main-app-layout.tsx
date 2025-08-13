"use client"

import { DynamicSidebar } from "@/components/sidebar"
import { AppBar } from "@/components/appbar"
import { INavigationItem } from '@/types/sidebar.types';

export interface MainAppLayoutProps {
  children: React.ReactNode
  /** Mode debug pour le développement */
  debugMode?: boolean
  /** Titre de l'application dans l'appbar */
  appTitle?: string
  /** Configuration personnalisée pour la sidebar */
  sidebarConfig?: {
    animationDuration?: number
    hoverDelay?: number
    headerClickable?: boolean
    showHeader?: boolean
    showFooter?: boolean
  }
  /** Items de navigation personnalisés */
  navigationItems?: INavigationItem[]
  /** Callback pour les clics sur les éléments de navigation */
  onNavigationClick?: (item: { labelKey: string; href: string }) => void
  /** Callback pour les changements de contexte utilisateur */
  onUserContextChange?: (context: any) => void
  /** Classe CSS personnalisée pour le contenu principal */
  className?: string
}

/**
 * Layout principal de l'application avec sidebar et appbar intégrées
 * Compatible avec l'architecture existante MainLayout
 */
export function MainAppLayout({ 
  children, 
  debugMode = false,
  appTitle = "Njillu App",
  sidebarConfig = {
    animationDuration: 300,
    hoverDelay: 100,
    headerClickable: true,
    showHeader: false,
    showFooter: false
  },
  navigationItems,
  onNavigationClick,
  onUserContextChange,
  className
}: MainAppLayoutProps) {
  const handleNavigationClick = (item: { labelKey: string; href: string }) => {
    if (debugMode) {
      console.log('🎯 Navigation vers:', item.labelKey, '→', item.href)
    }
    onNavigationClick?.(item)
  }

  const handleUserContextChange = (context: any) => {
    if (debugMode) {
      console.log('👤 Contexte utilisateur changé:', context)
    }
    onUserContextChange?.(context)
  }

  const handleNavigationItemsChange = (items: any[]) => {
    if (debugMode) {
      console.log('📋 Éléments de navigation mis à jour:', items.length, 'éléments')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* AppBar fixe en haut */}
      <AppBar />
      
      {/* Sidebar positionnée sous l'AppBar */}
      <DynamicSidebar
        debugMode={debugMode}
        config={{
          animationDuration: sidebarConfig.animationDuration,
          hoverDelay: sidebarConfig.hoverDelay,
          showHeader: sidebarConfig.showHeader || false,
          showFooter: sidebarConfig.showFooter || false,
          headerTitle: appTitle,
          headerClickable: sidebarConfig.headerClickable
        }}
        fallbackNavigationItems={navigationItems}
        onItemClick={handleNavigationClick}
        onUserContextChange={handleUserContextChange}
        onNavigationItemsChange={handleNavigationItemsChange}
      />
      
      {/* Zone de contenu principal avec marge pour la sidebar */}
      <main className={`lg:ml-16 pt-14 min-h-screen p-4 ${className || ''}`}>
        {children}
      </main>
        
      {/* Debug panel si activé */}
      {debugMode && (
        <div className="fixed bottom-4 right-4 z-50 bg-card p-4 rounded-lg shadow-lg border min-w-80">
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            🔧 Mode Debug
          </h3>
          <p className="text-sm text-muted-foreground">
            MainAppLayout actif avec AppBar et Sidebar
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