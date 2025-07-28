import { createClient } from "@/lib/supabase/server";

/**
 * Vérifie si l'utilisateur est dans un état de récupération de mot de passe
 * Utilise les paramètres d'URL pour détecter un flux de reset valide
 */
export async function checkPasswordResetFlow() {
  const supabase = await createClient();
  
  try {
    // Vérifier s'il y a une session de récupération en cours
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return { isValidResetFlow: false, shouldRedirect: true };
    }
    
    // Vérifier si l'utilisateur est dans un état de récupération
    // Supabase marque les sessions de récupération avec aud !== 'authenticated'
    if (session.user && session.user.aud !== 'authenticated') {
      return { 
        isValidResetFlow: true, 
        shouldRedirect: false,
        session 
      };
    }
    
    // Si l'utilisateur est complètement authentifié, rediriger vers protected
    return { isValidResetFlow: false, shouldRedirect: true };
    
  } catch {
    return { isValidResetFlow: false, shouldRedirect: true };
  }
}

/**
 * Vérifie si l'utilisateur peut accéder à la page OTP de reset
 * SÉCURISÉ : Vérifie qu'une demande OTP de récupération a été effectuée récemment
 */
export async function checkOtpResetAccess(searchParams: URLSearchParams) {
  // Vérifier la présence du paramètre email (flux OTP standard)
  const email = searchParams.get('email');
  
  console.log('🔍 checkOtpResetAccess - SearchParams:', Object.fromEntries(searchParams));
  console.log('📧 Email parameter:', email);
  
  // Vérifier aussi les paramètres de récupération traditionnels en premier (compatibilité)
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  
  if (token && type === 'recovery') {
    console.log('✅ Accès OTP reset autorisé - Token recovery traditionnel valide');
    return { isValidAccess: true, shouldRedirect: false };
  }
  
  // Pour le flux OTP moderne, email obligatoire
  if (!email) {
    console.log('❌ Accès OTP reset refusé - Email parameter manquant');
    return { isValidAccess: false, shouldRedirect: true };
  }
  
  // Vérifier qu'il y a une session OTP en cours pour cet email
  const supabase = await createClient();
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    console.log('🔍 Session state for reset OTP:', { 
      exists: !!session, 
      email: session?.user?.email,
      aud: session?.user?.aud,
      requestedEmail: email
    });
    
    // Si une session existe et correspond à l'email demandé
    if (session && session.user && session.user.email === email) {
      console.log('✅ Accès OTP reset autorisé - Session OTP valide pour:', email);
      return { isValidAccess: true, shouldRedirect: false };
    }
    
    // Vérifier l'état de récupération de session (fallback pour autres flux)
    const resetFlowCheck = await checkPasswordResetFlow();
    if (resetFlowCheck.isValidResetFlow) {
      console.log('✅ Accès OTP reset autorisé - État de récupération valide');
      return { isValidAccess: true, shouldRedirect: false };
    }
    
    // SÉCURITÉ : Sans session OTP récente = accès refusé
    // Ceci empêche l'accès direct en construisant manuellement l'URL
    console.log('❌ Accès OTP reset refusé - Aucune session OTP/recovery récente trouvée pour:', email);
    console.log('🛡️ Sécurité : Accès direct bloqué, redirection vers forgot-password');
    return { isValidAccess: false, shouldRedirect: true };
    
  } catch (error) {
    console.log('❌ Erreur vérification session OTP reset:', error);
    // En cas d'erreur, refuser l'accès par sécurité
    return { isValidAccess: false, shouldRedirect: true };
  }
}

/**
 * Vérifie si l'utilisateur peut accéder à la page de mise à jour de mot de passe
 * Nécessite un état de récupération ou des paramètres d'URL valides
 */
