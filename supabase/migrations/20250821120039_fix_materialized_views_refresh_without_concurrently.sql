-- Migration: Corriger le rafraîchissement des vues matérialisées sans CONCURRENTLY
-- Description: Utiliser REFRESH MATERIALIZED VIEW normal au lieu de CONCURRENTLY pour éviter les erreurs
-- Date: 2025-08-21

-- =====================================================================================
-- Corriger refresh_all_folder_materialized_views pour ne pas utiliser CONCURRENTLY
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.refresh_all_folder_materialized_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Rafraîchir toutes les vues matérialisées dans l'ordre des dépendances
  -- Note: On n'utilise pas CONCURRENTLY car cela peut causer des problèmes 
  -- sur des vues nouvellement créées ou sans données
  
  -- 1. Vues de base (pas de dépendances)
  REFRESH MATERIALIZED VIEW private.folder_counters;
  
  -- 2. Vues dépendantes des compteurs  
  REFRESH MATERIALIZED VIEW private.folder_attention_required;
  
  -- 3. Autres vues si elles existent
  BEGIN
    REFRESH MATERIALIZED VIEW private.folder_user_metrics;
  EXCEPTION
    WHEN undefined_table THEN
      -- Vue n'existe pas, continuer
      NULL;
  END;
  
  BEGIN
    REFRESH MATERIALIZED VIEW private.folder_daily_analytics;
  EXCEPTION
    WHEN undefined_table THEN
      -- Vue n'existe pas, continuer
      NULL;
  END;
  
  -- Log de l'opération pour le monitoring
  -- Note: Utilisation des préfixes explicites pour éviter les problèmes de search_path
  INSERT INTO private.folder_view_refresh_log (
    refreshed_at,
    views_refreshed,
    duration_ms
  ) VALUES (
    NOW(),
    ARRAY['folder_counters', 'folder_attention_required', 'folder_user_metrics', 'folder_daily_analytics'],
    EXTRACT(EPOCH FROM (NOW() - NOW())) * 1000  -- Placeholder pour la durée
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur sans faire échouer la transaction principale
    INSERT INTO private.folder_view_refresh_errors (
      error_time,
      error_message,
      error_code
    ) VALUES (
      NOW(),
      SQLERRM,
      SQLSTATE
    );
    
    -- Re-lever l'erreur pour que l'appelant soit au courant
    RAISE;
END;
$function$;

-- =====================================================================================
-- Commentaire pour la documentation
-- =====================================================================================

COMMENT ON FUNCTION public.refresh_all_folder_materialized_views() IS 
'Rafraîchit toutes les vues matérialisées des dossiers dans le schéma private de manière sécurisée. 
Utilise REFRESH MATERIALIZED VIEW normal (sans CONCURRENTLY) pour éviter les problèmes avec les nouvelles vues.
Gère automatiquement les vues qui n''existent pas encore.';

