import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export const useCurrentUserName = () => {
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfileName = async () => {
      const supabase = createClient()
      const { data: session, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        return
      }

      if (!session.session?.user) {
        setName('?')
        return
      }

      const user = session.session.user

      // Essayer d'abord user_metadata
      let userName = user.user_metadata?.full_name || user.user_metadata?.name

      // Si pas de nom dans user_metadata, essayer la table users
      if (!userName) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', user.id)
          .single()

        userName = userProfile?.full_name
      }

      // Fallback sur l'email si pas de nom
      if (!userName) {
        userName = user.email?.split('@')[0] || 'Utilisateur'
      }

      setName(userName)
    }

    fetchProfileName()
  }, [])

  return name || '?'
}
