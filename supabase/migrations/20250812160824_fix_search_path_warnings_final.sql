-- Migration: fix_search_path_warnings_final
-- Description: CORRECTIF FINAL - Éliminer les 3 avertissements Security Advisor sur search_path
-- Date: 2025-08-12
-- Problème: 3 fonctions ont search_path = 'public' au lieu de search_path = '' 
-- Security Advisor: "Function Search Path Mutable" - Requires search_path = '' (empty string)

-- ============================================================================
-- DIAGNOSTIC: 3 Avertissements Security Advisor identifiés
-- ============================================================================
-- 1. public.generate_folder_number       -> search_path = 'public' (doit être '')
-- 2. public.trigger_refresh_folder_views -> search_path = 'public' (doit être '')  
-- 3. public.set_folder_number            -> search_path = 'public' (doit être '')
--
-- STRATÉGIE: Changer search_path = '' + s'assurer que toutes les tables utilisent public.

-- ============================================================================
-- ÉTAPE 1: Corriger generate_folder_number
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_folder_number(
  p_transport_type transport_type_enum,
  p_folder_date date DEFAULT CURRENT_DATE
)
RETURNS varchar(15)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- 🎯 CORRECTION: '' au lieu de 'public'
AS $$
DECLARE
  v_year integer;
  v_date_part varchar(6);
  v_counter integer;
  v_folder_number varchar(15);
  v_max_retries integer DEFAULT 5;
  v_retry_count integer DEFAULT 0;
BEGIN
  -- Validation des paramètres d'entrée
  IF p_transport_type IS NULL THEN
    RAISE EXCEPTION 'Le type de transport ne peut pas être NULL';
  END IF;
  
  IF p_folder_date IS NULL THEN
    RAISE EXCEPTION 'La date du dossier ne peut pas être NULL';
  END IF;
  
  IF p_folder_date > CURRENT_DATE THEN
    RAISE EXCEPTION 'La date du dossier ne peut pas être dans le futur';
  END IF;
  
  -- Extraction de l'année et formatage de la date (YYMMDD)
  v_year := EXTRACT(YEAR FROM p_folder_date);
  v_date_part := TO_CHAR(p_folder_date, 'YYMMDD');
  
  -- Boucle de retry pour gérer la concurrence
  WHILE v_retry_count < v_max_retries LOOP
    BEGIN
      -- Tentative d'obtenir et incrémenter le compteur (avec verrou)
      INSERT INTO public.folder_counter (year, counter)  -- ✅ Préfixe explicite
      VALUES (v_year, 1)
      ON CONFLICT (year) DO UPDATE 
      SET 
        counter = public.folder_counter.counter + 1,  -- ✅ Préfixe explicite
        updated_at = now()
      RETURNING counter INTO v_counter;
      
      -- Formatage du numéro final: [MTA]YYMMDD-NNNNNN
      v_folder_number := p_transport_type::text || v_date_part || '-' || LPAD(v_counter::text, 6, '0');
      
      -- Vérification que le numéro n'existe pas déjà (double sécurité)
      IF EXISTS (SELECT 1 FROM public.folders WHERE folder_number = v_folder_number) THEN  -- ✅ Préfixe explicite
        -- Numéro déjà utilisé, retry avec le compteur suivant
        v_retry_count := v_retry_count + 1;
        IF v_retry_count >= v_max_retries THEN
          RAISE EXCEPTION 'Impossible de générer un numéro unique après % tentatives', v_max_retries;
        END IF;
        -- Petite pause avant retry (évite les conflits rapides)
        PERFORM pg_sleep(0.001 * v_retry_count);
        CONTINUE;
      END IF;
      
      -- Succès - sortir de la boucle
      EXIT;
      
    EXCEPTION
      WHEN OTHERS THEN
        v_retry_count := v_retry_count + 1;
        IF v_retry_count >= v_max_retries THEN
          RAISE EXCEPTION 'Erreur lors de la génération du numéro de dossier: %', SQLERRM;
        END IF;
        -- Pause exponentielle avant retry
        PERFORM pg_sleep(0.01 * POWER(2, v_retry_count));
    END;
  END LOOP;
  
  RETURN v_folder_number;
