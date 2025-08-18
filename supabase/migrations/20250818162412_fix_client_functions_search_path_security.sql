-- Migration: fix_client_functions_search_path_security
-- Description: Correction des avertissements de sécurité Supabase pour les fonctions clients
-- Date: 2025-08-18
-- Type: CORRECTION DE SÉCURITÉ

-- ============================================================================
-- Objectif: Corriger les 9 avertissements "Function Search Path Mutable"
-- reportés par le Security Advisor de Supabase
-- ============================================================================

-- Toutes les fonctions SECURITY DEFINER doivent avoir SET search_path = '' (chaîne vide)
-- pour éviter les vulnérabilités de sécurité liées à la manipulation du search_path
-- NOTE: Supabase Advisor exige spécifiquement une chaîne vide, pas 'public'

-- ============================================================================
-- 1. can_modify_client - Correction search_path
-- ============================================================================

CREATE OR REPLACE FUNCTION can_modify_client(
  client_id uuid,
  user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clients c
    JOIN public.users u ON u.id = user_id
    WHERE c.id = client_id
    AND c.deleted_at IS NULL
    AND (
      -- Le créateur peut toujours modifier
      c.created_by = user_id
      OR
      -- Les admins/super_admins peuvent modifier
      u.role IN ('admin', 'super_admin')
    )
  );
$$;

-- ============================================================================
-- 2. can_delete_client - Correction search_path
-- ============================================================================

CREATE OR REPLACE FUNCTION can_delete_client(
  client_id uuid,
  user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clients c
    JOIN public.users u ON u.id = user_id
    WHERE c.id = client_id
    AND c.deleted_at IS NULL
    AND u.role IN ('admin', 'super_admin')
  );
$$;

-- ============================================================================
-- 3. get_accessible_clients - Correction search_path
-- ============================================================================

CREATE OR REPLACE FUNCTION get_accessible_clients(
  user_id uuid DEFAULT auth.uid(),
  include_inactive boolean DEFAULT false
)
RETURNS SETOF public.clients
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT c.* FROM public.clients c
  WHERE c.deleted_at IS NULL
    AND (
      include_inactive = true 
      OR c.status = 'active'
    )
    AND EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = user_id 
      )
  ORDER BY c.created_at DESC;
$$;

-- ============================================================================
-- 4. validate_client_insert_security - Correction search_path
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_client_insert_security()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Vérifier que l'utilisateur existe
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Utilisateur non autorisé ou inactif';
  END IF;
  
  -- Forcer created_by à l'utilisateur actuel
  NEW.created_by := auth.uid();
  
  -- S'assurer que deleted_at et deleted_by sont NULL à la création
  NEW.deleted_at := NULL;
  NEW.deleted_by := NULL;
  
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 5. validate_client_update_security - Correction search_path
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_client_update_security()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role text;
BEGIN
  -- Obtenir le rôle de l'utilisateur
  SELECT u.role INTO user_role
  FROM public.users u 
  WHERE u.id = auth.uid();
  
  -- Vérifier les permissions
  IF user_role IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non autorisé';
  END IF;
  
  -- Si c'est une suppression logique
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    -- Seuls les admins/super_admins peuvent supprimer
    IF user_role NOT IN ('admin', 'super_admin') THEN
      RAISE EXCEPTION 'Privilèges insuffisants pour supprimer un client';
    END IF;
    
    -- Forcer deleted_by à l'utilisateur actuel
    NEW.deleted_by := auth.uid();
    
  -- Si c'est une modification normale
  ELSIF NEW.deleted_at IS NULL THEN
    -- Vérifier les droits de modification
    IF OLD.created_by != auth.uid() AND user_role NOT IN ('admin', 'super_admin') THEN
      RAISE EXCEPTION 'Vous ne pouvez modifier que vos propres clients';
    END IF;
    
    -- Préserver les métadonnées de création
    NEW.created_by := OLD.created_by;
    NEW.created_at := OLD.created_at;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================================================
-- Commentaires pour traçabilité
-- ============================================================================

COMMENT ON FUNCTION can_modify_client(uuid, uuid) IS 'Vérifie si un utilisateur peut modifier un client (sécurisé avec search_path = '')';
COMMENT ON FUNCTION can_delete_client(uuid, uuid) IS 'Vérifie si un utilisateur peut supprimer un client (sécurisé avec search_path = '')';
COMMENT ON FUNCTION get_accessible_clients(uuid, boolean) IS 'Retourne les clients accessibles à un utilisateur (sécurisé avec search_path = '')';
COMMENT ON FUNCTION validate_client_insert_security() IS 'Validation de sécurité lors de l''insertion de clients (sécurisé avec search_path = '')';
COMMENT ON FUNCTION validate_client_update_security() IS 'Validation de sécurité lors de la mise à jour de clients (sécurisé avec search_path = '')';

