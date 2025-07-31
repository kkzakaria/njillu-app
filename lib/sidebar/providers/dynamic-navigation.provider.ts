// Provider pour la navigation dynamique selon DIP
import { 
  IDynamicNavigationProvider,
  UserContext,
  ConditionalNavigationItem,
  MenuConfiguration,
  MenuCondition
} from '@/types/user-roles.types'
import { createClient } from '@/lib/supabase/client'
import { permissionService } from '../services/permission.service'
import { 
  Home, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  User 
} from 'lucide-react'

/**
 * Implémentation Supabase du provider de navigation dynamique
 * DIP: Implémentation concrète de l'interface abstraite
 * SRP: Responsabilité unique - gestion de la navigation dynamique
 */
export class SupabaseDynamicNavigationProvider implements IDynamicNavigationProvider {
  private client = createClient()
  private cache: {
    userContext?: UserContext | null
    menuConfigurations?: MenuConfiguration[]
    lastUpdate: number
  } = { lastUpdate: 0 }
  
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Récupérer le contexte utilisateur depuis Supabase
   */
  async getUserContext(): Promise<UserContext | null> {
    // Vérifier le cache
    if (this.cache.userContext && this.isCacheValid()) {
      return this.cache.userContext
    }

    try {
      const { data: session } = await this.client.auth.getSession()
      
      if (!session.session?.user) {
        this.cache.userContext = null
        this.cache.lastUpdate = Date.now()
        return null
      }

      const user = session.session.user

      // Récupérer les données utilisateur étendues depuis la table users
      const { data: userProfile } = await this.client
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      // Récupérer les rôles depuis user_metadata ou table séparée
      let roles = user.user_metadata?.roles || ['user']
      if (typeof roles === 'string') {
        roles = [roles]
      }

      // Créer le contexte utilisateur
      const context = permissionService.createUserContext(
        user.id,
        user.email!,
        roles,
        {
          name: userProfile?.full_name || user.user_metadata?.full_name,
          department: userProfile?.department,
          organization: userProfile?.organization,
          metadata: {
            ...user.user_metadata,
            ...userProfile
          }
        }
      )

      this.cache.userContext = context
      this.cache.lastUpdate = Date.now()
      
      return context
    } catch (error) {
      console.error('Error fetching user context:', error)
      return null
    }
  }

  /**
   * Récupérer les configurations de menu (peut être étendu avec une table Supabase)
   */
  async getMenuConfigurations(): Promise<MenuConfiguration[]> {
    // Pour l'instant, retourner les configurations par défaut
    // TODO: Récupérer depuis une table Supabase pour plus de flexibilité
    return this.getDefaultMenuConfigurations()
  }

  /**
   * Récupérer le menu adapté pour un utilisateur
   */
  async getMenuForUser(context: UserContext): Promise<ConditionalNavigationItem[]> {
    const configurations = await this.getMenuConfigurations()
    
    // Trouver la configuration qui s'applique à cet utilisateur
    const applicableConfig = this.findApplicableConfiguration(configurations, context)
    
    if (!applicableConfig) {
      return this.getFallbackMenu()
    }

    // Filtrer les éléments selon les permissions
    return this.filterMenuItems(applicableConfig.items, context)
  }

  /**
   * Vérifier si un utilisateur peut accéder à un élément
   */
  canUserAccess(item: ConditionalNavigationItem, context: UserContext): boolean {
    if (!item.condition) {
      return true // Pas de condition = accès libre
    }

    const condition = item.condition

    // Vérifier les permissions requises
    if (condition.requiredPermissions?.length) {
      const hasPermissions = permissionService.hasAllPermissions(
        context, 
        condition.requiredPermissions
      )
      if (!hasPermissions) return false
    }

    // Vérifier les rôles autorisés  
    if (condition.allowedRoles?.length) {
      const hasRole = condition.allowedRoles.some(role => 
        context.roles.includes(role)
      )
      if (!hasRole) return false
    }

    // Vérifier les ressources requises
    if (condition.requiredResources?.length) {
      const hasResourceAccess = condition.requiredResources.every(resource =>
        permissionService.getResourcePermissions(context, resource).length > 0
      )
      if (!hasResourceAccess) return false
    }

    // Vérifier le département
    if (condition.department?.length && context.department) {
      if (!condition.department.includes(context.department)) {
        return false
      }
    }

    // Vérifier l'organisation
    if (condition.organization?.length && context.organization) {
      if (!condition.organization.includes(context.organization)) {
        return false
      }
    }

    // Vérification personnalisée
    if (condition.customCheck) {
      return condition.customCheck(context)
    }

    return true
  }

  /**
   * Rafraîchir le cache
   */
  async refreshCache(): Promise<void> {
    this.cache = { lastUpdate: 0 }
    await this.getUserContext()
  }

  /**
   * Vérifier si le cache est valide
   */
  private isCacheValid(): boolean {
    return (Date.now() - this.cache.lastUpdate) < this.CACHE_TTL
  }

  /**
   * Trouver la configuration applicable à un utilisateur
   */
  private findApplicableConfiguration(
    configurations: MenuConfiguration[],
    context: UserContext
  ): MenuConfiguration | null {
    // Trier par priorité (plus élevé en premier)
    const sortedConfigs = configurations.sort((a, b) => b.priority - a.priority)
    
    for (const config of sortedConfigs) {
      if (this.configApplies(config.applies, context)) {
        return config
      }
    }

    return null
  }

