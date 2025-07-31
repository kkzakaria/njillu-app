// Types pour le système de rôles et permissions utilisateur
// Architecture extensible pour menus dynamiques

export type UserRole = 
  | 'super_admin'    // Accès complet système
  | 'admin'          // Administration générale
  | 'manager'        // Gestion d'équipe/projet
  | 'user'           // Utilisateur standard
  | 'guest'          // Accès limité
  | 'viewer'         // Lecture seule

export type Permission = 
  | 'create'         // Créer des ressources
  | 'read'           // Lire des ressources
  | 'update'         // Modifier des ressources
  | 'delete'         // Supprimer des ressources
  | 'manage'         // Gérer (CRUD + permissions)
  | 'admin'          // Administration système
  | 'view_reports'   // Voir les rapports
  | 'manage_users'   // Gérer les utilisateurs
  | 'manage_settings'// Gérer les paramètres

export type ResourceType = 
  | 'dashboard'
  | 'users'
  | 'documents'
  | 'analytics'
  | 'settings'
  | 'security'
  | 'reports'
  | 'billing'
  | 'support'
  | 'api'

/**
 * Définition d'un rôle utilisateur avec ses permissions
 */
export interface UserRoleDefinition {
  role: UserRole
  name: string
  description: string
  permissions: Record<ResourceType, Permission[]>
  priority: number  // 0 = plus haute priorité
}

/**
 * Contexte utilisateur complet
 */
export interface UserContext {
  id: string
  email: string
  name?: string
  roles: UserRole[]           // Un utilisateur peut avoir plusieurs rôles
  permissions: Permission[]   // Permissions agrégées
  department?: string         // Département/équipe
  organization?: string       // Organisation
  metadata?: Record<string, unknown>  // Données contextuelles
}

/**
 * Condition pour afficher un élément de menu
 */
export interface MenuCondition {
  // Permissions requises (ET logique)
  requiredPermissions?: Permission[]
  // Rôles autorisés (OU logique)
  allowedRoles?: UserRole[]
  // Ressources sur lesquelles l'utilisateur doit avoir des droits
  requiredResources?: ResourceType[]
  // Fonction personnalisée de validation
  customCheck?: (context: UserContext) => boolean
  // Département requis
  department?: string[]
  // Organisation requise
  organization?: string[]
}

/**
 * Élément de navigation avec conditions d'accès
 */
export interface ConditionalNavigationItem {
  id: string
  icon: React.ComponentType<{ className?: string }>
  labelKey: string
  href: string
  badge?: string | number
  isActive?: boolean
  
  // Conditions d'affichage
  condition?: MenuCondition
  
  // Sous-menus
  children?: ConditionalNavigationItem[]
  
  // Groupement
  group?: string
  order?: number
  
  // Actions spéciales
  onClick?: (context: UserContext) => void
  
  // Métadonnées
  metadata?: Record<string, unknown>
}

/**
 * Configuration de menu pour un rôle/contexte
 */
export interface MenuConfiguration {
  id: string
  name: string
  description: string
  
  // Conditions d'application de cette configuration
  applies: MenuCondition
  
  // Éléments de navigation
  items: ConditionalNavigationItem[]
  
  // Configuration de la sidebar
  sidebarConfig?: {
    theme?: 'light' | 'dark' | 'auto'
    position?: 'left' | 'right'
    collapsedWidth?: number
    expandedWidth?: number
  }
  
  // Priorité (plus élevé = priorité plus haute)
  priority: number
}

/**
 * Provider pour la navigation dynamique
 */
export interface IDynamicNavigationProvider {
  // Récupérer le contexte utilisateur
  getUserContext(): Promise<UserContext | null>
  
  // Récupérer les configurations de menu disponibles
  getMenuConfigurations(): Promise<MenuConfiguration[]>
  
  // Récupérer le menu pour un utilisateur spécifique
  getMenuForUser(context: UserContext): Promise<ConditionalNavigationItem[]>
  
  // Vérifier si un utilisateur peut accéder à un élément
  canUserAccess(item: ConditionalNavigationItem, context: UserContext): boolean
  
  // Mettre à jour le cache
  refreshCache(): Promise<void>
}

/**
 * Service de gestion des permissions
 */
export interface IPermissionService {
  // Vérifier une permission
  hasPermission(context: UserContext, permission: Permission, resource?: ResourceType): boolean
  
  // Vérifier plusieurs permissions (ET logique)
  hasAllPermissions(context: UserContext, permissions: Permission[], resource?: ResourceType): boolean
  
  // Vérifier au moins une permission (OU logique)
  hasAnyPermission(context: UserContext, permissions: Permission[], resource?: ResourceType): boolean
  
  // Récupérer toutes les permissions d'un utilisateur
  getUserPermissions(context: UserContext): Permission[]
  
  // Récupérer les permissions pour une ressource
  getResourcePermissions(context: UserContext, resource: ResourceType): Permission[]
}

