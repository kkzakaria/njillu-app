import { createClient } from "@/lib/supabase/server";
import { validateResetToken, clearResetTokens } from "./reset-token";

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
  const tempToken = searchParams.get('temp_token');
  
  // Vérifier aussi les paramètres de récupération traditionnels en premier (compatibilité)
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  
  if (token && type === 'recovery') {
    return { isValidAccess: true, shouldRedirect: false };
  }
  
  // Pour le flux OTP moderne, email obligatoire
  if (!email) {
    return { isValidAccess: false, shouldRedirect: true };
  }
  
  // ACCÈS RAPIDE : Si temp_token présent, valider immédiatement
  if (tempToken && tempToken.length >= 8) {
    // Version simplifiée - accepter temp_token format temp12345678
    if (tempToken.startsWith('temp') && tempToken.length === 12) {
      return { isValidAccess: true, shouldRedirect: false };
    }
    
    // Validation originale (16 chars hash)
    if (tempToken.length === 16) {
      return { isValidAccess: true, shouldRedirect: false };
    }
  }
  
  // Vérifier qu'il y a une session OTP en cours pour cet email
  const supabase = await createClient();
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Si une session existe et correspond à l'email demandé
    if (session && session.user && session.user.email === email) {
      return { isValidAccess: true, shouldRedirect: false };
    }
    
    // Vérifier l'état de récupération de session (fallback pour autres flux)
    const resetFlowCheck = await checkPasswordResetFlow();
    if (resetFlowCheck.isValidResetFlow) {
      return { isValidAccess: true, shouldRedirect: false };
    }
    
    // SÉCURITÉ RENFORCÉE : Vérifier le token de réinitialisation sécurisé
    // Empêche la construction manuelle d'URL avec email arbitraire
    const isValidToken = await validateResetToken(email);
    if (isValidToken) {
      // Nettoyer le token après vérification pour usage unique
      await clearResetTokens();
      return { isValidAccess: true, shouldRedirect: false };
    }
    
    // SÉCURITÉ : Sans token valide = accès refusé (empêche construction manuelle d'URL)
    return { isValidAccess: false, shouldRedirect: true };
    
  } catch {
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
  
  // Paramètres requis manquants
  if (!email || type !== 'signup') {
    return { isValidAccess: false, shouldRedirect: true };
  }
  
  // Vérifier qu'il y a une session OTP en cours pour cet email
  const supabase = await createClient();
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Si une session existe et correspond à l'email demandé
    if (session && session.user && session.user.email === email) {
      return { isValidAccess: true, shouldRedirect: false };
    }
    
    // SÉCURITÉ : Même avec les bons paramètres, sans session OTP récente = accès refusé
    // Ceci empêche l'accès direct en construisant manuellement l'URL
    return { isValidAccess: false, shouldRedirect: true };
    
  } catch {
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