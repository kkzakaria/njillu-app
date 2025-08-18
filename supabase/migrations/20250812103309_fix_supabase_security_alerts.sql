-- Migration: fix_supabase_security_alerts
-- Description: Correction des 8 alertes de sécurité détectées par Supabase Security Advisor
-- Date: 2025-08-12
-- Objectif: Éliminer toutes les vulnérabilités de sécurité PostgreSQL

-- ============================================================================
-- PROBLÈMES IDENTIFIÉS PAR SUPABASE SECURITY ADVISOR
-- ============================================================================
--
-- 🚨 7 FONCTIONS AVEC SEARCH_PATH MUTABLE (CRITIQUE):
--   1. public.refresh_all_folder_materialized_views
--   2. public.get_folder_counters  
--   3. public.refresh_folder_views_if_needed
--   4. public.search_folders_optimized
--   5. public.count_folders_optimized
--   6. public.trigger_refresh_folder_views
--   7. public.get_folders_requiring_attention
--
-- ⚠️ 1 EXTENSION DANS SCHEMA PUBLIC:
--   8. Extension pg_trgm installée dans le schema public

-- ============================================================================
-- ÉTAPE 1: CRÉER SCHEMA POUR LES EXTENSIONS
-- ============================================================================

-- Créer un schema dédié pour les extensions système
CREATE SCHEMA IF NOT EXISTS extensions;

-- Donner les permissions appropriées
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- ============================================================================
-- ÉTAPE 2: DÉPLACER L'EXTENSION PG_TRGM VERS LE SCHEMA EXTENSIONS
-- ============================================================================

-- Déplacer pg_trgm vers le schema extensions
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Mettre à jour le search_path pour inclure extensions dans les fonctions qui utilisent pg_trgm
-- Note: Les index existants continuent de fonctionner même après déplacement de l'extension

-- ============================================================================
-- ÉTAPE 3: SÉCURISER TOUTES LES FONCTIONS AVEC SET search_path = ''
-- ============================================================================

-- NOTE IMPORTANTE SUR LA SÉCURITÉ:
-- SET search_path = '' (chaîne vide) est plus sécurisé que SET search_path = public
-- car cela force l'utilisation de noms complets (schema.table) et empêche 
-- les attaques par injection de schema

