-- Migration: add_soft_delete_columns
-- Description: Correction des erreurs d'index et de colonnes dans les migrations folders/BL
-- Date: 2025-08-04

-- ============================================================================
-- Corrections d'index avec fonctions non IMMUTABLE
-- ============================================================================

-- Supprimer l'index problématique s'il existe
DROP INDEX IF EXISTS public.idx_folder_counter_current_year;

-- Recréer l'index sans prédicat CURRENT_DATE (non IMMUTABLE)
CREATE INDEX IF NOT EXISTS idx_folder_counter_year_desc 
ON public.folder_counter(year DESC);

-- ============================================================================
-- Ajout des colonnes soft delete manquantes dans la table folders
-- ============================================================================

-- Vérifier et ajouter les colonnes soft delete si elles n'existent pas
DO $$ 
BEGIN
    -- Ajouter deleted_at si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'folders' 
        AND table_schema = 'public'
        AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE public.folders ADD COLUMN deleted_at timestamptz DEFAULT NULL;
    END IF;
    
    -- Ajouter deleted_by si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'folders' 
        AND table_schema = 'public'
        AND column_name = 'deleted_by'
    ) THEN
        ALTER TABLE public.folders ADD COLUMN deleted_by uuid REFERENCES public.users(id);
    END IF;
END $$;

-- ============================================================================
-- Correction des vues avec les bonnes colonnes BL
-- ============================================================================

-- Supprimer et recréer la fonction get_folder_with_bl avec les bonnes colonnes
DROP FUNCTION IF EXISTS public.get_folder_with_bl(uuid);

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

-- Supprimer et recréer les vues avec les bonnes colonnes
DROP VIEW IF EXISTS public.folders_with_bl;
DROP VIEW IF EXISTS public.bl_with_folders;

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

-- ============================================================================
-- Index optimisés pour soft delete
-- ============================================================================

-- Index pour les dossiers actifs (non supprimés) - très fréquent
CREATE INDEX IF NOT EXISTS idx_folders_active 
ON public.folders(id) 
WHERE deleted_at IS NULL;

-- Index composite pour les requêtes de statut sur les dossiers actifs
CREATE INDEX IF NOT EXISTS idx_folders_status_active 
ON public.folders(status, created_at DESC) 
WHERE deleted_at IS NULL;

