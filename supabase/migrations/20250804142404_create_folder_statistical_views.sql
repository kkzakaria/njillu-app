-- Migration: create_folder_statistical_views
-- Description: Vues statistiques pour le système de dossiers et reporting business
-- Date: 2025-08-04

-- ============================================================================
-- Vues statistiques pour le reporting business
-- ============================================================================

-- Vue principale des statistiques par type de transport
CREATE VIEW folder_stats_by_transport AS
SELECT 
  transport_type,
  CASE transport_type
    WHEN 'M' THEN 'Maritime'
    WHEN 'T' THEN 'Terrestre'
    WHEN 'A' THEN 'Aérien'
  END as transport_type_label,
  
  -- Compteurs globaux
  COUNT(*) as total_folders,
  COUNT(*) FILTER (WHERE deleted_at IS NULL) as active_folders,
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted_folders,
  
  -- Compteurs par statut (seulement les dossiers actifs)
  COUNT(*) FILTER (WHERE status = 'draft' AND deleted_at IS NULL) as draft_count,
  COUNT(*) FILTER (WHERE status = 'active' AND deleted_at IS NULL) as active_count,
  COUNT(*) FILTER (WHERE status = 'shipped' AND deleted_at IS NULL) as shipped_count,
  COUNT(*) FILTER (WHERE status = 'delivered' AND deleted_at IS NULL) as delivered_count,
  COUNT(*) FILTER (WHERE status = 'completed' AND deleted_at IS NULL) as completed_count,
  COUNT(*) FILTER (WHERE status = 'cancelled' AND deleted_at IS NULL) as cancelled_count,
  COUNT(*) FILTER (WHERE status = 'archived' AND deleted_at IS NULL) as archived_count,
  
  -- Relation avec BL
  COUNT(*) FILTER (WHERE bl_id IS NOT NULL AND deleted_at IS NULL) as folders_with_bl,
  COUNT(*) FILTER (WHERE bl_id IS NULL AND deleted_at IS NULL) as folders_without_bl,
  
  -- Valeurs estimées (seulement les dossiers actifs)
  SUM(estimated_value) FILTER (WHERE deleted_at IS NULL) as total_estimated_value,
  AVG(estimated_value) FILTER (WHERE estimated_value IS NOT NULL AND deleted_at IS NULL) as avg_estimated_value,
  MIN(estimated_value) FILTER (WHERE estimated_value IS NOT NULL AND deleted_at IS NULL) as min_estimated_value,
  MAX(estimated_value) FILTER (WHERE estimated_value IS NOT NULL AND deleted_at IS NULL) as max_estimated_value,
  
  -- Dates et temporalité
  MIN(folder_date) FILTER (WHERE deleted_at IS NULL) as first_folder_date,
  MAX(folder_date) FILTER (WHERE deleted_at IS NULL) as last_folder_date,
  COUNT(*) FILTER (WHERE folder_date >= CURRENT_DATE - INTERVAL '30 days' AND deleted_at IS NULL) as folders_last_30_days,
  COUNT(*) FILTER (WHERE folder_date >= CURRENT_DATE - INTERVAL '7 days' AND deleted_at IS NULL) as folders_last_7_days,
  COUNT(*) FILTER (WHERE folder_date = CURRENT_DATE AND deleted_at IS NULL) as folders_today,
  
  -- Pourcentages
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE deleted_at IS NULL) / 
    GREATEST(COUNT(*), 1), 2
  ) as active_percentage,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE bl_id IS NOT NULL AND deleted_at IS NULL) / 
    GREATEST(COUNT(*) FILTER (WHERE deleted_at IS NULL), 1), 2
  ) as bl_link_percentage

FROM public.folders
GROUP BY transport_type
ORDER BY transport_type;

-- Vue des statistiques temporelles (par mois et année)
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

