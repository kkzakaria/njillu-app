-- Migration: fix_functions_search_path
-- Description: Corriger le search_path mutable des fonctions pour la sécurité
-- Date: 2025-01-27

-- ============================================================================
-- Fix: Redéfinir les fonctions avec un search_path immutable
-- ============================================================================

-- Fonction update_updated_at_column avec search_path fixe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction handle_new_user avec search_path fixe
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public, auth
AS $$
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
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON FUNCTION update_updated_at_column() IS 
    'Met à jour automatiquement la colonne updated_at avec un search_path sécurisé';
    
COMMENT ON FUNCTION public.handle_new_user() IS 
    'Crée automatiquement un profil utilisateur lors de l inscription avec un search_path sécurisé';