-- Index pour les dossiers supprimés (pour les fonctions d'audit)
CREATE INDEX IF NOT EXISTS idx_folders_deleted 
ON public.folders(deleted_at DESC, deleted_by) 
WHERE deleted_at IS NOT NULL;

-- ============================================================================
-- Permissions pour les vues corrigées
-- ============================================================================

-- Permettre l'accès aux vues corrigées
GRANT SELECT ON folders_with_bl TO authenticated;
GRANT SELECT ON bl_with_folders TO authenticated;
GRANT EXECUTE ON FUNCTION get_folder_with_bl(uuid) TO authenticated;

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON INDEX public.idx_folder_counter_year_desc IS 'Index pour les requêtes par année (optimisé DESC pour les années récentes)';
COMMENT ON INDEX public.idx_folders_active IS 'Index pour les dossiers actifs (non supprimés) - utilisé par toutes les requêtes business';
COMMENT ON INDEX public.idx_folders_status_active IS 'Index composite pour les requêtes de statut sur dossiers actifs';
COMMENT ON INDEX public.idx_folders_deleted IS 'Index pour les dossiers supprimés (fonctions d''audit et nettoyage)';
COMMENT ON FUNCTION get_folder_with_bl(uuid) IS 'Récupère les informations complètes d''un dossier avec son BL (colonnes corrigées)';
COMMENT ON VIEW folders_with_bl IS 'Vue complète des dossiers avec leurs BL associés (colonnes corrigées)';
COMMENT ON VIEW bl_with_folders IS 'Vue complète des BL avec leurs dossiers associés (colonnes corrigées)';

-- ============================================================================
-- Correction des erreurs EXTRACT dans les vues statistiques
-- ============================================================================

-- Supprimer les vues problématiques qui utilisent EXTRACT incorrectement
DROP VIEW IF EXISTS public.folders_requiring_attention;
DROP VIEW IF EXISTS public.folder_stats_by_period;

-- Recréer la vue folder_stats_by_period (pas d'erreur EXTRACT ici)
CREATE VIEW folder_stats_by_period AS
SELECT 
  EXTRACT(YEAR FROM folder_date) as year,
  EXTRACT(MONTH FROM folder_date) as month,
  TO_CHAR(folder_date, 'YYYY-MM') as period_label,
  DATE_TRUNC('month', folder_date) as period_start,
  
  -- Compteurs globaux
  COUNT(*) as total_folders,
  COUNT(*) FILTER (WHERE deleted_at IS NULL) as active_folders,
  
  -- Par type de transport
  COUNT(*) FILTER (WHERE transport_type = 'M' AND deleted_at IS NULL) as maritime_count,
  COUNT(*) FILTER (WHERE transport_type = 'T' AND deleted_at IS NULL) as terrestre_count,
  COUNT(*) FILTER (WHERE transport_type = 'A' AND deleted_at IS NULL) as aerien_count,
  
  -- Par statut
  COUNT(*) FILTER (WHERE status = 'completed' AND deleted_at IS NULL) as completed_count,
  COUNT(*) FILTER (WHERE status = 'cancelled' AND deleted_at IS NULL) as cancelled_count,
  
  -- Valeurs business
  SUM(estimated_value) FILTER (WHERE deleted_at IS NULL) as total_estimated_value,
  AVG(estimated_value) FILTER (WHERE estimated_value IS NOT NULL AND deleted_at IS NULL) as avg_estimated_value,
  
  -- Relation avec BL
  COUNT(*) FILTER (WHERE bl_id IS NOT NULL AND deleted_at IS NULL) as folders_with_bl,
  
  -- Taux de réussite (complétés vs total)
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'completed' AND deleted_at IS NULL) / 
    GREATEST(COUNT(*) FILTER (WHERE deleted_at IS NULL), 1), 2
  ) as completion_rate,
  
  -- Taux d'annulation
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'cancelled' AND deleted_at IS NULL) / 
    GREATEST(COUNT(*) FILTER (WHERE deleted_at IS NULL), 1), 2
  ) as cancellation_rate

FROM public.folders
WHERE folder_date IS NOT NULL
GROUP BY EXTRACT(YEAR FROM folder_date), EXTRACT(MONTH FROM folder_date), 
         TO_CHAR(folder_date, 'YYYY-MM'), DATE_TRUNC('month', folder_date)
ORDER BY year DESC, month DESC;

