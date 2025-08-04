-- Migration: create_folder_bl_reassignment_functions
-- Description: Fonctions avancées pour la réassociation et l'échange de liaisons folders-BL
-- Date: 2025-08-04

-- ============================================================================
-- Fonction pour échanger les BL entre deux dossiers (swap)
-- ============================================================================

-- Fonction pour échanger directement les BL entre deux dossiers
CREATE OR REPLACE FUNCTION swap_folder_bl_links(
  p_folder1_id uuid,
  p_folder2_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_user_id uuid;
  v_folder1_bl_id uuid;
  v_folder2_bl_id uuid;
  v_folder1_exists boolean;
  v_folder2_exists boolean;
  v_result jsonb;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  -- Validation des paramètres
  IF p_folder1_id IS NULL OR p_folder2_id IS NULL THEN
    RAISE EXCEPTION 'Les identifiants des dossiers ne peuvent pas être NULL';
  END IF;
  
  IF p_folder1_id = p_folder2_id THEN
    RAISE EXCEPTION 'Les identifiants des dossiers doivent être différents';
  END IF;
  
  -- Vérifier l'existence et les permissions pour les deux dossiers
  SELECT EXISTS(
    SELECT 1 FROM public.folders 
    WHERE id = p_folder1_id 
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
  ) INTO v_folder1_exists;
  
  SELECT EXISTS(
    SELECT 1 FROM public.folders 
    WHERE id = p_folder2_id 
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
  ) INTO v_folder2_exists;
  
  IF NOT v_folder1_exists THEN
    RAISE EXCEPTION 'Dossier 1 (%) non trouvé ou permissions insuffisantes', p_folder1_id;
  END IF;
  
  IF NOT v_folder2_exists THEN
    RAISE EXCEPTION 'Dossier 2 (%) non trouvé ou permissions insuffisantes', p_folder2_id;
  END IF;
  
  -- Récupérer les BL actuellement associés
  SELECT bl_id INTO v_folder1_bl_id FROM public.folders WHERE id = p_folder1_id;
  SELECT bl_id INTO v_folder2_bl_id FROM public.folders WHERE id = p_folder2_id;
  
  -- Vérifier que les BL existent s'ils sont définis
  IF v_folder1_bl_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.bills_of_lading WHERE id = v_folder1_bl_id AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'BL associé au dossier 1 (%) non trouvé ou supprimé', v_folder1_bl_id;
  END IF;
  
  IF v_folder2_bl_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.bills_of_lading WHERE id = v_folder2_bl_id AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'BL associé au dossier 2 (%) non trouvé ou supprimé', v_folder2_bl_id;
  END IF;
  
  -- Effectuer l'échange en une transaction atomique
  BEGIN
    -- Étape 1: Dissocier temporairement tous les liens pour éviter les contraintes
    UPDATE public.folders SET bl_id = NULL WHERE id IN (p_folder1_id, p_folder2_id);
    UPDATE public.bills_of_lading SET folder_id = NULL WHERE id IN (v_folder1_bl_id, v_folder2_bl_id);
    
    -- Étape 2: Réassocier avec échange
    -- Dossier 1 prend le BL du dossier 2
    IF v_folder2_bl_id IS NOT NULL THEN
      UPDATE public.folders SET bl_id = v_folder2_bl_id WHERE id = p_folder1_id;
      UPDATE public.bills_of_lading SET folder_id = p_folder1_id WHERE id = v_folder2_bl_id;
    END IF;
    
    -- Dossier 2 prend le BL du dossier 1
    IF v_folder1_bl_id IS NOT NULL THEN
      UPDATE public.folders SET bl_id = v_folder1_bl_id WHERE id = p_folder2_id;
      UPDATE public.bills_of_lading SET folder_id = p_folder2_id WHERE id = v_folder1_bl_id;
    END IF;
    
    -- Mettre à jour les timestamps
    UPDATE public.folders 
    SET updated_at = now() 
    WHERE id IN (p_folder1_id, p_folder2_id);
    
  EXCEPTION
    WHEN OTHERS THEN
      -- En cas d'erreur, la transaction sera rollback automatiquement
      RAISE EXCEPTION 'Erreur lors de l''échange des liaisons: %', SQLERRM;
  END;
  
  -- Construire le résultat
  v_result := jsonb_build_object(
    'success', true,
    'operation', 'swap',
    'folder1_id', p_folder1_id,
    'folder2_id', p_folder2_id,
    'before', jsonb_build_object(
      'folder1_bl_id', v_folder1_bl_id,
      'folder2_bl_id', v_folder2_bl_id
    ),
    'after', jsonb_build_object(
      'folder1_bl_id', v_folder2_bl_id,
      'folder2_bl_id', v_folder1_bl_id
    ),
    'timestamp', now()
  );
  
  RETURN v_result;
END;
$$;

-- ============================================================================
-- Fonction pour réassociation en lot (bulk reassignment)
-- ============================================================================

-- Fonction pour réassocier plusieurs dossiers à leurs nouveaux BL en une transaction
CREATE OR REPLACE FUNCTION bulk_reassign_folder_bl_links(
  p_reassignments jsonb -- Format: [{"folder_id": "uuid", "bl_id": "uuid"}, ...]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_user_id uuid;
  v_reassignment jsonb;
  v_folder_id uuid;
  v_bl_id uuid;
  v_processed_count integer DEFAULT 0;
  v_results jsonb DEFAULT '[]'::jsonb;
  v_errors jsonb DEFAULT '[]'::jsonb;
  v_affected_folders uuid[] DEFAULT '{}';
  v_affected_bls uuid[] DEFAULT '{}';
  v_final_result jsonb;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  -- Validation du format JSON
  IF p_reassignments IS NULL OR jsonb_typeof(p_reassignments) != 'array' THEN
    RAISE EXCEPTION 'Le paramètre reassignments doit être un tableau JSON valide';
  END IF;
  
  IF jsonb_array_length(p_reassignments) = 0 THEN
    RAISE EXCEPTION 'Le tableau de réassignations ne peut pas être vide';
  END IF;
  
  IF jsonb_array_length(p_reassignments) > 100 THEN
    RAISE EXCEPTION 'Maximum 100 réassignations par batch autorisées';
  END IF;
  
  -- Validation préliminaire de tous les éléments
  FOR v_reassignment IN SELECT * FROM jsonb_array_elements(p_reassignments) LOOP
    BEGIN
      -- Vérifier la structure de chaque élément
      IF NOT (v_reassignment ? 'folder_id' AND v_reassignment ? 'bl_id') THEN
        RAISE EXCEPTION 'Chaque élément doit contenir folder_id et bl_id';
      END IF;
      
      -- Extraire les IDs
      v_folder_id := (v_reassignment->>'folder_id')::uuid;
      v_bl_id := CASE 
        WHEN v_reassignment->>'bl_id' = 'null' OR v_reassignment->>'bl_id' IS NULL 
        THEN NULL 
        ELSE (v_reassignment->>'bl_id')::uuid 
      END;
      
      -- Collecter tous les IDs affectés pour validation globale
      v_affected_folders := array_append(v_affected_folders, v_folder_id);
      IF v_bl_id IS NOT NULL THEN
        v_affected_bls := array_append(v_affected_bls, v_bl_id);
      END IF;
      
    EXCEPTION
      WHEN OTHERS THEN
        v_errors := v_errors || jsonb_build_object(
          'folder_id', COALESCE(v_reassignment->>'folder_id', 'invalid'),
          'bl_id', COALESCE(v_reassignment->>'bl_id', 'invalid'),
          'error', SQLERRM
        );
    END;
  END LOOP;
  
  -- Si des erreurs de validation, retourner immédiatement
  IF jsonb_array_length(v_errors) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Erreurs de validation',
      'validation_errors', v_errors
    );
  END IF;
  
  -- Vérifier les permissions sur tous les dossiers
  IF EXISTS (
    SELECT 1 FROM unnest(v_affected_folders) AS folder_id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.folders f
      WHERE f.id = folder_id
        AND f.deleted_at IS NULL
        AND (
          f.created_by = v_current_user_id OR 
          f.assigned_to = v_current_user_id OR
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = v_current_user_id 
            AND role = 'admin'
          )
        )
    )
  ) THEN
    RAISE EXCEPTION 'Permissions insuffisantes ou dossiers inexistants détectés';
  END IF;
  
  -- Vérifier l'existence de tous les BL
  IF EXISTS (
    SELECT 1 FROM unnest(v_affected_bls) AS bl_id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.bills_of_lading b
      WHERE b.id = bl_id AND b.deleted_at IS NULL
    )
  ) THEN
    RAISE EXCEPTION 'BL inexistants ou supprimés détectés';
  END IF;
  
  -- Effectuer toutes les réassignations en une transaction atomique
  BEGIN
    -- Étape 1: Dissocier tous les dossiers et BL concernés
    UPDATE public.folders 
    SET bl_id = NULL 
    WHERE id = ANY(v_affected_folders);
    
    UPDATE public.bills_of_lading 
    SET folder_id = NULL 
    WHERE id = ANY(v_affected_bls);
    
    -- Étape 2: Appliquer toutes les nouvelles associations
    FOR v_reassignment IN SELECT * FROM jsonb_array_elements(p_reassignments) LOOP
      v_folder_id := (v_reassignment->>'folder_id')::uuid;
      v_bl_id := CASE 
        WHEN v_reassignment->>'bl_id' = 'null' OR v_reassignment->>'bl_id' IS NULL 
        THEN NULL 
        ELSE (v_reassignment->>'bl_id')::uuid 
      END;
      
      -- Associer le dossier au BL (ou NULL)
      UPDATE public.folders 
      SET bl_id = v_bl_id, updated_at = now()
      WHERE id = v_folder_id;
      
      -- Associer le BL au dossier (si BL défini)
      IF v_bl_id IS NOT NULL THEN
        UPDATE public.bills_of_lading 
        SET folder_id = v_folder_id 
        WHERE id = v_bl_id;
      END IF;
      
      v_processed_count := v_processed_count + 1;
      
      -- Ajouter le résultat de cette réassignation
      v_results := v_results || jsonb_build_object(
        'folder_id', v_folder_id,
        'bl_id', v_bl_id,
        'status', 'success'
      );
    END LOOP;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- En cas d'erreur, la transaction sera rollback automatiquement
      RAISE EXCEPTION 'Erreur lors de la réassignation en lot: %', SQLERRM;
  END;
  
  -- Construire le résultat final
  v_final_result := jsonb_build_object(
    'success', true,
    'operation', 'bulk_reassignment',
    'processed_count', v_processed_count,
    'total_count', jsonb_array_length(p_reassignments),
    'results', v_results,
    'timestamp', now(),
    'affected_folders', array_length(v_affected_folders, 1),
    'affected_bls', array_length(v_affected_bls, 1)
  );
  
  RETURN v_final_result;
