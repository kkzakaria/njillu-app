-- Migration: update_rls_for_soft_delete
-- Description: Mise à jour des politiques RLS pour exclure les enregistrements soft deleted
-- Date: 2025-08-04

-- ============================================================================
-- Suppression et recréation des politiques SELECT existantes
-- ============================================================================

-- Supprimer les anciennes politiques SELECT qui ne tiennent pas compte du soft delete

-- Bills of Lading
DROP POLICY IF EXISTS "bills_of_lading_select_all" ON public.bills_of_lading;

-- BL Containers  
DROP POLICY IF EXISTS "bl_containers_select_all" ON public.bl_containers;

-- BL Cargo Details
DROP POLICY IF EXISTS "bl_cargo_details_select_all" ON public.bl_cargo_details;

-- BL Freight Charges
DROP POLICY IF EXISTS "bl_freight_charges_select_all" ON public.bl_freight_charges;

-- Shipping Companies
DROP POLICY IF EXISTS "shipping_companies_select_all" ON public.shipping_companies;

-- Container Types
DROP POLICY IF EXISTS "container_types_select_all" ON public.container_types;

-- ============================================================================
-- Nouvelles politiques SELECT qui excluent les enregistrements soft deleted
-- ============================================================================

-- Bills of Lading - Exclure les BL supprimés
CREATE POLICY "bills_of_lading_select_active" ON public.bills_of_lading
    FOR SELECT
    TO authenticated
    USING (deleted_at IS NULL);

-- BL Containers - Exclure les conteneurs supprimés
CREATE POLICY "bl_containers_select_active" ON public.bl_containers
    FOR SELECT
    TO authenticated
    USING (deleted_at IS NULL);

-- BL Cargo Details - Exclure les détails de cargaison supprimés
CREATE POLICY "bl_cargo_details_select_active" ON public.bl_cargo_details
    FOR SELECT
    TO authenticated
    USING (deleted_at IS NULL);

-- BL Freight Charges - Exclure les frais supprimés
CREATE POLICY "bl_freight_charges_select_active" ON public.bl_freight_charges
    FOR SELECT
    TO authenticated
    USING (deleted_at IS NULL);

-- Shipping Companies - Exclure les compagnies supprimées
CREATE POLICY "shipping_companies_select_active" ON public.shipping_companies
    FOR SELECT
    TO authenticated
    USING (deleted_at IS NULL);

-- Container Types - Exclure les types de conteneurs supprimés
CREATE POLICY "container_types_select_active" ON public.container_types
    FOR SELECT
    TO authenticated
    USING (deleted_at IS NULL);

-- ============================================================================
-- Mise à jour des politiques INSERT/UPDATE/DELETE pour tenir compte du soft delete
-- ============================================================================

-- Bills of Lading - Mise à jour des politiques existantes pour exclure les supprimés
DROP POLICY IF EXISTS "bills_of_lading_update_own" ON public.bills_of_lading;
DROP POLICY IF EXISTS "bills_of_lading_delete_own" ON public.bills_of_lading;

CREATE POLICY "bills_of_lading_update_own" ON public.bills_of_lading
    FOR UPDATE
    TO authenticated
    USING (
        deleted_at IS NULL AND
        (created_by = auth.uid() OR updated_by = auth.uid())
    )
    WITH CHECK (
        deleted_at IS NULL AND
        (created_by = auth.uid() OR updated_by = auth.uid())
    );

-- DELETE physique seulement pour les BL non supprimés (rare, généralement on fait du soft delete)
CREATE POLICY "bills_of_lading_delete_own" ON public.bills_of_lading
    FOR DELETE
    TO authenticated
    USING (
        deleted_at IS NULL AND
        created_by = auth.uid()
    );

-- BL Containers - Mise à jour des politiques
DROP POLICY IF EXISTS "bl_containers_insert_if_bl_access" ON public.bl_containers;
DROP POLICY IF EXISTS "bl_containers_update_if_bl_access" ON public.bl_containers;
DROP POLICY IF EXISTS "bl_containers_delete_if_bl_access" ON public.bl_containers;

