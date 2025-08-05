-- Migration: create_soft_delete_functions
-- Description: Fonctions utilitaires pour la gestion du soft delete avec cascade et audit
-- Date: 2025-08-04

-- ============================================================================
-- Fonctions de soft delete avec cascade
-- ============================================================================

-- Fonction pour soft delete d'un BL avec cascade sur toutes ses relations
CREATE OR REPLACE FUNCTION soft_delete_bl(bl_uuid uuid, user_id uuid DEFAULT auth.uid())
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    bl_record record;
    container_count integer := 0;
    cargo_count integer := 0;
    charge_count integer := 0;
    result json;
BEGIN
    -- Vérifier que l'utilisateur a le droit de supprimer ce BL
    SELECT * INTO bl_record
    FROM bills_of_lading 
    WHERE id = bl_uuid 
    AND deleted_at IS NULL
    AND (created_by = user_id OR updated_by = user_id);
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'BL not found or access denied: %', bl_uuid;
    END IF;
    
    -- Soft delete des détails de cargaison (via les conteneurs)
    UPDATE bl_cargo_details 
    SET deleted_at = now(), deleted_by = user_id
    WHERE container_id IN (
        SELECT id FROM bl_containers WHERE bl_id = bl_uuid AND deleted_at IS NULL
    ) AND deleted_at IS NULL;
    
    GET DIAGNOSTICS cargo_count = ROW_COUNT;
    
    -- Soft delete des conteneurs
    UPDATE bl_containers 
    SET deleted_at = now(), deleted_by = user_id
    WHERE bl_id = bl_uuid AND deleted_at IS NULL;
    
    GET DIAGNOSTICS container_count = ROW_COUNT;
    
    -- Soft delete des frais
    UPDATE bl_freight_charges 
    SET deleted_at = now(), deleted_by = user_id
    WHERE bl_id = bl_uuid AND deleted_at IS NULL;
    
    GET DIAGNOSTICS charge_count = ROW_COUNT;
    
    -- Soft delete du BL principal
    UPDATE bills_of_lading 
    SET deleted_at = now(), deleted_by = user_id
    WHERE id = bl_uuid AND deleted_at IS NULL;
    
    -- Construire le résultat JSON
    result := json_build_object(
        'success', true,
        'bl_id', bl_uuid,
        'bl_number', bl_record.bl_number,
        'deleted_at', now(),
        'deleted_by', user_id,
        'cascade_summary', json_build_object(
            'containers_deleted', container_count,
            'cargo_details_deleted', cargo_count,
            'freight_charges_deleted', charge_count
        )
    );
    
    RETURN result;
END;
$$;

-- Fonction pour soft delete d'un conteneur avec ses détails de cargaison
CREATE OR REPLACE FUNCTION soft_delete_container(container_uuid uuid, user_id uuid DEFAULT auth.uid())
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    container_record record;
    cargo_count integer := 0;
    result json;
BEGIN
    -- Vérifier l'accès via le BL parent
    SELECT bc.*, bl.created_by as bl_created_by, bl.updated_by as bl_updated_by
    INTO container_record
    FROM bl_containers bc
    JOIN bills_of_lading bl ON bl.id = bc.bl_id
    WHERE bc.id = container_uuid 
    AND bc.deleted_at IS NULL
    AND (bl.created_by = user_id OR bl.updated_by = user_id);
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Container not found or access denied: %', container_uuid;
    END IF;
    
    -- Soft delete des détails de cargaison
    UPDATE bl_cargo_details 
    SET deleted_at = now(), deleted_by = user_id
    WHERE container_id = container_uuid AND deleted_at IS NULL;
    
    GET DIAGNOSTICS cargo_count = ROW_COUNT;
    
    -- Soft delete du conteneur
    UPDATE bl_containers 
    SET deleted_at = now(), deleted_by = user_id
    WHERE id = container_uuid AND deleted_at IS NULL;
    
    result := json_build_object(
        'success', true,
        'container_id', container_uuid,
        'container_number', container_record.container_number,
        'deleted_at', now(),
        'deleted_by', user_id,
        'cargo_details_deleted', cargo_count
    );
    
    RETURN result;
END;
$$;

-- Fonction pour soft delete d'un détail de cargaison
CREATE OR REPLACE FUNCTION soft_delete_cargo_detail(cargo_detail_uuid uuid, user_id uuid DEFAULT auth.uid())
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    cargo_record record;
    result json;
