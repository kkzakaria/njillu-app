import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export const useCurrentUserEmail = () => {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserEmail = async () => {
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
      setEmail(user.email || null)
    }
    
    fetchUserEmail()
  }, [])

  return email
}