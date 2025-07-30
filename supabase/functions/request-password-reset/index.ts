import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  email: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email }: RequestBody = await req.json()
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // ✅ Utiliser SERVICE_ROLE_KEY pour les opérations admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // ✅ Utiliser signInWithOtp qui envoie automatiquement l'email
    const { error } = await supabaseAdmin.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false, // Pour reset password, ne pas créer de nouveaux utilisateurs
        emailRedirectTo: `${req.headers.get('origin')}/auth/reset-password-otp`
      }
    })

    if (error) {
      console.error('Supabase signInWithOtp error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Génération d'un token cryptographiquement sécurisé
    const timestamp = Date.now().toString()
    const secret = Deno.env.get('NEXTAUTH_SECRET') ?? 'fallback-secret'
    const randomBytes = crypto.getRandomValues(new Uint8Array(16))
    const randomString = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')
    
    // Combiner email + timestamp + secret + random pour un hash unique
    const tokenData = `${email}:${timestamp}:${randomString}`
    const encoder = new TextEncoder()
    const data_encoded = encoder.encode(tokenData + secret)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data_encoded)
    const hashArray = new Uint8Array(hashBuffer)
    const fullHash = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('')
    
    // Utiliser les 16 premiers chars du hash sécurisé
    const tempToken = fullHash.substring(0, 16)

    const redirectUrl = `${req.headers.get('origin')}/auth/reset-password-otp?email=${encodeURIComponent(email)}&temp_token=${tempToken}`
    
    // Utiliser le même hash complet pour les cookies (plus cohérent)
    const token = fullHash
    
    return new Response(
      JSON.stringify({
        success: true,
        redirectUrl,
        email
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Set-Cookie': [
            `reset-token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=600; Path=/auth`,
            `reset-email=${email}; HttpOnly; Secure; SameSite=Strict; Max-Age=600; Path=/auth`
          ].join(', ')
        }
      }
    )

  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})