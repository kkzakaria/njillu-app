import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export const useCurrentUserImage = () => {
  const [image, setImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserImage = async () => {
      const supabase = createClient()
      const { data: session, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        return
      }

      if (!session.session?.user) {
        return
      }

      const user = session.session.user

      // Essayer d'abord user_metadata
      let avatarUrl = user.user_metadata?.avatar_url

      // Si pas d'avatar dans user_metadata, essayer la table users
      if (!avatarUrl) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('id', user.id)
          .single()

        avatarUrl = userProfile?.avatar_url
      }

      setImage(avatarUrl || null)
    }
    
    fetchUserImage()
  }, [])

  return image
}
