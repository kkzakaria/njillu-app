-- Migration: create_basic_users_table
-- Description: Table utilisateurs basique liée à Supabase Auth
-- Date: 2025-01-27

-- ============================================================================
-- Table: users
-- Description: Profils utilisateurs basiques étendant Supabase Auth
-- ============================================================================

CREATE TABLE public.users (
  -- Clé primaire liée à Supabase Auth
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations de base
  email varchar(255) NOT NULL UNIQUE,
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL,
  phone varchar(50),
  avatar_url text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Contraintes
  CONSTRAINT users_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT users_phone_format 
    CHECK (phone IS NULL OR phone ~ '^[+]?[0-9-\s()]+$')
);

-- ============================================================================
-- Index pour optimiser les performances
-- ============================================================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);
CREATE INDEX idx_users_full_name ON public.users(first_name, last_name);

-- ============================================================================
-- Trigger pour mettre à jour updated_at automatiquement
-- ============================================================================

-- Réutiliser la fonction si elle existe déjà, sinon la créer
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON TABLE public.users IS 'Table des profils utilisateurs basiques étendant Supabase Auth';
COMMENT ON COLUMN public.users.id IS 'UUID de l''utilisateur provenant de auth.users';
COMMENT ON COLUMN public.users.email IS 'Email principal de l''utilisateur (doit correspondre à auth.users)';
COMMENT ON COLUMN public.users.phone IS 'Numéro de téléphone au format international';
COMMENT ON COLUMN public.users.avatar_url IS 'URL de l''image de profil de l''utilisateur';

-- ============================================================================
-- Permissions de base
-- ============================================================================

-- Permettre aux utilisateurs authentifiés de lire la table
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.users TO authenticated;