// ========== CONFIGURATIONS PRÉDÉFINIES ==========

/**
 * Définitions des rôles par défaut
 */
export const DEFAULT_ROLE_DEFINITIONS: Record<UserRole, UserRoleDefinition> = {
  super_admin: {
    role: 'super_admin',
    name: 'Super Administrateur',
    description: 'Accès complet au système',
    priority: 0,
    permissions: {
      dashboard: ['read', 'create', 'update', 'delete', 'manage', 'admin'],
      users: ['read', 'create', 'update', 'delete', 'manage', 'manage_users'],
      documents: ['read', 'create', 'update', 'delete', 'manage'],
      analytics: ['read', 'view_reports', 'manage'],
      settings: ['read', 'update', 'manage', 'manage_settings'],
      security: ['read', 'create', 'update', 'delete', 'manage', 'admin'],
      reports: ['read', 'create', 'view_reports', 'manage'],
      billing: ['read', 'create', 'update', 'delete', 'manage'],
      support: ['read', 'create', 'update', 'manage'],
      api: ['read', 'create', 'update', 'delete', 'manage', 'admin']
    }
  },
  
  admin: {
    role: 'admin',
    name: 'Administrateur',
    description: 'Administration générale',
    priority: 1,
    permissions: {
      dashboard: ['read', 'create', 'update', 'manage'],
      users: ['read', 'create', 'update', 'manage_users'],
      documents: ['read', 'create', 'update', 'delete', 'manage'],
      analytics: ['read', 'view_reports'],
      settings: ['read', 'update', 'manage_settings'],
      security: ['read', 'update', 'manage'],
      reports: ['read', 'view_reports'],
      billing: ['read', 'update'],
      support: ['read', 'create', 'update'],
      api: ['read', 'create', 'update']
    }
  },
  
  manager: {
    role: 'manager',
    name: 'Manager',
    description: 'Gestion d\'équipe et projets',
    priority: 2,
    permissions: {
      dashboard: ['read', 'create', 'update'],
      users: ['read', 'update'],
      documents: ['read', 'create', 'update', 'delete'],
      analytics: ['read', 'view_reports'],
      settings: ['read', 'update'],
      security: ['read', 'update'],
      reports: ['read', 'view_reports'],
      billing: ['read'],
      support: ['read', 'create'],
      api: ['read', 'create']
    }
  },
  
  user: {
    role: 'user',
    name: 'Utilisateur',
    description: 'Utilisateur standard',
    priority: 3,
    permissions: {
      dashboard: ['read'],
      users: ['read'],
      documents: ['read', 'create', 'update'],
      analytics: ['read'],
      settings: ['read', 'update'],
      security: ['read'],
      reports: ['read'],
      billing: ['read'],
      support: ['read', 'create'],
      api: ['read']
    }
  },
  
  viewer: {
    role: 'viewer',
    name: 'Visualisateur',
    description: 'Accès en lecture seule',
    priority: 4,
    permissions: {
      dashboard: ['read'],
      users: ['read'],
      documents: ['read'],
      analytics: ['read'],
      settings: ['read'],
      security: ['read'],
      reports: ['read'],
      billing: ['read'],
      support: ['read'],
      api: ['read']
    }
  },
  
  guest: {
    role: 'guest',
    name: 'Invité',
    description: 'Accès très limité',
    priority: 5,
    permissions: {
      dashboard: ['read'],
      users: [],
      documents: ['read'],
      analytics: [],
      settings: [],
      security: [],
      reports: [],
      billing: [],
      support: ['read'],
      api: []
    }
  }
}

// ========== UTILITAIRES ==========

/**
 * Fusionner les permissions de plusieurs rôles
 */
export const mergeRolePermissions = (roles: UserRole[]): Record<ResourceType, Permission[]> => {
  const merged: Record<ResourceType, Permission[]> = {} as Record<ResourceType, Permission[]>
  
  roles.forEach(role => {
    const roleDefinition = DEFAULT_ROLE_DEFINITIONS[role]
    if (roleDefinition) {
      Object.entries(roleDefinition.permissions).forEach(([resource, permissions]) => {
        const resourceType = resource as ResourceType
        if (!merged[resourceType]) {
          merged[resourceType] = []
        }
        permissions.forEach(permission => {
          if (!merged[resourceType].includes(permission)) {
            merged[resourceType].push(permission)
          }
        })
      })
    }
  })
  
  return merged
}

/**
 * Obtenir toutes les permissions d'un utilisateur
 */
export const getAllUserPermissions = (roles: UserRole[]): Permission[] => {
  const allPermissions = new Set<Permission>()
  
  roles.forEach(role => {
    const roleDefinition = DEFAULT_ROLE_DEFINITIONS[role]
    if (roleDefinition) {
      Object.values(roleDefinition.permissions).forEach(permissions => {
        permissions.forEach(permission => allPermissions.add(permission))
      })
    }
  })
  
  return Array.from(allPermissions)
}