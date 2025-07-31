// Démo complète de la sidebar dynamique avec simulation de rôles
'use client'

import React, { useState, useCallback } from 'react'
import { DynamicSidebar } from './dynamic-sidebar.component'
import { 
  UserContext, 
  UserRole, 
  IDynamicNavigationProvider,
  ConditionalNavigationItem,
  MenuConfiguration
} from '@/types/user-roles.types'
import { permissionService } from '@/lib/sidebar/services/permission.service'
import { 
  Home, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Shield, 
  HelpCircle,
  User,
  Crown,
  Eye
} from 'lucide-react'

/**
 * Provider de démonstration pour tester différents rôles
 * Simule différents utilisateurs avec des rôles variés
 */
class DemoNavigationProvider implements IDynamicNavigationProvider {
  private currentUser: UserContext | null = null

  constructor(private demoUser: UserContext | null = null) {
    this.currentUser = demoUser
  }

  async getUserContext(): Promise<UserContext | null> {
    return this.currentUser
  }

  async getMenuConfigurations(): Promise<MenuConfiguration[]> {
    return [] // Utilise la logique par défaut
  }

  async getMenuForUser(context: UserContext): Promise<ConditionalNavigationItem[]> {
    // Menu adapté selon le rôle le plus élevé
    const highestRole = permissionService.getHighestPriorityRole(context) as UserRole

    switch (highestRole) {
      case 'super_admin':
        return this.getSuperAdminMenu()
      case 'admin':
        return this.getAdminMenu()
      case 'manager':
        return this.getManagerMenu()
      case 'user':
        return this.getUserMenu()
      case 'viewer':
      case 'guest':
        return this.getViewerMenu()
      default:
        return this.getDefaultMenu()
    }
  }

  canUserAccess(item: ConditionalNavigationItem, context: UserContext): boolean {
    if (!item.condition) return true

    const condition = item.condition

    // Vérifier les rôles
    if (condition.allowedRoles?.length) {
      const hasRole = condition.allowedRoles.some(role => 
        context.roles.includes(role)
      )
      if (!hasRole) return false
    }

    // Vérifier les permissions
    if (condition.requiredPermissions?.length) {
      const hasPermissions = permissionService.hasAllPermissions(
        context, 
        condition.requiredPermissions
      )
      if (!hasPermissions) return false
    }

    return true
  }

  async refreshCache(): Promise<void> {
    // Pas de cache dans la démo
  }

  // Setter pour changer l'utilisateur courant
  setCurrentUser(user: UserContext | null) {
    this.currentUser = user
  }

  private getSuperAdminMenu(): ConditionalNavigationItem[] {
    return [
      {
        id: 'dashboard',
        icon: Home,
        labelKey: 'Dashboard',
        href: '/dashboard',
        order: 1
      },
      {
        id: 'system-admin',
        icon: Crown,
        labelKey: 'Administration Système',
        href: '/admin/system',
        order: 2,
        badge: 'ADMIN'
      },
      {
        id: 'users',
        icon: Users,
        labelKey: 'Gestion Utilisateurs',
        href: '/admin/users',
        order: 3
      },
      {
        id: 'analytics',
        icon: BarChart3,
        labelKey: 'Analytics Avancées',
        href: '/admin/analytics',
        order: 4
      },
      {
        id: 'security',
        icon: Shield,
        labelKey: 'Sécurité Système',
        href: '/admin/security',
        order: 5,
        badge: '!'
      },
      {
        id: 'settings',
        icon: Settings,
        labelKey: 'Paramètres Globaux',
        href: '/admin/settings',
        order: 6
      }
    ]
  }

  private getAdminMenu(): ConditionalNavigationItem[] {
    return [
      {
        id: 'dashboard',
        icon: Home,
        labelKey: 'Dashboard',
        href: '/dashboard',
        order: 1
      },
      {
        id: 'users',
        icon: Users,
        labelKey: 'Gestion Équipe',
        href: '/admin/users',
        order: 2
      },
      {
        id: 'documents',
        icon: FileText,
        labelKey: 'Documents',
        href: '/documents',
        order: 3
      },
      {
        id: 'reports',
        icon: BarChart3,
        labelKey: 'Rapports',
        href: '/reports',
        order: 4
      },
      {
        id: 'settings',
        icon: Settings,
        labelKey: 'Paramètres',
        href: '/settings',
        order: 5
      }
    ]
  }

  private getManagerMenu(): ConditionalNavigationItem[] {
    return [
      {
        id: 'dashboard',
        icon: Home,
        labelKey: 'Dashboard',
        href: '/dashboard',
        order: 1
      },
      {
        id: 'team',
        icon: Users,
        labelKey: 'Mon Équipe',
        href: '/team',
        order: 2,
        badge: '5'
      },
      {
        id: 'documents',
        icon: FileText,
        labelKey: 'Documents Projet',
        href: '/documents',
        order: 3
      },
      {
        id: 'reports',
        icon: BarChart3,
        labelKey: 'Rapports Équipe',
        href: '/team/reports',
        order: 4
      }
    ]
  }

  private getUserMenu(): ConditionalNavigationItem[] {
    return [
      {
        id: 'dashboard',
        icon: Home,
        labelKey: 'Accueil',
        href: '/dashboard',
        order: 1
      },
      {
        id: 'documents',
        icon: FileText,
        labelKey: 'Mes Documents',
        href: '/documents',
        order: 2,
        badge: '12'
      },
      {
        id: 'profile',
        icon: User,
        labelKey: 'Mon Profil',
        href: '/profile',
        order: 3
      },
      {
        id: 'help',
        icon: HelpCircle,
        labelKey: 'Aide',
        href: '/help',
        order: 4
      }
    ]
  }

