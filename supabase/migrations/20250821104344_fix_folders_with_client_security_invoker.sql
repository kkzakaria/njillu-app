-- Migration: fix_folders_with_client_security_invoker
-- Description: Correction de la sécurité de la vue folders_with_client avec security_invoker=on
-- Date: 2025-08-21
-- Type: CORRECTION DE SÉCURITÉ

-- ============================================================================
-- PROBLÈME IDENTIFIÉ:
-- La vue folders_with_client utilise SECURITY DEFINER par défaut,
-- lui donnant les privilèges de son créateur (postgres) au lieu de 
-- l'utilisateur qui fait la requête.
-- ============================================================================

-- ============================================================================
-- SOLUTION:
-- Recréer la vue avec security_invoker=on pour qu'elle utilise 
-- les privilèges de l'utilisateur qui fait la requête
-- ============================================================================

-- 1. Supprimer la vue existante
DROP VIEW IF EXISTS folders_with_client;

-- 2. Recréer la vue avec security_invoker=on
CREATE VIEW folders_with_client
WITH (security_invoker=on)
AS
SELECT 
    f.*,
    c.client_type,
    c.email as client_email,
    c.phone as client_phone,
    CASE 
        WHEN c.client_type = 'business' THEN c.company_name
        ELSE CONCAT(c.first_name, ' ', c.last_name)
    END as client_name,
    c.country as client_country,
    c.preferred_language as client_language
FROM folders f
LEFT JOIN clients c ON f.client_id = c.id
WHERE f.deleted_at IS NULL;

-- 3. Ajouter un commentaire pour documenter la sécurité
COMMENT ON VIEW folders_with_client IS 'Vue des dossiers avec informations client - Utilise security_invoker=on pour la sécurité';

-- 4. Accorder les permissions appropriées
GRANT SELECT ON folders_with_client TO authenticated;

-- ============================================================================
-- VALIDATION: Vérifier que la vue utilise maintenant security_invoker
-- ============================================================================

DO $$
DECLARE
    view_options text[];
BEGIN
    SELECT c.reloptions INTO view_options
    FROM pg_class c
    WHERE c.relname = 'folders_with_client' 
        AND c.relkind = 'v';
    
    IF 'security_invoker=on' = ANY(view_options) THEN
        RAISE NOTICE '✅ Vue folders_with_client configurée avec security_invoker=on';
    ELSE
        RAISE WARNING '⚠️ La vue folders_with_client ne semble pas avoir security_invoker=on';
    END IF;
END;
$$;

-- ============================================================================
-- IMPACT: 
-- - La vue hérite maintenant des permissions de l'utilisateur qui fait la requête
-- - Respect des politiques RLS des tables sous-jacentes (folders, clients)
-- - Élimination du risque de privilège escalation
-- - Conformité aux bonnes pratiques de sécurité Supabase
-- ============================================================================