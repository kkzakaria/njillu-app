// Service pour les données utilisateur selon DIP
import { createClient } from '@/lib/supabase/client'
import { IUserDataProvider } from '@/types/sidebar.types'

/**
 * Implémentation Supabase du fournisseur de données utilisateur
 * DIP: Implémentation concrète de l'interface abstraite
 */
export class SupabaseUserDataProvider implements IUserDataProvider {
  private client = createClient()

  async getUserName(): Promise<string | null> {
    try {
      const { data: session } = await this.client.auth.getSession()
      
      if (!session.session?.user) {
        return null
      }

      const user = session.session.user

      // Essayer d'abord user_metadata
      let userName = user.user_metadata?.full_name || user.user_metadata?.name

      // Si pas de nom dans user_metadata, essayer la table users
      if (!userName) {
        const { data: userProfile } = await this.client
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .single()

        userName = userProfile?.full_name
      }

      // Fallback sur l'email si pas de nom
      if (!userName) {
        userName = user.email?.split('@')[0] || null
      }

      return userName
    } catch (error) {
      console.error('Error fetching user name:', error)
      return null
    }
  }

  async getUserEmail(): Promise<string | null> {
    try {
      const { data: session } = await this.client.auth.getSession()
      return session.session?.user?.email || null
    } catch (error) {
      console.error('Error fetching user email:', error)
      return null
    }
  }

  async getUserAvatar(): Promise<string | null> {
    try {
      const { data: session } = await this.client.auth.getSession()
      
      if (!session.session?.user) {
        return null
      }

      const user = session.session.user

      // Essayer d'abord user_metadata
      let avatarUrl = user.user_metadata?.avatar_url

      // Si pas d'avatar dans user_metadata, essayer la table users
      if (!avatarUrl) {
        const { data: userProfile } = await this.client
          .from('users')
          .select('avatar_url')
          .eq('id', user.id)
          .single()

        avatarUrl = userProfile?.avatar_url
      }

      return avatarUrl || null
    } catch (error) {
      console.error('Error fetching user avatar:', error)
      return null
    }
  }
}

/**
 * Factory pour créer le provider selon l'environnement
 * DIP: Factory pattern pour l'injection de dépendance
 */
export const createUserDataProvider = (): IUserDataProvider => {
  // Ici on pourrait choisir différents providers selon l'environnement
  return new SupabaseUserDataProvider()
}