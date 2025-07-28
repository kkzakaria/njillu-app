import { createClient } from "@/lib/supabase/server";
import { createHash } from "crypto";

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
  const otpToken = searchParams.get('otpToken'); // Token de validation
  
  // Debug: Loggons les paramètres reçus
  console.log('🔍 checkOtpResetAccess - SearchParams:', Object.fromEntries(searchParams));
  console.log('📧 Email parameter:', email);
  console.log('🔑 OTP Token parameter:', otpToken);
  
  // Si l'email est présent, vérifier la légitimité
  if (email) {
    // Si un token OTP est présent, vérifier sa validité
    if (otpToken) {
      const isValidToken = await validateOtpToken(email, otpToken);
      if (isValidToken) {
        console.log('✅ Accès OTP autorisé avec token valide pour:', email);
        return { isValidAccess: true, shouldRedirect: false };
      } else {
        console.log('❌ Accès OTP refusé - Token invalide pour:', email);
        return { isValidAccess: false, shouldRedirect: true };
      }
    }
    
    // Sans token, on ne peut pas vérifier la légitimité côté serveur
    // Pour des raisons de sécurité, on bloque l'accès direct
    // L'utilisateur doit passer par forgot-password qui génèrera le token
    console.log('⚠️ Accès OTP refusé - Pas de token de validation pour:', email);
    return { isValidAccess: false, shouldRedirect: true };
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
 * Génère un token de validation OTP basé sur l'email et un timestamp
 * Utilisé pour sécuriser l'accès à la page OTP
 */
export function generateOtpToken(email: string): string {
  const timestamp = Date.now();
  const secret = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || 'fallback-secret';
  
  // Créer un hash basé sur email + timestamp + secret
  const data = `${email}:${timestamp}:${secret}`;
  const hash = createHash('sha256').update(data).digest('hex');
  
  // Retourner timestamp + hash (pour vérification ultérieure)
  return `${timestamp}.${hash}`;
}

/**
 * Valide un token de validation OTP
 * Vérifie que le token correspond à l'email et n'est pas expiré
 */
export async function validateOtpToken(email: string, token: string): Promise<boolean> {
  try {
    const [timestampStr, receivedHash] = token.split('.');
    if (!timestampStr || !receivedHash) {
      return false;
    }
    
    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    
    // Token expire après 10 minutes (600000ms)
    if (now - timestamp > 600000) {
      console.log('🕐 Token OTP expiré:', { timestamp, now, diff: now - timestamp });
      return false;
    }
    
    // Recalculer le hash avec les mêmes paramètres
    const secret = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || 'fallback-secret';
    const data = `${email}:${timestamp}:${secret}`;
    const expectedHash = createHash('sha256').update(data).digest('hex');
    
    // Vérifier que les hash correspondent
    const isValid = expectedHash === receivedHash;
    console.log('🔍 Validation token OTP:', { email, isValid, timestamp: new Date(timestamp) });
    
    return isValid;
  } catch (error) {
    console.log('❌ Erreur validation token OTP:', error);
    return false;
  }
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