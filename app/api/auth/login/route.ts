import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/auth/login - Se connecter et établir une session avec cookies
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Se connecter avec Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Erreur de connexion:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // La session est automatiquement stockée dans les cookies par createClient()
    return NextResponse.json({
      message: 'Connexion réussie',
      user: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at
      },
      session: {
        access_token: data.session.access_token,
        expires_at: data.session.expires_at,
        token_type: data.session.token_type
      }
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}