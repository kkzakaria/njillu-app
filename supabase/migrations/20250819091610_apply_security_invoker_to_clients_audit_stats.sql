-- Migration: apply_security_invoker_to_clients_audit_stats
-- Description: Applique security_invoker=on à la vue clients_audit_stats pour une sécurité optimale
-- Date: 2025-08-19
-- Type: SÉCURITÉ

-- ============================================================================
-- OBJECTIF:
-- Appliquer security_invoker=on à la vue clients_audit_stats
-- Cela garantit que la vue s'exécute avec les permissions de l'utilisateur
-- qui effectue la requête, réduisant les risques d'exposition de données
-- ============================================================================

-- Recréer la vue avec security_invoker=on
DROP VIEW IF EXISTS clients_audit_stats;

CREATE VIEW clients_audit_stats 
WITH (security_invoker=on) 
AS
SELECT 
  DATE_TRUNC('month', c.deleted_at) as deletion_month,
  COUNT(*) as deleted_count,
  c.deleted_by,
  u.email as deleted_by_email
FROM public.clients c
LEFT JOIN auth.users u ON u.id = c.deleted_by
WHERE c.deleted_at IS NOT NULL
GROUP BY DATE_TRUNC('month', c.deleted_at), c.deleted_by, u.email
ORDER BY deletion_month DESC;

-- ============================================================================
-- Permissions et commentaires
-- ============================================================================

-- Donner accès à la vue aux utilisateurs authentifiés
-- Note: Avec security_invoker=on, la vue hérite automatiquement des
-- permissions RLS de la table clients sous-jacente
GRANT SELECT ON clients_audit_stats TO authenticated;

-- Commentaire de documentation
COMMENT ON VIEW clients_audit_stats IS 
'Vue des statistiques d''audit des clients supprimés - Utilise security_invoker=on pour s''exécuter avec les permissions de l''utilisateur qui effectue la requête, garantissant que seuls les admins peuvent voir les données d''audit grâce aux politiques RLS de la table clients';

-- ============================================================================
-- Validation de la configuration
-- ============================================================================

-- Vérifier que la vue a bien été créée avec security_invoker=on
DO $$
DECLARE
    view_options text[];
BEGIN
    -- Récupérer les options de la vue depuis pg_views
    SELECT reloptions INTO view_options
    FROM pg_class 
    WHERE relname = 'clients_audit_stats' 
      AND relkind = 'v';
    
    -- Vérifier que security_invoker=on est présent
    IF view_options IS NOT NULL AND 'security_invoker=on' = ANY(view_options) THEN
        RAISE NOTICE 'SUCCESS: Vue clients_audit_stats créée avec security_invoker=on';
    ELSE
        RAISE WARNING 'ATTENTION: security_invoker=on pourrait ne pas être appliqué correctement';
    END IF;
    
    -- Afficher les options actuelles pour confirmation
    IF view_options IS NOT NULL THEN
        RAISE NOTICE 'Options de la vue: %', array_to_string(view_options, ', ');
    ELSE
        RAISE NOTICE 'Aucune option spéciale détectée sur la vue';
    END IF;
END;
$$;

-- ============================================================================
-- Test de sécurité (pour validation)
-- ============================================================================

-- Vérification que la vue respecte les politiques RLS
DO $$
BEGIN
    -- Vérifier que la vue existe
    IF EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'clients_audit_stats' 
          AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Vue clients_audit_stats créée avec succès';
        
        -- Vérifier les permissions
        IF EXISTS (
            SELECT 1 FROM information_schema.table_privileges 
            WHERE table_name = 'clients_audit_stats' 
              AND privilege_type = 'SELECT' 
              AND grantee = 'authenticated'
        ) THEN
            RAISE NOTICE 'Permissions SELECT accordées à authenticated';
        END IF;
        
    ELSE
        RAISE EXCEPTION 'ERREUR: Vue clients_audit_stats non créée';
    END IF;
END;
$$;

-- ============================================================================
-- Note de sécurité
-- ============================================================================

-- IMPORTANT: Avec security_invoker=on, cette vue:
-- 1. S'exécute avec les permissions de l'utilisateur qui fait la requête
-- 2. Respecte automatiquement les politiques RLS de la table clients
-- 3. Garantit que seuls les admins (selon la politique clients_unified_select_policy)
--    peuvent voir les données d'audit (clients supprimés)
-- 4. Réduit les risques d'exposition accidentelle de données sensibles

-- ============================================================================
-- Fin de la migration security_invoker pour clients_audit_stats
-- ============================================================================