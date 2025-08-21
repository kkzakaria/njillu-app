-- Migration: Créer la fonction refresh_all_folder_materialized_views manquante
-- Description: Cette fonction rafraîchit toutes les vues matérialisées liées aux dossiers
-- Author: Claude Code
-- Date: 2025-08-21

-- =====================================================================================
-- Fonction pour rafraîchir toutes les vues matérialisées des dossiers
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.refresh_all_folder_materialized_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Rafraîchir toutes les vues matérialisées dans l'ordre des dépendances
  -- Note: L'ordre est important pour éviter les erreurs de dépendances
  
  -- 1. Vues de base (pas de dépendances)
  REFRESH MATERIALIZED VIEW CONCURRENTLY private.folder_counters;
  
  -- 2. Vues dépendantes des compteurs
  REFRESH MATERIALIZED VIEW CONCURRENTLY private.folder_attention_required;
  
  -- Log de l'opération pour le monitoring
  -- Note: Utilisation du préfixe explicite pour éviter les problèmes de search_path
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
-- Table de log pour les rafraîchissements des vues (optionnel)
-- =====================================================================================

-- Créer le schéma privé s'il n'existe pas
CREATE SCHEMA IF NOT EXISTS private;

-- Table pour logger les rafraîchissements
CREATE TABLE IF NOT EXISTS private.folder_view_refresh_log (
    id SERIAL PRIMARY KEY,
    refreshed_at TIMESTAMPTZ DEFAULT NOW(),
    views_refreshed TEXT[] NOT NULL,
    duration_ms NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour logger les erreurs
CREATE TABLE IF NOT EXISTS private.folder_view_refresh_errors (
    id SERIAL PRIMARY KEY,
    error_time TIMESTAMPTZ DEFAULT NOW(),
    error_message TEXT,
    error_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances sur les tables de log
CREATE INDEX IF NOT EXISTS idx_folder_view_refresh_log_refreshed_at 
ON private.folder_view_refresh_log (refreshed_at DESC);

CREATE INDEX IF NOT EXISTS idx_folder_view_refresh_errors_error_time 
ON private.folder_view_refresh_errors (error_time DESC);

-- =====================================================================================
-- Commentaires pour la documentation
-- =====================================================================================

COMMENT ON FUNCTION public.refresh_all_folder_materialized_views() IS 
'Rafraîchit toutes les vues matérialisées des dossiers de manière sécurisée et ordonnée. 
Utilisée par les triggers automatiques et peut être appelée manuellement pour forcer un rafraîchissement.';

COMMENT ON TABLE private.folder_view_refresh_log IS 
'Journal des rafraîchissements des vues matérialisées des dossiers pour le monitoring et le debug.';

COMMENT ON TABLE private.folder_view_refresh_errors IS 
'Journal des erreurs lors des rafraîchissements des vues matérialisées pour le debug.';