BEGIN
    -- Vérifier l'accès via le BL parent
    SELECT bcd.*, bl.created_by as bl_created_by, bl.updated_by as bl_updated_by
    INTO cargo_record
    FROM bl_cargo_details bcd
    JOIN bl_containers bc ON bc.id = bcd.container_id
    JOIN bills_of_lading bl ON bl.id = bc.bl_id
    WHERE bcd.id = cargo_detail_uuid 
    AND bcd.deleted_at IS NULL
    AND (bl.created_by = user_id OR bl.updated_by = user_id);
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cargo detail not found or access denied: %', cargo_detail_uuid;
    END IF;
    
    -- Soft delete du détail de cargaison
    UPDATE bl_cargo_details 
    SET deleted_at = now(), deleted_by = user_id
    WHERE id = cargo_detail_uuid AND deleted_at IS NULL;
    
    result := json_build_object(
        'success', true,
        'cargo_detail_id', cargo_detail_uuid,
        'description', LEFT(cargo_record.description, 50),
        'deleted_at', now(),
        'deleted_by', user_id
    );
    
    RETURN result;
END;
$$;

-- Fonction pour soft delete d'un frais
CREATE OR REPLACE FUNCTION soft_delete_freight_charge(charge_uuid uuid, user_id uuid DEFAULT auth.uid())
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    charge_record record;
    result json;
BEGIN
    -- Vérifier l'accès via le BL parent
    SELECT bfc.*, bl.created_by as bl_created_by, bl.updated_by as bl_updated_by
    INTO charge_record
    FROM bl_freight_charges bfc
    JOIN bills_of_lading bl ON bl.id = bfc.bl_id
    WHERE bfc.id = charge_uuid 
    AND bfc.deleted_at IS NULL
    AND (bl.created_by = user_id OR bl.updated_by = user_id);
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Freight charge not found or access denied: %', charge_uuid;
    END IF;
    
    -- Soft delete du frais
    UPDATE bl_freight_charges 
    SET deleted_at = now(), deleted_by = user_id
    WHERE id = charge_uuid AND deleted_at IS NULL;
    
    result := json_build_object(
        'success', true,
        'charge_id', charge_uuid,
        'description', charge_record.description,
        'amount', charge_record.amount,
        'currency', charge_record.currency,
        'deleted_at', now(),
        'deleted_by', user_id
    );
    
    RETURN result;
END;
$$;

-- ============================================================================
-- Fonctions de restauration (restore)
-- ============================================================================

-- Fonction pour restaurer un BL et toutes ses relations
CREATE OR REPLACE FUNCTION restore_bl(bl_uuid uuid, user_id uuid DEFAULT auth.uid())
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    bl_record record;
    container_count integer := 0;
    cargo_count integer := 0;
    charge_count integer := 0;
    result json;
BEGIN
    -- Vérifier que le BL existe et est supprimé
    SELECT * INTO bl_record
    FROM bills_of_lading 
    WHERE id = bl_uuid 
    AND deleted_at IS NOT NULL
    AND (created_by = user_id OR updated_by = user_id);
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Deleted BL not found or access denied: %', bl_uuid;
    END IF;
    
    -- Restaurer le BL principal
    UPDATE bills_of_lading 
    SET deleted_at = NULL, deleted_by = NULL, updated_by = user_id, updated_at = now()
    WHERE id = bl_uuid;
    
    -- Restaurer les conteneurs
    UPDATE bl_containers 
    SET deleted_at = NULL, deleted_by = NULL, updated_at = now()
    WHERE bl_id = bl_uuid AND deleted_at IS NOT NULL;
    
    GET DIAGNOSTICS container_count = ROW_COUNT;
    
    -- Restaurer les détails de cargaison
    UPDATE bl_cargo_details 
    SET deleted_at = NULL, deleted_by = NULL, updated_at = now()
    WHERE container_id IN (
        SELECT id FROM bl_containers WHERE bl_id = bl_uuid
    ) AND deleted_at IS NOT NULL;
    
    GET DIAGNOSTICS cargo_count = ROW_COUNT;
    
    -- Restaurer les frais
    UPDATE bl_freight_charges 
    SET deleted_at = NULL, deleted_by = NULL, updated_at = now()
    WHERE bl_id = bl_uuid AND deleted_at IS NOT NULL;
    
    GET DIAGNOSTICS charge_count = ROW_COUNT;
    
    result := json_build_object(
        'success', true,
        'bl_id', bl_uuid,
        'bl_number', bl_record.bl_number,
        'restored_at', now(),
        'restored_by', user_id,
        'cascade_summary', json_build_object(
            'containers_restored', container_count,
            'cargo_details_restored', cargo_count,
            'freight_charges_restored', charge_count
        )
    );
    
    RETURN result;
