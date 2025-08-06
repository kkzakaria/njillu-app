-- Migration: optimize_rls_policies_performance
-- Description: Optimisation des 26 politiques RLS avec auth.<function>() pour améliorer les performances
-- Date: 2025-08-05
--
-- PROBLÈME: Les politiques RLS qui utilisent auth.<function>() sont réévaluées pour chaque ligne
-- SOLUTION: Remplacer auth.<function>() par (select auth.<function>()) pour optimiser les performances

-- ============================================================================
-- PHASE 2.1: OPTIMISATION DES POLITIQUES RLS - TABLE USERS
-- ============================================================================

-- users_insert_own
DROP POLICY IF EXISTS users_insert_own ON public.users;
CREATE POLICY users_insert_own ON public.users FOR INSERT TO authenticated
WITH CHECK (id = (select auth.uid()));

-- users_update_own  
DROP POLICY IF EXISTS users_update_own ON public.users;
CREATE POLICY users_update_own ON public.users FOR UPDATE TO authenticated
USING (id = (select auth.uid()))
WITH CHECK (id = (select auth.uid()));

-- ============================================================================
-- PHASE 2.1: OPTIMISATION DES POLITIQUES RLS - TABLE BL_CARGO_DETAILS
-- ============================================================================

-- bl_cargo_details_delete_if_bl_access
DROP POLICY IF EXISTS bl_cargo_details_delete_if_bl_access ON public.bl_cargo_details;
CREATE POLICY bl_cargo_details_delete_if_bl_access ON public.bl_cargo_details FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.bl_containers bc
        JOIN public.bills_of_lading bl ON bl.id = bc.bl_id
        WHERE bc.id = container_id 
        AND (bl.created_by = (select auth.uid()) OR bl.updated_by = (select auth.uid()))
    )
);

-- bl_cargo_details_insert_if_bl_access
DROP POLICY IF EXISTS bl_cargo_details_insert_if_bl_access ON public.bl_cargo_details;
CREATE POLICY bl_cargo_details_insert_if_bl_access ON public.bl_cargo_details FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.bl_containers bc
        JOIN public.bills_of_lading bl ON bl.id = bc.bl_id
        WHERE bc.id = container_id 
        AND (bl.created_by = (select auth.uid()) OR bl.updated_by = (select auth.uid()))
    )
);

-- bl_cargo_details_select_deleted_own
DROP POLICY IF EXISTS bl_cargo_details_select_deleted_own ON public.bl_cargo_details;
CREATE POLICY bl_cargo_details_select_deleted_own ON public.bl_cargo_details FOR SELECT TO authenticated
USING (
    deleted_at IS NOT NULL 
    AND EXISTS (
        SELECT 1 FROM public.bl_containers bc
        JOIN public.bills_of_lading bl ON bl.id = bc.bl_id
        WHERE bc.id = container_id 
        AND (bl.created_by = (select auth.uid()) OR bl.updated_by = (select auth.uid()) OR bl.deleted_by = (select auth.uid()))
    )
);

-- bl_cargo_details_update_if_bl_access
DROP POLICY IF EXISTS bl_cargo_details_update_if_bl_access ON public.bl_cargo_details;
CREATE POLICY bl_cargo_details_update_if_bl_access ON public.bl_cargo_details FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.bl_containers bc
        JOIN public.bills_of_lading bl ON bl.id = bc.bl_id
        WHERE bc.id = container_id 
        AND (bl.created_by = (select auth.uid()) OR bl.updated_by = (select auth.uid()))
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.bl_containers bc
        JOIN public.bills_of_lading bl ON bl.id = bc.bl_id
        WHERE bc.id = container_id 
        AND (bl.created_by = (select auth.uid()) OR bl.updated_by = (select auth.uid()))
    )
);

-- ============================================================================
-- PHASE 2.1: OPTIMISATION DES POLITIQUES RLS - TABLE BL_FREIGHT_CHARGES
-- ============================================================================

-- bl_freight_charges_delete_if_bl_access
DROP POLICY IF EXISTS bl_freight_charges_delete_if_bl_access ON public.bl_freight_charges;
CREATE POLICY bl_freight_charges_delete_if_bl_access ON public.bl_freight_charges FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.bills_of_lading bl 
        WHERE bl.id = bl_id 
        AND (bl.created_by = (select auth.uid()) OR bl.updated_by = (select auth.uid()))
    )
);