-- ----------------------------------------------------------------------------
-- 3.1: Corriger search_folders_optimized
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION search_folders_optimized(
  search_term TEXT DEFAULT '',
  transport_filter transport_type_enum DEFAULT NULL,
  status_filter folder_status_enum DEFAULT NULL,
  priority_filter varchar DEFAULT NULL,
  assigned_to_filter uuid DEFAULT NULL,
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  folder_number varchar,
  title varchar,
  status folder_status_enum,
  priority varchar,
  transport_type transport_type_enum,
  assigned_to uuid,
  created_at timestamptz,
  search_rank real
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.folder_number,
    f.title,
    f.status,
    f.priority,
    f.transport_type,
    f.assigned_to,
    f.created_at,
    CASE 
      WHEN search_term = '' THEN 1.0
      ELSE ts_rank(
        to_tsvector('french', 
          COALESCE(f.title, '') || ' ' || 
          COALESCE(f.description, '') || ' ' || 
          COALESCE(f.client_reference, '')
        ),
        plainto_tsquery('french', search_term)
      )
    END as search_rank
  FROM public.folders f
  WHERE f.deleted_at IS NULL
    -- Filtre de recherche textuelle
    AND (
      search_term = '' OR
      to_tsvector('french', 
        COALESCE(f.title, '') || ' ' || 
        COALESCE(f.description, '') || ' ' || 
        COALESCE(f.client_reference, '')
      ) @@ plainto_tsquery('french', search_term)
    )
    -- Filtres optionnels
    AND (transport_filter IS NULL OR f.transport_type = transport_filter)
    AND (status_filter IS NULL OR f.status = status_filter)
    AND (priority_filter IS NULL OR f.priority = priority_filter)
    AND (assigned_to_filter IS NULL OR f.assigned_to = assigned_to_filter)
  ORDER BY
    -- Priorité au ranking de recherche si terme fourni
    CASE WHEN search_term != '' THEN search_rank END DESC NULLS LAST,
    -- Sinon tri par date de création
    f.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3.2: Corriger count_folders_optimized  
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION count_folders_optimized(
  search_term TEXT DEFAULT '',
  transport_filter transport_type_enum DEFAULT NULL,
  status_filter folder_status_enum DEFAULT NULL,
  priority_filter varchar DEFAULT NULL,
  assigned_to_filter uuid DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  folder_count integer;
BEGIN
  SELECT COUNT(*)::integer INTO folder_count
  FROM public.folders f
  WHERE f.deleted_at IS NULL
    -- Filtre de recherche textuelle
    AND (
      search_term = '' OR
      to_tsvector('french', 
        COALESCE(f.title, '') || ' ' || 
        COALESCE(f.description, '') || ' ' || 
        COALESCE(f.client_reference, '')
      ) @@ plainto_tsquery('french', search_term)
    )
    -- Filtres optionnels
    AND (transport_filter IS NULL OR f.transport_type = transport_filter)
    AND (status_filter IS NULL OR f.status = status_filter)
    AND (priority_filter IS NULL OR f.priority = priority_filter)
    AND (assigned_to_filter IS NULL OR f.assigned_to = assigned_to_filter);
    
  RETURN folder_count;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3.3: Corriger get_folder_counters
-- ----------------------------------------------------------------------------

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
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.transport_type,
    f.status,
    f.priority,
    COUNT(*) as count,
    COALESCE(SUM(f.estimated_value), 0) as total_estimated_value,
    COUNT(*) FILTER (WHERE f.bl_id IS NOT NULL) as folders_with_bl,
    COUNT(*) FILTER (WHERE f.bl_id IS NULL) as folders_without_bl,
    COUNT(*) FILTER (WHERE f.assigned_to IS NOT NULL) as assigned_folders,
    COUNT(*) FILTER (WHERE f.assigned_to IS NULL) as unassigned_folders
  FROM public.folders f
  WHERE f.deleted_at IS NULL
    AND (transport_filter IS NULL OR f.transport_type = transport_filter)
    AND (status_filter IS NULL OR f.status = status_filter)
  GROUP BY f.transport_type, f.status, f.priority
  ORDER BY f.transport_type, f.status, f.priority;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3.4: Corriger get_folders_requiring_attention
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_folders_requiring_attention(
  assigned_to_filter uuid DEFAULT NULL,
  limit_count integer DEFAULT 20
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
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.folder_number,
    f.transport_type,
    f.status,
    f.priority,
    f.assigned_to,
    u.email::text as assigned_user_email,
    f.created_at,
    f.expected_delivery_date,
    f.estimated_value,
    (f.bl_id IS NULL) as missing_bl,
    (f.expected_delivery_date < CURRENT_DATE) as overdue,
    (f.priority IN ('urgent', 'critical')) as high_priority,
    (f.assigned_to IS NULL) as unassigned,
    (f.expected_delivery_date <= CURRENT_DATE + INTERVAL '3 days') as due_soon,
    (
      CASE WHEN f.bl_id IS NULL THEN 10 ELSE 0 END +
      CASE WHEN f.expected_delivery_date < CURRENT_DATE THEN 15 ELSE 0 END +
      CASE WHEN f.priority IN ('urgent', 'critical') THEN 8 ELSE 0 END +
      CASE WHEN f.assigned_to IS NULL THEN 5 ELSE 0 END +
      CASE WHEN f.expected_delivery_date <= CURRENT_DATE + INTERVAL '3 days' THEN 6 ELSE 0 END
    ) as attention_score
  FROM public.folders f
  LEFT JOIN public.users u ON u.id = f.assigned_to
  WHERE f.deleted_at IS NULL
    AND f.status NOT IN ('cancelled', 'completed')
    AND (assigned_to_filter IS NULL OR f.assigned_to = assigned_to_filter)
  ORDER BY attention_score DESC, f.created_at DESC
  LIMIT limit_count;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3.5: Corriger refresh_folder_views_if_needed
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION refresh_folder_views_if_needed()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  last_refresh timestamptz;
  current_time timestamptz := now();
BEGIN
  -- Vérifier la dernière actualisation (stockée dans une table de métadonnées si elle existe)
  -- Pour l'instant, rafraîchir toutes les 15 minutes
  
  -- Les vues matérialisées ont été déplacées vers le schéma privé
  -- Utiliser la fonction de rafraîchissement dédiée si elle existe
  IF EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'refresh_all_folder_materialized_views' AND routine_schema = 'public') THEN
    PERFORM public.refresh_all_folder_materialized_views();
  END IF;
  
  -- Log the refresh (si table de logs existe)
  -- INSERT INTO refresh_log (view_name, refreshed_at) VALUES ('folder_views', current_time);
END;
$$;

-- ----------------------------------------------------------------------------
-- 3.6: Corriger refresh_all_folder_materialized_views
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION refresh_all_folder_materialized_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Les vues matérialisées sont maintenant dans le schéma privé
  -- Utiliser la fonction de rafraîchissement appropriée si disponible
  IF EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = 'private') THEN
    -- Rafraîchir les vues privées si elles existent
    IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'private' AND table_name = 'folder_counters') THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY private.folder_counters;
    END IF;
    
    IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'private' AND table_name = 'folder_attention_required') THEN  
      REFRESH MATERIALIZED VIEW private.folder_attention_required;
    END IF;
  END IF;
  
  -- Log la réactualisation si nécessaire
  RAISE NOTICE 'Toutes les vues matérialisées des dossiers ont été rafraîchies à %', now();
