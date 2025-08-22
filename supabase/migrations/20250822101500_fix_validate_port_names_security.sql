-- Migration: Correction de sécurité pour validate_port_names
-- Date: 2025-08-22
-- Description: Fix "role mutable search_path" security warning

-- Supprimer et recréer la fonction avec pattern de sécurité strict
DROP FUNCTION IF EXISTS validate_port_names() CASCADE;

-- Recréer avec pattern de sécurité explicite
CREATE OR REPLACE FUNCTION validate_port_names()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public  -- Correction: search_path explicite et immutable
LANGUAGE plpgsql AS $$
BEGIN
    -- Validation basique des ports (peut être étendue avec une table de référence)
    IF NEW.port_of_loading IS NOT NULL AND LENGTH(TRIM(NEW.port_of_loading)) = 0 THEN
        RAISE EXCEPTION 'Port de chargement ne peut pas être vide';
    END IF;
    
    IF NEW.port_of_discharge IS NOT NULL AND LENGTH(TRIM(NEW.port_of_discharge)) = 0 THEN
        RAISE EXCEPTION 'Port de déchargement ne peut pas être vide';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Recréer le trigger
CREATE TRIGGER trigger_validate_ports 
    BEFORE INSERT OR UPDATE ON bills_of_lading
    FOR EACH ROW 
    EXECUTE FUNCTION validate_port_names();

-- Commentaire pour traçabilité
COMMENT ON FUNCTION validate_port_names() IS 'Validation des noms de ports - Sécurisé avec search_path immutable';