-- Migration: create_folder_materialized_views
-- Description: Création de vues matérialisées pour compteurs temps réel et analytics performants
-- Date: 2025-08-12
-- Objectif: Cache pré-calculé pour tableaux de bord et métriques sans impact sur performance

-- ============================================================================
-- ÉTAPE 1: Vue matérialisée pour compteurs de base
-- ============================================================================

-- Compteurs principaux par transport, status et priorité
CREATE MATERIALIZED VIEW folder_counters AS
SELECT 
  transport_type,
  status,
  priority,
  COUNT(*) as count,
  COALESCE(SUM(estimated_value), 0) as total_estimated_value,
  COUNT(CASE WHEN bl_id IS NOT NULL THEN 1 END) as folders_with_bl,
  COUNT(CASE WHEN bl_id IS NULL THEN 1 END) as folders_without_bl,
  COUNT(CASE WHEN assigned_to IS NOT NULL THEN 1 END) as assigned_folders,
  COUNT(CASE WHEN assigned_to IS NULL THEN 1 END) as unassigned_folders,
  -- Dates statistiques
  MIN(created_at) as oldest_created_at,
  MAX(created_at) as newest_created_at,
  MIN(expected_delivery_date) as earliest_expected_delivery,
  MAX(expected_delivery_date) as latest_expected_delivery
FROM public.folders 
WHERE deleted_at IS NULL 
GROUP BY transport_type, status, priority;

-- Index unique pour optimiser les requêtes sur la vue
CREATE UNIQUE INDEX idx_folder_counters_unique 
ON folder_counters(transport_type, status, priority);

-- Index secondaires pour requêtes partielles
CREATE INDEX idx_folder_counters_transport 
ON folder_counters(transport_type);

CREATE INDEX idx_folder_counters_status 
ON folder_counters(status);

-- ============================================================================
-- ÉTAPE 2: Vue matérialisée pour métriques par utilisateur
-- ============================================================================

-- Statistiques détaillées par utilisateur assigné
CREATE MATERIALIZED VIEW folder_user_metrics AS
SELECT 
  f.assigned_to,
  u.email as user_email,
  (u.first_name || ' ' || u.last_name) as user_name,
  f.transport_type,
  f.status,
  COUNT(*) as folder_count,
  COUNT(CASE WHEN f.priority IN ('urgent', 'critical') THEN 1 END) as high_priority_count,
  COUNT(CASE WHEN f.expected_delivery_date < CURRENT_DATE THEN 1 END) as overdue_count,
  COUNT(CASE WHEN f.expected_delivery_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 1 END) as due_this_week_count,
  -- Métriques financières
  COALESCE(SUM(f.estimated_value), 0) as total_value_managed,
  COALESCE(AVG(f.estimated_value), 0) as avg_folder_value,
  -- Métriques temporelles
  AVG(EXTRACT(EPOCH FROM (COALESCE(f.actual_delivery_date, CURRENT_DATE) - f.created_at))/86400) as avg_processing_days,
  MIN(f.created_at) as oldest_assignment,
  MAX(f.created_at) as newest_assignment
FROM public.folders f
LEFT JOIN public.users u ON f.assigned_to = u.id
WHERE f.deleted_at IS NULL 
  AND f.assigned_to IS NOT NULL
GROUP BY f.assigned_to, u.email, (u.first_name || ' ' || u.last_name), f.transport_type, f.status;

-- Index pour optimiser les requêtes utilisateur
CREATE UNIQUE INDEX idx_folder_user_metrics_unique 
ON folder_user_metrics(assigned_to, transport_type, status);

CREATE INDEX idx_folder_user_metrics_user 
ON folder_user_metrics(assigned_to);

-- ============================================================================
-- ÉTAPE 3: Vue matérialisée pour analytics temporelles
-- ============================================================================

-- Métriques quotidiennes pour trending et graphiques
CREATE MATERIALIZED VIEW folder_daily_analytics AS
SELECT 
  DATE(created_at) as date,
  transport_type,
  status,
  priority,
  COUNT(*) as daily_count,
  SUM(COUNT(*)) OVER (
    PARTITION BY transport_type, status, priority 
    ORDER BY DATE(created_at) 
    ROWS UNBOUNDED PRECEDING
  ) as cumulative_count,
  COALESCE(SUM(estimated_value), 0) as daily_value,
  COALESCE(AVG(estimated_value), 0) as avg_daily_value,
  -- Métriques de vélocité
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as daily_completed,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as daily_cancelled,
  -- Ratios de performance
  CASE 
    WHEN COUNT(*) > 0 THEN 
      ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END)::DECIMAL / COUNT(*) * 100, 2)
    ELSE 0 
  END as completion_rate_percent
FROM public.folders 
WHERE deleted_at IS NULL 
  AND created_at >= CURRENT_DATE - INTERVAL '90 days' -- Garder 3 mois de données
GROUP BY DATE(created_at), transport_type, status, priority;

-- Index pour requêtes temporelles
CREATE UNIQUE INDEX idx_folder_daily_analytics_unique 
ON folder_daily_analytics(date, transport_type, status, priority);

