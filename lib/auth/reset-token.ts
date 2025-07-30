import { cookies } from 'next/headers';
import { createHash } from 'crypto';

/**
 * Génère et stocke un token de réinitialisation sécurisé
 * Utilisé pour protéger l'accès à la page OTP contre les URLs construites manuellement
 */
export async function createResetToken(email: string): Promise<string> {
  // Générer un token basé sur l'email et timestamp
  const timestamp = Date.now().toString();
  const data = `${email}:${timestamp}`;
  const token = createHash('sha256').update(data + process.env.NEXTAUTH_SECRET || 'fallback').digest('hex');
  
  // Stocker dans un cookie sécurisé (10 minutes d'expiration)
  const cookieStore = await cookies();
  cookieStore.set('reset-token', token, {
    httpOnly: true,      // Pas accessible côté client
    secure: process.env.NODE_ENV === 'production', // HTTPS uniquement en prod
    sameSite: 'strict',  // Protection CSRF
    maxAge: 10 * 60,     // 10 minutes
    path: '/auth'        // Limité aux pages d'auth
  });
  
  // Stocker aussi l'email associé (pour validation)
  cookieStore.set('reset-email', email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 10 * 60,
    path: '/auth'
  });
  
  return token;
}

/**
 * Vérifie si un token de réinitialisation est valide pour un email donné
 */
export async function validateResetToken(email: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const storedToken = cookieStore.get('reset-token')?.value;
    const storedEmail = cookieStore.get('reset-email')?.value;
    
    // Vérifications de base
    if (!storedToken || !storedEmail || storedEmail !== email) {
      return false;
    }
    
    // Le token existe et l'email correspond
    return true;
  } catch {
    return false;
  }
}

/**
 * Nettoie les tokens de réinitialisation après usage
 */
export async function clearResetTokens(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('reset-token');
    cookieStore.delete('reset-email');
  } catch {
    // Ignore les erreurs de nettoyage
  }
}