-- Vue des performances par assigné (utilisateur responsable)
CREATE VIEW folder_stats_by_assignee AS
SELECT 
  f.assigned_to,
  u.email as assignee_email,
  u.first_name || ' ' || u.last_name as assignee_name,
  
  -- Compteurs globaux
  COUNT(*) as total_assigned_folders,
  COUNT(*) FILTER (WHERE f.deleted_at IS NULL) as active_assigned_folders,
  
  -- Par statut
  COUNT(*) FILTER (WHERE f.status = 'draft' AND f.deleted_at IS NULL) as draft_count,
  COUNT(*) FILTER (WHERE f.status = 'active' AND f.deleted_at IS NULL) as active_count,
  COUNT(*) FILTER (WHERE f.status = 'shipped' AND f.deleted_at IS NULL) as shipped_count,
  COUNT(*) FILTER (WHERE f.status = 'delivered' AND f.deleted_at IS NULL) as delivered_count,
  COUNT(*) FILTER (WHERE f.status = 'completed' AND f.deleted_at IS NULL) as completed_count,
  COUNT(*) FILTER (WHERE f.status = 'cancelled' AND f.deleted_at IS NULL) as cancelled_count,
  
  -- Par type de transport
  COUNT(*) FILTER (WHERE f.transport_type = 'M' AND f.deleted_at IS NULL) as maritime_count,
  COUNT(*) FILTER (WHERE f.transport_type = 'T' AND f.deleted_at IS NULL) as terrestre_count,
  COUNT(*) FILTER (WHERE f.transport_type = 'A' AND f.deleted_at IS NULL) as aerien_count,
  
  -- Valeurs business gérées
  SUM(f.estimated_value) FILTER (WHERE f.deleted_at IS NULL) as total_managed_value,
  AVG(f.estimated_value) FILTER (WHERE f.estimated_value IS NOT NULL AND f.deleted_at IS NULL) as avg_managed_value,
  
  -- Métriques de performance
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE f.status = 'completed' AND f.deleted_at IS NULL) / 
    GREATEST(COUNT(*) FILTER (WHERE f.deleted_at IS NULL), 1), 2
  ) as completion_rate,
  
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE f.status = 'cancelled' AND f.deleted_at IS NULL) / 
    GREATEST(COUNT(*) FILTER (WHERE f.deleted_at IS NULL), 1), 2
  ) as cancellation_rate,
  
  -- Temporalité
  COUNT(*) FILTER (WHERE f.folder_date >= CURRENT_DATE - INTERVAL '30 days' AND f.deleted_at IS NULL) as folders_last_30_days,
  MIN(f.folder_date) FILTER (WHERE f.deleted_at IS NULL) as first_folder_date,
  MAX(f.folder_date) FILTER (WHERE f.deleted_at IS NULL) as last_folder_date

FROM public.folders f
LEFT JOIN public.users u ON f.assigned_to = u.id
WHERE f.assigned_to IS NOT NULL
GROUP BY f.assigned_to, u.email, u.first_name, u.last_name
ORDER BY total_assigned_folders DESC;

