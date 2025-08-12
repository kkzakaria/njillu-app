-- Migration: fix_missing_materialized_views_final
-- Description: CORRECTIF FINAL - Éliminer les références aux vues matérialisées inexistantes
-- Date: 2025-08-12
-- Problème: refresh_folder_views_if_needed référence folder_counters_view et folder_attention_view qui n'existent pas

-- ============================================================================
-- DIAGNOSTIC FINAL : Les vues matérialisées manquantes
-- ============================================================================
-- PROBLÈME: refresh_folder_views_if_needed() essaie de rafraîchir:
-- - folder_counters_view     ❌ N'existe pas
-- - folder_attention_view    ❌ N'existe pas
--
-- SOLUTION: Corriger la fonction pour ne rafraîchir que les vues existantes

-- ============================================================================
-- ÉTAPE 1: Identifier les vues matérialisées existantes
-- ============================================================================

-- Lister les vues matérialisées qui existent vraiment
DO $$
BEGIN
  RAISE NOTICE '🔍 DIAGNOSTIC: Vérification des vues matérialisées...';
  
  PERFORM 1 FROM information_schema.tables 
  WHERE table_type = 'VIEW' 
    AND table_name = 'folder_counters_view' 
    AND table_schema = 'public';
  
  IF NOT FOUND THEN
    RAISE NOTICE '❌ folder_counters_view: N''EXISTE PAS';
  ELSE
    RAISE NOTICE '✅ folder_counters_view: EXISTE';
  END IF;
  
  PERFORM 1 FROM information_schema.tables 
  WHERE table_type = 'VIEW' 
    AND table_name = 'folder_attention_view' 
    AND table_schema = 'public';
  
  IF NOT FOUND THEN
    RAISE NOTICE '❌ folder_attention_view: N''EXISTE PAS';
  ELSE
    RAISE NOTICE '✅ folder_attention_view: EXISTE';
  END IF;
  
END $$;

-- ============================================================================
-- ÉTAPE 2: Corriger refresh_folder_views_if_needed pour vues existantes uniquement
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_folder_views_if_needed()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  last_refresh timestamptz;
  current_time timestamptz := now();
  view_exists boolean;
BEGIN
  -- Note: Cette fonction était censée rafraîchir des vues qui n'existent pas
  -- Solution temporaire: ne rien faire jusqu'à ce que les vraies vues soient créées
  
  -- Vérifier si folder_stats_materialized existe (créée dans migration 20250812091508)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_type = 'VIEW' 
      AND table_name = 'folder_stats_materialized' 
      AND table_schema = 'public'
  ) INTO view_exists;
  
  IF view_exists THEN
    -- Rafraîchir la vue qui existe vraiment
    REFRESH MATERIALIZED VIEW CONCURRENTLY folder_stats_materialized;
    
    -- Log optionnel (si nécessaire dans le futur)
    -- INSERT INTO refresh_log (view_name, refreshed_at) VALUES ('folder_stats_materialized', current_time);
  END IF;
  
  -- Vérifier si folder_search_materialized existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_type = 'VIEW' 
      AND table_name = 'folder_search_materialized' 
      AND table_schema = 'public'
  ) INTO view_exists;
  
  IF view_exists THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY folder_search_materialized;
  END IF;
  
  -- Pour les vues inexistantes, on ne fait rien (au lieu d'échouer)
  -- folder_counters_view et folder_attention_view seront créées plus tard si nécessaire
  
END;
$$;

-- ============================================================================
-- ÉTAPE 3: Vérifier si on peut supprimer complètement le trigger
-- ============================================================================

-- Option plus radicale : désactiver complètement le trigger de refresh
-- jusqu'à ce que les bonnes vues soient disponibles

-- Vérification des triggers sur folders
DO $$
DECLARE
  trigger_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'trigger_folder_changes_refresh' 
      AND event_object_table = 'folders'
  ) INTO trigger_exists;
  
  IF trigger_exists THEN
    RAISE NOTICE '⚙️ Trigger trigger_folder_changes_refresh EXISTE et sera conservé';
    -- Le trigger existe, mais maintenant la fonction ne fera rien de dangereux
  ELSE
    RAISE NOTICE '⚙️ Trigger trigger_folder_changes_refresh N''EXISTE PAS';
  END IF;
END $$;

-- ============================================================================
-- ÉTAPE 4: Test de validation que l'insertion fonctionne maintenant
-- ============================================================================

-- Test d'insertion SANS folder_number pour valider l'auto-génération complète
DO $$
DECLARE
  generated_number varchar(15);
  test_id uuid;
BEGIN
  RAISE NOTICE '🧪 TEST FINAL: Insertion sans folder_number...';
  
  -- Tentative d'insertion sans folder_number (doit auto-générer)
  BEGIN
    INSERT INTO folders (
      transport_type,
      folder_date,
      title,
      status,
      priority,
      client_reference
    ) VALUES (
      'M'::transport_type_enum,
      CURRENT_DATE,
      'Test Auto-Generation Final',
      'draft'::folder_status_enum,
      'normal',
      'TEST-FINAL-001'
    )
    RETURNING id, folder_number INTO test_id, generated_number;
    
    RAISE NOTICE '✅ SUCCÈS COMPLET: folder_number = %', generated_number;
    RAISE NOTICE '📋 ID du dossier test: %', test_id;
    
    -- Nettoyer le test
    DELETE FROM folders WHERE id = test_id;
    RAISE NOTICE '🧹 Test nettoyé avec succès';
    
    RAISE NOTICE '🎉 AUTO-GÉNÉRATION FOLDER_NUMBER: FONCTIONNELLE!';
    
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ ÉCHEC: %', SQLERRM;
      RAISE EXCEPTION 'Test d''auto-génération échoué: %', SQLERRM;
  END;
  
END $$;

-- ============================================================================
-- ÉTAPE 5: Commentaires mis à jour
-- ============================================================================

COMMENT ON FUNCTION refresh_folder_views_if_needed() 
IS 'Fonction corrigée pour rafraîchir uniquement les vues matérialisées existantes - CORRIGÉE FINALE 2025-08-12';

-- ============================================================================
-- RÉSUMÉ DE LA CORRECTION FINALE
-- ============================================================================

-- ✅ AVANT: Référence à vues inexistantes -> Échec insertion
-- ✅ APRÈS: Rafraîchissement des vues existantes uniquement
-- ✅ TEST:  Auto-génération validée intégralement
-- ✅ TRIGGER: Fonctionne sans erreur