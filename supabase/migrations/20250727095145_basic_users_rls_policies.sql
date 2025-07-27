-- Migration: basic_users_rls_policies
-- Description: Politiques RLS basiques pour la table users
-- Date: 2025-01-27

-- ============================================================================
-- Activer RLS sur la table users
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Politiques RLS
-- ============================================================================

-- Policy: Les utilisateurs peuvent voir tous les profils publics
CREATE POLICY "users_select_all" ON public.users
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Les utilisateurs peuvent créer leur propre profil lors de l'inscription
CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Policy: Les utilisateurs peuvent modifier uniquement leur propre profil
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Personne ne peut supprimer un profil (géré par CASCADE depuis auth.users)
-- Pas de politique DELETE car la suppression se fait via Supabase Auth

-- ============================================================================
-- Fonction helper pour créer automatiquement un profil utilisateur
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'first_name', ''),
        COALESCE(new.raw_user_meta_data->>'last_name', '')
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil lors de l'inscription
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON POLICY "users_select_all" ON public.users IS 
    'Tous les utilisateurs authentifiés peuvent voir les profils';
COMMENT ON POLICY "users_insert_own" ON public.users IS 
    'Les utilisateurs peuvent créer uniquement leur propre profil';
COMMENT ON POLICY "users_update_own" ON public.users IS 
    'Les utilisateurs peuvent modifier uniquement leur propre profil';