-- Vue du tableau de bord exécutif (KPI principaux)
CREATE VIEW executive_dashboard AS
SELECT 
  -- Métriques globales
  (SELECT COUNT(*) FROM public.folders WHERE deleted_at IS NULL) as total_active_folders,
  (SELECT COUNT(*) FROM public.folders WHERE deleted_at IS NOT NULL) as total_deleted_folders,
  (SELECT COUNT(*) FROM public.bills_of_lading WHERE deleted_at IS NULL) as total_active_bl,
  
  -- Métriques de croissance
  (SELECT COUNT(*) FROM public.folders WHERE folder_date >= CURRENT_DATE - INTERVAL '30 days' AND deleted_at IS NULL) as folders_last_30_days,
  (SELECT COUNT(*) FROM public.folders WHERE folder_date >= CURRENT_DATE - INTERVAL '7 days' AND deleted_at IS NULL) as folders_last_7_days,
  (SELECT COUNT(*) FROM public.folders WHERE folder_date = CURRENT_DATE AND deleted_at IS NULL) as folders_today,
  
  -- Répartition par transport
  (SELECT COUNT(*) FROM public.folders WHERE transport_type = 'M' AND deleted_at IS NULL) as maritime_folders,
  (SELECT COUNT(*) FROM public.folders WHERE transport_type = 'T' AND deleted_at IS NULL) as terrestre_folders,
  (SELECT COUNT(*) FROM public.folders WHERE transport_type = 'A' AND deleted_at IS NULL) as aerien_folders,
  
  -- Statuts critiques
  (SELECT COUNT(*) FROM public.folders WHERE status = 'active' AND deleted_at IS NULL) as active_in_progress,
  (SELECT COUNT(*) FROM public.folders WHERE status = 'shipped' AND deleted_at IS NULL) as currently_shipped,
  (SELECT COUNT(*) FROM public.folders WHERE status = 'completed' AND deleted_at IS NULL) as completed_folders,
  (SELECT COUNT(*) FROM public.folders WHERE status = 'cancelled' AND deleted_at IS NULL) as cancelled_folders,
  
  -- Relation avec BL
  (SELECT COUNT(*) FROM public.folders WHERE bl_id IS NOT NULL AND deleted_at IS NULL) as folders_with_bl,
  (SELECT COUNT(*) FROM public.folders WHERE bl_id IS NULL AND deleted_at IS NULL) as folders_without_bl,
  (SELECT COUNT(*) FROM public.bills_of_lading WHERE folder_id IS NULL AND deleted_at IS NULL) as bl_without_folder,
  
  -- Valeurs business
  (SELECT COALESCE(SUM(estimated_value), 0) FROM public.folders WHERE deleted_at IS NULL) as total_portfolio_value,
  (SELECT COALESCE(AVG(estimated_value), 0) FROM public.folders WHERE estimated_value IS NOT NULL AND deleted_at IS NULL) as avg_folder_value,
  (SELECT COALESCE(SUM(estimated_value), 0) FROM public.folders WHERE status = 'completed' AND deleted_at IS NULL) as completed_portfolio_value,
  
  -- Taux de performance globaux
  ROUND(
    100.0 * (SELECT COUNT(*) FROM public.folders WHERE status = 'completed' AND deleted_at IS NULL) / 
    GREATEST((SELECT COUNT(*) FROM public.folders WHERE deleted_at IS NULL), 1), 2
  ) as global_completion_rate,
  
  ROUND(
    100.0 * (SELECT COUNT(*) FROM public.folders WHERE bl_id IS NOT NULL AND deleted_at IS NULL) / 
    GREATEST((SELECT COUNT(*) FROM public.folders WHERE deleted_at IS NULL), 1), 2
  ) as bl_link_rate,
  
  -- Compteurs de l'année courante vs précédente
  (SELECT COUNT(*) FROM public.folders 
   WHERE EXTRACT(YEAR FROM folder_date) = EXTRACT(YEAR FROM CURRENT_DATE) AND deleted_at IS NULL) as current_year_folders,
  (SELECT COUNT(*) FROM public.folders 
   WHERE EXTRACT(YEAR FROM folder_date) = EXTRACT(YEAR FROM CURRENT_DATE) - 1 AND deleted_at IS NULL) as previous_year_folders,
  
  -- Croissance année sur année
  ROUND(
    CASE 
      WHEN (SELECT COUNT(*) FROM public.folders 
            WHERE EXTRACT(YEAR FROM folder_date) = EXTRACT(YEAR FROM CURRENT_DATE) - 1 AND deleted_at IS NULL) > 0 THEN
        100.0 * (
          (SELECT COUNT(*) FROM public.folders 
           WHERE EXTRACT(YEAR FROM folder_date) = EXTRACT(YEAR FROM CURRENT_DATE) AND deleted_at IS NULL) -
          (SELECT COUNT(*) FROM public.folders 
           WHERE EXTRACT(YEAR FROM folder_date) = EXTRACT(YEAR FROM CURRENT_DATE) - 1 AND deleted_at IS NULL)
        ) / (SELECT COUNT(*) FROM public.folders 
             WHERE EXTRACT(YEAR FROM folder_date) = EXTRACT(YEAR FROM CURRENT_DATE) - 1 AND deleted_at IS NULL)
      ELSE 0
    END, 2
  ) as year_over_year_growth;

