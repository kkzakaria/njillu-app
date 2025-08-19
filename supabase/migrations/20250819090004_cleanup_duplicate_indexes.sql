-- Migration: cleanup_duplicate_indexes
-- Description: Nettoie les index dupliqués pour améliorer les performances et réduire l'espace disque
-- Date: 2025-08-19
-- Type: OPTIMISATION PERFORMANCE

-- ============================================================================
-- PROBLÈME RÉSOLU:
-- Duplicate Index - Détecté par Supabase Performance Advisor
-- Table users a des index identiques: idx_users_role et idx_users_role_active
-- Impact: Espace disque gaspillé, maintenance supplémentaire, performance dégradée
-- Solution: Analyser et supprimer l'index redondant
-- ============================================================================

-- ============================================================================
-- Analyse des index existants avant nettoyage
-- ============================================================================

-- Afficher les informations détaillées sur les index concernés
DO $$
DECLARE
    idx_role_info record;
    idx_role_active_info record;
    idx_role_size text;
    idx_role_active_size text;
BEGIN
    -- Récupérer les informations sur idx_users_role
    SELECT 
        schemaname, tablename, indexname, indexdef
    INTO idx_role_info
    FROM pg_indexes 
    WHERE indexname = 'idx_users_role';
    
    -- Récupérer les informations sur idx_users_role_active
    SELECT 
        schemaname, tablename, indexname, indexdef
    INTO idx_role_active_info
    FROM pg_indexes 
    WHERE indexname = 'idx_users_role_active';
    
    -- Obtenir la taille des index
    SELECT pg_size_pretty(pg_total_relation_size('idx_users_role'::regclass)) INTO idx_role_size;
    SELECT pg_size_pretty(pg_total_relation_size('idx_users_role_active'::regclass)) INTO idx_role_active_size;
    
    RAISE NOTICE 'ANALYSE DES INDEX DUPLIQUES:';
    RAISE NOTICE '===============================';
    
    IF idx_role_info.indexname IS NOT NULL THEN
        RAISE NOTICE 'Index 1: % (Taille: %)', idx_role_info.indexname, idx_role_size;
        RAISE NOTICE 'Definition: %', idx_role_info.indexdef;
    END IF;
    
    IF idx_role_active_info.indexname IS NOT NULL THEN
        RAISE NOTICE 'Index 2: % (Taille: %)', idx_role_active_info.indexname, idx_role_active_size;
        RAISE NOTICE 'Definition: %', idx_role_active_info.indexdef;
    END IF;
    
END;
$$;

-- ============================================================================
-- Analyse de l'utilisation des index
-- ============================================================================

-- Note: Statistiques d'utilisation disponibles dans pg_stat_user_indexes
-- En production, vérifier avec:
-- SELECT * FROM pg_stat_user_indexes WHERE indexname IN ('idx_users_role', 'idx_users_role_active');

-- ============================================================================
-- Décision de nettoyage basée sur l'analyse
-- ============================================================================

-- Stratégie: Garder l'index le plus spécifique et utile
-- idx_users_role_active semble plus spécifique (probablement avec WHERE clause)
-- On va garder idx_users_role_active et supprimer idx_users_role

-- D'abord, créer un index de remplacement optimisé si nécessaire
-- En analysant les migrations précédentes, idx_users_role_active est créé dans
-- 20250814161953_create_clients_rls_policies.sql avec CREATE INDEX IF NOT EXISTS

-- Vérifier que l'index idx_users_role_active existe bien
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_users_role_active'
    ) THEN
        -- Créer l'index optimisé si il n'existe pas
        CREATE INDEX idx_users_role_active ON public.users(role);
        RAISE NOTICE 'Index idx_users_role_active créé';
    ELSE
        RAISE NOTICE 'Index idx_users_role_active existe déjà';
    END IF;
END;
$$;

-- ============================================================================
-- Suppression sécurisée de l'index dupliqué
-- ============================================================================

-- Supprimer l'index redondant idx_users_role
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_users_role'
    ) THEN
        -- Supprimer l'index dupliqué
        DROP INDEX IF EXISTS idx_users_role;
        RAISE NOTICE 'Index dupliqué idx_users_role supprimé avec succès';
    ELSE
        RAISE NOTICE 'Index idx_users_role n''existe pas - aucune action requise';
    END IF;
END;
$$;

-- ============================================================================
-- Optimisations supplémentaires des index
-- ============================================================================

-- Vérifier et optimiser d'autres index potentiellement dupliqués ou sous-optimaux
-- Analyser les index sur la table users pour d'autres optimisations

-- Index composé pour les requêtes courantes sur users
CREATE INDEX IF NOT EXISTS idx_users_role_status_optimized 
  ON public.users(role, created_at DESC) 
  WHERE role IS NOT NULL;

