-- Migration: create_folder_bl_relationship_and_indexes
-- Description: Relation bidirectionnelle 1:1 entre folders et bills_of_lading avec indexes optimisés
-- Date: 2025-08-04

-- ============================================================================
-- Ajout de la relation bidirectionnelle 1:1 entre folders et BL
-- ============================================================================

-- Ajout de la clé étrangère vers bills_of_lading dans la table folders
ALTER TABLE public.folders 
ADD COLUMN bl_id uuid REFERENCES public.bills_of_lading(id);

-- Ajout de la clé étrangère vers folders dans la table bills_of_lading
ALTER TABLE public.bills_of_lading 
ADD COLUMN folder_id uuid REFERENCES public.folders(id);

-- ============================================================================
-- Contraintes pour assurer la relation 1:1 bidirectionnelle
-- ============================================================================

-- Contrainte unique sur bl_id dans folders (un BL ne peut être lié qu'à un seul dossier)
ALTER TABLE public.folders 
ADD CONSTRAINT folders_bl_id_unique UNIQUE (bl_id);

-- Contrainte unique sur folder_id dans bills_of_lading (un dossier ne peut être lié qu'à un seul BL)
ALTER TABLE public.bills_of_lading 
ADD CONSTRAINT bills_of_lading_folder_id_unique UNIQUE (folder_id);

-- ============================================================================
-- Contraintes de cohérence pour la relation bidirectionnelle
-- ============================================================================

-- Fonction pour valider la cohérence de la relation bidirectionnelle
CREATE OR REPLACE FUNCTION validate_folder_bl_relationship()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Pour les folders: si bl_id est défini, vérifier que le BL référence bien ce folder
  IF TG_TABLE_NAME = 'folders' THEN
    IF NEW.bl_id IS NOT NULL THEN
      -- Vérifier que le BL existe et qu'il référence bien ce folder
      IF NOT EXISTS (
        SELECT 1 FROM public.bills_of_lading 
        WHERE id = NEW.bl_id 
        AND (folder_id IS NULL OR folder_id = NEW.id)
      ) THEN
        RAISE EXCEPTION 'Le BL % n''existe pas ou référence déjà un autre dossier', NEW.bl_id;
      END IF;
      
      -- Mise à jour automatique de la relation inverse si nécessaire
      UPDATE public.bills_of_lading 
      SET folder_id = NEW.id 
      WHERE id = NEW.bl_id AND folder_id IS NULL;
    END IF;
  END IF;
  
  -- Pour les bills_of_lading: si folder_id est défini, vérifier que le folder référence bien ce BL
  IF TG_TABLE_NAME = 'bills_of_lading' THEN
    IF NEW.folder_id IS NOT NULL THEN
      -- Vérifier que le folder existe et qu'il référence bien ce BL
      IF NOT EXISTS (
        SELECT 1 FROM public.folders 
        WHERE id = NEW.folder_id 
        AND (bl_id IS NULL OR bl_id = NEW.id)
      ) THEN
        RAISE EXCEPTION 'Le dossier % n''existe pas ou référence déjà un autre BL', NEW.folder_id;
      END IF;
      
      -- Mise à jour automatique de la relation inverse si nécessaire
      UPDATE public.folders 
      SET bl_id = NEW.id 
      WHERE id = NEW.folder_id AND bl_id IS NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Application des triggers de validation
CREATE TRIGGER validate_folder_bl_relationship_folders
  AFTER INSERT OR UPDATE OF bl_id ON public.folders
  FOR EACH ROW
  EXECUTE FUNCTION validate_folder_bl_relationship();

CREATE TRIGGER validate_folder_bl_relationship_bl
  AFTER INSERT OR UPDATE OF folder_id ON public.bills_of_lading
  FOR EACH ROW
  EXECUTE FUNCTION validate_folder_bl_relationship();

-- ============================================================================
-- Index optimisés pour les performances
-- ============================================================================

-- Index pour la relation folders -> BL (recherches fréquentes)
CREATE INDEX idx_folders_bl_id ON public.folders(bl_id) WHERE bl_id IS NOT NULL;

-- Index pour la relation BL -> folders (recherches fréquentes)
CREATE INDEX idx_bills_of_lading_folder_id ON public.bills_of_lading(folder_id) WHERE folder_id IS NOT NULL;

-- Index composite pour les requêtes croisant folders et BL
CREATE INDEX idx_folders_bl_status ON public.folders(bl_id, status) WHERE bl_id IS NOT NULL AND deleted_at IS NULL;

-- Index pour identifier les dossiers sans BL associé
CREATE INDEX idx_folders_without_bl ON public.folders(id) WHERE bl_id IS NULL AND deleted_at IS NULL;

-- Index pour identifier les BL sans dossier associé
CREATE INDEX idx_bl_without_folder ON public.bills_of_lading(id) WHERE folder_id IS NULL AND deleted_at IS NULL;

-- Index composite pour les recherches par type de transport et BL
CREATE INDEX idx_folders_transport_bl ON public.folders(transport_type, bl_id) WHERE deleted_at IS NULL;

-- Index pour les tableaux de bord avec relation BL
CREATE INDEX idx_folders_created_by_bl ON public.folders(created_by, bl_id, created_at DESC) WHERE deleted_at IS NULL;

-- ============================================================================
-- Fonctions utilitaires pour la gestion des relations
-- ============================================================================

-- Fonction pour lier un dossier à un BL
CREATE OR REPLACE FUNCTION link_folder_to_bl(
  p_folder_id uuid,
  p_bl_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_folder_exists boolean;
  v_bl_exists boolean;
BEGIN
  -- Validation des paramètres
  IF p_folder_id IS NULL OR p_bl_id IS NULL THEN
    RAISE EXCEPTION 'Les identifiants du dossier et du BL ne peuvent pas être NULL';
  END IF;
  
  -- Vérifier l'existence du dossier
  SELECT EXISTS(SELECT 1 FROM public.folders WHERE id = p_folder_id AND deleted_at IS NULL)
  INTO v_folder_exists;
  
  IF NOT v_folder_exists THEN
    RAISE EXCEPTION 'Le dossier % n''existe pas ou a été supprimé', p_folder_id;
  END IF;
  
  -- Vérifier l'existence du BL
  SELECT EXISTS(SELECT 1 FROM public.bills_of_lading WHERE id = p_bl_id AND deleted_at IS NULL)
  INTO v_bl_exists;
  
  IF NOT v_bl_exists THEN
    RAISE EXCEPTION 'Le BL % n''existe pas ou a été supprimé', p_bl_id;
  END IF;
  
  -- Vérifier que le dossier n'est pas déjà lié à un autre BL
  IF EXISTS(SELECT 1 FROM public.folders WHERE id = p_folder_id AND bl_id IS NOT NULL AND bl_id != p_bl_id) THEN
    RAISE EXCEPTION 'Le dossier % est déjà lié à un autre BL', p_folder_id;
  END IF;
  
  -- Vérifier que le BL n'est pas déjà lié à un autre dossier
  IF EXISTS(SELECT 1 FROM public.bills_of_lading WHERE id = p_bl_id AND folder_id IS NOT NULL AND folder_id != p_folder_id) THEN
    RAISE EXCEPTION 'Le BL % est déjà lié à un autre dossier', p_bl_id;
  END IF;
  
  -- Création de la liaison bidirectionnelle
  UPDATE public.folders SET bl_id = p_bl_id WHERE id = p_folder_id;
  UPDATE public.bills_of_lading SET folder_id = p_folder_id WHERE id = p_bl_id;
  
  RETURN true;
END;
$$;

-- Fonction pour délier un dossier de son BL
CREATE OR REPLACE FUNCTION unlink_folder_from_bl(p_folder_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bl_id uuid;
BEGIN
  -- Validation du paramètre
  IF p_folder_id IS NULL THEN
    RAISE EXCEPTION 'L''identifiant du dossier ne peut pas être NULL';
  END IF;
  
  -- Récupérer l'ID du BL lié
  SELECT bl_id INTO v_bl_id FROM public.folders WHERE id = p_folder_id;
  
  IF v_bl_id IS NULL THEN
    RAISE NOTICE 'Le dossier % n''est lié à aucun BL', p_folder_id;
    RETURN true;
  END IF;
  
  -- Suppression de la liaison bidirectionnelle
  UPDATE public.folders SET bl_id = NULL WHERE id = p_folder_id;
  UPDATE public.bills_of_lading SET folder_id = NULL WHERE id = v_bl_id;
  
  RETURN true;
END;
$$;

-- Fonction pour obtenir les informations complètes d'un dossier avec son BL
CREATE OR REPLACE FUNCTION get_folder_with_bl(p_folder_id uuid)
RETURNS TABLE (
  folder_id uuid,
  folder_number varchar,
  folder_status text,
  transport_type text,
  bl_id uuid,
  bl_number varchar,
  bl_issue_date date,
  shipper_name text,
  consignee_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as folder_id,
    f.folder_number,
    f.status::text as folder_status,
    f.transport_type::text,
    b.id as bl_id,
    b.bl_number,
    b.issue_date as bl_issue_date,
    (b.shipper_info ->> 'name')::text as shipper_name,
    (b.consignee_info ->> 'name')::text as consignee_name
  FROM public.folders f
  LEFT JOIN public.bills_of_lading b ON f.bl_id = b.id
  WHERE f.id = p_folder_id
    AND f.deleted_at IS NULL
    AND (b.id IS NULL OR b.deleted_at IS NULL);
END;
$$;

-- ============================================================================
-- Vues pour faciliter les requêtes avec relations
-- ============================================================================

-- Vue complète des dossiers avec leurs BL
CREATE VIEW folders_with_bl AS
SELECT 
  f.id as folder_id,
  f.folder_number,
  f.transport_type,
  f.status as folder_status,
  f.title as folder_title,
  f.folder_date,
  f.created_at as folder_created_at,
  f.assigned_to,
  b.id as bl_id,
  b.bl_number,
  b.issue_date as bl_issue_date,
  (b.shipper_info ->> 'name') as shipper_name,
  (b.consignee_info ->> 'name') as consignee_name,
  b.port_of_loading,
  b.port_of_discharge,
  CASE 
    WHEN f.bl_id IS NOT NULL THEN 'Lié'
    ELSE 'Sans BL'
  END as relationship_status
FROM public.folders f
LEFT JOIN public.bills_of_lading b ON f.bl_id = b.id
WHERE f.deleted_at IS NULL
  AND (b.id IS NULL OR b.deleted_at IS NULL)
ORDER BY f.created_at DESC;

-- Vue des BL avec leurs dossiers
CREATE VIEW bl_with_folders AS
SELECT 
  b.id as bl_id,
  b.bl_number,
  b.issue_date as bl_issue_date,
  (b.shipper_info ->> 'name') as shipper_name,
  (b.consignee_info ->> 'name') as consignee_name,
  b.port_of_loading,
  b.port_of_discharge,
  b.created_at as bl_created_at,
  f.id as folder_id,
  f.folder_number,
  f.transport_type,
  f.status as folder_status,
  f.title as folder_title,
  CASE 
    WHEN b.folder_id IS NOT NULL THEN 'Lié'
    ELSE 'Sans dossier'
  END as relationship_status
FROM public.bills_of_lading b
LEFT JOIN public.folders f ON b.folder_id = f.id
WHERE b.deleted_at IS NULL
  AND (f.id IS NULL OR f.deleted_at IS NULL)
ORDER BY b.created_at DESC;

-- Vue des relations orphelines (pour audit et maintenance)
CREATE VIEW orphaned_relationships AS
SELECT 
  'folder' as source_table,
  f.id as source_id,
  f.folder_number as source_reference,
  f.bl_id as target_id,
  'BL référencé inexistant' as issue_description
FROM public.folders f
WHERE f.bl_id IS NOT NULL 
  AND f.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM public.bills_of_lading b WHERE b.id = f.bl_id AND b.deleted_at IS NULL)

UNION ALL

SELECT 
  'bills_of_lading' as source_table,
  b.id as source_id,
  b.bl_number as source_reference,
  b.folder_id as target_id,
  'Dossier référencé inexistant' as issue_description
FROM public.bills_of_lading b
WHERE b.folder_id IS NOT NULL 
  AND b.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM public.folders f WHERE f.id = b.folder_id AND f.deleted_at IS NULL);

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON COLUMN public.folders.bl_id IS 'Référence vers le BL associé (relation 1:1)';
COMMENT ON COLUMN public.bills_of_lading.folder_id IS 'Référence vers le dossier associé (relation 1:1)';

COMMENT ON FUNCTION validate_folder_bl_relationship() IS 'Valide et maintient la cohérence de la relation bidirectionnelle 1:1';
COMMENT ON FUNCTION link_folder_to_bl(uuid, uuid) IS 'Lie un dossier à un BL avec validation complète';
COMMENT ON FUNCTION unlink_folder_from_bl(uuid) IS 'Délie un dossier de son BL associé';
COMMENT ON FUNCTION get_folder_with_bl(uuid) IS 'Récupère les informations complètes d''un dossier avec son BL';

COMMENT ON VIEW folders_with_bl IS 'Vue complète des dossiers avec leurs BL associés';
COMMENT ON VIEW bl_with_folders IS 'Vue complète des BL avec leurs dossiers associés';
COMMENT ON VIEW orphaned_relationships IS 'Audit des relations orphelines entre dossiers et BL';

-- ============================================================================
-- Permissions pour les fonctions utilitaires
-- ============================================================================

-- Permettre l'exécution des fonctions utilitaires aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION link_folder_to_bl(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION unlink_folder_from_bl(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_folder_with_bl(uuid) TO authenticated;

-- Permettre la lecture des vues aux utilisateurs authentifiés
GRANT SELECT ON folders_with_bl TO authenticated;
GRANT SELECT ON bl_with_folders TO authenticated;
GRANT SELECT ON orphaned_relationships TO authenticated;