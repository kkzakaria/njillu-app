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
 * Nécessite soit un email dans l'URL (flux OTP), soit un état de récupération
 */
export async function checkOtpResetAccess(searchParams: URLSearchParams) {
  // Vérifier la présence du paramètre email (flux OTP standard)
  const email = searchParams.get('email');
  
  // Debug: Loggons les paramètres reçus
  console.log('🔍 checkOtpResetAccess - SearchParams:', Object.fromEntries(searchParams));
  console.log('📧 Email parameter:', email);
  
  // Si l'email est présent dans l'URL, c'est un flux OTP légitime
  if (email) {
    console.log('✅ Accès OTP autorisé avec email:', email);
    return { isValidAccess: true, shouldRedirect: false };
  }
  
  // Vérifier aussi les paramètres de récupération traditionnels (compatibilité)
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  
  if (token && type === 'recovery') {
    return { isValidAccess: true, shouldRedirect: false };
  }
  
  // Sinon, vérifier l'état de récupération de session
  const resetFlowCheck = await checkPasswordResetFlow();
  if (resetFlowCheck.isValidResetFlow) {
    return { isValidAccess: true, shouldRedirect: false };
  }
  
  return { isValidAccess: false, shouldRedirect: true };
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
  if (from === 'signup') {
    return { isValidAccess: true, shouldRedirect: false };
  }
  
  return { isValidAccess: false, shouldRedirect: true };
}

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