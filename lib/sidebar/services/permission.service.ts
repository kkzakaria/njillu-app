// Service de gestion des permissions selon DIP
import { 
  IPermissionService, 
  UserContext, 
  Permission, 
  ResourceType,
  DEFAULT_ROLE_DEFINITIONS,
  mergeRolePermissions,
  getAllUserPermissions
} from '@/types/user-roles.types'

/**
 * Implémentation du service de permissions
 * SRP: Responsabilité unique - gestion des permissions
 * DIP: Implémentation de l'interface abstraite
 */
export class PermissionService implements IPermissionService {
  
  /**
   * Vérifier si un utilisateur a une permission spécifique
   */
  hasPermission(context: UserContext, permission: Permission, resource?: ResourceType): boolean {
    if (!context || !context.roles.length) {
      return false
    }

    // Si une ressource spécifique est demandée
    if (resource) {
      const rolePermissions = mergeRolePermissions(context.roles)
      const resourcePermissions = rolePermissions[resource] || []
      return resourcePermissions.includes(permission)
    }

    // Sinon, vérifier dans toutes les permissions de l'utilisateur
    return context.permissions.includes(permission)
  }

  /**
   * Vérifier si un utilisateur a toutes les permissions requises (ET logique)
   */
  hasAllPermissions(context: UserContext, permissions: Permission[], resource?: ResourceType): boolean {
    return permissions.every(permission => 
      this.hasPermission(context, permission, resource)
    )
  }

  /**
   * Vérifier si un utilisateur a au moins une des permissions (OU logique)
   */
  hasAnyPermission(context: UserContext, permissions: Permission[], resource?: ResourceType): boolean {
    return permissions.some(permission => 
      this.hasPermission(context, permission, resource)
    )
  }

  /**
   * Récupérer toutes les permissions d'un utilisateur
   */
  getUserPermissions(context: UserContext): Permission[] {
    if (!context || !context.roles.length) {
      return []
    }

    return getAllUserPermissions(context.roles)
  }

  /**
   * Récupérer les permissions pour une ressource spécifique
   */
  getResourcePermissions(context: UserContext, resource: ResourceType): Permission[] {
    if (!context || !context.roles.length) {
      return []
    }

    const rolePermissions = mergeRolePermissions(context.roles)
    return rolePermissions[resource] || []
  }

  /**
   * Vérifier si un utilisateur a un rôle spécifique
   */
  hasRole(context: UserContext, role: string): boolean {
    return context.roles.includes(role as any)
  }

  /**
   * Vérifier si un utilisateur a au moins un des rôles
   */
  hasAnyRole(context: UserContext, roles: string[]): boolean {
    return roles.some(role => this.hasRole(context, role))
  }

  /**
   * Obtenir le rôle de plus haute priorité
   */
  getHighestPriorityRole(context: UserContext): string | null {
    if (!context.roles.length) return null

    let highestRole = context.roles[0]
    let highestPriority = DEFAULT_ROLE_DEFINITIONS[highestRole]?.priority ?? 999

    for (const role of context.roles) {
      const roleDef = DEFAULT_ROLE_DEFINITIONS[role]
      if (roleDef && roleDef.priority < highestPriority) {
        highestPriority = roleDef.priority
        highestRole = role
      }
    }

    return highestRole
  }

  /**
   * Créer un contexte utilisateur à partir des données de base
   */
  createUserContext(
    userId: string,
    email: string,
    roles: string[],
    additionalData?: Partial<UserContext>
  ): UserContext {
    const userRoles = roles.filter(role => 
      Object.keys(DEFAULT_ROLE_DEFINITIONS).includes(role)
    ) as any[]

    const permissions = getAllUserPermissions(userRoles)

    return {
      id: userId,
      email,
      roles: userRoles,
      permissions,
      ...additionalData
    }
  }
}

/**
 * Instance singleton du service de permissions
 */
export const permissionService = new PermissionService()

/**
 * Factory pour créer une instance du service
 * DIP: Factory pattern pour l'injection de dépendance
 */
export const createPermissionService = (): IPermissionService => {
  return new PermissionService()
}