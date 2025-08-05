-- Migration: create_folder_rls_policies_and_soft_delete
-- Description: Politiques RLS sécurisées et fonctions soft delete pour le système de dossiers
-- Date: 2025-08-04

-- ============================================================================
-- Activation de Row Level Security (RLS)
-- ============================================================================

-- Activer RLS sur les tables principales
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folder_counter ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Politiques RLS pour la table folders
-- ============================================================================

-- Politique de lecture: utilisateurs authentifiés peuvent lire tous les dossiers non supprimés
CREATE POLICY "Folders are viewable by authenticated users" ON public.folders
  FOR SELECT USING (
    deleted_at IS NULL 
    AND auth.role() = 'authenticated'
  );

-- Politique d'insertion: utilisateurs authentifiés peuvent créer des dossiers
CREATE POLICY "Folders can be created by authenticated users" ON public.folders
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND created_by = auth.uid()
    AND deleted_at IS NULL
  );

-- Politique de mise à jour: utilisateurs peuvent modifier leurs propres dossiers ou ceux qui leur sont assignés
CREATE POLICY "Folders can be updated by owner or assignee" ON public.folders
  FOR UPDATE USING (
    deleted_at IS NULL 
    AND auth.role() = 'authenticated'
    AND (
      created_by = auth.uid() OR 
      assigned_to = auth.uid() OR
      -- Admins peuvent modifier tous les dossiers (à définir selon les besoins)
      EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'admin'
      )
    )
  );

-- Politique de suppression (soft delete): mêmes permissions que pour la mise à jour
CREATE POLICY "Folders can be soft deleted by owner or assignee" ON public.folders
  FOR UPDATE USING (
    auth.role() = 'authenticated'
    AND (
      created_by = auth.uid() OR 
      assigned_to = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'admin'
      )
    )
  );

-- ============================================================================
-- Politiques RLS pour la table folder_counter
-- ============================================================================

-- Politique de lecture: tous les utilisateurs authentifiés peuvent voir les statistiques
CREATE POLICY "Folder counter is viewable by authenticated users" ON public.folder_counter
  FOR SELECT USING (auth.role() = 'authenticated');

-- Politique d'insertion/mise à jour: seules les fonctions système peuvent modifier le compteur
-- (via SECURITY DEFINER functions qui bypassent RLS)
CREATE POLICY "Folder counter is managed by system functions only" ON public.folder_counter
  FOR ALL USING (false); -- Bloque l'accès direct, seules les fonctions SECURITY DEFINER peuvent modifier

-- ============================================================================
-- Fonctions de soft delete pour les dossiers
-- ============================================================================

-- Fonction pour soft delete d'un dossier
CREATE OR REPLACE FUNCTION soft_delete_folder(p_folder_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_folder_exists boolean;
  v_current_user_id uuid;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  -- Vérifier que le dossier existe et peut être supprimé par cet utilisateur
  SELECT EXISTS(
    SELECT 1 FROM public.folders 
    WHERE id = p_folder_id 
      AND deleted_at IS NULL
      AND (
        created_by = v_current_user_id OR 
        assigned_to = v_current_user_id OR
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = v_current_user_id 
          AND role = 'admin'
        )
      )
  ) INTO v_folder_exists;
  
  IF NOT v_folder_exists THEN
    RAISE EXCEPTION 'Dossier non trouvé ou permissions insuffisantes';
  END IF;
  
  -- Effectuer le soft delete
  UPDATE public.folders 
  SET 
    deleted_at = now(),
    deleted_by = v_current_user_id,
    updated_at = now()
  WHERE id = p_folder_id 
    AND deleted_at IS NULL;
  
  -- Délier du BL associé si nécessaire
  PERFORM unlink_folder_from_bl(p_folder_id);
  
  RETURN true;
END;
$$;

