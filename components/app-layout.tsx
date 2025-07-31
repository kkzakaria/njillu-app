"use client"

import { DynamicSidebar } from "@/components/sidebar"
import { AppBar } from "@/components/appbar"

interface AppLayoutProps {
  children: React.ReactNode
  /** Activer le mode demo avec sélecteur de rôles */
  demoMode?: boolean
  /** Mode debug pour le développement */
  debugMode?: boolean
  /** Afficher le header avec navigation */
  showHeader?: boolean
  /** Afficher le footer */
  showFooter?: boolean
  /** Titre de l'application dans le header */
  appTitle?: string
  /** Texte du footer */
  footerText?: string
}

export function AppLayout({ 
  children, 
  demoMode = false, 
  debugMode = false,
  showHeader = true,
  showFooter = true,
  appTitle = "Mon App",
  footerText = "Copyright © 2025"
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DynamicSidebar
        debugMode={debugMode}
        config={{
          animationDuration: 300,
          hoverDelay: 100,
          showHeader,
          showFooter,
          headerTitle: appTitle,
          headerClickable: true
        }}
        onItemClick={(item) => {
          if (debugMode) {
            console.log('🎯 Navigation vers:', item.labelKey, '→', item.href)
          }
        }}
        onUserContextChange={(context) => {
          if (debugMode) {
            console.log('👤 Contexte utilisateur changé:', context)
          }
        }}
        onNavigationItemsChange={(items) => {
          if (debugMode) {
            console.log('📋 Éléments de navigation mis à jour:', items.length, 'éléments')
          }
        }}
      />
      
      {/* Content with responsive margin */}
      <div className="lg:ml-16 min-h-screen">
        {showHeader && <AppBar />}
        <main className="p-4">
          {children}
        </main>
        
        {showFooter && (
          <footer className="mt-8 p-4 text-center text-sm text-gray-600 dark:text-gray-400">
            {footerText}
          </footer>
        )}
        
        {/* Demo controls */}
        {demoMode && (
          <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border min-w-80">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              🎭 Mode Démonstration
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              La sidebar s&apos;adapte selon l&apos;utilisateur connecté via Supabase.
              <br />
              <strong>Mode Debug:</strong> {debugMode ? 'Activé' : 'Désactivé'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}