-- bl_freight_charges_insert_if_bl_access
DROP POLICY IF EXISTS bl_freight_charges_insert_if_bl_access ON public.bl_freight_charges;
CREATE POLICY bl_freight_charges_insert_if_bl_access ON public.bl_freight_charges FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.bills_of_lading bl 
        WHERE bl.id = bl_id 
        AND (bl.created_by = (select auth.uid()) OR bl.updated_by = (select auth.uid()))
    )
);

-- bl_freight_charges_select_deleted_own
DROP POLICY IF EXISTS bl_freight_charges_select_deleted_own ON public.bl_freight_charges;
CREATE POLICY bl_freight_charges_select_deleted_own ON public.bl_freight_charges FOR SELECT TO authenticated
USING (
    deleted_at IS NOT NULL 
    AND EXISTS (
        SELECT 1 FROM public.bills_of_lading bl 
        WHERE bl.id = bl_id 
        AND (bl.created_by = (select auth.uid()) OR bl.updated_by = (select auth.uid()) OR bl.deleted_by = (select auth.uid()))
    )
);

-- bl_freight_charges_update_if_bl_access
DROP POLICY IF EXISTS bl_freight_charges_update_if_bl_access ON public.bl_freight_charges;
CREATE POLICY bl_freight_charges_update_if_bl_access ON public.bl_freight_charges FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.bills_of_lading bl 
        WHERE bl.id = bl_id 
        AND (bl.created_by = (select auth.uid()) OR bl.updated_by = (select auth.uid()))
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.bills_of_lading bl 
        WHERE bl.id = bl_id 
        AND (bl.created_by = (select auth.uid()) OR bl.updated_by = (select auth.uid()))
    )
);

-- ============================================================================
-- PHASE 2.1: OPTIMISATION DES POLITIQUES RLS - TABLE BILLS_OF_LADING
-- ============================================================================

-- bills_of_lading_delete_own
DROP POLICY IF EXISTS bills_of_lading_delete_own ON public.bills_of_lading;
CREATE POLICY bills_of_lading_delete_own ON public.bills_of_lading FOR DELETE TO authenticated
USING (created_by = (select auth.uid()) OR updated_by = (select auth.uid()));

-- bills_of_lading_insert_authenticated
DROP POLICY IF EXISTS bills_of_lading_insert_authenticated ON public.bills_of_lading;
CREATE POLICY bills_of_lading_insert_authenticated ON public.bills_of_lading FOR INSERT TO authenticated
WITH CHECK (created_by = (select auth.uid()));

-- bills_of_lading_restore_own
DROP POLICY IF EXISTS bills_of_lading_restore_own ON public.bills_of_lading;
CREATE POLICY bills_of_lading_restore_own ON public.bills_of_lading FOR UPDATE TO authenticated
USING (
    deleted_at IS NOT NULL 
    AND (created_by = (select auth.uid()) OR updated_by = (select auth.uid()) OR deleted_by = (select auth.uid()))
)
WITH CHECK (deleted_at IS NULL);

-- bills_of_lading_select_deleted_own
DROP POLICY IF EXISTS bills_of_lading_select_deleted_own ON public.bills_of_lading;
CREATE POLICY bills_of_lading_select_deleted_own ON public.bills_of_lading FOR SELECT TO authenticated
USING (
    deleted_at IS NOT NULL 
    AND (created_by = (select auth.uid()) OR updated_by = (select auth.uid()) OR deleted_by = (select auth.uid()))
);

-- bills_of_lading_update_own
DROP POLICY IF EXISTS bills_of_lading_update_own ON public.bills_of_lading;
CREATE POLICY bills_of_lading_update_own ON public.bills_of_lading FOR UPDATE TO authenticated
USING (created_by = (select auth.uid()) OR updated_by = (select auth.uid()))
WITH CHECK (created_by = (select auth.uid()) OR updated_by = (select auth.uid()));

-- ============================================================================
-- PHASE 2.1: OPTIMISATION DES POLITIQUES RLS - TABLE FOLDERS
-- ============================================================================

