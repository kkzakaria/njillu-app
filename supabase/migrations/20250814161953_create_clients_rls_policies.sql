-- Migration: create_clients_rls_policies
-- Description: Politiques RLS pour la sécurité des données clients
-- Date: 2025-08-14
-- Type: NOUVELLE MIGRATION

-- ============================================================================
-- Activation de la sécurité au niveau des lignes (RLS)
-- ============================================================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Politiques RLS pour les clients
-- ============================================================================

-- Politique de lecture: Les utilisateurs authentifiés peuvent lire tous les clients actifs
CREATE POLICY "clients_select_policy" ON public.clients
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

-- Politique de création: Les utilisateurs authentifiés peuvent créer des clients
CREATE POLICY "clients_insert_policy" ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    deleted_at IS NULL
    AND created_by = auth.uid()
  );

-- Politique de mise à jour: Les utilisateurs peuvent modifier les clients qu'ils ont créés
-- ou s'ils ont le rôle admin/super_admin
CREATE POLICY "clients_update_policy" ON public.clients
  FOR UPDATE
  TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role IN ('admin', 'super_admin')
      )
    )
  )
  WITH CHECK (
    deleted_at IS NULL
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role IN ('admin', 'super_admin')
      )
    )
  );

-- Politique de suppression logique: Gérée par le trigger de sécurité
-- Les permissions de suppression sont validées dans validate_client_update_security()

-- ============================================================================
-- Politiques pour la vue active_clients_with_display_names
-- ============================================================================

-- La vue hérite automatiquement des politiques de la table sous-jacente
-- Mais on peut ajouter une politique spécifique si nécessaire

-- ============================================================================
-- Fonctions de sécurité pour les politiques RLS
-- ============================================================================

-- Fonction pour vérifier si un utilisateur peut modifier un client
CREATE OR REPLACE FUNCTION can_modify_client(
  client_id uuid,
  user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
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

-- Fonction pour vérifier si un utilisateur peut supprimer un client
CREATE OR REPLACE FUNCTION can_delete_client(
  client_id uuid,
  user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clients c
    JOIN public.users u ON u.id = user_id
    WHERE c.id = client_id
    AND c.deleted_at IS NULL
    AND u.role IN ('admin', 'super_admin')
  );
$$;

-- Fonction pour obtenir les clients accessibles à un utilisateur
CREATE OR REPLACE FUNCTION get_accessible_clients(
  user_id uuid DEFAULT auth.uid(),
  include_inactive boolean DEFAULT false
)
RETURNS SETOF public.clients
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
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
-- Optimisations de performance pour RLS
-- ============================================================================

-- Index pour optimiser les politiques RLS (utilisateur créateur)
CREATE INDEX idx_clients_created_by_rls ON public.clients(created_by) 
  WHERE deleted_at IS NULL;

-- Index pour optimiser les vérifications de rôle
CREATE INDEX IF NOT EXISTS idx_users_role_active ON public.users(role);

-- ============================================================================
-- Politiques d'audit pour la traçabilité
-- ============================================================================

-- Politique pour permettre aux admins de voir les clients supprimés (audit)
CREATE POLICY "clients_audit_policy" ON public.clients
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
      )
  );

-- ============================================================================
-- Triggers de sécurité pour validation supplémentaire
-- ============================================================================

-- Trigger pour validation de sécurité lors de l'insertion
CREATE OR REPLACE FUNCTION validate_client_insert_security()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Trigger pour validation de sécurité lors de la mise à jour
CREATE OR REPLACE FUNCTION validate_client_update_security()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Appliquer les triggers
CREATE TRIGGER validate_client_insert_security_trigger
  BEFORE INSERT ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION validate_client_insert_security();

CREATE TRIGGER validate_client_update_security_trigger
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION validate_client_update_security();

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON POLICY "clients_select_policy" ON public.clients IS 'Permet aux utilisateurs authentifiés de lire les clients actifs';
COMMENT ON POLICY "clients_insert_policy" ON public.clients IS 'Permet aux utilisateurs authentifiés de créer des clients';
COMMENT ON POLICY "clients_update_policy" ON public.clients IS 'Permet la modification par le créateur ou les admins/super_admins';
COMMENT ON POLICY "clients_audit_policy" ON public.clients IS 'Permet aux admins de voir les clients supprimés pour audit';

COMMENT ON FUNCTION can_modify_client(uuid, uuid) IS 'Vérifie si un utilisateur peut modifier un client';
COMMENT ON FUNCTION can_delete_client(uuid, uuid) IS 'Vérifie si un utilisateur peut supprimer un client';
COMMENT ON FUNCTION get_accessible_clients(uuid, boolean) IS 'Retourne les clients accessibles à un utilisateur';
COMMENT ON FUNCTION validate_client_insert_security() IS 'Validation de sécurité lors de l''insertion de clients';
COMMENT ON FUNCTION validate_client_update_security() IS 'Validation de sécurité lors de la mise à jour de clients';

-- ============================================================================
-- Permissions pour les nouvelles fonctions
-- ============================================================================

GRANT EXECUTE ON FUNCTION can_modify_client(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION can_delete_client(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_accessible_clients(uuid, boolean) TO authenticated;