END;
$$;

-- ============================================================================
-- ÉTAPE 2: Corriger trigger_refresh_folder_views
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_refresh_folder_views()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- 🎯 CORRECTION: '' au lieu de 'public'
AS $$
BEGIN
  -- Déclencher un rafraîchissement des vues quand les dossiers changent
  -- Note: En production, il peut être préférable d'utiliser un système de queue
  -- pour éviter de bloquer les transactions
  
  -- La fonction refresh_folder_views_if_needed utilise déjà des vérifications internes
  -- et ne dépend pas du search_path car elle accède à information_schema
  PERFORM public.refresh_folder_views_if_needed();  -- ✅ Préfixe explicite
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================================================
-- ÉTAPE 3: Corriger set_folder_number
-- ============================================================================

CREATE OR REPLACE FUNCTION set_folder_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- 🎯 CORRECTION: '' au lieu de 'public'
AS $$
BEGIN
  -- Générer automatiquement le numéro de dossier si pas fourni
  IF NEW.folder_number IS NULL THEN
    -- Appel explicite avec préfixe public
    NEW.folder_number := public.generate_folder_number(NEW.transport_type, NEW.folder_date);  -- ✅ Préfixe explicite
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================================================
-- ÉTAPE 4: Test de validation complète
-- ============================================================================

-- Test que les 3 fonctions corrigées fonctionnent toujours
DO $$
DECLARE
  generated_number varchar(15);
  test_id uuid;
BEGIN
  RAISE NOTICE '🧪 TEST FINAL: Validation des 3 fonctions corrigées...';
  
  -- Test d'insertion complète (utilise set_folder_number -> generate_folder_number)
  BEGIN
    INSERT INTO public.folders (
      transport_type,
      folder_date,
      title,
      status,
      priority,
      client_reference
    ) VALUES (
      'A'::transport_type_enum,
      CURRENT_DATE,
      'Test Security Advisor Fix',
      'draft'::folder_status_enum,
      'urgent',
      'TEST-SECURITY-001'
    )
    RETURNING id, folder_number INTO test_id, generated_number;
    
    RAISE NOTICE '✅ SUCCÈS: Toutes les fonctions fonctionnent!';
    RAISE NOTICE '📋 folder_number généré: %', generated_number;
    
    -- Nettoyer le test
    DELETE FROM public.folders WHERE id = test_id;
    RAISE NOTICE '🧹 Test nettoyé';
    
    RAISE NOTICE '🎉 CORRECTIF SECURITY ADVISOR: TERMINÉ!';
    
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ ÉCHEC: %', SQLERRM;
      RAISE EXCEPTION 'Correctif Security Advisor échoué: %', SQLERRM;
  END;
  
END $$;

-- ============================================================================
-- ÉTAPE 5: Commentaires mis à jour
-- ============================================================================

COMMENT ON FUNCTION generate_folder_number(transport_type_enum, date) 
IS 'Fonction sécurisée avec SET search_path = '''' (vide) pour conformité Security Advisor - CORRIGÉE 2025-08-12';

COMMENT ON FUNCTION trigger_refresh_folder_views() 
IS 'Fonction sécurisée avec SET search_path = '''' (vide) pour conformité Security Advisor - CORRIGÉE 2025-08-12';

COMMENT ON FUNCTION set_folder_number() 
IS 'Fonction sécurisée avec SET search_path = '''' (vide) pour conformité Security Advisor - CORRIGÉE 2025-08-12';

-- ============================================================================
-- RÉSUMÉ DU CORRECTIF SECURITY ADVISOR
-- ============================================================================

-- ✅ AVANT: 3 avertissements "Function Search Path Mutable"
-- ✅ APRÈS: 0 avertissement (search_path = '' avec préfixes explicites)
-- ✅ FONCTIONNALITÉ: Préservée (toutes les fonctions utilisent public.*)
-- ✅ SÉCURITÉ: Maximale (conformité Security Advisor complète)
-- ✅ TESTS: Auto-génération validée intégralement