  private getViewerMenu(): ConditionalNavigationItem[] {
    return [
      {
        id: 'dashboard',
        icon: Eye,
        labelKey: 'Consultation',
        href: '/dashboard',
        order: 1
      },
      {
        id: 'documents',
        icon: FileText,
        labelKey: 'Documents (Lecture)',
        href: '/documents',
        order: 2
      }
    ]
  }

  private getDefaultMenu(): ConditionalNavigationItem[] {
    return [
      {
        id: 'dashboard',
        icon: Home,
        labelKey: 'Accueil',
        href: '/dashboard',
        order: 1
      }
    ]
  }
}

/**
 * Utilisateurs de démonstration
 */
const DEMO_USERS: Record<string, UserContext> = {
  super_admin: permissionService.createUserContext(
    'demo-super-admin',
    'superadmin@demo.com',
    ['super_admin'],
    {
      name: 'Super Administrateur',
      department: 'IT',
      organization: 'Demo Corp'
    }
  ),
  admin: permissionService.createUserContext(
    'demo-admin',
    'admin@demo.com',
    ['admin'],
    {
      name: 'Administrateur Système',
      department: 'IT',
      organization: 'Demo Corp'
    }
  ),
  manager: permissionService.createUserContext(
    'demo-manager',
    'manager@demo.com',
    ['manager'],
    {
      name: 'Chef de Projet',
      department: 'Development',
      organization: 'Demo Corp'
    }
  ),
  user: permissionService.createUserContext(
    'demo-user',
    'user@demo.com',
    ['user'],
    {
      name: 'Utilisateur Standard',
      department: 'Development',
      organization: 'Demo Corp'
    }
  ),
  viewer: permissionService.createUserContext(
    'demo-viewer',
    'viewer@demo.com',
    ['viewer'],
    {
      name: 'Consultant Externe',
      department: 'External',
      organization: 'Demo Corp'
    }
  )
}

/**
 * Props pour le composant de démonstration
 */
interface DynamicSidebarDemoProps {
  children?: React.ReactNode
}

/**
 * Composant de démonstration principal
 */
export const DynamicSidebarDemo: React.FC<DynamicSidebarDemoProps> = ({ children }) => {
  const [currentUserKey, setCurrentUserKey] = useState<string>('user')
  const [demoProvider, setDemoProvider] = useState(() => 
    new DemoNavigationProvider(DEMO_USERS[currentUserKey])
  )

  const handleUserChange = useCallback((userKey: string) => {
    setCurrentUserKey(userKey)
    const newProvider = new DemoNavigationProvider(DEMO_USERS[userKey] || null)
    setDemoProvider(newProvider)
  }, [])

  const currentUser = DEMO_USERS[currentUserKey]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Contrôles de démonstration */}
      <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border min-w-80">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          🎭 Démonstration Sidebar Dynamique
        </h3>
        
        {/* Sélecteur de rôle */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rôle utilisateur :
          </label>
          <select
            value={currentUserKey}
            onChange={(e) => handleUserChange(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">-- Déconnecté --</option>
            <option value="super_admin">🟣 Super Administrateur</option>
            <option value="admin">🔵 Administrateur</option>
            <option value="manager">🟢 Manager</option>
            <option value="user">🟡 Utilisateur</option>
            <option value="viewer">🟠 Visualisateur</option>
          </select>
        </div>

        {/* Informations utilisateur actuel */}
        {currentUser && (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Utilisateur actuel :
            </h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p><strong>Nom :</strong> {currentUser.name}</p>
              <p><strong>Email :</strong> {currentUser.email}</p>
              <p><strong>Rôles :</strong> {currentUser.roles.join(', ')}</p>
              <p><strong>Département :</strong> {currentUser.department}</p>
              <p><strong>Permissions :</strong> {currentUser.permissions.length} permissions</p>
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <p>💡 <strong>Astuce :</strong> Changez de rôle pour voir le menu s&apos;adapter automatiquement !</p>
        </div>
      </div>

      {/* Sidebar dynamique */}
      <DynamicSidebar
        dynamicNavigationProvider={demoProvider}
        debugMode={true}
        config={{
          animationDuration: 300,
          hoverDelay: 100
        }}
        onItemClick={(item) => {
          console.log('🎯 Navigation vers:', item.labelKey, '→', item.href)
          // Ici vous pourriez ajouter une vraie navigation
        }}
        onUserContextChange={(context) => {
          console.log('👤 Contexte utilisateur changé:', context)
        }}
        onNavigationItemsChange={(items) => {
          console.log('📋 Éléments de navigation mis à jour:', items.length, 'éléments')
        }}
      />

      {/* Zone de contenu principal */}
      <div className="lg:ml-16 min-h-screen">
        <main className="p-8">
          {children || (
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                Démonstration Sidebar Dynamique
              </h1>
              
              <div className="grid gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    🚀 Fonctionnalités
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                    <div>
                      <h3 className="font-semibold mb-2">🎯 Menus Adaptatifs</h3>
                      <ul className="text-sm space-y-1">
                        <li>• Menu basé sur les rôles utilisateur</li>
                        <li>• Permissions granulaires</li>
                        <li>• Éléments conditionnels</li>
                        <li>• Badges et notifications</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">⚡ Performance</h3>
                      <ul className="text-sm space-y-1">
                        <li>• Cache intelligent</li>
                        <li>• Chargement optimisé</li>
                        <li>• Fallback sécurisé</li>
                        <li>• Mode debug intégré</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    🎭 Rôles Disponibles
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(DEMO_USERS).map(([key, user]) => (
                      <div key={key} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {user.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.roles.join(', ')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {user.permissions.length} permissions
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default DynamicSidebarDemo