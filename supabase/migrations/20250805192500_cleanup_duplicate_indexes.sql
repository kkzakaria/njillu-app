-- Migration: cleanup_duplicate_indexes
-- Description: Nettoyage des 2 index dupliqués sur la table folders pour optimiser les performances
-- Date: 2025-08-05
--
-- PROBLÈME: La table folders a des index identiques qui consomment de l'espace et ralentissent les écritures
-- SOLUTION: Supprimer les index dupliqués en gardant le plus approprié

-- ============================================================================
-- PHASE 2.3: NETTOYAGE DES INDEX DUPLIQUÉS - TABLE FOLDERS
-- ============================================================================

-- Index dupliqués détectés:
-- 1. {idx_folders_active, idx_folders_not_deleted} - Index identiques sur deleted_at IS NULL
-- 2. {folders_folder_number_key, idx_folders_number} - Index identiques sur folder_number

-- Vérifier les index existants avant suppression
DO $$
BEGIN
    -- Log des index existants pour audit
    RAISE NOTICE 'Index existants sur la table folders:';
    
    -- Supprimer idx_folders_active (garder idx_folders_not_deleted qui est plus descriptif)
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_folders_active' 
        AND tablename = 'folders' 
        AND schemaname = 'public'
    ) THEN
        DROP INDEX public.idx_folders_active;
        RAISE NOTICE 'Index dupliqué supprimé: idx_folders_active';
    ELSE
        RAISE NOTICE 'Index idx_folders_active déjà absent';
    END IF;
    
    -- Supprimer idx_folders_number (garder folders_folder_number_key qui est la contrainte unique)
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_folders_number' 
        AND tablename = 'folders' 
        AND schemaname = 'public'
    ) THEN
        DROP INDEX public.idx_folders_number;
        RAISE NOTICE 'Index dupliqué supprimé: idx_folders_number';
    ELSE
        RAISE NOTICE 'Index idx_folders_number déjà absent';
    END IF;
    
    RAISE NOTICE 'Index restants après nettoyage:';
    RAISE NOTICE '- idx_folders_not_deleted (pour deleted_at IS NULL)';
    RAISE NOTICE '- folders_folder_number_key (contrainte unique sur folder_number)';
    
END $$;

-- ============================================================================
-- VALIDATION DES INDEX RESTANTS
-- ============================================================================

-- Vérifier que les index restants sont optimaux
-- Index pour les requêtes sur les dossiers actifs
CREATE INDEX IF NOT EXISTS idx_folders_not_deleted ON public.folders (deleted_at) WHERE deleted_at IS NULL;

-- Créer des index additionnels pour optimiser les requêtes courantes
CREATE INDEX IF NOT EXISTS idx_folders_created_by ON public.folders (created_by) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_folders_assigned_to ON public.folders (assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_folders_transport_type ON public.folders (transport_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_folders_created_at ON public.folders (created_at DESC) WHERE deleted_at IS NULL;

-- Index composite pour les requêtes de listing avec filtres
CREATE INDEX IF NOT EXISTS idx_folders_active_composite ON public.folders (transport_type, created_at DESC) 
WHERE deleted_at IS NULL;

-- ============================================================================
-- COMMENTAIRE FINAL
-- ============================================================================

COMMENT ON SCHEMA public IS 'Index dupliqués supprimés et index optimisés ajoutés - Phase 2.3 complète';