CREATE POLICY "bl_containers_insert_if_bl_access" ON public.bl_containers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bills_of_lading bl
            WHERE bl.id = bl_id
            AND bl.deleted_at IS NULL
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    );

CREATE POLICY "bl_containers_update_if_bl_access" ON public.bl_containers
    FOR UPDATE
    TO authenticated
    USING (
        deleted_at IS NULL AND
        EXISTS (
            SELECT 1 FROM public.bills_of_lading bl
            WHERE bl.id = bl_id
            AND bl.deleted_at IS NULL
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    )
    WITH CHECK (
        deleted_at IS NULL AND
        EXISTS (
            SELECT 1 FROM public.bills_of_lading bl
            WHERE bl.id = bl_id
            AND bl.deleted_at IS NULL
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    );

CREATE POLICY "bl_containers_delete_if_bl_access" ON public.bl_containers
    FOR DELETE
    TO authenticated
    USING (
        deleted_at IS NULL AND
        EXISTS (
            SELECT 1 FROM public.bills_of_lading bl
            WHERE bl.id = bl_id
            AND bl.deleted_at IS NULL
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    );

-- BL Cargo Details - Mise à jour des politiques
DROP POLICY IF EXISTS "bl_cargo_details_insert_if_bl_access" ON public.bl_cargo_details;
DROP POLICY IF EXISTS "bl_cargo_details_update_if_bl_access" ON public.bl_cargo_details;
DROP POLICY IF EXISTS "bl_cargo_details_delete_if_bl_access" ON public.bl_cargo_details;

CREATE POLICY "bl_cargo_details_insert_if_bl_access" ON public.bl_cargo_details
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bl_containers bc
            JOIN public.bills_of_lading bl ON bl.id = bc.bl_id
            WHERE bc.id = container_id
            AND bc.deleted_at IS NULL
            AND bl.deleted_at IS NULL
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    );

CREATE POLICY "bl_cargo_details_update_if_bl_access" ON public.bl_cargo_details
    FOR UPDATE
    TO authenticated
    USING (
        deleted_at IS NULL AND
        EXISTS (
            SELECT 1 FROM public.bl_containers bc
            JOIN public.bills_of_lading bl ON bl.id = bc.bl_id
            WHERE bc.id = container_id
            AND bc.deleted_at IS NULL
            AND bl.deleted_at IS NULL
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    )
    WITH CHECK (
        deleted_at IS NULL AND
        EXISTS (
            SELECT 1 FROM public.bl_containers bc
            JOIN public.bills_of_lading bl ON bl.id = bc.bl_id
            WHERE bc.id = container_id
            AND bc.deleted_at IS NULL
            AND bl.deleted_at IS NULL
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    );

CREATE POLICY "bl_cargo_details_delete_if_bl_access" ON public.bl_cargo_details
    FOR DELETE
    TO authenticated
    USING (
        deleted_at IS NULL AND
        EXISTS (
            SELECT 1 FROM public.bl_containers bc
            JOIN public.bills_of_lading bl ON bl.id = bc.bl_id
            WHERE bc.id = container_id
            AND bc.deleted_at IS NULL
            AND bl.deleted_at IS NULL
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    );

-- BL Freight Charges - Mise à jour des politiques
DROP POLICY IF EXISTS "bl_freight_charges_insert_if_bl_access" ON public.bl_freight_charges;
DROP POLICY IF EXISTS "bl_freight_charges_update_if_bl_access" ON public.bl_freight_charges;
DROP POLICY IF EXISTS "bl_freight_charges_delete_if_bl_access" ON public.bl_freight_charges;

CREATE POLICY "bl_freight_charges_insert_if_bl_access" ON public.bl_freight_charges
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bills_of_lading bl
            WHERE bl.id = bl_id
            AND bl.deleted_at IS NULL
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    );

CREATE POLICY "bl_freight_charges_update_if_bl_access" ON public.bl_freight_charges
    FOR UPDATE
    TO authenticated
    USING (
        deleted_at IS NULL AND
        EXISTS (
            SELECT 1 FROM public.bills_of_lading bl
            WHERE bl.id = bl_id
            AND bl.deleted_at IS NULL
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    )
    WITH CHECK (
        deleted_at IS NULL AND
        EXISTS (
            SELECT 1 FROM public.bills_of_lading bl
            WHERE bl.id = bl_id
            AND bl.deleted_at IS NULL
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    );

CREATE POLICY "bl_freight_charges_delete_if_bl_access" ON public.bl_freight_charges
    FOR DELETE
    TO authenticated
    USING (
        deleted_at IS NULL AND
        EXISTS (
            SELECT 1 FROM public.bills_of_lading bl
            WHERE bl.id = bl_id
            AND bl.deleted_at IS NULL
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    );

-- ============================================================================
-- Nouvelles politiques pour accéder aux enregistrements supprimés (audit)
-- ============================================================================

-- Bills of Lading - Accès aux BL supprimés pour audit
CREATE POLICY "bills_of_lading_select_deleted_own" ON public.bills_of_lading
    FOR SELECT
    TO authenticated
    USING (
        deleted_at IS NOT NULL AND
        (created_by = auth.uid() OR updated_by = auth.uid())
    );

-- BL Containers - Accès aux conteneurs supprimés pour audit
CREATE POLICY "bl_containers_select_deleted_own" ON public.bl_containers
    FOR SELECT
    TO authenticated
    USING (
        deleted_at IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.bills_of_lading bl
            WHERE bl.id = bl_id
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    );

-- BL Cargo Details - Accès aux détails supprimés pour audit
CREATE POLICY "bl_cargo_details_select_deleted_own" ON public.bl_cargo_details
    FOR SELECT
    TO authenticated
    USING (
        deleted_at IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.bl_containers bc
            JOIN public.bills_of_lading bl ON bl.id = bc.bl_id
            WHERE bc.id = container_id
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    );

-- BL Freight Charges - Accès aux frais supprimés pour audit
CREATE POLICY "bl_freight_charges_select_deleted_own" ON public.bl_freight_charges
    FOR SELECT
    TO authenticated
    USING (
        deleted_at IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.bills_of_lading bl
            WHERE bl.id = bl_id
            AND (bl.created_by = auth.uid() OR bl.updated_by = auth.uid())
        )
    );

-- ============================================================================
-- Politiques pour les opérations de restauration
-- ============================================================================

-- Bills of Lading - Permettre UPDATE pour restauration
CREATE POLICY "bills_of_lading_restore_own" ON public.bills_of_lading
    FOR UPDATE
    TO authenticated
    USING (
        deleted_at IS NOT NULL AND
        (created_by = auth.uid() OR updated_by = auth.uid())
    )
    WITH CHECK (
        -- Après restauration, deleted_at sera NULL
        deleted_at IS NULL AND
        (created_by = auth.uid() OR updated_by = auth.uid())
    );

-- ============================================================================
-- Fonctions utilitaires pour les politiques RLS
-- ============================================================================

-- Fonction pour vérifier si un utilisateur peut accéder aux données supprimées (audit)
CREATE OR REPLACE FUNCTION can_access_deleted_bl_data(bl_uuid uuid, user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM bills_of_lading 
    WHERE id = bl_uuid 
    AND (created_by = user_id OR updated_by = user_id)
  );
$$;

-- Fonction pour vérifier si un enregistrement peut être restauré
CREATE OR REPLACE FUNCTION can_restore_record(table_name text, record_id uuid, user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    CASE table_name
        WHEN 'bills_of_lading' THEN
            RETURN EXISTS (
                SELECT 1 FROM bills_of_lading 
                WHERE id = record_id 
                AND deleted_at IS NOT NULL
                AND (created_by = user_id OR updated_by = user_id)
            );
        WHEN 'bl_containers' THEN
            RETURN EXISTS (
                SELECT 1 FROM bl_containers bc
                JOIN bills_of_lading bl ON bl.id = bc.bl_id
                WHERE bc.id = record_id 
                AND bc.deleted_at IS NOT NULL
                AND (bl.created_by = user_id OR bl.updated_by = user_id)
            );
        ELSE
            RETURN false;
    END CASE;
END;
$$;

-- ============================================================================
-- Trigger pour empêcher les mises à jour des colonnes soft delete via UPDATE normal
-- ============================================================================

-- Fonction de trigger pour protéger les colonnes soft delete
CREATE OR REPLACE FUNCTION protect_soft_delete_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Empêcher la modification directe des colonnes soft delete via UPDATE normal
    -- Ces colonnes ne doivent être modifiées que via les fonctions dédiées
    IF TG_OP = 'UPDATE' THEN
        -- Si on essaie de modifier deleted_at ou deleted_by directement
        IF OLD.deleted_at IS DISTINCT FROM NEW.deleted_at OR OLD.deleted_by IS DISTINCT FROM NEW.deleted_by THEN
            -- Vérifier qu'on est dans le contexte d'une fonction autorisée
            IF current_setting('soft_delete.context', true) != 'authorized' THEN
                RAISE EXCEPTION 'Direct modification of soft delete columns (deleted_at, deleted_by) is not allowed. Use soft delete functions instead.';
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Appliquer le trigger de protection sur toutes les tables avec soft delete
CREATE TRIGGER protect_bills_of_lading_soft_delete
    BEFORE UPDATE ON public.bills_of_lading
    FOR EACH ROW
    EXECUTE FUNCTION protect_soft_delete_columns();

CREATE TRIGGER protect_bl_containers_soft_delete
    BEFORE UPDATE ON public.bl_containers
    FOR EACH ROW
    EXECUTE FUNCTION protect_soft_delete_columns();

CREATE TRIGGER protect_bl_cargo_details_soft_delete
    BEFORE UPDATE ON public.bl_cargo_details
    FOR EACH ROW
    EXECUTE FUNCTION protect_soft_delete_columns();

CREATE TRIGGER protect_bl_freight_charges_soft_delete
    BEFORE UPDATE ON public.bl_freight_charges
    FOR EACH ROW
    EXECUTE FUNCTION protect_soft_delete_columns();

-- ============================================================================
-- Commentaires pour documentation des nouvelles politiques
-- ============================================================================

COMMENT ON POLICY "bills_of_lading_select_active" ON public.bills_of_lading IS 
'Permet de voir uniquement les BL actifs (non supprimés logiquement)';

COMMENT ON POLICY "bills_of_lading_select_deleted_own" ON public.bills_of_lading IS 
'Permet d''accéder aux BL supprimés pour audit (seulement ceux de l''utilisateur)';

COMMENT ON POLICY "bills_of_lading_restore_own" ON public.bills_of_lading IS 
'Permet la restauration des BL supprimés par l''utilisateur';

COMMENT ON FUNCTION can_access_deleted_bl_data(uuid, uuid) IS 
'Vérifie si un utilisateur peut accéder aux données supprimées d''un BL pour audit';

COMMENT ON FUNCTION can_restore_record(text, uuid, uuid) IS 
'Vérifie si un utilisateur peut restaurer un enregistrement supprimé';

COMMENT ON FUNCTION protect_soft_delete_columns() IS 
'Protège les colonnes soft delete contre les modifications directes non autorisées';

-- ============================================================================
-- Permissions sur les nouvelles fonctions
-- ============================================================================

GRANT EXECUTE ON FUNCTION can_access_deleted_bl_data(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION can_restore_record(text, uuid, uuid) TO authenticated;