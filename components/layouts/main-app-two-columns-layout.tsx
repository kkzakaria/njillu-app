"use client"

import { AppSidebarSimple } from "@/components/sidebar/app-sidebar-simple"
import { AppBar } from "@/components/appbar"
import { TwoColumnsLayout } from "./two-columns-layout"
import { INavigationItem } from '@/types/sidebar.types'
import { useIsMobile } from '@/hooks/use-mobile'

export interface MainAppTwoColumnsLayoutProps {
  /** Contenu de la colonne gauche */
  leftColumn: React.ReactNode
  /** Contenu de la colonne droite */
  rightColumn: React.ReactNode
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
  /** Classe CSS personnalisée pour le TwoColumnsLayout */
  columnsClassName?: string
}

/**
 * Layout principal combinant MainAppLayout et TwoColumnsLayout
 * Structure fixe (AppBar + Sidebar) avec colonnes à scroll isolé
 */
export function MainAppTwoColumnsLayout({ 
  leftColumn,
  rightColumn,
  debugMode = false,
  appTitle = "Njillu App",
  sidebarConfig = {
    animationDuration: 300,
    hoverDelay: 100,
    autoCollapse: true
  },
  navigationItems,
  onNavigationClick,
  className,
  columnsClassName
}: MainAppTwoColumnsLayoutProps) {
  const isMobile = useIsMobile()
  
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
      
      {/* Zone de contenu principal avec TwoColumnsLayout */}
      <main className={`lg:ml-14 pt-14 min-h-screen ${className || ''}`}>
        {/* Container avec hauteur contrainte pour permettre le scroll isolé */}
        <div className="h-[calc(100vh-3.5rem)] w-full">
          <TwoColumnsLayout
            left={leftColumn}
            right={rightColumn}
            className={columnsClassName}
          />
        </div>
      </main>
        
      {/* Debug panel si activé */}
      {debugMode && (
        <div className="fixed bottom-4 right-4 z-50 bg-card p-4 rounded-lg shadow-lg border min-w-80">
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            🔧 Mode Debug - Layout Composé
          </h3>
          <p className="text-sm text-muted-foreground">
            MainAppLayout + TwoColumnsLayout
            <br />
            <strong>App:</strong> {appTitle}
            <br />
            <strong>Mobile:</strong> {isMobile ? 'Oui' : 'Non'}
            {navigationItems && (
              <>
                <br />
                <strong>Navigation:</strong> {navigationItems.length} items
              </>
            )}
            <br />
            <strong>Scroll:</strong> Isolé par colonne
          </p>
        </div>
      )}
    </div>
  )
}