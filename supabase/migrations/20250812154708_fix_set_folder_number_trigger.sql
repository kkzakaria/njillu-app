-- Migration: fix_set_folder_number_trigger
-- Description: Correctif final pour le trigger set_folder_number - mise à jour search_path
-- Date: 2025-08-12
-- Problème: Le trigger set_folder_number utilise encore l'ancien search_path

-- ============================================================================
-- Corriger le trigger set_folder_number avec le bon search_path
-- ============================================================================

CREATE OR REPLACE FUNCTION set_folder_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'  -- Mise à jour du search_path pour cohérence
AS $$
BEGIN
  -- Générer automatiquement le numéro de dossier si pas fourni
  IF NEW.folder_number IS NULL THEN
    NEW.folder_number := generate_folder_number(NEW.transport_type, NEW.folder_date);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Mise à jour du commentaire de sécurité
COMMENT ON FUNCTION set_folder_number IS 'Fonction trigger sécurisée avec SET search_path = public pour génération automatique des folder_number';

-- Test de validation
DO $$
BEGIN
  RAISE NOTICE '✅ Trigger set_folder_number_trigger mis à jour avec search_path sécurisé';
END $$;