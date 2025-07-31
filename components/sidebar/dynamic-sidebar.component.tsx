// Sidebar avec navigation dynamique basée sur les rôles utilisateur
'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { AppSidebarSOLID } from './app-sidebar-solid'
import { createDynamicNavigationProvider } from '@/lib/sidebar/providers/dynamic-navigation.provider'
import { createUserDataProvider } from '@/lib/sidebar/providers/user-data.provider'
import { 
  ConditionalNavigationItem, 
  UserContext,
  IDynamicNavigationProvider
} from '@/types/user-roles.types'
import { INavigationItem, SidebarProps } from '@/types/sidebar.types'

/**
 * Props pour la DynamicSidebar
 * Étend SidebarProps pour la compatibilité
 */
interface DynamicSidebarProps extends Omit<SidebarProps, 'navigationItems'> {
  // Provider personnalisé pour la navigation dynamique
  dynamicNavigationProvider?: IDynamicNavigationProvider
  
  // Menu de fallback si aucune configuration trouvée
  fallbackNavigationItems?: INavigationItem[]
  
  // Callback quand le contexte utilisateur change
  onUserContextChange?: (context: UserContext | null) => void
  
  // Callback quand les éléments de navigation changent
  onNavigationItemsChange?: (items: INavigationItem[]) => void
  
  // Activer le mode debug
  debugMode?: boolean
}

/**
 * Sidebar avec navigation dynamique selon les rôles utilisateur
 * SRP: Responsabilité unique - gestion de la sidebar adaptative
 * DIP: Utilise l'injection de dépendances pour les providers
 * OCP: Extensible sans modification du code existant
 */
