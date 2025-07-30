// Composant de test pour vérifier les corrections de la sidebar
'use client'

import React, { useState } from 'react'
import { AppSidebar } from './app-sidebar-solid'

/**
 * Composant de test pour la sidebar SOLID
 * Permet de tester les corrections de centrage et rechargement
 */
export const SidebarTest: React.FC = () => {
  const [testMode, setTestMode] = useState<'normal' | 'no-provider' | 'custom-provider'>('normal')

  // Provider de test personnalisé
  const customUserProvider = {
    async getUserName() { 
      console.log('🔄 Custom provider: getUserName called')
      return 'Test User' 
    },
    async getUserEmail() { 
      console.log('🔄 Custom provider: getUserEmail called')
      return 'test@example.com' 
    },
    async getUserAvatar() { 
      console.log('🔄 Custom provider: getUserAvatar called')
      return null 
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Contrôles de test */}
      <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border">
        <h3 className="text-sm font-semibold mb-2">🧪 Test Sidebar SOLID</h3>
        <div className="space-y-2">
          <button
            onClick={() => setTestMode('normal')}
            className={`w-full text-left px-2 py-1 rounded ${
              testMode === 'normal' 
                ? 'bg-blue-100 text-blue-800' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            🟢 Provider normal
          </button>
          <button
            onClick={() => setTestMode('custom-provider')}
            className={`w-full text-left px-2 py-1 rounded ${
              testMode === 'custom-provider' 
                ? 'bg-blue-100 text-blue-800' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            🔧 Provider personnalisé
          </button>
          <button
            onClick={() => setTestMode('no-provider')}
            className={`w-full text-left px-2 py-1 rounded ${
              testMode === 'no-provider' 
                ? 'bg-blue-100 text-blue-800' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            ❌ Sans provider
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          <p>✅ Footer centré en mode restreint</p>
          <p>⚡ Pas de rechargement sur transition</p>
        </div>
      </div>

      {/* Sidebar avec configuration de test */}
      <AppSidebar
        userDataProvider={testMode === 'custom-provider' ? customUserProvider : undefined}
        config={{
          animationDuration: 200, // Animation rapide pour test
          hoverDelay: 50
        }}
        onItemClick={(item) => {
          console.log('🎯 Navigation test:', item.labelKey, '→', item.href)
        }}
      />

      {/* Zone de contenu pour test */}
      <div className="lg:ml-16 min-h-screen">
        <main className="p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Test Sidebar SOLID</h1>
            
            <div className="grid gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">🎯 Corrections Apportées</h2>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <p>
                    <strong>✅ Footer centré en mode restreint</strong><br/>
                    <code>justify-center</code> appliqué conditionnellement quand <code>!isExpanded</code>
                  </p>
                  <p>
                    <strong>⚡ Optimisation du rechargement</strong><br/>
                    <code>useMemo</code> pour le userDataProvider et <code>useRef</code> pour éviter les re-fetch
                  </p>
                  <p>
                    <strong>🔧 Performance améliorée</strong><br/>
                    <code>useCallback</code> pour les fonctions et cache intelligent des données
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">🧪 Instructions de Test</h2>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p><strong>1.</strong> Survolez la sidebar pour voir l&apos;expansion</p>
                  <p><strong>2.</strong> Vérifiez que l&apos;avatar reste centré en mode restreint</p>
                  <p><strong>3.</strong> Basculez entre les providers (panneau en haut à droite)</p>
                  <p><strong>4.</strong> Observez la console pour les appels de données</p>
                  <p><strong>5.</strong> Redimensionnez la fenêtre pour tester le responsive</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default SidebarTest