-- Vue des dossiers nécessitant attention (alertes business)
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

-- ============================================================================
-- Fonctions pour les statistiques avancées
-- ============================================================================

-- Fonction pour obtenir les statistiques détaillées d'une période
CREATE OR REPLACE FUNCTION get_period_statistics(
  p_start_date date,
  p_end_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  period_label text,
  total_folders bigint,
  maritime_count bigint,
  terrestre_count bigint,
  aerien_count bigint,
  completed_count bigint,
  cancelled_count bigint,
  total_estimated_value numeric,
  avg_estimated_value numeric,
  completion_rate numeric,
  cancellation_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validation des dates
  IF p_start_date IS NULL OR p_end_date IS NULL THEN
    RAISE EXCEPTION 'Les dates de début et fin ne peuvent pas être NULL';
  END IF;
  
  IF p_start_date > p_end_date THEN
    RAISE EXCEPTION 'La date de début ne peut pas être postérieure à la date de fin';
  END IF;
  
  RETURN QUERY
  SELECT 
    p_start_date::text || ' à ' || p_end_date::text as period_label,
    COUNT(*) as total_folders,
    COUNT(*) FILTER (WHERE f.transport_type = 'M') as maritime_count,
    COUNT(*) FILTER (WHERE f.transport_type = 'T') as terrestre_count,
    COUNT(*) FILTER (WHERE f.transport_type = 'A') as aerien_count,
    COUNT(*) FILTER (WHERE f.status = 'completed') as completed_count,
    COUNT(*) FILTER (WHERE f.status = 'cancelled') as cancelled_count,
    COALESCE(SUM(f.estimated_value), 0) as total_estimated_value,
    COALESCE(AVG(f.estimated_value), 0) as avg_estimated_value,
    ROUND(
      100.0 * COUNT(*) FILTER (WHERE f.status = 'completed') / 
      GREATEST(COUNT(*), 1), 2
    ) as completion_rate,
    ROUND(
      100.0 * COUNT(*) FILTER (WHERE f.status = 'cancelled') / 
      GREATEST(COUNT(*), 1), 2
    ) as cancellation_rate
  FROM public.folders f
  WHERE f.folder_date >= p_start_date 
    AND f.folder_date <= p_end_date
    AND f.deleted_at IS NULL;
END;
$$;

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON VIEW folder_stats_by_transport IS 'Statistiques détaillées par type de transport (Maritime, Terrestre, Aérien)';
COMMENT ON VIEW folder_stats_by_period IS 'Statistiques temporelles par mois et année pour analyser les tendances';
COMMENT ON VIEW folder_stats_by_assignee IS 'Performance et charge de travail par utilisateur assigné';
COMMENT ON VIEW executive_dashboard IS 'Tableau de bord exécutif avec KPI principaux et métriques de croissance';
COMMENT ON VIEW folders_requiring_attention IS 'Dossiers nécessitant attention avec score de priorité et identification des problèmes';

COMMENT ON FUNCTION get_period_statistics(date, date) IS 'Statistiques détaillées pour une période donnée avec calcul des taux';

-- ============================================================================
-- Permissions pour les vues statistiques
-- ============================================================================

-- Toutes les vues statistiques sont accessibles aux utilisateurs authentifiés
GRANT SELECT ON folder_stats_by_transport TO authenticated;
GRANT SELECT ON folder_stats_by_period TO authenticated;
GRANT SELECT ON folder_stats_by_assignee TO authenticated;
GRANT SELECT ON executive_dashboard TO authenticated;
GRANT SELECT ON folders_requiring_attention TO authenticated;

-- Fonction de statistiques accessible aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION get_period_statistics(date, date) TO authenticated;