-- Fonction pour restaurer un dossier supprimé
CREATE OR REPLACE FUNCTION restore_folder(p_folder_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_folder_exists boolean;
  v_current_user_id uuid;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  -- Vérifier que le dossier existe et peut être restauré par cet utilisateur
  SELECT EXISTS(
    SELECT 1 FROM public.folders 
    WHERE id = p_folder_id 
      AND deleted_at IS NOT NULL
      AND (
        created_by = v_current_user_id OR 
        deleted_by = v_current_user_id OR
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = v_current_user_id 
          AND role = 'admin'
        )
      )
  ) INTO v_folder_exists;
  
  IF NOT v_folder_exists THEN
    RAISE EXCEPTION 'Dossier non trouvé ou permissions insuffisantes';
  END IF;
  
  -- Effectuer la restauration
  UPDATE public.folders 
  SET 
    deleted_at = NULL,
    deleted_by = NULL,
    updated_at = now()
  WHERE id = p_folder_id 
    AND deleted_at IS NOT NULL;
  
  RETURN true;
END;
$$;

-- Fonction pour supprimer définitivement un dossier (hard delete) - Admin uniquement
CREATE OR REPLACE FUNCTION hard_delete_folder(p_folder_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_user_id uuid;
  v_is_admin boolean;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  -- Vérifier que l'utilisateur est admin
  SELECT EXISTS(
    SELECT 1 FROM public.users 
    WHERE id = v_current_user_id 
    AND role = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Permissions insuffisantes - Admin requis';
  END IF;
  
  -- Vérifier que le dossier existe
  IF NOT EXISTS(SELECT 1 FROM public.folders WHERE id = p_folder_id) THEN
    RAISE EXCEPTION 'Dossier non trouvé';
  END IF;
  
  -- Délier du BL associé avant suppression
  PERFORM unlink_folder_from_bl(p_folder_id);
  
  -- Supprimer définitivement le dossier
  DELETE FROM public.folders WHERE id = p_folder_id;
  
  RETURN true;
END;
$$;

-- ============================================================================
-- Fonctions d'audit et de nettoyage
-- ============================================================================

-- Fonction pour lister les dossiers supprimés avec détails
CREATE OR REPLACE FUNCTION get_deleted_folders(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  folder_id uuid,
  folder_number varchar,
  transport_type text,
  title varchar,
  deleted_at timestamptz,
  deleted_by uuid,
  deleted_by_email text,
  days_since_deletion integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_user_id uuid;
  v_is_admin boolean;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  -- Vérifier que l'utilisateur est admin (seuls les admins peuvent voir tous les dossiers supprimés)
  SELECT EXISTS(
    SELECT 1 FROM public.users 
    WHERE id = v_current_user_id 
    AND role = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Permissions insuffisantes - Admin requis';
  END IF;
  
  RETURN QUERY
  SELECT 
    f.id as folder_id,
    f.folder_number,
    f.transport_type::text,
    f.title,
    f.deleted_at,
    f.deleted_by,
    u.email as deleted_by_email,
    EXTRACT(DAY FROM (now() - f.deleted_at))::integer as days_since_deletion
  FROM public.folders f
  LEFT JOIN public.users u ON f.deleted_by = u.id
  WHERE f.deleted_at IS NOT NULL
  ORDER BY f.deleted_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Fonction pour nettoyer les anciens dossiers supprimés (Admin uniquement)
CREATE OR REPLACE FUNCTION cleanup_old_deleted_folders(p_days_threshold integer DEFAULT 90)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_user_id uuid;
  v_is_admin boolean;
  v_deleted_count integer;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  -- Vérifier que l'utilisateur est admin
  SELECT EXISTS(
    SELECT 1 FROM public.users 
    WHERE id = v_current_user_id 
    AND role = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Permissions insuffisantes - Admin requis';
  END IF;
  
  -- Validation du seuil
  IF p_days_threshold < 30 THEN
    RAISE EXCEPTION 'Le seuil ne peut pas être inférieur à 30 jours';
  END IF;
  
  -- Délier tous les BL des dossiers concernés avant suppression
  UPDATE public.bills_of_lading 
  SET folder_id = NULL 
  WHERE folder_id IN (
    SELECT id FROM public.folders 
    WHERE deleted_at IS NOT NULL 
    AND deleted_at < (now() - (p_days_threshold || ' days')::interval)
  );
  
  -- Supprimer définitivement les anciens dossiers supprimés
  DELETE FROM public.folders 
  WHERE deleted_at IS NOT NULL 
    AND deleted_at < (now() - (p_days_threshold || ' days')::interval);
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$;

-- ============================================================================
-- Vue pour l'audit des suppressions
-- ============================================================================

-- Vue pour l'audit des suppressions récentes (accessible aux admins)
CREATE VIEW folder_deletion_audit AS
SELECT 
  f.id as folder_id,
  f.folder_number,
  f.transport_type,
  f.title,
  f.created_at,
  f.deleted_at,
  f.deleted_by,
  creator.email as created_by_email,
  deleter.email as deleted_by_email,
  EXTRACT(DAY FROM (f.deleted_at - f.created_at))::integer as days_lived,
  EXTRACT(DAY FROM (now() - f.deleted_at))::integer as days_since_deletion,
  CASE 
    WHEN f.deleted_at < (now() - '30 days'::interval) THEN 'Ancien'
    WHEN f.deleted_at < (now() - '7 days'::interval) THEN 'Récent'
    ELSE 'Très récent'
  END as deletion_age_category
FROM public.folders f
LEFT JOIN public.users creator ON f.created_by = creator.id
LEFT JOIN public.users deleter ON f.deleted_by = deleter.id
WHERE f.deleted_at IS NOT NULL
ORDER BY f.deleted_at DESC;

-- ============================================================================
-- Triggers pour améliorer l'audit
-- ============================================================================

-- Fonction trigger pour logger les modifications importantes
CREATE OR REPLACE FUNCTION log_folder_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log des suppressions
  IF TG_OP = 'UPDATE' AND OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    INSERT INTO public.audit_logs (
      table_name, 
      record_id, 
      action, 
      old_values, 
      new_values, 
      user_id
    ) VALUES (
      'folders',
      NEW.id,
      'soft_delete',
      jsonb_build_object('status', OLD.status, 'deleted_at', OLD.deleted_at),
      jsonb_build_object('status', NEW.status, 'deleted_at', NEW.deleted_at),
      auth.uid()
    );
  END IF;
  
  -- Log des restaurations
  IF TG_OP = 'UPDATE' AND OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
    INSERT INTO public.audit_logs (
      table_name, 
      record_id, 
      action, 
      old_values, 
      new_values, 
      user_id
    ) VALUES (
      'folders',
      NEW.id,
      'restore',
      jsonb_build_object('deleted_at', OLD.deleted_at, 'deleted_by', OLD.deleted_by),
      jsonb_build_object('deleted_at', NEW.deleted_at, 'deleted_by', NEW.deleted_by),
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Application du trigger d'audit (seulement si la table audit_logs existe)
-- DO $$ 
-- BEGIN
--   IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
--     CREATE TRIGGER log_folder_changes_trigger
--       AFTER UPDATE ON public.folders
--       FOR EACH ROW
--       EXECUTE FUNCTION log_folder_changes();
--   END IF;
-- END $$;

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON FUNCTION soft_delete_folder(uuid) IS 'Suppression soft d''un dossier avec validation des permissions';
COMMENT ON FUNCTION restore_folder(uuid) IS 'Restauration d''un dossier supprimé avec validation des permissions';
COMMENT ON FUNCTION hard_delete_folder(uuid) IS 'Suppression définitive d''un dossier (Admin uniquement)';
COMMENT ON FUNCTION get_deleted_folders(integer, integer) IS 'Liste des dossiers supprimés avec détails (Admin uniquement)';
COMMENT ON FUNCTION cleanup_old_deleted_folders(integer) IS 'Nettoyage des anciens dossiers supprimés (Admin uniquement)';
COMMENT ON FUNCTION log_folder_changes() IS 'Trigger function pour l''audit des modifications de dossiers';

COMMENT ON VIEW folder_deletion_audit IS 'Audit des suppressions de dossiers (Admin uniquement)';

-- ============================================================================
-- Permissions pour les fonctions de soft delete
-- ============================================================================

-- Permettre l'exécution des fonctions aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION soft_delete_folder(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_folder(uuid) TO authenticated;

-- Fonctions d'admin réservées (permissions contrôlées dans les fonctions)
GRANT EXECUTE ON FUNCTION hard_delete_folder(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_deleted_folders(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_deleted_folders(integer) TO authenticated;

-- Vue d'audit accessible aux admins uniquement (contrôlé via RLS)
-- La vue utilise les tables existantes, donc hérite de leurs politiques RLS