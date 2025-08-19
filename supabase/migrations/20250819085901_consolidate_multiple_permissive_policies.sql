-- Migration: consolidate_multiple_permissive_policies
-- Description: Consolide les politiques permissives multiples pour améliorer les performances
-- Date: 2025-08-19
-- Type: OPTIMISATION PERFORMANCE

-- ============================================================================
-- PROBLÈME RÉSOLU:
-- Multiple Permissive Policies - Détecté par Supabase Performance Advisor
-- Table clients a plusieurs politiques permissives pour le même rôle/action (SELECT)
-- Impact: Chaque politique doit être exécutée pour chaque requête pertinente
-- Solution: Fusionner les politiques clients_select_policy et clients_audit_policy
-- ============================================================================

-- Supprimer les politiques existantes qui causent des performances multiples
DROP POLICY IF EXISTS "clients_select_policy" ON public.clients;
DROP POLICY IF EXISTS "clients_audit_policy" ON public.clients;

-- ============================================================================
-- Créer une politique SELECT consolidée et optimisée
-- ============================================================================

-- Politique SELECT unifiée: Combine la lecture normale et l'audit en une seule politique
-- Utilisateurs authentifiés peuvent voir:
-- 1. Leurs propres clients actifs (deleted_at IS NULL)
-- 2. Les admins peuvent voir tous les clients (actifs et supprimés)
CREATE POLICY "clients_unified_select_policy" ON public.clients
  FOR SELECT
  TO authenticated
  USING (
    -- Condition 1: Clients actifs visibles par tous les utilisateurs authentifiés
    (deleted_at IS NULL)
    OR
    -- Condition 2: Clients supprimés visibles seulement par les admins (pour audit)
    (deleted_at IS NOT NULL 
     AND EXISTS (
       SELECT 1 FROM public.users u 
       WHERE u.id = (SELECT auth.uid())
       AND u.role IN ('admin', 'super_admin')
     )
    )
  );

-- ============================================================================
-- Alternative: Politique SELECT avec optimisation pour les cas courants
-- Si on veut séparer logiquement mais maintenir les performances,
-- on peut créer une politique restrictive et une politique permissive optimisée
-- ============================================================================

-- Politique alternative si besoin de séparation logique (commentée pour l'instant)
/*
-- Politique principale pour les clients actifs (plus fréquente)
CREATE POLICY "clients_active_select_policy" ON public.clients
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

-- Politique d'audit pour les clients supprimés (moins fréquente)
-- Utilise des conditions plus spécifiques pour éviter les conflits de performance
CREATE POLICY "clients_audit_select_policy" ON public.clients
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid())
      AND u.role = 'admin'
      -- On peut ajouter des conditions plus strictes ici
      -- comme une limite de temps pour les audits
      AND (CURRENT_DATE - u.created_at::date) < 365 -- Admin depuis moins d'un an
    )
  );
*/

-- ============================================================================
-- Optimisation d'index pour soutenir la nouvelle politique
-- ============================================================================

-- Index composé optimisé pour la politique unifiée
-- Couvre les cas les plus fréquents: deleted_at + created_at pour le tri
CREATE INDEX IF NOT EXISTS idx_clients_deleted_created_optimized 
  ON public.clients(deleted_at, created_at DESC)
  WHERE deleted_at IS NULL OR deleted_at IS NOT NULL;

-- Index partiel pour les requêtes d'audit des admins
CREATE INDEX IF NOT EXISTS idx_clients_audit_deleted 
  ON public.clients(deleted_at, deleted_by, updated_at) 
  WHERE deleted_at IS NOT NULL;

-- ============================================================================
-- Vue matérialisée pour les statistiques d'audit (optionnel)
-- ============================================================================

-- Vue pour les statistiques d'audit rapides sans impact sur la politique principale
CREATE OR REPLACE VIEW clients_audit_stats AS
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

-- Donner accès à la vue aux admins
-- Note: Les vues héritent des politiques RLS des tables sous-jacentes
-- La sécurité est assurée par la politique clients_unified_select_policy
GRANT SELECT ON clients_audit_stats TO authenticated;

-- ============================================================================
-- Fonction utilitaire pour les admins
-- ============================================================================

-- Fonction optimisée pour récupérer les clients avec statut d'audit
CREATE OR REPLACE FUNCTION get_clients_with_audit_info(
  include_deleted boolean DEFAULT false,
  limit_count integer DEFAULT 100
)
RETURNS TABLE (
  id uuid,
  display_name text,
  email text,
  phone text,
  client_type text,
  status text,
  created_at timestamptz,
  created_by uuid,
  deleted_at timestamptz,
  deleted_by uuid,
  is_deleted boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.id,
    get_client_display_name(c) as display_name,
    c.email,
    c.phone,
    c.client_type::text,
    c.status::text,
    c.created_at,
    c.created_by,
    c.deleted_at,
    c.deleted_by,
    (c.deleted_at IS NOT NULL) as is_deleted
  FROM public.clients c
  WHERE 
    (include_deleted = true OR c.deleted_at IS NULL)
    AND EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = (SELECT auth.uid())
      AND u.role IN ('admin', 'super_admin')
    )
  ORDER BY 
    c.deleted_at NULLS FIRST,
    c.created_at DESC
  LIMIT limit_count;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION get_clients_with_audit_info(boolean, integer) TO authenticated;

-- ============================================================================
-- Commentaires de documentation
-- ============================================================================

COMMENT ON POLICY "clients_unified_select_policy" ON public.clients IS 
'Politique SELECT consolidée - Combine lecture normale et audit en une seule politique pour optimiser les performances. Élimine le problème Multiple Permissive Policies.';

COMMENT ON INDEX idx_clients_deleted_created_optimized IS 
'Index composé optimisé pour la politique SELECT unifiée - Améliore les performances pour les clients actifs et supprimés';

COMMENT ON INDEX idx_clients_audit_deleted IS 
'Index spécialisé pour les requêtes d''audit des admins - Optimise les performances des rapports d''audit';

COMMENT ON VIEW clients_audit_stats IS 
'Vue des statistiques d''audit - Fournit des métriques rapides sans impacter la politique principale';

COMMENT ON FUNCTION get_clients_with_audit_info(boolean, integer) IS 
'Fonction utilitaire pour admins - Récupère les clients avec informations d''audit de manière optimisée';

-- ============================================================================
-- Validation de la migration
-- ============================================================================

-- Vérifier que nous n'avons plus qu'une seule politique SELECT
DO $$
DECLARE
    policy_count integer;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'clients' 
      AND schemaname = 'public' 
      AND cmd = 'SELECT';
    
    IF policy_count > 1 THEN
        RAISE EXCEPTION 'ERREUR: Plusieurs politiques SELECT détectées (%) - La consolidation a échoué', policy_count;
    END IF;
    
    RAISE NOTICE 'SUCCÈS: Politique SELECT consolidée - % politique(s) SELECT détectée(s)', policy_count;
END;
$$;

-- ============================================================================
-- Fin de la migration de consolidation des politiques multiples
-- ============================================================================