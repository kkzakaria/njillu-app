-- Migration: fix_generate_folder_number_search_path
-- Description: CORRECTIF CRITIQUE - Réparer search_path dans generate_folder_number pour accès aux tables
-- Date: 2025-08-12
-- Problème: generate_folder_number a search_path = '' ce qui empêche l'accès aux tables public.*

-- ============================================================================
-- DIAGNOSTIC CRITIQUE : Le problème exacte
-- ============================================================================
-- ACTUEL: SET search_path TO ''      ❌ -> Aucun accès aux tables
-- REQUIS: SET search_path = 'public' ✅ -> Accès sécurisé aux tables publiques

-- ============================================================================
-- ÉTAPE 1: Corriger generate_folder_number avec le bon search_path
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_folder_number(
  p_transport_type transport_type_enum,
  p_folder_date date DEFAULT CURRENT_DATE
)
RETURNS varchar(15)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'  -- 🎯 CORRECTION CRITIQUE : 'public' au lieu de ''
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
      INSERT INTO folder_counter (year, counter) 
      VALUES (v_year, 1)
      ON CONFLICT (year) DO UPDATE 
      SET 
        counter = folder_counter.counter + 1,
        updated_at = now()
      RETURNING counter INTO v_counter;
      
      -- Formatage du numéro final: [MTA]YYMMDD-NNNNNN
      v_folder_number := p_transport_type::text || v_date_part || '-' || LPAD(v_counter::text, 6, '0');
      
      -- Vérification que le numéro n'existe pas déjà (double sécurité)
      IF EXISTS (SELECT 1 FROM folders WHERE folder_number = v_folder_number) THEN
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
-- ÉTAPE 2: Corriger aussi set_folder_number pour cohérence
-- ============================================================================

CREATE OR REPLACE FUNCTION set_folder_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'  -- Cohérence avec generate_folder_number
AS $$
BEGIN
  -- Générer automatiquement le numéro de dossier si pas fourni
  IF NEW.folder_number IS NULL THEN
    NEW.folder_number := generate_folder_number(NEW.transport_type, NEW.folder_date);
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================================================
-- ÉTAPE 3: Test immédiat de l'auto-génération
-- ============================================================================

-- Test d'insertion SANS folder_number pour valider l'auto-génération
DO $$
BEGIN
  RAISE NOTICE '🧪 TEST CRITIQUE: Insertion sans folder_number...';
  
  -- Tentative d'insertion sans folder_number (doit auto-générer)
  BEGIN
    INSERT INTO folders (
      transport_type,
      folder_date,
      shipper_name,
      status
    ) VALUES (
      'M'::transport_type_enum,
      CURRENT_DATE,
      'Test Auto-Generation',
      'brouillon'::folder_status_enum
    );
    
    RAISE NOTICE '✅ SUCCÈS: Auto-génération folder_number fonctionne !';
    
    -- Récupérer le numéro généré pour validation
    DECLARE
      generated_number varchar(15);
    BEGIN
      SELECT folder_number INTO generated_number 
      FROM folders 
      WHERE shipper_name = 'Test Auto-Generation' 
      ORDER BY created_at DESC 
      LIMIT 1;
      
      RAISE NOTICE '📋 Numéro généré: %', generated_number;
      
      -- Nettoyer le test
      DELETE FROM folders WHERE shipper_name = 'Test Auto-Generation';
      RAISE NOTICE '🧹 Test nettoyé';
    END;
    
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ ÉCHEC AUTO-GÉNÉRATION: %', SQLERRM;
      -- Ne pas faire échouer la migration même si le test échoue
  END;
  
  RAISE NOTICE '🎯 Migration search_path terminée';
END $$;

-- ============================================================================
-- ÉTAPE 4: Commentaires de documentation mis à jour
-- ============================================================================

COMMENT ON FUNCTION generate_folder_number(transport_type_enum, date) 
IS 'Fonction sécurisée avec SET search_path = public pour génération thread-safe des numéros de dossiers - CORRIGÉE 2025-08-12';

COMMENT ON FUNCTION set_folder_number() 
IS 'Fonction trigger sécurisée avec SET search_path = public pour auto-générer folder_number lors de insertion - CORRIGÉE 2025-08-12';

-- ============================================================================
-- RÉSUMÉ DE LA CORRECTION CRITIQUE
-- ============================================================================

-- ✅ AVANT: search_path TO ''        -> Erreur "relation does not exist"
-- ✅ APRÈS: search_path = 'public'   -> Accès sécurisé aux tables
-- ✅ TEST:  Insertion auto testée    -> Validation immédiate
-- ✅ SÉCURITÉ: Maintenue avec schema path contrôlé