-- Migration: configure_bl_rls_policies
-- Description: Configuration des politiques Row Level Security pour toutes les tables BL
-- Date: 2025-08-04

-- ============================================================================
-- Activation de RLS sur toutes les tables BL
-- ============================================================================

-- Tables principales
ALTER TABLE public.shipping_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.container_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills_of_lading ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bl_containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bl_cargo_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bl_freight_charges ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Politiques pour shipping_companies (données de référence - lecture publique)
-- ============================================================================

-- Lecture publique pour tous les utilisateurs authentifiés
CREATE POLICY "shipping_companies_select_all" ON public.shipping_companies
    FOR SELECT
    TO authenticated
    USING (true);

-- Seuls les administrateurs peuvent insérer de nouvelles compagnies
CREATE POLICY "shipping_companies_admin_insert" ON public.shipping_companies
    FOR INSERT
    TO authenticated
    WITH CHECK (false); -- Remplacer par une logique d'admin quand disponible

-- Seuls les administrateurs peuvent modifier les compagnies
CREATE POLICY "shipping_companies_admin_update" ON public.shipping_companies
    FOR UPDATE
    TO authenticated
    USING (false) -- Remplacer par une logique d'admin quand disponible
    WITH CHECK (false);

-- ============================================================================
-- Politiques pour container_types (données de référence - lecture publique)
-- ============================================================================

-- Lecture publique pour tous les utilisateurs authentifiés
CREATE POLICY "container_types_select_all" ON public.container_types
    FOR SELECT
    TO authenticated
    USING (true);

-- Seuls les administrateurs peuvent modifier les types de conteneurs
CREATE POLICY "container_types_admin_only" ON public.container_types
    FOR ALL
    TO authenticated
    USING (false) -- Remplacer par une logique d'admin quand disponible
    WITH CHECK (false);

-- ============================================================================
-- Politiques pour bills_of_lading (BL principaux)
-- ============================================================================

-- Les utilisateurs peuvent voir tous les BL (pour collaboration)
CREATE POLICY "bills_of_lading_select_all" ON public.bills_of_lading
    FOR SELECT
    TO authenticated
    USING (true);

-- Les utilisateurs peuvent créer des BL
CREATE POLICY "bills_of_lading_insert_authenticated" ON public.bills_of_lading
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- Les utilisateurs peuvent modifier les BL qu'ils ont créés ou qui leur sont assignés
CREATE POLICY "bills_of_lading_update_own" ON public.bills_of_lading
    FOR UPDATE
    TO authenticated
    USING (
        created_by = auth.uid() OR
        updated_by = auth.uid()
    )
    WITH CHECK (
        created_by = auth.uid() OR
        updated_by = auth.uid()
    );

-- Les utilisateurs peuvent supprimer les BL qu'ils ont créés (avec cascade)
CREATE POLICY "bills_of_lading_delete_own" ON public.bills_of_lading
    FOR DELETE
    TO authenticated
    USING (created_by = auth.uid());

-- ============================================================================
-- Politiques pour bl_containers (conteneurs des BL)
-- ============================================================================

-- Les utilisateurs peuvent voir tous les conteneurs
CREATE POLICY "bl_containers_select_all" ON public.bl_containers
    FOR SELECT
    TO authenticated
    USING (true);

-- Les utilisateurs peuvent ajouter des conteneurs aux BL qu'ils peuvent modifier
CREATE POLICY "bl_containers_insert_if_bl_access" ON public.bl_containers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bills_of_lading bl
            WHERE bl.id = bl_id
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    );

-- Les utilisateurs peuvent modifier les conteneurs des BL qu'ils peuvent modifier
CREATE POLICY "bl_containers_update_if_bl_access" ON public.bl_containers
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.bills_of_lading bl
            WHERE bl.id = bl_id
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bills_of_lading bl
            WHERE bl.id = bl_id
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    );

-- Les utilisateurs peuvent supprimer les conteneurs des BL qu'ils peuvent modifier
CREATE POLICY "bl_containers_delete_if_bl_access" ON public.bl_containers
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.bills_of_lading bl
            WHERE bl.id = bl_id
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    );

-- ============================================================================
-- Politiques pour bl_cargo_details (détails des marchandises)
-- ============================================================================

-- Les utilisateurs peuvent voir tous les détails de cargaison
CREATE POLICY "bl_cargo_details_select_all" ON public.bl_cargo_details
    FOR SELECT
    TO authenticated
    USING (true);

-- Les utilisateurs peuvent ajouter des détails aux conteneurs des BL qu'ils peuvent modifier
CREATE POLICY "bl_cargo_details_insert_if_bl_access" ON public.bl_cargo_details
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bl_containers bc
            JOIN public.bills_of_lading bl ON bl.id = bc.bl_id
            WHERE bc.id = container_id
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    );

-- Les utilisateurs peuvent modifier les détails des conteneurs des BL qu'ils peuvent modifier
CREATE POLICY "bl_cargo_details_update_if_bl_access" ON public.bl_cargo_details
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.bl_containers bc
            JOIN public.bills_of_lading bl ON bl.id = bc.bl_id
            WHERE bc.id = container_id
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bl_containers bc
            JOIN public.bills_of_lading bl ON bl.id = bc.bl_id
            WHERE bc.id = container_id
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    );

