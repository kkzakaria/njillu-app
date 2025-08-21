-- Migration: Corriger les appels de fonctions avec search_path vide
-- Description: Correction des fonctions pour utiliser les préfixes de schéma explicites
-- Date: 2025-08-21

-- =====================================================================================
-- Corriger refresh_folder_views_if_needed pour utiliser les préfixes explicites
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.refresh_folder_views_if_needed()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  last_folder_update timestamptz;
  last_view_refresh timestamptz;
BEGIN
  -- Vérifier la dernière mise à jour des dossiers
  SELECT MAX(updated_at) INTO last_folder_update
  FROM public.folders
  WHERE deleted_at IS NULL;

  -- Vérifier la dernière mise à jour des statistiques de la vue privée
  SELECT MAX(newest_created_at) INTO last_view_refresh
  FROM private.folder_counters;

  -- Rafraîchir seulement si les données ont changé
  IF last_folder_update IS NULL OR last_view_refresh IS NULL OR last_folder_update > last_view_refresh THEN
    -- ✅ Utilisation du préfixe explicite public.
    PERFORM public.refresh_all_folder_materialized_views();
  END IF;
END;
$function$;

-- =====================================================================================
-- Corriger refresh_all_folder_materialized_views pour les vues dans private schema
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.refresh_all_folder_materialized_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Rafraîchir toutes les vues matérialisées dans l'ordre des dépendances
  -- Note: Les vues sont dans le schéma private
  
  -- 1. Vues de base (pas de dépendances)
  REFRESH MATERIALIZED VIEW CONCURRENTLY private.folder_counters;
  
  -- 2. Vues dépendantes des compteurs
  REFRESH MATERIALIZED VIEW CONCURRENTLY private.folder_attention_required;
  
  -- Log de l'opération pour le monitoring
  -- Note: Utilisation des préfixes explicites pour éviter les problèmes de search_path
  INSERT INTO private.folder_view_refresh_log (
    refreshed_at,
    views_refreshed,
    duration_ms
  ) VALUES (
    NOW(),
    ARRAY['folder_counters', 'folder_attention_required'],
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
-- Commentaires pour la documentation
-- =====================================================================================

COMMENT ON FUNCTION public.refresh_folder_views_if_needed() IS 
'Fonction de vérification conditionnelle pour le rafraîchissement des vues matérialisées. 
Utilise des préfixes de schéma explicites pour compatibilité avec search_path vide (sécurité).';

COMMENT ON FUNCTION public.refresh_all_folder_materialized_views() IS 
'Rafraîchit toutes les vues matérialisées des dossiers dans le schéma private de manière sécurisée. 
Utilisée par les triggers automatiques avec préfixes explicites pour éviter les problèmes de search_path.';