-- Recréer la vue folders_requiring_attention avec les corrections EXTRACT
CREATE VIEW folders_requiring_attention AS
SELECT 
  f.id as folder_id,
  f.folder_number,
  f.transport_type,
  f.status,
  f.title,
  f.folder_date,
  f.expected_delivery_date,
  f.actual_delivery_date,
  f.priority,
  f.assigned_to,
  u.email as assignee_email,
  
  -- Identification des problèmes
  ARRAY_REMOVE(ARRAY[
    CASE WHEN f.bl_id IS NULL THEN 'Pas de BL associé' END,
    CASE WHEN f.assigned_to IS NULL THEN 'Pas d''assigné' END,
    CASE WHEN f.expected_delivery_date IS NOT NULL AND f.expected_delivery_date < CURRENT_DATE AND f.status NOT IN ('delivered', 'completed', 'cancelled') 
         THEN 'Livraison en retard' END,
    CASE WHEN f.folder_date < CURRENT_DATE - INTERVAL '30 days' AND f.status = 'draft' 
         THEN 'Brouillon ancien (>30j)' END,
    CASE WHEN f.folder_date < CURRENT_DATE - INTERVAL '60 days' AND f.status = 'active' 
         THEN 'Actif depuis longtemps (>60j)' END,
    CASE WHEN f.priority = 'critical' AND f.status IN ('draft', 'active') 
         THEN 'Priorité critique non traitée' END,
    CASE WHEN f.priority = 'urgent' AND f.folder_date < CURRENT_DATE - INTERVAL '7 days' AND f.status IN ('draft', 'active') 
         THEN 'Urgent en attente (>7j)' END,
    CASE WHEN f.estimated_value IS NULL 
         THEN 'Valeur non estimée' END
  ], NULL) as issues,
  
  -- Score de priorité (plus haut = plus urgent)
  (
    CASE f.priority 
      WHEN 'critical' THEN 100
      WHEN 'urgent' THEN 75
      WHEN 'normal' THEN 50
      WHEN 'low' THEN 25
      ELSE 0
    END +
    CASE WHEN f.bl_id IS NULL THEN 20 ELSE 0 END +
    CASE WHEN f.assigned_to IS NULL THEN 15 ELSE 0 END +
    CASE WHEN f.expected_delivery_date IS NOT NULL AND f.expected_delivery_date < CURRENT_DATE THEN 30 ELSE 0 END +
    CASE WHEN f.folder_date < CURRENT_DATE - INTERVAL '30 days' AND f.status = 'draft' THEN 25 ELSE 0 END +
    CASE WHEN f.folder_date < CURRENT_DATE - INTERVAL '60 days' AND f.status = 'active' THEN 35 ELSE 0 END
  ) as attention_score,
  
  -- Nombre de jours depuis création (correction: soustraction directe de dates)
  (CURRENT_DATE - f.folder_date)::integer as days_since_creation,
  
  -- Nombre de jours de retard pour livraison (correction: soustraction directe de dates)
  CASE 
    WHEN f.expected_delivery_date IS NOT NULL AND f.expected_delivery_date < CURRENT_DATE AND f.status NOT IN ('delivered', 'completed', 'cancelled')
    THEN (CURRENT_DATE - f.expected_delivery_date)::integer
    ELSE NULL
  END as days_overdue

FROM public.folders f
LEFT JOIN public.users u ON f.assigned_to = u.id
WHERE f.deleted_at IS NULL
  AND (
    f.bl_id IS NULL OR 
    f.assigned_to IS NULL OR
    (f.expected_delivery_date IS NOT NULL AND f.expected_delivery_date < CURRENT_DATE AND f.status NOT IN ('delivered', 'completed', 'cancelled')) OR
    (f.folder_date < CURRENT_DATE - INTERVAL '30 days' AND f.status = 'draft') OR
    (f.folder_date < CURRENT_DATE - INTERVAL '60 days' AND f.status = 'active') OR
    (f.priority IN ('critical', 'urgent') AND f.status IN ('draft', 'active')) OR
    f.estimated_value IS NULL
  )
ORDER BY attention_score DESC, f.folder_date ASC;

-- Permissions pour les vues corrigées
GRANT SELECT ON folder_stats_by_period TO authenticated;
GRANT SELECT ON folders_requiring_attention TO authenticated;

-- ============================================================================
-- Validation des corrections
-- ============================================================================

-- Vérifier que les colonnes existent maintenant
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'folders' 
        AND table_schema = 'public'
        AND column_name = 'deleted_at'
    ) THEN
        RAISE EXCEPTION 'Colonne deleted_at manquante dans la table folders';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'folders' 
        AND table_schema = 'public'
        AND column_name = 'deleted_by'
    ) THEN
        RAISE EXCEPTION 'Colonne deleted_by manquante dans la table folders';
    END IF;
    
    -- Message de succès
    RAISE NOTICE 'Corrections appliquées avec succès: index, colonnes soft delete et vues BL corrigées';
END $$;