-- Folders are viewable by authenticated users
DROP POLICY IF EXISTS "Folders are viewable by authenticated users" ON public.folders;
CREATE POLICY "Folders are viewable by authenticated users" ON public.folders FOR SELECT TO authenticated
USING ((select auth.uid()) IS NOT NULL);

-- Folders can be created by authenticated users
DROP POLICY IF EXISTS "Folders can be created by authenticated users" ON public.folders;
CREATE POLICY "Folders can be created by authenticated users" ON public.folders FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) IS NOT NULL);

-- Folders can be soft deleted by owner or assignee
DROP POLICY IF EXISTS "Folders can be soft deleted by owner or assignee" ON public.folders;
CREATE POLICY "Folders can be soft deleted by owner or assignee" ON public.folders FOR UPDATE TO authenticated
USING (
    deleted_at IS NULL 
    AND (created_by = (select auth.uid()) OR assigned_to = (select auth.uid()))
)
WITH CHECK (deleted_at IS NOT NULL);

-- Folders can be updated by owner or assignee
DROP POLICY IF EXISTS "Folders can be updated by owner or assignee" ON public.folders;
CREATE POLICY "Folders can be updated by owner or assignee" ON public.folders FOR UPDATE TO authenticated
USING (
    deleted_at IS NULL 
    AND (created_by = (select auth.uid()) OR assigned_to = (select auth.uid()))
)
WITH CHECK (
    deleted_at IS NULL 
    AND (created_by = (select auth.uid()) OR assigned_to = (select auth.uid()))
);

-- ============================================================================
-- PHASE 2.1: OPTIMISATION DES POLITIQUES RLS - TABLE FOLDER_COUNTER
-- ============================================================================

-- Folder counter is viewable by authenticated users
DROP POLICY IF EXISTS "Folder counter is viewable by authenticated users" ON public.folder_counter;
CREATE POLICY "Folder counter is viewable by authenticated users" ON public.folder_counter FOR SELECT TO authenticated
USING ((select auth.uid()) IS NOT NULL);

-- ============================================================================
-- PHASE 2.1: OPTIMISATION DES POLITIQUES RLS - TABLE BL_CONTAINERS
-- ============================================================================

-- bl_containers_delete_if_bl_access
DROP POLICY IF EXISTS bl_containers_delete_if_bl_access ON public.bl_containers;
CREATE POLICY bl_containers_delete_if_bl_access ON public.bl_containers FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.bills_of_lading bl 
        WHERE bl.id = bl_id 
        AND (bl.created_by = (select auth.uid()) OR bl.updated_by = (select auth.uid()))
    )
);

-- bl_containers_insert_if_bl_access
DROP POLICY IF EXISTS bl_containers_insert_if_bl_access ON public.bl_containers;
CREATE POLICY bl_containers_insert_if_bl_access ON public.bl_containers FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.bills_of_lading bl 
        WHERE bl.id = bl_id 
        AND (bl.created_by = (select auth.uid()) OR bl.updated_by = (select auth.uid()))
    )
);

-- bl_containers_select_deleted_own
DROP POLICY IF EXISTS bl_containers_select_deleted_own ON public.bl_containers;
CREATE POLICY bl_containers_select_deleted_own ON public.bl_containers FOR SELECT TO authenticated
USING (
    deleted_at IS NOT NULL 
    AND EXISTS (
        SELECT 1 FROM public.bills_of_lading bl 
        WHERE bl.id = bl_id 
        AND (bl.created_by = (select auth.uid()) OR bl.updated_by = (select auth.uid()) OR bl.deleted_by = (select auth.uid()))
    )
);

-- bl_containers_update_if_bl_access
DROP POLICY IF EXISTS bl_containers_update_if_bl_access ON public.bl_containers;
CREATE POLICY bl_containers_update_if_bl_access ON public.bl_containers FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.bills_of_lading bl 
        WHERE bl.id = bl_id 
        AND (bl.created_by = (select auth.uid()) OR bl.updated_by = (select auth.uid()))
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.bills_of_lading bl 
        WHERE bl.id = bl_id 
        AND (bl.created_by = (select auth.uid()) OR bl.updated_by = (select auth.uid()))
    )
);

-- ============================================================================
-- COMMENTAIRE FINAL
-- ============================================================================

COMMENT ON SCHEMA public IS 'Toutes les 26 politiques RLS ont été optimisées avec (select auth.<function>()) - Phase 2.1 complète';