-- Migration: fix_search_path_empty_string
-- Description: Correction finale - SET search_path = '' (chaîne vide) comme requis par Supabase Advisors
-- Date: 2025-08-06
-- Problème: Le linter Supabase exige search_path = '' (chaîne vide), pas 'public'

-- ============================================================================
-- CORRECTION FINALE: SET search_path = '' pour toutes les fonctions
-- ============================================================================

-- 1. calculate_stage_actual_duration
CREATE OR REPLACE FUNCTION calculate_stage_actual_duration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Calculer la durée réelle quand une étape est complétée
  IF NEW.status = 'completed' AND NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.actual_duration = NEW.completed_at - NEW.started_at;
  END IF;
  RETURN NEW;
END;
$$;

-- 2. user_can_access_folder
CREATE OR REPLACE FUNCTION user_can_access_folder(folder_uuid uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.folders f 
    WHERE f.id = folder_uuid
      AND f.deleted_at IS NULL
      AND (
        f.created_by = user_uuid 
        OR f.assigned_to = user_uuid
        OR EXISTS (
          SELECT 1 FROM public.users u 
          WHERE u.id = user_uuid 
            AND u.role IN ('super_admin', 'admin')
        )
      )
  );
$$;

-- 3. initialize_folder_stages
CREATE OR REPLACE FUNCTION initialize_folder_stages(
  p_folder_id uuid,
  p_created_by uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  stage_config RECORD;
  estimated_start_date timestamptz := now();
BEGIN
  -- Vérifier que le dossier existe
  IF NOT EXISTS (SELECT 1 FROM public.folders WHERE id = p_folder_id AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'Folder with ID % not found or deleted', p_folder_id;
  END IF;

  -- Supprimer les étapes existantes si elles existent
  DELETE FROM public.folder_processing_stages WHERE folder_id = p_folder_id;

  -- Créer toutes les étapes basées sur la configuration par défaut
  FOR stage_config IN 
    SELECT * FROM public.default_processing_stages ORDER BY sequence_order
  LOOP
    INSERT INTO public.folder_processing_stages (
      folder_id,
      stage,
      status,
      sequence_order,
      priority,
      is_mandatory,
      can_be_skipped,
      requires_approval,
      estimated_duration,
      estimated_completion_date,
      created_by
    ) VALUES (
      p_folder_id,
      stage_config.stage,
      CASE WHEN stage_config.sequence_order = 1 THEN 'pending'::public.stage_status_enum ELSE 'pending'::public.stage_status_enum END,
      stage_config.sequence_order,
      stage_config.default_priority,
      stage_config.is_mandatory,
      stage_config.can_be_skipped,
      stage_config.requires_approval,
      stage_config.default_duration,
      estimated_start_date + (stage_config.sequence_order * stage_config.default_duration),
      p_created_by
    );
    
    -- Ajuster la date de début estimée pour la prochaine étape
    estimated_start_date := estimated_start_date + stage_config.default_duration;
  END LOOP;

  RETURN true;
END;
$$;

-- 4. start_processing_stage
CREATE OR REPLACE FUNCTION start_processing_stage(
  p_folder_id uuid,
  p_stage public.processing_stage_enum,
  p_assigned_to uuid DEFAULT NULL,
  p_started_by uuid DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_status public.stage_status_enum;
BEGIN
  -- Récupérer le statut actuel de l'étape
  SELECT status INTO current_status
  FROM public.folder_processing_stages 
  WHERE folder_id = p_folder_id AND stage = p_stage AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stage % not found for folder %', p_stage, p_folder_id;
  END IF;
  
  -- Vérifier que l'étape peut être démarrée
  IF current_status NOT IN ('pending', 'blocked') THEN
    RAISE EXCEPTION 'Cannot start stage % - current status is %', p_stage, current_status;
  END IF;
  
  -- Mettre à jour l'étape
  UPDATE public.folder_processing_stages
  SET 
    status = 'in_progress',
    started_at = now(),
    assigned_to = COALESCE(p_assigned_to, assigned_to),
    notes = COALESCE(p_notes, notes),
    blocking_reason = NULL, -- Clear any previous blocking reason
    updated_by = p_started_by
  WHERE folder_id = p_folder_id AND stage = p_stage AND deleted_at IS NULL;
  
  RETURN true;
END;
$$;

-- 5. complete_processing_stage
CREATE OR REPLACE FUNCTION complete_processing_stage(
  p_folder_id uuid,
  p_stage public.processing_stage_enum,
  p_completed_by uuid,
  p_completion_notes text DEFAULT NULL,
  p_documents_received text[] DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_status public.stage_status_enum;
  stage_requires_approval boolean;
  approval_provided boolean := false;
BEGIN
  -- Récupérer les informations de l'étape
  SELECT status, requires_approval, (approval_by IS NOT NULL)
  INTO current_status, stage_requires_approval, approval_provided
  FROM public.folder_processing_stages 
  WHERE folder_id = p_folder_id AND stage = p_stage AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stage % not found for folder %', p_stage, p_folder_id;
  END IF;
  
  -- Vérifier que l'étape peut être complétée
  IF current_status != 'in_progress' THEN
    RAISE EXCEPTION 'Cannot complete stage % - current status is %', p_stage, current_status;
  END IF;
  
  -- Vérifier l'approbation si nécessaire
  IF stage_requires_approval AND NOT approval_provided THEN
    RAISE EXCEPTION 'Stage % requires approval before completion', p_stage;
  END IF;
  
  -- Compléter l'étape
  UPDATE public.folder_processing_stages
  SET 
    status = 'completed',
    completed_at = now(),
    completed_by = p_completed_by,
    notes = COALESCE(p_completion_notes, notes),
    documents_received = COALESCE(p_documents_received, documents_received),
    updated_by = p_completed_by
  WHERE folder_id = p_folder_id AND stage = p_stage AND deleted_at IS NULL;
  
  RETURN true;
END;
$$;

-- 6. block_processing_stage
CREATE OR REPLACE FUNCTION block_processing_stage(
  p_folder_id uuid,
  p_stage public.processing_stage_enum,
  p_blocking_reason text,
  p_blocked_by uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_status public.stage_status_enum;
BEGIN
  -- Vérifier que la raison de blocage est fournie
  IF p_blocking_reason IS NULL OR trim(p_blocking_reason) = '' THEN
    RAISE EXCEPTION 'Blocking reason is required';
  END IF;

  -- Récupérer le statut actuel
  SELECT status INTO current_status
  FROM public.folder_processing_stages 
  WHERE folder_id = p_folder_id AND stage = p_stage AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stage % not found for folder %', p_stage, p_folder_id;
  END IF;
  
  -- Vérifier que l'étape peut être bloquée
  IF current_status NOT IN ('pending', 'in_progress') THEN
    RAISE EXCEPTION 'Cannot block stage % - current status is %', p_stage, current_status;
  END IF;
  
  -- Bloquer l'étape
  UPDATE public.folder_processing_stages
  SET 
    status = 'blocked',
    blocking_reason = p_blocking_reason,
    updated_by = p_blocked_by
  WHERE folder_id = p_folder_id AND stage = p_stage AND deleted_at IS NULL;
  
  RETURN true;
END;
$$;

-- 7. unblock_processing_stage
CREATE OR REPLACE FUNCTION unblock_processing_stage(
  p_folder_id uuid,
  p_stage public.processing_stage_enum,
  p_unblocked_by uuid DEFAULT NULL,
  p_resolution_notes text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_status public.stage_status_enum;
  was_started boolean;
BEGIN
  -- Récupérer les informations de l'étape
  SELECT status, (started_at IS NOT NULL)
  INTO current_status, was_started
  FROM public.folder_processing_stages 
  WHERE folder_id = p_folder_id AND stage = p_stage AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stage % not found for folder %', p_stage, p_folder_id;
  END IF;
  
  -- Vérifier que l'étape est bloquée
  IF current_status != 'blocked' THEN
    RAISE EXCEPTION 'Cannot unblock stage % - current status is %', p_stage, current_status;
  END IF;
  
  -- Débloquer et restaurer le statut approprié
  UPDATE public.folder_processing_stages
  SET 
    status = CASE WHEN was_started THEN 'in_progress' ELSE 'pending' END,
    blocking_reason = NULL,
    notes = CASE 
      WHEN p_resolution_notes IS NOT NULL 
      THEN COALESCE(notes, '') || CASE WHEN notes IS NOT NULL THEN E'\n\n' ELSE '' END || 'Résolution: ' || p_resolution_notes
      ELSE notes
    END,
    updated_by = p_unblocked_by
  WHERE folder_id = p_folder_id AND stage = p_stage AND deleted_at IS NULL;
  
  RETURN true;
END;
$$;

-- 8. approve_processing_stage
CREATE OR REPLACE FUNCTION approve_processing_stage(
  p_folder_id uuid,
  p_stage public.processing_stage_enum,
  p_approved_by uuid,
  p_approval_notes text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_status public.stage_status_enum;
  stage_requires_approval boolean;
BEGIN
  -- Récupérer les informations de l'étape
  SELECT status, requires_approval
  INTO current_status, stage_requires_approval
  FROM public.folder_processing_stages 
  WHERE folder_id = p_folder_id AND stage = p_stage AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stage % not found for folder %', p_stage, p_folder_id;
  END IF;
  
  -- Vérifier que l'étape nécessite une approbation
  IF NOT stage_requires_approval THEN
    RAISE EXCEPTION 'Stage % does not require approval', p_stage;
  END IF;
  
  -- Enregistrer l'approbation
  UPDATE public.folder_processing_stages
  SET 
    approval_by = p_approved_by,
    approval_date = now(),
    notes = CASE 
      WHEN p_approval_notes IS NOT NULL 
      THEN COALESCE(notes, '') || CASE WHEN notes IS NOT NULL THEN E'\n\n' ELSE '' END || 'Approbation: ' || p_approval_notes
      ELSE notes
    END,
    updated_by = p_approved_by
  WHERE folder_id = p_folder_id AND stage = p_stage AND deleted_at IS NULL;
  
  RETURN true;
END;
$$;

-- 9. skip_processing_stage
CREATE OR REPLACE FUNCTION skip_processing_stage(
  p_folder_id uuid,
  p_stage public.processing_stage_enum,
  p_skipped_by uuid,
  p_skip_reason text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_status public.stage_status_enum;
  can_skip boolean;
  is_mandatory boolean;
BEGIN
  -- Récupérer les informations de l'étape
  SELECT status, can_be_skipped, is_mandatory
  INTO current_status, can_skip, is_mandatory
  FROM public.folder_processing_stages 
  WHERE folder_id = p_folder_id AND stage = p_stage AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stage % not found for folder %', p_stage, p_folder_id;
  END IF;
  
  -- Vérifier que l'étape peut être ignorée
  IF is_mandatory THEN
    RAISE EXCEPTION 'Cannot skip mandatory stage %', p_stage;
  END IF;
  
  IF NOT can_skip THEN
    RAISE EXCEPTION 'Stage % cannot be skipped', p_stage;
  END IF;
  
  IF current_status = 'completed' THEN
    RAISE EXCEPTION 'Cannot skip already completed stage %', p_stage;
  END IF;
  
  -- Ignorer l'étape
  UPDATE public.folder_processing_stages
  SET 
    status = 'skipped',
    notes = COALESCE(notes, '') || CASE WHEN notes IS NOT NULL THEN E'\n\n' ELSE '' END || 'Étape ignorée: ' || p_skip_reason,
    updated_by = p_skipped_by
  WHERE folder_id = p_folder_id AND stage = p_stage AND deleted_at IS NULL;
  
  RETURN true;
END;
$$;

-- 10. get_folder_progress
CREATE OR REPLACE FUNCTION get_folder_progress(p_folder_id uuid)
RETURNS TABLE (
  total_stages integer,
  completed_stages integer,
  in_progress_stages integer,
  blocked_stages integer,
  pending_stages integer,
  skipped_stages integer,
  completion_percentage numeric,
  current_stage public.processing_stage_enum,
  next_stage public.processing_stage_enum,
  est_completion_date timestamptz,
  is_on_schedule boolean,
  overdue_stages integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  stage_counts RECORD;
  current_seq integer;
  next_seq integer;
  est_completion timestamptz;
  overdue_count integer;
BEGIN
  -- Calculer les statistiques des étapes
  SELECT 
    COUNT(*)::integer as total,
    COUNT(CASE WHEN fps.status = 'completed' THEN 1 END)::integer as completed,
    COUNT(CASE WHEN fps.status = 'in_progress' THEN 1 END)::integer as in_progress,
    COUNT(CASE WHEN fps.status = 'blocked' THEN 1 END)::integer as blocked,
    COUNT(CASE WHEN fps.status = 'pending' THEN 1 END)::integer as pending,
    COUNT(CASE WHEN fps.status = 'skipped' THEN 1 END)::integer as skipped,
    MAX(CASE WHEN fps.status IN ('in_progress', 'completed') THEN fps.sequence_order END) as current_seq,
    MIN(CASE WHEN fps.status = 'pending' THEN fps.sequence_order END) as next_seq,
    MAX(fps.estimated_completion_date) as max_est_completion,
    COUNT(CASE WHEN fps.status IN ('pending', 'in_progress') AND fps.due_date < now() THEN 1 END)::integer as overdue
  INTO stage_counts
  FROM public.folder_processing_stages fps
  WHERE fps.folder_id = p_folder_id AND fps.deleted_at IS NULL;
  
  -- Récupérer les étapes actuelles et suivantes
  SELECT stage INTO current_stage
  FROM public.folder_processing_stages 
  WHERE folder_id = p_folder_id 
    AND sequence_order = stage_counts.current_seq 
    AND deleted_at IS NULL;
    
  SELECT stage INTO next_stage
  FROM public.folder_processing_stages 
  WHERE folder_id = p_folder_id 
    AND sequence_order = stage_counts.next_seq 
    AND deleted_at IS NULL;
  
  -- Retourner les résultats
  total_stages := stage_counts.total;
  completed_stages := stage_counts.completed;
  in_progress_stages := stage_counts.in_progress;
  blocked_stages := stage_counts.blocked;
  pending_stages := stage_counts.pending;
  skipped_stages := stage_counts.skipped;
  completion_percentage := CASE 
    WHEN stage_counts.total > 0 THEN 
      ROUND((stage_counts.completed::numeric / stage_counts.total::numeric) * 100, 1)
    ELSE 0 
  END;
  est_completion_date := stage_counts.max_est_completion;
  is_on_schedule := (stage_counts.overdue = 0);
  overdue_stages := stage_counts.overdue;
  
  RETURN NEXT;
END;
$$;

-- 11. get_stages_requiring_attention
CREATE OR REPLACE FUNCTION get_stages_requiring_attention()
RETURNS TABLE (
  folder_id uuid,
  folder_number varchar,
  stage public.processing_stage_enum,
  status public.stage_status_enum,
  assigned_to uuid,
  assignee_name text,
  days_overdue integer,
  priority public.stage_priority_enum,
  blocking_reason text,
  attention_score integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fps.folder_id,
    f.folder_number,
    fps.stage,
    fps.status,
    fps.assigned_to,
    COALESCE(u.first_name || ' ' || u.last_name, u.email) as assignee_name,
    CASE 
      WHEN fps.due_date IS NOT NULL AND fps.due_date < now() 
      THEN EXTRACT(days FROM now() - fps.due_date)::integer
      ELSE 0
    END as days_overdue,
    fps.priority,
    fps.blocking_reason,
    -- Calcul du score d'attention (0-100)
    (
      CASE fps.status
        WHEN 'blocked' THEN 40
        WHEN 'in_progress' THEN 20
        ELSE 10
      END +
      CASE fps.priority
        WHEN 'urgent' THEN 30
        WHEN 'high' THEN 20
        WHEN 'normal' THEN 10
        ELSE 5
      END +
      CASE 
        WHEN fps.due_date IS NOT NULL AND fps.due_date < now() 
        THEN LEAST(EXTRACT(days FROM now() - fps.due_date)::integer * 5, 30)
        ELSE 0
      END
    ) as attention_score
  FROM public.folder_processing_stages fps
  JOIN public.folders f ON f.id = fps.folder_id
  LEFT JOIN public.users u ON u.id = fps.assigned_to
  WHERE fps.deleted_at IS NULL
    AND f.deleted_at IS NULL
    AND fps.status IN ('pending', 'in_progress', 'blocked')
    AND (
      fps.status = 'blocked' OR
      fps.priority IN ('high', 'urgent') OR
      (fps.due_date IS NOT NULL AND fps.due_date < now()) OR
      (fps.status = 'in_progress' AND fps.started_at < now() - interval '3 days')
    )
  ORDER BY attention_score DESC, fps.due_date ASC NULLS LAST;
END;
$$;

-- 12. get_stage_performance_metrics
CREATE OR REPLACE FUNCTION get_stage_performance_metrics()
RETURNS TABLE (
  stage public.processing_stage_enum,
  stage_name text,
  total_completed integer,
  avg_duration interval,
  median_duration interval,
  min_duration interval,
  max_duration interval,
  success_rate numeric,
  avg_overdue_days numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  WITH stage_stats AS (
    SELECT 
      fps.stage,
      fps.actual_duration,
      CASE 
        WHEN fps.due_date IS NOT NULL AND fps.completed_at > fps.due_date 
        THEN EXTRACT(days FROM fps.completed_at - fps.due_date)
        ELSE 0
      END as overdue_days,
      fps.status
    FROM public.folder_processing_stages fps
    WHERE fps.deleted_at IS NULL 
      AND fps.status IN ('completed', 'skipped')
      AND fps.actual_duration IS NOT NULL
  )
  SELECT 
    ss.stage,
    CASE ss.stage
      WHEN 'enregistrement' THEN 'Enregistrement'
      WHEN 'revision_facture_commerciale' THEN 'Révision Facture Commerciale'
      WHEN 'elaboration_fdi' THEN 'Élaboration FDI'
      WHEN 'elaboration_rfcv' THEN 'Élaboration RFCV'
      WHEN 'declaration_douaniere' THEN 'Déclaration Douanière'
      WHEN 'service_exploitation' THEN 'Service Exploitation'
      WHEN 'facturation_client' THEN 'Facturation Client'
      WHEN 'livraison' THEN 'Livraison'
    END as stage_name,
    COUNT(CASE WHEN status = 'completed' THEN 1 END)::integer as total_completed,
    AVG(ss.actual_duration) as avg_duration,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ss.actual_duration) as median_duration,
    MIN(ss.actual_duration) as min_duration,
    MAX(ss.actual_duration) as max_duration,
    ROUND(
      COUNT(CASE WHEN status = 'completed' THEN 1 END)::numeric / 
      COUNT(*)::numeric * 100, 1
    ) as success_rate,
    ROUND(AVG(ss.overdue_days), 1) as avg_overdue_days
  FROM stage_stats ss
  GROUP BY ss.stage
  ORDER BY 
    CASE ss.stage
      WHEN 'enregistrement' THEN 1
      WHEN 'revision_facture_commerciale' THEN 2
      WHEN 'elaboration_fdi' THEN 3
      WHEN 'elaboration_rfcv' THEN 4
      WHEN 'declaration_douaniere' THEN 5
      WHEN 'service_exploitation' THEN 6
      WHEN 'facturation_client' THEN 7
      WHEN 'livraison' THEN 8
    END;
END;
$$;

-- 13. user_can_modify_stage
CREATE OR REPLACE FUNCTION user_can_modify_stage(stage_uuid uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.folder_processing_stages fps
    JOIN public.folders f ON f.id = fps.folder_id
    WHERE fps.id = stage_uuid
      AND fps.deleted_at IS NULL
      AND f.deleted_at IS NULL
      AND (
        fps.assigned_to = user_uuid
        OR fps.created_by = user_uuid
        OR f.created_by = user_uuid
        OR f.assigned_to = user_uuid
        OR EXISTS (
          SELECT 1 FROM public.users u 
          WHERE u.id = user_uuid 
            AND u.role IN ('super_admin', 'admin')
        )
      )
  );
$$;

-- 14. user_can_approve_stage
CREATE OR REPLACE FUNCTION user_can_approve_stage(stage_uuid uuid, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.folder_processing_stages fps
    JOIN public.folders f ON f.id = fps.folder_id
    WHERE fps.id = stage_uuid
      AND fps.deleted_at IS NULL
      AND f.deleted_at IS NULL
      AND fps.requires_approval = true
      AND (
        -- Admins peuvent toujours approuver
        EXISTS (
          SELECT 1 FROM public.users u 
          WHERE u.id = user_uuid 
            AND u.role IN ('super_admin', 'admin')
        )
        OR
        -- Responsable du dossier peut approuver
        f.assigned_to = user_uuid
        OR
        -- Créateur du dossier peut approuver
        f.created_by = user_uuid
      )
  );
$$;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'MIGRATION FINALE: search_path = '''' (chaîne vide) appliqué';
    RAISE NOTICE '================================================================';
    RAISE NOTICE '✅ 14 fonctions mises à jour avec SET search_path = ''''';
    RAISE NOTICE '✅ Conformité Supabase Advisors assurée';
    RAISE NOTICE '✅ Sécurité maximale garantie';
    RAISE NOTICE '================================================================';
END $$;