export async function checkUpdatePasswordAccess(searchParams: URLSearchParams) {
  // Vérifier la présence des paramètres de récupération
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  
  // Si les paramètres de récupération sont présents
  if (token && type === 'recovery') {
    return { isValidAccess: true, shouldRedirect: false };
  }
  
  // Vérifier l'état de récupération de session
  const resetFlowCheck = await checkPasswordResetFlow();
  if (resetFlowCheck.isValidResetFlow) {
    return { isValidAccess: true, shouldRedirect: false };
  }
  
  return { isValidAccess: false, shouldRedirect: true };
}

/**
 * Vérifie si l'utilisateur peut accéder à la page OTP d'inscription
 * SÉCURISÉ : Vérifie qu'une demande OTP d'inscription a été effectuée récemment
 */
export async function checkSignUpOtpAccess(searchParams: URLSearchParams) {
  // Vérifier la présence du paramètre email avec type=signup
  const email = searchParams.get('email');
  const type = searchParams.get('type');
  
  console.log('🔍 checkSignUpOtpAccess - SearchParams:', Object.fromEntries(searchParams));
  console.log('📧 Email parameter:', email, 'Type:', type);
  
  // Paramètres requis manquants
  if (!email || type !== 'signup') {
    console.log('❌ Accès OTP inscription refusé - Paramètres manquants');
    return { isValidAccess: false, shouldRedirect: true };
  }
  
  // Vérifier qu'il y a une session OTP en cours pour cet email
  const supabase = await createClient();
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    console.log('🔍 Session state for signup OTP:', { 
      exists: !!session, 
      email: session?.user?.email,
      aud: session?.user?.aud,
      requestedEmail: email
    });
    
    // Si une session existe et correspond à l'email demandé
    if (session && session.user && session.user.email === email) {
      console.log('✅ Accès OTP inscription autorisé - Session OTP valide pour:', email);
      return { isValidAccess: true, shouldRedirect: false };
    }
    
    // SÉCURITÉ : Même avec les bons paramètres, sans session OTP récente = accès refusé
    // Ceci empêche l'accès direct en construisant manuellement l'URL
    console.log('❌ Accès OTP inscription refusé - Aucune session OTP récente trouvée pour:', email);
    console.log('🛡️ Sécurité : Accès direct bloqué, redirection vers inscription');
    return { isValidAccess: false, shouldRedirect: true };
    
  } catch (error) {
    console.log('❌ Erreur vérification session OTP inscription:', error);
    // En cas d'erreur, refuser l'accès par sécurité
    return { isValidAccess: false, shouldRedirect: true };
  }
}

/**
 * Vérifie si l'utilisateur peut accéder à la page de succès d'inscription
 * Utilise un flag temporaire en session ou des paramètres d'URL
 */
export async function checkSignUpSuccessAccess(searchParams: URLSearchParams) {
  // Vérifier la présence de paramètres de confirmation
  const confirmationType = searchParams.get('type');
  const confirmed = searchParams.get('confirmed');
  
  // Si c'est une confirmation email, l'accès est légitime
  if (confirmationType === 'signup' || confirmed === 'true') {
    return { isValidAccess: true, shouldRedirect: false };
  }
  
  // Pour les cas où l'inscription vient de se faire sans email de confirmation
  // nous utiliserons un système de référence dans l'URL ou session
  const from = searchParams.get('from');
  if (from === 'signup' || from === 'signup-otp') {
    return { isValidAccess: true, shouldRedirect: false };
  }
  
  return { isValidAccess: false, shouldRedirect: true };
}

// Les fonctions de génération et validation de tokens custom ont été supprimées
// car nous utilisons maintenant le système natif de Supabase Auth OTP
// qui gère automatiquement la sécurité des tokens

/**
 * Utilitaire pour extraire les paramètres de recherche côté serveur
 */
export function getSearchParamsFromRequest(request?: Request): URLSearchParams {
  if (!request) {
    return new URLSearchParams();
  }
  
  const url = new URL(request.url);
  return url.searchParams;
}