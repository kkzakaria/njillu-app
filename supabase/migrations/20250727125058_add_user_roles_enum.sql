-- Migration: add_user_roles_enum
-- Description: Ajout de l'énumération des rôles utilisateurs et intégration à la table users
-- Date: 2025-01-27

-- ============================================================================
-- Créer l'énumération des rôles utilisateurs
-- ============================================================================

CREATE TYPE user_role AS ENUM (
  'super_admin',  -- Super administrateur - Accès complet système
  'admin',        -- Administrateur - Gestion des utilisateurs et configuration
  'user',         -- Utilisateur - Accès standard aux fonctionnalités
  'visitor'       -- Visiteur - Accès en lecture seule limité
);

-- ============================================================================
-- Ajouter la colonne role à la table users
-- ============================================================================

ALTER TABLE public.users 
ADD COLUMN role user_role DEFAULT 'user' NOT NULL;

-- ============================================================================
-- Créer une vue pour les informations des rôles
-- ============================================================================

CREATE VIEW user_roles_info AS
WITH role_data AS (
  SELECT unnest(enum_range(NULL::user_role)) as role_name
)
SELECT 
  role_name,
  CASE role_name
    WHEN 'super_admin' THEN 'Super Administrateur'
    WHEN 'admin' THEN 'Administrateur'
    WHEN 'user' THEN 'Utilisateur'
    WHEN 'visitor' THEN 'Visiteur'
  END as display_name,
  CASE role_name
    WHEN 'super_admin' THEN 'Accès complet au système avec tous les privilèges'
    WHEN 'admin' THEN 'Gestion des utilisateurs et configuration de l''application'
    WHEN 'user' THEN 'Accès standard aux fonctionnalités de l''application'
    WHEN 'visitor' THEN 'Accès en lecture seule avec permissions limitées'
  END as description,
  CASE role_name
    WHEN 'super_admin' THEN 0
    WHEN 'admin' THEN 1
    WHEN 'user' THEN 2
    WHEN 'visitor' THEN 3
  END as level
FROM role_data;

-- ============================================================================
-- Fonctions utilitaires pour les permissions
-- ============================================================================

-- Fonction pour obtenir le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS user_role
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role_result user_role;
BEGIN
    SELECT role INTO user_role_result
    FROM users
    WHERE id = user_id;
    
    RETURN COALESCE(user_role_result, 'visitor'::user_role);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier si un utilisateur est admin ou super_admin
CREATE OR REPLACE FUNCTION user_is_admin(user_id uuid)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN get_user_role(user_id) IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier si un utilisateur est super_admin
CREATE OR REPLACE FUNCTION user_is_super_admin(user_id uuid)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN get_user_role(user_id) = 'super_admin';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier si un utilisateur peut effectuer une action
CREATE OR REPLACE FUNCTION user_can_perform_action(user_id uuid, required_role user_role)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role_val user_role;
    user_level integer;
    required_level integer;
BEGIN
    -- Obtenir le rôle de l'utilisateur
    user_role_val := get_user_role(user_id);
    
    -- Convertir les rôles en niveaux (plus petit = plus de privilèges)
    user_level := CASE user_role_val
        WHEN 'super_admin' THEN 0
        WHEN 'admin' THEN 1
        WHEN 'user' THEN 2
        WHEN 'visitor' THEN 3
    END;
    
    required_level := CASE required_role
        WHEN 'super_admin' THEN 0
        WHEN 'admin' THEN 1
        WHEN 'user' THEN 2
        WHEN 'visitor' THEN 3
    END;
    
    -- L'utilisateur peut effectuer l'action si son niveau est <= au niveau requis
    RETURN user_level <= required_level;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Index pour améliorer les performances
-- ============================================================================

CREATE INDEX idx_users_role ON public.users(role);

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON TYPE user_role IS 'Énumération des rôles utilisateurs avec hiérarchie de permissions';
COMMENT ON COLUMN public.users.role IS 'Rôle de l''utilisateur définissant ses permissions dans l''application';
COMMENT ON VIEW user_roles_info IS 'Vue d''information sur les rôles disponibles avec descriptions et niveaux';

COMMENT ON FUNCTION get_user_role(uuid) IS 'Retourne le rôle d''un utilisateur donné';
COMMENT ON FUNCTION user_is_admin(uuid) IS 'Vérifie si un utilisateur a des privilèges d''administration';
COMMENT ON FUNCTION user_is_super_admin(uuid) IS 'Vérifie si un utilisateur est super administrateur';
COMMENT ON FUNCTION user_can_perform_action(uuid, user_role) IS 'Vérifie si un utilisateur peut effectuer une action nécessitant un rôle donné';