  /**
   * Vérifier si une condition s'applique à un utilisateur
   */
  private configApplies(condition: MenuCondition, context: UserContext): boolean {
    return this.canUserAccess({ condition } as ConditionalNavigationItem, context)
  }

  /**
   * Filtrer les éléments de menu selon les permissions
   */
  private filterMenuItems(
    items: ConditionalNavigationItem[],
    context: UserContext
  ): ConditionalNavigationItem[] {
    return items
      .filter(item => this.canUserAccess(item, context))
      .map(item => ({
        ...item,
        children: item.children 
          ? this.filterMenuItems(item.children, context)
          : undefined
      }))
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  /**
   * Menu de fallback en cas d'erreur
   */
  private getFallbackMenu(): ConditionalNavigationItem[] {
    return [
      {
        id: 'dashboard',
        icon: Home,
        labelKey: 'dashboard',
        href: '/dashboard'
      }
    ]
  }

  /**
   * Configurations de menu par défaut
   */
  private getDefaultMenuConfigurations(): MenuConfiguration[] {
    return [
      // Configuration Super Admin
      {
        id: 'super_admin_menu',
        name: 'Menu Super Administrateur',
        description: 'Menu complet pour les super administrateurs',
        priority: 100,
        applies: {
          allowedRoles: ['super_admin']
        },
        items: [
          {
            id: 'dashboard',
            icon: Home,
            labelKey: 'dashboard',
            href: '/dashboard',
            order: 1
          },
          {
            id: 'users',
            icon: Users,
            labelKey: 'users',
            href: '/admin/users',
            order: 2,
            condition: {
              requiredPermissions: ['manage_users']
            }
          },
          {
            id: 'analytics',
            icon: BarChart3,
            labelKey: 'analytics',
            href: '/analytics',
            order: 3,
            condition: {
              requiredPermissions: ['view_reports']
            }
          },
          {
            id: 'system',
            icon: Settings,
            labelKey: 'system',
            href: '/admin/system',
            order: 4,
            condition: {
              requiredPermissions: ['admin']
            }
          }
        ]
      },

      // Configuration Admin
      {
        id: 'admin_menu',
        name: 'Menu Administrateur',
        description: 'Menu pour les administrateurs',
        priority: 80,
        applies: {
          allowedRoles: ['admin']
        },
        items: [
          {
            id: 'dashboard',
            icon: Home,
            labelKey: 'dashboard',
            href: '/dashboard',
            order: 1
          },
          {
            id: 'users',
            icon: Users,
            labelKey: 'users',
            href: '/admin/users',
            order: 2,
            condition: {
              requiredPermissions: ['manage_users']
            }
          },
          {
            id: 'documents',
            icon: FileText,
            labelKey: 'documents',
            href: '/documents',
            order: 3
          },
          {
            id: 'analytics',
            icon: BarChart3,
            labelKey: 'analytics',
            href: '/analytics',
            order: 4,
            condition: {
              requiredPermissions: ['view_reports']
            }
          },
          {
            id: 'settings',
            icon: Settings,
            labelKey: 'settings',
            href: '/settings',
            order: 5
          }
        ]
      },

      // Configuration Manager
      {
        id: 'manager_menu',
        name: 'Menu Manager',
        description: 'Menu pour les managers',
        priority: 60,
        applies: {
          allowedRoles: ['manager']
        },
        items: [
          {
            id: 'dashboard',
            icon: Home,
            labelKey: 'dashboard',
            href: '/dashboard',
            order: 1
          },
          {
            id: 'team',
            icon: Users,
            labelKey: 'team',
            href: '/team',
            order: 2
          },
          {
            id: 'documents',
            icon: FileText,
            labelKey: 'documents',
            href: '/documents',
            order: 3
          },
          {
            id: 'reports',
            icon: BarChart3,
            labelKey: 'reports',
            href: '/reports',
            order: 4,
            condition: {
              requiredPermissions: ['view_reports']
            }
          }
        ]
      },

      // Configuration User Standard
      {
        id: 'user_menu',
        name: 'Menu Utilisateur',
        description: 'Menu pour les utilisateurs standards',
        priority: 40,
        applies: {
          allowedRoles: ['user']
        },
        items: [
          {
            id: 'dashboard',
            icon: Home,
            labelKey: 'dashboard',
            href: '/dashboard',
            order: 1
          },
          {
            id: 'documents',
            icon: FileText,
            labelKey: 'documents',
            href: '/documents',
            order: 2
          },
          {
            id: 'profile',
            icon: User,
            labelKey: 'profile',
            href: '/profile',
            order: 3
          }
        ]
      },

      // Configuration Viewer
      {
        id: 'viewer_menu',
        name: 'Menu Visualisateur',
        description: 'Menu en lecture seule',
        priority: 20,
        applies: {
          allowedRoles: ['viewer', 'guest']
        },
        items: [
          {
            id: 'dashboard',
            icon: Home,
            labelKey: 'dashboard',
            href: '/dashboard',
            order: 1
          },
          {
            id: 'documents',
            icon: FileText,
            labelKey: 'documents',
            href: '/documents',
            order: 2,
            condition: {
              requiredPermissions: ['read']
            }
          }
        ]
      }
    ]
  }
}

/**
 * Factory pour créer le provider de navigation dynamique
 * DIP: Factory pattern pour l'injection de dépendance
 */
export const createDynamicNavigationProvider = (): IDynamicNavigationProvider => {
  return new SupabaseDynamicNavigationProvider()
}