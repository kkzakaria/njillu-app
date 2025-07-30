import { createClient } from "@/lib/supabase/server";

/**
 * Vérifie la présence d'une session utilisateur valide
 * Utilise getClaims() pour JWT Signing Keys (méthode moderne)
 * Retourne les informations de session pour gestion côté page
 */
export async function checkAuthenticationStatus() {
  const supabase = await createClient();
  
  try {
    // Utilisation de la nouvelle méthode getClaims() pour JWT Signing Keys
    const { data, error } = await supabase.auth.getClaims();
    
    if (!error && data && data.claims && data.claims.sub) {
      return { 
        isAuthenticated: true, 
        shouldRedirect: true,
        user: {
          id: data.claims.sub,
          email: data.claims.email
        }
      };
    }
    
    return { isAuthenticated: false, shouldRedirect: false };
  } catch {
    // Fallback silencieux vers la méthode traditionnelle
    return await checkAuthenticationStatusFallback();
  }
}

/**
 * Version fallback utilisant getSession() + getUser() (méthode traditionnelle)
 * Utilisée automatiquement si getClaims() échoue
 */
export async function checkAuthenticationStatusFallback() {
  const supabase = await createClient();
  
  try {
    // Récupération de la session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return { isAuthenticated: false, shouldRedirect: false };
    }
    
    // Validation supplémentaire avec getUser() pour vérifier le JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (!userError && user) {
      return { 
        isAuthenticated: true, 
        shouldRedirect: true,
        user: {
          id: user.id,
          email: user.email
        }
      };
    }
    
    return { isAuthenticated: false, shouldRedirect: false };
  } catch {
    return { isAuthenticated: false, shouldRedirect: false };
  }
}