END;
$$;

-- ----------------------------------------------------------------------------
-- 3.7: Corriger trigger_refresh_folder_views  
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION trigger_refresh_folder_views()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Déclencher un rafraîchissement des vues quand les dossiers changent
  -- Note: En production, il peut être préférable d'utiliser un système de queue
  -- pour éviter de bloquer les transactions
  
  -- Appeler seulement si la fonction existe (pour éviter les erreurs lors des migrations)
  BEGIN
    PERFORM public.refresh_folder_views_if_needed();
  EXCEPTION WHEN undefined_function THEN
    -- Ignorer si la fonction n'existe pas encore (pendant les migrations)
    NULL;
  END;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================================================
-- ÉTAPE 4: VÉRIFICATION ET COMMENTAIRES DE SÉCURITÉ  
-- ============================================================================

-- Ajouter des commentaires de sécurité pour documenter les corrections
COMMENT ON FUNCTION search_folders_optimized IS 'Fonction sécurisée avec SET search_path = '''' pour éviter les injections de schema';
COMMENT ON FUNCTION count_folders_optimized IS 'Fonction sécurisée avec SET search_path = '''' pour éviter les injections de schema';
COMMENT ON FUNCTION get_folder_counters IS 'Fonction sécurisée avec SET search_path = '''' pour éviter les injections de schema';
COMMENT ON FUNCTION get_folders_requiring_attention IS 'Fonction sécurisée avec SET search_path = '''' pour éviter les injections de schema';
COMMENT ON FUNCTION refresh_folder_views_if_needed IS 'Fonction sécurisée avec SET search_path = '''' pour éviter les injections de schema';
COMMENT ON FUNCTION refresh_all_folder_materialized_views IS 'Fonction sécurisée avec SET search_path = '''' pour éviter les injections de schema';
COMMENT ON FUNCTION trigger_refresh_folder_views IS 'Fonction sécurisée avec SET search_path = '''' pour éviter les injections de schema';

COMMENT ON SCHEMA extensions IS 'Schema dédié pour les extensions PostgreSQL (pg_trgm, etc.) - sépare des données utilisateur';

-- ============================================================================
-- RÉSUMÉ DES CORRECTIONS APPLIQUÉES
-- ============================================================================

-- ✅ 7 FONCTIONS CORRIGÉES:
--   - Toutes les fonctions SECURITY DEFINER utilisent maintenant SET search_path = ''
--   - Protection contre les attaques par injection de schema
--   - Noms de tables/schemas explicites (public.folders, etc.)

-- ✅ 1 EXTENSION DÉPLACÉE:
--   - pg_trgm déplacée du schema public vers schema extensions
--   - Séparation claire entre extensions système et données utilisateur
--   - Index existants continuent de fonctionner normalement

-- ✅ SÉCURITÉ RENFORCÉE:
--   - Conformité avec les meilleures pratiques PostgreSQL
--   - Protection contre les vulnérabilités de sécurité
--   - Documentation des mesures de sécurité appliquées

-- 🎯 RÉSULTAT ATTENDU: 0 alerte dans Supabase Security Advisor