END;
$$;

-- ============================================================================
-- Fonction pour réassociation directe (sans dissociation préalable)
-- ============================================================================

-- Fonction pour réassocier directement un dossier à un nouveau BL
CREATE OR REPLACE FUNCTION reassign_folder_to_bl(
  p_folder_id uuid,
  p_new_bl_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_user_id uuid;
  v_old_bl_id uuid;
  v_old_bl_folder_id uuid;
  v_folder_exists boolean;
  v_bl_exists boolean;
  v_result jsonb;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  -- Validation des paramètres (p_new_bl_id peut être NULL pour dissocier)
  IF p_folder_id IS NULL THEN
    RAISE EXCEPTION 'L''identifiant du dossier ne peut pas être NULL';
  END IF;
  
  -- Vérifier l'existence et les permissions du dossier
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
    RAISE EXCEPTION 'Dossier (%) non trouvé ou permissions insuffisantes', p_folder_id;
  END IF;
  
  -- Vérifier l'existence du nouveau BL (si défini)
  IF p_new_bl_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.bills_of_lading 
      WHERE id = p_new_bl_id AND deleted_at IS NULL
    ) INTO v_bl_exists;
    
    IF NOT v_bl_exists THEN
      RAISE EXCEPTION 'BL (%) non trouvé ou supprimé', p_new_bl_id;
    END IF;
  END IF;
  
  -- Récupérer l'ancien BL associé
  SELECT bl_id INTO v_old_bl_id FROM public.folders WHERE id = p_folder_id;
  
  -- Si le nouveau BL est déjà associé à un autre dossier, récupérer cet info
  IF p_new_bl_id IS NOT NULL THEN
    SELECT folder_id INTO v_old_bl_folder_id FROM public.bills_of_lading WHERE id = p_new_bl_id;
  END IF;
  
  -- Vérifier si c'est déjà la bonne association
  IF v_old_bl_id = p_new_bl_id THEN
    RETURN jsonb_build_object(
      'success', true,
      'operation', 'reassign',
      'message', 'Aucun changement nécessaire - association déjà existante',
      'folder_id', p_folder_id,
      'bl_id', p_new_bl_id,
      'timestamp', now()
    );
  END IF;
  
  -- Effectuer la réassignation en une transaction atomique
  BEGIN
    -- Étape 1: Dissocier les anciennes liaisons
    IF v_old_bl_id IS NOT NULL THEN
      UPDATE public.bills_of_lading SET folder_id = NULL WHERE id = v_old_bl_id;
    END IF;
    
    IF p_new_bl_id IS NOT NULL AND v_old_bl_folder_id IS NOT NULL THEN
      UPDATE public.folders SET bl_id = NULL WHERE id = v_old_bl_folder_id;
    END IF;
    
    -- Étape 2: Créer les nouvelles liaisons
    UPDATE public.folders 
    SET bl_id = p_new_bl_id, updated_at = now()
    WHERE id = p_folder_id;
    
    IF p_new_bl_id IS NOT NULL THEN
      UPDATE public.bills_of_lading 
      SET folder_id = p_folder_id 
      WHERE id = p_new_bl_id;
    END IF;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- En cas d'erreur, la transaction sera rollback automatiquement
      RAISE EXCEPTION 'Erreur lors de la réassignation: %', SQLERRM;
  END;
  
  -- Construire le résultat
  v_result := jsonb_build_object(
    'success', true,
    'operation', 'reassign',
    'folder_id', p_folder_id,
    'old_bl_id', v_old_bl_id,
    'new_bl_id', p_new_bl_id,
    'displaced_folder_id', v_old_bl_folder_id,
    'timestamp', now()
  );
  
  RETURN v_result;
