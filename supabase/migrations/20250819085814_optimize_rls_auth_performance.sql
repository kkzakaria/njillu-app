-- Migration: optimize_rls_auth_performance
-- Description: Optimise les performances des politiques RLS en remplaçant auth.uid() par (SELECT auth.uid())
-- Date: 2025-08-19
-- Type: OPTIMISATION PERFORMANCE

-- ============================================================================
-- PROBLÈME RÉSOLU:
-- Auth RLS Initialization Plan - Détecté par Supabase Performance Advisor
-- Les appels auth.uid() sont réévalués pour chaque ligne, ce qui dégrade les performances
-- Solution: Utiliser (SELECT auth.uid()) pour une évaluation unique par requête
-- ============================================================================

-- Supprimer les politiques existantes qui ont des problèmes de performance
DROP POLICY IF EXISTS "clients_insert_policy" ON public.clients;
DROP POLICY IF EXISTS "clients_update_policy" ON public.clients;

-- ============================================================================
-- Recréer les politiques avec optimisation auth.uid()
-- ============================================================================

-- Politique de création optimisée: Évaluation unique de auth.uid()
CREATE POLICY "clients_insert_policy" ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    deleted_at IS NULL
    AND created_by = (SELECT auth.uid())
  );

-- Politique de mise à jour optimisée: Évaluation unique de auth.uid()
CREATE POLICY "clients_update_policy" ON public.clients
  FOR UPDATE
  TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      created_by = (SELECT auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = (SELECT auth.uid())
        AND u.role IN ('admin', 'super_admin')
      )
    )
  )
  WITH CHECK (
    deleted_at IS NULL
    AND (
      created_by = (SELECT auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = (SELECT auth.uid())
        AND u.role IN ('admin', 'super_admin')
      )
    )
  );

-- ============================================================================
-- Optimiser les fonctions de sécurité avec SELECT auth.uid()
-- ============================================================================

-- Mettre à jour la fonction can_modify_client avec optimisation
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

-- Mettre à jour la fonction can_delete_client avec optimisation
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

-- Mettre à jour la fonction get_accessible_clients avec optimisation
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
-- Optimiser les triggers avec SELECT auth.uid()
-- ============================================================================

-- Mettre à jour le trigger d'insertion avec optimisation
CREATE OR REPLACE FUNCTION validate_client_insert_security()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier que l'utilisateur existe (évaluation unique)
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = (SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'Utilisateur non autorisé ou inactif';
  END IF;
  
  -- Forcer created_by à l'utilisateur actuel (évaluation unique)
  NEW.created_by := (SELECT auth.uid());
  
  -- S'assurer que deleted_at et deleted_by sont NULL à la création
  NEW.deleted_at := NULL;
  NEW.deleted_by := NULL;
  
  RETURN NEW;
END;
$$;

-- Mettre à jour le trigger de mise à jour avec optimisation
CREATE OR REPLACE FUNCTION validate_client_update_security()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
  current_user_id uuid;
BEGIN
  -- Obtenir l'utilisateur actuel une seule fois
  current_user_id := (SELECT auth.uid());
  
  -- Obtenir le rôle de l'utilisateur
  SELECT u.role INTO user_role
  FROM public.users u 
  WHERE u.id = current_user_id;
  
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
    NEW.deleted_by := current_user_id;
    
  -- Si c'est une modification normale
  ELSIF NEW.deleted_at IS NULL THEN
    -- Vérifier les droits de modification
    IF OLD.created_by != current_user_id AND user_role NOT IN ('admin', 'super_admin') THEN
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
-- Commentaires de documentation
-- ============================================================================

COMMENT ON POLICY "clients_insert_policy" ON public.clients IS 
'Politique d''insertion optimisée - Utilise (SELECT auth.uid()) pour éviter les réévaluations par ligne';

COMMENT ON POLICY "clients_update_policy" ON public.clients IS 
'Politique de mise à jour optimisée - Utilise (SELECT auth.uid()) pour éviter les réévaluations par ligne';

COMMENT ON FUNCTION can_modify_client(uuid, uuid) IS 
'Fonction optimisée avec (SELECT auth.uid()) par défaut pour éviter les réévaluations';

COMMENT ON FUNCTION can_delete_client(uuid, uuid) IS 
'Fonction optimisée avec (SELECT auth.uid()) par défaut pour éviter les réévaluations';

COMMENT ON FUNCTION get_accessible_clients(uuid, boolean) IS 
'Fonction optimisée avec (SELECT auth.uid()) par défaut pour éviter les réévaluations';

COMMENT ON FUNCTION validate_client_insert_security() IS 
'Trigger optimisé - Évalue auth.uid() une seule fois et stocke le résultat';

COMMENT ON FUNCTION validate_client_update_security() IS 
'Trigger optimisé - Évalue auth.uid() une seule fois et stocke le résultat dans une variable';

-- ============================================================================
-- Fin de la migration d'optimisation RLS Auth Performance
-- ============================================================================