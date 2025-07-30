'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from "@/lib/supabase/server";
import { createResetToken } from "./reset-token";

/**
 * Server Action pour gérer la demande de réinitialisation de mot de passe
 * Basée sur les patterns officiels Supabase + Next.js Server Actions
 */
export async function requestPasswordReset(email: string) {
  const supabase = await createClient();
  
  try {
    // Envoyer l'OTP via Supabase avec emailRedirectTo pour la callback
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false,
        // Supabase recommande d'utiliser emailRedirectTo même pour OTP
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : 'http://localhost:3000'}/auth/reset-password-otp`
      }
    });
    
    if (error) {
      console.error('Supabase OTP error:', error);
      return { error: error.message };
    }
    
    // Créer un token sécurisé pour protéger l'accès à la page OTP
    try {
      await createResetToken(email);
    } catch (tokenError) {
      console.error('Token creation error:', tokenError);
      return { error: 'Failed to create security token' };
    }
    
    // Revalider le cache comme recommandé par Supabase
    revalidatePath('/', 'layout');
    
    // Retourner le succès - redirection côté client comme dans la doc
    return { success: true, email };
    
  } catch (error) {
    console.error('Password reset error:', error);
    return { 
      error: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}