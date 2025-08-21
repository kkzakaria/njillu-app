-- Migration: Update refresh_all_folder_materialized_views function
-- Description: Apply final corrections to materialized view refresh function
-- Date: 2025-08-21

-- =====================================================================================
-- Update refresh_all_folder_materialized_views with correct implementation
-- =====================================================================================

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.refresh_all_folder_materialized_views()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Rafraîchir toutes les vues matérialisées dans l'ordre des dépendances
  -- Note: On n'utilise pas CONCURRENTLY car cela peut causer des problèmes 
  
  -- 1. Vues de base (pas de dépendances)
  REFRESH MATERIALIZED VIEW private.folder_counters;
  
  -- 2. Vues dépendantes des compteurs  
  REFRESH MATERIALIZED VIEW private.folder_attention_required;
  
  -- 3. Autres vues si elles existent
  BEGIN
    REFRESH MATERIALIZED VIEW private.folder_user_metrics;
  EXCEPTION
    WHEN undefined_table THEN
      NULL;
  END;
  
  BEGIN
    REFRESH MATERIALIZED VIEW private.folder_daily_analytics;
  EXCEPTION
    WHEN undefined_table THEN
      NULL;
  END;
  
  -- Log de l'opération pour le monitoring
  INSERT INTO private.folder_view_refresh_log (
    refreshed_at,
    views_refreshed,
    duration_ms
  ) VALUES (
    NOW(),
    ARRAY['folder_counters', 'folder_attention_required'],
    0  -- Pas de calcul de durée pour simplifier
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur
    INSERT INTO private.folder_view_refresh_errors (
      error_time,
      error_message,
      error_code
    ) VALUES (
      NOW(),
      SQLERRM,
      SQLSTATE
    );
    RAISE;
END;
$function$;

-- =====================================================================================
-- Commentaire pour la documentation
-- =====================================================================================

COMMENT ON FUNCTION public.refresh_all_folder_materialized_views() IS 
'Fonction finale pour rafraîchir les vues matérialisées sans CONCURRENTLY et avec gestion d''erreurs simplifiée. Utilisée par l''API Stats et les triggers automatiques.';