END;
$$;

-- ============================================================================
-- Vue pour visualiser les changements de liaisons récents
-- ============================================================================

-- Vue pour suivre les changements récents de liaisons folder-BL
CREATE VIEW recent_folder_bl_changes AS
SELECT 
  f.id as folder_id,
  f.folder_number,
  f.transport_type,
  f.bl_id,
  b.bl_number,
  f.updated_at as last_change,
  u.email as last_updated_by,
  EXTRACT(DAY FROM (now() - f.updated_at))::integer as days_since_change,
  CASE 
    WHEN f.updated_at > now() - INTERVAL '1 hour' THEN 'Très récent'
    WHEN f.updated_at > now() - INTERVAL '1 day' THEN 'Récent'
    WHEN f.updated_at > now() - INTERVAL '7 days' THEN 'Cette semaine'
    ELSE 'Plus ancien'
  END as change_category
FROM public.folders f
LEFT JOIN public.bills_of_lading b ON f.bl_id = b.id
LEFT JOIN public.users u ON f.created_by = u.id -- Approximation, idéalement updated_by
WHERE f.deleted_at IS NULL
  AND f.updated_at > now() - INTERVAL '30 days' -- Changements des 30 derniers jours
ORDER BY f.updated_at DESC;

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON FUNCTION swap_folder_bl_links(uuid, uuid) IS 'Échange les BL associés entre deux dossiers en une transaction atomique';
COMMENT ON FUNCTION bulk_reassign_folder_bl_links(jsonb) IS 'Réassigne plusieurs dossiers à de nouveaux BL en lot avec validation complète';
COMMENT ON FUNCTION reassign_folder_to_bl(uuid, uuid) IS 'Réassigne directement un dossier à un nouveau BL (avec gestion des conflits)';

COMMENT ON VIEW recent_folder_bl_changes IS 'Vue des changements récents de liaisons folder-BL pour audit et monitoring';

-- ============================================================================
-- Permissions pour les fonctions de réassignation
-- ============================================================================

-- Permettre l'exécution des fonctions aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION swap_folder_bl_links(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_reassign_folder_bl_links(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION reassign_folder_to_bl(uuid, uuid) TO authenticated;

-- Vue accessible aux utilisateurs authentifiés
GRANT SELECT ON recent_folder_bl_changes TO authenticated;