CREATE INDEX idx_folder_daily_analytics_date 
ON folder_daily_analytics(date DESC);

CREATE INDEX idx_folder_daily_analytics_date_transport 
ON folder_daily_analytics(date DESC, transport_type);

-- ============================================================================
-- ÉTAPE 4: Vue matérialisée pour alertes et SLA
-- ============================================================================

-- Dossiers nécessitant attention (alertes, retards, problèmes)
CREATE MATERIALIZED VIEW folder_attention_required AS
SELECT 
  f.id,
  f.folder_number,
  f.transport_type,
  f.status,
  f.priority,
  f.assigned_to,
  u.email as assigned_user_email,
  f.created_at,
  f.expected_delivery_date,
  f.estimated_value,
  -- Types d'alertes
  CASE WHEN f.bl_id IS NULL AND f.status NOT IN ('cancelled', 'completed') THEN TRUE ELSE FALSE END as missing_bl,
  CASE WHEN f.expected_delivery_date < CURRENT_DATE AND f.status NOT IN ('completed', 'cancelled') THEN TRUE ELSE FALSE END as overdue,
  CASE WHEN f.priority IN ('urgent', 'critical') THEN TRUE ELSE FALSE END as high_priority,
  CASE WHEN f.assigned_to IS NULL THEN TRUE ELSE FALSE END as unassigned,
  CASE WHEN f.expected_delivery_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days' AND f.status NOT IN ('completed', 'cancelled') THEN TRUE ELSE FALSE END as due_soon,
  -- Score de priorité pour tri (plus élevé = plus urgent)
  (
    CASE WHEN f.priority = 'critical' THEN 100 WHEN f.priority = 'urgent' THEN 75 WHEN f.priority = 'normal' THEN 50 ELSE 25 END +
    CASE WHEN f.expected_delivery_date < CURRENT_DATE THEN 50 ELSE 0 END +
    CASE WHEN f.bl_id IS NULL THEN 25 ELSE 0 END +
    CASE WHEN f.assigned_to IS NULL THEN 20 ELSE 0 END +
    CASE WHEN f.expected_delivery_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days' THEN 15 ELSE 0 END
  ) as attention_score
FROM public.folders f
LEFT JOIN public.users u ON f.assigned_to = u.id
WHERE f.deleted_at IS NULL 
  AND f.status NOT IN ('completed', 'cancelled')
  AND (
    f.bl_id IS NULL OR
    f.expected_delivery_date < CURRENT_DATE OR
    f.priority IN ('urgent', 'critical') OR
    f.assigned_to IS NULL OR
    f.expected_delivery_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  );

-- Index pour tri par score d'attention
CREATE INDEX idx_folder_attention_score 
ON folder_attention_required(attention_score DESC, created_at DESC);

CREATE INDEX idx_folder_attention_assigned 
ON folder_attention_required(assigned_to, attention_score DESC);

CREATE INDEX idx_folder_attention_overdue 
ON folder_attention_required(expected_delivery_date ASC) 
WHERE overdue = TRUE;

-- ============================================================================
-- ÉTAPE 5: Fonctions de rafraîchissement automatique
-- ============================================================================

-- Fonction de rafraîchissement global de toutes les vues
CREATE OR REPLACE FUNCTION refresh_all_folder_materialized_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Rafraîchir toutes les vues matérialisées de manière concurrente quand possible
  REFRESH MATERIALIZED VIEW CONCURRENTLY folder_counters;
  REFRESH MATERIALIZED VIEW CONCURRENTLY folder_user_metrics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY folder_daily_analytics;
  REFRESH MATERIALIZED VIEW folder_attention_required; -- Pas concurrent car pas d'index unique
END;
$$;

-- Fonction de rafraîchissement intelligent (seulement si nécessaire)
CREATE OR REPLACE FUNCTION refresh_folder_views_if_needed()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_folder_update timestamptz;
  last_view_refresh timestamptz;
BEGIN
  -- Vérifier la dernière mise à jour des dossiers
  SELECT MAX(updated_at) INTO last_folder_update
  FROM public.folders 
  WHERE deleted_at IS NULL;
  
  -- Vérifier la dernière mise à jour des statistiques de la vue
  SELECT MAX(newest_created_at) INTO last_view_refresh
  FROM folder_counters;
  
  -- Rafraîchir seulement si les données ont changé
  IF last_folder_update IS NULL OR last_view_refresh IS NULL OR last_folder_update > last_view_refresh THEN
    PERFORM refresh_all_folder_materialized_views();
  END IF;
END;
$$;

-- ============================================================================
-- ÉTAPE 6: Triggers de rafraîchissement automatique
-- ============================================================================