END;
$$;

-- ============================================================================
-- Fonctions d'audit et de reporting
-- ============================================================================

-- Fonction pour obtenir les BL supprimés d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_deleted_bls(user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
    id uuid,
    bl_number varchar,
    shipping_company_name varchar,
    deleted_at timestamptz,
    deleted_by_name text,
    containers_count bigint,
    total_charges decimal
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        bl.id,
        bl.bl_number,
        sc.name as shipping_company_name,
        bl.deleted_at,
        u.first_name || ' ' || u.last_name as deleted_by_name,
        (SELECT COUNT(*) FROM bl_containers bc WHERE bc.bl_id = bl.id) as containers_count,
        (SELECT COALESCE(SUM(total_amount), 0) FROM bl_freight_charges bfc WHERE bfc.bl_id = bl.id) as total_charges
    FROM bills_of_lading bl
    JOIN shipping_companies sc ON sc.id = bl.shipping_company_id
    LEFT JOIN users u ON u.id = bl.deleted_by
    WHERE bl.deleted_at IS NOT NULL
    AND (bl.created_by = user_id OR bl.updated_by = user_id)
    ORDER BY bl.deleted_at DESC;
$$;

-- Fonction pour obtenir les statistiques de suppression par utilisateur
CREATE OR REPLACE FUNCTION get_deletion_stats(user_id uuid DEFAULT auth.uid())
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT json_build_object(
        'deleted_bls', (
            SELECT COUNT(*) FROM bills_of_lading 
            WHERE deleted_at IS NOT NULL AND deleted_by = user_id
        ),
        'deleted_containers', (
            SELECT COUNT(*) FROM bl_containers 
            WHERE deleted_at IS NOT NULL AND deleted_by = user_id
        ),
        'deleted_cargo_details', (
            SELECT COUNT(*) FROM bl_cargo_details 
            WHERE deleted_at IS NOT NULL AND deleted_by = user_id
        ),
        'deleted_freight_charges', (
            SELECT COUNT(*) FROM bl_freight_charges 
            WHERE deleted_at IS NOT NULL AND deleted_by = user_id
        ),
        'last_deletion_date', (
            SELECT MAX(deleted_at) FROM bills_of_lading 
            WHERE deleted_at IS NOT NULL AND deleted_by = user_id
        )
    );
$$;

-- Fonction pour nettoyer les enregistrements supprimés depuis plus de X jours (admin uniquement)
CREATE OR REPLACE FUNCTION cleanup_old_deleted_records(days_old integer DEFAULT 365, admin_user_id uuid DEFAULT auth.uid())
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    cleanup_date timestamptz;
    bl_count integer := 0;
    container_count integer := 0;
    cargo_count integer := 0;
    charge_count integer := 0;
    result json;
BEGIN
    -- TODO: Ajouter une vérification d'admin ici
    -- Pour l'instant, on limite à 90 jours minimum pour éviter les accidents
    IF days_old < 90 THEN
        RAISE EXCEPTION 'Minimum cleanup period is 90 days for safety';
    END IF;
    
    cleanup_date := now() - INTERVAL '%s days' % days_old;
    
    -- Supprimer physiquement les détails de cargaison
    DELETE FROM bl_cargo_details 
    WHERE deleted_at IS NOT NULL AND deleted_at < cleanup_date;
    GET DIAGNOSTICS cargo_count = ROW_COUNT;
    
    -- Supprimer physiquement les frais
    DELETE FROM bl_freight_charges 
    WHERE deleted_at IS NOT NULL AND deleted_at < cleanup_date;
    GET DIAGNOSTICS charge_count = ROW_COUNT;
    
    -- Supprimer physiquement les conteneurs
    DELETE FROM bl_containers 
    WHERE deleted_at IS NOT NULL AND deleted_at < cleanup_date;
    GET DIAGNOSTICS container_count = ROW_COUNT;
    
    -- Supprimer physiquement les BL
    DELETE FROM bills_of_lading 
    WHERE deleted_at IS NOT NULL AND deleted_at < cleanup_date;
    GET DIAGNOSTICS bl_count = ROW_COUNT;
    
    result := json_build_object(
        'success', true,
        'cleanup_date', cleanup_date,
        'cleaned_by', admin_user_id,
        'cleaned_at', now(),
        'records_cleaned', json_build_object(
            'bills_of_lading', bl_count,
            'containers', container_count,
            'cargo_details', cargo_count,
            'freight_charges', charge_count
        )
    );
    
    RETURN result;
END;
$$;

-- ============================================================================
-- Fonctions de vérification d'intégrité
-- ============================================================================

-- Fonction pour vérifier l'intégrité des soft deletes
CREATE OR REPLACE FUNCTION check_soft_delete_integrity()
RETURNS TABLE(
    table_name text,
    issue_type text,
    issue_count bigint,
    issue_description text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    -- Vérifier les conteneurs avec BL supprimé mais conteneur actif
    SELECT 
        'bl_containers'::text as table_name,
        'orphaned_active_containers'::text as issue_type,
        COUNT(*) as issue_count,
        'Containers actifs avec BL supprimé'::text as issue_description
    FROM bl_containers bc
    JOIN bills_of_lading bl ON bl.id = bc.bl_id
    WHERE bc.deleted_at IS NULL AND bl.deleted_at IS NOT NULL
    
    UNION ALL
    
    -- Vérifier les détails de cargaison avec conteneur supprimé mais cargaison active
    SELECT 
        'bl_cargo_details'::text,
        'orphaned_active_cargo'::text,
        COUNT(*),
        'Détails de cargaison actifs avec conteneur supprimé'::text
    FROM bl_cargo_details bcd
    JOIN bl_containers bc ON bc.id = bcd.container_id
    WHERE bcd.deleted_at IS NULL AND bc.deleted_at IS NOT NULL
    
    UNION ALL
    
    -- Vérifier les frais avec BL supprimé mais frais actif
    SELECT 
        'bl_freight_charges'::text,
        'orphaned_active_charges'::text,
        COUNT(*),
        'Frais actifs avec BL supprimé'::text
    FROM bl_freight_charges bfc
    JOIN bills_of_lading bl ON bl.id = bfc.bl_id
    WHERE bfc.deleted_at IS NULL AND bl.deleted_at IS NOT NULL;
$$;

-- ============================================================================
-- Commentaires pour documentation
-- ============================================================================

COMMENT ON FUNCTION soft_delete_bl(uuid, uuid) IS 'Suppression logique d''un BL avec cascade sur toutes ses relations (conteneurs, cargaison, frais)';
COMMENT ON FUNCTION restore_bl(uuid, uuid) IS 'Restauration d''un BL supprimé avec toutes ses relations';
COMMENT ON FUNCTION get_user_deleted_bls(uuid) IS 'Liste des BL supprimés accessibles par un utilisateur';
COMMENT ON FUNCTION get_deletion_stats(uuid) IS 'Statistiques des suppressions effectuées par un utilisateur';
COMMENT ON FUNCTION cleanup_old_deleted_records(integer, uuid) IS 'Nettoyage physique des enregistrements supprimés depuis plus de X jours (admin uniquement)';
COMMENT ON FUNCTION check_soft_delete_integrity() IS 'Vérification de l''intégrité des suppressions logiques';

-- ============================================================================
-- Permissions sur les fonctions
-- ============================================================================

-- Fonctions de soft delete - accès aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION soft_delete_bl(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_container(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_cargo_detail(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_freight_charge(uuid, uuid) TO authenticated;

-- Fonctions de restauration - accès aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION restore_bl(uuid, uuid) TO authenticated;

-- Fonctions d'audit - accès aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION get_user_deleted_bls(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_deletion_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION check_soft_delete_integrity() TO authenticated;

-- Fonction de nettoyage - accès restreint (admin uniquement dans le futur)
GRANT EXECUTE ON FUNCTION cleanup_old_deleted_records(integer, uuid) TO authenticated;