-- ============================================================================
-- Cette migration corrige les avertissements de sécurité suivants:
-- ============================================================================
-- 1. Function Search Path Mutable: public.get_client_display_name
-- 2. Function Search Path Mutable: public.get_client_contact_name
-- 3. Function Search Path Mutable: public.validate_client_email_uniqueness
-- 4. Function Search Path Mutable: public.search_clients
-- 5. Function Search Path Mutable: public.validate_client_insert_security
-- 6. Function Search Path Mutable: public.can_modify_client
-- 7. Function Search Path Mutable: public.validate_client_update_security
-- 8. Function Search Path Mutable: public.can_delete_client
-- 9. Function Search Path Mutable: public.get_accessible_clients

-- ============================================================================
-- 6. get_client_display_name - Réassurance search_path (déjà dans create_clients_table.sql)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_client_display_name(client_row public.clients)
RETURNS varchar(255)
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT CASE client_row.client_type
    WHEN 'individual' THEN 
      coalesce(client_row.first_name, '') || 
      CASE WHEN client_row.first_name IS NOT NULL AND client_row.last_name IS NOT NULL THEN ' ' ELSE '' END ||
      coalesce(client_row.last_name, '')
    WHEN 'business' THEN 
      coalesce(client_row.company_name, '')
    ELSE 'Client inconnu'
  END;
$$;

-- ============================================================================
-- 7. get_client_contact_name - Réassurance search_path (déjà dans create_clients_table.sql)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_client_contact_name(client_row public.clients)
RETURNS varchar(255)
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT CASE client_row.client_type
    WHEN 'individual' THEN 
      coalesce(client_row.first_name, '') || 
      CASE WHEN client_row.first_name IS NOT NULL AND client_row.last_name IS NOT NULL THEN ' ' ELSE '' END ||
      coalesce(client_row.last_name, '')
    WHEN 'business' THEN 
      coalesce(client_row.contact_person_first_name, '') || 
      CASE WHEN client_row.contact_person_first_name IS NOT NULL AND client_row.contact_person_last_name IS NOT NULL THEN ' ' ELSE '' END ||
      coalesce(client_row.contact_person_last_name, '') ||
      CASE WHEN client_row.contact_person_title IS NOT NULL THEN ' (' || client_row.contact_person_title || ')' ELSE '' END
    ELSE 'Contact inconnu'
  END;
$$;

-- ============================================================================
-- 8. validate_client_email_uniqueness - Réassurance search_path (déjà dans create_clients_table.sql)
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_client_email_uniqueness(
  p_client_id uuid,
  p_email varchar(255)
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.clients 
    WHERE email = p_email 
    AND id != coalesce(p_client_id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND deleted_at IS NULL
  );
$$;

-- ============================================================================
-- 9. search_clients - Réassurance search_path (déjà dans create_clients_table.sql)
-- ============================================================================

CREATE OR REPLACE FUNCTION search_clients(
  search_term text,
  client_types client_type_enum[] DEFAULT NULL,
  limit_count integer DEFAULT 50
)
RETURNS SETOF public.clients
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT c.* FROM public.clients c
  WHERE c.deleted_at IS NULL
    AND (client_types IS NULL OR c.client_type = ANY(client_types))
    AND (
      -- Recherche dans les noms (particuliers)
      (c.client_type = 'individual' AND 
       to_tsvector('french', coalesce(c.first_name, '') || ' ' || coalesce(c.last_name, '')) 
       @@ plainto_tsquery('french', search_term))
      OR
      -- Recherche dans les sociétés (entreprises)
      (c.client_type = 'business' AND 
       to_tsvector('french', coalesce(c.company_name, '')) 
       @@ plainto_tsquery('french', search_term))
      OR
      -- Recherche dans l'email
      c.email ILIKE '%' || search_term || '%'
      OR
      -- Recherche dans le SIRET
      c.siret LIKE search_term || '%'
    )
  ORDER BY c.created_at DESC
  LIMIT limit_count;
$$;

-- ============================================================================
-- Commentaires pour traçabilité (fonctions réassurées)
-- ============================================================================

COMMENT ON FUNCTION get_client_display_name(public.clients) IS 'Retourne le nom d''affichage d''un client selon son type (sécurisé avec search_path = '')';
COMMENT ON FUNCTION get_client_contact_name(public.clients) IS 'Retourne le nom du contact principal d''un client (sécurisé avec search_path = '')';
COMMENT ON FUNCTION validate_client_email_uniqueness(uuid, varchar) IS 'Valide l''unicité de l''email pour un client (sécurisé avec search_path = '')';
COMMENT ON FUNCTION search_clients(text, client_type_enum[], integer) IS 'Recherche full-text dans les clients (sécurisé avec search_path = '')';

-- Statut: Corrige les 9 avertissements de sécurité identifiés
-- Actions supplémentaires: Appliquer la migration et vérifier la disparition des avertissements