export const DynamicSidebar: React.FC<DynamicSidebarProps> = ({
  dynamicNavigationProvider: customDynamicProvider,
  fallbackNavigationItems = [],
  onUserContextChange,
  onNavigationItemsChange,
  debugMode = false,
  ...sidebarProps
}) => {
  const [navigationItems, setNavigationItems] = useState<INavigationItem[]>([])
  const [userContext, setUserContext] = useState<UserContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mémoriser les providers pour éviter les re-créations
  const dynamicNavigationProvider = useMemo(() => 
    customDynamicProvider || createDynamicNavigationProvider(),
    [customDynamicProvider]
  )

  const userDataProvider = useMemo(() => 
    sidebarProps.userDataProvider || createUserDataProvider(),
    [sidebarProps.userDataProvider]
  )

  // Mémoriser fallbackNavigationItems pour éviter les re-créations
  const memoizedFallbackItems = useMemo(() => fallbackNavigationItems, [fallbackNavigationItems])

  /**
   * Charger le contexte utilisateur et les éléments de navigation
   */
  useEffect(() => {
    const loadUserNavigation = async () => {
      setLoading(true)
      setError(null)

      try {
        // Récupérer le contexte utilisateur
        const context = await dynamicNavigationProvider.getUserContext()
        setUserContext(context)
        onUserContextChange?.(context)

        if (debugMode) {
          console.log('🔍 [DynamicSidebar] User context:', context)
        }

        if (!context) {
          // Utilisateur non connecté - utiliser le menu de fallback
          setNavigationItems(memoizedFallbackItems)
          onNavigationItemsChange?.(memoizedFallbackItems)
          return
        }

        // Récupérer les éléments de navigation pour cet utilisateur
        const conditionalItems = await dynamicNavigationProvider.getMenuForUser(context)
        
        // Convertir en INavigationItem compatible
        const convertedItems = convertConditionalToNavigationItems(conditionalItems)
        
        setNavigationItems(convertedItems)
        onNavigationItemsChange?.(convertedItems)

        if (debugMode) {
          console.log('🔍 [DynamicSidebar] Navigation items:', convertedItems)
          console.log('🔍 [DynamicSidebar] User roles:', context.roles)
          console.log('🔍 [DynamicSidebar] User permissions:', context.permissions)
        }

      } catch (err) {
        console.error('Error loading dynamic navigation:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        
        // En cas d'erreur, utiliser le menu de fallback
        setNavigationItems(memoizedFallbackItems)
        onNavigationItemsChange?.(memoizedFallbackItems)
      } finally {
        setLoading(false)
      }
    }

    loadUserNavigation()
  }, [dynamicNavigationProvider, debugMode]) // Suppression des callbacks des dépendances

  /**
   * Handler pour les clics sur les éléments de navigation
   */
  const handleItemClick = (item: INavigationItem) => {
    if (debugMode) {
      console.log('🎯 [DynamicSidebar] Item clicked:', item.labelKey, '→', item.href)
      console.log('🔍 [DynamicSidebar] User context:', userContext)
    }

    // Appeler le handler personnalisé s'il existe
    sidebarProps.onItemClick?.(item)
    
    // Logique supplémentaire si nécessaire
    // Par exemple, logging des actions utilisateur
  }

  /**
   * Composant de debug pour afficher les informations
   */
  const DebugInfo = () => {
    if (!debugMode) return null

    return (
      <div className="fixed top-4 right-4 z-50 bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg shadow-lg border text-xs max-w-md">
        <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
          🔍 Debug - Dynamic Sidebar
        </h4>
        <div className="space-y-1 text-yellow-700 dark:text-yellow-300">
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>Error:</strong> {error || 'None'}</p>
          <p><strong>User:</strong> {userContext?.email || 'Not logged in'}</p>
          <p><strong>Roles:</strong> {userContext?.roles.join(', ') || 'None'}</p>
          <p><strong>Menu Items:</strong> {navigationItems.length}</p>
          {navigationItems.length > 0 && (
            <div className="mt-2">
              <p><strong>Items:</strong></p>
              <ul className="list-disc list-inside ml-2">
                {navigationItems.map(item => (
                  <li key={item.id}>{item.labelKey}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <>
        <AppSidebarSOLID
          {...sidebarProps}
          navigationItems={[]} // Menu vide pendant le chargement
          userDataProvider={userDataProvider}
        />
        <DebugInfo />
      </>
    )
  }

  return (
    <>
      <AppSidebarSOLID
        {...sidebarProps}
        navigationItems={navigationItems}
        userDataProvider={userDataProvider}
        onItemClick={handleItemClick}
      />
      <DebugInfo />
    </>
  )
}

/**
 * Convertir ConditionalNavigationItem vers INavigationItem
 * Utilitaire pour maintenir la compatibilité
 */
function convertConditionalToNavigationItems(
  items: ConditionalNavigationItem[]
): INavigationItem[] {
  return items.map(item => ({
    id: item.id,
    icon: item.icon,
    labelKey: item.labelKey,
    href: item.href,
    badge: item.badge,
    isActive: item.isActive
  }))
}

/**
 * Hook pour utiliser facilement la navigation dynamique
 */
export const useDynamicNavigation = () => {
  const [dynamicProvider] = useState(() => createDynamicNavigationProvider())
  const [userContext, setUserContext] = useState<UserContext | null>(null)
  const [navigationItems, setNavigationItems] = useState<INavigationItem[]>([])

  const refreshNavigation = async () => {
    await dynamicProvider.refreshCache()
    const context = await dynamicProvider.getUserContext()
    setUserContext(context)
    
    if (context) {
      const items = await dynamicProvider.getMenuForUser(context)
      setNavigationItems(convertConditionalToNavigationItems(items))
    }
  }

  return {
    userContext,
    navigationItems,
    refreshNavigation,
    dynamicProvider
  }
}

/**
 * Factory pour créer des variants de sidebar dynamique
 * OCP: Extension sans modification
 */
export const createDynamicSidebarVariant = (
  defaultProps: Partial<DynamicSidebarProps>
) => {
  const SidebarVariant = (props: Partial<DynamicSidebarProps>) => (
    <DynamicSidebar
      {...defaultProps}
      {...props}
    />
  );
  
  SidebarVariant.displayName = 'DynamicSidebarVariant';
  
  return SidebarVariant;
}

// Export par défaut pour compatibilité
export default DynamicSidebar