-- Les utilisateurs peuvent supprimer les détails des conteneurs des BL qu'ils peuvent modifier
CREATE POLICY "bl_cargo_details_delete_if_bl_access" ON public.bl_cargo_details
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.bl_containers bc
            JOIN public.bills_of_lading bl ON bl.id = bc.bl_id
            WHERE bc.id = container_id
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    );

-- ============================================================================
-- Politiques pour bl_freight_charges (frais et charges)
-- ============================================================================

-- Les utilisateurs peuvent voir tous les frais (pour transparence financière)
CREATE POLICY "bl_freight_charges_select_all" ON public.bl_freight_charges
    FOR SELECT
    TO authenticated
    USING (true);

-- Les utilisateurs peuvent ajouter des frais aux BL qu'ils peuvent modifier
CREATE POLICY "bl_freight_charges_insert_if_bl_access" ON public.bl_freight_charges
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bills_of_lading bl
            WHERE bl.id = bl_id
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    );

-- Les utilisateurs peuvent modifier les frais des BL qu'ils peuvent modifier
CREATE POLICY "bl_freight_charges_update_if_bl_access" ON public.bl_freight_charges
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.bills_of_lading bl
            WHERE bl.id = bl_id
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bills_of_lading bl
            WHERE bl.id = bl_id
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    );

-- Les utilisateurs peuvent supprimer/désactiver les frais des BL qu'ils peuvent modifier
CREATE POLICY "bl_freight_charges_delete_if_bl_access" ON public.bl_freight_charges
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.bills_of_lading bl
            WHERE bl.id = bl_id
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    );

-- ============================================================================
-- Permissions étendues pour les opérations CRUD
-- ============================================================================

-- Bills of Lading - permissions complètes pour les utilisateurs authentifiés
GRANT INSERT, UPDATE, DELETE ON public.bills_of_lading TO authenticated;

-- BL Containers - permissions complètes pour les utilisateurs authentifiés
GRANT INSERT, UPDATE, DELETE ON public.bl_containers TO authenticated;

-- BL Cargo Details - permissions complètes pour les utilisateurs authentifiés
GRANT INSERT, UPDATE, DELETE ON public.bl_cargo_details TO authenticated;

-- BL Freight Charges - permissions complètes pour les utilisateurs authentifiés
GRANT INSERT, UPDATE, DELETE ON public.bl_freight_charges TO authenticated;

-- Tables de référence - lecture seule pour les utilisateurs standard
-- (INSERT/UPDATE/DELETE seront gérés par des rôles administrateur dans le futur)

-- ============================================================================
-- Fonctions de sécurité utilitaires
-- ============================================================================

-- Fonction pour vérifier si un utilisateur peut accéder à un BL
CREATE OR REPLACE FUNCTION can_access_bl(bl_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM bills_of_lading 
    WHERE id = bl_uuid 
    AND (created_by = auth.uid() OR updated_by = auth.uid())
  );
$$;

-- Fonction pour vérifier si un utilisateur peut accéder à un conteneur via son BL
CREATE OR REPLACE FUNCTION can_access_container(container_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM bl_containers bc
    JOIN bills_of_lading bl ON bl.id = bc.bl_id
    WHERE bc.id = container_uuid 
    AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
  );
$$;

-- Fonction pour obtenir tous les BL auxquels un utilisateur a accès
CREATE OR REPLACE FUNCTION get_user_accessible_bls()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM bills_of_lading 
  WHERE created_by = auth.uid() OR updated_by = auth.uid();
$$;

-- ============================================================================
-- Commentaires pour documentation des politiques
-- ============================================================================

COMMENT ON POLICY "bills_of_lading_select_all" ON public.bills_of_lading IS 
'Permet à tous les utilisateurs authentifiés de voir tous les BL pour faciliter la collaboration';

COMMENT ON POLICY "bills_of_lading_update_own" ON public.bills_of_lading IS 
'Permet la modification des BL créés par l''utilisateur ou qui lui sont assignés (updated_by)';

COMMENT ON POLICY "bl_containers_insert_if_bl_access" ON public.bl_containers IS 
'Les conteneurs ne peuvent être ajoutés qu''aux BL auxquels l''utilisateur a accès';

COMMENT ON POLICY "bl_freight_charges_select_all" ON public.bl_freight_charges IS 
'Tous les frais sont visibles pour assurer la transparence financière';

COMMENT ON FUNCTION can_access_bl(uuid) IS 
'Fonction utilitaire pour vérifier l''accès utilisateur à un BL spécifique';

COMMENT ON FUNCTION get_user_accessible_bls() IS 
'Retourne tous les BL auxquels l''utilisateur actuel a accès (création ou assignation)';

-- ============================================================================
-- Instructions pour évolution future vers système d'admin
-- ============================================================================

/*
NOTES POUR L'ÉVOLUTION FUTURE:

1. Remplacer les politiques "false" par une vraie logique d'admin:
   - Créer une table user_roles ou utiliser les métadonnées utilisateur
   - Remplacer "false" par une fonction comme is_admin() ou has_role('admin')

2. Ajouter des rôles métier spécifiques:
   - shipping_clerk: peut créer/modifier les BL
   - finance_user: peut voir/modifier les frais
   - read_only_user: peut seulement lire

3. Politiques plus granulaires par compagnie:
   - Restreindre l'accès aux BL selon la compagnie de l'utilisateur
   - Ajouter user_company_id dans la table users

Exemple de fonction admin future:
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin',
    false
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;
*/