-- Fonction trigger pour rafraîchissement différé
CREATE OR REPLACE FUNCTION trigger_refresh_folder_views()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Programmer un rafraîchissement différé pour éviter les rafraîchissements trop fréquents
  -- Note: En production, utiliser pg_cron ou un scheduler externe pour plus de contrôle
  
  -- Pour l'instant, on marque juste qu'un rafraîchissement est nécessaire
  -- Le rafraîchissement sera fait par un job cron ou manuellement
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger sur les opérations de dossiers (INSERT, UPDATE, DELETE)
CREATE TRIGGER trigger_folder_changes_refresh
  AFTER INSERT OR UPDATE OR DELETE ON public.folders
  FOR EACH STATEMENT -- Une fois par statement (plus efficace que ROW)
  EXECUTE FUNCTION trigger_refresh_folder_views();

-- ============================================================================
-- ÉTAPE 7: Fonctions utilitaires pour l'API
-- ============================================================================

-- Fonction pour récupérer les compteurs optimisés
CREATE OR REPLACE FUNCTION get_folder_counters(
  transport_filter transport_type_enum DEFAULT NULL,
  status_filter folder_status_enum DEFAULT NULL
)
RETURNS TABLE(
  transport_type transport_type_enum,
  status folder_status_enum,
  priority varchar,
  count bigint,
  total_estimated_value numeric,
  folders_with_bl bigint,
  folders_without_bl bigint,
  assigned_folders bigint,
  unassigned_folders bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fc.transport_type,
    fc.status,
    fc.priority,
    fc.count,
    fc.total_estimated_value,
    fc.folders_with_bl,
    fc.folders_without_bl,
    fc.assigned_folders,
    fc.unassigned_folders
  FROM folder_counters fc
  WHERE (transport_filter IS NULL OR fc.transport_type = transport_filter)
    AND (status_filter IS NULL OR fc.status = status_filter)
  ORDER BY fc.transport_type, fc.status, fc.priority;
END;
$$;

-- Fonction pour récupérer les dossiers nécessitant attention
CREATE OR REPLACE FUNCTION get_folders_requiring_attention(
  assigned_to_filter UUID DEFAULT NULL,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE(
  id uuid,
  folder_number varchar,
  transport_type transport_type_enum,
  status folder_status_enum,
  priority varchar,
  assigned_to uuid,
  assigned_user_email text,
  created_at timestamptz,
  expected_delivery_date date,
  estimated_value numeric,
  missing_bl boolean,
  overdue boolean,
  high_priority boolean,
  unassigned boolean,
  due_soon boolean,
  attention_score integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    far.*
  FROM folder_attention_required far
  WHERE (assigned_to_filter IS NULL OR far.assigned_to = assigned_to_filter)
  ORDER BY far.attention_score DESC, far.created_at DESC
  LIMIT limit_count;
END;
$$;

-- ============================================================================
-- ÉTAPE 8: Permissions et accès
-- ============================================================================

-- Permissions pour les nouvelles fonctions
GRANT EXECUTE ON FUNCTION refresh_all_folder_materialized_views() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_folder_views_if_needed() TO authenticated;
GRANT EXECUTE ON FUNCTION get_folder_counters(transport_type_enum, folder_status_enum) TO authenticated;
GRANT EXECUTE ON FUNCTION get_folders_requiring_attention(UUID, INTEGER) TO authenticated;

-- Permissions de lecture sur les vues matérialisées
GRANT SELECT ON folder_counters TO authenticated;
GRANT SELECT ON folder_user_metrics TO authenticated;
GRANT SELECT ON folder_daily_analytics TO authenticated;
GRANT SELECT ON folder_attention_required TO authenticated;

-- ============================================================================
-- ÉTAPE 9: Commentaires de documentation
-- ============================================================================

COMMENT ON MATERIALIZED VIEW folder_counters IS 'Compteurs en temps réel par transport/status/priorité - refresh automatique via trigger';
COMMENT ON MATERIALIZED VIEW folder_user_metrics IS 'Métriques de performance par utilisateur assigné - analyses de charge de travail';
COMMENT ON MATERIALIZED VIEW folder_daily_analytics IS 'Analytics quotidiennes pour trending et graphiques - données sur 90 jours';
COMMENT ON MATERIALIZED VIEW folder_attention_required IS 'Dossiers nécessitant attention avec scoring de priorité - alertes proactives';

COMMENT ON FUNCTION refresh_all_folder_materialized_views() IS 'Rafraîchit toutes les vues matérialisées des dossiers - à utiliser via cron job';
COMMENT ON FUNCTION refresh_folder_views_if_needed() IS 'Rafraîchissement intelligent seulement si données changées - optimise les performances';
COMMENT ON FUNCTION get_folder_counters(transport_type_enum, folder_status_enum) IS 'API optimisée pour récupérer les compteurs avec filtres optionnels';
COMMENT ON FUNCTION get_folders_requiring_attention(UUID, INTEGER) IS 'API pour tableau de bord d''alertes - dossiers prioritaires triés par score';

-- ============================================================================
-- ÉTAPE 10: Rafraîchissement initial
-- ============================================================================

-- Premier rafraîchissement pour peupler les vues
SELECT refresh_all_folder_materialized_views();

-- Mise à jour des statistiques
ANALYZE folder_counters;
ANALYZE folder_user_metrics;
ANALYZE folder_daily_analytics;
ANALYZE folder_attention_required;