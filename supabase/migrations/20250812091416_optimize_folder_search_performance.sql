-- Migration: optimize_folder_search_performance
-- Description: Optimisations de performance pour la recherche et gestion des listes de dossiers
-- Date: 2025-08-12
-- Objectif: Support de 10K+ dossiers avec recherche full-text performante

-- ============================================================================
-- EXTENSIONS REQUISES
-- ============================================================================

-- Activer pg_trgm pour la recherche trigram
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- ÉTAPE 1: Index Full-Text Search pour recherche rapide
-- ============================================================================

-- Index de recherche textuelle sur les champs principaux des dossiers
-- Optimisé pour la langue française
CREATE INDEX idx_folders_search_tsvector ON public.folders 
USING GIN(to_tsvector('french', 
  COALESCE(title, '') || ' ' || 
  COALESCE(description, '') || ' ' || 
  COALESCE(client_reference, '') || ' ' ||
  COALESCE(internal_notes, '') || ' ' ||
  COALESCE(client_notes, '')
)) 
WHERE deleted_at IS NULL;

-- ============================================================================
-- ÉTAPE 2: Index GIN pour recherches JSONB (si applicable dans le futur)
-- ============================================================================

-- Note: Les champs JSONB ne sont pas encore présents dans la structure actuelle
-- Ces index seront créés quand des champs JSON seront ajoutés

-- Préparation pour future extension avec métadonnées JSON
-- CREATE INDEX idx_folders_metadata_gin ON public.folders 
-- USING GIN(metadata) 
-- WHERE deleted_at IS NULL AND metadata IS NOT NULL;

-- ============================================================================
-- ÉTAPE 3: Index partiels spécialisés pour cas d'usage fréquents
-- ============================================================================

-- Index pour dossiers urgents et critiques (priorité haute)
CREATE INDEX idx_folders_high_priority ON public.folders 
(created_at DESC, status, assigned_to) 
WHERE priority IN ('urgent', 'critical') 
  AND deleted_at IS NULL;

-- Index pour dossiers sans BL (problématiques nécessitant attention)
CREATE INDEX idx_folders_missing_bl_attention ON public.folders 
(assigned_to, priority DESC, folder_date DESC) 
WHERE bl_id IS NULL 
  AND status NOT IN ('cancelled', 'completed') 
  AND deleted_at IS NULL;

-- Index pour workflow actif (dossiers en cours de traitement)
CREATE INDEX idx_folders_active_workflow ON public.folders 
(status, assigned_to, expected_delivery_date ASC NULLS LAST) 
WHERE status IN ('active', 'shipped') 
  AND deleted_at IS NULL;

-- Index pour recherche par référence client (exacte et partielle)
CREATE INDEX idx_folders_client_ref_trigram ON public.folders 
USING GIN(client_reference gin_trgm_ops)
WHERE client_reference IS NOT NULL 
  AND deleted_at IS NULL;

-- ============================================================================
-- ÉTAPE 4: Optimisations pour les jointures fréquentes
-- ============================================================================

-- Index composite pour jointures folders ↔ bills_of_lading optimisées
CREATE INDEX idx_folders_bl_join_optimized ON public.folders 
(bl_id, status, created_at DESC) 
WHERE bl_id IS NOT NULL 
  AND deleted_at IS NULL;

-- Index pour éviter les scans séquentiels sur bills_of_lading
CREATE INDEX idx_bl_folder_relation ON public.bills_of_lading 
(folder_id, status, created_at DESC) 
WHERE folder_id IS NOT NULL 
  AND deleted_at IS NULL;

-- ============================================================================
-- ÉTAPE 5: Fonctions de recherche optimisées
-- ============================================================================

-- Fonction de recherche full-text optimisée avec ranking
CREATE OR REPLACE FUNCTION search_folders_optimized(
  search_term TEXT DEFAULT '',
  transport_filter transport_type_enum DEFAULT NULL,
  status_filter folder_status_enum DEFAULT NULL,
  priority_filter VARCHAR DEFAULT NULL,
  assigned_to_filter UUID DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
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
SET search_path = public
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

-- Fonction pour comptage rapide avec mêmes filtres
CREATE OR REPLACE FUNCTION count_folders_optimized(
  search_term TEXT DEFAULT '',
  transport_filter transport_type_enum DEFAULT NULL,
  status_filter folder_status_enum DEFAULT NULL,
  priority_filter VARCHAR DEFAULT NULL,
  assigned_to_filter UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO result_count
  FROM public.folders f
  WHERE f.deleted_at IS NULL
    AND (
      search_term = '' OR
      to_tsvector('french', 
        COALESCE(f.title, '') || ' ' || 
        COALESCE(f.description, '') || ' ' || 
        COALESCE(f.client_reference, '')
      ) @@ plainto_tsquery('french', search_term)
    )
    AND (transport_filter IS NULL OR f.transport_type = transport_filter)
    AND (status_filter IS NULL OR f.status = status_filter)
    AND (priority_filter IS NULL OR f.priority = priority_filter)
    AND (assigned_to_filter IS NULL OR f.assigned_to = assigned_to_filter);
    
  RETURN result_count;
END;
$$;

-- ============================================================================
-- ÉTAPE 6: Permissions et accès
-- ============================================================================

-- Permissions pour les nouvelles fonctions
GRANT EXECUTE ON FUNCTION search_folders_optimized(TEXT, transport_type_enum, folder_status_enum, VARCHAR, UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION count_folders_optimized(TEXT, transport_type_enum, folder_status_enum, VARCHAR, UUID) TO authenticated;

-- ============================================================================
-- ÉTAPE 7: Commentaires de documentation
-- ============================================================================

COMMENT ON INDEX idx_folders_search_tsvector IS 'Index full-text search français pour recherche rapide dans title, description, client_reference, notes';
COMMENT ON INDEX idx_folders_high_priority IS 'Index partiel pour dossiers prioritaires (urgent, critical) - optimise les tableaux de bord';
COMMENT ON INDEX idx_folders_missing_bl_attention IS 'Index pour dossiers sans BL nécessitant attention - aide à identifier les problèmes';
COMMENT ON INDEX idx_folders_active_workflow IS 'Index pour dossiers en cours de traitement - optimise les vues workflow';
COMMENT ON INDEX idx_folders_client_ref_trigram IS 'Index trigram pour recherche partielle dans les références clients';

COMMENT ON FUNCTION search_folders_optimized(TEXT, transport_type_enum, folder_status_enum, VARCHAR, UUID, INTEGER, INTEGER) IS 'Fonction de recherche optimisée avec ranking et filtres multiples - support pagination';
COMMENT ON FUNCTION count_folders_optimized(TEXT, transport_type_enum, folder_status_enum, VARCHAR, UUID) IS 'Comptage rapide des résultats de recherche avec mêmes filtres que search_folders_optimized';

-- ============================================================================
-- STATISTIQUES ET VALIDATION
-- ============================================================================

-- Forcer la mise à jour des statistiques sur les nouvelles indexes
ANALYZE public.folders;
ANALYZE public.bills_of_lading;

-- Note: Pour valider les performances, utiliser EXPLAIN ANALYZE sur les requêtes
-- Exemple: EXPLAIN ANALYZE SELECT * FROM search_folders_optimized('test', NULL, NULL, NULL, NULL, 50, 0);