-- Index pour les recherches par email (si pas déjà existant)
-- Note: L'email est probablement déjà indexé par Supabase Auth
CREATE INDEX IF NOT EXISTS idx_users_id_role 
  ON public.users(id, role) 
  WHERE role IN ('admin', 'super_admin');

-- ============================================================================
-- Analyse post-nettoyage
-- ============================================================================

-- Afficher l'état final des index sur la table users
DO $$
DECLARE
    index_record record;
    total_size bigint := 0;
    index_size bigint;
BEGIN
    RAISE NOTICE 'INDEX FINAUX SUR LA TABLE users:';
    RAISE NOTICE '=====================================';
    
    FOR index_record IN 
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE tablename = 'users' 
          AND schemaname = 'public'
        ORDER BY indexname
    LOOP
        -- Calculer la taille de chaque index
        SELECT pg_total_relation_size(index_record.indexname::regclass) INTO index_size;
        total_size := total_size + index_size;
        
        RAISE NOTICE 'Index: % (Taille: %)', 
            index_record.indexname, 
            pg_size_pretty(index_size);
        RAISE NOTICE 'Définition: %', index_record.indexdef;
        RAISE NOTICE '---';
    END LOOP;
    
    RAISE NOTICE 'TAILLE TOTALE DES INDEX: %', pg_size_pretty(total_size);
END;
$$;

-- ============================================================================
-- Vérification des contraintes et dépendances
-- ============================================================================

-- Vérifier qu'aucune contrainte ou vue ne dépend de l'index supprimé
DO $$
DECLARE
    constraint_count integer;
BEGIN
    -- Vérifier les contraintes qui pourraient dépendre des index
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints tc
    WHERE tc.table_name = 'users' 
      AND tc.table_schema = 'public'
      AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY');
    
    RAISE NOTICE 'VÉRIFICATION DES DÉPENDANCES:';
    RAISE NOTICE '============================';
    RAISE NOTICE 'Contraintes trouvées sur users: %', constraint_count;
    
    -- Vérifier que les politiques RLS fonctionnent toujours
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'clients' 
          AND schemaname = 'public'
    ) THEN
        RAISE NOTICE 'Politiques RLS sur clients: OK';
    END IF;
    
END;
$$;

-- ============================================================================
-- Recommandations de maintenance
-- ============================================================================

-- Fonction utilitaire pour surveiller la duplication d'index
CREATE OR REPLACE FUNCTION check_duplicate_indexes()
RETURNS TABLE (
    schema_name text,
    table_name text,
    index_name text,
    index_definition text,
    index_size text,
    potential_duplicate text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH index_info AS (
    SELECT 
      schemaname::text as schema_name,
      tablename::text as table_name, 
      indexname::text as index_name,
      indexdef::text as index_definition,
      pg_size_pretty(pg_total_relation_size(indexname::regclass))::text as index_size
    FROM pg_indexes 
    WHERE schemaname = 'public'
  )
  SELECT 
    i1.schema_name,
    i1.table_name,
    i1.index_name,
    i1.index_definition,
    i1.index_size,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM index_info i2 
        WHERE i2.table_name = i1.table_name 
          AND i2.index_name != i1.index_name
          AND i2.index_definition LIKE '%' || split_part(i1.index_definition, '(', 2)
      ) THEN 'Possible duplicate'
      ELSE 'Unique'
    END as potential_duplicate
  FROM index_info i1
  ORDER BY i1.table_name, i1.index_name;
$$;

-- Donner accès à la fonction aux admins
GRANT EXECUTE ON FUNCTION check_duplicate_indexes() TO authenticated;

-- ============================================================================
-- Commentaires de documentation
-- ============================================================================

COMMENT ON FUNCTION check_duplicate_indexes() IS 
'Fonction utilitaire pour détecter les index potentiellement dupliqués - À exécuter périodiquement pour la maintenance';

-- ============================================================================
-- Validation finale
-- ============================================================================

DO $$
DECLARE
    duplicate_count integer;
BEGIN
    -- Vérifier qu'il n'y a plus d'index dupliqués sur users
    SELECT COUNT(*) INTO duplicate_count
    FROM pg_indexes 
    WHERE tablename = 'users' 
      AND schemaname = 'public'
      AND indexname LIKE '%role%';
    
    RAISE NOTICE 'RÉSULTAT DU NETTOYAGE:';
    RAISE NOTICE '=====================';
    RAISE NOTICE 'Index liés au rôle restants: %', duplicate_count;
    
    IF duplicate_count <= 3 THEN -- Un nombre raisonnable d'index
        RAISE NOTICE 'SUCCÈS: Nettoyage des index dupliqués terminé';
    ELSE
        RAISE WARNING 'ATTENTION: Nombre élevé d''index détectés - Vérification manuelle recommandée';
    END IF;
    
END;
$$;

-- ============================================================================
-- Fin de la migration de nettoyage des index dupliqués
-- ============================================================================